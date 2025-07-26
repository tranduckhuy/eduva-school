import { Injectable, inject } from '@angular/core';

import * as signalR from '@microsoft/signalr';

import { environment } from '../../../../../environments/environment';

import { JwtService } from '../../../../core/auth/services/jwt.service';
import { NotificationService } from './notification.service';

import { type NotificationModel } from '../../../models/entities/notification.model';
import { type QuestionNotification } from '../../../../core/layout/header/user-actions/notifications/models/question-notification.model';
import { type QuestionDeleteNotification } from '../../../../core/layout/header/user-actions/notifications/models/question-delete-notification.model';
import { type QuestionCommentNotification } from '../../../../core/layout/header/user-actions/notifications/models/question-comment-notification.model';
import { type QuestionCommentDeleteNotification } from '../../../../core/layout/header/user-actions/notifications/models/question-comment-delete-notification.model';
import { type LessonMaterialApprovalNotification } from '../../../../core/layout/header/user-actions/notifications/models/material-approval-notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationSocketService {
  private connection: signalR.HubConnection | null = null;

  private readonly jwtService = inject(JwtService);
  private readonly notificationService = inject(NotificationService);

  private readonly BASE_HUB_API = environment.baseHubUrl;

  connect() {
    if (this.connection) {
      this.disconnect();
    }

    const hubUrl = `${this.BASE_HUB_API}/notification`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.jwtService.getAccessToken() ?? '',
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => {
        this.registerConnectionHandler<QuestionNotification>('QuestionCreated');
        this.registerConnectionHandler<QuestionNotification>('QuestionUpdated');
        this.registerConnectionHandler<QuestionDeleteNotification>(
          'QuestionDeleted'
        );
        this.registerConnectionHandler<QuestionCommentNotification>(
          'QuestionCommented'
        );
        this.registerConnectionHandler<QuestionCommentNotification>(
          'QuestionCommentUpdated'
        );
        this.registerConnectionHandler<QuestionCommentDeleteNotification>(
          'QuestionCommentDeleted'
        );
        this.registerConnectionHandler<LessonMaterialApprovalNotification>(
          'LessonMaterialApproved'
        );
        this.registerConnectionHandler<LessonMaterialApprovalNotification>(
          'LessonMaterialRejected'
        );
      })
      .catch(() => {});
  }

  disconnect(): void {
    this.connection?.stop();
    this.connection = null;
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private registerConnectionHandler<T>(event: string) {
    this.connection?.on(event, (payload: T) => {
      const notification = this.createNotification<T>(event, payload);
      this.notificationService.addNotification(notification);
    });
  }

  private createNotification<T>(
    type: string,
    payload: T
  ): NotificationModel<T> {
    const id = this.hasUserNotificationId(payload)
      ? payload.userNotificationId
      : crypto.randomUUID();
    return {
      id: id,
      type,
      payload,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
  }

  private hasUserNotificationId(
    obj: unknown
  ): obj is { userNotificationId: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'userNotificationId' in obj &&
      typeof (obj as any).userNotificationId === 'string'
    );
  }
}
