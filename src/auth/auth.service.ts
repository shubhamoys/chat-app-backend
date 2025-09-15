import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';
import { JwtPayload } from './strategies/jwt.strategy';
import { ERROR_CODES } from '../common/constants/response.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          details: { field: 'password' },
        },
      });
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        success: false,
        message:
          'Email not verified. Please verify your email before logging in.',
        error: {
          code: ERROR_CODES.EMAIL_NOT_VERIFIED,
          details: { field: 'email' },
        },
      });
    }

    // Update last active timestamp
    await this.userModel.findByIdAndUpdate(user._id, {
      lastActive: new Date(),
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      users: {
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

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }
}
