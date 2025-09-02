import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FriendRequest,
  FriendRequestStatus,
} from './schemas/friend-request.schema';
import { User } from '../users/schemas/user.schema';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { GetFriendRequestsQueryDto } from './dto/get-friend-requests-query.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../common/constants/response.constants';

@Injectable()
export class FriendRequestsService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getFriendRequests(
    currentUserId: string,
    query: GetFriendRequestsQueryDto,
  ) {
    // Build MongoDB query
    const readQuery: any = {};

    // Apply filters
    if (query.status) {
      readQuery.status = query.status;
    } else {
      readQuery.status = 'pending'; // Default status
    }

    // Filter by type (sent or received)
    if (query.type === 'sent') {
      readQuery.from = new Types.ObjectId(currentUserId);
    } else {
      readQuery.to = new Types.ObjectId(currentUserId); // Default to received
    }

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

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: readQuery },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
    ];

    // Handle field selection
    if (query.fields) {
      const fieldList = query.fields.split(',').map((field) => field.trim());
      const projection: any = { _id: 1 };
      fieldList.forEach((field) => {
        if (field !== '_id') projection[field] = 1;
      });
      pipeline.push({ $project: projection });
    }

    // Handle population
    if (query.populate === 'from') {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'from',
          pipeline: [{ $project: { _id: 1, name: 1, displayPicture: 1, username: 1 } }],
        },
      });
      pipeline.push({
        $unwind: '$from',
      });
    } else if (query.populate === 'to') {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'to',
          foreignField: '_id',
          as: 'to',
          pipeline: [{ $project: { _id: 1, name: 1, displayPicture: 1, username: 1 } }],
        },
      });
      pipeline.push({
        $unwind: '$to',
      });
    }

    // Execute aggregation
    const friendRequests = await this.friendRequestModel.aggregate(pipeline);

    // Get total count
    const totalCount = await this.friendRequestModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: friendRequests.length,
      page,
      friendRequests: friendRequests || [],
    };
  }

  async sendFriendRequest(
    currentUserId: string,
    sendFriendRequestDto: SendFriendRequestDto,
  ) {
    const { toUserId } = sendFriendRequestDto;

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(toUserId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid user ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'toUserId' },
        },
      });
    }

    // Check if trying to send request to self
    if (currentUserId === toUserId) {
      throw new BadRequestException({
        success: false,
        message: 'Cannot send friend request to yourself',
        error: {
          code: ERROR_CODES.CANNOT_SEND_TO_SELF,
          details: { field: 'toUserId' },
        },
      });
    }

    // Check if target user exists
    const targetUser = await this.userModel.findById(toUserId);
    if (!targetUser) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: { field: 'toUserId' },
        },
      });
    }

    // Check if users are already friends
    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException({
        success: false,
        message: 'Current user not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: null,
        },
      });
    }

    const isAlreadyFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === toUserId,
    );

    if (isAlreadyFriend) {
      throw new ConflictException({
        success: false,
        message: 'Users are already friends',
        error: {
          code: ERROR_CODES.ALREADY_FRIENDS,
          details: { field: 'toUserId' },
        },
      });
    }

    // Check if friend request already exists (either direction)
    const existingRequest = await this.friendRequestModel.findOne({
      $or: [
        { from: new Types.ObjectId(currentUserId), to: new Types.ObjectId(toUserId) },
        { from: new Types.ObjectId(toUserId), to: new Types.ObjectId(currentUserId) },
      ],
    });

    if (existingRequest) {
      throw new ConflictException({
        success: false,
        message: 'Friend request already exists',
        error: {
          code: ERROR_CODES.FRIEND_REQUEST_ALREADY_EXISTS,
          details: { field: 'toUserId' },
        },
      });
    }

    // Create friend request
    const friendRequest = new this.friendRequestModel({
      from: new Types.ObjectId(currentUserId),
      to: new Types.ObjectId(toUserId),
      status: FriendRequestStatus.PENDING,
    });

    const savedRequest = await friendRequest.save();

    return {
      message: SUCCESS_MESSAGES.FRIEND_REQUEST_SENT,
      friendRequests: {
        _id: savedRequest._id,
        from: savedRequest.from,
        to: savedRequest.to,
        status: savedRequest.status,
        timestamp: savedRequest.timestamp,
      },
    };
  }

  async updateFriendRequest(
    currentUserId: string,
    requestId: string,
    updateDto: UpdateFriendRequestDto,
  ) {
    const { status } = updateDto;

    // Validate request ID
    if (!Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid request ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'requestId' },
        },
      });
    }

    // Find friend request
    const friendRequest = await this.friendRequestModel.findById(requestId);
    if (!friendRequest) {
      throw new NotFoundException({
        success: false,
        message: 'Friend request not found',
        error: {
          code: ERROR_CODES.FRIEND_REQUEST_NOT_FOUND,
          details: { field: 'requestId' },
        },
      });
    }

    // Check if current user is the recipient
    if (friendRequest.to.toString() !== currentUserId) {
      throw new ForbiddenException({
        success: false,
        message: 'You can only respond to friend requests sent to you',
        error: {
          code: ERROR_CODES.PERMISSION_DENIED,
          details: { field: 'requestId' },
        },
      });
    }

    // Check if request is still pending
    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException({
        success: false,
        message: 'Friend request has already been processed',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'status' },
        },
      });
    }

    try {
      // Update friend request status
      friendRequest.status =
        status === 'accepted'
          ? FriendRequestStatus.ACCEPTED
          : FriendRequestStatus.REJECTED;
      
      const updatedRequest = await friendRequest.save();

      // If accepted, add users to each other's friends list
      if (status === 'accepted') {
        const fromUserId = friendRequest.from.toString();
        const toUserId = friendRequest.to.toString();

        // Add each user to the other's friends list using parallel operations
        await Promise.all([
          this.userModel.findByIdAndUpdate(
            fromUserId,
            { $addToSet: { friends: new Types.ObjectId(toUserId) } },
            { new: true },
          ),
          this.userModel.findByIdAndUpdate(
            toUserId,
            { $addToSet: { friends: new Types.ObjectId(fromUserId) } },
            { new: true },
          ),
        ]);
      }

      const message =
        status === 'accepted'
          ? SUCCESS_MESSAGES.FRIEND_REQUEST_ACCEPTED
          : SUCCESS_MESSAGES.FRIEND_REQUEST_REJECTED;

      return {
        message,
        friendRequests: {
          _id: updatedRequest._id,
          from: updatedRequest.from,
          to: updatedRequest.to,
          status: updatedRequest.status,
          timestamp: updatedRequest.timestamp,
        },
      };
    } catch (error) {
      console.error('Friend request update error:', error);
      throw new BadRequestException({
        success: false,
        message: 'Failed to update friend request',
        error: {
          code: ERROR_CODES.DATABASE_ERROR,
          details: { 
            error: error.message,
            requestId,
            status,
            currentUserId
          },
        },
      });
    }
  }
}