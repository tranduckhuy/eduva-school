import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, switchMap } from 'rxjs';

import { JwtService } from '../auth/services/jwt.service';
import { AuthService } from '../auth/services/auth.service';
import { BYPASS_AUTH } from '../../shared/services/core/request/request.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);

  const accessToken = jwtService.getAccessToken();
  const refreshToken = jwtService.getRefreshToken();
  const expiresAt = jwtService.getExpiresDate();
  const isExpired =
    expiresAt !== null && Date.now() >= new Date(expiresAt).getTime();

  if (req.context.get(BYPASS_AUTH)) {
    return next(req);
  }

  // ? If access token is still valid → attach to request header and proceed the request
  if (accessToken && !isExpired) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next(req);
  }

  // ? If token has expired → attempt to refresh it before sending the request
  if (accessToken && refreshToken) {
    return authService.refreshToken({ accessToken, refreshToken }).pipe(
      switchMap(res => {
        if (!res) return next(req);

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${res.accessToken}`,
          },
        });
        return next(cloned);
      }),
      catchError(() => {
        // ? If refresh throws an error → fallback to sending the original request as-is
        // ? Note: AuthService already handles clearing tokens and redirecting if needed
        return next(req);
      })
    );
  }

  // ? If no token is available → proceed with the request (e.g., for public endpoints)
  return next(req);
};
