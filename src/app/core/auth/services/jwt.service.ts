import { Injectable, inject } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';

import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../../../shared/constants/token.constants';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private readonly cookieService = inject(CookieService);

  getToken(): string | null {
    return this.cookieService.get(TOKEN_KEY) || null;
  }

  setToken(token: string): void {
    this.cookieService.set(
      TOKEN_KEY,
      token,
      undefined,
      '/',
      undefined,
      true,
      'Strict'
    );
  }

  removeToken(): void {
    this.cookieService.delete(TOKEN_KEY, '/');
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

  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}
