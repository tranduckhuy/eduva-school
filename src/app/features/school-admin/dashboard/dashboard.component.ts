import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { catchError, finalize, forkJoin, map, of, switchMap, take } from 'rxjs';

import { UserService } from '../../../shared/services/api/user/user.service';
import { PaymentService } from '../../../shared/services/api/payment/payment.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';
import { DashboardService } from '../../../shared/services/api/dashboard/dashboard.service';

import { clearQueryParams } from '../../../shared/utils/util-functions';

import { PeriodType } from '../../../shared/models/enum/period-type.enum';

import { StatCardComponent } from './stat-card/stat-card.component';
import { LessonCreationComponent } from './lesson-creation/lesson-creation.component';
import { TopTeachersComponent } from './top-teachers/top-teachers.component';
import { ReviewLessonsComponent } from './review-lessons/review-lessons.component';
import { ContentTypeStatsComponent } from './content-type-stats/content-type-stats.component';
import { LessonStatusStatsComponent } from './lesson-status-stats/lesson-status-stats.component';

import { type DashboardRequest } from '../../../shared/models/api/request/query/dashboard-request.model';
import { type ConfirmPaymentReturnRequest } from '../../../shared/models/api/request/query/confirm-payment-return-request.model';

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

interface SubscriptionDisplayInfo {
  hasSubscription: boolean;
  displayText: string;
  amountPaid: number;
  price: number;
  startDate: string | null;
  endDate: string | null;
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
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);
  private readonly dashboardService = inject(DashboardService);
  private readonly loadingService = inject(LoadingService);

  readonly currentUser = this.userService.currentUser;
  readonly isLoadingDashboard = this.loadingService.is('dashboard');
  readonly dashboardSchoolAdminData =
    this.dashboardService.dashboardSchoolAdminData;

  readonly currentLessonCreationPeriod = signal<PeriodType>(PeriodType.Week);
  readonly currentLessonStatusPeriod = signal<PeriodType>(PeriodType.Week);

  readonly schoolMissing = computed(() => !this.currentUser()?.school);

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
    const displayInfo = this.subscriptionDisplayInfo();
    return {
      title: 'Gói đăng ký',
      description: 'Gói đăng ký hiện tại',
      value: displayInfo.displayText,
      icon: 'request_quote',
      iconColor: 'text-warning',
    };
  });

  readonly subscriptionDisplayInfo = computed<SubscriptionDisplayInfo>(() => {
    const data = this.dashboardSchoolAdminData();
    const subscription = data?.systemOverview.currentSubscription;

    if (!subscription) {
      return {
        hasSubscription: false,
        displayText: 'Chưa có gói',
        amountPaid: 0,
        price: 0,
        startDate: null,
        endDate: null,
      };
    }

    const amountPaid = subscription.amountPaid ?? 0;
    const price = subscription.price ?? 0;
    const startDate = subscription.startDate;
    const endDate = subscription.endDate;

    if (amountPaid <= 0 || price <= 0) {
      return {
        hasSubscription: false,
        displayText: 'Chưa có gói',
        amountPaid: 0,
        price: 0,
        startDate: null,
        endDate: null,
      };
    }

    const isValidDate = (dateString: string | null | undefined): boolean => {
      if (!dateString) return false;
      const date = new Date(dateString);
      return date.getFullYear() > 1 && date.getTime() > 0;
    };

    const hasValidStartDate = isValidDate(startDate);
    const hasValidEndDate = isValidDate(endDate);

    if (!hasValidStartDate || !hasValidEndDate) {
      return {
        hasSubscription: false,
        displayText: 'Chưa có gói',
        amountPaid: 0,
        price: 0,
        startDate: null,
        endDate: null,
      };
    }

    return {
      hasSubscription: true,
      displayText: subscription.name,
      amountPaid,
      price,
      startDate,
      endDate,
    };
  });

  ngOnInit(): void {
    this.handleRouteQueryParams();
  }

  onLessonCreationPeriodChange(period: PeriodType) {
    this.currentLessonCreationPeriod.set(period);
    this.loadData();
  }

  onLessonStatusPeriodChange(period: PeriodType) {
    this.currentLessonStatusPeriod.set(period);
    this.loadData();
  }

  private loadData() {
    const user = this.currentUser();
    const hasSchool = !this.schoolMissing();

    if (!user || !hasSchool) return;

    const request: DashboardRequest = {
      lessonActivityPeriod: this.currentLessonCreationPeriod(),
      lessonStatusPeriod: this.currentLessonStatusPeriod(),
    };
    this.dashboardService.getDashboardSchoolAdminData(request).subscribe();
  }

  private handleRouteQueryParams() {
    this.activatedRoute.queryParams
      .pipe(
        take(1),
        map(params => {
          const { code, id, status, orderCode } = params ?? {};
          if (!code || !id || !status || !orderCode) return null;
          const req: ConfirmPaymentReturnRequest = {
            code,
            id,
            status,
            orderCode: +orderCode,
          };
          return req;
        }),
        switchMap(req => {
          if (!req) {
            this.loadData();
            return of(null);
          }
          const dashboardReq: DashboardRequest = {
            lessonActivityPeriod: this.currentLessonCreationPeriod(),
            lessonStatusPeriod: this.currentLessonStatusPeriod(),
          };
          const loadDashboard$ =
            this.dashboardService.getDashboardSchoolAdminData(dashboardReq);

          return this.paymentService.confirmPaymentReturn(req).pipe(
            switchMap(() => this.paymentService.refreshTokenAfterConfirm()),
            switchMap(() =>
              forkJoin([loadDashboard$, this.userService.getCurrentProfile()])
            ),
            catchError(() => loadDashboard$)
          );
        }),
        finalize(() => {
          clearQueryParams(this.router, this.activatedRoute, [
            'code',
            'id',
            'cancel',
            'status',
            'orderCode',
          ]);
        })
      )
      .subscribe();
  }
}
