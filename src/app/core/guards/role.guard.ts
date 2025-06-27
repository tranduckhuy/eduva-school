import { inject } from '@angular/core';

import { Router, CanMatchFn } from '@angular/router';

import { UserService } from '../../shared/services/api/user/user.service';

import {
  UserRole,
  UserRoles,
} from '../../shared/constants/user-roles.constant';

export const roleGuard: CanMatchFn = route => {
  const userService = inject(UserService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;
  const user = userService.currentUser();

  const isLoggedIn =
    !!user && Array.isArray(user.roles) && user.roles.length > 0;
  if (!isLoggedIn) {
    router.navigate(['/auth/login']);
    return false;
  }

  const hasExpectedRole = expectedRoles?.some(role =>
    user.roles.includes(role)
  );
  if (hasExpectedRole) return true;

  const isTeacherOrModerator = user.roles.some(
    role => role === UserRoles.TEACHER || role === UserRoles.CONTENT_MODERATOR
  );

  const fallbackPath = isTeacherOrModerator ? '/teacher' : '/school-admin';
  router.navigate([fallbackPath]);

  return false;
};
