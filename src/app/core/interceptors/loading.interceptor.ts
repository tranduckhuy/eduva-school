import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { finalize } from 'rxjs';

import { LoadingService } from '../../shared/services/core/loading/loading.service';

import { SHOW_LOADING } from '../../shared/services/core/request/request.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const shouldShow = req.context.get(SHOW_LOADING);

  if (shouldShow) loadingService.start();

  return next(req).pipe(
    finalize(() => {
      if (shouldShow) loadingService.stop();
    })
  );
};
