import { inject } from '@angular/core';
import { Router, CanMatchFn } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../../shared/services/api/user/user.service';

import {
  UserRole,
  UserRoles,
} from '../../shared/constants/user-roles.constant';

export const redirectAuthenticatedGuard: CanMatchFn = route => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  const user = userService.currentUser();

  if (isLoggedIn && user) {
    const routeRoles = route.data?.['roles'] as UserRole[] | undefined;
    const teacherRoles = [
      UserRoles.TEACHER,
      UserRoles.CONTENT_MODERATOR,
    ] as UserRole[];
    const isTeacher = routeRoles?.some(role => teacherRoles.includes(role));

    const target = isTeacher ? '/teacher' : '/school-admin';
    router.navigate([target]);
    return false;
  }

  return true;
};
