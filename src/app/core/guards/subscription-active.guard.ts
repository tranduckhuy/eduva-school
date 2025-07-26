import { inject } from '@angular/core';
import { Router, CanMatchFn } from '@angular/router';

import { UserService } from '../../shared/services/api/user/user.service';

import { type UserRoleType } from '../../shared/constants/user-roles.constant';

export const subscriptionActiveGuard: CanMatchFn = route => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.currentUser();
  const routeRoles = route.data?.['roles'] as UserRoleType[] | undefined;

  const isProtectedUser = routeRoles?.some(role => user?.roles.includes(role));
  const isSubscriptionActive =
    user?.userSubscriptionResponse?.isSubscriptionActive;

  if (isProtectedUser && !isSubscriptionActive) {
    router.navigate(['/errors/subscription-expired']);
    return false;
  }

  return true;
};
