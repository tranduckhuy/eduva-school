import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
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

interface FormattedNotification {
  tooltip?: string;
  message: string;
  date: string;
  disabled?: boolean;
}

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
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);

  clickOutside = output();

  isLoading = this.loadingService.is('get-notifications');
  notifications = this.notificationService.notifications;
  totalNotification = this.notificationService.totalNotification;

  currentPage = signal<number>(0);
  pageSize = signal<number>(20);
  hasMore = signal<boolean>(true);

  displayNotifications = computed(() =>
    this.notifications().map(n => {
      const formatted = this.formatNotification(n);
      const { avatar, alt } = this.getNotificationAvatarAndAlt(n);
      return {
        ...n,
        formatted: {
          ...formatted,
          avatar,
          alt,
        },
      };
    })
  );

  ngOnInit(): void {
    if (this.notifications().length === 0) {
      this.loadMore();
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const threshold = 100;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight <
      threshold
    ) {
      this.loadMore();
    }
  }

  loadMore() {
    if (!this.hasMore() || this.isLoading()) return;

    const nextPage = this.currentPage() + 1;

    const request: GetNotificationsRequest = {
      pageIndex: nextPage,
      pageSize: this.pageSize(),
    };
    this.notificationService.getNotifications(request).subscribe({
      next: res => {
        this.currentPage.set(nextPage);
        if (!res || res.length < this.pageSize()) {
          this.hasMore.set(false);
        }
      },
    });
  }

  markAsRead(notification: NotificationWithTypedPayload) {
    this.notificationService.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        this.notificationService.optimisticMarkAsRead(notification.id);
        this.redirectBasedOnNotification(notification);
      },
    });
  }

  markAllAsRead() {
    this.notificationService.markAllNotificationAsRead().subscribe({
      next: () => this.notificationService.optimisticMarkAllAsRead(),
    });
  }

  private getNotificationAvatarAndAlt(
    notification: NotificationWithTypedPayload
  ): {
    avatar: string;
    alt: string;
  } {
    const payload = notification.payload as any;
    const {
      createdByUserId,
      performedByUserId,
      createdByAvatar,
      performedByAvatar,
      createdByName,
      performedByName,
    } = payload;
    if (
      (notification.type === 'QuestionDeleted' ||
        notification.type === 'QuestionCommentDeleted') &&
      createdByUserId !== undefined &&
      performedByUserId !== undefined &&
      createdByUserId !== performedByUserId
    ) {
      return {
        avatar: performedByAvatar,
        alt: performedByName,
      };
    }
    return {
      avatar: createdByAvatar,
      alt: createdByName,
    };
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

  private formatNotification(
    notification: NotificationWithTypedPayload
  ): FormattedNotification {
    const payload = notification.payload as any;
    const { title, lessonMaterialTitle, createdByName, createdAt, deletedAt } =
      payload;

    const date = this.formatRelativeDate(createdAt ?? deletedAt);

    switch (notification.type) {
      case 'QuestionCreated':
        return {
          tooltip: `Câu hỏi ${title} mới được thêm vào bài học: ${lessonMaterialTitle}`,
          message: `Câu hỏi <strong>${title}</strong> mới được thêm vào bài học: <strong>${lessonMaterialTitle}</strong>`,
          date,
        };
      case 'QuestionUpdated':
        return {
          tooltip: `Câu hỏi ${title} mới được cập nhật tại bài học: ${lessonMaterialTitle}`,
          message: `Câu hỏi <strong>${title}</strong> mới được cập nhật tại bài học: <strong>${lessonMaterialTitle}</strong>`,
          date,
        };
      case 'QuestionDeleted': {
        const {
          createdByUserId,
          performedByUserId,
          createdByName,
          performedByName,
        } = payload;
        if (createdByUserId !== performedByUserId) {
          return {
            tooltip: `Giáo viên ${performedByName} đã xóa câu hỏi của ${createdByName} khỏi bài học: ${lessonMaterialTitle}`,
            message: `Giáo viên <strong>${performedByName}</strong> đã xóa câu hỏi của <strong>${createdByName}</strong> khỏi bài học: <strong>${lessonMaterialTitle}</strong>`,
            date,
          };
        } else {
          return {
            tooltip: `Câu hỏi ${title} mới được xóa khỏi bài học: ${lessonMaterialTitle}`,
            message: `Câu hỏi <strong>${title}</strong> mới được xóa khỏi bài học: <strong>${lessonMaterialTitle}</strong>`,
            date,
          };
        }
      }
      case 'QuestionCommented':
        return {
          tooltip: `${createdByName} đã bình luận vào câu hỏi: ${title}`,
          message: `<strong>${createdByName}</strong> đã bình luận vào câu hỏi: <strong>${title}</strong>`,
          date,
        };
      case 'QuestionCommentUpdated':
        return {
          tooltip: `${createdByName} đã chỉnh sửa 1 bình luận của câu hỏi: ${title}`,
          message: `<strong>${createdByName}</strong> đã chỉnh sửa 1 bình luận của câu hỏi: <strong>${title}</strong>`,
          date,
        };
      case 'QuestionCommentDeleted': {
        const {
          createdByUserId,
          performedByUserId,
          createdByName,
          performedByName,
        } = payload;
        if (createdByUserId !== performedByUserId) {
          return {
            tooltip: `Giáo viên ${performedByName} đã xóa 1 bình luận của ${createdByName} trong câu hỏi: ${title}`,
            message: `Giáo viên <strong>${performedByName}</strong> đã xóa 1 bình luận của <strong>${createdByName}</strong> trong câu hỏi: <strong>${title}</strong>`,
            date,
          };
        } else {
          return {
            tooltip: `${createdByName} đã xóa 1 bình luận của câu hỏi: ${title}`,
            message: `<strong>${createdByName}</strong> đã xóa 1 bình luận của câu hỏi: <strong>${title}</strong>`,
            date,
          };
        }
      }
      default:
        return {
          message: 'Thông báo không xác định',
          date,
          disabled: true,
        };
    }
  }

  private redirectBasedOnNotification(
    notification: NotificationWithTypedPayload
  ) {
    const payload = notification.payload;
    const queryParams = {
      isLinkedFromNotification: true,
    };

    switch (notification.type) {
      case 'QuestionCreated':
      case 'QuestionUpdated':
      case 'QuestionDeleted':
        this.router.navigate(
          ['/teacher/view-lesson', payload.lessonMaterialId],
          {
            queryParams,
          }
        );
        break;
      case 'QuestionCommented':
      case 'QuestionCommentUpdated':
      case 'QuestionCommentDeleted':
        this.router.navigate(
          ['/teacher/view-lesson', payload.lessonMaterialId],
          {
            queryParams: {
              ...queryParams,
              questionId: payload.questionId,
            },
          }
        );
        break;

      default:
        this.router.navigate([
          '/teacher/view-lesson',
          payload.lessonMaterialId,
        ]);
        break;
    }
  }
}
