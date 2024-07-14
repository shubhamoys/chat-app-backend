import { IResponse } from './interfaces';

export class ResponseConstant {
  public static readonly OK: IResponse = {
    httpStatusCode: 200,
    status: 'SUCCESS',
    message: 'OK',
  };

  public static readonly CREATED: IResponse = {
    httpStatusCode: 201,
    status: 'SUCCESS',
    message:
      'The request has been fulfilled and resulted in a new resource being created.',
  };

  public static readonly ACCEPTED: IResponse = {
    httpStatusCode: 202,
    status: 'SUCCESS',
    message:
      'The request has been accepted for processing, but the processing has not been completed.',
  };

  public static readonly NO_CONTENT: IResponse = {
    httpStatusCode: 204,
    status: 'SUCCESS',
    message:
      'The server successfully processed the request, but is not returning any content.',
  };

  public static readonly MULTI_STATUS: IResponse = {
    httpStatusCode: 207,
    status: 'MULTI_STATUS',
    message:
      'The message body can contain a number of separate response codes, depending on' +
      ' how many sub-requests were made.',
  };

  public static readonly MOVED_PERMANENTLY: IResponse = {
    httpStatusCode: 301,
    status: 'SUCCESS',
    message:
      'The requested resource has been assigned a new permanent URI and any future' +
      ' references to this resource SHOULD use one of the returned URIs.',
  };

  public static readonly MOVED_TEMPORARILY: IResponse = {
    httpStatusCode: 302,
    status: 'SUCCESS',
    message:
      'The requested resource resides temporarily under a different URI.',
  };

  public static readonly BAD_REQUEST: IResponse = {
    httpStatusCode: 400,
    status: 'ERROR',
    message:
      'The request could not be understood by the server due to malformed syntax.',
  };

  public static readonly UNAUTHORIZED: IResponse = {
    httpStatusCode: 401,
    status: 'ERROR',
    message: 'The request requires authentication.',
  };

  public static readonly PAYMENT_REQUIRED: IResponse = {
    httpStatusCode: 402,
    status: 'ERROR',
    message: 'Insufficient balance to proceed with the request',
  };

  public static readonly FORBIDDEN: IResponse = {
    httpStatusCode: 403,
    status: 'ERROR',
    message:
      'The server understood the request, but is refusing to fulfill it.' +
      ' Authorization will not help and the request SHOULD NOT be repeated.',
  };

  public static readonly NOT_FOUND: IResponse = {
    httpStatusCode: 404,
    status: 'ERROR',
    message:
      'The requested resource could not be found but may be available again in the future.',
  };

  public static readonly METHOD_NOT_ALLOWED: IResponse = {
    httpStatusCode: 405,
    status: 'ERROR',
    message:
      'A request was made of a resource using a request method not supported by that resource.',
  };

  public static readonly UNSUPPORTED_MEDIA_TYPE: IResponse = {
    httpStatusCode: 415,
    status: 'ERROR',
    message:
      'The request entity has a media type which the server or resource does not support.' +
      ' Support only exists for application/json data',
  };

  public static readonly INTERNAL_SERVER_ERROR: IResponse = {
    httpStatusCode: 500,
    status: 'ERROR',
    message:
      'The server encountered an unexpected condition which prevented it from' +
      ' fulfilling the request.',
  };

  public static readonly NOT_IMPLEMENTED: IResponse = {
    httpStatusCode: 501,
    status: 'SUCCESS',
    message:
      'The server either does not recognise the request method, or it lacks' +
      ' the ability to fulfill the request.',
  };

  private constructor() {}
}
