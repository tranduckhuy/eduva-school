import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TwoFactorService } from './two-factor.service';
import { AuthService } from './auth.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../shared/constants/status-code.constant';
import { ResendOtpPurpose } from '../models/request/resend-otp-request.model';

// Mock environment
vi.mock('../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let authService: AuthService;
  let userService: UserService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockAuthService = {
    handleLoginSuccess: vi.fn(),
  };

  const mockUserService = {
    updateCurrentUserPartial: vi.fn(),
  };

  const mockRequestService = {
    post: vi.fn(),
  };

  const mockToastHandlingService = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    errorGeneral: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        TwoFactorService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: RequestService, useValue: mockRequestService },
        { provide: ToastHandlingService, useValue: mockToastHandlingService },
      ],
    });

    service = TestBed.inject(TwoFactorService);
    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    requestService = TestBed.inject(RequestService);
    toastHandlingService = TestBed.inject(ToastHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestEnableDisable2FA', () => {
    const mockRequest = { currentPassword: 'password123' };

    it('should request enable 2FA successfully', async () => {
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.requestEnableDisable2FA(mockRequest, true).subscribe({
          next: () => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/security/request-disable-2fa',
              mockRequest,
              {
                bypassAuthError: true,
                loadingKey: 'password-modal',
              }
            );
            expect(mockToastHandlingService.success).toHaveBeenCalledWith(
              'Yêu cầu thành công',
              'Vui lòng kiểm tra hộp thư của bạn để xác nhận việc hủy xác thực hai bước.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should request disable 2FA successfully', async () => {
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.requestEnableDisable2FA(mockRequest, false).subscribe({
          next: () => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/security/request-enable-2fa',
              mockRequest,
              {
                bypassAuthError: true,
                loadingKey: 'password-modal',
              }
            );
            expect(mockToastHandlingService.success).toHaveBeenCalledWith(
              'Yêu cầu thành công',
              'Vui lòng kiểm tra hộp thư của bạn để xác nhận việc kích hoạt xác thực hai bước.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle request failure', async () => {
      const mockResponse = { statusCode: StatusCode.SYSTEM_ERROR };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.requestEnableDisable2FA(mockRequest, true).subscribe({
          next: () => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Đã xảy ra lỗi',
              'Không thể gửi yêu cầu hủy xác thực hai bước. Vui lòng thử lại sau.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle invalid credentials error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_CREDENTIALS },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.requestEnableDisable2FA(mockRequest, true).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: error => {
            expect(mockToastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo xác thực',
              'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra và thử lại.'
            );
            expect(error).toBe(mockError);
            resolve();
          },
        });
      });
    });

    it('should handle general error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.requestEnableDisable2FA(mockRequest, true).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: error => {
            expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(error).toBe(mockError);
            resolve();
          },
        });
      });
    });
  });

  describe('confirmEnableDisable2FA', () => {
    const mockRequest = { otpCode: '123456' };

    it('should confirm enable 2FA successfully', async () => {
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.confirmEnableDisable2FA(mockRequest, true).subscribe({
          next: () => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/security/confirm-disable-2fa',
              mockRequest,
              {
                bypassAuthError: true,
                loadingKey: 'otp-modal',
              }
            );
            expect(mockToastHandlingService.success).toHaveBeenCalledWith(
              'Xác nhận thành công',
              'Xác thực hai bước đã được hủy thành công cho tài khoản của bạn.'
            );
            expect(
              mockUserService.updateCurrentUserPartial
            ).toHaveBeenCalledWith({
              is2FAEnabled: false,
            });
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should confirm disable 2FA successfully', async () => {
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.confirmEnableDisable2FA(mockRequest, false).subscribe({
          next: () => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/security/confirm-enable-2fa',
              mockRequest,
              {
                bypassAuthError: true,
                loadingKey: 'otp-modal',
              }
            );
            expect(mockToastHandlingService.success).toHaveBeenCalledWith(
              'Xác nhận thành công',
              'Xác thực hai bước đã được kích hoạt thành công cho tài khoản của bạn.'
            );
            expect(
              mockUserService.updateCurrentUserPartial
            ).toHaveBeenCalledWith({
              is2FAEnabled: true,
            });
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle confirm failure', async () => {
      const mockResponse = { statusCode: StatusCode.SYSTEM_ERROR };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.confirmEnableDisable2FA(mockRequest, true).subscribe({
          next: () => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Thất bại',
              'Không thể hủy xác thực hai bước. Vui lòng thử lại sau.'
            );
            expect(
              mockUserService.updateCurrentUserPartial
            ).not.toHaveBeenCalled();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle confirm error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.OTP_INVALID_OR_EXPIRED },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.confirmEnableDisable2FA(mockRequest, true).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: error => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Lỗi xác thực',
              'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.'
            );
            expect(error).toBe(mockError);
            resolve();
          },
        });
      });
    });
  });

  describe('verifyTwoFactor', () => {
    const mockRequest = { otpCode: '123456', email: 'test@example.com' };
    const mockAuthData = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      expiresIn: 3600,
      requires2FA: false,
      email: 'test@example.com',
    };

    it('should verify 2FA successfully', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockAuthData,
      };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.verifyTwoFactor(mockRequest).subscribe({
          next: result => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/verify-otp-login',
              mockRequest,
              {
                bypassAuth: true,
                bypassAuthError: true,
              }
            );
            expect(mockAuthService.handleLoginSuccess).toHaveBeenCalledWith(
              mockAuthData
            );
            expect(result).toEqual(mockAuthData);
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle verification failure', async () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.verifyTwoFactor(mockRequest).subscribe({
          next: result => {
            expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(mockAuthService.handleLoginSuccess).not.toHaveBeenCalled();
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle verification error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.OTP_INVALID_OR_EXPIRED },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.verifyTwoFactor(mockRequest).subscribe({
          next: result => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Lỗi xác thực',
              'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.'
            );
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle user not exists error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.USER_NOT_EXISTS },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.verifyTwoFactor(mockRequest).subscribe({
          next: result => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Email không tồn tại',
              'Không tìm thấy tài khoản nào tương ứng với địa chỉ email của bạn.'
            );
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle general verification error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.verifyTwoFactor(mockRequest).subscribe({
          next: result => {
            expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });
  });

  describe('resendOtp', () => {
    const mockRequest = {
      email: 'test@example.com',
      purpose: ResendOtpPurpose.Login,
    };

    it('should resend OTP successfully', async () => {
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.resendOtp(mockRequest).subscribe({
          next: () => {
            expect(mockRequestService.post).toHaveBeenCalledWith(
              'http://localhost:3000/api/auth/resend-otp',
              mockRequest
            );
            expect(mockToastHandlingService.success).toHaveBeenCalledWith(
              'Yêu cầu đã được xử lý',
              'Một mã xác minh gồm 6 chữ số đã được gửi tới địa chỉ email của bạn. Vui lòng kiểm tra hộp thư để tiếp tục.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle resend failure', async () => {
      const mockResponse = { statusCode: StatusCode.SYSTEM_ERROR };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.resendOtp(mockRequest).subscribe({
          next: () => {
            expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle resend error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.OTP_INVALID_OR_EXPIRED },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.resendOtp(mockRequest).subscribe({
          next: () => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Lỗi xác thực',
              'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle user not exists error in resend', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.USER_NOT_EXISTS },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.resendOtp(mockRequest).subscribe({
          next: () => {
            expect(mockToastHandlingService.error).toHaveBeenCalledWith(
              'Email không tồn tại',
              'Không tìm thấy tài khoản nào tương ứng với địa chỉ email của bạn.'
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle general resend error', async () => {
      const mockError = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });
      mockRequestService.post.mockReturnValue(throwError(() => mockError));

      await new Promise<void>((resolve, reject) => {
        service.resendOtp(mockRequest).subscribe({
          next: () => {
            expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: reject,
        });
      });
    });
  });

  describe('Private helper functions coverage', () => {
    it('should handle extractAuthDataFromResponse with success', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { accessToken: 'token123' },
      };

      // Access private method through public method
      const mockRequest = { otpCode: '123456', email: 'test@example.com' };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.verifyTwoFactor(mockRequest).subscribe(result => {
        expect(result).toEqual({ accessToken: 'token123' });
      });
    });

    it('should handle extractAuthDataFromResponse with failure', () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };

      const mockRequest = { otpCode: '123456', email: 'test@example.com' };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.verifyTwoFactor(mockRequest).subscribe(result => {
        expect(result).toBeNull();
      });
    });

    it('should handle extractAuthDataFromResponse with no data', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      const mockRequest = { otpCode: '123456', email: 'test@example.com' };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.verifyTwoFactor(mockRequest).subscribe(result => {
        expect(result).toBeNull();
      });
    });
  });

  describe('Model coverage', () => {
    it('should handle RequestEnableDisable2FA model', () => {
      const request = { currentPassword: 'password123' };
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.requestEnableDisable2FA(request, true).subscribe();

      expect(mockRequestService.post).toHaveBeenCalledWith(
        expect.any(String),
        request,
        expect.any(Object)
      );
    });

    it('should handle ConfirmEnableDisable2FA model', () => {
      const request = { otpCode: '123456' };
      const mockResponse = { statusCode: StatusCode.SUCCESS };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.confirmEnableDisable2FA(request, true).subscribe();

      expect(mockRequestService.post).toHaveBeenCalledWith(
        expect.any(String),
        request,
        expect.any(Object)
      );
    });

    it('should handle VerifyOtpRequest model', () => {
      const request = { otpCode: '123456', email: 'test@example.com' };
      const mockResponse = { statusCode: StatusCode.SUCCESS, data: null };
      mockRequestService.post.mockReturnValue(of(mockResponse));

      service.verifyTwoFactor(request).subscribe();

      expect(mockRequestService.post).toHaveBeenCalledWith(
        expect.any(String),
        request,
        expect.any(Object)
      );
    });

    it('should handle ResendOtpRequest model with different purposes', () => {
      const purposes = [
        ResendOtpPurpose.Login,
        ResendOtpPurpose.Enable2FA,
        ResendOtpPurpose.Disable2Fa,
      ];

      purposes.forEach(purpose => {
        const request = { email: 'test@example.com', purpose };
        const mockResponse = { statusCode: StatusCode.SUCCESS };
        mockRequestService.post.mockReturnValue(of(mockResponse));

        service.resendOtp(request).subscribe();

        expect(mockRequestService.post).toHaveBeenCalledWith(
          expect.any(String),
          request
        );
      });
    });
  });
});
