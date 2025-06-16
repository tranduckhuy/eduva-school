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
        path: 'schools',
        data: {
          heading: 'School List',
          breadcrumb: 'Schools',
        },
        loadComponent: () =>
          import('./schools/schools.component').then(
            mod => mod.SchoolsComponent
          ),
        children: [
          {
            path: ':schoolId',
            data: {
              heading: 'School Detail',
              breadcrumb: 'School Detail',
            },
            loadComponent: () =>
              import('./schools/school/school.component').then(
                mod => mod.SchoolComponent
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
