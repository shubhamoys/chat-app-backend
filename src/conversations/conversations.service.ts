import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { User } from '../users/schemas/user.schema';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../common/constants/response.constants';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getConversations(
    currentUserId: string,
    query: GetConversationsQueryDto,
  ) {
    // Build MongoDB query
    const readQuery: any = {
      participants: new Types.ObjectId(currentUserId),
    };

    // Apply filters
    if (query.conversationId) {
      if (!Types.ObjectId.isValid(query.conversationId)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid conversation ID format',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'conversationId' },
          },
        });
      }
      readQuery._id = new Types.ObjectId(query.conversationId);
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
      case 'lastActivity':
        sortObj = { lastActivity: -1 };
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
    if (query.populate) {
      const populateFields = query.populate
        .split(',')
        .map((field) => field.trim());

      if (populateFields.includes('participants')) {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'participants',
            foreignField: '_id',
            as: 'participants',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  displayPicture: 1,
                  lastActive: 1,
                  username: 1,
                },
              },
            ],
          },
        });
      }

      if (populateFields.includes('lastMessage')) {
        pipeline.push({
          $lookup: {
            from: 'messages',
            localField: 'lastMessage',
            foreignField: '_id',
            as: 'lastMessage',
            pipeline: [
              {
                $project: {
                  content: 1,
                  from: 1,
                  timestamp: 1,
                },
              },
            ],
          },
        });
        pipeline.push({
          $unwind: {
            path: '$lastMessage',
            preserveNullAndEmptyArrays: true,
          },
        });
      }
    }

    // Execute aggregation
    const conversations = await this.conversationModel.aggregate(pipeline);

    // Get total count
    const totalCount = await this.conversationModel.countDocuments(readQuery);

    // Transform conversations to show friend info and online status
    const transformedConversations = conversations.map((conversation) => {
      if (
        query.populate &&
        query.populate.includes('participants') &&
        conversation.participants
      ) {
        // Find the other participant (not the current user)
        const otherParticipant = conversation.participants.find(
          (p: any) => p._id.toString() !== currentUserId,
        );

        if (otherParticipant) {
          // Check online status (active within last 5 minutes)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const isOnline =
            otherParticipant.lastActive &&
            new Date(otherParticipant.lastActive) > fiveMinutesAgo;

          // Add online status to the other participant
          otherParticipant.isOnline = isOnline;
        }
      }

      return conversation;
    });

    return {
      totalCount,
      currentCount: transformedConversations.length,
      page,
      conversations: transformedConversations || [],
    };
  }

  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Sort participants to ensure consistent conversation creation
    const participants = [
      new Types.ObjectId(user1Id),
      new Types.ObjectId(user2Id),
    ].sort();

    // Try to find existing conversation
    let conversation = await this.conversationModel.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!conversation) {
      // Create new conversation
      conversation = new this.conversationModel({
        participants,
        lastActivity: new Date(),
      });

      await conversation.save();
    }

    return conversation;
  }

  async updateLastMessage(conversationId: string, messageId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid conversation ID format',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'conversationId' },
        },
      });
    }

    const conversation = await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: new Types.ObjectId(messageId),
        lastActivity: new Date(),
      },
      { new: true },
    );

    if (!conversation) {
      throw new NotFoundException({
        success: false,
        message: 'Conversation not found',
        error: {
          code: ERROR_CODES.CONVERSATION_NOT_FOUND,
          details: { field: 'conversationId' },
        },
      });
    }

    return conversation;
  }

  async findConversationByUsers(user1Id: string, user2Id: string) {
    const participants = [
      new Types.ObjectId(user1Id),
      new Types.ObjectId(user2Id),
    ].sort();

    return await this.conversationModel.findOne({
      participants: { $all: participants, $size: 2 },
    });
  }

  async validateUserCanAccessConversation(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(conversationId)) {
      return false;
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      return false;
    }

    return conversation.participants.some(
      (participantId) => participantId.toString() === userId,
    );
  }
}
