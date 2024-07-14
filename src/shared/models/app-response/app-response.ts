import { IError } from './../../../constants/interfaces';
import { Helper } from '../helper/helper';
import { Request, Response } from 'express';
import { HttpException } from '@nestjs/common';

export class AppResponse {
  public static toObject(
    req: Request,
    res: Response,
    data: { [key: string]: any },
    err?: HttpException,
  ) {
    let statusCode = (err && err.getStatus()) || res.statusCode;

    let message = {
      dev: 'OK',
      user: 'OK',
    };

    let appStatusCode = 1000000;

    if (err) {
      let { error, msgVars } = err.getResponse() as {
        error: IError;
        msgVars: { [key: string]: any };
      };

      if (error && error.message && Object.keys(error.message).length) {
        message = {
          dev: Helper.templateToString(error.message.dev, msgVars),
          user: Helper.templateToString(error.message.user, msgVars),
        };

        appStatusCode = error.appStatusCode;
      } else {
        message = {
          dev:
            err.getResponse() &&
            err.getResponse()['message'] &&
            err.getResponse()['message'][0],
          user: 'Something went wrong',
        };
      }
    }

    return {
      httpStatusCode: statusCode,
      appStatusCode,
      status: statusCode >= 200 && statusCode < 400 ? 'SUCCESS' : 'ERROR',
      apiVersion: '1.0',

      message,
      request: {
        method: req.method,
        params: { ...req.query, ...req.body },
      },
      data,
    };
  }
}
