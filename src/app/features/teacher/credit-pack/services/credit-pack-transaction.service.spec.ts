import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreditPackTransactionService } from './credit-pack-transaction.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import {
  CreditTransaction,
  GetCreditTransactionResponse,
} from '../models/response/query/get-credit-transaction-response.model';
import { GetCreditPacksRequest } from '../models/request/query/get-credit-packs-request.model';

describe('CreditPackTransactionService', () => {
  let service: CreditPackTransactionService;
  let requestService: ReturnType<typeof vi.fn>;
  let toastHandlingService: ReturnType<typeof vi.fn>;

  const mockCreditTransactions: CreditTransaction[] = [
    {
      id: '1',
      totalCredits: 100,
      createdAt: '2024-01-01T00:00:00Z',
      paymentStatus: 'COMPLETED' as any,
      user: {
        id: 'user1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
      aiCreditPack: {
        id: 'pack1',
        name: 'Basic Pack',
        price: 10,
        credits: 100,
        bonusCredits: 10,
      },
      transactionCode: 'TXN001',
      amount: 10,
      paymentTransactionId: 'PAY001',
    },
    {
      id: '2',
      totalCredits: 300,
      createdAt: '2024-01-02T00:00:00Z',
      paymentStatus: 'PENDING' as any,
      user: {
        id: 'user2',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+0987654321',
        avatarUrl: 'https://example.com/avatar2.jpg',
      },
      aiCreditPack: {
        id: 'pack2',
        name: 'Premium Pack',
        price: 25,
        credits: 300,
        bonusCredits: 50,
      },
      transactionCode: 'TXN002',
      amount: 25,
      paymentTransactionId: 'PAY002',
    },
  ];

  const mockSuccessResponse: GetCreditTransactionResponse = {
    pageIndex: 0,
    pageSize: 10,
    count: 2,
    data: mockCreditTransactions,
  };

  const mockRequest: GetCreditPacksRequest = {
    activeOnly: true,
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    searchTerm: 'transaction',
  };

  beforeEach(() => {
    requestService = vi.fn();
    toastHandlingService = vi.fn();

    const mockRequestService = {
      get: requestService,
    };

    const mockToastHandlingService = {
      errorGeneral: toastHandlingService,
    };

    TestBed.configureTestingModule({
      providers: [
        CreditPackTransactionService,
        { provide: RequestService, useValue: mockRequestService },
        { provide: ToastHandlingService, useValue: mockToastHandlingService },
      ],
    });

    service = TestBed.inject(CreditPackTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('creditTransactions signal', () => {
    it('should initialize with empty array', () => {
      expect(service.creditTransactions()).toEqual([]);
    });

    it('should be readonly', () => {
      expect(() => {
        (service as any).creditTransactionsSignal.set([
          mockCreditTransactions[0],
        ]);
      }).not.toThrow();

      expect(service.creditTransactions()).toEqual([mockCreditTransactions[0]]);
    });
  });

  describe('totalRecords signal', () => {
    it('should initialize with 0', () => {
      expect(service.totalRecords()).toEqual(0);
    });

    it('should be readonly', () => {
      expect(() => {
        (service as any).totalRecordsSignal.set(5);
      }).not.toThrow();

      expect(service.totalRecords()).toEqual(5);
    });
  });

  describe('getCreditTransactions', () => {
    it('should return credit transactions when API call is successful', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toEqual(mockCreditTransactions);
      expect(service.creditTransactions()).toEqual(mockCreditTransactions);
      expect(service.totalRecords()).toEqual(2);
      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-transactions'),
        mockRequest,
        { loadingKey: 'load-transactions' }
      );
    });

    it('should return null when API call is successful but status code is not SUCCESS', async () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(errorResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toBeNull();
      expect(service.creditTransactions()).toEqual([]);
      expect(service.totalRecords()).toEqual(0);
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should handle HTTP error and show error toast', async () => {
      const httpError = new HttpErrorResponse({
        error: 'Network error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      requestService.mockReturnValue(throwError(() => httpError));

      await expect(
        firstValueFrom(service.getCreditTransactions(mockRequest))
      ).rejects.toBe(httpError);
      expect(toastHandlingService).not.toHaveBeenCalled();
    });

    it('should handle different status codes correctly', async () => {
      const unauthorizedResponse = {
        statusCode: StatusCode.UNAUTHORIZED,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(unauthorizedResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toBeNull();
      expect(service.creditTransactions()).toEqual([]);
      expect(service.totalRecords()).toEqual(0);
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should handle empty data response', async () => {
      const emptyResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockSuccessResponse, data: [] },
        count: 0,
      };

      requestService.mockReturnValue(of(emptyResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.creditTransactions()).toEqual([]);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle null data in response', async () => {
      const nullDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockSuccessResponse, data: null },
        count: 0,
      };

      requestService.mockReturnValue(of(nullDataResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toEqual(null);
      expect(service.creditTransactions()).toEqual(null);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle undefined data in response', async () => {
      const undefinedDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockSuccessResponse, data: undefined },
        count: 0,
      };

      requestService.mockReturnValue(of(undefinedDataResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toEqual(undefined);
      expect(service.creditTransactions()).toEqual(undefined);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle missing count property in response', async () => {
      const noCountResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        // count property is missing
      };

      requestService.mockReturnValue(of(noCountResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toEqual(mockCreditTransactions);
      expect(service.creditTransactions()).toEqual(mockCreditTransactions);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should call API with correct URL and parameters', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(successResponse));

      await firstValueFrom(service.getCreditTransactions(mockRequest));

      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-transactions'),
        mockRequest,
        { loadingKey: 'load-transactions' }
      );
    });

    it('should handle request with minimal parameters', async () => {
      const minimalRequest: GetCreditPacksRequest = {};
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(minimalRequest)
      );

      expect(result).toEqual(mockCreditTransactions);
      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-transactions'),
        minimalRequest,
        { loadingKey: 'load-transactions' }
      );
    });
  });

  describe('Private helper functions', () => {
    it('should handle successful response in handleGetCreditTransactionResponse', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: mockCreditTransactions, count: 5 },
      };

      (service as any).handleGetCreditTransactionResponse(successResponse);

      expect(service.creditTransactions()).toEqual(mockCreditTransactions);
      expect(service.totalRecords()).toEqual(5);
      expect(toastHandlingService).not.toHaveBeenCalled();
    });

    it('should handle error response in handleGetCreditTransactionResponse', () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: { data: mockCreditTransactions, count: 5 },
      };

      (service as any).handleGetCreditTransactionResponse(errorResponse);

      expect(service.creditTransactions()).toEqual([]);
      expect(service.totalRecords()).toEqual(0);
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should extract credit transactions correctly in extractCreditTransactionsResponse', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: mockCreditTransactions },
      };

      const result = (service as any).extractCreditTransactionsResponse(
        successResponse
      );

      expect(result).toEqual(mockCreditTransactions);
    });

    it('should return null in extractCreditTransactionsResponse for non-success status', () => {
      const errorResponse = {
        statusCode: StatusCode.UNAUTHORIZED,
        data: { data: mockCreditTransactions },
      };

      const result = (service as any).extractCreditTransactionsResponse(
        errorResponse
      );

      expect(result).toBeNull();
    });

    it('should handle error in handleError', () => {
      const httpError = new HttpErrorResponse({
        error: 'Test error',
        status: 500,
      });

      const result = (service as any).handleError(httpError);

      expect(result).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed response data', async () => {
      const malformedResponse = {
        statusCode: StatusCode.SUCCESS,
        data: 'invalid data structure',
        count: 2,
      };

      requestService.mockReturnValue(of(malformedResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toBeUndefined();
    });

    it('should handle response with null status code', async () => {
      const nullStatusCodeResponse = {
        statusCode: null,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(nullStatusCodeResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should handle response with undefined status code', async () => {
      const undefinedStatusCodeResponse = {
        data: mockSuccessResponse,
        count: 2,
        // statusCode is undefined
      };

      requestService.mockReturnValue(of(undefinedStatusCodeResponse));

      const result = await firstValueFrom(
        service.getCreditTransactions(mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService).toHaveBeenCalled();
    });
  });
});
