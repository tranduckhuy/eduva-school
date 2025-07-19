import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { PasswordService } from './password.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../shared/constants/status-code.constant';
import { type EmailLinkRequest } from '../models/request/email-link-request.model';
import { type ResetPasswordRequest } from '../pages/reset-password/models/reset-password-request.model';
import { type ChangePasswordRequest } from '../../../shared/models/api/request/command/change-password-request.model';

describe('PasswordService', () => {
  let service: PasswordService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockEmailLinkRequest: EmailLinkRequest = {
    email: 'test@example.com',
    clientUrl: 'http://localhost:4200/auth/reset-password',
  };
  const mockResetPasswordRequest: ResetPasswordRequest = {
    email: 'test@example.com',
    password: 'newPassword123',
    confirmPassword: 'newPassword123',
    token: 'reset-token',
  };
  const mockChangePasswordRequest: ChangePasswordRequest = {
    currentPassword: 'oldPass',
    newPassword: 'newPass',
    confirmPassword: 'newPass',
    logoutBehavior: 0,
  };

  beforeEach(() => {
    requestService = {
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
        PasswordService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(PasswordService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('forgotPassword', () => {
    it('should handle successful forgot password', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.forgotPassword(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/forgot-password'),
              expect.objectContaining({
                email: mockEmailLinkRequest.email,
                clientUrl: expect.any(String),
              })
            );
            expect(toastHandlingService.success).toHaveBeenCalledWith(
              'Thành công',
              expect.stringContaining('Liên kết đặt lại mật khẩu')
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle forgot password error (user not exists)', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.USER_NOT_EXISTS },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.forgotPassword(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Email không tồn tại',
              'Vui lòng kiểm tra lại địa chỉ email.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle forgot password error (general)', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.forgotPassword(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle forgot password response with error', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );
      await new Promise<void>(resolve => {
        service.forgotPassword(mockEmailLinkRequest).subscribe({
          next: () => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'Không thể gửi yêu cầu',
              expect.stringContaining('Có lỗi xảy ra khi gửi liên kết')
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });

  describe('resetPassword', () => {
    it('should handle successful reset password', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.resetPassword(mockResetPasswordRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/reset-password'),
              mockResetPasswordRequest,
              { bypassAuth: true }
            );
            expect(toastHandlingService.success).toHaveBeenCalledWith(
              'Thành công',
              'Mật khẩu của bạn đã được đặt lại.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle reset password error - invalid token', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_TOKEN },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.resetPassword(mockResetPasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'Liên kết hết hạn',
              'Vui lòng gửi lại yêu cầu đặt lại mật khẩu mới.'
            );
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle reset password error - new password same as old', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.NEW_PASSWORD_SAME_AS_OLD },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.resetPassword(mockResetPasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo',
              'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
            );
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle reset password error - general', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.resetPassword(mockResetPasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle reset password response with error', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );
      await new Promise<void>(resolve => {
        service.resetPassword(mockResetPasswordRequest).subscribe({
          next: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });

  describe('changePassword', () => {
    it('should handle successful change password', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.changePassword(mockChangePasswordRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/change-password'),
              mockChangePasswordRequest,
              expect.objectContaining({ loadingKey: 'change-password-form' })
            );
            expect(toastHandlingService.success).toHaveBeenCalledWith(
              'Thành công',
              'Mật khẩu của bạn đã được đặt lại.'
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle change password error - incorrect current password', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INCORRECT_CURRENT_PASSWORD },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.changePassword(mockChangePasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo xác thực',
              'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra và thử lại.'
            );
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle change password error - new password same as old', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.NEW_PASSWORD_SAME_AS_OLD },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.changePassword(mockChangePasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo xác thực',
              'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
            );
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle change password error - general', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.changePassword(mockChangePasswordRequest).subscribe({
          error: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          next: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
    it('should handle change password response with error', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );
      await new Promise<void>(resolve => {
        service.changePassword(mockChangePasswordRequest).subscribe({
          next: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });

  describe('private helpers', () => {
    it('should handleForgotPasswordResponse success', () => {
      (service as any).handleForgotPasswordResponse({
        statusCode: StatusCode.SUCCESS,
      });
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Thành công',
        expect.stringContaining('Liên kết đặt lại mật khẩu')
      );
    });
    it('should handleForgotPasswordResponse error', () => {
      (service as any).handleForgotPasswordResponse({
        statusCode: StatusCode.SYSTEM_ERROR,
      });
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Không thể gửi yêu cầu',
        expect.stringContaining('Có lỗi xảy ra khi gửi liên kết')
      );
    });
    it('should handleForgotPasswordError user not exists', () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.USER_NOT_EXISTS },
      });
      (service as any).handleForgotPasswordError(error);
      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Email không tồn tại',
        'Vui lòng kiểm tra lại địa chỉ email.'
      );
    });
    it('should handleForgotPasswordError general', () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (service as any).handleForgotPasswordError(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
    it('should handleResetPasswordResponse', () => {
      const spy = vi.spyOn(service as any, 'handleChangePasswordResponse');
      (service as any).handleResetPasswordResponse({
        statusCode: StatusCode.SUCCESS,
      });
      expect(spy).toHaveBeenCalled();
    });
    it('should handleResetPasswordError invalid token', () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_TOKEN },
      });
      try {
        (service as any).handleResetPasswordError(error);
      } catch {}
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Liên kết hết hạn',
        'Vui lòng gửi lại yêu cầu đặt lại mật khẩu mới.'
      );
    });
    it('should handleResetPasswordError new password same as old', () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.NEW_PASSWORD_SAME_AS_OLD },
      });
      try {
        (service as any).handleResetPasswordError(error);
      } catch {}
      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Cảnh báo',
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
      );
    });
    it('should handleResetPasswordError general', () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      try {
        (service as any).handleResetPasswordError(error);
      } catch {}
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
    it('should handleChangePasswordResponse success', () => {
      (service as any).handleChangePasswordResponse({
        statusCode: StatusCode.SUCCESS,
      });
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Thành công',
        'Mật khẩu của bạn đã được đặt lại.'
      );
    });
    it('should handleChangePasswordResponse error', () => {
      (service as any).handleChangePasswordResponse({
        statusCode: StatusCode.SYSTEM_ERROR,
      });
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
    it('should handleChangePasswordError incorrect current password', () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INCORRECT_CURRENT_PASSWORD },
      });
      try {
        (service as any).handleChangePasswordError(error);
      } catch {}
      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Cảnh báo xác thực',
        'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra và thử lại.'
      );
    });
    it('should handleChangePasswordError new password same as old', () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.NEW_PASSWORD_SAME_AS_OLD },
      });
      try {
        (service as any).handleChangePasswordError(error);
      } catch {}
      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Cảnh báo xác thực',
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
      );
    });
    it('should handleChangePasswordError general', () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      try {
        (service as any).handleChangePasswordError(error);
      } catch {}
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('model coverage tests', () => {
    it('should handle reset password with different password combinations', async () => {
      const requests = [
        {
          ...mockResetPasswordRequest,
          password: 'pass1',
          confirmPassword: 'pass1',
        },
        {
          ...mockResetPasswordRequest,
          password: 'Pass@123',
          confirmPassword: 'Pass@123',
        },
        {
          ...mockResetPasswordRequest,
          password: '123456789',
          confirmPassword: '123456789',
        },
      ];

      for (const request of requests) {
        (requestService.post as any).mockReturnValue(
          of({ statusCode: StatusCode.SUCCESS })
        );
        await new Promise<void>(resolve => {
          service.resetPassword(request).subscribe({
            next: () => {
              expect(requestService.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/reset-password'),
                request,
                expect.objectContaining({
                  bypassAuth: true,
                })
              );
              resolve();
            },
            error: () => resolve(),
            complete: () => resolve(),
          });
        });
      }
    });

    it('should handle change password with different logout behaviors', async () => {
      const requests = [
        { ...mockChangePasswordRequest, logoutBehavior: 0 }, // KeepAllSessions
        { ...mockChangePasswordRequest, logoutBehavior: 1 }, // LogoutOthersOnly
        { ...mockChangePasswordRequest, logoutBehavior: 2 }, // LogoutAllIncludingCurrent
      ];

      for (const request of requests) {
        (requestService.post as any).mockReturnValue(
          of({ statusCode: StatusCode.SUCCESS })
        );
        await new Promise<void>(resolve => {
          service.changePassword(request).subscribe({
            next: () => {
              expect(requestService.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/change-password'),
                request,
                expect.objectContaining({ loadingKey: 'change-password-form' })
              );
              resolve();
            },
            error: () => resolve(),
            complete: () => resolve(),
          });
        });
      }
    });

    it('should handle forgot password with different email formats', async () => {
      const requests = [
        {
          email: 'user@example.com',
          clientUrl: 'http://localhost:4200/auth/reset-password',
        },
        {
          email: 'test.user@domain.co.uk',
          clientUrl: 'https://app.example.com/auth/reset-password',
        },
        {
          email: 'admin@company.org',
          clientUrl: 'http://localhost:3000/auth/reset-password',
        },
      ];

      for (const request of requests) {
        (requestService.post as any).mockReturnValue(
          of({ statusCode: StatusCode.SUCCESS })
        );
        await new Promise<void>(resolve => {
          service.forgotPassword(request).subscribe({
            next: () => {
              expect(requestService.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/forgot-password'),
                expect.objectContaining({
                  email: request.email,
                  clientUrl: expect.stringContaining('/auth/reset-password'),
                })
              );
              resolve();
            },
            error: () => resolve(),
            complete: () => resolve(),
          });
        });
      }
    });

    it('should verify all model properties are passed correctly', async () => {
      // Test ResetPasswordRequest with all properties
      const resetRequest = {
        email: 'test@example.com',
        token: 'valid-token-123',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.resetPassword(resetRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/reset-password'),
              expect.objectContaining({
                email: resetRequest.email,
                token: resetRequest.token,
                password: resetRequest.password,
                confirmPassword: resetRequest.confirmPassword,
              }),
              expect.objectContaining({
                bypassAuth: true,
              })
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });

      // Test ChangePasswordRequest with all properties
      const changeRequest = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!',
        logoutBehavior: 1,
      };
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.changePassword(changeRequest).subscribe({
          next: () => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/auth/change-password'),
              expect.objectContaining({
                currentPassword: changeRequest.currentPassword,
                newPassword: changeRequest.newPassword,
                confirmPassword: changeRequest.confirmPassword,
                logoutBehavior: changeRequest.logoutBehavior,
              }),
              expect.objectContaining({ loadingKey: 'change-password-form' })
            );
            resolve();
          },
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    });
  });
});
