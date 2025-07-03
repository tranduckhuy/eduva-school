import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const scalingDuration = 1000;
  const maxDelay = 3000;

  const attemptRequest = (retryCount: number): Observable<any> => {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const shouldRetry =
          retryCount < maxRetries &&
          (error.status === 0 || error.status >= 500);

        if (!shouldRetry) {
          return throwError(() => error);
        }

        const delayTime = Math.min(
          (retryCount + 1) * scalingDuration,
          maxDelay
        );
        return timer(delayTime).pipe(
          mergeMap(() => attemptRequest(retryCount + 1))
        );
      })
    );
  };

  return attemptRequest(0);
};
