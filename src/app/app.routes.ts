import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { UserRoles } from './shared/constants/user-roles.constant';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./core/auth/auth.routes').then(mod => mod.authRoutes),
  },
  {
    path: 'teacher',
    canMatch: [authGuard, roleGuard],
    data: {
      roles: [UserRoles.TEACHER, UserRoles.CONTENT_MODERATOR],
    },
    loadChildren: () =>
      import('./features/teacher/teacher.routes').then(
        mod => mod.teacherRoutes
      ),
  },
  {
    path: 'school-admin',
    canMatch: [authGuard, roleGuard],
    data: {
      roles: [UserRoles.SCHOOL_ADMIN, UserRoles.SYSTEM_ADMIN],
    },
    loadChildren: () =>
      import('./features/school-admin/school-admin.routes').then(
        mod => mod.schoolAdminRoutes
      ),
  },
  {
    path: 'errors',
    loadChildren: () =>
      import('./shared/pages/errors/errors.routes').then(
        mod => mod.errorRoutes
      ),
  },
  { path: '**', redirectTo: '/errors/404' },
];
