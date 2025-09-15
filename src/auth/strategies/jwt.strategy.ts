import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { AppConfig } from '../../config/app.config';

export interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly appConfig: AppConfig;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    const appConfig = AppConfig.getInstance();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
    this.appConfig = appConfig;
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Update last active timestamp
    await this.userModel.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });

    return user;
  }
}
