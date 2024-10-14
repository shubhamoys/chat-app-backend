import { IError } from './interfaces';

export class ErrorConstant {
  public static readonly ENDPOINT_NOT_EXIST: IError = {
    appStatusCode: 1000000,
    message: {
      log: '{endpoint} does not exist',
      dev: 'This endpoint {endpoint} does not exist',
      user: 'Oops! You have reached a dead end',
    },
  };

  /**
   * users errors
   */
  public static readonly MISSING_FIELD: IError = {
    appStatusCode: 1000001,
    message: {
      log: '{field} required',
      dev: '`{field}` should be present in query',
      user: 'Invalid request. No {field} found.',
    },
  };

  public static readonly INVALID_FIELD: IError = {
    appStatusCode: 1000002,
    message: {
      log: '{field} invalid',
      dev: '`{field}` is invalid',
      user: 'Invalid {field}',
    },
  };

  public static readonly DUPLICATE_ENTITY: IError = {
    appStatusCode: 1000003,
    message: {
      log: '{entity} duplicate',
      dev: '`{entity}` is duplicate',
      user: 'Duplicate {entity}',
    },
  };

  public static readonly DB_ERROR: IError = {
    appStatusCode: 1000004,
    message: {
      log: 'DB Error occurred: {message}',
      dev: 'DB error occurred: {message}',
      user: 'Something went wrong',
    },
  };

  public static readonly ENTITY_NOT_FOUND: IError = {
    appStatusCode: 1000005,
    message: {
      log: '{entity} does not exist',
      dev: '`{entity}` does not exist',
      user: '{entity} does not exist',
    },
  };

  public static readonly NO_ENTITY_DATA: IError = {
    appStatusCode: 1000006,
    message: {
      log: 'no {entity} data',
      dev: 'no {entity} data',
      user: 'no {entity} data',
    },
  };

  public static readonly UNKNOWN_ERROR: IError = {
    appStatusCode: 1000007,
    message: {
      log: 'err occurred: {message}',
      dev: 'err occurred: {message}',
      user: 'err occurred: {message}',
    },
  };

  private constructor() {}
}
