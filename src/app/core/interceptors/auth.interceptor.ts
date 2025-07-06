import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { ReplaySubject, catchError, switchMap, take, throwError } from 'rxjs';

import { JwtService } from '../auth/services/jwt.service';
import { AuthService } from '../auth/services/auth.service';

import { BYPASS_AUTH } from '../../shared/tokens/context/http-context.token';

let isRefreshing = false;
let isSessionInvalidated = false;
let refreshSubject: ReplaySubject<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);

  const isByPass = req.context.get(BYPASS_AUTH);

  const handleWith = (request: HttpRequest<unknown>) => {
    if (isSessionInvalidated) {
      return throwError(() => new Error('Session already invalidated.'));
    }

    return next(request).pipe(
      catchError(err => {
        if (err.status === 401 && !isByPass) {
          isSessionInvalidated = true;
        }
        return throwError(() => err);
      })
    );
  };

  const accessToken = jwtService.getAccessToken();
  const refreshToken = jwtService.getRefreshToken();
  const expiresAt = jwtService.getExpiresDate();
  const isExpired =
    expiresAt !== null && Date.now() >= new Date(expiresAt).getTime();
  if (isByPass) return handleWith(req);

  // ? If access token is still valid → attach to request header and proceed the request
  if (accessToken && !isExpired) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleWith(cloned);
  }

  // ? If token has expired → attempt to refresh it before sending the request
  if (accessToken && refreshToken) {
    // ? If another refresh is already in progress → wait for it
    if (isRefreshing) {
      return refreshSubject!.pipe(
        take(1),
        switchMap(newAccessToken => {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
          return handleWith(cloned);
        }),
        catchError(err => throwError(() => err))
      );
    }

    isRefreshing = true;
    refreshSubject = new ReplaySubject<string>(1);

    return authService.refreshToken({ accessToken, refreshToken }).pipe(
      switchMap(res => {
        if (!res) {
          refreshSubject!.complete();
          return throwError(() => new Error('Refresh token failed'));
        } // ? If refresh fails, throw error for error interceptor handle

        // ? Tokens are already updated inside AuthService
        const newAccessToken = jwtService.getAccessToken();

        // ? Notify all queued requests with new token
        refreshSubject!.next(newAccessToken!);
        refreshSubject!.complete();
        isRefreshing = false;

        // ? Retry original request with new token
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        return handleWith(cloned);
      }),
      catchError(err => {
        isRefreshing = false;
        refreshSubject?.error(err);
        refreshSubject?.complete();

        return throwError(() => err);
      })
    );
  }

  // ? If no token is available → proceed with the request (e.g., for public endpoints)
  return handleWith(req);
};
