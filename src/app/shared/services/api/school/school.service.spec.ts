import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { SchoolService } from './school.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { UserService } from '../user/user.service';
import { StatusCode } from '../../../constants/status-code.constant';
import {
  type School,
  type SchoolDetail,
} from '../../../models/entities/school.model';
import { type CreateSchoolRequest } from '../../../models/api/request/command/create-school-request.model';

describe('SchoolService', () => {
  let service: SchoolService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;
  let userService: UserService;

  const mockSchool: School = {
    id: 1,
    name: 'Test School',
    contactEmail: 'test@school.com',
    contactPhone: '0123456789',
    address: '123 Main St',
    websiteUrl: 'https://school.com',
    status: 0,
  };

  const mockSchoolDetail: SchoolDetail = {
    id: 1,
    name: 'Test School',
    contactEmail: 'test@school.com',
    contactPhone: '0123456789',
    address: '123 Main St',
    websiteUrl: 'https://school.com',
    status: 0,
    schoolAdminId: 'admin-123',
    schoolAdminFullName: 'Admin User',
    schoolAdminEmail: 'admin@school.com',
  };

  const mockRequest: CreateSchoolRequest = {
    name: 'Test School',
    contactEmail: 'test@school.com',
    contactPhone: '0123456789',
    address: '123 Main St',
    websiteUrl: 'https://school.com',
  };

  beforeEach(() => {
    requestService = {
      post: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
    } as any;
    toastHandlingService = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
      successGeneral: vi.fn(),
    } as any;
    userService = {
      updateCurrentUserPartial: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        SchoolService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
        { provide: UserService, useValue: userService },
      ],
    });
    service = TestBed.inject(SchoolService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createSchool', () => {
    it('should create school and show info toast on success', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockSchool })
      );
      await new Promise<void>(resolve => {
        service.createSchool(mockRequest).subscribe(result => {
          expect(result).toEqual(mockSchool);
          expect(toastHandlingService.info).toHaveBeenCalledWith(
            'Thành công',
            'Thông tin trường học đã được ghi nhận. Hệ thống đang tạo đường dẫn thanh toán, vui lòng chờ trong giây lát...'
          );
          expect(userService.updateCurrentUserPartial).toHaveBeenCalledWith({
            school: mockSchool,
          });
          resolve();
        });
      });
    });

    it('should return null if not SUCCESS or missing data', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: null })
      );
      await new Promise<void>(resolve => {
        service.createSchool(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.info).not.toHaveBeenCalled();
          expect(userService.updateCurrentUserPartial).not.toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should show warn toast if email already exists', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.createSchool(mockRequest).subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo',
              'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
            );
            resolve();
          },
        });
      });
    });

    it('should show errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.createSchool(mockRequest).subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('updateSchool', () => {
    it('should update school and show success toast on success', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.updateSchool(1, mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.successGeneral).toHaveBeenCalled();
          expect(requestService.put).toHaveBeenCalledWith(
            expect.stringContaining('/schools/1'),
            mockRequest,
            { loadingKey: 'update-school-information' }
          );
          resolve();
        });
      });
    });

    it('should show errorGeneral if update fails', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );
      await new Promise<void>(resolve => {
        service.updateSchool(1, mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle error with warn toast for invalid information', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.updateSchool(1, mockRequest).subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo',
              'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
            );
            resolve();
          },
        });
      });
    });

    it('should handle error with errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.put as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.updateSchool(1, mockRequest).subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should update school without request parameter', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.updateSchool(1).subscribe(result => {
          expect(result).toBeNull();
          expect(requestService.put).toHaveBeenCalledWith(
            expect.stringContaining('/schools/1'),
            undefined,
            { loadingKey: 'update-school-information' }
          );
          resolve();
        });
      });
    });
  });

  describe('getCurrentSchoolInformation', () => {
    it('should get current school information and update signal on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockSchoolDetail })
      );
      await new Promise<void>(resolve => {
        service.getCurrentSchoolInformation().subscribe(result => {
          expect(result).toEqual(mockSchoolDetail);
          expect(service.schoolDetail()).toEqual(mockSchoolDetail);
          expect(requestService.get).toHaveBeenCalledWith(
            expect.stringContaining('/schools/current'),
            undefined,
            { loadingKey: 'get-current-school' }
          );
          resolve();
        });
      });
    });

    it('should return null if not SUCCESS or missing data', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: null })
      );
      await new Promise<void>(resolve => {
        service.getCurrentSchoolInformation().subscribe(result => {
          expect(result).toBeNull();
          expect(service.schoolDetail()).toBeNull();
          resolve();
        });
      });
    });

    it('should handle error with warn toast for invalid information', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getCurrentSchoolInformation().subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo',
              'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
            );
            resolve();
          },
        });
      });
    });

    it('should handle error with errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.get as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.getCurrentSchoolInformation().subscribe({
          next: () => fail('Should not succeed'),
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should not update signal if response is not successful', async () => {
      // Set initial signal value
      service['schoolDetailSignal'].set(mockSchoolDetail);

      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: null })
      );
      await new Promise<void>(resolve => {
        service.getCurrentSchoolInformation().subscribe(result => {
          expect(result).toBeNull();
          // Signal should remain unchanged
          expect(service.schoolDetail()).toEqual(mockSchoolDetail);
          resolve();
        });
      });
    });
  });
});
