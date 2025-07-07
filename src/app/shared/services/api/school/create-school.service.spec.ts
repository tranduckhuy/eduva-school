import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { CreateSchoolService } from './create-school.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { UserService } from '../user/user.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { type School } from '../../../models/entities/school.model';
import { type CreateSchoolRequest } from '../../../models/api/request/command/create-school-request.model';

describe('CreateSchoolService', () => {
  let service: CreateSchoolService;
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
    } as any;
    toastHandlingService = {
      info: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
    } as any;
    userService = {
      updateCurrentUserPartial: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        CreateSchoolService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
        { provide: UserService, useValue: userService },
      ],
    });
    service = TestBed.inject(CreateSchoolService);
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
          expect(toastHandlingService.info).toHaveBeenCalled();
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
    it('should show error toast if email already exists', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.PROVIDED_INFORMATION_IS_INVALID },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createSchool(mockRequest).subscribe(result => {
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
        service.createSchool(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });
});
