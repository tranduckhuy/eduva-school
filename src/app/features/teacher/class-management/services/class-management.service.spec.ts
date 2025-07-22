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
    } as any;
    toastHandlingService = {
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
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
      await new Promise<void>(resolve => {
        service.createClass(mockCreateRequest).subscribe(result => {
          expect(result).toEqual(mockClass);
          expect(toastHandlingService.success).toHaveBeenCalled();
          expect(service.classes()).toContainEqual(mockClass);
          resolve();
        });
      });
    });
    it('should show errorGeneral if not CREATED', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );
      await new Promise<void>(resolve => {
        service.createClass(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show warn if PROVIDED_INFORMATION_IS_INVALID', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createClass(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.warn).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show error if CLASS_CREATE_FAILED', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.CLASS_CREATE_FAILED },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createClass(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createClass(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('getClasses', () => {
    it('should get teacher classes and update signals on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockTeacherClassResponse })
      );
      await new Promise<void>(resolve => {
        service.getClasses(mockTeacherClassRequest).subscribe(result => {
          expect(result).toEqual(mockTeacherClassResponse);
          expect(service.classes()).toEqual([mockClass, mockClass2]);
          expect(service.totalClass()).toBe(2);
          resolve();
        });
      });
    });
    it('should show errorGeneral if not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: mockTeacherClassResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.getClasses(mockTeacherClassRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show errorGeneral if data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.getClasses(mockTeacherClassRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should handle error and return EMPTY', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getClasses(mockTeacherClassRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('getClassById', () => {
    it('should get class by id and update signal on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );
      await new Promise<void>(resolve => {
        service.getClassById('1').subscribe(result => {
          expect(result).toEqual(mockClass);
          expect(service.classModel()).toEqual(mockClass);
          resolve();
        });
      });
    });
    it('should show errorGeneral if not SUCCESS', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );
      await new Promise<void>(resolve => {
        service.getClassById('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show errorGeneral if data is missing', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.getClassById('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getClassById('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('refreshClassCode', () => {
    it('should refresh class code and update signal on SUCCESS', async () => {
      const updatedClass = { ...mockClass, classCode: 'NEWCODE' };
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: updatedClass })
      );
      // Set initial class model through getClassById first
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );
      await new Promise<void>(resolve => {
        service.getClassById('1').subscribe(() => {
          // Now test refreshClassCode
          (requestService.post as any).mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: updatedClass })
          );
          service.refreshClassCode('1').subscribe(result => {
            expect(result).toEqual(updatedClass);
            expect(toastHandlingService.success).toHaveBeenCalled();
            expect(service.classModel()?.classCode).toBe('NEWCODE');
            resolve();
          });
        });
      });
    });
    it('should show error if not SUCCESS', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockClass })
      );
      await new Promise<void>(resolve => {
        service.refreshClassCode('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show error if data is missing', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.refreshClassCode('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should handle error and show toast', async () => {
      (requestService.post as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.refreshClassCode('1').subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('getStudentsClass', () => {
    it('should return students on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockStudentsClassResponse })
      );
      await new Promise<void>(resolve => {
        service
          .getStudentsClass('1', mockStudentsClassRequest)
          .subscribe(result => {
            expect(result).toEqual([mockStudent]);
            resolve();
          });
      });
    });
    it('should show errorGeneral if data is missing', async () => {
      vi.clearAllMocks();
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service
          .getStudentsClass('1', mockStudentsClassRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            resolve();
          });
      });
    });
    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service
          .getStudentsClass('1', mockStudentsClassRequest)
          .subscribe(result => {
            expect(result).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          });
      });
    });
  });

  describe('updateClassModelPartial', () => {
    it('should merge partial update into classModel', () => {
      // Set initial class model through getClassById first
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockClass })
      );
      service.getClassById('1').subscribe(() => {
        service.updateClassModelPartial({ name: 'New Name' });
        expect(service.classModel()?.name).toBe('New Name');
      });
    });
    it('should do nothing if classModel is null', () => {
      // Ensure classModel is null by not setting it
      service.updateClassModelPartial({ name: 'New Name' });
      expect(service.classModel()).toBeNull();
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
    await new Promise<void>(resolve => {
      service.getClassById('').subscribe(result => {
        expect(result).toEqual(emptyClass);
        resolve();
      });
    });
  });
});
