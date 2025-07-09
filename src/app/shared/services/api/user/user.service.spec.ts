import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from './user.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { type User } from '../../../models/entities/user.model';
import { UserRoles } from '../../../constants/user-roles.constant';
import { type UpdateProfileRequest } from '../../../pages/settings-page/personal-information/models/update-profile-request.model';
import { type EntityListResponse } from '../../../models/api/response/query/entity-list-response.model';
import { type UserListParams } from '../../../models/api/request/query/user-list-params';

describe('UserService', () => {
  let service: UserService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockUser: User = {
    id: '1',
    fullName: 'Test User',
    phoneNumber: '0123456789',
    email: 'test@eduva.com',
    avatarUrl: 'avatar.jpg',
    school: {
      id: 1,
      name: 'School',
      contactEmail: '',
      contactPhone: '',
      address: '',
      status: 0,
    },
    roles: [UserRoles.SCHOOL_ADMIN],
    creditBalance: 100,
    is2FAEnabled: false,
    isEmailConfirmed: true,
    status: 0,
    userSubscriptionResponse: {
      isSubscriptionActive: true,
      subscriptionEndDate: '2024-12-31',
    },
  };
  const mockUser2: User = { ...mockUser, id: '2', fullName: 'User 2' };
  const mockUpdateRequest: UpdateProfileRequest = {
    fullName: 'Updated User',
    phoneNumber: '0987654321',
    avatarUrl: 'new-avatar.jpg',
  };
  const mockUserList: EntityListResponse<User> = {
    count: 2,
    data: [mockUser, mockUser2],
    page: 1,
    pageSize: 10,
  };
  const mockUserListParams: UserListParams = {
    role: 1,
    pageIndex: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(UserService);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentProfile', () => {
    it('should get and set current user on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockUser })
      );
      await new Promise<void>(resolve => {
        service.getCurrentProfile().subscribe(result => {
          expect(result).toEqual(mockUser);
          expect(service.currentUser()).toEqual(mockUser);
          resolve();
        });
      });
    });
    it('should show errorGeneral on error', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getCurrentProfile().subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user and show success toast', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockUser })
      );
      service['currentUserSignal'].set(mockUser);
      await new Promise<void>(resolve => {
        service.updateUserProfile(mockUpdateRequest).subscribe(result => {
          expect(result).toEqual(mockUser);
          expect(toastHandlingService.success).toHaveBeenCalled();
          expect(service.currentUser()).toEqual(mockUser);
          resolve();
        });
      });
    });
    it('should show errorGeneral if not SUCCESS', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: null })
      );
      await new Promise<void>(resolve => {
        service.updateUserProfile(mockUpdateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show errorGeneral on error', async () => {
      (requestService.put as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.updateUserProfile(mockUpdateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('updateCurrentUserPartial', () => {
    it('should merge and update current user', () => {
      service['currentUserSignal'].set(mockUser);
      service.updateCurrentUserPartial({ fullName: 'Partial Update' });
      expect(service.currentUser()?.fullName).toBe('Partial Update');
    });
    it('should do nothing if current user is null', () => {
      service['currentUserSignal'].set(null);
      service.updateCurrentUserPartial({ fullName: 'Partial Update' });
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('clearCurrentUser', () => {
    it('should clear current user and localStorage', () => {
      service['currentUserSignal'].set(mockUser);
      localStorage.setItem('eduva_user', JSON.stringify(mockUser));
      service.clearCurrentUser();
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('eduva_user')).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should get users and update signals on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockUserList })
      );
      await new Promise<void>(resolve => {
        service.getUsers(mockUserListParams).subscribe(result => {
          expect(result).toEqual(mockUserList);
          expect(service.users()).toEqual([mockUser, mockUser2]);
          expect(service.totalUsers()).toBe(2);
          resolve();
        });
      });
    });
    it('should reset users and show errorGeneral on error', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getUsers(mockUserListParams).subscribe({
          error: () => {
            expect(service.users()).toEqual([]);
            expect(service.totalUsers()).toBe(0);
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('getUserDetailById', () => {
    it('should get user detail and update signal on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockUser })
      );
      await new Promise<void>(resolve => {
        service.getUserDetailById('1').subscribe(result => {
          expect(result).toEqual(mockUser);
          expect(service.userDetail()).toEqual(mockUser);
          resolve();
        });
      });
    });
    it('should reset user detail and show errorGeneral on error', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getUserDetailById('1').subscribe({
          error: () => {
            expect(service.userDetail()).toBeNull();
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('activateUser', () => {
    it('should show success toast on success', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.activateUser('1').subscribe(() => {
          expect(toastHandlingService.success).toHaveBeenCalledWith(
            'Thành công',
            expect.stringContaining('Kích hoạt')
          );
          resolve();
        });
      });
    });
    it('should show errorGeneral on error', async () => {
      (requestService.put as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.activateUser('1').subscribe({
          error: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('archiveUser', () => {
    it('should show success toast on success', async () => {
      (requestService.put as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.archiveUser('1').subscribe(() => {
          expect(toastHandlingService.success).toHaveBeenCalledWith(
            'Thành công',
            expect.stringContaining('Vô hiệu')
          );
          resolve();
        });
      });
    });
    it('should show errorGeneral on error', async () => {
      (requestService.put as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.archiveUser('1').subscribe({
          error: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('createUser', () => {
    const mockCreateUserRequest = {
      fullName: 'New User',
      email: 'new@eduva.com',
      password: 'password',
      phoneNumber: '0123456789',
      role: 1,
      schoolId: 1,
    };

    it('should show success toast and return true on success', async () => {
      (requestService.post as any) = vi
        .fn()
        .mockReturnValue(of({ statusCode: StatusCode.SUCCESS }));
      await new Promise<void>(resolve => {
        service.createUser(mockCreateUserRequest as any).subscribe(result => {
          expect(result).toBe(true);
          expect(toastHandlingService.success).toHaveBeenCalledWith(
            'Thành công!',
            expect.stringContaining('Tài khoản người dùng')
          );
          resolve();
        });
      });
    });

    it('should show errorGeneral and return false on non-success', async () => {
      (requestService.post as any) = vi
        .fn()
        .mockReturnValue(of({ statusCode: StatusCode.SYSTEM_ERROR }));
      await new Promise<void>(resolve => {
        service.createUser(mockCreateUserRequest as any).subscribe(result => {
          expect(result).toBe(false);
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should show EMAIL_ALREADY_EXISTS error and return false', async () => {
      (requestService.post as any) = vi.fn().mockReturnValue(
        throwError(() => ({
          error: {
            statusCode: { EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS' },
          },
        }))
      );
      await new Promise<void>(resolve => {
        service.createUser(mockCreateUserRequest as any).subscribe(result => {
          expect(result).toBe(false);
          expect(toastHandlingService.error).toHaveBeenCalledWith(
            'Đăng ký thất bại',
            expect.stringContaining('Email đã tồn tại')
          );
          resolve();
        });
      });
    });

    it('should show errorGeneral and return false on other errors', async () => {
      (requestService.post as any) = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Network error')));
      await new Promise<void>(resolve => {
        service.createUser(mockCreateUserRequest as any).subscribe(result => {
          expect(result).toBe(false);
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });
});
