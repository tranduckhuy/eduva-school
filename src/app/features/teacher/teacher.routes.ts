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
