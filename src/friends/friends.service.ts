import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship } from './schemas/friendship.schema';
import { User } from '../users/schemas/user.schema';
import { GetFriendsQueryDto } from './dto/get-friends-query.dto';
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../common/constants/response.constants';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friendship.name) private friendshipModel: Model<Friendship>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Generate consistent friendship ID
  private generateFriendshipId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  // Check if users are friends
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendshipId = this.generateFriendshipId(userId1, userId2);
    const friendship = await this.friendshipModel.findOne({ friendshipId });
    return !!friendship;
  }

  // Create friendship record
  async createFriendship(userId1: string, userId2: string) {
    const friendshipId = this.generateFriendshipId(userId1, userId2);

    const friendship = new this.friendshipModel({
      friendshipId,
      user1: new Types.ObjectId(userId1),
      user2: new Types.ObjectId(userId2),
    });

    return await friendship.save();
  }

  // Get paginated friends list
  async getFriends(currentUserId: string, query: GetFriendsQueryDto) {
    // Build MongoDB query to find friendships for current user
    const readQuery: any = {
      $or: [
        { user1: new Types.ObjectId(currentUserId) },
        { user2: new Types.ObjectId(currentUserId) },
      ],
    };

    // Sorting
    let sortObj: any = { 'timestamp.createdAt': -1 };
    switch (query.sort) {
      case 'mrc':
        sortObj = { 'timestamp.createdAt': -1 };
        break;
      case 'mru':
        sortObj = { 'timestamp.updatedAt': -1 };
        break;
    }

    // Pagination
    const limit = query.limit || 20;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    // Get friendships
    const friendships = await this.friendshipModel
      .find(readQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Extract friend user IDs
    const friendIds = friendships.map((friendship) => {
      return friendship.user1.toString() === currentUserId
        ? friendship.user2
        : friendship.user1;
    });

    // Build query for friend user details
    const userQuery: any = { _id: { $in: friendIds } };

    // Add search filter if provided
    if (query.search) {
      userQuery.$and = [
        { _id: { $in: friendIds } },
        {
          $or: [
            { username: { $regex: query.search, $options: 'i' } },
            { name: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
          ],
        },
      ];
      delete userQuery._id; // Remove since it's in $and now
    }

    let friendsQuery = this.userModel.find(userQuery);

    // Handle field selection
    if (query.fields) {
      const fieldList = query.fields.split(',').map((field) => field.trim());
      const projection: any = { _id: 1 };
      fieldList.forEach((field) => {
        if (field !== '_id' && field !== 'password') {
          projection[field] = 1;
        }
      });
      friendsQuery = friendsQuery.select(projection);
    } else {
      // Default: exclude sensitive fields
      friendsQuery = friendsQuery.select('-password');
    }

    // Apply name sorting if specified
    if (query.sort === 'namea') {
      friendsQuery = friendsQuery.sort({ name: 1 });
    } else if (query.sort === 'named') {
      friendsQuery = friendsQuery.sort({ name: -1 });
    }

    const friends = await friendsQuery;

    // Get total count
    const totalCount = await this.friendshipModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: friends.length,
      page,
      friends: friends || [],
    };
  }

  // Remove friend relationship
  async removeFriend(currentUserId: string, friendUserId: string) {
    // Validate friend user ID
    if (!Types.ObjectId.isValid(friendUserId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid friend user ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'friendUserId' },
        },
      });
    }

    // Check if trying to remove self
    if (currentUserId === friendUserId) {
      throw new BadRequestException({
        success: false,
        message: 'Cannot remove yourself as friend',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'friendUserId' },
        },
      });
    }

    const friendshipId = this.generateFriendshipId(currentUserId, friendUserId);

    // Find and delete friendship
    const deletedFriendship = await this.friendshipModel.findOneAndDelete({
      friendshipId,
    });

    if (!deletedFriendship) {
      throw new NotFoundException({
        success: false,
        message: 'Friendship not found',
        error: {
          code: ERROR_CODES.FRIEND_NOT_FOUND,
          details: { field: 'friendUserId' },
        },
      });
    }


    return {
      message: SUCCESS_MESSAGES.FRIEND_REMOVED,
      friendship: {
        _id: deletedFriendship._id,
        friendshipId: deletedFriendship.friendshipId,
        user1: deletedFriendship.user1,
        user2: deletedFriendship.user2,
        timestamp: deletedFriendship.timestamp,
      },
    };
  }

  // Get friends count
  async getFriendsCount(userId: string): Promise<number> {
    return await this.friendshipModel.countDocuments({
      $or: [
        { user1: new Types.ObjectId(userId) },
        { user2: new Types.ObjectId(userId) },
      ],
    });
  }


  // Get friend IDs for a user (helper for other services)
  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.friendshipModel.find({
      $or: [
        { user1: new Types.ObjectId(userId) },
        { user2: new Types.ObjectId(userId) },
      ],
    });

    return friendships.map((friendship) => {
      return friendship.user1.toString() === userId
        ? friendship.user2.toString()
        : friendship.user1.toString();
    });
  }
}
