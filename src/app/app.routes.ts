import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./core/auth/auth.routes').then(mod => mod.authRoutes),
  },
  {
    path: 'school-admin',
    loadChildren: () =>
      import('./features/school-admin/school-admin.routes').then(
        mod => mod.schoolAdminRoutes
      ),
  },
];
