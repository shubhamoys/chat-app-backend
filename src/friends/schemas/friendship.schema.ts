import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

@Schema({
  collection: 'friendships',
  timestamps: false,
})
export class Friendship extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    required: true
  })
  friendshipId: string; // Sorted user IDs: "userId1_userId2"

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user1: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user2: Types.ObjectId;

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

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);