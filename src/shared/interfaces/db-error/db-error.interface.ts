import { IError } from './../../../constants/interfaces';
export interface DbError {
  error: IError;
  msgVars: { [key: string]: any };
}
