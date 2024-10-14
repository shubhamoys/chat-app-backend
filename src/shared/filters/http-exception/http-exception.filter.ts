import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { AppResponse } from '../../models/app-response/app-response';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    let req = ctx.getRequest<Request>();
    let res = ctx.getResponse<Response>();
    let resData = AppResponse.toObject(req, res, null, exception);

    res.status(resData.httpStatusCode).json(resData);
  }
}
