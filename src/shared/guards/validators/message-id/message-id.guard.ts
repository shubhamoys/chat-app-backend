import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { MessagesService } from 'src/app-modules/messages/messages.service';
import { ErrorConstant } from 'src/constants/error';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class MessageIdGuard implements CanActivate {
  constructor(private readonly messagesService: MessagesService) {}

  async canActivate(context: ExecutionContext) {
    /**
     * This confirms that the messageId provided by the client is allowed for the client
     * For that to happen, it needs to be validated against messageId and restrictByParams
     */
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    if (!req['ticket']) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'ticket' },
      });
    }

    if (!req.body.messageId) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'messageId' },
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
        break;
      }
    }

    let foundMessage = await this.messagesService.get(query);

    if (!foundMessage || !foundMessage.totalCount) {
      throw new UnauthorizedException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'messageId',
        },
      });
    }

    if (!req['storage']) {
      req['storage'] = {};
    }

    req['storage']['message'] = foundMessage.messages[0];

    return true;
  }
}
