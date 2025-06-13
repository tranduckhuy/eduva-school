export interface BaseResponse<T = null | undefined> {
  statusCode: string | number;
  data?: T;
  message?: string;
}
