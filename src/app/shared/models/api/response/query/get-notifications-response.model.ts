import { NotificationModel } from '../../../entities/notification.model';

export interface GetNotificationsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: NotificationModel[];
}
