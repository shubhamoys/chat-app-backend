import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '../../../shared/models/app-response/app-response';

@Injectable()
export class AppResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let ctx = context.switchToHttp();
    return next.handle().pipe(
      map((data) => {
        let req = ctx.getRequest<Request>();
        let res = ctx.getResponse<Response>();
        return AppResponse.toObject(req, res, data);
      }),
    );
  }
}
