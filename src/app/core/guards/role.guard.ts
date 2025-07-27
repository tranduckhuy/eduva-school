import { inject } from '@angular/core';

import { Router, CanMatchFn } from '@angular/router';

import { UserService } from '../../shared/services/api/user/user.service';

import {
  type UserRoleType,
  UserRoles,
} from '../../shared/constants/user-roles.constant';

export const roleGuard: CanMatchFn = route => {
  const userService = inject(UserService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as UserRoleType[] | undefined;
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

  // ? If the user has the required role(s), allow access to the route
  if (hasExpectedRole) return true;

  // ? If the user does NOT have the required role(s),
  // ? redirect them to their role-specific dashboard
  if (
    user.roles.includes(UserRoles.TEACHER) ||
    user.roles.includes(UserRoles.CONTENT_MODERATOR)
  ) {
    router.navigate(['/teacher']);
  } else if (
    user.roles.includes(UserRoles.SCHOOL_ADMIN) ||
    user.roles.includes(UserRoles.SYSTEM_ADMIN)
  ) {
    router.navigate(['/school-admin']);
  } else {
    router.navigate(['/unauthorized']);
  }

  return false;
};
