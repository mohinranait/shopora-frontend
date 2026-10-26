export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IErrorSource {
  path: string;
  message: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
  meta?: IPaginationMeta;
  errorSources?: IErrorSource[];
}
