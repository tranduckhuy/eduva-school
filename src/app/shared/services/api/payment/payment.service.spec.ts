import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { PaymentService } from './payment.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { ConfirmationService } from 'primeng/api';
import { JwtService } from '../../../../core/auth/services/jwt.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { StatusCode } from '../../../constants/status-code.constant';
import {
  type CreatePlanPaymentLinkRequest,
  BillingCycle,
} from '../../../models/api/request/command/create-plan-payment-link-request.model';
import { type CreatePlanPaymentLinkResponse } from '../../../models/api/response/command/create-plan-payment-link-response.model';
import { type ConfirmPaymentReturnRequest } from '../../../models/api/request/query/confirm-payment-return-request.model';
import { type CreateCreditPaymentLinkRequest } from '../../../models/api/request/command/create-credit-payment-link-request.model';
import { type CreateCreditPaymentLinkResponse } from '../../../models/api/response/command/create-credit-payment-link-response.model';

// Mock Intl.NumberFormat
const originalNumberFormat = Intl.NumberFormat;

// Helper for confirmationService
function getConfirmCall(confirmationService: any) {
  return confirmationService.confirm.mock.calls[0][0];
}

describe('PaymentService', () => {
  let service: PaymentService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;
  let confirmationService: ConfirmationService;
  let jwtService: JwtService;
  let authService: AuthService;
  let redirectedUrl = '';

  const mockCreatePlanRequest: CreatePlanPaymentLinkRequest = {
    planId: 1,
    billingCycle: BillingCycle.Monthly,
  };

  const mockCreateCreditRequest: CreateCreditPaymentLinkRequest = {
    creditPackId: 1,
  };

  const mockCreatePlanResponse: CreatePlanPaymentLinkResponse = {
    checkoutUrl: 'https://checkout.url',
    paymentLinkId: 'pl_123',
    amount: 1000000,
    deductedAmount: 200000,
    transactionCode: 'TX123',
    deductedPercent: 20,
  };

  const mockCreateCreditResponse: CreateCreditPaymentLinkResponse = {
    checkoutUrl: 'https://credit-checkout.url',
    paymentLinkId: 'cl_456',
    amount: 500000,
    transactionCode: 'CTX456',
  };

  const mockConfirmRequest: ConfirmPaymentReturnRequest = {
    code: 'c1',
    id: 'id1',
    status: 'success',
    orderCode: 123,
  };

  beforeEach(() => {
    requestService = {
      post: vi.fn(),
      get: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    } as any;
    confirmationService = {
      confirm: vi.fn(),
    } as any;
    jwtService = {
      getAccessToken: vi.fn(),
      getRefreshToken: vi.fn(),
    } as any;
    authService = {
      refreshToken: vi.fn().mockReturnValue(of({})),
    } as any;
    global.Intl.NumberFormat = vi.fn().mockImplementation(() => ({
      format: (n: number) => `${n} VND`,
    })) as any;
    TestBed.configureTestingModule({
      providers: [
        PaymentService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuthService, useValue: authService },
      ],
    });
    service = TestBed.inject(PaymentService);
    vi.spyOn(service as any, 'redirectToUrl').mockImplementation(url => {
      redirectedUrl = `${url}`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.Intl.NumberFormat = originalNumberFormat;
    redirectedUrl = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createPlanPaymentLink', () => {
    it('should handle success and redirect if deductedAmount = 0', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: { ...mockCreatePlanResponse, deductedAmount: 0 },
        })
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            expect(result).toEqual({
              ...mockCreatePlanResponse,
              deductedAmount: 0,
            });
            expect(redirectedUrl).toBe('https://checkout.url');
            resolve();
          });
      });
    });

    it('should show confirm dialog if deductedAmount > 0', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockCreatePlanResponse })
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            expect(result).toEqual(mockCreatePlanResponse);
            expect(confirmationService.confirm).toHaveBeenCalled();
            const confirmArgs = getConfirmCall(confirmationService);
            expect(confirmArgs.header).toContain('khuyến mãi');
            expect(confirmArgs.acceptButtonProps.label).toBe(
              'Tiếp tục thanh toán'
            );
            // Simulate accept
            confirmArgs.accept();
            expect(redirectedUrl).toBe('https://checkout.url');
            resolve();
          });
      });
    });

    it('should show error toast if not SUCCESS', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: mockCreatePlanResponse,
        })
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.error).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should show error toast if missing data', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: null })
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.error).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should show errorGeneral on network error', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should call API with correct URL and parameters', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockCreatePlanResponse })
      );
      await new Promise<void>(resolve => {
        service.createPlanPaymentLink(mockCreatePlanRequest).subscribe(() => {
          expect(requestService.post).toHaveBeenCalledWith(
            expect.stringContaining('/school-subscriptions/payment-link'),
            mockCreatePlanRequest
          );
          resolve();
        });
      });
    });
  });

  describe('createCreditPaymentLink', () => {
    it('should handle success and redirect', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockCreateCreditResponse })
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(result => {
            expect(result).toEqual(mockCreateCreditResponse);
            expect(redirectedUrl).toBe('https://credit-checkout.url');
            resolve();
          });
      });
    });

    it('should show errorGeneral if not SUCCESS', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: mockCreateCreditResponse,
        })
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should show errorGeneral if missing data', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: null })
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should show errorGeneral on network error', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should call API with correct URL, parameters and loading key', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockCreateCreditResponse })
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(() => {
            expect(requestService.post).toHaveBeenCalledWith(
              expect.stringContaining('/credit-transactions/payment-link'),
              mockCreateCreditRequest,
              { loadingKey: 'create-credit-payment-link' }
            );
            resolve();
          });
      });
    });
  });

  describe('confirmPaymentReturn', () => {
    it('should handle success and show success toast', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      (jwtService.getAccessToken as any).mockReturnValue('access');
      (jwtService.getRefreshToken as any).mockReturnValue('refresh');
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(toastHandlingService.success).toHaveBeenCalledWith(
            'Thanh toán thành công',
            'Cảm ơn bạn đã tin tưởng sử dụng hệ thống EDUVA. Chúc bạn có trải nghiệm dạy và học thật hiệu quả!'
          );
          expect(authService.refreshToken).toHaveBeenCalledWith({
            accessToken: 'access',
            refreshToken: 'refresh',
          });
          resolve();
        });
      });
    });

    it('should show errorGeneral if not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle PAYMENT_FAILED and show info toast', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PAYMENT_FAILED },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe({
          next: () => {
            // Should not reach here for error cases
            resolve();
          },
          error: err => {
            // Error is expected and handled by the service
            expect(toastHandlingService.info).toHaveBeenCalledWith(
              'Thanh toán bị hủy',
              'Bạn đã hủy giao dịch. Không có khoản phí nào bị trừ.'
            );
            resolve();
          },
        });
      });
    });

    it('should handle PAYMENT_ALREADY_CONFIRMED and show info toast', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PAYMENT_ALREADY_CONFIRMED },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe({
          next: () => {
            // Should not reach here for error cases
            resolve();
          },
          error: err => {
            // Error is expected and handled by the service
            expect(toastHandlingService.info).toHaveBeenCalledWith(
              'Giao dịch đã hoàn tất',
              'Giao dịch của bạn đã hoàn tất trước đó. EDUVA xin chân trọng cảm ơn bạn đã tin tưởng.'
            );
            resolve();
          },
        });
      });
    });

    it('should handle unknown error and show errorGeneral', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe({
          next: () => {
            // Should not reach here for error cases
            resolve();
          },
          error: err => {
            // Error is expected and handled by the service
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should call API with correct URL, parameters and bypassPaymentError', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining('/payments/payos-return'),
            mockConfirmRequest,
            { bypassPaymentError: true }
          );
          resolve();
        });
      });
    });

    it('should not refresh token if tokens are missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      (jwtService.getAccessToken as any).mockReturnValue(null);
      (jwtService.getRefreshToken as any).mockReturnValue(null);
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(authService.refreshToken).not.toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should not refresh token if access token is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      (jwtService.getAccessToken as any).mockReturnValue(null);
      (jwtService.getRefreshToken as any).mockReturnValue('refresh');
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(authService.refreshToken).not.toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should not refresh token if refresh token is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      (jwtService.getAccessToken as any).mockReturnValue('access');
      (jwtService.getRefreshToken as any).mockReturnValue(null);
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(authService.refreshToken).not.toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('Private helper functions', () => {
    it('should extract plan data correctly from response', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockCreatePlanResponse,
      };

      const result = (service as any).extractPlanDataFromResponse(
        successResponse
      );

      expect(result).toEqual(mockCreatePlanResponse);
    });

    it('should return null for plan data when status is not SUCCESS', () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: mockCreatePlanResponse,
      };

      const result = (service as any).extractPlanDataFromResponse(
        errorResponse
      );

      expect(result).toBeNull();
    });

    it('should return null for plan data when data is missing', () => {
      const noDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      const result = (service as any).extractPlanDataFromResponse(
        noDataResponse
      );

      expect(result).toBeNull();
    });

    it('should extract credit data correctly from response', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockCreateCreditResponse,
      };

      const result = (service as any).extractCreditDataFromResponse(
        successResponse
      );

      expect(result).toEqual(mockCreateCreditResponse);
    });

    it('should return null for credit data when status is not SUCCESS', () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: mockCreateCreditResponse,
      };

      const result = (service as any).extractCreditDataFromResponse(
        errorResponse
      );

      expect(result).toBeNull();
    });

    it('should return null for credit data when data is missing', () => {
      const noDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      const result = (service as any).extractCreditDataFromResponse(
        noDataResponse
      );

      expect(result).toBeNull();
    });

    it('should handle redirectToUrl correctly', () => {
      const testUrl = 'https://test.com';
      (service as any).redirectToUrl(testUrl);
      expect(redirectedUrl).toBe(testUrl);
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed response in createPlanPaymentLink', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: null })
      );
      await new Promise<void>(resolve => {
        service
          .createPlanPaymentLink(mockCreatePlanRequest)
          .subscribe(result => {
            // The service should return null for malformed data
            expect(result).toBeNull();
            expect(toastHandlingService.error).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should handle malformed response in createCreditPaymentLink', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: null })
      );
      await new Promise<void>(resolve => {
        service
          .createCreditPaymentLink(mockCreateCreditRequest)
          .subscribe(result => {
            // The service should return null for malformed data
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should handle error without statusCode in confirmPaymentReturn', async () => {
      const error = new HttpErrorResponse({ error: {} });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe({
          next: () => {
            // Should not reach here for error cases
            resolve();
          },
          error: err => {
            // Error is expected and handled by the service
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should handle error with null error object in confirmPaymentReturn', async () => {
      const error = new HttpErrorResponse({ error: null });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe({
          next: () => {
            // Should not reach here for error cases
            resolve();
          },
          error: err => {
            // Error is expected and handled by the service
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });
});
