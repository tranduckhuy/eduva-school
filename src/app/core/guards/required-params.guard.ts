import { inject } from '@angular/core';
import { Router, CanMatchFn } from '@angular/router';

import { ToastHandlingService } from '../../shared/services/core/toast/toast-handling.service';

export const requireQueryParamsGuard = (
  requiredParams: string[]
): CanMatchFn => {
  return () => {
    const router = inject(Router);
    const toastHandlingService = inject(ToastHandlingService);

    const urlTree = router.parseUrl(router.url);
    const queryParams = urlTree.queryParams;

    const missingParams = requiredParams.filter(p => !queryParams[p]);

    if (missingParams.length > 0) {
      toastHandlingService.errorGeneral();
      router.navigateByUrl('/auth/login');
      return false;
    }

    return true;
  };
};
