import { type StatusCodeType } from '../../constants/status-code.constant';

export interface BaseResponse<T = null | undefined> {
  statusCode: StatusCodeType;
  data?: T;
  message?: string;
}
