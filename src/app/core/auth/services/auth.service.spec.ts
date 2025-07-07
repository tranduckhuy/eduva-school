import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { EmailVerificationService } from './email-verification.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';
import { GlobalModalService } from '../../../shared/services/layout/global-modal/global-modal.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';
import { UserRoles } from '../../../shared/constants/user-roles.constant';

import { type LoginRequest } from '../pages/login/models/login-request.model';
import { type RefreshTokenRequest } from '../models/request/refresh-token-request.model';
import { type AuthTokenResponse } from '../models/response/auth-response.model';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let jwtService: JwtService;
  let userService: UserService;
  let emailVerificationService: EmailVerificationService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;
  let globalModalService: GlobalModalService;

  const mockAuthTokenResponse: AuthTokenResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    requires2FA: false,
    email: 'test@example.com',
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    roles: [UserRoles.SCHOOL_ADMIN],
  };

  beforeEach(() => {
    router = {
      navigateByUrl: vi.fn(),
      navigate: vi.fn(),
    } as any;
    jwtService = {
      getAccessToken: vi.fn(),
      setAccessToken: vi.fn(),
      setRefreshToken: vi.fn(),
      setExpiresDate: vi.fn(),
      clearAll: vi.fn(),
    } as any;
    userService = {
      getCurrentProfile: vi.fn().mockReturnValue(of(mockUser)),
      clearCurrentUser: vi.fn(),
    } as any;
    emailVerificationService = {
      resendConfirmEmail: vi.fn().mockReturnValue(of(void 0)),
    } as any;
    requestService = {
      post: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
      error: vi.fn(),
    } as any;
    globalModalService = {
      close: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: router },
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
        {
          provide: EmailVerificationService,
          useValue: emailVerificationService,
        },
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
        { provide: GlobalModalService, useValue: globalModalService },
      ],
    });
    service = TestBed.inject(AuthService);

    // Setup default mock for getAccessToken
    (jwtService.getAccessToken as any).mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const mockLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle successful login', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: mockAuthTokenResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toEqual(mockAuthTokenResponse);
          expect(jwtService.setAccessToken).toHaveBeenCalledWith(
            mockAuthTokenResponse.accessToken
          );
          expect(jwtService.setRefreshToken).toHaveBeenCalledWith(
            mockAuthTokenResponse.refreshToken
          );
          expect(jwtService.setExpiresDate).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle OTP verification required', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.REQUIRES_OTP_VERIFICATION,
          data: mockAuthTokenResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toEqual(mockAuthTokenResponse);
          expect(router.navigate).toHaveBeenCalledWith(
            ['/auth/otp-confirmation'],
            { queryParams: { email: mockAuthTokenResponse.email } }
          );
          resolve();
        });
      });
    });

    it('should handle login failure with no status code', async () => {
      (requestService.post as any).mockReturnValue(of({ data: null }));
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle login failure with unknown status code', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: 'UNKNOWN_STATUS',
          data: mockAuthTokenResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error - user not exists', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: { statusCode: StatusCode.USER_NOT_EXISTS },
            })
        )
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Đăng nhập thất bại',
            'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
          );
          resolve();
        });
      });
    });

    it('should handle HTTP error - invalid credentials', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: { statusCode: StatusCode.INVALID_CREDENTIALS },
            })
        )
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Đăng nhập thất bại',
            'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
          );
          resolve();
        });
      });
    });

    it('should handle HTTP error - user not confirmed', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: { statusCode: StatusCode.USER_NOT_CONFIRMED },
            })
        )
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Đăng nhập thất bại',
            'Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email để hoàn tất xác minh.'
          );
          expect(
            emailVerificationService.resendConfirmEmail
          ).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error - user account locked', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: { statusCode: StatusCode.USER_ACCOUNT_LOCKED },
            })
        )
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Đăng nhập thất bại',
            'Tài khoản của bạn đã bị vô hiệu hóa.'
          );
          resolve();
        });
      });
    });

    it('should handle HTTP error - default case', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new HttpErrorResponse({}))
      );
      await new Promise<void>(resolve => {
        service.login(mockLoginRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('refreshToken', () => {
    const mockRefreshTokenRequest: RefreshTokenRequest = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    it('should handle successful token refresh', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: mockAuthTokenResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.refreshToken(mockRefreshTokenRequest).subscribe(result => {
          expect(result).toEqual(mockAuthTokenResponse);
          expect(jwtService.setAccessToken).toHaveBeenCalledWith(
            mockAuthTokenResponse.accessToken
          );
          expect(jwtService.setRefreshToken).toHaveBeenCalledWith(
            mockAuthTokenResponse.refreshToken
          );
          expect(jwtService.setExpiresDate).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle failed token refresh', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: null,
        })
      );
      await new Promise<void>(resolve => {
        service.refreshToken(mockRefreshTokenRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(jwtService.clearAll).toHaveBeenCalled();
          expect(userService.clearCurrentUser).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle refresh token HTTP error', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.refreshToken(mockRefreshTokenRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(jwtService.clearAll).toHaveBeenCalled();
          expect(userService.clearCurrentUser).toHaveBeenCalled();
          expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
          resolve();
        });
      });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      vi.spyOn(window, 'dispatchEvent');
      vi.spyOn(localStorage, 'removeItem');
    });

    it('should handle successful logout', async () => {
      (requestService.post as any).mockReturnValue(of({}));

      await new Promise<void>(resolve => {
        service.logout().subscribe({
          next: () => resolve(),
          error: () => resolve(),
          complete: () => resolve(),
        });
      });

      expect(jwtService.clearAll).toHaveBeenCalled();
      expect(userService.clearCurrentUser).toHaveBeenCalled();
      expect(globalModalService.close).toHaveBeenCalled();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event('close-all-submenus')
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login', {
        replaceUrl: true,
      });
    });

    it('should handle logout HTTP error', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      // Use Promise to handle the observable properly
      await new Promise<void>(resolve => {
        service.logout().subscribe({
          next: () => resolve(),
          error: () => resolve(),
          complete: () => resolve(),
        });
      });

      expect(jwtService.clearAll).toHaveBeenCalled();
      expect(userService.clearCurrentUser).toHaveBeenCalled();
      expect(globalModalService.close).toHaveBeenCalled();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event('close-all-submenus')
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login', {
        replaceUrl: true,
      });
    });
  });

  describe('redirectUserAfterLogin', () => {
    it('should redirect SchoolAdmin to /school-admin', () => {
      (userService.getCurrentProfile as any).mockReturnValue(
        of({ ...mockUser, roles: [UserRoles.SCHOOL_ADMIN] })
      );
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/school-admin', {
        replaceUrl: true,
      });
    });
    it('should redirect Teacher to /teacher', () => {
      (userService.getCurrentProfile as any).mockReturnValue(
        of({ ...mockUser, roles: [UserRoles.TEACHER] })
      );
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/teacher', {
        replaceUrl: true,
      });
    });
    it('should redirect ContentModerator to /teacher', () => {
      (userService.getCurrentProfile as any).mockReturnValue(
        of({ ...mockUser, roles: [UserRoles.CONTENT_MODERATOR] })
      );
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/teacher', {
        replaceUrl: true,
      });
    });
    it('should redirect Student to 403 error page and clear session', async () => {
      (userService.getCurrentProfile as any).mockReturnValue(
        of({ ...mockUser, roles: [UserRoles.STUDENT] })
      );
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/errors/403');

      // Wait for setTimeout to execute clearSession
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(jwtService.clearAll).toHaveBeenCalled();
      expect(userService.clearCurrentUser).toHaveBeenCalled();
    });
    it('should handle user profile fetch error', () => {
      (userService.getCurrentProfile as any).mockReturnValue(of(null));
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
    it('should redirect to default path for unknown role', () => {
      (userService.getCurrentProfile as any).mockReturnValue(
        of({ ...mockUser, roles: ['UnknownRole'] })
      );
      service['handleLoginSuccess'](mockAuthTokenResponse);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/school-admin', {
        replaceUrl: true,
      });
    });
  });

  describe('isLoggedIn signal', () => {
    it('should return true when access token exists', () => {
      (jwtService.getAccessToken as any).mockReturnValue('valid-token');

      // Recreate service after mocking to ensure signal gets correct initial value
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: Router, useValue: router },
          { provide: JwtService, useValue: jwtService },
          { provide: UserService, useValue: userService },
          {
            provide: EmailVerificationService,
            useValue: emailVerificationService,
          },
          { provide: RequestService, useValue: requestService },
          { provide: ToastHandlingService, useValue: toastHandlingService },
          { provide: GlobalModalService, useValue: globalModalService },
          AuthService,
        ],
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.isLoggedIn()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      // Mock before creating service
      (jwtService.getAccessToken as any).mockReturnValue(null);

      // Create new service instance with updated mock
      const newService = TestBed.inject(AuthService);
      expect(newService.isLoggedIn()).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('should clear all session data', () => {
      service['clearSession']();
      expect(jwtService.clearAll).toHaveBeenCalled();
      expect(userService.clearCurrentUser).toHaveBeenCalled();
    });
  });
});
