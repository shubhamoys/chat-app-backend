import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ErrorConstant } from '../../../constants/error';
import { Request } from 'express';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { PermissionsService } from 'src/app-modules/permissions/permissions.service';
import { IResource } from 'src/constants/interfaces';
import { TicketModel } from 'src/shared/models/ticket-model/ticket-model';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly helperService: HelperService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    let req = ctx.getRequest<Request>();

    let resourceConst: IResource;

    if (!req['ticket']) {
      // test resource if has signWith
      resourceConst = this.helperService.getResourceConstant(
        req.method,
        req.originalUrl,
      );

      if (!resourceConst.signWith) {
        return true;
      }

      throw new ConflictException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'ticket' },
      });
    }

    let ticket = req['ticket'] as TicketModel;

    if (ticket.resourceConstant.signWith === 'RSK') {
      return true;
    }

    let permQuery = {
      resourceId: String(ticket.token._id),
      resourceName: 'Tokens',
      resourceAction: ticket.resourceConstant.action,
    };

    try {
      ticket.permission = await this.permissionsService.validate(permQuery);

      req['ticket'] = ticket;

      return true;
    } catch (e) {
      throw new ForbiddenException({
        error: ErrorConstant.UNKNOWN_ERROR,
        msgVars: {
          message: 'You do not have enough permission to access this route',
        },
      });
    }
  }
}
