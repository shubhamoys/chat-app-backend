import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn('WebSocket connection rejected: No token provided');
        return false;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Find user in database
      const user = await this.userModel.findById(userId);
      if (!user) {
        this.logger.warn('WebSocket connection rejected: User not found');
        return false;
      }

      if (!user.isEmailVerified) {
        this.logger.warn('WebSocket connection rejected: Email not verified');
        return false;
      }

      // Attach user to socket for use in handlers
      (client as any).user = user;
      (client as any).userId = userId;

      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication error: ${error.message}`);
      return false;
    }
  }
}
