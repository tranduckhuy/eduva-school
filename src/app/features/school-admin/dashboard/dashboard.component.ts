import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { UserService } from '../../../shared/services/api/user/user.service';
import { PaymentService } from '../../../shared/services/api/payment/payment.service';

import { StatCardComponent } from './stat-card/stat-card.component';
import { LessonCreationComponent } from './lesson-creation/lesson-creation.component';
import { TopTeachersComponent } from './top-teachers/top-teachers.component';
import { type ConfirmPaymentReturnRequest } from '../../../shared/models/api/request/query/confirm-payment-return-request.model';
import { DashboardService } from '../../../shared/services/api/dashboard/dashboard.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';
import { ReviewLessonsComponent } from './review-lessons/review-lessons.component';
import { ContentTypeStatsComponent } from './content-type-stats/content-type-stats.component';
import { LessonStatusStatsComponent } from './lesson-status-stats/lesson-status-stats.component';
import { PeriodType } from '../../../shared/models/enum/period-type.enum';

interface StatCard {
  title: string;
  description: string;
  value: number | string;
  compareValue?: number;
  unit?: string;
  isRevenue?: boolean;
  icon: string;
  iconColor: string;
  subItems?: SubItem[];
}

interface SubItem {
  title: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    LessonCreationComponent,
    TopTeachersComponent,
    CurrencyPipe,
    DatePipe,
    ReviewLessonsComponent,
    ContentTypeStatsComponent,
    LessonStatusStatsComponent,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);
  private readonly dashboardService = inject(DashboardService);
  private readonly loadingService = inject(LoadingService);

  readonly dashboardSchoolAdminData =
    this.dashboardService.dashboardSchoolAdminData;
  readonly isLoadingDashboard = this.loadingService.is('dashboard');

  readonly usersStatCard = computed<StatCard>(() => {
    const data = this.dashboardSchoolAdminData();
    return {
      title: 'Người dùng',
      description: 'Số lượng người dùng',
      value:
        (data?.systemOverview.totalUsers ?? 0) -
        (data?.systemOverview.schoolAdmin ?? 0),
      icon: 'group',
      iconColor: 'text-primary',
      subItems: [
        {
          title: 'Giáo viên',
          value: data?.systemOverview.teachers ?? 0,
        },
        {
          title: 'Kiểm duyệt viên',
          value: data?.systemOverview.contentModerators ?? 0,
        },
        { title: 'Học sinh', value: data?.systemOverview.students ?? 0 },
      ],
    };
  });

  readonly lessonsStatCard = computed<StatCard>(() => {
    const data = this.dashboardSchoolAdminData();
    return {
      title: 'Bài học',
      description: 'Số lượng bài học',
      value: data?.systemOverview.totalLessons ?? 0,
      icon: 'book_ribbon',
      iconColor: 'text-success',
      subItems: [
        {
          title: 'Bài học được tải lên',
          value: data?.systemOverview.uploadedLessons ?? 0,
        },
        {
          title: 'Bài học tạo bằng AI',
          value: data?.systemOverview.aiGeneratedLessons ?? 0,
        },
      ],
    };
  });

  readonly classesStatCard = computed<StatCard>(() => {
    const data = this.dashboardSchoolAdminData();
    return {
      title: 'Lớp học',
      description: 'Số lượng lớp học',
      value: data?.systemOverview.classes ?? 0,
      icon: 'class',
      iconColor: 'text-danger',
    };
  });

  readonly storageStatCard = computed<StatCard>(() => {
    const data = this.dashboardSchoolAdminData();
    return {
      title: 'Dung lượng (GB)',
      description: 'Dung lượng đã sử dụng',
      value: data?.systemOverview.usedStorageGB ?? 0,
      compareValue: data?.systemOverview.currentSubscription.maxStorageGB ?? 0,
      icon: 'database',
      unit: 'GB',
      iconColor: 'text-danger',
    };
  });

  readonly subscriptionStatCard = computed<StatCard>(() => {
    const data = this.dashboardSchoolAdminData();
    return {
      title: 'Gói đăng ký',
      description: 'Gói đăng ký hiện tại',
      value: data?.systemOverview.currentSubscription.name ?? '',
      icon: 'request_quote',
      iconColor: 'text-warning',
    };
  });

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const { code, id, status, orderCode } = params;
      if (code && id && status && orderCode) {
        const confirmRequest: ConfirmPaymentReturnRequest = {
          code,
          id,
          status,
          orderCode: +orderCode,
        };
        this.paymentService.confirmPaymentReturn(confirmRequest).subscribe({
          complete: () => {
            this.userService.getCurrentProfile().subscribe();
          },
        });
      }
    });

    this.dashboardService
      .getDashboardSchoolAdminData({ lessonStatusPeriod: PeriodType.Week })
      .subscribe();
  }
}
