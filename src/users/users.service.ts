import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import {
  VerificationToken,
  VerificationTokenType,
} from './schemas/verification-token.schema';
import { EmailService } from '../email/email.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../common/constants/response.constants';
import { AppConfig } from '../config/app.config';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  private readonly appConfig: AppConfig;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(VerificationToken.name)
    private verificationTokenModel: Model<VerificationToken>,
    private emailService: EmailService,
    private authService: AuthService,
  ) {
    this.appConfig = AppConfig.getInstance();
  }

  async getUsers(query: GetUsersQueryDto, currentUserId: string) {
    // Build MongoDB query
    const readQuery: any = {};

    // Apply filters
    if (query.userId) {
      if (!Types.ObjectId.isValid(query.userId)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid user ID format',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'userId' },
          },
        });
      }
      readQuery._id = new Types.ObjectId(query.userId);
    }

    if (query.userIds) {
      const ids = query.userIds.split(',').map((id) => id.trim());
      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

      if (validIds.length !== ids.length) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid user ID format in userIds',
          error: {
            code: ERROR_CODES.INVALID_FIELD,
            details: { field: 'userIds' },
          },
        });
      }
      readQuery._id = { $in: validIds.map((id) => new Types.ObjectId(id)) };
    }

    if (query.username) {
      readQuery.username = { $regex: query.username, $options: 'i' };
    }

    if (query.name) {
      readQuery.name = { $regex: query.name, $options: 'i' };
    }

    if (query.email) {
      readQuery.email = query.email;
    }

    if (typeof query.isEmailVerified === 'boolean') {
      readQuery.isEmailVerified = query.isEmailVerified;
    }

    if (query.search) {
      readQuery.$or = [
        { username: { $regex: query.search, $options: 'i' } },
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Permission check: users can only access their own data or their friends' data
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

    // If specific user ID is requested, check permissions
    if (query.userId && query.userId !== currentUserId) {
      const isFriend = currentUser.friends.some(
        (friendId) => friendId.toString() === query.userId,
      );
      if (!isFriend) {
        throw new BadRequestException({
          success: false,
          message: 'Permission denied',
          error: {
            code: ERROR_CODES.PERMISSION_DENIED,
            details: { field: 'userId' },
          },
        });
      }
    }

    // If multiple userIds, filter to only include current user and friends
    if (query.userIds) {
      const allowedIds = [
        currentUserId,
        ...currentUser.friends.map((id) => id.toString()),
      ];
      const requestedIds = query.userIds.split(',').map((id) => id.trim());
      const filteredIds = requestedIds.filter((id) => allowedIds.includes(id));
      readQuery._id = { $in: filteredIds.map((id) => new Types.ObjectId(id)) };
    }

    // If no specific filters and it's a general search, don't restrict to friends
    if (!query.userId && !query.userIds && query.search) {
      // Allow search across all users for friend discovery
    } else if (!query.userId && !query.userIds && !query.search) {
      // Default: show current user and their friends
      const allowedIds = [
        new Types.ObjectId(currentUserId),
        ...currentUser.friends.map((id) => new Types.ObjectId(id.toString())),
      ];
      readQuery._id = { $in: allowedIds };
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
      case 'namea':
        sortObj = { name: 1 };
        break;
      case 'named':
        sortObj = { name: -1 };
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

    // Handle field selection with security - always exclude sensitive fields
    if (query.fields) {
      const fieldList = query.fields.split(',').map((field) => field.trim());
      const projection: any = { _id: 1 };
      fieldList.forEach((field) => {
        if (
          field !== '_id' &&
          field !== 'password' &&
          field !== 'email' &&
          field !== 'isEmailVerified'
        ) {
          projection[field] = 1;
        } else if (field === 'email' || field === 'isEmailVerified') {
          // Only include email/verification status for current user
          projection[field] = {
            $cond: {
              if: { $eq: ['$_id', new Types.ObjectId(currentUserId)] },
              then: `$${field}`,
              else: '$$REMOVE',
            },
          };
        }
      });
      pipeline.push({ $project: projection });
    } else {
      // Default: include only safe public fields
      pipeline.push({
        $project: {
          _id: 1,
          username: 1,
          name: 1,
          displayPicture: 1,
          lastActive: 1,
          timestamp: 1,
          friends: 1,
          // email only included for current user
          email: {
            $cond: {
              if: { $eq: ['$_id', new Types.ObjectId(currentUserId)] },
              then: '$email',
              else: '$$REMOVE',
            },
          },
          isEmailVerified: {
            $cond: {
              if: { $eq: ['$_id', new Types.ObjectId(currentUserId)] },
              then: '$isEmailVerified',
              else: '$$REMOVE',
            },
          },
        },
      });
    }

    // Handle population
    if (query.populate === 'friends') {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'friends',
          foreignField: '_id',
          as: 'friends',
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

    // Execute aggregation
    const users = await this.userModel.aggregate(pipeline);

    // Get total count
    const totalCount = await this.userModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: users.length,
      page,
      users: users || [],
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const { username, password, email, name } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException({
          success: false,
          message: 'Username already exists',
          error: {
            code: ERROR_CODES.DUPLICATE_ENTITY,
            details: { field: 'username' },
          },
        });
      }
      if (existingUser.email === email) {
        throw new ConflictException({
          success: false,
          message: 'Email already exists',
          error: {
            code: ERROR_CODES.DUPLICATE_ENTITY,
            details: { field: 'email' },
          },
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new this.userModel({
      username,
      password: hashedPassword,
      email,
      name,
    });

    const savedUser = await user.save();

    // Generate and send OTP
    const otp = this.emailService.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + this.appConfig.otp.expiryMinutes,
    );

    // Remove any existing verification tokens for this user
    await this.verificationTokenModel.deleteMany({
      userId: savedUser._id,
      type: VerificationTokenType.EMAIL_VERIFICATION,
    });

    // Create new verification token
    const verificationToken = new this.verificationTokenModel({
      userId: savedUser._id,
      token: otp,
      type: VerificationTokenType.EMAIL_VERIFICATION,
      expiresAt,
    });

    await verificationToken.save();

    // Send OTP email
    try {
      await this.emailService.sendVerificationEmail(email, otp);
    } catch (error) {
      // If email sending fails, delete the user and token
      await this.userModel.findByIdAndDelete(savedUser._id);
      await this.verificationTokenModel.findByIdAndDelete(
        verificationToken._id,
      );

      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to send verification email',
        error: {
          code: ERROR_CODES.EMAIL_SEND_FAILED,
          details: null,
        },
      });
    }

    return {
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
      users: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        isEmailVerified: savedUser.isEmailVerified,
        name: savedUser.name,
        displayPicture: savedUser.displayPicture,
        friends: savedUser.friends,
        lastActive: savedUser.lastActive,
        timestamp: savedUser.timestamp,
        // password field intentionally excluded
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: { field: 'email' },
        },
      });
    }

    if (user.isEmailVerified) {
      throw new BadRequestException({
        success: false,
        message: 'Email is already verified',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'email' },
        },
      });
    }

    // Find verification token
    const verificationToken = await this.verificationTokenModel.findOne({
      userId: user._id,
      token: otp,
      type: VerificationTokenType.EMAIL_VERIFICATION,
    });

    if (!verificationToken) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid OTP',
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: { field: 'otp' },
        },
      });
    }

    // Check if token has expired
    if (verificationToken.expiresAt < new Date()) {
      await this.verificationTokenModel.findByIdAndDelete(
        verificationToken._id,
      );
      throw new BadRequestException({
        success: false,
        message: 'OTP has expired',
        error: {
          code: ERROR_CODES.TOKEN_EXPIRED,
          details: { field: 'otp' },
        },
      });
    }

    // Verify email - this will trigger the pre-save hook to update timestamp
    user.isEmailVerified = true;

    // Update last active timestamp (similar to login)
    user.lastActive = new Date();
    await user.save();

    // Delete verification token
    await this.verificationTokenModel.findByIdAndDelete(verificationToken._id);

    // Generate JWT token for auto-login (similar to login response)
    const token = await this.authService.generateToken(user);

    return {
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        displayPicture: user.displayPicture,
        friends: user.friends,
        lastActive: user.lastActive,
        timestamp: user.timestamp,
        token,
      },
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // Build update document
    const updateFields: any = {};

    // Only add fields that are provided
    if (updateUserDto.name !== undefined) {
      updateFields.name = updateUserDto.name;
    }
    if (updateUserDto.displayPicture !== undefined) {
      updateFields.displayPicture = updateUserDto.displayPicture;
    }

    // Find and update the user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: ERROR_CODES.USER_NOT_FOUND,
          details: null,
        },
      });
    }

    return {
      message: SUCCESS_MESSAGES.USER_UPDATED,
      users: {
        _id: updatedUser._id,
        name: updatedUser.name,
        displayPicture: updatedUser.displayPicture,
        // password and other sensitive fields intentionally excluded
      },
    };
  }
}
