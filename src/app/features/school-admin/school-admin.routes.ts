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
        loadChildren: () =>
          import('./teachers/teachers.routes').then(mod => mod.teachersRoute),
      },
      {
        path: 'students',
        loadChildren: () =>
          import('./students/students.routes').then(mod => mod.studentsRoute),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./invoices/invoices.routes').then(mod => mod.invoicesRoute),
      },
      {
        path: 'lessons',
        loadChildren: () =>
          import('./lessons/lessons.routes').then(mod => mod.lessonsRoute),
      },
      {
        path: 'moderate-lessons',
        loadChildren: () =>
          import('./moderate-lessons/moderate-lessons.routes').then(
            mod => mod.moderateLessonsRoute
          ),
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
