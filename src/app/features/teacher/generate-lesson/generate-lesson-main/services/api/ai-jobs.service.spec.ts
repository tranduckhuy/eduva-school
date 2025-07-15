import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiJobsService } from './ai-jobs.service';
import { RequestService } from '../../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../../../shared/constants/status-code.constant';
import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { of, throwError, lastValueFrom } from 'rxjs';

// Mock RequestService
const requestServiceMock = {
  postWithFormData: vi.fn(),
  post: vi.fn(),
};

// Mock ToastHandlingService
const toastHandlingServiceMock = {
  warn: vi.fn(),
};

describe('AiJobsService', () => {
  let service: AiJobsService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: RequestService, useValue: requestServiceMock },
        { provide: ToastHandlingService, useValue: toastHandlingServiceMock },
      ],
    });
    service = TestBed.inject(AiJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set jobId signal and return data on createAiJobs success', async () => {
    const mockReq = { file: [], topic: 'abc' };
    const mockRes = {
      statusCode: StatusCode.SUCCESS,
      data: { jobId: 'jid', status: 1 },
    };
    requestServiceMock.postWithFormData.mockReturnValueOnce(of(mockRes));
    const res = await lastValueFrom(service.createAiJobs(mockReq));
    expect(res).toEqual({ jobId: 'jid', status: 1 });
    expect(service.jobId()).toBe('jid');
  });

  it('should return null if createAiJobs not success', async () => {
    const mockReq = { file: [], topic: 'abc' };
    const mockRes = { statusCode: 4000, data: null };
    requestServiceMock.postWithFormData.mockReturnValueOnce(of(mockRes));
    const res = await lastValueFrom(service.createAiJobs(mockReq));
    expect(res).toBeNull();
    expect(service.generationType()).toBe(LessonGenerationType.Audio);
  });

  it('should call warn and throw if INSUFFICIENT_USER_CREDIT on createAiJobs', async () => {
    const mockReq = { file: [], topic: 'abc' };
    const error = {
      error: { statusCode: StatusCode.INSUFFICIENT_USER_CREDIT },
    };
    requestServiceMock.postWithFormData.mockReturnValueOnce(
      throwError(() => error)
    );
    await expect(lastValueFrom(service.createAiJobs(mockReq))).rejects.toBe(
      error
    );
    expect(toastHandlingServiceMock.warn).toHaveBeenCalled();
  });

  it('should set generationType signal on confirmCreateContent success', async () => {
    const jobId = 'jid';
    const req = {
      type: LessonGenerationType.Video,
      voiceConfig: { language_code: 'en', name: 'a', speaking_rate: 1 },
    };
    const mockRes = { statusCode: StatusCode.SUCCESS };
    requestServiceMock.post.mockReturnValueOnce(of(mockRes));
    const res = await lastValueFrom(service.confirmCreateContent(jobId, req));
    expect(res).toBeNull();
    expect(service.generationType()).toBe(LessonGenerationType.Video);
  });

  it('should call warn and throw if INSUFFICIENT_USER_CREDIT on confirmCreateContent', async () => {
    const jobId = 'jid';
    const req = {
      type: LessonGenerationType.Audio,
      voiceConfig: { language_code: 'en', name: 'a', speaking_rate: 1 },
    };
    const error = {
      error: { statusCode: StatusCode.INSUFFICIENT_USER_CREDIT },
    };
    requestServiceMock.post.mockReturnValueOnce(throwError(() => error));
    await expect(
      lastValueFrom(service.confirmCreateContent(jobId, req))
    ).rejects.toBe(error);
    expect(toastHandlingServiceMock.warn).toHaveBeenCalled();
  });

  it('should have default jobId and generationType signals', () => {
    expect(service.jobId()).toBe('');
    expect(service.generationType()).toBe(LessonGenerationType.Audio);
  });
});
