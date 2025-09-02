import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

// Configure Conversation Schema
const configureConversationSchema = () => {
  // Create indexes
  ConversationSchema.index({ participants: 1 }, { unique: true });
  ConversationSchema.index({ lastActivity: -1 });
  ConversationSchema.index({ 'timestamp.createdAt': -1 });

  // Update timestamp on save
  ConversationSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  ConversationSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ 'timestamp.updatedAt': Date.now() });
    next();
  });

  return ConversationSchema;
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: configureConversationSchema() },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
