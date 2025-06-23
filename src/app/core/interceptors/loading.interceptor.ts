import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { finalize } from 'rxjs';

import { LoadingService } from '../../shared/services/core/loading/loading.service';

import {
  SHOW_LOADING,
  LOADING_KEY,
} from '../../shared/services/core/request/request.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const shouldShow = req.context.get(SHOW_LOADING);
  const key = req.context.get(LOADING_KEY);

  if (shouldShow) loadingService.start(key);

  return next(req).pipe(
    finalize(() => {
      if (shouldShow) loadingService.stop(key);
    })
  );
};
