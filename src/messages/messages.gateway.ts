import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { MessagesService } from './messages.service';
import { NotificationPushService } from '../common/services/notification.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    private readonly notificationService: NotificationPushService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.log('Client disconnected: No token provided');
        this.logger.log('Available auth:', client.handshake.auth);
        this.logger.log('Available query:', client.handshake.query);
        client.disconnect();
        return;
      }

      this.logger.log('Token received, attempting to verify...');
      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Find user in database
      const user = await this.userModel.findById(userId);
      if (!user) {
        this.logger.log('Client disconnected: User not found');
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = userId;
      client.user = user;

      // Track connected user (disconnect any existing connection)
      const existingSocketId = this.connectedUsers.get(userId);
      if (existingSocketId) {
        const existingSocket =
          this.server.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.emit('force_disconnect', {
            message: 'Logged in from another device',
          });
          existingSocket.disconnect();
        }
      }
      this.connectedUsers.set(userId, client.id);

      // Update user's last active timestamp
      await this.userModel.findByIdAndUpdate(userId, {
        lastActive: new Date(),
      });

      // Join user to their own room for private messaging
      client.join(`user_${userId}`);

      // Join all conversations the user is part of
      await this.joinUserConversations(client, userId);

      // Notify about successful connection
      client.emit('connected', {
        message: 'Connected to chat server',
        userId: userId,
        onlineUsers: Array.from(this.connectedUsers.keys()),
      });

      // Broadcast user online status to friends
      await this.broadcastUserStatus(userId, true);

      this.logger.log(`Client connected: ${user.username} (${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove from connected users
      this.connectedUsers.delete(client.userId);

      // Update last active timestamp
      await this.userModel.findByIdAndUpdate(client.userId, {
        lastActive: new Date(),
      });

      // Broadcast user offline status to friends
      await this.broadcastUserStatus(client.userId, false);

      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { toUserId: string; content: string; chatId?: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { toUserId, content } = payload;

      // Send message through service
      const result = await this.messagesService.sendMessage(client.userId, {
        toUserId,
        content,
      });

      // Emit to sender (confirmation)
      client.emit('message_sent', result.messages);

      // Get conversation ID first
      const conversationId = result.messages.conversationId;

      // Emit to recipient if they're online (for push notification support)
      const recipientSocketId = this.connectedUsers.get(toUserId);
      const messageData = {
        ...result.messages,
        senderInfo: {
          _id: client.user._id,
          name: client.user.name,
          username: client.user.username,
          displayPicture: client.user.displayPicture,
        },
      };

      if (recipientSocketId) {
        // User is online, send real-time notification
        this.server.to(recipientSocketId).emit('new_message', messageData);
      } else {
        // User is offline - trigger push notification
        this.logger.log(
          `User ${toUserId} is offline - sending push notification`,
        );
        const notificationPayload =
          this.notificationService.createMessageNotification(
            toUserId,
            client.user.name,
            content,
            conversationId.toString(),
            client.userId,
            result.messages._id.toString(),
          );
        await this.notificationService.sendPushNotification(
          notificationPayload,
        );
      }

      // Broadcast to both users' conversation room
      this.server
        .to(`conversation_${conversationId}`)
        .emit('conversation_updated', {
          conversationId,
          lastMessage: {
            content,
            timestamp: result.messages.timestamp,
            sender: client.userId,
          },
        });

      this.logger.log(`Message sent from ${client.userId} to ${toUserId}`);
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      client.emit('message_error', {
        message: error.message || 'Failed to send message',
        error: error.response || error,
      });
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { chatId } = payload;

      // Validate user can access this conversation
      const canAccess = await this.messagesService[
        'conversationsService'
      ].validateUserCanAccessConversation(client.userId, chatId);

      if (!canAccess) {
        client.emit('error', { message: 'Access denied to this conversation' });
        return;
      }

      // Join the conversation room
      client.join(`conversation_${chatId}`);

      // Mark messages as read
      await this.messagesService.markMessagesAsRead(client.userId, chatId);

      client.emit('joined_conversation', { conversationId: chatId });
      this.logger.log(`User ${client.userId} joined conversation ${chatId}`);
    } catch (error) {
      this.logger.error(`Join chat error: ${error.message}`);
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    try {
      const { chatId } = payload;
      client.leave(`chat_${chatId}`);
      client.emit('left_chat', { chatId });
      this.logger.log(`User ${client.userId} left chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Leave chat error: ${error.message}`);
      client.emit('error', { message: 'Failed to leave chat' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    try {
      if (!client.userId) return;

      const { chatId } = payload;

      // Broadcast typing indicator to other participants in the chat
      client.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: client.userId,
        username: client.user?.username,
        isTyping: true,
      });
    } catch (error) {
      this.logger.error(`Typing start error: ${error.message}`);
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    try {
      if (!client.userId) return;

      const { chatId } = payload;

      // Broadcast stop typing indicator
      client.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: client.userId,
        username: client.user?.username,
        isTyping: false,
      });
    } catch (error) {
      this.logger.error(`Typing stop error: ${error.message}`);
    }
  }

  // Helper method to join user to all their conversations
  private async joinUserConversations(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    try {
      // Find all conversations the user is part of
      const userConversations = await this.conversationModel
        .find({ participants: userId })
        .select('_id');

      userConversations.forEach((conversation) => {
        client.join(`conversation_${conversation._id}`);
      });

      this.logger.log(
        `User ${userId} joined ${userConversations.length} conversations`,
      );
    } catch (error) {
      this.logger.error(`Error joining conversations: ${error.message}`);
    }
  }

  // Helper method to broadcast user online/offline status to friends
  private async broadcastUserStatus(userId: string, isOnline: boolean) {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('friends', '_id');

      if (user && user.friends) {
        // Notify all online friends about status change
        user.friends.forEach((friend: any) => {
          const friendSocketId = this.connectedUsers.get(friend._id.toString());
          if (friendSocketId) {
            this.server.to(friendSocketId).emit('friend_status_change', {
              userId,
              isOnline,
              lastActive: new Date(),
            });
          }
        });
      }
    } catch (error) {
      this.logger.error(`Broadcast user status error: ${error.message}`);
    }
  }

  // Public method to send message via WebSocket (can be called from other services)
  async sendMessageToUser(toUserId: string, message: any) {
    const recipientSocketId = this.connectedUsers.get(toUserId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('new_message', message);
      return true;
    }
    return false; // User not online
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
