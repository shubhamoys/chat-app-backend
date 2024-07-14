import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadGatewayException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppResponse } from '../../models/app-response/app-response';
import { ErrorConstant } from '../../../constants/error';

@Catch()
export class GenericExceptionFilter<T> implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    let req = ctx.getRequest<Request>();
    let res = ctx.getResponse<Response>();

    let err = new BadGatewayException({
      error: ErrorConstant.UNKNOWN_ERROR,
      msgVars: {
        message:
          (exception && `${exception.message} - (${exception.name})`) ||
          'No stack trace found',
      },
    });

    let resData = AppResponse.toObject(req, res, null, err);

    res.status(resData.httpStatusCode).json(resData);
  }
}
