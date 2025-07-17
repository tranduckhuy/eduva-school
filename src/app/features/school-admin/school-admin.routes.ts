import { Routes } from '@angular/router';

export const schoolAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../core/layout/main-layout/main-layout.component').then(
        mod => mod.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        data: {
          heading: 'Bảng thống kê',
        },
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            mod => mod.DashboardComponent
          ),
      },
      {
        path: 'teachers',
        loadChildren: () =>
          import('./teachers/teachers.routes').then(mod => mod.teachersRoute),
      },
      {
        path: 'students',
        loadChildren: () =>
          import('./students/students.routes').then(mod => mod.studentsRoute),
      },
      {
        path: 'content-moderators',
        loadChildren: () =>
          import('./content-moderators/content-moderators.routes').then(
            mod => mod.contentModeratorsRoute
          ),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./payments/payment.routes').then(mod => mod.paymentRoute),
      },
      {
        path: 'view-lesson/:materialId',
        data: {
          title: 'Chi tiết bài học',
        },
        loadComponent: () =>
          import(
            '../../shared/components/lesson-details/preview-lesson/preview-lesson.component'
          ).then(mod => mod.PreviewLessonComponent),
      },
      {
        path: 'shared-lessons',
        loadComponent: () =>
          import(
            '../../shared/pages/shared-lessons/shared-lessons.component'
          ).then(mod => mod.SharedLessonsComponent),
      },
      {
        path: 'subscription-plans',
        loadComponent: () =>
          import('./subscription-plan/subscription-plan.component').then(
            mod => mod.SubscriptionPlanComponent
          ),
      },
      {
        path: 'add-school-information/:subscriptionId',
        data: {
          heading: 'Thanh toán',
          breadcrumb: 'Thanh toán',
        },
        loadComponent: () =>
          import(
            './subscription-plan/add-school-information/add-school-information.component'
          ).then(mod => mod.AddSchoolInformationComponent),
      },
      {
        path: 'settings',
        data: {
          breadcrumb: 'Cài đặt',
        },
        loadComponent: () =>
          import(
            '../../shared/pages/settings-page/settings-page-layout/settings-page-layout.component'
          ).then(mod => mod.SettingsPageLayoutComponent),
        loadChildren: () =>
          import('../../shared/pages/settings-page/settings-page.routes').then(
            mod => mod.settingRoutes
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('../../core/layout/blank-layout/blank-layout.component').then(
        mod => mod.BlankLayoutComponent
      ),
    children: [],
  },
];
