import { TestBed } from '@angular/core/testing';
import { of, throwError, EMPTY } from 'rxjs';
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

  const mockCreateRequest: CreatePlanPaymentLinkRequest = {
    planId: 1,
    billingCycle: BillingCycle.Monthly,
  };
  const mockCreateResponse: CreatePlanPaymentLinkResponse = {
    checkoutUrl: 'https://checkout.url',
    paymentLinkId: 'pl_123',
    amount: 1000000,
    deductedAmount: 200000,
    transactionCode: 'TX123',
    deductedPercent: 20,
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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createPlanPaymentLink', () => {
    it('should handle success and redirect if deductedAmount = 0', async () => {
      (requestService.post as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: { ...mockCreateResponse, deductedAmount: 0 },
        })
      );
      await new Promise<void>(resolve => {
        service.createPlanPaymentLink(mockCreateRequest).subscribe(result => {
          expect(result).toEqual({ ...mockCreateResponse, deductedAmount: 0 });
          expect(redirectedUrl).toBe('https://checkout.url');
          resolve();
        });
      });
    });
    it('should show confirm dialog if deductedAmount > 0', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockCreateResponse })
      );
      await new Promise<void>(resolve => {
        service.createPlanPaymentLink(mockCreateRequest).subscribe(result => {
          expect(result).toEqual(mockCreateResponse);
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
    it('should show error toast if not SUCCESS or missing data', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: null })
      );
      await new Promise<void>(resolve => {
        service.createPlanPaymentLink(mockCreateRequest).subscribe(result => {
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
        service.createPlanPaymentLink(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
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
          expect(toastHandlingService.success).toHaveBeenCalled();
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
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(toastHandlingService.info).toHaveBeenCalledWith(
            'Thanh toán bị hủy',
            expect.stringContaining('Bạn đã hủy giao dịch')
          );
          resolve();
        });
      });
    });
    it('should handle PAYMENT_ALREADY_CONFIRMED and show info toast', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PAYMENT_ALREADY_CONFIRMED },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(toastHandlingService.info).toHaveBeenCalledWith(
            'Giao dịch đã hoàn tất',
            expect.stringContaining('Giao dịch của bạn đã hoàn tất')
          );
          resolve();
        });
      });
    });
    it('should handle unknown error and show errorGeneral', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.get as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.confirmPaymentReturn(mockConfirmRequest).subscribe(() => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });
});
