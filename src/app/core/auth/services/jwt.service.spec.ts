import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { JwtService } from './jwt.service';
import { CookieService } from 'ngx-cookie-service';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXPIRES_DATE_KEY,
} from '../../../shared/constants/jwt.constant';

describe('JwtService', () => {
  let service: JwtService;
  let cookieService: CookieService;

  const mockAccessToken = 'mock-access-token-123';
  const mockRefreshToken = 'mock-refresh-token-456';
  const mockExpiresDate = '2024-12-31T23:59:59.999Z';

  beforeEach(() => {
    cookieService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        JwtService,
        { provide: CookieService, useValue: cookieService },
      ],
    });

    service = TestBed.inject(JwtService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAccessToken', () => {
    it('should return access token when it exists', () => {
      (cookieService.get as any).mockReturnValue(mockAccessToken);

      const result = service.getAccessToken();

      expect(cookieService.get).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(result).toBe(mockAccessToken);
    });

    it('should return null when access token does not exist', () => {
      (cookieService.get as any).mockReturnValue('');

      const result = service.getAccessToken();

      expect(cookieService.get).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(result).toBeNull();
    });

    it('should return null when cookie service returns undefined', () => {
      (cookieService.get as any).mockReturnValue(undefined);

      const result = service.getAccessToken();

      expect(cookieService.get).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(result).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('should set access token with correct parameters', () => {
      service.setAccessToken(mockAccessToken);

      expect(cookieService.set).toHaveBeenCalledWith(
        ACCESS_TOKEN_KEY,
        mockAccessToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });

    it('should set access token with different token value', () => {
      const differentToken = 'different-access-token';
      service.setAccessToken(differentToken);

      expect(cookieService.set).toHaveBeenCalledWith(
        ACCESS_TOKEN_KEY,
        differentToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });
  });

  describe('removeToken', () => {
    it('should delete access token from cookies', () => {
      service.removeToken();

      expect(cookieService.delete).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, '/');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when it exists', () => {
      (cookieService.get as any).mockReturnValue(mockRefreshToken);

      const result = service.getRefreshToken();

      expect(cookieService.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(result).toBe(mockRefreshToken);
    });

    it('should return null when refresh token does not exist', () => {
      (cookieService.get as any).mockReturnValue('');

      const result = service.getRefreshToken();

      expect(cookieService.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(result).toBeNull();
    });

    it('should return null when cookie service returns undefined', () => {
      (cookieService.get as any).mockReturnValue(undefined);

      const result = service.getRefreshToken();

      expect(cookieService.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(result).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should set refresh token with correct parameters', () => {
      service.setRefreshToken(mockRefreshToken);

      expect(cookieService.set).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        mockRefreshToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });

    it('should set refresh token with different token value', () => {
      const differentToken = 'different-refresh-token';
      service.setRefreshToken(differentToken);

      expect(cookieService.set).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        differentToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });
  });

  describe('removeRefreshToken', () => {
    it('should delete refresh token from cookies', () => {
      service.removeRefreshToken();

      expect(cookieService.delete).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, '/');
    });
  });

  describe('getExpiresDate', () => {
    it('should return expires date when it exists', () => {
      (cookieService.get as any).mockReturnValue(mockExpiresDate);

      const result = service.getExpiresDate();

      expect(cookieService.get).toHaveBeenCalledWith(EXPIRES_DATE_KEY);
      expect(result).toBe(mockExpiresDate);
    });

    it('should return null when expires date does not exist', () => {
      (cookieService.get as any).mockReturnValue('');

      const result = service.getExpiresDate();

      expect(cookieService.get).toHaveBeenCalledWith(EXPIRES_DATE_KEY);
      expect(result).toBeNull();
    });

    it('should return null when cookie service returns undefined', () => {
      (cookieService.get as any).mockReturnValue(undefined);

      const result = service.getExpiresDate();

      expect(cookieService.get).toHaveBeenCalledWith(EXPIRES_DATE_KEY);
      expect(result).toBeNull();
    });
  });

  describe('setExpiresDate', () => {
    it('should set expires date with correct parameters', () => {
      service.setExpiresDate(mockExpiresDate);

      expect(cookieService.set).toHaveBeenCalledWith(
        EXPIRES_DATE_KEY,
        mockExpiresDate,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });

    it('should set expires date with different date value', () => {
      const differentDate = '2025-01-01T00:00:00.000Z';
      service.setExpiresDate(differentDate);

      expect(cookieService.set).toHaveBeenCalledWith(
        EXPIRES_DATE_KEY,
        differentDate,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
    });
  });

  describe('removeExpiredDate', () => {
    it('should delete expires date from cookies', () => {
      service.removeExpiredDate();

      expect(cookieService.delete).toHaveBeenCalledWith(EXPIRES_DATE_KEY, '/');
    });
  });

  describe('clearAll', () => {
    it('should remove all tokens and expires date', () => {
      service.clearAll();

      expect(cookieService.delete).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, '/');
      expect(cookieService.delete).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, '/');
      expect(cookieService.delete).toHaveBeenCalledWith(EXPIRES_DATE_KEY, '/');
      expect(cookieService.delete).toHaveBeenCalledTimes(3);
    });

    it('should call removeToken, removeRefreshToken, and removeExpiredDate', () => {
      const removeTokenSpy = vi.spyOn(service, 'removeToken');
      const removeRefreshTokenSpy = vi.spyOn(service, 'removeRefreshToken');
      const removeExpiredDateSpy = vi.spyOn(service, 'removeExpiredDate');

      service.clearAll();

      expect(removeTokenSpy).toHaveBeenCalled();
      expect(removeRefreshTokenSpy).toHaveBeenCalled();
      expect(removeExpiredDateSpy).toHaveBeenCalled();
    });
  });

  describe('integration tests', () => {
    it('should handle complete token lifecycle', () => {
      // Set tokens
      service.setAccessToken(mockAccessToken);
      service.setRefreshToken(mockRefreshToken);
      service.setExpiresDate(mockExpiresDate);

      // Verify set calls
      expect(cookieService.set).toHaveBeenCalledWith(
        ACCESS_TOKEN_KEY,
        mockAccessToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
      expect(cookieService.set).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        mockRefreshToken,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );
      expect(cookieService.set).toHaveBeenCalledWith(
        EXPIRES_DATE_KEY,
        mockExpiresDate,
        undefined,
        '/',
        undefined,
        true,
        'Strict'
      );

      // Mock get calls for retrieval
      (cookieService.get as any)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken)
        .mockReturnValueOnce(mockExpiresDate);

      // Get tokens
      const accessToken = service.getAccessToken();
      const refreshToken = service.getRefreshToken();
      const expiresDate = service.getExpiresDate();

      // Verify get calls
      expect(cookieService.get).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(cookieService.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(cookieService.get).toHaveBeenCalledWith(EXPIRES_DATE_KEY);

      // Verify returned values
      expect(accessToken).toBe(mockAccessToken);
      expect(refreshToken).toBe(mockRefreshToken);
      expect(expiresDate).toBe(mockExpiresDate);

      // Clear all
      service.clearAll();

      // Verify delete calls
      expect(cookieService.delete).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, '/');
      expect(cookieService.delete).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, '/');
      expect(cookieService.delete).toHaveBeenCalledWith(EXPIRES_DATE_KEY, '/');
    });

    it('should handle empty token scenario', () => {
      // Mock empty responses
      (cookieService.get as any)
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      // Get tokens when they don't exist
      const accessToken = service.getAccessToken();
      const refreshToken = service.getRefreshToken();
      const expiresDate = service.getExpiresDate();

      // Verify all return null
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(expiresDate).toBeNull();
    });

    it('should handle undefined token scenario', () => {
      // Mock undefined responses
      (cookieService.get as any)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined);

      // Get tokens when they don't exist
      const accessToken = service.getAccessToken();
      const refreshToken = service.getRefreshToken();
      const expiresDate = service.getExpiresDate();

      // Verify all return null
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(expiresDate).toBeNull();
    });
  });

  describe('cookie security settings', () => {
    it('should set cookies with secure and strict settings', () => {
      service.setAccessToken(mockAccessToken);
      service.setRefreshToken(mockRefreshToken);
      service.setExpiresDate(mockExpiresDate);

      // Verify all set calls use secure and strict settings
      const setCalls = (cookieService.set as any).mock.calls;

      setCalls.forEach((call: any[]) => {
        expect(call[5]).toBe(true); // secure flag
        expect(call[6]).toBe('Strict'); // sameSite
        expect(call[3]).toBe('/'); // path
      });
    });
  });
});
