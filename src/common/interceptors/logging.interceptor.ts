import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.log(`${method} ${url} - ${statusCode} - ${duration}ms`);
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log error response
        this.logger.error(
          `${method} ${url} - Error - ${duration}ms - ${error.message}`,
        );

        throw error;
      }),
    );
  }
}
