import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Ticket = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ticket = request['ticket'];

    return key ? ticket && ticket[key] : ticket;
  },
);
