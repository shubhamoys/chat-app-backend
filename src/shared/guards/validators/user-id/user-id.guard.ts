import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from 'src/app-modules/users/users.service';
import { ErrorConstant } from 'src/constants/error';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    /**
     * This confirms that the userId provided by the client is allowed for the client
     * For that to happen, it needs to be validated against userId and restrictByParams
     */
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    if (!req['ticket']) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'ticket' },
      });
    }

    if (!req.body.userId) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'userId' },
      });
    }

    let query = {};

    const { user, permission } = req['ticket'] as TicketModel;

    switch (permission.restriction) {
      case 'userId': {
        query['userId'] = String(user._id);
        break;
      }

      default: {
        query['userId'] = String(user._id);
        break;
      }
    }

    let foundUser = await this.usersService.get(query);

    if (!foundUser || !foundUser.totalCount) {
      throw new UnauthorizedException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'userId',
        },
      });
    }

    if (!req['storage']) {
      req['storage'] = {};
    }

    req['storage']['user'] = foundUser.users[0];

    return true;
  }
}
