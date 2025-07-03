import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { ToastHandlingService } from '../../shared/services/core/toast/toast-handling.service';

export const requireQueryParamsGuard = (
  requiredParams: string[]
): CanActivateFn => {
  return route => {
    const router = inject(Router);
    const toastHandlingService = inject(ToastHandlingService);

    const queryParams = route.queryParams;
    const missingParams = requiredParams.filter(p => !queryParams?.[p]);

    if (missingParams.length > 0) {
      toastHandlingService.errorGeneral();
      router.navigateByUrl('/auth/login');
      return false;
    }

    return true;
  };
};
