import { Routes } from '@angular/router';

export const errorRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../../core/layout/blank-layout/blank-layout.component').then(
        mod => mod.BlankLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./errors-layout/errors-layout.component').then(
            mod => mod.ErrorsLayoutComponent
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: '404',
          },
          {
            path: '500',
            loadComponent: () =>
              import('./internal-error/internal-error.component').then(
                mod => mod.InternalErrorComponent
              ),
          },
          {
            path: '404',
            loadComponent: () =>
              import('./not-found-error/not-found-error.component').then(
                mod => mod.NotFoundErrorComponent
              ),
          },
          {
            path: '403',
            loadComponent: () =>
              import('./unauthorized-error/unauthorized-error.component').then(
                mod => mod.UnauthorizedErrorComponent
              ),
          },
          {
            path: '429',
            loadComponent: () =>
              import(
                './too-many-request-error/too-many-request-error.component'
              ).then(mod => mod.TooManyRequestErrorComponent),
          },
          {
            path: 'coming-soon',
            loadComponent: () =>
              import('./coming-soon/coming-soon.component').then(
                mod => mod.ComingSoonComponent
              ),
          },
        ],
      },
    ],
  },
];
