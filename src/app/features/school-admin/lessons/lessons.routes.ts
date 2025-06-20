import { Routes } from '@angular/router';

export const lessonsRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lessons.component').then(mod => mod.LessonsComponent),
    data: {
      heading: 'Danh sách bài học',
      breadcrumb: 'Danh sách bài học',
    },
  },
];
