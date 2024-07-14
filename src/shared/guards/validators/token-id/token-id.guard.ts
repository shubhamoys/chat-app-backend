import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokensService } from 'src/app-modules/tokens/tokens.service';
import { ErrorConstant } from 'src/constants/error';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class TokenIdGuard implements CanActivate {
  constructor(private readonly tokensService: TokensService) {}

  async canActivate(context: ExecutionContext) {
    /**
     * This confirms that the tokenId provided by the client is allowed for the client
     * For that to happen, it needs to be validated against organizationId and restrictByParams
     */
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    if (!req['ticket']) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'ticket' },
      });
    }

    if (!req.body.tokenId) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'tokenId' },
      });
    }

    let query = {
      tokenId: req.body.tokenId,
    };

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

    let foundToken = await this.tokensService.get(query);

    if (!foundToken || !foundToken.totalCount) {
      throw new UnauthorizedException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'tokenId',
        },
      });
    }

    if (!req['storage']) {
      req['storage'] = {};
    }

    req['storage']['token'] = foundToken.tokens[0];

    return true;
  }
}
