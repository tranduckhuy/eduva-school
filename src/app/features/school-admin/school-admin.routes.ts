import { Routes } from '@angular/router';

export const schoolAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../core/layout/main-layout/main-layout.component').then(
        (mod) => mod.MainLayoutComponent,
      ),
    children: [
      {
        path: 'schools',
        loadComponent: () =>
          import('./schools/schools.component').then(
            (mod) => mod.SchoolsComponent,
          ),
        data: {
          heading: 'School List',
          breadcrumb: 'Schools',
        },
      },
      {
        path: 'schools/:schoolId',
        loadComponent: () =>
          import('./schools/school/school.component').then(
            (mod) => mod.SchoolComponent,
          ),
        data: {
          heading: 'School Detail',
          breadcrumb: 'School Detail',
        },
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('../../core/layout/blank-layout/blank-layout.component').then(
        (mod) => mod.BlankLayoutComponent,
      ),
    children: [],
  },
];
