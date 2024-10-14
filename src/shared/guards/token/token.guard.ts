import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokensService } from 'src/app-modules/tokens/tokens.service';
import { ErrorConstant } from 'src/constants/error';
import { IResource } from 'src/constants/interfaces';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly tokensService: TokensService,
    private readonly helperService: HelperService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    let resourceConstant: IResource = this.helperService.getResourceConstant(
      req.method,
      req.originalUrl,
    );

    if (!resourceConstant) {
      throw new NotFoundException({
        error: ErrorConstant.ENDPOINT_NOT_EXIST,
        msgVars: { endpoint: `${req.method} ${req.originalUrl}` },
      });
    }

    if (resourceConstant.signWith !== 'TOKEN') {
      return true;
    }

    if (!req.headers.authorization) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'token' },
      });
    }

    let hash = req.headers.authorization.split(' ')[1];

    if (!hash) {
      throw new UnauthorizedException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'token' },
      });
    }

    let token = await this.tokensService.validate(hash);

    let ticket = TicketModel.fromToken(token, resourceConstant);

    req['ticket'] = ticket;

    return true;
  }
}
