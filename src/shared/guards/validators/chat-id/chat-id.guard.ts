import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatsService } from 'src/app-modules/chats/chats.service';
import { ErrorConstant } from 'src/constants/error';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class ChatIdGuard implements CanActivate {
  constructor(private readonly chatsService: ChatsService) {}

  async canActivate(context: ExecutionContext) {
    /**
     * This confirms that the chatId provided by the client is allowed for the client
     * For that to happen, it needs to be validated against chatId and restrictByParams
     */
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    if (!req['ticket']) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'ticket' },
      });
    }

    if (!req.body.chatId) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'chatId' },
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

    let foundChat = await this.chatsService.get(query);

    if (!foundChat || !foundChat.totalCount) {
      throw new UnauthorizedException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'chatId',
        },
      });
    }

    if (!req['storage']) {
      req['storage'] = {};
    }

    req['storage']['chat'] = foundChat.chats[0];

    return true;
  }
}
