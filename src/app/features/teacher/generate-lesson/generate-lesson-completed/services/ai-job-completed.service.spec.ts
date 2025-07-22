import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { of, throwError, firstValueFrom } from 'rxjs';

import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';
import { AiJobCompletedService } from './ai-job-completed.service';

import { StatusCode } from '../../../../../shared/constants/status-code.constant';
import { JobStatus } from '../../../../../shared/models/enum/job-status.enum';

// Mock RequestService
class RequestServiceMock {
  get = vi.fn();
}
// Mock ToastHandlingService
class ToastHandlingServiceMock {
  errorGeneral = vi.fn();
}

describe('AiJobCompletedService', () => {
  let service: AiJobCompletedService;
  let requestService: RequestServiceMock;
  let toastService: ToastHandlingServiceMock;

  const mockAiJob = [
    {
      id: '1',
      jobStatus: JobStatus.Completed,
      status: 'done',
      topic: 'test',
      type: 'video',
      sourceBlobNames: [],
      contentBlobName: '',
      videoOutputBlobName: '',
      audioOutputBlobName: '',
      audioCost: 0,
      videoCost: 0,
      wordCount: 100,
      failureReason: '',
      userId: 'u1',
      user: {
        id: 'u1',
        fullName: 'User',
        phoneNumber: '',
        email: '',
        avatarUrl: '',
        school: undefined,
        roles: [],
        creditBalance: 0,
        is2FAEnabled: false,
        isEmailConfirmed: true,
        status: 1,
        userSubscriptionResponse: {
          isSubscriptionActive: true,
          subscriptionEndDate: '',
        },
      },
      createdAt: '',
      lastModifiedAt: '',
    },
  ];

  const mockRequest = { pageIndex: 1, pageSize: 10 };
  const mockResponse = {
    statusCode: StatusCode.SUCCESS,
    data: { data: mockAiJob, count: 1 },
  };
  const mockFailResponse = {
    statusCode: 4000,
    data: { data: [], count: 0 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AiJobCompletedService,
        { provide: RequestService, useClass: RequestServiceMock },
        { provide: ToastHandlingService, useClass: ToastHandlingServiceMock },
      ],
    });
    service = TestBed.inject(AiJobCompletedService);
    // @ts-ignore
    requestService = service['requestService'];
    // @ts-ignore
    toastService = service['toastHandlingService'];
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAiJobCompleted: thành công, cập nhật signals và trả về danh sách', async () => {
    requestService.get.mockReturnValue(of(mockResponse));
    const result = await firstValueFrom(service.getAiJobCompleted(mockRequest));
    expect(result).toEqual(mockAiJob);
    expect(service.jobList()).toEqual(mockAiJob);
    expect(service.totalJobs()).toBe(1);
    expect(toastService.errorGeneral).not.toHaveBeenCalled();
  });

  it('getAiJobCompleted: thất bại (statusCode != SUCCESS), gọi toast, signals không đổi', async () => {
    requestService.get.mockReturnValue(of(mockFailResponse));
    const result = await firstValueFrom(service.getAiJobCompleted(mockRequest));
    expect(result).toBeNull();
    expect(toastService.errorGeneral).toHaveBeenCalled();
    expect(service.jobList()).toEqual([]); // signals không đổi
    expect(service.totalJobs()).toBe(0);
  });

  it('getAiJobCompleted: lỗi HTTP, gọi toast, observable throw', async () => {
    const httpError = { status: 500 };
    requestService.get.mockReturnValue(throwError(() => httpError));
    await expect(
      firstValueFrom(service.getAiJobCompleted(mockRequest))
    ).rejects.toEqual(httpError);
    expect(toastService.errorGeneral).toHaveBeenCalled();
  });

  it('signals phản ánh đúng dữ liệu sau khi gọi thành công', async () => {
    requestService.get.mockReturnValue(of(mockResponse));
    const result = await firstValueFrom(service.getAiJobCompleted(mockRequest));
    expect(service.jobList()).toEqual(mockAiJob);
    expect(service.totalJobs()).toBe(1);
  });
});
