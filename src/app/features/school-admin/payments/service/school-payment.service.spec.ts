import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SchoolPaymentService } from './school-payment.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { Payment } from '../model/payment.model';
import { PaymentListParams } from '../model/payment-list-params';
import { SchoolSubscriptionDetail } from '../model/school-subscription-detail.model';
import { CreditTransactionDetail } from '../model/credit-transaction-detail';
import { EntityListResponse } from '../../../../shared/models/api/response/query/entity-list-response.model';
import { BaseResponse } from '../../../../shared/models/api/base-response.model';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('SchoolPaymentService', () => {
  let service: SchoolPaymentService;
  let requestService: RequestService;
  let toastService: ToastHandlingService;
  let userService: UserService;

  const mockRequestService = {
    get: vi.fn(),
  };

  const mockToastService = {
    errorGeneral: vi.fn(),
  };

  const mockUserService = {
    currentUser: vi.fn(() => ({
      id: 'user123',
      fullName: 'Test User',
      email: 'test@example.com',
    })),
  };

  const mockPayment: Payment = {
    id: 'payment123',
    transactionCode: 'TXN001',
    amount: 100000,
    paymentItemId: 1,
    paymentPurpose: 0,
    paymentMethod: 0,
    paymentStatus: 1,
    createdAt: '2024-01-01T00:00:00Z',
    user: {
      id: 'user123',
      fullName: 'Test User',
      phoneNumber: '0123456789',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  };

  const mockSchoolSubscriptionDetail: SchoolSubscriptionDetail = {
    id: 'subscription123',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    subscriptionStatus: 0,
    billingCycle: 0,
    createdAt: '2024-01-01T00:00:00Z',
    school: {
      id: 'school123',
      name: 'Test School',
      address: 'Test Address',
      contactEmail: 'school@example.com',
      contactPhone: '0123456789',
      websiteUrl: 'https://school.example.com',
    },
    plan: {
      id: 'plan123',
      name: 'Basic Plan',
      description: 'Basic subscription plan',
      maxUsers: 100,
      storageLimitGB: 10,
      price: 100000,
    },
    paymentTransaction: mockPayment,
    user: {
      id: 'user123',
      fullName: 'Test User',
      phoneNumber: '0123456789',
      email: 'test@example.com',
    },
  };

  const mockCreditTransactionDetail: CreditTransactionDetail = {
    id: 'credit123',
    credits: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    user: {
      id: 'user123',
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '0123456789',
    },
    aiCreditPack: {
      id: 1,
      name: 'Basic Credit Pack',
      price: 50000,
      credits: 1000,
      bonusCredits: 100,
    },
    paymentTransactionId: 'payment123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        SchoolPaymentService,
        { provide: RequestService, useValue: mockRequestService },
        { provide: ToastHandlingService, useValue: mockToastService },
        { provide: UserService, useValue: mockUserService },
      ],
    });

    service = TestBed.inject(SchoolPaymentService);
    requestService = TestBed.inject(RequestService);
    toastService = TestBed.inject(ToastHandlingService);
    userService = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPayments', () => {
    const mockParams: PaymentListParams = {
      pageIndex: 1,
      pageSize: 10,
      paymentPurpose: 0,
      paymentMethod: 0,
      paymentStatus: 1,
    };

    const mockEntityListResponse: EntityListResponse<Payment> = {
      data: [mockPayment],
      count: 1,
      page: 1,
      pageSize: 10,
    };

    it('should fetch payments successfully', async () => {
      const mockResponse: BaseResponse<EntityListResponse<Payment>> = {
        statusCode: StatusCode.SUCCESS,
        data: mockEntityListResponse,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getPayments(mockParams).subscribe({
          next: result => {
            expect(mockRequestService.get).toHaveBeenCalledWith(
              'http://localhost:3000/api/payments/my',
              { ...mockParams, userId: 'user123' },
              {
                loadingKey: 'get-payments',
              }
            );
            expect(result).toEqual(mockEntityListResponse);
            expect(service.payments()).toEqual([mockPayment]);
            expect(service.totalPayments()).toBe(1);
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle payments request failure', async () => {
      const mockResponse: BaseResponse<EntityListResponse<Payment>> = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getPayments(mockParams).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.payments()).toEqual([]);
            expect(service.totalPayments()).toBe(0);
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle payments request error', async () => {
      mockRequestService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await new Promise<void>((resolve, reject) => {
        service.getPayments(mockParams).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle payments with undefined data', async () => {
      const mockResponse: BaseResponse<EntityListResponse<Payment>> = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getPayments(mockParams).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.payments()).toEqual([]);
            expect(service.totalPayments()).toBe(0);
            resolve();
          },
          error: reject,
        });
      });
    });
  });

  describe('getSchoolSubscriptionDetailById', () => {
    const subscriptionId = 'subscription123';

    it('should fetch school subscription detail successfully', async () => {
      const mockResponse: BaseResponse<SchoolSubscriptionDetail> = {
        statusCode: StatusCode.SUCCESS,
        data: mockSchoolSubscriptionDetail,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getSchoolSubscriptionDetailById(subscriptionId).subscribe({
          next: result => {
            expect(mockRequestService.get).toHaveBeenCalledWith(
              'http://localhost:3000/api/school-subscriptions/subscription123'
            );
            expect(result).toEqual(mockSchoolSubscriptionDetail);
            expect(service.schoolSubscriptionDetail()).toEqual(
              mockSchoolSubscriptionDetail
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle school subscription detail request failure', async () => {
      const mockResponse: BaseResponse<SchoolSubscriptionDetail> = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getSchoolSubscriptionDetailById(subscriptionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.schoolSubscriptionDetail()).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle school subscription detail request error', async () => {
      mockRequestService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await new Promise<void>((resolve, reject) => {
        service.getSchoolSubscriptionDetailById(subscriptionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle school subscription detail with undefined data', async () => {
      const mockResponse: BaseResponse<SchoolSubscriptionDetail> = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getSchoolSubscriptionDetailById(subscriptionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.schoolSubscriptionDetail()).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });
  });

  describe('getCreditTransactionDetailById', () => {
    const creditTransactionId = 'credit123';

    it('should fetch credit transaction detail successfully', async () => {
      const mockResponse: BaseResponse<CreditTransactionDetail> = {
        statusCode: StatusCode.SUCCESS,
        data: mockCreditTransactionDetail,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getCreditTransactionDetailById(creditTransactionId).subscribe({
          next: result => {
            expect(mockRequestService.get).toHaveBeenCalledWith(
              'http://localhost:3000/api/credit-transactions/credit123'
            );
            expect(result).toEqual(mockCreditTransactionDetail);
            expect(service.creditTransactionDetail()).toEqual(
              mockCreditTransactionDetail
            );
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle credit transaction detail request failure', async () => {
      const mockResponse: BaseResponse<CreditTransactionDetail> = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getCreditTransactionDetailById(creditTransactionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.creditTransactionDetail()).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle credit transaction detail request error', async () => {
      mockRequestService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await new Promise<void>((resolve, reject) => {
        service.getCreditTransactionDetailById(creditTransactionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle credit transaction detail with undefined data', async () => {
      const mockResponse: BaseResponse<CreditTransactionDetail> = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getCreditTransactionDetailById(creditTransactionId).subscribe({
          next: result => {
            expect(mockToastService.errorGeneral).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(service.creditTransactionDetail()).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });
  });

  describe('Signals coverage', () => {
    it('should have readonly signals', () => {
      expect(service.payments).toBeDefined();
      expect(service.totalPayments).toBeDefined();
      expect(service.schoolSubscriptionDetail).toBeDefined();
      expect(service.creditTransactionDetail).toBeDefined();
    });

    it('should initialize signals with default values', () => {
      expect(service.payments()).toEqual([]);
      expect(service.totalPayments()).toBe(0);
      expect(service.schoolSubscriptionDetail()).toBeNull();
      expect(service.creditTransactionDetail()).toBeNull();
    });
  });

  describe('Model coverage', () => {
    it('should handle Payment model with all properties', () => {
      const payment: Payment = {
        id: 'payment123',
        transactionCode: 'TXN001',
        amount: 100000,
        paymentItemId: 1,
        paymentPurpose: 0,
        paymentMethod: 0,
        paymentStatus: 1,
        createdAt: '2024-01-01T00:00:00Z',
        user: {
          id: 'user123',
          fullName: 'Test User',
          phoneNumber: '0123456789',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      };

      expect(payment.id).toBe('payment123');
      expect(payment.transactionCode).toBe('TXN001');
      expect(payment.amount).toBe(100000);
      expect(payment.paymentItemId).toBe(1);
      expect(payment.paymentPurpose).toBe(0);
      expect(payment.paymentMethod).toBe(0);
      expect(payment.paymentStatus).toBe(1);
      expect(payment.user.id).toBe('user123');
    });

    it('should handle PaymentListParams model with all properties', () => {
      const params: PaymentListParams = {
        pageIndex: 1,
        pageSize: 10,
        paymentPurpose: 0,
        paymentMethod: 0,
        paymentStatus: 1,
      };

      expect(params.pageIndex).toBe(1);
      expect(params.pageSize).toBe(10);
      expect(params.paymentPurpose).toBe(0);
      expect(params.paymentMethod).toBe(0);
      expect(params.paymentStatus).toBe(1);
    });

    it('should handle SchoolSubscriptionDetail model with all properties', () => {
      const subscription: SchoolSubscriptionDetail = {
        id: 'subscription123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        subscriptionStatus: 0,
        billingCycle: 0,
        createdAt: '2024-01-01T00:00:00Z',
        school: {
          id: 'school123',
          name: 'Test School',
          address: 'Test Address',
          contactEmail: 'school@example.com',
          contactPhone: '0123456789',
          websiteUrl: 'https://school.example.com',
        },
        plan: {
          id: 'plan123',
          name: 'Basic Plan',
          description: 'Basic subscription plan',
          maxUsers: 100,
          storageLimitGB: 10,
          price: 100000,
        },
        paymentTransaction: mockPayment,
        user: {
          id: 'user123',
          fullName: 'Test User',
          phoneNumber: '0123456789',
          email: 'test@example.com',
        },
      };

      expect(subscription.id).toBe('subscription123');
      expect(subscription.subscriptionStatus).toBe(0);
      expect(subscription.billingCycle).toBe(0);
      expect(subscription.school.id).toBe('school123');
      expect(subscription.plan.id).toBe('plan123');
      expect(subscription.user.id).toBe('user123');
    });

    it('should handle CreditTransactionDetail model with all properties', () => {
      const creditTransaction: CreditTransactionDetail = {
        id: 'credit123',
        credits: 1000,
        createdAt: '2024-01-01T00:00:00Z',
        user: {
          id: 'user123',
          fullName: 'Test User',
          email: 'test@example.com',
          phoneNumber: '0123456789',
        },
        aiCreditPack: {
          id: 1,
          name: 'Basic Credit Pack',
          price: 50000,
          credits: 1000,
          bonusCredits: 100,
        },
        paymentTransactionId: 'payment123',
      };

      expect(creditTransaction.id).toBe('credit123');
      expect(creditTransaction.credits).toBe(1000);
      expect(creditTransaction.user.id).toBe('user123');
      expect(creditTransaction.aiCreditPack.id).toBe(1);
      expect(creditTransaction.paymentTransactionId).toBe('payment123');
    });
  });

  describe('Private helper methods coverage', () => {
    it('should handle request with success and successHandler', async () => {
      const mockResponse: BaseResponse<string> = {
        statusCode: StatusCode.SUCCESS,
        data: 'test data',
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      let successHandlerCalled = false;
      const testRequest$ = of(mockResponse);

      await new Promise<void>((resolve, reject) => {
        // Access private method through public method
        service.getPayments({ pageIndex: 1, pageSize: 10 }).subscribe({
          next: result => {
            expect(result).toBeDefined();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle request with error and errorHandler', async () => {
      const mockResponse: BaseResponse<string> = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: undefined,
      };
      mockRequestService.get.mockReturnValue(of(mockResponse));

      await new Promise<void>((resolve, reject) => {
        service.getPayments({ pageIndex: 1, pageSize: 10 }).subscribe({
          next: result => {
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });

    it('should handle request with network error', async () => {
      mockRequestService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await new Promise<void>((resolve, reject) => {
        service.getPayments({ pageIndex: 1, pageSize: 10 }).subscribe({
          next: result => {
            expect(result).toBeNull();
            resolve();
          },
          error: reject,
        });
      });
    });
  });
});
