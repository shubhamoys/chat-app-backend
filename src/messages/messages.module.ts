import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { Message, MessageSchema } from './schemas/message.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema';
import { ConversationsModule } from '../conversations/conversations.module';
import { FriendsModule } from '../friends/friends.module';
import { AppConfig } from '../config/app.config';
import { NotificationPushService } from '../common/services/notification.service';

// Configure Message Schema
const configureMessageSchema = () => {
  // Create indexes
  MessageSchema.index({ conversationId: 1, 'timestamp.createdAt': -1 });
  MessageSchema.index({ from: 1 });
  MessageSchema.index({ 'timestamp.createdAt': -1 });
  MessageSchema.index({ isRead: 1 });

  // Update timestamp on save
  MessageSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  MessageSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ 'timestamp.updatedAt': Date.now() });
    next();
  });

  return MessageSchema;
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: configureMessageSchema() },
      { name: User.name, schema: UserSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async () => {
        const appConfig = AppConfig.getInstance();
        return {
          secret: appConfig.jwt.secret,
          signOptions: {
            expiresIn: appConfig.jwt.expiresIn,
          },
        };
      },
    }),
    ConversationsModule,
    FriendsModule,
  ],
  providers: [MessagesService, MessagesGateway, NotificationPushService],
  controllers: [MessagesController],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
