import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({
  collection: 'conversations',
  timestamps: false,
})
export class Conversation extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: {
      validator: function (participants: Types.ObjectId[]) {
        return participants.length === 2;
      },
      message: 'Conversation must have exactly 2 participants',
    },
  })
  participants: Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Message',
    default: null,
  })
  lastMessage: Types.ObjectId;

  @Prop({ default: Date.now })
  lastActivity: Date;

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

export const ConversationSchema = SchemaFactory.createForClass(Conversation);