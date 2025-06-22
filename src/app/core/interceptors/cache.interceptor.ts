import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { of, tap } from 'rxjs';

import { CacheService } from '../../shared/services/core/cache/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);

  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    return of(new HttpResponse({ status: 200, body: cached }));
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event.body);
      }
    })
  );
};
