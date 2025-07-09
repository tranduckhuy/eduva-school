import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { LessonMaterialsService } from './lesson-materials.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { LessonMaterial } from '../../../models/entities/lesson-material.model';
import { CreateLessonMaterialsRequest } from '../../../models/api/request/command/create-lesson-material-request.model';
import {
  GetLessonMaterialsRequest,
  GetPendingLessonMaterialsRequest,
} from '../../../models/api/request/query/get-lesson-materials-request.model';
import { GetPagingLessonMaterialsResponse } from '../../../models/api/response/query/get-lesson-materials-response.model';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LessonMaterialsService', () => {
  let service: LessonMaterialsService;
  let requestService: ReturnType<typeof createRequestServiceMock>;
  let toastHandlingService: ReturnType<typeof createToastHandlingServiceMock>;

  function createRequestServiceMock() {
    return {
      post: vi.fn(),
      get: vi.fn(),
    } as unknown as RequestService;
  }

  function createToastHandlingServiceMock() {
    return {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      errorGeneral: vi.fn(),
    } as unknown as ToastHandlingService;
  }

  const mockLessonMaterial: LessonMaterial = {
    id: '1',
    schoolId: 1,
    title: 'Test Material',
    description: 'Test Description',
    contentType: 'pdf' as any,
    tag: 'test',
    lessonStatus: 'active' as any,
    duration: 60,
    fileSize: 1024,
    isAIContent: false,
    sourceUrl: 'http://example.com/file.pdf',
    visibility: 'public' as any,
    createdAt: '2024-01-01T00:00:00Z',
    lastModifiedAt: null,
    status: 0, // EntityStatus.Active
    createdById: 'user1',
    createdByName: 'Test User',
  };

  const mockPagingResponse: GetPagingLessonMaterialsResponse = {
    data: [mockLessonMaterial],
    count: 1,
    pageIndex: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LessonMaterialsService,
        { provide: RequestService, useFactory: createRequestServiceMock },
        {
          provide: ToastHandlingService,
          useFactory: createToastHandlingServiceMock,
        },
      ],
    });
    service = TestBed.inject(LessonMaterialsService);
    requestService = TestBed.inject(RequestService) as any;
    toastHandlingService = TestBed.inject(ToastHandlingService) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have readonly signals', () => {
      expect(service.lessonMaterials).toBeDefined();
      expect(service.lessonMaterial).toBeDefined();
      expect(service.totalRecords).toBeDefined();
    });
  });

  describe('createLessonMaterials', () => {
    const mockRequest: CreateLessonMaterialsRequest = {
      folderId: 'folder1',
      blobNames: ['test.pdf'],
      lessonMaterials: [
        {
          title: 'Test Material',
          description: 'Test Description',
          contentType: 'pdf' as any,
          tag: 'test',
          duration: 60,
          fileSize: 1024,
          isAIContent: false,
          sourceUrl: 'http://example.com/file.pdf',
        },
      ],
    };

    it('should create lesson materials successfully', async () => {
      const successResponse = { statusCode: StatusCode.SUCCESS };
      (requestService.post as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.createLessonMaterials(mockRequest).subscribe(() => {
          expect(requestService.post).toHaveBeenCalledWith(
            expect.stringContaining('/lesson-materials'),
            mockRequest
          );
          expect(toastHandlingService.success).toHaveBeenCalledWith(
            'Tải lên thành công',
            'Tất cả tài liệu đã được tải lên thành công.'
          );
          resolve();
        });
      });
    });

    it('should handle create failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.post as any).mockReturnValue(of(failureResponse));

      await new Promise<void>(resolve => {
        service.createLessonMaterials(mockRequest).subscribe(() => {
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Tải lên thất bại',
            'Không thể tải lên tài liệu. Vui lòng thử lại sau.'
          );
          resolve();
        });
      });
    });

    it('should handle school subscription not found error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND },
        status: 400,
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.createLessonMaterials(mockRequest).subscribe(() => {
          expect(toastHandlingService.warn).toHaveBeenCalledWith(
            'Thiếu gói đăng ký',
            'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
          );
          resolve();
        });
      });
    });

    it('should handle general error', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.createLessonMaterials(mockRequest).subscribe(() => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('getLessonMaterials', () => {
    const folderId = 'folder1';
    const mockRequest: GetLessonMaterialsRequest = {
      searchTerm: 'test',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    it('should get lesson materials successfully', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterials(folderId, mockRequest).subscribe(result => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining(`/folders/${folderId}/lesson-materials`),
            mockRequest,
            { loadingKey: 'get-materials' }
          );
          expect(result).toEqual([mockLessonMaterial]);
          expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
          expect(service.totalRecords()).toBe(0);
          resolve();
        });
      });
    });

    it('should handle get lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterials(folderId, mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getLessonMaterials(folderId, mockRequest).subscribe({
          next: () => {},
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should get lesson materials without request params', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterials(folderId).subscribe(result => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining(`/folders/${folderId}/lesson-materials`),
            undefined,
            { loadingKey: 'get-materials' }
          );
          expect(result).toEqual([mockLessonMaterial]);
          expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
          expect(service.totalRecords()).toBe(0);
          resolve();
        });
      });
    });
  });

  describe('getPendingLessonMaterials', () => {
    const mockRequest: GetPendingLessonMaterialsRequest = {
      pageIndex: 1,
      pageSize: 10,
    };

    it('should get pending lesson materials successfully', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockPagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getPendingLessonMaterials(mockRequest).subscribe(result => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining('/lesson-materials/pending-approval'),
            mockRequest,
            { loadingKey: 'get-materials' }
          );
          expect(result).toEqual([mockLessonMaterial]);
          expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
          expect(service.totalRecords()).toBe(1);
          resolve();
        });
      });
    });

    it('should handle get pending lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      await new Promise<void>(resolve => {
        service.getPendingLessonMaterials(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error for pending materials', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getPendingLessonMaterials(mockRequest).subscribe({
          next: () => {},
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('getSharedLessonMaterials', () => {
    const mockRequest: GetPendingLessonMaterialsRequest = {
      pageIndex: 1,
      pageSize: 10,
    };

    it('should get shared lesson materials successfully', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockPagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getSharedLessonMaterials(mockRequest).subscribe(result => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining('/lesson-materials/school-public'),
            mockRequest,
            { loadingKey: 'get-materials' }
          );
          expect(result).toEqual([mockLessonMaterial]);
          expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
          expect(service.totalRecords()).toBe(1);
          resolve();
        });
      });
    });

    it('should handle get shared lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      await new Promise<void>(resolve => {
        service.getSharedLessonMaterials(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error for shared materials', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getSharedLessonMaterials(mockRequest).subscribe({
          next: () => {},
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('getLessonMaterialById', () => {
    const materialId = 'material1';

    it('should get lesson material by id successfully', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockLessonMaterial,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterialById(materialId).subscribe(result => {
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining(`/lesson-materials/${materialId}`)
          );
          expect(result).toEqual(mockLessonMaterial);
          expect(service.lessonMaterial()).toEqual(mockLessonMaterial);
          resolve();
        });
      });
    });

    it('should handle get lesson material by id failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterialById(materialId).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle HTTP error for get by id', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getLessonMaterialById(materialId).subscribe({
          next: () => {},
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('Signal Updates', () => {
    it('should update signals when getting lesson materials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterials('folder1').subscribe(() => {
          expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
          expect(service.totalRecords()).toBe(0);
          resolve();
        });
      });
    });

    it('should update signals when getting pending materials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockPagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service
          .getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
          .subscribe(() => {
            expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
            expect(service.totalRecords()).toBe(1);
            resolve();
          });
      });
    });

    it('should update lesson material signal when getting by id', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockLessonMaterial,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterialById('material1').subscribe(() => {
          expect(service.lessonMaterial()).toEqual(mockLessonMaterial);
          resolve();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterials('folder1').subscribe(result => {
          expect(result).toBeNull();
          expect(service.lessonMaterials()).toEqual([]);
          expect(service.totalRecords()).toBe(0);
          resolve();
        });
      });
    });

    it('should handle undefined data in paging response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: undefined, count: 0 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service
          .getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(service.lessonMaterials()).toEqual([]);
            expect(service.totalRecords()).toBe(0);
            resolve();
          });
      });
    });

    it('should handle null data in detail response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await new Promise<void>(resolve => {
        service.getLessonMaterialById('material1').subscribe(result => {
          expect(result).toBeNull();
          expect(service.lessonMaterial()).toBeNull();
          resolve();
        });
      });
    });
  });
});
