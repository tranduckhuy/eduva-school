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
          breadcrumb: 'Quản lý bài giảng',
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
    children: [
      {
        path: 'generate-lesson',
        loadComponent: () =>
          import(
            './generate-lesson/generate-lesson-layout/generate-lesson-layout.component'
          ).then(mod => mod.GenerateLessonLayoutComponent),
      },
    ],
  },
];
