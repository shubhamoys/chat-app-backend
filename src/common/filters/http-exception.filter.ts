import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/response.constants';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: ApiResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Check if the exception response is already in our format
      if (
        typeof exceptionResponse === 'object' &&
        'success' in exceptionResponse
      ) {
        errorResponse = exceptionResponse as ApiResponse;
      } else {
        // Format standard HTTP exceptions
        const message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any)?.message || exception.message;

        errorResponse = {
          success: false,
          message: Array.isArray(message) ? message.join(', ') : message,
          error: {
            code: this.getErrorCode(status),
            details:
              typeof exceptionResponse === 'object' ? exceptionResponse : null,
          },
        };
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        success: false,
        message: 'Internal server error',
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          details: null,
        },
      };

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Log the error with request details
    this.logger.error(
      `HTTP ${status} Error: ${errorResponse.message} - ${request.method} ${request.url}`,
      {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
      },
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.INVALID_FIELD;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.PERMISSION_DENIED;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.USER_NOT_FOUND; // Generic, should be overridden by specific services
      case HttpStatus.CONFLICT:
        return ERROR_CODES.DUPLICATE_ENTITY;
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
