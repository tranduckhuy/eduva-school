import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, switchMap, throwError } from 'rxjs';

import { JwtService } from '../auth/services/jwt.service';
import { AuthService } from '../auth/services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('refresh-token')) {
        const refreshToken = jwtService.getRefreshToken?.();
        if (!refreshToken) return throwError(() => error);

        return authService.refreshToken(refreshToken).pipe(
          switchMap(newToken => {
            jwtService.setToken(newToken);
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(cloned);
          }),
          catchError(() => {
            jwtService.removeToken();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
