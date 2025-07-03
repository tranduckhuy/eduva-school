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
  {
    path: ':materialId',
    loadComponent: () =>
      import(
        '../../../shared/components/lesson-details/preview-lesson/preview-lesson.component'
      ).then(mod => mod.PreviewLessonComponent),
    data: {
      heading: 'Kiểm duyệt nội dung',
      breadcrumb: 'Kiểm duyệt nội dung',
    },
  },
];
