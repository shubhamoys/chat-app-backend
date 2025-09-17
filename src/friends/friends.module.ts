import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

// Configure Friendship Schema
const configureFriendshipSchema = () => {
  // Create indexes for performance
  FriendshipSchema.index({ friendshipId: 1 }, { unique: true });
  FriendshipSchema.index({ user1: 1 });
  FriendshipSchema.index({ user2: 1 });
  FriendshipSchema.index({ 'timestamp.createdAt': -1 });

  // Update timestamp on save
  FriendshipSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.timestamp.updatedAt = Date.now();
    }
    next();
  });

  FriendshipSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ 'timestamp.updatedAt': Date.now() });
    next();
  });

  return FriendshipSchema;
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: configureFriendshipSchema() },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
