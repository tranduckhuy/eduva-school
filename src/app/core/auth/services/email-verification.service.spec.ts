import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { EmailVerificationService } from './email-verification.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import { type ConfirmEmailRequest } from '../models/request/confirm-email-request.model';
import { type EmailLinkRequest } from '../models/request/email-link-request.model';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockConfirmEmailRequest: ConfirmEmailRequest = {
    email: 'test@example.com',
    token: 'mock-confirmation-token',
  };

  const mockEmailLinkRequest: EmailLinkRequest = {
    email: 'test@example.com',
    clientUrl: 'http://localhost:4200/auth/login',
  };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
      post: vi.fn(),
    } as any;

    toastHandlingService = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      errorGeneral: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        EmailVerificationService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });

    service = TestBed.inject(EmailVerificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmEmail', () => {
    it('should handle successful email confirmation', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email confirmed successfully' },
      };
      (requestService.get as any).mockReturnValue(of(mockResponse));

      await new Promise<void>(resolve => {
        service.confirmEmail(mockConfirmEmailRequest).subscribe({
          next: () => {
            expect(requestService.get).toHaveBeenCalledWith(
              expect.stringContaining('/auth/confirm-email'),
              mockConfirmEmailRequest
            );
            expect(toastHandlingService.success).toHaveBeenCalledWith(
              'Kích hoạt thành công',
              'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập để tiếp tục.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should handle email confirmation failure', async () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(mockResponse));

      await new Promise<void>(resolve => {
        service.confirmEmail(mockConfirmEmailRequest).subscribe({
          next: () => {
            expect(requestService.get).toHaveBeenCalledWith(
              expect.stringContaining('/auth/confirm-email'),
              mockConfirmEmailRequest
            );
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should handle HTTP error - token invalid or expired', async () => {
      const error = new HttpErrorResponse({
        error: {
          statusCode: StatusCode.CONFIRM_EMAIL_TOKEN_INVALID_OR_EXPIRED,
        },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      // Mock resendConfirmEmail to return success
      const mockResendResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };
      (requestService.post as any).mockReturnValue(of(mockResendResponse));

      await new Promise<void>(resolve => {
        service.confirmEmail(mockConfirmEmailRequest).subscribe({
          next: () => {
            expect(requestService.get).toHaveBeenCalledWith(
              expect.stringContaining('/auth/confirm-email'),
              mockConfirmEmailRequest
            );
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/resend-confirmation-email'),
              expect.objectContaining({
                email: mockConfirmEmailRequest.email,
                clientUrl: expect.any(String),
              })
            );
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Liên kết hết hạn',
              'Liên kết xác thực đã hết hạn. Một email xác thực mới đã được gửi lại cho bạn.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should handle HTTP error - general error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.confirmEmail(mockConfirmEmailRequest).subscribe({
          next: () => {
            expect(requestService.get).toHaveBeenCalledWith(
              expect.stringContaining('/auth/confirm-email'),
              mockConfirmEmailRequest
            );
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });

  describe('resendConfirmEmail', () => {
    it('should handle successful email resend with default toast', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };
      (requestService.post as any).mockReturnValue(of(mockResponse));

      await new Promise<void>(resolve => {
        service.resendConfirmEmail(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/resend-confirmation-email'),
              expect.objectContaining({
                email: mockEmailLinkRequest.email,
                clientUrl: expect.any(String),
              })
            );
            expect(toastHandlingService.success).toHaveBeenCalledWith(
              'Email đã được gửi lại',
              'Một liên kết xác thực mới đã được gửi tới địa chỉ email của bạn.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should handle successful email resend with custom success toast', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };
      (requestService.post as any).mockReturnValue(of(mockResponse));

      const customToastMessage = {
        title: 'Email xác minh đã được gửi lại',
        description: 'Vui lòng kiểm tra email của bạn để hoàn tất xác minh.',
      };

      await new Promise<void>(resolve => {
        service
          .resendConfirmEmail(mockEmailLinkRequest, customToastMessage)
          .subscribe({
            next: () => {
              expect(requestService.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/resend-confirmation-email'),
                expect.objectContaining({
                  email: mockEmailLinkRequest.email,
                  clientUrl: expect.any(String),
                })
              );
              expect(toastHandlingService.success).toHaveBeenCalledWith(
                customToastMessage.title,
                customToastMessage.description
              );
              resolve();
            },
            error: () => resolve(),
            complete: () => resolve(),
          });
      });
    });

    it('should handle successful email resend with warn toast', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };
      (requestService.post as any).mockReturnValue(of(mockResponse));

      const customToastMessage = {
        title: 'Cảnh báo',
        description: 'Email đã được gửi lại do lỗi trước đó.',
      };

      await new Promise<void>(resolve => {
        service
          .resendConfirmEmail(mockEmailLinkRequest, customToastMessage, 'warn')
          .subscribe({
            next: () => {
              expect(requestService.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/resend-confirmation-email'),
                expect.objectContaining({
                  email: mockEmailLinkRequest.email,
                  clientUrl: expect.any(String),
                })
              );
              expect(toastHandlingService.warn).toHaveBeenCalledWith(
                customToastMessage.title,
                customToastMessage.description
              );
              resolve();
            },
            error: () => resolve(),
            complete: () => resolve(),
          });
      });
    });

    it('should handle email resend failure', async () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };
      (requestService.post as any).mockReturnValue(of(mockResponse));

      await new Promise<void>(resolve => {
        service.resendConfirmEmail(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/resend-confirmation-email'),
              expect.objectContaining({
                email: mockEmailLinkRequest.email,
                clientUrl: expect.any(String),
              })
            );
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should handle HTTP error during email resend', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await new Promise<void>(resolve => {
        service.resendConfirmEmail(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/resend-confirmation-email'),
              expect.objectContaining({
                email: mockEmailLinkRequest.email,
                clientUrl: expect.any(String),
              })
            );
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });

    it('should include clientUrl in request payload', async () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };
      (requestService.post as any).mockReturnValue(of(mockResponse));

      await new Promise<void>(resolve => {
        service.resendConfirmEmail(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/resend-confirmation-email'),
              expect.objectContaining({
                email: mockEmailLinkRequest.email,
                clientUrl: expect.stringContaining('/auth/login'),
              })
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });

  describe('private helper functions', () => {
    it('should handle confirm email response with success', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email confirmed successfully' },
      };

      // Access private method through service instance
      const handleConfirmEmailResponse = (
        service as any
      ).handleConfirmEmailResponse.bind(service);
      handleConfirmEmailResponse(mockResponse);

      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Kích hoạt thành công',
        'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập để tiếp tục.'
      );
    });

    it('should handle confirm email response with error', () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };

      // Access private method through service instance
      const handleConfirmEmailResponse = (
        service as any
      ).handleConfirmEmailResponse.bind(service);
      handleConfirmEmailResponse(mockResponse);

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle resend email response with success and default toast', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };

      // Access private method through service instance
      const handleResendEmailResponse = (
        service as any
      ).handleResendEmailResponse.bind(service);
      handleResendEmailResponse(mockResponse);

      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Email đã được gửi lại',
        'Một liên kết xác thực mới đã được gửi tới địa chỉ email của bạn.'
      );
    });

    it('should handle resend email response with success and custom toast', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };

      const customToastMessage = {
        title: 'Custom Title',
        description: 'Custom Description',
      };

      // Access private method through service instance
      const handleResendEmailResponse = (
        service as any
      ).handleResendEmailResponse.bind(service);
      handleResendEmailResponse(mockResponse, customToastMessage, 'success');

      expect(toastHandlingService.success).toHaveBeenCalledWith(
        customToastMessage.title,
        customToastMessage.description
      );
    });

    it('should handle resend email response with success and warn toast', () => {
      const mockResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { message: 'Email resent successfully' },
      };

      const customToastMessage = {
        title: 'Warning Title',
        description: 'Warning Description',
      };

      // Access private method through service instance
      const handleResendEmailResponse = (
        service as any
      ).handleResendEmailResponse.bind(service);
      handleResendEmailResponse(mockResponse, customToastMessage, 'warn');

      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        customToastMessage.title,
        customToastMessage.description
      );
    });

    it('should handle resend email response with error', () => {
      const mockResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };

      // Access private method through service instance
      const handleResendEmailResponse = (
        service as any
      ).handleResendEmailResponse.bind(service);
      handleResendEmailResponse(mockResponse);

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });
});
