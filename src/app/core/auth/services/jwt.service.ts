import { Injectable, inject } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXPIRES_DATE_KEY,
} from '../../../shared/constants/jwt.constant';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private readonly cookieService = inject(CookieService);

  getAccessToken(): string | null {
    return this.cookieService.get(ACCESS_TOKEN_KEY) || null;
  }

  setAccessToken(accessToken: string): void {
    this.cookieService.set(
      ACCESS_TOKEN_KEY,
      accessToken,
      undefined,
      '/',
      undefined,
      true,
      'Strict'
    );
  }

  removeToken(): void {
    this.cookieService.delete(ACCESS_TOKEN_KEY, '/');
  }

  getRefreshToken(): string | null {
    return this.cookieService.get(REFRESH_TOKEN_KEY) || null;
  }

  setRefreshToken(refreshToken: string): void {
    this.cookieService.set(
      REFRESH_TOKEN_KEY,
      refreshToken,
      undefined,
      '/',
      undefined,
      true,
      'Strict'
    );
  }

  removeRefreshToken(): void {
    this.cookieService.delete(REFRESH_TOKEN_KEY, '/');
  }

  getExpiresDate(): string | null {
    return this.cookieService.get(EXPIRES_DATE_KEY) || null;
  }

  setExpiresDate(expiresDate: string): void {
    this.cookieService.set(
      EXPIRES_DATE_KEY,
      expiresDate,
      undefined,
      '/',
      undefined,
      true,
      'Strict'
    );
  }

  removeExpiredDate(): void {
    this.cookieService.delete(EXPIRES_DATE_KEY, '/');
  }

  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeExpiredDate();
  }
}
