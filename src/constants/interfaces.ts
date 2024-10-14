export interface IResponse {
  httpStatusCode: number;
  status: string;
  message: string;
}

export interface IError {
  appStatusCode: number;
  message: IResponseMessage;
}

export interface IResponseMessage {
  log?: string;
  dev: string;
  user: string;
}

export interface IResponseRequest {
  method: string;
  params: { [key: string]: any };
  page?: number;
  limit?: number;
}

export interface IResource {
  action: string;
  resource: string;
  verb: string;
  endpoint: string;
  signWith: string;
  type: string;
  name: string;
  description: string;
  validateIds?: string[];
  roles?: { [key: string]: IResourceRoles } | null;
}

export interface IResourceRoles {
  role: string;
  restriction: string;
}

export interface ISDKResponse {
  resHeader: { [key: string]: any };
  resStatusCode: number;
  body: { [key: string]: any };
  data: any;
}

export interface IValidationError {
  error: IError;
  msgVars: { [key: string]: any };
}

export interface ITicket {
  entity?: { [key: string]: any };
  user?: { [key: string]: any };
  token?: { [key: string]: any };
  permission?: { [key: string]: any };
  permissions?: Array<{ [key: string]: any }>;
  resourceConstant?: IResource;
  valid?: boolean;
  error?: IValidationError;
}

export interface IRole {
  role: string;
  description?: string;
  visible?: boolean;
  childRoles?: string[];
}

export interface IDbError {
  error: IError;
  msgVars: { [key: string]: any };
}
