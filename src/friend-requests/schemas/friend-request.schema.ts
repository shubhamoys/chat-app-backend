import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type FriendRequestDocument = FriendRequest & Document;

@Schema({
  collection: 'friendrequests',
  timestamps: false,
})
export class FriendRequest extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  from: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  to: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(FriendRequestStatus),
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

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

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);