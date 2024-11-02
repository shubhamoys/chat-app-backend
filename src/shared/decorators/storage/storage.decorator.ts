import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Storage = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const storage = request['storage'];

    return key ? storage && storage[key] : storage;
  },
);
