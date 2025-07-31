import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ClassMaterialsManagementService } from './class-materials-management.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type GetClassLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';
import { type GetClassLessonMaterialsResponse } from '../../../../shared/models/api/response/query/get-lesson-materials-response.model';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { LessonMaterialStatus } from '../../../../shared/models/enum/lesson-material.enum';

describe('ClassMaterialsManagementService', () => {
  let service: ClassMaterialsManagementService;
  let requestService: any;
  let toastHandlingService: any;

  const mockClassId = 'test-class-id';
  const mockRequest: GetClassLessonMaterialsRequest = {
    status: EntityStatus.Active,
    lessonStatus: LessonMaterialStatus.Approved,
  };

  const mockSuccessResponse = {
    statusCode: StatusCode.SUCCESS,
    data: [
      {
        id: 'folder-1',
        name: 'Test Folder 1',
        countLessonMaterials: 5,
        lessonMaterials: [],
      },
      {
        id: 'folder-2',
        name: 'Test Folder 2',
        countLessonMaterials: 3,
        lessonMaterials: [],
      },
    ] as GetClassLessonMaterialsResponse[],
  };

  const mockErrorResponse = {
    statusCode: StatusCode.SYSTEM_ERROR,
    data: null,
  };

  const mockEmptyResponse = {
    statusCode: StatusCode.SUCCESS,
    data: null,
  };

  beforeEach(() => {
    const requestServiceMock = {
      get: vi.fn(),
    };

    const toastHandlingServiceMock = {
      errorGeneral: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ClassMaterialsManagementService,
        {
          provide: RequestService,
          useValue: requestServiceMock,
        },
        {
          provide: ToastHandlingService,
          useValue: toastHandlingServiceMock,
        },
      ],
    });

    service = TestBed.inject(ClassMaterialsManagementService);
    requestService = TestBed.inject(RequestService);
    toastHandlingService = TestBed.inject(ToastHandlingService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial empty folderWithMaterials signal', () => {
      expect(service.folderWithMaterials()).toEqual([]);
    });
  });

  describe('getClassLessonMaterials', () => {
    it('should return materials when API call is successful', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toEqual(mockSuccessResponse.data);
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/classes/${mockClassId}/lesson-materials`),
        mockRequest
      );
      expect(service.folderWithMaterials()).toEqual(mockSuccessResponse.data);
    });

    it('should return null when API call succeeds but data is null', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockEmptyResponse));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should return null when API call succeeds but statusCode is not SUCCESS', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockErrorResponse));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle HTTP error and show error toast', async () => {
      // Arrange
      const httpError = new HttpErrorResponse({
        error: 'Network error',
        status: 500,
        statusText: 'Internal Server Error',
      });
      requestService.get.mockReturnValue(throwError(() => httpError));

      // Act & Assert
      await expect(
        firstValueFrom(
          service.getClassLessonMaterials(mockClassId, mockRequest)
        )
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle different request parameters correctly', async () => {
      // Arrange
      const customRequest: GetClassLessonMaterialsRequest = {
        status: EntityStatus.Archived,
        lessonStatus: LessonMaterialStatus.Pending,
      };
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, customRequest)
      );

      // Assert
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/classes/${mockClassId}/lesson-materials`),
        customRequest
      );
    });

    it('should handle empty request parameters', async () => {
      // Arrange
      const emptyRequest: GetClassLessonMaterialsRequest = {};
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, emptyRequest)
      );

      // Assert
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/classes/${mockClassId}/lesson-materials`),
        emptyRequest
      );
    });

    it('should handle response with empty data array', async () => {
      // Arrange
      const responseWithEmptyData = {
        statusCode: StatusCode.SUCCESS,
        data: [],
      };
      requestService.get.mockReturnValue(of(responseWithEmptyData));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toEqual([]);
      expect(service.folderWithMaterials()).toEqual([]);
    });

    it('should handle response with undefined data', async () => {
      // Arrange
      const responseWithUndefinedData = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      requestService.get.mockReturnValue(of(responseWithUndefinedData));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response with null data', async () => {
      // Arrange
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };
      requestService.get.mockReturnValue(of(responseWithNullData));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle different status codes correctly', async () => {
      // Arrange
      const responseWithDifferentStatusCode = {
        statusCode: StatusCode.CREATED,
        data: mockSuccessResponse.data,
      };
      requestService.get.mockReturnValue(of(responseWithDifferentStatusCode));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response without statusCode property', async () => {
      // Arrange
      const responseWithoutStatusCode = {
        data: mockSuccessResponse.data,
      } as any;
      requestService.get.mockReturnValue(of(responseWithoutStatusCode));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle response without data property', async () => {
      // Arrange
      const responseWithoutData = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };
      requestService.get.mockReturnValue(of(responseWithoutData));

      // Act
      const result = await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(result).toBeNull();
      expect(service.folderWithMaterials()).toEqual([]);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('Signal Behavior', () => {
    it('should update folderWithMaterials signal on successful response', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(service.folderWithMaterials()).toEqual(mockSuccessResponse.data);
    });

    it('should not update folderWithMaterials signal on error response', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockErrorResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(service.folderWithMaterials()).toEqual([]);
    });

    it('should not update folderWithMaterials signal on HTTP error', async () => {
      // Arrange
      const httpError = new HttpErrorResponse({
        error: 'Network error',
        status: 500,
        statusText: 'Internal Server Error',
      });
      requestService.get.mockReturnValue(throwError(() => httpError));

      // Act & Assert
      await expect(
        firstValueFrom(
          service.getClassLessonMaterials(mockClassId, mockRequest)
        )
      ).rejects.toThrow();

      expect(service.folderWithMaterials()).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should call errorGeneral toast on HTTP error', async () => {
      // Arrange
      const httpError = new HttpErrorResponse({
        error: 'Network error',
        status: 500,
        statusText: 'Internal Server Error',
      });
      requestService.get.mockReturnValue(throwError(() => httpError));

      // Act & Assert
      await expect(
        firstValueFrom(
          service.getClassLessonMaterials(mockClassId, mockRequest)
        )
      ).rejects.toThrow();

      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should call errorGeneral toast on non-success status code', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockErrorResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should call errorGeneral toast on null data', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockEmptyResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('URL Construction', () => {
    it('should construct correct API URL with classId', async () => {
      // Arrange
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(mockClassId, mockRequest)
      );

      // Assert
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/classes\/test-class-id\/lesson-materials$/),
        mockRequest
      );
    });

    it('should handle different class IDs correctly', async () => {
      // Arrange
      const differentClassId = 'different-class-id';
      requestService.get.mockReturnValue(of(mockSuccessResponse));

      // Act
      await firstValueFrom(
        service.getClassLessonMaterials(differentClassId, mockRequest)
      );

      // Assert
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/classes\/different-class-id\/lesson-materials$/
        ),
        mockRequest
      );
    });
  });
});
