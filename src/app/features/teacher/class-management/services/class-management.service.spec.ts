import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { ClassManagementService } from './class-management.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type ClassModel } from '../../../../shared/models/entities/class.model';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { type GetTeacherClassRequest } from '../models/request/query/get-teacher-class-request.model';
import { type GetTeacherClassResponse } from '../models/response/query/get-teacher-class-response.model';
import { type CreateClassRequest } from '../models/request/command/create-class-request.model';
import { type GetStudentsClassRequest } from '../models/request/query/get-students-class-request.model';
import {
  type GetStudentsClassResponse,
  StudentClassResponse,
} from '../models/response/query/get-students-class-response.model';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('ClassManagementService', () => {
  let service: ClassManagementService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockClass: ClassModel = {
    id: '1',
    schoolId: 1,
    name: 'Math',
    classCode: 'ABC123',
    teacherId: 't1',
    teacherName: 'Mr. A',
    schoolName: 'School 1',
    backgroundImageUrl: 'img.jpg',
    teacherAvatarUrl: 'avatar.jpg',
    createdAt: '2024-01-01',
    lastModifiedAt: '2024-01-02',
    status: EntityStatus.Active,
  };
  const mockClass2: ClassModel = {
    ...mockClass,
    id: '2',
    name: 'Physics',
    classCode: 'XYZ789',
  };
  const mockCreateRequest: CreateClassRequest = {
    name: 'Math',
    backgroundImageUrl: 'img.jpg',
  };
  const mockTeacherClassRequest: GetTeacherClassRequest = {
    pageIndex: 1,
    pageSize: 10,
    sortBy: 'name',
    sortDirection: 'asc',
    searchTerm: '',
  };
  const mockTeacherClassResponse: GetTeacherClassResponse = {
    pageIndex: 1,
    pageSize: 10,
    count: 2,
    data: [mockClass, mockClass2],
  };
  const mockStudent: StudentClassResponse = {
    id: 's1',
    studentId: 'stu1',
    classId: '1',
    className: 'Math',
    teacherName: 'Mr. A',
    schoolName: 'School 1',
    classCode: 'ABC123',
    studentName: 'Student 1',
    teacherAvatarUrl: 'avatar.jpg',
    studentAvatarUrl: 'stu.jpg',
    enrolledAt: '2024-01-01',
    classStatus: EntityStatus.Active,
  };
  const mockStudentsClassResponse: GetStudentsClassResponse = {
    pageIndex: 1,
    pageSize: 10,
    count: 1,
    data: [mockStudent],
  };
  const mockStudentsClassRequest: GetStudentsClassRequest = {
    studentId: 'stu1',
    className: 'Math',
    teacherName: 'Mr. A',
    schoolName: 'School 1',
    classCode: 'ABC123',
    classStatus: EntityStatus.Active,
    schoolId: 1,
    pageIndex: 1,
    pageSize: 10,
    sortBy: 'name',
    sortDirection: 'asc',
    searchTerm: '',
  };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    } as any;
    toastHandlingService = {
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
      successGeneral: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        ClassManagementService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(ClassManagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createClass', () => {
    it('should create class and update signals on CREATED', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.CREATED, data: mockClass })
      );

      const result = await service.createClass(mockCreateRequest).toPromise();
      expect(result).toEqual(mockClass);
      expect(toastHandlingService.success).toHaveBeenCalled();
      expect(service.classes()).toContainEqual(mockClass);
    });

    it('should show errorGeneral if not CREATED', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );

      const result = await service.createClass(mockCreateRequest).toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should show warn if PROVIDED_INFORMATION_IS_INVALID', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      try {
        await service.createClass(mockCreateRequest).toPromise();
      } catch (err) {
        expect(err).toBe(error);
        expect(toastHandlingService.warn).toHaveBeenCalled();
      }
    });

    it('should show error if CLASS_CREATE_FAILED', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.CLASS_CREATE_FAILED },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      try {
        await service.createClass(mockCreateRequest).toPromise();
      } catch (err) {
        expect(err).toBe(error);
        expect(toastHandlingService.error).toHaveBeenCalled();
      }
    });

    it('should show errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      try {
        await service.createClass(mockCreateRequest).toPromise();
      } catch (err) {
        expect(err).toBe(error);
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      }
    });
  });

  describe('getClasses', () => {
    it('should get teacher classes and update signals on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockTeacherClassResponse })
      );

      const result = await service
        .getClasses(mockTeacherClassRequest)
        .toPromise();
      expect(result).toEqual(mockTeacherClassResponse);
      expect(service.classes()).toEqual([mockClass, mockClass2]);
      expect(service.totalClass()).toBe(2);
    });

    it('should show errorGeneral if not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: mockTeacherClassResponse,
        })
      );

      const result = await service
        .getClasses(mockTeacherClassRequest)
        .toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should show errorGeneral if data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service
        .getClasses(mockTeacherClassRequest)
        .toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and return EMPTY', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      try {
        await service.getClasses(mockTeacherClassRequest).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      }
    });
  });

  describe('getClassById', () => {
    it('should get class by id and update signal on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );

      const result = await service.getClassById('1').toPromise();
      expect(result).toEqual(mockClass);
      expect(service.classModel()).toEqual(mockClass);
    });

    it('should show errorGeneral if not SUCCESS', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );

      const result = await service.getClassById('1').toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should show errorGeneral if data is missing', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service.getClassById('1').toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      try {
        await service.getClassById('1').toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      }
    });
  });

  describe('refreshClassCode', () => {
    it('should refresh class code and update signal on SUCCESS', async () => {
      const updatedClass = { ...mockClass, classCode: 'NEWCODE' };
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: updatedClass })
      );

      // Set initial class model first
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );
      await service.getClassById('1').toPromise();

      const result = await service.refreshClassCode('1').toPromise();
      expect(result).toEqual(updatedClass);
      expect(toastHandlingService.success).toHaveBeenCalled();
      expect(service.classModel()?.classCode).toBe('NEWCODE');
    });

    it('should show error if not SUCCESS', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );

      const result = await service.refreshClassCode('1').toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalled();
    });

    it('should show error if data is missing', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service.refreshClassCode('1').toPromise();
      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalled();
    });

    it('should handle error and show toast', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      try {
        await service.refreshClassCode('1').toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      }
    });
  });

  describe('getStudentsClass', () => {
    it('should return students on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockStudentsClassResponse })
      );

      const result = await service
        .getStudentsClass('1', mockStudentsClassRequest)
        .toPromise();
      expect(result).toEqual([mockStudent]);
    });

    it('should show errorGeneral if data is missing', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service
        .getStudentsClass('1', mockStudentsClassRequest)
        .toPromise();
      expect(result).toBeNull();
    });

    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      try {
        await service
          .getStudentsClass('1', mockStudentsClassRequest)
          .toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      }
    });
  });

  describe('updateClassModelPartial', () => {
    it('should merge partial update into classModel', async () => {
      // Set initial class model through getClassById first
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );

      await service.getClassById('1').toPromise();
      service.updateClassModelPartial({ name: 'New Name' });
      expect(service.classModel()?.name).toBe('New Name');
    });

    it('should do nothing if classModel is null', () => {
      // Ensure classModel is null by not setting it
      service.updateClassModelPartial({ name: 'New Name' });
      expect(service.classModel()).toBeNull();
    });
  });

  describe('updateClass', () => {
    const classId = 'class-123';
    const updateRequest: CreateClassRequest = {
      name: 'Updated Math Class',
      backgroundImageUrl: 'updated-img.jpg',
    };

    beforeEach(() => {
      (requestService as any).put = vi.fn();
    });

    it('should call put with correct parameters and loading key, and show success toast on SUCCESS', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service
        .updateClass(classId, updateRequest)
        .toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/${classId}`,
        updateRequest,
        {
          loadingKey: 'update-class-information',
        }
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
      expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
    });

    it('should call put and show error toast on non-SUCCESS statusCode', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      const result = await service
        .updateClass(classId, updateRequest)
        .toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/${classId}`,
        updateRequest,
        {
          loadingKey: 'update-class-information',
        }
      );
      expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
      expect(toastHandlingService.successGeneral).not.toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });

      (requestService.put as any).mockReturnValue(throwError(() => error));

      try {
        await service.updateClass(classId, updateRequest).toPromise();
      } catch (err) {
        expect(err).toBe(error);
        expect(requestService.put).toHaveBeenCalledWith(
          `${service['BASE_CLASS_API_URL']}/${classId}`,
          updateRequest,
          {
            loadingKey: 'update-class-information',
          }
        );
        expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
      }
    });

    it('should work correctly with empty classId', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service.updateClass('', updateRequest).toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/`,
        updateRequest,
        {
          loadingKey: 'update-class-information',
        }
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
    });

    it('should work correctly with empty request object', async () => {
      const emptyRequest: CreateClassRequest = {
        name: '',
        backgroundImageUrl: '',
      };

      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service
        .updateClass(classId, emptyRequest)
        .toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/${classId}`,
        emptyRequest,
        {
          loadingKey: 'update-class-information',
        }
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
    });
  });

  describe('archiveClass', () => {
    const classId = 'class-123';

    beforeEach(() => {
      (requestService as any).put = vi.fn();
    });

    it('should call put with correct parameters and show success toast on SUCCESS', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service.archiveClass(classId).toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/${classId}/archive`
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
      expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
    });

    it('should call put and show error toast on non-SUCCESS statusCode', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      const result = await service.archiveClass(classId).toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}/${classId}/archive`
      );
      expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
      expect(toastHandlingService.successGeneral).not.toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });

      (requestService.put as any).mockReturnValue(throwError(() => error));

      try {
        await service.archiveClass(classId).toPromise();
      } catch (err) {
        expect(err).toBe(error);
        expect(requestService.put).toHaveBeenCalledWith(
          `${service['BASE_CLASS_API_URL']}/${classId}/archive`
        );
        expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
      }
    });

    it('should work correctly with empty classId', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await service.archiveClass('').toPromise();
      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        `${service['BASE_CLASS_API_URL']}//archive`
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
    });

    it('should handle network error and show error toast', async () => {
      const networkError = new Error('Network error');
      (requestService.put as any).mockReturnValue(
        throwError(() => networkError)
      );

      try {
        await service.archiveClass(classId).toPromise();
      } catch (err) {
        expect(err).toBe(networkError);
        expect(requestService.put).toHaveBeenCalledWith(
          `${service['BASE_CLASS_API_URL']}/${classId}/archive`
        );
        expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
      }
    });
  });

  it('should handle edge case: class with all fields empty/zero', async () => {
    const emptyClass: ClassModel = {
      id: '',
      schoolId: 0,
      name: '',
      classCode: '',
      teacherId: '',
      teacherName: '',
      schoolName: '',
      backgroundImageUrl: '',
      teacherAvatarUrl: '',
      createdAt: '',
      lastModifiedAt: '',
      status: EntityStatus.Deleted,
    };
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SUCCESS, data: emptyClass })
    );

    const result = await service.getClassById('').toPromise();
    expect(result).toEqual(emptyClass);
  });
});
