import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { ReplaySubject, catchError, switchMap, take } from 'rxjs';

import { JwtService } from '../auth/services/jwt.service';
import { AuthService } from '../auth/services/auth.service';

import { BYPASS_AUTH } from '../../shared/tokens/context/http-context.token';

let isRefreshing = false;
let refreshSubject: ReplaySubject<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);

  const accessToken = jwtService.getAccessToken();
  const refreshToken = jwtService.getRefreshToken();
  const expiresAt = jwtService.getExpiresDate();
  const isExpired =
    expiresAt !== null && Date.now() >= new Date(expiresAt).getTime();

  const isByPass = req.context.get(BYPASS_AUTH);
  if (isByPass) return next(req);

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
          return next(cloned);
        }),
        catchError(() => {
          // ? If the refresh process fails for some reason, fallback to sending original request
          return next(req);
        })
      );
    }

    isRefreshing = true;
    refreshSubject = new ReplaySubject<string>(1);

    return authService.refreshToken({ accessToken, refreshToken }).pipe(
      switchMap(res => {
        if (!res) return next(req); // ? If refresh fails, proceed as-is

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

        return next(cloned);
      }),
      catchError(err => {
        // ? Refresh failed (token expired, invalid, etc.)
        isRefreshing = false;
        refreshSubject!.error(err); // ? Notify waiting requests of failure
        refreshSubject!.complete();
        return next(req); // ? Proceed without token (likely to get 401)
      })
    );
  }

  // ? If no token is available → proceed with the request (e.g., for public endpoints)
  return next(req);
};
