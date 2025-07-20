import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';

import { LessonMaterialsService } from './lesson-materials.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { LessonMaterial } from '../../../models/entities/lesson-material.model';
import { CreateLessonMaterialsRequest } from '../../../models/api/request/command/create-lesson-material-request.model';
import { UpdateLessonMaterialRequest } from '../../../models/api/request/command/update-lesson-material-request.model';
import {
  GetLessonMaterialsRequest,
  GetPendingLessonMaterialsRequest,
} from '../../../models/api/request/query/get-lesson-materials-request.model';
import { GetPagingLessonMaterialsResponse } from '../../../models/api/response/query/get-lesson-materials-response.model';
import { ApproveRejectMaterialRequest } from '../../../../features/moderation/moderate-lessons/models/approve-reject-material-request.model';
import { LessonMaterialStatus } from '../../../models/enum/lesson-material.enum';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LessonMaterialsService', () => {
  let service: LessonMaterialsService;
  let requestService: ReturnType<typeof createRequestServiceMock>;
  let toastHandlingService: ReturnType<typeof createToastHandlingServiceMock>;

  function createRequestServiceMock() {
    return {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
    } as unknown as RequestService;
  }

  function createToastHandlingServiceMock() {
    return {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      errorGeneral: vi.fn(),
      successGeneral: vi.fn(),
    } as unknown as ToastHandlingService;
  }

  const mockLessonMaterial: LessonMaterial = {
    id: '1',
    schoolId: 1,
    title: 'Test Material',
    description: 'Test Description',
    contentType: 3, // PDF
    tag: 'test',
    lessonStatus: 1, // Approved
    duration: 60,
    fileSize: 1024,
    isAIContent: false,
    sourceUrl: 'http://example.com/file.pdf',
    visibility: 1, // School
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

    it('should initialize signals with default values', () => {
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.lessonMaterial()).toBeNull();
      expect(service.totalRecords()).toBe(0);
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
          contentType: 3, // PDF
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

      const result = await lastValueFrom(
        service.createLessonMaterials(mockRequest)
      );

      expect(requestService.post).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials'),
        mockRequest
      );
      expect(result).toBeNull();
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Tải lên thành công',
        'Tất cả tài liệu đã được tải lên thành công.'
      );
    });

    it('should handle create failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.post as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.createLessonMaterials(mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Tải lên thất bại',
        'Không thể tải lên tài liệu. Vui lòng thử lại sau.'
      );
    });

    it('should handle school subscription not found error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND },
        status: 400,
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.createLessonMaterials(mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Thiếu gói đăng ký',
        'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
      );
    });

    it('should handle general error', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.createLessonMaterials(mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error without error.error property', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        error: null,
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.createLessonMaterials(mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('updateLessonMaterial', () => {
    const materialId = 'material1';
    const mockRequest: UpdateLessonMaterialRequest = {
      id: materialId,
      title: 'Updated Material',
      description: 'Updated Description',
      visibility: 1, // School
    };

    it('should update lesson material successfully', async () => {
      const successResponse = { statusCode: StatusCode.SUCCESS };
      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.updateLessonMaterial(materialId, mockRequest)
      );

      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(`/lesson-materials/${materialId}`),
        mockRequest
      );
      expect(result).toBeNull();
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Cập nhật thành công',
        'Thông tin của tài liệu đã được cập nhật thành công.'
      );
    });

    it('should handle update failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.put as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.updateLessonMaterial(materialId, mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Cập nhật thất bại',
        'Không thể cập nhật thông tin tài liệu. Vui lòng thử lại sau.'
      );
    });

    it('should handle HTTP error for update', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.updateLessonMaterial(materialId, mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle school subscription not found error for update', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND },
        status: 400,
      });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.updateLessonMaterial(materialId, mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Thiếu gói đăng ký',
        'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
      );
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

      const result = await lastValueFrom(
        service.getLessonMaterials(folderId, mockRequest)
      );

      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}/lesson-materials`),
        mockRequest,
        { loadingKey: 'get-materials' }
      );
      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0); // count is not set for list response
    });

    it('should handle get lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.getLessonMaterials(folderId, mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.getLessonMaterials(folderId, mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should get lesson materials without request params', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials(folderId));

      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}/lesson-materials`),
        undefined,
        { loadingKey: 'get-materials' }
      );
      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle response with null data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterials(folderId, mockRequest)
      );

      expect(result).toBeNull();
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with undefined data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterials(folderId, mockRequest)
      );

      expect(result).toBeNull();
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with data containing count property', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockLessonMaterial], count: 5 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterials(folderId, mockRequest)
      );

      expect(result).toEqual({ data: [mockLessonMaterial], count: 5 });
      expect(service.lessonMaterials()).toEqual({
        data: [mockLessonMaterial],
        count: 5,
      });
      expect(service.totalRecords()).toBe(5);
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

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/pending-approval'),
        mockRequest,
        { loadingKey: 'get-materials' }
      );
      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(1);
    });

    it('should handle get pending lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error for pending materials', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.getPendingLessonMaterials(mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with null data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with undefined data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with undefined data.data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: undefined, count: 0 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle response with null count', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockLessonMaterial], count: null },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials(mockRequest)
      );

      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0);
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

      const result = await lastValueFrom(
        service.getSharedLessonMaterials(mockRequest)
      );

      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/school-public'),
        mockRequest,
        { loadingKey: 'get-materials' }
      );
      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(1);
    });

    it('should handle get shared lesson materials failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.getSharedLessonMaterials(mockRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error for shared materials', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.getSharedLessonMaterials(mockRequest))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with null data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getSharedLessonMaterials(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with undefined data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getSharedLessonMaterials(mockRequest)
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
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

      const result = await lastValueFrom(
        service.getLessonMaterialById(materialId)
      );

      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/lesson-materials/${materialId}`)
      );
      expect(result).toEqual(mockLessonMaterial);
      expect(service.lessonMaterial()).toEqual(mockLessonMaterial);
    });

    it('should handle get lesson material by id failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.get as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.getLessonMaterialById(materialId)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error for get by id', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.getLessonMaterialById(materialId))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with null data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterialById(materialId)
      );

      expect(result).toBeNull();
      expect(service.lessonMaterial()).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with undefined data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterialById(materialId)
      );

      expect(result).toBeUndefined();
      expect(service.lessonMaterial()).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('approveRejectMaterial', () => {
    const materialId = 'material1';
    const mockRequest: ApproveRejectMaterialRequest = {
      status: LessonMaterialStatus.Approved,
      feedback: 'Good content',
    };

    it('should approve/reject material successfully', async () => {
      const successResponse = { statusCode: StatusCode.SUCCESS };
      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.approveRejectMaterial(mockRequest, materialId)
      );

      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(
          `/lesson-materials/${materialId}/pending-approval`
        ),
        mockRequest,
        { loadingKey: 'approve-reject-material' }
      );
      expect(result).toBeNull();
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle approve/reject material failure', async () => {
      const failureResponse = { statusCode: StatusCode.MODEL_INVALID };
      (requestService.put as any).mockReturnValue(of(failureResponse));

      const result = await lastValueFrom(
        service.approveRejectMaterial(mockRequest, materialId)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error for approve/reject', async () => {
      const error = new HttpErrorResponse({ status: 500 });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.approveRejectMaterial(mockRequest, materialId))
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle reject material with feedback', async () => {
      const rejectRequest: ApproveRejectMaterialRequest = {
        status: LessonMaterialStatus.Rejected,
        feedback: 'Content needs improvement',
      };
      const successResponse = { statusCode: StatusCode.SUCCESS };
      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.approveRejectMaterial(rejectRequest, materialId)
      );

      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(
          `/lesson-materials/${materialId}/pending-approval`
        ),
        rejectRequest,
        { loadingKey: 'approve-reject-material' }
      );
      expect(result).toBeNull();
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle school subscription not found error for approve/reject', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND },
        status: 400,
      });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        lastValueFrom(service.approveRejectMaterial(mockRequest, materialId))
      ).rejects.toThrow();

      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Thiếu gói đăng ký',
        'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
      );
    });
  });

  describe('Signal Updates', () => {
    it('should update signals when getting lesson materials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should update signals when getting pending materials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockPagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await lastValueFrom(
        service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(1);
    });

    it('should update lesson material signal when getting by id', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockLessonMaterial,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await lastValueFrom(service.getLessonMaterialById('material1'));

      expect(service.lessonMaterial()).toEqual(mockLessonMaterial);
    });

    it('should update signals when getting shared materials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockPagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      await lastValueFrom(
        service.getSharedLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty data response for getLessonMaterials', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(result).toBeNull();
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle undefined data in paging response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: undefined, count: 0 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle null data in detail response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getLessonMaterialById('material1')
      );

      expect(result).toBeNull();
      expect(service.lessonMaterial()).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with count property in list response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockLessonMaterial], count: 5 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(result).toEqual({ data: [mockLessonMaterial], count: 5 });
      expect(service.lessonMaterials()).toEqual({
        data: [mockLessonMaterial],
        count: 5,
      });
      expect(service.totalRecords()).toBe(5);
    });

    it('should handle response with undefined count in list response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockLessonMaterial],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle response with null count in paging response', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockLessonMaterial], count: null },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle paging response with count property', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockLessonMaterial], count: 5 },
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(result).toEqual([mockLessonMaterial]);
      expect(service.lessonMaterials()).toEqual([mockLessonMaterial]);
      expect(service.totalRecords()).toBe(5);
    });
  });

  describe('API URL Construction', () => {
    it('should construct correct URLs for different endpoints', () => {
      // Test that the service uses the correct base URL and endpoints
      expect(service).toBeTruthy();

      // The URLs are constructed in the service, so we test them indirectly
      // by checking that the service methods call the request service with correct URLs
      const successResponse = { statusCode: StatusCode.SUCCESS };
      (requestService.get as any).mockReturnValue(of(successResponse));
      (requestService.post as any).mockReturnValue(of(successResponse));
      (requestService.put as any).mockReturnValue(of(successResponse));

      service.getLessonMaterials('test-folder');
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/folders/test-folder/lesson-materials'),
        undefined,
        { loadingKey: 'get-materials' }
      );

      service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 });
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/pending-approval'),
        { pageIndex: 1, pageSize: 10 },
        { loadingKey: 'get-materials' }
      );

      service.getSharedLessonMaterials({ pageIndex: 1, pageSize: 10 });
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/school-public'),
        { pageIndex: 1, pageSize: 10 },
        { loadingKey: 'get-materials' }
      );

      service.getLessonMaterialById('test-id');
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/test-id')
      );

      const mockRequest: CreateLessonMaterialsRequest = {
        folderId: 'folder1',
        blobNames: ['test.pdf'],
        lessonMaterials: [],
      };
      service.createLessonMaterials(mockRequest);
      expect(requestService.post).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials'),
        mockRequest
      );

      const updateRequest: UpdateLessonMaterialRequest = {
        id: 'test-id',
        title: 'Updated Material',
        description: 'Updated Description',
        visibility: 1,
      };
      service.updateLessonMaterial('test-id', updateRequest);
      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/test-id'),
        updateRequest
      );

      const approveRequest: ApproveRejectMaterialRequest = {
        status: LessonMaterialStatus.Approved,
      };
      service.approveRejectMaterial(approveRequest, 'test-id');
      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-materials/test-id/pending-approval'),
        approveRequest,
        { loadingKey: 'approve-reject-material' }
      );
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle different error status codes', async () => {
      const errorStatusCodes = [
        StatusCode.UNAUTHORIZED,
        StatusCode.FORBIDDEN,
        StatusCode.SYSTEM_ERROR,
        StatusCode.MODEL_INVALID,
      ];

      for (const statusCode of errorStatusCodes) {
        const error = new HttpErrorResponse({
          error: { statusCode },
          status: 400,
        });
        (requestService.get as any).mockReturnValue(throwError(() => error));

        await expect(
          lastValueFrom(service.getLessonMaterials('folder1'))
        ).rejects.toThrow();
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();

        vi.clearAllMocks();
      }
    });

    it('should handle network errors', async () => {
      const networkError = new HttpErrorResponse({
        status: 0,
        statusText: 'Network Error',
      });
      (requestService.get as any).mockReturnValue(
        throwError(() => networkError)
      );

      await expect(
        lastValueFrom(service.getLessonMaterials('folder1'))
      ).rejects.toThrow();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new HttpErrorResponse({
        status: 408,
        statusText: 'Request Timeout',
      });
      (requestService.get as any).mockReturnValue(
        throwError(() => timeoutError)
      );

      await expect(
        lastValueFrom(service.getLessonMaterials('folder1'))
      ).rejects.toThrow();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('Response Processing', () => {
    it('should handle successful response with empty array', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [],
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(result).toEqual([]);
      expect(service.lessonMaterials()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle successful response with multiple items', async () => {
      const multipleMaterials = [
        mockLessonMaterial,
        { ...mockLessonMaterial, id: '2' },
      ];
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: multipleMaterials,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(service.getLessonMaterials('folder1'));

      expect(result).toEqual(multipleMaterials);
      expect(service.lessonMaterials()).toEqual(multipleMaterials);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle paging response with multiple items', async () => {
      const multipleMaterials = [
        mockLessonMaterial,
        { ...mockLessonMaterial, id: '2' },
      ];
      const pagingResponse = {
        data: multipleMaterials,
        count: 2,
        pageIndex: 1,
        pageSize: 10,
      };
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: pagingResponse,
      };
      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await lastValueFrom(
        service.getPendingLessonMaterials({ pageIndex: 1, pageSize: 10 })
      );

      expect(result).toEqual(multipleMaterials);
      expect(service.lessonMaterials()).toEqual(multipleMaterials);
      expect(service.totalRecords()).toBe(2);
    });
  });
});
