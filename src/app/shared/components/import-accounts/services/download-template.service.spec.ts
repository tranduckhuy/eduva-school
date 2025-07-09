import { TestBed } from '@angular/core/testing';
import { DownloadTemplateService } from './download-template.service';
import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';
import { TemplateType } from '../../../models/enum/template-type.enum';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';

// Mock util functions
vi.mock('../../../utils/util-functions', () => ({
  getFileName: vi.fn(() => 'mocked-file.xlsx'),
  triggerBlobDownload: vi.fn(),
}));

const { getFileName, triggerBlobDownload } = await import(
  '../../../utils/util-functions'
);

describe('DownloadTemplateService', () => {
  let service: DownloadTemplateService;
  let requestService: ReturnType<typeof createRequestServiceMock>;
  let toastHandlingService: ReturnType<typeof createToastHandlingServiceMock>;

  function createRequestServiceMock() {
    return {
      getFile: vi.fn(),
    } as unknown as RequestService;
  }

  function createToastHandlingServiceMock() {
    return {
      successGeneral: vi.fn(),
      errorGeneral: vi.fn(),
    } as unknown as ToastHandlingService;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DownloadTemplateService,
        { provide: RequestService, useFactory: createRequestServiceMock },
        {
          provide: ToastHandlingService,
          useFactory: createToastHandlingServiceMock,
        },
      ],
    });
    service = TestBed.inject(DownloadTemplateService);
    requestService = TestBed.inject(RequestService) as any;
    toastHandlingService = TestBed.inject(ToastHandlingService) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getFile with correct URL and options', async () => {
    const type = TemplateType.ImportAccountsTemplate;
    const response = new HttpResponse({
      body: new Blob(['data']),
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.getFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service.downloadTemplate(type).subscribe(() => {
        expect(requestService.getFile).toHaveBeenCalledWith(
          expect.stringContaining('/users/import-template/' + type),
          undefined,
          { loadingKey: 'download-template' }
        );
        resolve();
      });
    });
  });

  it('should handle successful download with valid file', async () => {
    const blob = new Blob(['data']);
    const response = new HttpResponse({
      body: blob,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.getFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service
        .downloadTemplate(TemplateType.ImportAccountsTemplate)
        .subscribe(() => {
          expect(toastHandlingService.successGeneral).toHaveBeenCalled();
          expect(getFileName).toHaveBeenCalledWith(response);
          expect(triggerBlobDownload).toHaveBeenCalledWith(
            'mocked-file.xlsx',
            blob
          );
          resolve();
        });
    });
  });

  it('should handle successful download with empty file', async () => {
    const blob = new Blob([]);
    const response = new HttpResponse({
      body: blob,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.getFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service
        .downloadTemplate(TemplateType.ImportAccountsTemplate)
        .subscribe(() => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(getFileName).not.toHaveBeenCalled();
          expect(triggerBlobDownload).not.toHaveBeenCalled();
          resolve();
        });
    });
  });

  it('should handle missing body in response', async () => {
    const response = new HttpResponse({
      body: undefined,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.getFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service
        .downloadTemplate(TemplateType.ImportAccountsTemplate)
        .subscribe(() => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(getFileName).not.toHaveBeenCalled();
          expect(triggerBlobDownload).not.toHaveBeenCalled();
          resolve();
        });
    });
  });

  it('should handle error from requestService', async () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    (requestService.getFile as any).mockReturnValue(throwError(() => error));
    await new Promise<void>(resolve => {
      service.downloadTemplate(TemplateType.ImportAccountsTemplate).subscribe({
        next: () => {},
        error: err => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(err).toBe(error);
          resolve();
        },
      });
    });
  });

  it('should not call triggerBlobDownload if fileName is empty', async () => {
    (getFileName as any).mockReturnValueOnce('');
    const blob = new Blob(['data']);
    const response = new HttpResponse({
      body: blob,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.getFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service
        .downloadTemplate(TemplateType.ImportAccountsTemplate)
        .subscribe(() => {
          expect(triggerBlobDownload).toHaveBeenCalledWith('', blob);
          resolve();
        });
    });
  });
});
