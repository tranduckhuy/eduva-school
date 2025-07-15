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
        loadComponent: () =>
          import('./generate-lesson-main/generate-lesson-main.component').then(
            mod => mod.GenerateLessonMainComponent
          ),
      },
      {
        path: 'generate-lesson-saved',
        loadComponent: () =>
          import(
            './generate-lesson-saved/generate-lesson-saved.component'
          ).then(mod => mod.GenerateLessonSavedComponent),
      },
    ],
  },
];
