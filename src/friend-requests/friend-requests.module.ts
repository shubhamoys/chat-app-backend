import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequestsService } from './friend-requests.service';
import { FriendRequestsController } from './friend-requests.controller';
import {
  FriendRequest,
  FriendRequestSchema,
} from './schemas/friend-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

// Configure FriendRequest Schema
const configureFriendRequestSchema = () => {
  // Create indexes
  FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
  FriendRequestSchema.index({ from: 1, status: 1 });
  FriendRequestSchema.index({ to: 1, status: 1 });
  FriendRequestSchema.index({ status: 1 });
  FriendRequestSchema.index({ 'timestamp.createdAt': -1 });

  // Update timestamp on save
  FriendRequestSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  FriendRequestSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ 'timestamp.updatedAt': Date.now() });
    next();
  });

  return FriendRequestSchema;
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: configureFriendRequestSchema() },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [FriendRequestsService],
  controllers: [FriendRequestsController],
  exports: [FriendRequestsService],
})
export class FriendRequestsModule {}
