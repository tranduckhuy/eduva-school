import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { StatCardComponent } from './stat-card/stat-card.component';
import { UserRegistrationTrendComponent } from './user-registration-trend/user-registration-trend.component';
import { LessonCreationComponent } from './lesson-creation/lesson-creation.component';
import { RevenueTrendComponent } from './revenue-trend/revenue-trend.component';
import { TopActiveSchoolsComponent } from './top-active-schools/top-active-schools.component';

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
    UserRegistrationTrendComponent,
    LessonCreationComponent,
    RevenueTrendComponent,
    TopActiveSchoolsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  usersStatCard = signal<StatCard>({
    title: 'Người dùng',
    description: 'Số lượng người dùng',
    value: 5301,
    icon: 'group',
    iconColor: 'text-primary',
    subItems: [
      { title: 'School Admins', value: 50 },
      { title: 'Giáo viên', value: 1000 },
      { title: 'Học sinh', value: 4251 },
    ],
  });
  lessonsStatCard = signal<StatCard>({
    title: 'Bài học',
    description: 'Số lượng bài học',
    value: 5000,
    icon: 'book_ribbon',
    iconColor: 'text-success',
    subItems: [
      { title: 'Bài học được tải lên', value: 3000 },
      { title: 'Bài học tạo bằng AI', value: 2000 },
    ],
  });
  storageStatCard = signal<StatCard>({
    title: 'Dung lượng',
    description: 'Dung lượng đã sử dụng',
    value: 5000,
    icon: 'database',
    compareValue: 8000,
    unit: 'GB',
    iconColor: 'text-danger',
  });
  schoolsStatCard = signal<StatCard>({
    title: 'Trường học',
    description: 'Số lượng trường học',
    value: 50,
    icon: 'school',
    iconColor: 'text-danger',
  });
  pricingPlanRevenueStatCard = signal<StatCard>({
    title: 'Credit',
    description: 'Doanh thu credit theo tháng',
    value: 20000000,
    icon: 'paid',
    isRevenue: true,
    iconColor: 'text-warning',
  });
}
