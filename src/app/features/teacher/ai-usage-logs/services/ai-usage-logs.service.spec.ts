import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { of, throwError } from 'rxjs';

import { vi, describe, it, expect, beforeEach } from 'vitest';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { AiUsageLogsService } from './ai-usage-logs.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type AiUsageLog } from '../../../../shared/models/entities/ai-usage-log.model';
import { type GetAiUsageLogsRequest } from '../models/get-ai-usage-logs-request.model';

// Mock data
const mockLogs: AiUsageLog[] = [
  {
    id: '1',
    userId: 'user1',
    aiServiceType: 0,
    durationMinutes: 10,
    creditsCharged: 5,
    createdAt: '2024-07-01T00:00:00Z',
  },
];
const mockRequest: GetAiUsageLogsRequest = { pageIndex: 1, pageSize: 10 };
const mockResponse = {
  statusCode: StatusCode.SUCCESS,
  data: { data: mockLogs, count: 1 },
};
const mockInvalidResponse = {
  statusCode: 4000,
  data: { data: null, count: 0 },
};

// Mocks
const requestServiceMock = {
  get: vi.fn(),
};
const toastHandlingServiceMock = {
  errorGeneral: vi.fn(),
};

describe('AiUsageLogsService (Vitest)', () => {
  let service: AiUsageLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AiUsageLogsService,
        { provide: RequestService, useValue: requestServiceMock },
        { provide: ToastHandlingService, useValue: toastHandlingServiceMock },
      ],
    });
    service = TestBed.inject(AiUsageLogsService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch logs successfully and update signals', async () => {
    requestServiceMock.get.mockReturnValueOnce(of(mockResponse));
    const result = await service.getAiUsageLogs(mockRequest).toPromise();
    expect(result).toEqual(mockLogs);
    expect(service.aiUsageLogs()).toEqual(mockLogs);
    expect(service.totalRecords()).toBe(1);
    expect(toastHandlingServiceMock.errorGeneral).not.toHaveBeenCalled();
  });

  it('should handle invalid response and call toast error', async () => {
    requestServiceMock.get.mockReturnValueOnce(of(mockInvalidResponse));
    const result = await service.getAiUsageLogs(mockRequest).toPromise();
    expect(result).toBeNull();
    expect(service.aiUsageLogs()).toEqual([]); // signal not updated
    expect(service.totalRecords()).toBe(0);
    expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
  });

  it('should handle error and call toast error', async () => {
    const error = new HttpErrorResponse({ error: 'fail', status: 500 });
    requestServiceMock.get.mockReturnValueOnce(throwError(() => error));
    let thrownError;
    try {
      await service.getAiUsageLogs(mockRequest).toPromise();
    } catch (e) {
      thrownError = e;
    }
    expect(thrownError).toBe(error);
    expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
  });

  it('extractListUsageLogs returns null for invalid response', () => {
    expect(
      (service as any)['extractListUsageLogs']({ statusCode: 4000, data: {} })
    ).toBeNull();
  });

  it('extractListUsageLogs returns logs for valid response', () => {
    expect((service as any)['extractListUsageLogs'](mockResponse)).toEqual(
      mockLogs
    );
  });

  it('handleAiUsageLogsResponse updates signals on success', () => {
    (service as any)['handleAiUsageLogsResponse'](mockResponse);
    expect(service.aiUsageLogs()).toEqual(mockLogs);
    expect(service.totalRecords()).toBe(1);
  });

  it('handleAiUsageLogsResponse calls toast on error', () => {
    (service as any)['handleAiUsageLogsResponse'](mockInvalidResponse);
    expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
  });
});
