import { Routes } from '@angular/router';
import { PricingComponent } from './pricing/pricing.component';

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
        path: 'pricing',
        component: PricingComponent,
      },
    ],
  },
];
