import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
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
        path: 'file-manager',
        data: {
          breadcrumb: 'Quản lý thư mục',
        },
        loadComponent: () =>
          import(
            './file-manager/file-manager-layout/file-manager-layout.component'
          ).then(mod => mod.FileManagerLayoutComponent),
        loadChildren: () =>
          import('./file-manager/file-manager.routes').then(
            mod => mod.fileManagerRoutes
          ),
      },
      {
        path: 'class-management',
        data: {
          title: 'Danh sách lớp học',
          heading: 'Quản lý lớp học',
          breadcrumb: 'Danh sách lớp học',
        },
        loadComponent: () =>
          import('./class-management/class-management.component').then(
            mod => mod.ClassManagementComponent
          ),
      },
      {
        path: 'class-management/:classId',
        data: {
          title: 'Chi tiết lớp học',
          heading: 'Chi tiết lớp học',
          breadcrumb: 'Chi tiết lớp học',
        },
        loadComponent: () =>
          import('./class-management/class-detail/class-detail.component').then(
            mod => mod.ClassDetailComponent
          ),
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
        data: {
          title: 'Bài học chia sẻ trong trường',
        },
        loadComponent: () =>
          import(
            '../../shared/pages/shared-lessons/shared-lessons.component'
          ).then(mod => mod.SharedLessonsComponent),
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
      {
        path: 'credit-pack',
        loadComponent: () =>
          import('./credit-pack/credit-pack.component').then(
            mod => mod.CreditPackComponent
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
    children: [
      {
        path: 'generate-lesson',
        loadChildren: () =>
          import('./generate-lesson/generate-lesson.routes').then(
            mod => mod.generateLessonRoutes
          ),
      },
    ],
  },
];
