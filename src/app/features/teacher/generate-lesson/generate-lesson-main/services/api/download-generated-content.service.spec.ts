import { TestBed } from '@angular/core/testing';
import {
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { DownloadGeneratedContentService } from './download-generated-content.service';
import { RequestService } from '../../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import * as utilFunctions from '../../../../../../shared/utils/util-functions';

// Mock browser APIs
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
  writable: true,
});

describe('DownloadGeneratedContentService', () => {
  let service: DownloadGeneratedContentService;
  let requestServiceMock: any;
  let toastHandlingServiceMock: any;
  let getFileNameSpy: any;
  let triggerBlobDownloadSpy: any;

  const mockBlob = new Blob(['test content'], { type: 'text/plain' });
  const mockResponse = new HttpResponse({
    body: mockBlob,
    status: 200,
    headers: new HttpHeaders({
      'Content-Disposition': 'attachment; filename="test-file.txt"',
    }),
  });

  beforeEach(() => {
    const requestServiceSpy = {
      getFile: vi.fn(),
    };

    const toastHandlingServiceSpy = {
      successGeneral: vi.fn(),
      errorGeneral: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DownloadGeneratedContentService,
        { provide: RequestService, useValue: requestServiceSpy },
        { provide: ToastHandlingService, useValue: toastHandlingServiceSpy },
      ],
    });

    service = TestBed.inject(DownloadGeneratedContentService);
    requestServiceMock = TestBed.inject(RequestService);
    toastHandlingServiceMock = TestBed.inject(ToastHandlingService);

    getFileNameSpy = vi.spyOn(utilFunctions, 'getFileName');
    triggerBlobDownloadSpy = vi.spyOn(utilFunctions, 'triggerBlobDownload');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('downloadGeneratedContent', () => {
    const testUrl = 'https://api.example.com/download/test-file';

    it('should call requestService.getFile with correct parameters', () => {
      requestServiceMock.getFile.mockReturnValue(of(mockResponse));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(requestServiceMock.getFile).toHaveBeenCalledWith(
        testUrl,
        undefined,
        {
          bypassAuth: true,
          loadingKey: 'download-generated-content',
        }
      );
    });

    it('should handle successful download with valid blob', () => {
      const mockFileName = 'test-file.txt';
      getFileNameSpy.mockReturnValue(mockFileName);
      requestServiceMock.getFile.mockReturnValue(of(mockResponse));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(getFileNameSpy).toHaveBeenCalledWith(mockResponse);
      expect(triggerBlobDownloadSpy).toHaveBeenCalledWith(
        mockFileName,
        mockBlob
      );
      expect(toastHandlingServiceMock.successGeneral).toHaveBeenCalled();
      expect(toastHandlingServiceMock.errorGeneral).not.toHaveBeenCalled();
    });

    it('should handle download with empty blob', () => {
      const mockEmptyResponse = new HttpResponse({
        body: new Blob(),
        status: 200,
      });
      requestServiceMock.getFile.mockReturnValue(of(mockEmptyResponse));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
      expect(toastHandlingServiceMock.successGeneral).not.toHaveBeenCalled();
      expect(triggerBlobDownloadSpy).not.toHaveBeenCalled();
    });

    it('should handle download with null blob', () => {
      const mockNullResponse = new HttpResponse({
        body: new Blob(),
        status: 200,
      });
      requestServiceMock.getFile.mockReturnValue(of(mockNullResponse));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
      expect(toastHandlingServiceMock.successGeneral).not.toHaveBeenCalled();
      expect(triggerBlobDownloadSpy).not.toHaveBeenCalled();
    });

    it('should handle HTTP error response', () => {
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Download failed',
        status: 500,
        statusText: 'Internal Server Error',
      });
      requestServiceMock.getFile.mockReturnValue(
        throwError(() => mockErrorResponse)
      );

      service.downloadGeneratedContent(testUrl).subscribe({
        error: error => {
          expect(error).toBe(mockErrorResponse);
        },
      });

      expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
      expect(toastHandlingServiceMock.successGeneral).not.toHaveBeenCalled();
      expect(triggerBlobDownloadSpy).not.toHaveBeenCalled();
    });

    it('should handle network error', () => {
      const networkError = new HttpErrorResponse({
        error: new Error('Network Error'),
        status: 0,
        statusText: 'Network Error',
      });
      requestServiceMock.getFile.mockReturnValue(
        throwError(() => networkError)
      );

      service.downloadGeneratedContent(testUrl).subscribe({
        error: error => {
          expect(error).toBe(networkError);
        },
      });

      expect(toastHandlingServiceMock.errorGeneral).toHaveBeenCalled();
      expect(toastHandlingServiceMock.successGeneral).not.toHaveBeenCalled();
      expect(triggerBlobDownloadSpy).not.toHaveBeenCalled();
    });

    it('should handle successful download with different file types', () => {
      const pdfBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const pdfResponse = new HttpResponse({
        body: pdfBlob,
        status: 200,
        headers: new HttpHeaders({
          'Content-Disposition': 'attachment; filename="document.pdf"',
        }),
      });
      const mockFileName = 'document.pdf';
      getFileNameSpy.mockReturnValue(mockFileName);
      requestServiceMock.getFile.mockReturnValue(of(pdfResponse));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(getFileNameSpy).toHaveBeenCalledWith(pdfResponse);
      expect(triggerBlobDownloadSpy).toHaveBeenCalledWith(
        mockFileName,
        pdfBlob
      );
      expect(toastHandlingServiceMock.successGeneral).toHaveBeenCalled();
    });

    it('should handle response without Content-Disposition header', () => {
      const responseWithoutHeader = new HttpResponse({
        body: mockBlob,
        status: 200,
      });
      const mockFileName = 'downloaded_file_2024-01-01';
      getFileNameSpy.mockReturnValue(mockFileName);
      requestServiceMock.getFile.mockReturnValue(of(responseWithoutHeader));

      service.downloadGeneratedContent(testUrl).subscribe();

      expect(getFileNameSpy).toHaveBeenCalledWith(responseWithoutHeader);
      expect(triggerBlobDownloadSpy).toHaveBeenCalledWith(
        mockFileName,
        mockBlob
      );
      expect(toastHandlingServiceMock.successGeneral).toHaveBeenCalled();
    });
  });
});
