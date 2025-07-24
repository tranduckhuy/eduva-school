export interface NotificationModel<T = unknown> {
  id: string;
  type: string;
  payload: T;
  createdAt: string;
  isRead: boolean;
}
