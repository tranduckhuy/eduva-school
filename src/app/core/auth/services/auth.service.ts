import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { JwtService } from './jwt.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import { type LoginRequest } from '../pages/login/models/login-request.model';
import { type RefreshTokenRequest } from '../models/refresh-token-request.model';

import { type AuthTokenResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly jwtService = inject(JwtService);
  private readonly userService = inject(UserService);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly LOGIN_API_URL = `${this.BASE_API_URL}/auth/login`;
  private readonly REFRESH_TOKEN_API_URL = `${this.BASE_API_URL}/auth/refresh-token`;
  private readonly LOGOUT_API_URL = `${this.BASE_API_URL}/auth/logout`;

  private readonly isLoggedInSignal = signal<boolean>(
    !!this.jwtService.getAccessToken()
  );
  isLoggedIn = this.isLoggedInSignal.asReadonly();

  login(request: LoginRequest): Observable<AuthTokenResponse | null> {
    return this.requestService
      .post<AuthTokenResponse>(this.LOGIN_API_URL, request, {
        bypassAuth: true,
        showLoading: false,
      })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            const { accessToken, refreshToken, expiresIn } = res.data;

            this.jwtService.setAccessToken(accessToken);
            this.jwtService.setRefreshToken(refreshToken);
            this.jwtService.setExpiresDate(
              new Date(Date.now() + expiresIn * 1000).toISOString()
            );
            this.isLoggedInSignal.set(true);

            // ? Call UserProfile API for redirect by role
            this.userService.getCurrentProfile().subscribe(user => {
              if (!user) {
                this.toastHandlingService.errorGeneral();
                return;
              }

              if (user.roles.includes('SystemAdmin')) {
                this.router.navigateByUrl('/');
              }
            });

            return res.data;
          } else {
            this.toastHandlingService.errorGeneral();
            return null;
          }
        }),
        catchError((err: HttpErrorResponse) => {
          switch (err.error.statusCode) {
            case StatusCode.USER_NOT_EXISTS:
            case StatusCode.INVALID_CREDENTIALS:
              this.toastHandlingService.error(
                'Đăng nhập thất bại',
                'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
              );
              break;
            case StatusCode.USER_NOT_CONFIRMED:
              this.toastHandlingService.error(
                'Đăng nhập thất bại',
                'Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email để hoàn tất xác minh.'
              );
              break;
            case StatusCode.USER_ACCOUNT_LOCKED:
              this.toastHandlingService.error(
                'Đăng nhập thất bại',
                'Tài khoản của bạn đã bị vô hiệu hóa.'
              );
              break;
            default:
              this.toastHandlingService.errorGeneral();
          }
          return of(null);
        })
      );
  }

  refreshToken(
    request: RefreshTokenRequest
  ): Observable<AuthTokenResponse | null> {
    return this.requestService
      .post<AuthTokenResponse>(this.REFRESH_TOKEN_API_URL, request, {
        bypassAuth: true,
        showLoading: false,
      })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            const { accessToken, refreshToken, expiresIn } = res.data;

            this.jwtService.setAccessToken(accessToken);
            this.jwtService.setRefreshToken(refreshToken);
            this.jwtService.setExpiresDate(
              new Date(Date.now() + expiresIn * 1000).toISOString()
            );

            return res.data;
          }

          this.jwtService.clearAll();
          return null;
        }),
        catchError(() => {
          this.jwtService.clearAll();
          this.router.navigateByUrl('/auth/login');
          return of(null);
        })
      );
  }

  logout(): Observable<void> {
    return this.requestService.post(this.LOGOUT_API_URL).pipe(
      tap(() => {
        this.jwtService.clearAll();
        this.isLoggedInSignal.set(false);
        this.router.navigateByUrl('/auth/login', {
          replaceUrl: true,
        });
      }),
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }
}
