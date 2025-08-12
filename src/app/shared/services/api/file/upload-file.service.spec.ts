import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { UploadFileService } from './upload-file.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type FileStorageRequest } from '../../../models/api/request/command/file-storage-request.model';
import { type FileStorageResponse } from '../../../models/api/response/command/file-storage-response.model';

// Mock Supabase
const mockSupabaseClient = {
  storage: {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    list: vi.fn(),
  },
};

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
    supabase: {
      url: 'https://test.supabase.co',
      key: 'test-key',
    },
  },
}));

// Mock Supabase createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('UploadFileService', () => {
  let service: UploadFileService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;
  let httpClient: HttpClient;

  const mockFileStorageResponse: FileStorageResponse = {
    uploadTokens: [
      'https://storage.blob.core.windows.net/container/file1?token=abc',
      'https://storage.blob.core.windows.net/container/file2?token=def',
    ],
  };

  const mockFiles = [
    new File(['content1'], 'file1.txt', { type: 'text/plain' }),
    new File(['content2'], 'file2.txt', { type: 'text/plain' }),
  ];

  const mockRequest: FileStorageRequest = {
    files: [
      { blobName: 'file1.txt', fileSize: 100 },
      { blobName: 'file2.txt', fileSize: 200 },
    ],
  };

  beforeEach(() => {
    requestService = {
      post: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as any;
    httpClient = {
      put: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        UploadFileService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
        { provide: HttpClient, useValue: httpClient },
      ],
    });
    service = TestBed.inject(UploadFileService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('uploadBlobs', () => {
    it('should upload files successfully', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockFileStorageResponse })
      );
      (httpClient.put as any).mockReturnValue(of({}));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe(result => {
          expect(result).toEqual({
            ...mockFileStorageResponse,
            uploadTokens: [
              'https://storage.blob.core.windows.net/container/file1',
              'https://storage.blob.core.windows.net/container/file2',
            ],
          });
          expect(requestService.post).toHaveBeenCalledWith(
            'http://localhost:3000/api/file-storage/upload-tokens-with-quota',
            mockRequest
          );
          expect(httpClient.put).toHaveBeenCalledTimes(2);
          expect(httpClient.put).toHaveBeenCalledWith(
            'https://storage.blob.core.windows.net/container/file1?token=abc',
            mockFiles[0],
            {
              headers: { 'x-ms-blob-type': 'BlockBlob' },
              context: expect.any(HttpContext),
            }
          );
          expect(httpClient.put).toHaveBeenCalledWith(
            'https://storage.blob.core.windows.net/container/file2?token=def',
            mockFiles[1],
            {
              headers: { 'x-ms-blob-type': 'BlockBlob' },
              context: expect.any(HttpContext),
            }
          );
          resolve();
        });
      });
    });

    it('should throw error if tokens are not provided', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: { uploadTokens: null } })
      );

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: error => {
            expect(error).toBeInstanceOf(Error);
            resolve();
          },
        });
      });
    });

    it('should handle upload failures and show error for failed files', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockFileStorageResponse })
      );
      (httpClient.put as any)
        .mockReturnValueOnce(throwError(() => new Error('Upload failed')))
        .mockReturnValueOnce(of({}));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe(result => {
          expect(result).toEqual({
            ...mockFileStorageResponse,
            uploadTokens: [
              'https://storage.blob.core.windows.net/container/file1',
              'https://storage.blob.core.windows.net/container/file2',
            ],
          });
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Lỗi',
            'Không thể upload các file sau: file1.txt'
          );
          resolve();
        });
      });
    });

    it('should handle multiple upload failures', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockFileStorageResponse })
      );
      (httpClient.put as any)
        .mockReturnValueOnce(throwError(() => new Error('Upload failed 1')))
        .mockReturnValueOnce(throwError(() => new Error('Upload failed 2')));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe(result => {
          expect(result).toEqual({
            ...mockFileStorageResponse,
            uploadTokens: [
              'https://storage.blob.core.windows.net/container/file1',
              'https://storage.blob.core.windows.net/container/file2',
            ],
          });
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Lỗi',
            'Không thể upload các file sau: file1.txt, file2.txt'
          );
          resolve();
        });
      });
    });

    it('should handle STORAGE_QUOTA_EXCEEDED error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.STORAGE_QUOTA_EXCEEDED },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Đã đạt giới hạn lưu trữ',
              'Vui lòng liên hệ quản trị viên để nâng cấp gói và tiếp tục sử dụng.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle INVALID_FILE_TYPE error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_FILE_TYPE },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'Loại file không hợp lệ',
              'Vui lòng chọn file có định dạng được hỗ trợ.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle FILE_IS_REQUIRED error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.FILE_IS_REQUIRED },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'File bắt buộc',
              'Vui lòng chọn file để upload.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle INVALID_BLOB_NAME error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_BLOB_NAME },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'Tên file không hợp lệ',
              'Vui lòng đặt tên file phù hợp.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle INVALID_BLOB_URL error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.INVALID_BLOB_URL },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'URL file không hợp lệ',
              'Có lỗi xảy ra với đường dẫn file.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle BLOB_NOT_FOUND error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.BLOB_NOT_FOUND },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.error).toHaveBeenCalledWith(
              'File không tồn tại',
              'File đã bị xóa hoặc không tồn tại.'
            );
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle error with undefined error property', async () => {
      const error = new HttpErrorResponse({
        error: undefined,
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle other API errors with errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });

    it('should handle network error with errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(err).toEqual(error);
            resolve();
          },
        });
      });
    });
  });

  describe('uploadFile', () => {
    it('should upload file to Supabase successfully', async () => {
      const mockUploadData = { path: 'test/file.txt' };
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/bucket/test/file.txt';

      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: mockUploadData,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const result = await service.uploadFile(
        new File(['content'], 'test.txt'),
        'test.txt',
        'test-bucket'
      );

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'test-bucket'
      );
      expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(
        'test.txt',
        expect.any(File),
        { cacheControl: '3600', upsert: true }
      );
    });

    it('should return null if upload fails with error', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      const result = await service.uploadFile(
        new File(['content'], 'test.txt'),
        'test.txt',
        'test-bucket'
      );

      expect(result).toBeNull();
    });

    it('should return null if upload returns no data', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.uploadFile(
        new File(['content'], 'test.txt'),
        'test.txt',
        'test-bucket'
      );

      expect(result).toBeNull();
    });

    it('should return null if getPublicUrl returns no publicUrl', async () => {
      const mockUploadData = { path: 'test/file.txt' };

      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: mockUploadData,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: null },
      });

      const result = await service.uploadFile(
        new File(['content'], 'test.txt'),
        'test.txt',
        'test-bucket'
      );

      expect(result).toBeNull();
    });

    it('should handle unexpected errors', async () => {
      mockSupabaseClient.storage.upload.mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await service.uploadFile(
        new File(['content'], 'test.txt'),
        'test.txt',
        'test-bucket'
      );

      expect(result).toBeNull();
    });

    it('should handle Blob input', async () => {
      const mockUploadData = { path: 'test/file.txt' };
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/bucket/test/file.txt';

      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: mockUploadData,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const blob = new Blob(['content'], { type: 'text/plain' });
      const result = await service.uploadFile(blob, 'test.txt', 'test-bucket');

      expect(result).toBe(mockPublicUrl);
    });
  });

  describe('getPublicUrls', () => {
    it('should return public URLs successfully without folder path', async () => {
      const mockFiles = [{ name: 'image1.jpg' }, { name: 'image2.png' }];
      const mockPublicUrls = [
        'https://test.supabase.co/storage/v1/object/public/classroom-images/image1.jpg',
        'https://test.supabase.co/storage/v1/object/public/classroom-images/image2.png',
      ];

      mockSupabaseClient.storage.list.mockResolvedValue({
        data: mockFiles,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl
        .mockReturnValueOnce({ data: { publicUrl: mockPublicUrls[0] } })
        .mockReturnValueOnce({ data: { publicUrl: mockPublicUrls[1] } });

      const result = await service.getPublicUrls('classroom-images');

      expect(result).toEqual(mockPublicUrls);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'classroom-images'
      );
      expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith(undefined);
    });

    it('should return public URLs successfully with folder path', async () => {
      const mockFiles = [{ name: 'image1.jpg' }, { name: 'image2.png' }];
      const mockPublicUrls = [
        'https://test.supabase.co/storage/v1/object/public/classroom-images/backgrounds/image1.jpg',
        'https://test.supabase.co/storage/v1/object/public/classroom-images/backgrounds/image2.png',
      ];

      mockSupabaseClient.storage.list.mockResolvedValue({
        data: mockFiles,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl
        .mockReturnValueOnce({ data: { publicUrl: mockPublicUrls[0] } })
        .mockReturnValueOnce({ data: { publicUrl: mockPublicUrls[1] } });

      const result = await service.getPublicUrls(
        'classroom-images',
        'backgrounds'
      );

      expect(result).toEqual(mockPublicUrls);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'classroom-images'
      );
      expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith(
        'backgrounds'
      );
    });

    it('should return empty array if list fails with error', async () => {
      mockSupabaseClient.storage.list.mockResolvedValue({
        data: null,
        error: { message: 'List failed' },
      });

      const result = await service.getPublicUrls('classroom-images');

      expect(result).toEqual([]);
    });

    it('should return empty array if list returns no data', async () => {
      mockSupabaseClient.storage.list.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.getPublicUrls('classroom-images');

      expect(result).toEqual([]);
    });

    it('should return empty array if list returns empty array', async () => {
      mockSupabaseClient.storage.list.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getPublicUrls('classroom-images');

      expect(result).toEqual([]);
    });

    it('should handle getPublicUrl returning null publicUrl', async () => {
      const mockFiles = [{ name: 'image1.jpg' }];

      mockSupabaseClient.storage.list.mockResolvedValue({
        data: mockFiles,
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: null },
      });

      const result = await service.getPublicUrls('classroom-images');

      expect(result).toEqual([null]);
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL successfully for file in folder', async () => {
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/classroom-images/backgrounds/image1.jpg';

      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        'backgrounds',
        'image1.jpg'
      );

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'classroom-images'
      );
      expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
        'backgrounds/image1.jpg'
      );
    });

    it('should return public URL successfully for file in root bucket', async () => {
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/classroom-images/image1.jpg';

      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        '',
        'image1.jpg'
      );

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'classroom-images'
      );
      expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
        '/image1.jpg'
      );
    });

    it('should return null if getPublicUrl returns no data', async () => {
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: null,
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        'backgrounds',
        'image1.jpg'
      );

      expect(result).toBeNull();
    });

    it('should return null if getPublicUrl returns null publicUrl', async () => {
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: null },
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        'backgrounds',
        'image1.jpg'
      );

      expect(result).toBeNull();
    });

    it('should return null if getPublicUrl throws error', async () => {
      mockSupabaseClient.storage.getPublicUrl.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        'backgrounds',
        'image1.jpg'
      );

      expect(result).toBeNull();
    });

    it('should handle empty folder path correctly', async () => {
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/classroom-images/image1.jpg';

      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        '',
        'image1.jpg'
      );

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
        '/image1.jpg'
      );
    });

    it('should handle special characters in file names', async () => {
      const mockPublicUrl =
        'https://test.supabase.co/storage/v1/object/public/classroom-images/backgrounds/image%201.jpg';

      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      const result = await service.getPublicUrlFromFolder(
        'classroom-images',
        'backgrounds',
        'image 1.jpg'
      );

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
        'backgrounds/image 1.jpg'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: { uploadTokens: [] } })
      );

      await new Promise<void>(resolve => {
        service.uploadBlobs({ files: [] }, []).subscribe({
          next: result => {
            expect(result).toEqual({ uploadTokens: [] });
          },
          complete: () => resolve(),
        });
      });
    });

    it('should handle single file upload', async () => {
      const singleFile = [new File(['content'], 'single.txt')];
      const singleRequest = {
        files: [{ blobName: 'single.txt', fileSize: 100 }],
      };
      const singleResponse = {
        uploadTokens: [
          'https://storage.blob.core.windows.net/container/single?token=abc',
        ],
      };

      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: singleResponse })
      );
      (httpClient.put as any).mockReturnValue(of({}));

      await new Promise<void>(resolve => {
        service.uploadBlobs(singleRequest, singleFile).subscribe(result => {
          expect(result).toEqual({
            ...singleResponse,
            uploadTokens: [
              'https://storage.blob.core.windows.net/container/single',
            ],
          });
          expect(httpClient.put).toHaveBeenCalledTimes(1);
          resolve();
        });
      });
    });

    it('should throw error if response data is null', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: null })
      );

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: error => {
            expect(error).toBeInstanceOf(Error);
            resolve();
          },
        });
      });
    });

    it('should throw error if uploadTokens is undefined', async () => {
      const responseWithoutTokens = {
        uploadTokens: undefined,
      };

      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: responseWithoutTokens })
      );

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(err).toBeInstanceOf(Error);
            resolve();
          },
        });
      });
    });

    it('should handle non-HttpErrorResponse error', async () => {
      const nonHttpError = new Error('Network error');

      (requestService.post as any).mockReturnValue(
        throwError(() => nonHttpError)
      );

      await new Promise<void>(resolve => {
        service.uploadBlobs(mockRequest, mockFiles).subscribe({
          error: err => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            expect(err).toEqual(nonHttpError);
            resolve();
          },
        });
      });
    });
  });
});
