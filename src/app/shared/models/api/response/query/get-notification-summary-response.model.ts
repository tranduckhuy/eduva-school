import { type NotificationModel } from '../../../entities/notification.model';

export interface GetNotificationSummaryResponse {
  unreadCount: number;
  recentNotifications: NotificationModel[];
}
