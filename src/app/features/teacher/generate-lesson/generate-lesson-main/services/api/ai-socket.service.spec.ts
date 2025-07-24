import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiSocketService } from './ai-socket.service';
import { JobStatus } from '../../../../../../shared/models/enum/job-status.enum';
import { type UpdateAiJobProgressResponse } from '../../models/response/command/update-ai-job-progress-response.model';
import { JwtService } from '../../../../../../core/auth/services/jwt.service';
import { MessageService } from 'primeng/api';

// Mock environment
vi.mock('../../../../../../../environments/environment', () => ({
  environment: {
    baseHubUrl: 'http://mock-hub-url',
  },
}));

// Mock JwtService
const jwtServiceMock = {
  getAccessToken: vi.fn(() => 'mock-access-token'),
};

// Mock ToastHandlingService
const toastHandlingServiceMock = {
  errorGeneral: vi.fn(),
};

// Mock MessageService
const messageServiceMock = {
  add: vi.fn(),
  clear: vi.fn(),
};

// Mock signalR
const startMock = vi.fn();
const stopMock = vi.fn();
const onMock = vi.fn();
const withUrlMock = vi.fn(function (this: any) {
  return this;
});
const configureLoggingMock = vi.fn(function (this: any) {
  return this;
});
const withAutomaticReconnectMock = vi.fn(function (this: any) {
  return this;
});
const buildMock = vi.fn(() => HubConnectionMock());

const HubConnectionMock = vi.fn(() => ({
  start: startMock,
  stop: stopMock,
  on: onMock,
}));

function HubConnectionBuilderMock(this: any) {
  return {
    withUrl: withUrlMock,
    configureLogging: configureLoggingMock,
    withAutomaticReconnect: withAutomaticReconnectMock,
    build: buildMock,
  };
}

const LogLevelMock = { Information: 1 };

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: HubConnectionBuilderMock,
  LogLevel: { Information: 1 },
}));

describe('AiSocketService', () => {
  let service: AiSocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    });
    service = TestBed.inject(AiSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect and set up signalR connection with correct url', async () => {
    const jobId = 'job-123';
    const payload: UpdateAiJobProgressResponse = {
      jobId,
      status: JobStatus.Processing,
      wordCount: 100,
      contentBlobName: 'blob',
      previewContent: 'preview',
      audioCost: 1,
      videoCost: 2,
      videoOutputBlobNameUrl: 'url',
      audioOutputBlobNameUrl: 'url',
      estimatedDurationMinutes: 1,
      actualDurationSeconds: 1,
      failureReason: '',
      lastModifiedAt: 'now',
    };
    startMock.mockResolvedValueOnce(undefined);
    onMock.mockImplementationOnce((event, cb) => {
      if (event === 'JobStatusUpdated') {
        cb(payload);
      }
    });
    service.connect(jobId);
    await Promise.resolve();
    expect(withUrlMock).toHaveBeenCalledWith(
      'http://mock-hub-url/job-status',
      expect.objectContaining({
        accessTokenFactory: expect.any(Function),
      })
    );
    expect(configureLoggingMock).toHaveBeenCalledWith(LogLevelMock.Information);
    expect(withAutomaticReconnectMock).toHaveBeenCalled();
    expect(buildMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();
    expect(onMock).toHaveBeenCalledWith(
      'JobStatusUpdated',
      expect.any(Function)
    );
    expect(service.jobUpdateProgress()).toEqual(payload);
  });

  it('should disconnect and clear connection', () => {
    service['connection'] = { stop: stopMock } as any;
    service.disconnect();
    expect(stopMock).toHaveBeenCalled();
    expect(service['connection']).toBeNull();
  });

  it('should reset signal', () => {
    (service as any).jobUpdateProgressSignal.set({ jobId: 'abc' } as any);
    service.resetSignal();
    expect(service.jobUpdateProgress()).toBeNull();
  });

  it('should handle connection error and call toast + set failureReason', async () => {
    const jobId = 'job-err';
    startMock.mockRejectedValueOnce(new Error('fail'));
    service.connect(jobId);
    await Promise.resolve();
    await Promise.resolve();
    expect(service.jobUpdateProgress()).toEqual(
      expect.objectContaining({
        failureReason: expect.stringContaining('Đã xảy ra lỗi'),
      })
    );
  });

  it('should not update signal if jobId does not match', async () => {
    const jobId = 'job-1';
    const payload: UpdateAiJobProgressResponse = {
      jobId: 'other-job',
      status: JobStatus.Processing,
      wordCount: 0,
      contentBlobName: '',
      previewContent: '',
      audioCost: 0,
      videoCost: 0,
      audioOutputBlobNameUrl: '',
      videoOutputBlobNameUrl: '',
      estimatedDurationMinutes: 0,
      actualDurationSeconds: 0,
      failureReason: '',
      lastModifiedAt: '',
    };
    startMock.mockResolvedValueOnce(undefined);
    onMock.mockImplementationOnce((event, cb) => {
      if (event === 'JobStatusUpdated') {
        cb(payload);
      }
    });
    service.connect(jobId);
    await Promise.resolve();
    expect(service.jobUpdateProgress()).toBeNull();
  });
});
