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
        path: 'teachers',
        data: {
          heading: 'Danh sách giáo viên',
          breadcrumb: 'Danh sách giáo viên',
        },
        loadComponent: () =>
          import('./teachers/teachers.component').then(
            mod => mod.TeachersComponent
          ),
        children: [
          {
            path: 'teachers',
            loadChildren: () =>
              import('./teachers/teachers.routes').then(
                mod => mod.teachersRoute
              ),
          },
        ],
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
