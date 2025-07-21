import { Routes } from '@angular/router';

export const generateLessonRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./generate-lesson-layout/generate-lesson-layout.component').then(
        mod => mod.GenerateLessonLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'generated',
      },
      {
        path: 'generated',
        loadComponent: () =>
          import(
            './generate-lesson-completed/generate-lesson-completed.component'
          ).then(mod => mod.GenerateLessonCompletedComponent),
      },
      {
        path: 'generate',
        loadComponent: () =>
          import('./generate-lesson-main/generate-lesson-main.component').then(
            mod => mod.GenerateLessonMainComponent
          ),
      },
      {
        path: 'generate/:jobId',
        loadComponent: () =>
          import('./generate-lesson-main/generate-lesson-main.component').then(
            mod => mod.GenerateLessonMainComponent
          ),
      },
    ],
  },
];
