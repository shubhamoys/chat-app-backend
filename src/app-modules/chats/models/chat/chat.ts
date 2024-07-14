import { Document } from 'mongoose';

export class Chat extends Document {
  chatId: string;

  participantIds: string[];

  timestamp: { createdAt: number; updatedAt: number };
}
