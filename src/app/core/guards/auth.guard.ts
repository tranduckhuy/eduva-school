import { inject } from '@angular/core';

import { Router, CanMatchFn } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';

export const authGuard: CanMatchFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = authService.isLoggedIn();

  if (isLoggedIn) return true;

  router.navigateByUrl('/auth/login');
  return false;
};
