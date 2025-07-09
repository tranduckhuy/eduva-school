import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { ClassStudentManagementService } from './class-student-management.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';

vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('ClassStudentManagementService', () => {
  let service: ClassStudentManagementService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  beforeEach(() => {
    requestService = {
      deleteWithBody: vi.fn(),
    } as any;

    toastHandlingService = {
      successGeneral: vi.fn(),
      errorGeneral: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ClassStudentManagementService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });

    service = TestBed.inject(ClassStudentManagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('removeStudentFromClass', () => {
    const classId = 'class-001';
    const studentIds = ['user-001', 'user-002'];

    it('should call deleteWithBody and show success toast on success', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service
          .removeStudentFromClass(classId, studentIds)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.deleteWithBody).toHaveBeenCalledOnce();
            expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
            expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should call deleteWithBody and show error toast on failed statusCode', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      await new Promise<void>(resolve => {
        service
          .removeStudentFromClass(classId, studentIds)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(toastHandlingService.successGeneral).not.toHaveBeenCalled();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          });
      });
    });

    it('should handle HttpErrorResponse and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Server error',
      });
      (requestService.deleteWithBody as any).mockReturnValue(
        throwError(() => error)
      );

      await new Promise<void>(resolve => {
        service.removeStudentFromClass(classId, studentIds).subscribe({
          next: () => {
            throw new Error('Should not emit next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          },
        });
      });
    });

    it('should still work when request is undefined', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service.removeStudentFromClass(classId).subscribe(result => {
          expect(result).toBeUndefined();
          expect(requestService.deleteWithBody).toHaveBeenCalledOnce();
          resolve();
        });
      });
    });
  });
});
