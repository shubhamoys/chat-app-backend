import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({
  collection: 'messages',
  timestamps: false,
})
export class Message extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  from: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  readAt: Date;

  @Prop({
    type: {
      createdAt: { type: Number, default: Date.now },
      updatedAt: { type: Number, default: Date.now },
    },
    default: () => ({
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  })
  timestamp: {
    createdAt: number;
    updatedAt: number;
  };
}

export const MessageSchema = SchemaFactory.createForClass(Message);
