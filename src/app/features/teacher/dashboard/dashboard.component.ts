import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { StatCardComponent } from './stat-card/stat-card.component';
import { LessonCreationComponent } from './lesson-creation/lesson-creation.component';
import { UserService } from '../../../shared/services/api/user/user.service';
import { DashboardService } from '../../../shared/services/api/dashboard/dashboard.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';
import { UserRoles } from '../../../shared/constants/user-roles.constant';
import { ContentTypeStatsComponent } from './content-type-stats/content-type-stats.component';
import { ReviewLessonsComponent } from './review-lessons/review-lessons.component';
import { RecentLessonsComponent } from './recent-lessons/recent-lessons.component';
import { UnanswerQuestionsComponent } from './unanswer-questions/unanswer-questions.component';
import { QuestionVolumeTrendComponent } from './question-volume-trend/question-volume-trend.component';

interface StatCard {
  title: string;
  description: string;
  value: number;
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
    ContentTypeStatsComponent,
    ReviewLessonsComponent,
    RecentLessonsComponent,
    UnanswerQuestionsComponent,
    QuestionVolumeTrendComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dashboardService = inject(DashboardService);
  private readonly loadingService = inject(LoadingService);

  readonly dashboardData = this.dashboardService.dashboardTeacherData;
  readonly currentUser = this.userService.currentUser;
  readonly isLoadingDashboard = this.loadingService.is('dashboard');

  isTeacher = this.currentUser()?.roles?.includes(UserRoles.TEACHER);

  studentsStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: 'Học sinh',
      description: 'Số lượng học sinh',
      value: data?.systemOverview.totalStudents ?? 0,
      icon: 'group',
      iconColor: 'text-primary',
    };
  });
  classesStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: 'Lớp học',
      description: 'Số lượng lớp học',
      value: data?.systemOverview.totalClasses ?? 0,
      icon: 'class',
      iconColor: 'text-primary',
    };
  });
  lessonsStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
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
  storageStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: 'Dung lượng (GB)',
      description: 'Dung lượng đã sử dụng',
      value: data?.systemOverview.usedStorageGB ?? 0,
      icon: 'database',
      unit: 'GB',
      iconColor: 'text-danger',
    };
  });
  remainCreditPointsStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: 'Credit còn lại',
      description: 'Số lượng credit còn lại',
      value: data?.systemOverview.remainCreditPoints ?? 0,
      imageIcon: true,
      icon: 'credit_score',
      iconColor: 'text-warning',
    };
  });
  pricingPlanRevenueStatCard = signal<StatCard>({
    title: 'Credit',
    description: 'Doanh thu credit theo tháng',
    value: 20000000,
    icon: 'paid',
    isRevenue: true,
    iconColor: 'text-warning',
  });
  pendingLessonStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: this.isTeacher
        ? 'Bài học chờ kiểm duyệt'
        : 'Bài học chưa kiểm duyệt',
      description: this.isTeacher
        ? 'Số lượng bài học chờ kiểm duyệt'
        : 'Số lượng bài học chưa kiểm duyệt',
      value: data?.systemOverview.totalPendingLessons ?? 0,
      icon: 'timer',
      iconColor: 'text-warning',
    };
  });
  unAnswerQuestionStatCard = computed<StatCard>(() => {
    const data = this.dashboardData();
    return {
      title: 'Câu hỏi chưa trả lời',
      description: 'Số lượng câu hỏi chưa trả lời',
      value: data?.systemOverview.unansweredQuestions ?? 0,
      icon: 'question_answer',
      iconColor: 'text-warning',
    };
  });

  ngOnInit(): void {
    this.dashboardService.getTeacherDashboardData({}).subscribe();
  }
}
