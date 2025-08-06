import { Routes } from '@angular/router';

export const moderationRoutes: Routes = [
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
          title: 'Kiểm duyệt nội dung',
          heading: 'Kiểm duyệt nội dung',
          breadcrumb: 'Kiểm duyệt nội dung',
        },
        loadComponent: () =>
          import('./moderate-lessons/moderate-lessons.component').then(
            mod => mod.ModerateLessonsComponent
          ),
      },
      {
        path: 'view-lesson/:materialId',
        data: {
          title: 'Chi tiết bài giảng',
          heading: 'Chi tiết bài giảng',
          breadcrumb: 'Chi tiết bài giảng',
        },
        loadComponent: () =>
          import(
            '../../shared/components/lesson-details/preview-lesson/preview-lesson.component'
          ).then(mod => mod.PreviewLessonComponent),
      },
    ],
  },
];
