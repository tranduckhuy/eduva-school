import { TestBed } from '@angular/core/testing';
import { ImportUserAccountsService } from './import-user-accounts.service';
import { RequestService } from '../../../services/core/request/request.service';
import { UserService } from '../../../services/api/user/user.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';
import { Role } from '../../../models/enum/role.enum';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { PAGE_SIZE } from '../../../constants/common.constant';

// Mock util functions
vi.mock('../../../utils/util-functions', () => ({
  getFileName: vi.fn(() => 'mocked-import-error.xlsx'),
  triggerBlobDownload: vi.fn(),
}));

const { getFileName, triggerBlobDownload } = await import(
  '../../../utils/util-functions'
);

describe('ImportUserAccountsService', () => {
  let service: ImportUserAccountsService;
  let requestService: ReturnType<typeof createRequestServiceMock>;
  let userService: ReturnType<typeof createUserServiceMock>;
  let toastHandlingService: ReturnType<typeof createToastHandlingServiceMock>;

  function createRequestServiceMock() {
    return {
      postFile: vi.fn(),
    } as unknown as RequestService;
  }

  function createUserServiceMock() {
    return {
      getUsers: vi.fn(() => of({})),
    } as unknown as UserService;
  }

  function createToastHandlingServiceMock() {
    return {
      success: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
    } as unknown as ToastHandlingService;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImportUserAccountsService,
        { provide: RequestService, useFactory: createRequestServiceMock },
        { provide: UserService, useFactory: createUserServiceMock },
        {
          provide: ToastHandlingService,
          useFactory: createToastHandlingServiceMock,
        },
      ],
    });
    service = TestBed.inject(ImportUserAccountsService);
    requestService = TestBed.inject(RequestService) as any;
    userService = TestBed.inject(UserService) as any;
    toastHandlingService = TestBed.inject(ToastHandlingService) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call postFile with correct URL and options', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const response = new HttpResponse({
      body: undefined,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.postFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe(() => {
        expect(requestService.postFile).toHaveBeenCalledWith(
          expect.stringContaining('/users/import'),
          formData,
          { loadingKey: 'upload' }
        );
        resolve();
      });
    });
  });

  it('should handle import error (request error)', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    (requestService.postFile as any).mockReturnValue(throwError(() => error));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe({
        next: () => {},
        error: err => {
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(err).toBe(error);
          resolve();
        },
      });
    });
  });

  it('should handle import with error file (body exists, size > 0)', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const blob = new Blob(['error']);
    const response = new HttpResponse({
      body: blob,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.postFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe(() => {
        expect(toastHandlingService.error).toHaveBeenCalledWith(
          'Dữ liệu không hợp lệ',
          expect.stringContaining('Hệ thống đã phát hiện lỗi')
        );
        expect(getFileName).toHaveBeenCalledWith(response);
        expect(triggerBlobDownload).toHaveBeenCalledWith(
          'mocked-import-error.xlsx',
          blob
        );
        expect(userService.getUsers).not.toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('should handle import success (no error file)', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const response = new HttpResponse({
      body: undefined,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.postFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe(() => {
        expect(toastHandlingService.success).toHaveBeenCalledWith(
          'Thành công',
          expect.stringContaining('Tất cả tài khoản đã được nhập')
        );
        expect(userService.getUsers).toHaveBeenCalledWith({
          role,
          pageIndex: 1,
          pageSize: PAGE_SIZE,
          activeOnly: true,
        });
        expect(getFileName).not.toHaveBeenCalled();
        expect(triggerBlobDownload).not.toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('should handle import success (body is empty blob)', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const blob = new Blob([]);
    const response = new HttpResponse({
      body: blob,
      headers: new HttpHeaders(),
      status: 200,
    });
    (requestService.postFile as any).mockReturnValue(of(response));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe(() => {
        expect(toastHandlingService.success).toHaveBeenCalled();
        expect(userService.getUsers).toHaveBeenCalled();
        expect(getFileName).not.toHaveBeenCalled();
        expect(triggerBlobDownload).not.toHaveBeenCalled();
        resolve();
      });
    });
  });
});
