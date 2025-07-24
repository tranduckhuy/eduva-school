import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiJobsService } from './ai-jobs.service';
import { RequestService } from '../../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../../../shared/constants/status-code.constant';
import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { of, throwError, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';

// Mock RequestService
const requestServiceMock = {
  postWithFormData: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
};

// Mock ToastHandlingService
const toastHandlingServiceMock = {
  warn: vi.fn(),
};

// Mock HttpClient
const httpClientMock = {
  head: vi.fn(),
};

vi.mock('@angular/common/http', async () => {
  const actual = await vi.importActual<any>('@angular/common/http');
  return {
    ...actual,
    HttpClient: vi.fn(() => httpClientMock),
  };
});

vi.mock('../../../../../../../environments/environment', () => ({
  environment: { baseApiUrl: 'http://mock-api' },
}));

describe('AiJobsService', () => {
  let service: AiJobsService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: RequestService, useValue: requestServiceMock },
        { provide: ToastHandlingService, useValue: toastHandlingServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
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

  it('should get job by id and set job signal on success', async () => {
    const jobId = 'jid';
    const mockRes = {
      statusCode: StatusCode.SUCCESS,
      data: { jobId, status: 1 },
    };
    requestServiceMock.get = vi.fn().mockReturnValueOnce(of(mockRes));
    const res = await lastValueFrom(service.getJobById(jobId));
    expect(res).toEqual({ jobId, status: 1 });
    expect(service.job()).toEqual({ jobId, status: 1 });
  });

  it('should return null if getJobById not success', async () => {
    const jobId = 'jid';
    const mockRes = { statusCode: 4000, data: null };
    requestServiceMock.get = vi.fn().mockReturnValueOnce(of(mockRes));
    const res = await lastValueFrom(service.getJobById(jobId));
    expect(res).toBeNull();
    expect(service.job()).toBeNull();
  });

  it('should call warn and throw if INSUFFICIENT_USER_CREDIT on getJobById', async () => {
    const jobId = 'jid';
    const error = {
      error: { statusCode: StatusCode.INSUFFICIENT_USER_CREDIT },
    };
    requestServiceMock.get = vi
      .fn()
      .mockReturnValueOnce(throwError(() => error));
    await expect(lastValueFrom(service.getJobById(jobId))).rejects.toBe(error);
    expect(toastHandlingServiceMock.warn).toHaveBeenCalled();
  });

  it('should get file size by blob name url with Content-Length', async () => {
    const url = 'http://file';
    const headers = { get: vi.fn().mockReturnValue('1234') };
    httpClientMock.head.mockReturnValueOnce(of({ headers }));
    const res = await lastValueFrom(service.getFileSizeByBlobNameUrl(url));
    expect(res).toBe(1234);
    expect(httpClientMock.head).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ observe: 'response' })
    );
  });

  it('should get file size by blob name url with missing Content-Length', async () => {
    const url = 'http://file';
    const headers = { get: vi.fn().mockReturnValue(null) };
    httpClientMock.head.mockReturnValueOnce(of({ headers }));
    const res = await lastValueFrom(service.getFileSizeByBlobNameUrl(url));
    expect(res).toBe(1);
  });

  it('should throw error on getFileSizeByBlobNameUrl error', async () => {
    const url = 'http://file';
    const error = { status: 500 };
    httpClientMock.head.mockReturnValueOnce(throwError(() => error));
    await expect(
      lastValueFrom(service.getFileSizeByBlobNameUrl(url))
    ).rejects.toBe(error);
  });

  it('should clear job signal', () => {
    (service as any).jobSignal.set({ jobId: 'jid', status: 1 });
    service.clearJob();
    expect(service.job()).toBeNull();
  });

  it('should extractData return data on success', () => {
    const res = { statusCode: StatusCode.SUCCESS, data: { foo: 'bar' } };
    expect(service['extractData'](res)).toEqual({ foo: 'bar' });
  });

  it('should extractData return null on failure', () => {
    const res = { statusCode: 4000, data: null };
    expect(service['extractData'](res)).toBeNull();
  });

  it('should have default jobId and generationType signals', () => {
    expect(service.jobId()).toBe('');
    expect(service.generationType()).toBe(LessonGenerationType.Audio);
  });
});
