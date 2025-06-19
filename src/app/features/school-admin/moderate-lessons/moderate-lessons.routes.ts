import { Routes } from '@angular/router';

export const moderateLessonsRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./moderate-lessons.component').then(
        mod => mod.ModerateLessonsComponent
      ),
    data: {
      heading: 'Danh sách kiểm duyệt',
      breadcrumb: 'Danh sách kiểm duyệt',
    },
  },
];
