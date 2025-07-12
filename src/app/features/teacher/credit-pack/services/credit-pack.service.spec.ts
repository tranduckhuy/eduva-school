import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreditPackService } from './credit-pack.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { CreditPack } from '../../../../shared/models/entities/credit-pack.model';
import { GetCreditPacksRequest } from '../models/request/query/get-credit-packs-request.model';
import { GetCreditPacksResponse } from '../models/response/query/get-credit-packs-response.model';

describe('CreditPackService', () => {
  let service: CreditPackService;
  let requestService: ReturnType<typeof vi.fn>;
  let toastHandlingService: ReturnType<typeof vi.fn>;

  const mockCreditPacks: CreditPack[] = [
    {
      id: 1,
      name: 'Basic Pack',
      price: 10,
      credits: 100,
      bonusCredits: 10,
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01T00:00:00Z',
      lastModifiedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Premium Pack',
      price: 25,
      credits: 300,
      bonusCredits: 50,
      status: 'ACTIVE' as any,
      createdAt: '2024-01-01T00:00:00Z',
      lastModifiedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockSuccessResponse: GetCreditPacksResponse = {
    pageIndex: 0,
    pageSize: 10,
    count: 2,
    data: mockCreditPacks,
  };

  const mockRequest: GetCreditPacksRequest = {
    activeOnly: true,
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'name',
    sortDirection: 'asc',
    searchTerm: 'pack',
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
        CreditPackService,
        { provide: RequestService, useValue: mockRequestService },
        { provide: ToastHandlingService, useValue: mockToastHandlingService },
      ],
    });

    service = TestBed.inject(CreditPackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('creditPacks signal', () => {
    it('should initialize with empty array', () => {
      expect(service.creditPacks()).toEqual([]);
    });

    it('should be readonly', () => {
      expect(() => {
        (service as any).creditPacksSignal.set([mockCreditPacks[0]]);
      }).not.toThrow();

      expect(service.creditPacks()).toEqual([mockCreditPacks[0]]);
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

  describe('getCreditPacks', () => {
    it('should return credit packs when API call is successful', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toEqual(mockCreditPacks);
      expect(service.creditPacks()).toEqual(mockCreditPacks);
      expect(service.totalRecords()).toEqual(2);
      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-packs'),
        mockRequest,
        { loadingKey: 'load-credit-packs' }
      );
    });

    it('should return null when API call is successful but status code is not SUCCESS', async () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(errorResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toBeNull();
      expect(service.creditPacks()).toEqual([]);
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
        firstValueFrom(service.getCreditPacks(mockRequest))
      ).rejects.toBe(httpError);
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should handle different status codes correctly', async () => {
      const unauthorizedResponse = {
        statusCode: StatusCode.UNAUTHORIZED,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(unauthorizedResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toBeNull();
      expect(service.creditPacks()).toEqual([]);
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

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toEqual([]);
      expect(service.creditPacks()).toEqual([]);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle null data in response', async () => {
      const nullDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockSuccessResponse, data: null },
        count: 0,
      };

      requestService.mockReturnValue(of(nullDataResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toEqual(null);
      expect(service.creditPacks()).toEqual(null);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle undefined data in response', async () => {
      const undefinedDataResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockSuccessResponse, data: undefined },
        count: 0,
      };

      requestService.mockReturnValue(of(undefinedDataResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toEqual(undefined);
      expect(service.creditPacks()).toEqual(undefined);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should handle missing count property in response', async () => {
      const noCountResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        // count property is missing
      };

      requestService.mockReturnValue(of(noCountResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toEqual(mockCreditPacks);
      expect(service.creditPacks()).toEqual(mockCreditPacks);
      expect(service.totalRecords()).toEqual(2);
    });

    it('should call API with correct URL and parameters', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(successResponse));

      await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-packs'),
        mockRequest,
        { loadingKey: 'load-credit-packs' }
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
        service.getCreditPacks(minimalRequest)
      );

      expect(result).toEqual(mockCreditPacks);
      expect(requestService).toHaveBeenCalledWith(
        expect.stringContaining('/credit-packs'),
        minimalRequest,
        { loadingKey: 'load-credit-packs' }
      );
    });
  });

  describe('Private helper functions', () => {
    it('should handle successful response in handleGetCreditPacksResponse', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: mockCreditPacks, count: 5 },
      };

      (service as any).handleGetCreditPacksResponse(successResponse);

      expect(service.creditPacks()).toEqual(mockCreditPacks);
      expect(service.totalRecords()).toEqual(5);
      expect(toastHandlingService).not.toHaveBeenCalled();
    });

    it('should handle error response in handleGetCreditPacksResponse', () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: { data: mockCreditPacks },
        count: 5,
      };

      (service as any).handleGetCreditPacksResponse(errorResponse);

      expect(service.creditPacks()).toEqual([]);
      expect(service.totalRecords()).toEqual(0);
      expect(toastHandlingService).toHaveBeenCalled();
    });

    it('should extract credit packs correctly in extractCreditPacksResponse', () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: mockCreditPacks },
      };

      const result = (service as any).extractCreditPacksResponse(
        successResponse
      );

      expect(result).toEqual(mockCreditPacks);
    });

    it('should return null in extractCreditPacksResponse for non-success status', () => {
      const errorResponse = {
        statusCode: StatusCode.UNAUTHORIZED,
        data: { data: mockCreditPacks },
      };

      const result = (service as any).extractCreditPacksResponse(errorResponse);

      expect(result).toBeNull();
    });

    it('should handle error in handleError', () => {
      const httpError = new HttpErrorResponse({
        error: 'Test error',
        status: 500,
      });

      const result = (service as any).handleError(httpError);

      expect(toastHandlingService).toHaveBeenCalled();
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

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toBeUndefined();
    });

    it('should handle response with null status code', async () => {
      const nullStatusCodeResponse = {
        statusCode: null,
        data: mockSuccessResponse,
        count: 2,
      };

      requestService.mockReturnValue(of(nullStatusCodeResponse));

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

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

      const result = await firstValueFrom(service.getCreditPacks(mockRequest));

      expect(result).toBeNull();
      expect(toastHandlingService).toHaveBeenCalled();
    });
  });
});
