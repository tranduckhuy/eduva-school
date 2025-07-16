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
        loadComponent: () =>
          import('./moderate-lessons/moderate-lessons.component').then(
            mod => mod.ModerateLessonsComponent
          ),
      },
      {
        path: 'view-lesson/:materialId',
        loadComponent: () =>
          import(
            '../../shared/components/lesson-details/preview-lesson/preview-lesson.component'
          ).then(mod => mod.PreviewLessonComponent),
      },
    ],
  },
];
