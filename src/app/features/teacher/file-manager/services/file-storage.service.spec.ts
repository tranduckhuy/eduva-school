import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { FileStorageService } from './file-storage.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type FileStorageQuotaResponse } from '../models/file-storage-quota-response.model';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let requestService: RequestService;

  const mockFileStorageQuotaResponse: FileStorageQuotaResponse = {
    usedBytes: 1073741824, // 1GB in bytes
    limitBytes: 5368709120, // 5GB in bytes
    remainingBytes: 4294967296, // 4GB in bytes
    usedGB: 1,
    limitGB: 5,
    remainingGB: 4,
    usagePercentage: 20,
  };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        FileStorageService,
        { provide: RequestService, useValue: requestService },
      ],
    });

    service = TestBed.inject(FileStorageService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getFileStorageQuota', () => {
    it('should return data when statusCode is SUCCESS and data exists', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockFileStorageQuotaResponse,
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual(mockFileStorageQuotaResponse);
      expect(requestService.get).toHaveBeenCalledWith(
        `${service['BASE_API_URL']}/file-storage/storage-quota`
      );
    });

    it('should return null when statusCode is not SUCCESS', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: mockFileStorageQuotaResponse,
      };

      (requestService.get as any).mockReturnValue(of(failureResponse));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return null when statusCode is SUCCESS but data is null', async () => {
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(responseWithNullData));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return null when statusCode is SUCCESS but data is undefined', async () => {
      const responseWithUndefinedData = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithUndefinedData)
      );

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return null when statusCode is SUCCESS but data is false', async () => {
      const responseWithFalseData = {
        statusCode: StatusCode.SUCCESS,
        data: false,
      };

      (requestService.get as any).mockReturnValue(of(responseWithFalseData));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return null when statusCode is SUCCESS but data is empty string', async () => {
      const responseWithEmptyStringData = {
        statusCode: StatusCode.SUCCESS,
        data: '',
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithEmptyStringData)
      );

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return null when statusCode is SUCCESS but data is 0', async () => {
      const responseWithZeroData = {
        statusCode: StatusCode.SUCCESS,
        data: 0,
      };

      (requestService.get as any).mockReturnValue(of(responseWithZeroData));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toBeNull();
    });

    it('should return data when statusCode is SUCCESS and data is empty object', async () => {
      const responseWithEmptyObjectData = {
        statusCode: StatusCode.SUCCESS,
        data: {},
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithEmptyObjectData)
      );

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual({});
    });

    it('should return data when statusCode is SUCCESS and data is array', async () => {
      const responseWithArrayData = {
        statusCode: StatusCode.SUCCESS,
        data: [1, 2, 3],
      };

      (requestService.get as any).mockReturnValue(of(responseWithArrayData));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle HTTP error and rethrow', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
        status: 500,
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getFileStorageQuota().subscribe({
          error: err => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });

    it('should handle network error and rethrow', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
        status: 0,
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getFileStorageQuota().subscribe({
          error: err => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });

    it('should handle 404 error and rethrow', async () => {
      const error = new HttpErrorResponse({
        error: { message: 'Not found' },
        status: 404,
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getFileStorageQuota().subscribe({
          error: err => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });

    it('should handle 401 unauthorized error and rethrow', async () => {
      const error = new HttpErrorResponse({
        error: { message: 'Unauthorized' },
        status: 401,
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getFileStorageQuota().subscribe({
          error: err => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });

    it('should handle 403 forbidden error and rethrow', async () => {
      const error = new HttpErrorResponse({
        error: { message: 'Forbidden' },
        status: 403,
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getFileStorageQuota().subscribe({
          error: err => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle response with partial FileStorageQuotaResponse data', async () => {
      const responseWithPartialData = {
        statusCode: StatusCode.SUCCESS,
        data: {
          usedBytes: 1073741824,
          limitBytes: 5368709120,
          // Missing other properties
        },
      };

      (requestService.get as any).mockReturnValue(of(responseWithPartialData));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual(responseWithPartialData.data);
    });

    it('should handle response with zero values', async () => {
      const responseWithZeroValues: FileStorageQuotaResponse = {
        usedBytes: 0,
        limitBytes: 0,
        remainingBytes: 0,
        usedGB: 0,
        limitGB: 0,
        remainingGB: 0,
        usagePercentage: 0,
      };

      const response = {
        statusCode: StatusCode.SUCCESS,
        data: responseWithZeroValues,
      };

      (requestService.get as any).mockReturnValue(of(response));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual(responseWithZeroValues);
    });

    it('should handle response with maximum values', async () => {
      const responseWithMaxValues: FileStorageQuotaResponse = {
        usedBytes: Number.MAX_SAFE_INTEGER,
        limitBytes: Number.MAX_SAFE_INTEGER,
        remainingBytes: 0,
        usedGB: 9007199254740991, // Max safe integer in GB
        limitGB: 9007199254740991,
        remainingGB: 0,
        usagePercentage: 100,
      };

      const response = {
        statusCode: StatusCode.SUCCESS,
        data: responseWithMaxValues,
      };

      (requestService.get as any).mockReturnValue(of(response));

      const result = await new Promise<FileStorageQuotaResponse | null>(
        resolve => {
          service.getFileStorageQuota().subscribe(resolve);
        }
      );

      expect(result).toEqual(responseWithMaxValues);
    });

    it('should handle different non-SUCCESS status codes', async () => {
      const nonSuccessStatusCodes = [
        StatusCode.SYSTEM_ERROR,
        StatusCode.UNAUTHORIZED,
        StatusCode.FORBIDDEN,
        StatusCode.MODEL_INVALID,
        StatusCode.CREATED,
        StatusCode.UPDATED,
      ];

      for (const statusCode of nonSuccessStatusCodes) {
        const response = {
          statusCode,
          data: mockFileStorageQuotaResponse,
        };

        (requestService.get as any).mockReturnValue(of(response));

        const result = await new Promise<FileStorageQuotaResponse | null>(
          resolve => {
            service.getFileStorageQuota().subscribe(resolve);
          }
        );

        expect(result).toBeNull();
      }
    });
  });
});
