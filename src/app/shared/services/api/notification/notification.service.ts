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
import { type GetNotificationSummaryResponse } from '../../../models/api/response/query/get-notification-summary-response.model';

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
  private readonly GET_NOTIFICATION_SUMMARY_API_URL = `${this.BASE_NOTIFICATION_API_URL}/summary`;
  private readonly MARK_ALL_NOTIFICATION_AS_READ_API_URL = `${this.BASE_NOTIFICATION_API_URL}/read-all`;

  private readonly notificationsSignal = signal<NotificationModel[]>([]);
  notifications = computed<NotificationWithTypedPayload[]>(
    () => this.notificationsSignal() as NotificationWithTypedPayload[]
  );

  private readonly totalNotificationSignal = signal<number>(0);
  totalNotification = this.totalNotificationSignal.asReadonly();

  private readonly unreadCountSignal = signal<number>(0);
  unreadCount = this.unreadCountSignal.asReadonly();

  private readonly hasLoadedSignal = signal(false);
  hasLoaded = this.hasLoadedSignal.asReadonly();

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

  getNotificationSummary(): Observable<number> {
    return this.requestService
      .get<GetNotificationSummaryResponse>(
        this.GET_NOTIFICATION_SUMMARY_API_URL
      )
      .pipe(
        tap(res => this.handleNotificationSummaryResponse(res)),
        map(res => this.extractNotificationSummaryResponse(res)),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.requestService
      .put(`${this.BASE_NOTIFICATION_API_URL}/${notificationId}/read`)
      .pipe(
        tap(() => this.getNotificationSummary().subscribe()),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  markAllNotificationAsRead(): Observable<void> {
    return this.requestService
      .put(this.MARK_ALL_NOTIFICATION_AS_READ_API_URL)
      .pipe(
        tap(() => this.getNotificationSummary().subscribe()),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  addNotification<T>(notification: NotificationModel<T>): void {
    const current = this.notificationsSignal();
    const currentTotal = this.totalNotificationSignal();
    const currentUnreadCount = this.unreadCountSignal();

    // ? Check if notification already exists to avoid duplicates
    const exists = current.some(n => n.id === notification.id);
    if (!exists) {
      this.notificationsSignal.set([notification, ...current]);
      this.totalNotificationSignal.set(currentTotal + 1);
      this.unreadCountSignal.set(currentUnreadCount + 1);
    }
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

  clearSignal() {
    this.notificationsSignal.set([]);
    this.totalNotificationSignal.set(0);
    this.unreadCountSignal.set(0);
    this.hasLoadedSignal.set(false);
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

      this.notificationsSignal.update(old => {
        // ? Create a map of existing notifications by ID for quick lookup
        const existingIds = new Set(old.map(n => n.id));

        // ? Filter out notifications that already exist
        const newNotifications = typedList.filter(n => !existingIds.has(n.id));

        // ? Merge new notifications with existing ones
        const merged = [...old, ...newNotifications];

        return merged.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      });
      this.totalNotificationSignal.set(res.data.count);
      this.hasLoadedSignal.set(true);
    } else {
      this.notificationsSignal.set([]);
      this.totalNotificationSignal.set(0);
      this.hasLoadedSignal.set(true);
    }
  }

  private handleNotificationSummaryResponse(res: any) {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.unreadCountSignal.set(res.data.unreadCount);
    }
  }

  private extractNotificationsResponse(res: any): NotificationModel[] | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data.data as NotificationModel[];
    }
    return null;
  }

  private extractNotificationSummaryResponse(res: any): number {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data.unreadCount;
    }
    return 0;
  }
}
