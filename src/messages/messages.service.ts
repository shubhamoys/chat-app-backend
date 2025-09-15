import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { ConversationsService } from '../conversations/conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../common/constants/response.constants';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    private conversationsService: ConversationsService,
  ) {}

  async getMessages(currentUserId: string, query: GetMessagesQueryDto) {
    // Build MongoDB query
    const readQuery: any = {};

    // Apply filters
    if (query.conversationId) {
      if (!Types.ObjectId.isValid(query.conversationId)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid conversation ID format',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'conversationId' },
          },
        });
      }

      // Validate user can access this conversation
      const canAccess =
        await this.conversationsService.validateUserCanAccessConversation(
          currentUserId,
          query.conversationId,
        );

      if (!canAccess) {
        throw new ForbiddenException({
          success: false,
          message: 'You are not a participant in this conversation',
          error: {
            code: ERROR_CODES.PERMISSION_DENIED,
            details: { field: 'conversationId' },
          },
        });
      }

      readQuery.conversationId = new Types.ObjectId(query.conversationId);
    }

    if (query.messageId) {
      if (!Types.ObjectId.isValid(query.messageId)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid message ID format',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'messageId' },
          },
        });
      }
      readQuery._id = new Types.ObjectId(query.messageId);
    }

    if (query.from) {
      if (!Types.ObjectId.isValid(query.from)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid user ID format',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'from' },
          },
        });
      }
      readQuery.from = new Types.ObjectId(query.from);
    }

    if (typeof query.isRead === 'boolean') {
      readQuery.isRead = query.isRead;
    }

    if (query.search) {
      readQuery.content = { $regex: query.search, $options: 'i' };
    }

    // Sorting
    let sortObj: any = { 'timestamp.createdAt': -1 };
    switch (query.sort) {
      case 'mrc':
        sortObj = { 'timestamp.createdAt': -1 };
        break;
      case 'mru':
        sortObj = { 'timestamp.updatedAt': -1 };
        break;
      case 'oldest':
        sortObj = { 'timestamp.createdAt': 1 };
        break;
    }

    // Pagination
    const limit = query.limit || 20;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: readQuery },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
    ];

    // Handle field selection
    if (query.fields) {
      const fieldList = query.fields.split(',').map((field) => field.trim());
      const projection: any = { _id: 1 };
      fieldList.forEach((field) => {
        if (field !== '_id') projection[field] = 1;
      });
      pipeline.push({ $project: projection });
    }

    // Handle population
    if (query.populate === 'from') {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'from',
          pipeline: [
            { $project: { _id: 1, name: 1, displayPicture: 1, username: 1 } },
          ],
        },
      });
      pipeline.push({
        $unwind: '$from',
      });
    }

    if (query.populate === 'conversationId') {
      pipeline.push({
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversationId',
          pipeline: [{ $project: { participants: 1, lastActivity: 1 } }],
        },
      });
      pipeline.push({
        $unwind: '$conversationId',
      });
    }

    // Execute aggregation
    const messages = await this.messageModel.aggregate(pipeline);

    // Get total count
    const totalCount = await this.messageModel.countDocuments(readQuery);

    // Mark messages as read if we're fetching for a specific conversation
    if (query.conversationId) {
      await this.markMessagesAsRead(currentUserId, query.conversationId);
    }

    return {
      totalCount,
      currentCount: messages.length,
      page,
      messages: messages || [],
    };
  }

  async sendMessage(currentUserId: string, sendMessageDto: SendMessageDto) {
    const { toUserId, content } = sendMessageDto;
    // Validate ObjectIds
    if (!Types.ObjectId.isValid(toUserId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid user ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'toUserId' },
        },
      });
    }

    // Check if target user exists
    const targetUser = await this.userModel.findById(toUserId);
    if (!targetUser) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: { field: 'toUserId' },
        },
      });
    }
    // Check if users are friends
    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException({
        success: false,
        message: 'Current user not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: null,
        },
      });
    }
    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === toUserId,
    );
    if (!isFriend) {
      throw new ForbiddenException({
        success: false,
        message: 'User is not a friend',
        error: {
          code: ERROR_CODES.NOT_FRIENDS,
          details: { field: 'toUserId' },
        },
      });
    }

    try {
      // Find or create conversation
      const conversation =
        await this.conversationsService.getOrCreateConversation(
          currentUserId,
          toUserId,
        );

      // Create message
      const message = new this.messageModel({
        conversationId: conversation._id,
        from: currentUserId,
        content,
      });

      const savedMessage = await message.save();

      // Update conversation's last message
      await this.conversationModel.findByIdAndUpdate(
        conversation._id,
        {
          lastMessage: savedMessage._id,
          lastActivity: new Date(),
        },
        { new: true },
      );

      return {
        message: SUCCESS_MESSAGES.MESSAGE_SENT,
        messages: {
          _id: savedMessage._id,
          conversationId: savedMessage.conversationId,
          from: savedMessage.from,
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          isRead: savedMessage.isRead,
        },
      };
    } catch (error) {
      this.logger.error('Save message error details:', error);
      throw new BadRequestException({
        success: false,
        message: 'Failed to send message',
        error: {
          code: ERROR_CODES.DATABASE_ERROR,
          details: { error: error.message },
        },
      });
    }
  }

  async markMessagesAsRead(userId: string, conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      return;
    }

    // Mark all messages in this conversation as read (except own messages)
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        from: { $ne: new Types.ObjectId(userId) },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async getMessageById(messageId: string, currentUserId: string) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid message ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'messageId' },
        },
      });
    }

    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException({
        success: false,
        message: 'Message not found',
        error: {
          code: ERROR_CODES.MESSAGE_NOT_FOUND,
          details: { field: 'messageId' },
        },
      });
    }

    // Check if user can access this message
    const canAccess =
      await this.conversationsService.validateUserCanAccessConversation(
        currentUserId,
        message.conversationId.toString(),
      );

    if (!canAccess) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not a participant in this conversation',
        error: {
          code: ERROR_CODES.PERMISSION_DENIED,
          details: { field: 'messageId' },
        },
      });
    }

    return message;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all conversations where user is a participant
    const userConversations = await this.conversationModel
      .find({
        participants: new Types.ObjectId(userId),
      })
      .select('_id');

    const conversationIds = userConversations.map((conv) => conv._id);

    // Count unread messages across all conversations
    const unreadCount = await this.messageModel.countDocuments({
      conversationId: { $in: conversationIds },
      from: { $ne: new Types.ObjectId(userId) }, // Exclude own messages
      isRead: false,
    });

    return unreadCount;
  }
}
