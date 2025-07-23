import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from 'primeng/tooltip';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';
import { SafeHtmlPipe } from '../../../../../shared/pipes/safe-html.pipe';
import { LeadingZeroPipe } from '../../../../../shared/pipes/leading-zero.pipe';

import {
  NotificationService,
  type NotificationWithTypedPayload,
} from '../../../../../shared/services/api/notification/notification.service';
import { LoadingService } from '../../../../../shared/services/core/loading/loading.service';

import { NotificationSkeletonComponent } from '../../../../../shared/components/skeleton/notification-skeleton/notification-skeleton.component';

import { type GetNotificationsRequest } from '../../../../../shared/models/api/request/query/get-notifications-request.model';

@Component({
  selector: 'header-notifications',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    SubmenuDirective,
    SafeHtmlPipe,
    LeadingZeroPipe,
    NotificationSkeletonComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);

  clickOutside = output();

  isLoading = this.loadingService.is('get-notifications');
  notifications = this.notificationService.notifications;
  totalNotification = this.notificationService.totalNotification;

  currentPage = signal<number>(0);
  pageSize = signal<number>(20);

  displayNotifications = computed(() =>
    this.notifications().map(n => ({
      id: n.id,
      type: n.type,
      payload: {
        ...n.payload,
        ...this.formatNotification(n),
      },
      createdAt: n.createdAt,
      isRead: n.isRead,
    }))
  );

  ngOnInit(): void {
    if (this.notifications().length === 0) {
      this.loadMore();
    }
  }

  loadMore() {
    const nextPage = this.currentPage() + 1;

    const request: GetNotificationsRequest = {
      pageIndex: nextPage,
      pageSize: this.pageSize(),
    };
    this.notificationService.getNotifications(request).subscribe({
      next: () => this.currentPage.set(nextPage),
    });
  }

  markAsRead(notificationId: string) {
    this.notificationService.setNotificationAsRead(notificationId).subscribe({
      next: () => this.notificationService.optimisticMarkAsRead(notificationId),
    });
  }

  markAllAsRead() {
    this.notificationService.setAllNotificationAsRead().subscribe({
      next: () => this.notificationService.optimisticMarkAllAsRead(),
    });
  }

  private formatRelativeDate(dateString: string): string {
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = now.getTime() - target.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    if (months < 12) return `${months} tháng trước`;
    return `${years} năm trước`;
  }

  private formatNotification(notification: NotificationWithTypedPayload) {
    const payload = notification.payload as any;
    const { title, lessonMaterialTitle, createdByName, createdAt, deletedAt } =
      payload;

    const date = this.formatRelativeDate(createdAt || deletedAt);

    switch (notification.type) {
      case 'QuestionCreated':
        return {
          rawMessage: `Câu hỏi ${title} mới được thêm vào bài học: ${lessonMaterialTitle}`,
          message: `Câu hỏi <strong>${title}</strong> mới được thêm vào bài học: <strong>${lessonMaterialTitle}</strong>`,
          date,
        };
      case 'QuestionUpdated':
        return {
          rawMessage: `Câu hỏi ${title} mới được cập nhật tại bài học: ${lessonMaterialTitle}`,
          message: `Câu hỏi <strong>${title}</strong> mới được cập nhật tại bài học: <strong>${lessonMaterialTitle}</strong>`,
          date,
        };
      case 'QuestionDeleted':
        return {
          rawMessage: `Câu hỏi ${title} mới được xóa khỏi bài học: ${lessonMaterialTitle}`,
          message: `Câu hỏi <strong>${title}</strong> mới được xóa khỏi bài học: <strong>${lessonMaterialTitle}</strong>`,
          date,
        };
      case 'QuestionCommented':
        return {
          rawMessage: `${createdByName} đã bình luận vào câu hỏi: ${title}`,
          message: `<strong>${createdByName}</strong> đã bình luận vào câu hỏi: <strong>${title}</strong>`,
          date,
        };
      case 'QuestionCommentUpdated':
        return {
          rawMessage: `${createdByName} đã chỉnh sửa 1 bình luận của câu hỏi: ${title}`,
          message: `<strong>${createdByName}</strong> đã chỉnh sửa 1 bình luận của câu hỏi: <strong>${title}</strong>`,
          date,
        };
      case 'QuestionCommentDeleted':
        return {
          rawMessage: `${createdByName} đã xóa 1 bình luận của câu hỏi: ${title}`,
          message: `<strong>${createdByName}</strong> đã xóa 1 bình luận của câu hỏi: <strong>${title}</strong>`,
          date,
        };
      default:
        return {
          message: 'Thông báo không xác định',
          date,
        };
    }
  }
}
