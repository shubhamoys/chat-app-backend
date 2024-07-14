import { Document } from 'mongoose';

export class Message extends Document {
  messageId: string;

  senderId: string;

  receiverId: string;

  chatId: string;

  content: string;

  timestamp: { createdAt: number; updatedAt: number };
}
