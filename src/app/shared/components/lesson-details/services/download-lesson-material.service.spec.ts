import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest';

import { DownloadLessonMaterialService } from './download-lesson-material.service';
import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

vi.mock('../../../utils/util-functions', () => {
  return {
    getFileName: vi.fn(() => 'mock-file-name.pdf'),
    triggerBlobDownload: vi.fn(),
  };
});

import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';

describe('DownloadLessonMaterialService', () => {
  let service: DownloadLessonMaterialService;
  let requestService: { getFile: Mock };
  let toastService: { successGeneral: Mock; errorGeneral: Mock };

  beforeEach(() => {
    requestService = {
      getFile: vi.fn(),
    };

    toastService = {
      successGeneral: vi.fn(),
      errorGeneral: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DownloadLessonMaterialService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastService },
      ],
    });

    service = TestBed.inject(DownloadLessonMaterialService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('downloadLessonMaterial() – success with non-empty blob: shows success toast, gets name, triggers download, passes correct options', async () => {
    const url = 'https://example.com/file';
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const headers = new HttpHeaders({
      'content-disposition': 'attachment; filename="any.pdf"',
    });

    requestService.getFile.mockReturnValue(
      of(
        new HttpResponse<Blob>({
          body: blob,
          headers,
          status: 200,
          statusText: 'OK',
          url,
        })
      )
    );

    const res = await firstValueFrom(service.downloadLessonMaterial(url));
    expect(res.status).toBe(200);

    expect(requestService.getFile).toHaveBeenCalledTimes(1);
    expect(requestService.getFile).toHaveBeenCalledWith(url, undefined, {
      bypassAuth: true,
      loadingKey: 'download-lesson-material',
    });

    expect(toastService.successGeneral).toHaveBeenCalledTimes(1);
    expect(getFileName).toHaveBeenCalledTimes(1);
    expect(triggerBlobDownload).toHaveBeenCalledWith(
      'mock-file-name.pdf',
      blob
    );

    expect(toastService.errorGeneral).not.toHaveBeenCalled();
  });

  it('downloadLessonMaterial() – empty blob: shows error toast, does not trigger download', async () => {
    const url = 'https://example.com/empty';
    const emptyBlob = new Blob([]); // size = 0

    requestService.getFile.mockReturnValue(
      of(
        new HttpResponse<Blob>({
          body: emptyBlob,
          status: 200,
          statusText: 'OK',
          url,
        })
      )
    );

    await firstValueFrom(service.downloadLessonMaterial(url));

    expect(toastService.errorGeneral).toHaveBeenCalledTimes(1);
    expect(toastService.successGeneral).not.toHaveBeenCalled();
    expect(triggerBlobDownload).not.toHaveBeenCalled();
  });

  it('downloadLessonMaterial() – null body: shows error toast, does not trigger download', async () => {
    const url = 'https://example.com/null-body';

    requestService.getFile.mockReturnValue(
      of(
        new HttpResponse<Blob>({
          body: null,
          status: 200,
          statusText: 'OK',
          url,
        })
      )
    );

    await firstValueFrom(service.downloadLessonMaterial(url));

    expect(toastService.errorGeneral).toHaveBeenCalledTimes(1);
    expect(toastService.successGeneral).not.toHaveBeenCalled();
    expect(triggerBlobDownload).not.toHaveBeenCalled();
  });

  it('downloadLessonMaterial() – error from RequestService: shows error toast and rethrows', async () => {
    const url = 'https://example.com/err';
    const httpErr = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
      url,
      error: { message: 'boom' },
    });

    requestService.getFile.mockReturnValue(throwError(() => httpErr));

    await expect(
      firstValueFrom(service.downloadLessonMaterial(url))
    ).rejects.toBeInstanceOf(HttpErrorResponse);

    expect(toastService.errorGeneral).toHaveBeenCalledTimes(1);
    expect(toastService.successGeneral).not.toHaveBeenCalled();
    expect(triggerBlobDownload).not.toHaveBeenCalled();
    expect(getFileName).not.toHaveBeenCalled();
  });
});
