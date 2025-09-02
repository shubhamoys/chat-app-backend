export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: ApiResponseData<T>;
  error?: ApiError;
}

export interface ApiResponseData<T = any> {
  currentCount?: number | null;
  totalCount?: number | null;
  page?: number | null;
  [key: string]: T | T[] | number | null | undefined;
}

export interface ApiError {
  code: string;
  details?: any;
}

export interface PaginationQuery {
  limit?: number;
  page?: number;
}

export interface SortQuery {
  sort?: string;
}

export interface FieldsQuery {
  fields?: string;
}

export interface PopulateQuery {
  populate?: string;
}
