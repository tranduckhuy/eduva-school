import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, map, catchError, throwError, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../core/request/request.service';

import { mapNotificationPayload } from '../../../utils/util-functions';

import { StatusCode } from '../../../constants/status-code.constant';

import { type NotificationModel } from '../../../models/entities/notification.model';
import { type NotificationPayloadMap } from '../../../../core/layout/header/user-actions/notifications/models/notification-payload-mapping.model';
import { type GetNotificationsRequest } from '../../../models/api/request/query/get-notifications-request.model';
import { type GetNotificationsResponse } from '../../../models/api/response/query/get-notifications-response.model';

export type NotificationWithTypedPayload = {
  [K in keyof NotificationPayloadMap]: NotificationModel<
    NotificationPayloadMap[K]
  >;
}[keyof NotificationPayloadMap];

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly requestService = inject(RequestService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_NOTIFICATION_API_URL = `${this.BASE_API_URL}/notifications`;

  private readonly notificationsSignal = signal<NotificationModel[]>([]);
  notifications = computed<NotificationWithTypedPayload[]>(
    () => this.notificationsSignal() as NotificationWithTypedPayload[]
  );

  private readonly totalNotificationSignal = signal<number>(0);
  totalNotification = this.totalNotificationSignal.asReadonly();

  getNotifications(
    request: GetNotificationsRequest
  ): Observable<NotificationModel[] | null> {
    return this.requestService
      .get<GetNotificationsResponse>(this.BASE_NOTIFICATION_API_URL, request, {
        loadingKey: 'get-notifications',
      })
      .pipe(
        tap(res => this.handleNotificationsResponse(res)),
        map(res => this.extractNotificationsResponse(res)),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.requestService
      .put(`${this.BASE_NOTIFICATION_API_URL}/${notificationId}/read`)
      .pipe(
        map(() => void 0),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  markAllNotificationAsRead(): Observable<void> {
    return this.requestService
      .put(`${this.BASE_NOTIFICATION_API_URL}/read-all`)
      .pipe(
        map(() => void 0),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  addNotification<T>(notification: NotificationModel<T>): void {
    const current = this.notificationsSignal();
    this.notificationsSignal.set([notification, ...current]);
  }

  optimisticMarkAsRead(notificationId: string) {
    const current = this.notificationsSignal();
    const updated = current.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.notificationsSignal.set(updated);
  }

  optimisticMarkAllAsRead() {
    const current = this.notificationsSignal();
    const updated = current.map(n => ({ ...n, isRead: true }));
    this.notificationsSignal.set(updated);
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleNotificationsResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const rawList = res.data.data as NotificationModel<any>[];

      const typedList = rawList.map(n => {
        switch (n.type) {
          case 'QuestionCreated':
          case 'QuestionUpdated':
            return mapNotificationPayload<'QuestionCreated'>(n);
          case 'QuestionDeleted':
            return mapNotificationPayload<'QuestionDeleted'>(n);
          case 'QuestionCommented':
          case 'QuestionCommentUpdated':
            return mapNotificationPayload<'QuestionCommented'>(n);
          case 'QuestionCommentDeleted':
            return mapNotificationPayload<'QuestionCommentDeleted'>(n);
          default:
            return n;
        }
      });

      this.notificationsSignal.set([
        ...this.notificationsSignal(),
        ...typedList,
      ]);
      this.totalNotificationSignal.set(res.data.count);
    } else {
      this.notificationsSignal.set([]);
      this.totalNotificationSignal.set(0);
    }
  }

  private extractNotificationsResponse(res: any): NotificationModel[] | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data.data as NotificationModel[];
    }
    return null;
  }
}
