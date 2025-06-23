import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { LoggingService } from '../../shared/services/core/logging/logging.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const loggingService = inject(LoggingService);
  const start = performance.now();

  loggingService.info(`→ Start Request: ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const end = performance.now();
        const durationSec = ((end - start) / 1000).toFixed(2);

        loggingService.info(
          `✔ End Request: ${req.method} ${req.urlWithParams} - ${event.status} (${durationSec}s)`
        );
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const end = performance.now();
      const durationSec = ((end - start) / 1000).toFixed(2);

      if (error.status >= 500) {
        loggingService.fatal(
          `✖ End Request (Server Error): ${req.method} ${req.urlWithParams} - ${error.status} (${durationSec}s)`,
          error
        );
      } else {
        loggingService.error(
          `✖ End Request (HTTP Error): ${req.method} ${req.urlWithParams} - ${error.status} (${durationSec}s)`,
          error
        );
      }

      return throwError(() => error); // Throw error for errorInterceptor handle
    })
  );
};
