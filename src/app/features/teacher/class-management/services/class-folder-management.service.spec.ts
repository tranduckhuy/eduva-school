import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { ClassFolderManagementService } from './class-folder-management.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';

vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('ClassFolderManagementService', () => {
  let service: ClassFolderManagementService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  beforeEach(() => {
    requestService = {
      deleteWithBody: vi.fn(),
    } as any;

    toastHandlingService = {
      successGeneral: vi.fn(),
      errorGeneral: vi.fn(),
      warn: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ClassFolderManagementService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });

    service = TestBed.inject(ClassFolderManagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addMaterialsForClass', () => {
    const classId = 'class-123';
    const folderId = 'folder-456';
    const request = ['material-1', 'material-2'];

    beforeEach(() => {
      (requestService as any).post = vi.fn();
    });

    it('should call post and show success toast on SUCCESS', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service
          .addMaterialsForClass(classId, folderId, request)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.post).toHaveBeenCalledOnce();
            expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
            expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should call post and show error toast on non-SUCCESS statusCode', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      await new Promise<void>(resolve => {
        service
          .addMaterialsForClass(classId, folderId, request)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.post).toHaveBeenCalledOnce();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            expect(toastHandlingService.successGeneral).not.toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should handle HttpErrorResponse with null error and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: null,
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.addMaterialsForClass(classId, folderId, request).subscribe({
          next: () => {
            throw new Error('Should not reach next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          },
        });
      });
    });

    it('should handle HttpErrorResponse with valid error object and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.addMaterialsForClass(classId, folderId, request).subscribe({
          next: () => {
            throw new Error('Should not reach next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          },
        });
      });
    });

    it('should handle HttpErrorResponse with LESSON_MATERIAL_ALREADY_EXISTS_IN_CLASS_FOLDER and show warning toast', async () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          statusCode: StatusCode.LESSON_MATERIAL_ALREADY_EXISTS_IN_CLASS_FOLDER,
        },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await new Promise<void>(resolve => {
        service.addMaterialsForClass(classId, folderId, request).subscribe({
          next: () => {
            throw new Error('Should not reach next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.warn).toHaveBeenCalledWith(
              'Cảnh báo',
              'Tài liệu này đã tồn tại trong lớp học này.'
            );
            resolve();
          },
        });
      });
    });

    it('should still call API and show error toast if request array is empty', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      await new Promise<void>(resolve => {
        service
          .addMaterialsForClass(classId, folderId, [])
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.post).toHaveBeenCalledOnce();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          });
      });
    });

    it('should handle case where folderId or classId is empty string', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service.addMaterialsForClass('', '', request).subscribe(result => {
          expect(result).toBeUndefined();
          expect(requestService.post).toHaveBeenCalledOnce();
          expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
          resolve();
        });
      });
    });
  });

  describe('removeMaterialsFromClass', () => {
    const classId = 'class-123';
    const folderId = 'folder-456';
    const request = ['material-1', 'material-2'];

    it('should call deleteWithBody and show success toast on SUCCESS', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service
          .removeMaterialsFromClass(classId, folderId, request)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.deleteWithBody).toHaveBeenCalledOnce();
            expect(toastHandlingService.successGeneral).toHaveBeenCalledOnce();
            expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should call deleteWithBody and show error toast on non-SUCCESS statusCode', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR })
      );

      await new Promise<void>(resolve => {
        service
          .removeMaterialsFromClass(classId, folderId, request)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            expect(toastHandlingService.successGeneral).not.toHaveBeenCalled();
            resolve();
          });
      });
    });

    it('should handle HttpErrorResponse with null error and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: null,
      });
      (requestService.deleteWithBody as any).mockReturnValue(
        throwError(() => error)
      );

      await new Promise<void>(resolve => {
        service.removeMaterialsFromClass(classId, folderId, request).subscribe({
          next: () => {
            throw new Error('Should not reach next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          },
        });
      });
    });

    it('should handle HttpErrorResponse with valid error object and show error toast', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { statusCode: StatusCode.SYSTEM_ERROR },
      });
      (requestService.deleteWithBody as any).mockReturnValue(
        throwError(() => error)
      );

      await new Promise<void>(resolve => {
        service.removeMaterialsFromClass(classId, folderId, request).subscribe({
          next: () => {
            throw new Error('Should not reach next');
          },
          error: err => {
            expect(err).toBe(error);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalledOnce();
            resolve();
          },
        });
      });
    });

    it('should work correctly even if request is undefined', async () => {
      (requestService.deleteWithBody as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      await new Promise<void>(resolve => {
        service
          .removeMaterialsFromClass(classId, folderId)
          .subscribe(result => {
            expect(result).toBeUndefined();
            expect(requestService.deleteWithBody).toHaveBeenCalledOnce();
            resolve();
          });
      });
    });
  });
});
