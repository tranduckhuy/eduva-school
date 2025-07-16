import { TestBed } from '@angular/core/testing';
import { ImportUserAccountsService } from './import-user-accounts.service';
import { RequestService } from '../../../services/core/request/request.service';
import { UserService } from '../../../services/api/user/user.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';
import { ConfirmationService } from 'primeng/api';
import { Role } from '../../../models/enum/role.enum';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { PAGE_SIZE } from '../../../constants/common.constant';
import { StatusCode } from '../../../constants/status-code.constant';

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
  let confirmationService: ReturnType<typeof createConfirmationServiceMock>;

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
      warn: vi.fn(),
    } as unknown as ToastHandlingService;
  }

  function createConfirmationServiceMock() {
    return {
      confirm: vi.fn((options: any) => {
        // Automatically call accept function to simulate user clicking download
        if (options.accept) {
          options.accept();
        }
      }),
    } as unknown as ConfirmationService;
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
        {
          provide: ConfirmationService,
          useFactory: createConfirmationServiceMock,
        },
      ],
    });
    service = TestBed.inject(ImportUserAccountsService);
    requestService = TestBed.inject(RequestService) as any;
    userService = TestBed.inject(UserService) as any;
    toastHandlingService = TestBed.inject(ToastHandlingService) as any;
    confirmationService = TestBed.inject(ConfirmationService) as any;
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
          { bypassAuthError: true, loadingKey: 'upload' }
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
      error: { statusCode: 500 }, // Add error object with statusCode
    });

    // Mock the postFile to throw an error
    (requestService.postFile as any).mockReturnValue(throwError(() => error));

    // Use firstValueFrom to handle the observable more directly
    const { firstValueFrom } = await import('rxjs');

    try {
      await firstValueFrom(service.importUserAccounts(formData, role));
      // Should not reach here
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
      expect(err).toBe(error);
    }
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
        // The service shows a confirmation dialog instead of calling toast.error
        expect(confirmationService.confirm).toHaveBeenCalled();
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

  it('should handle import error with exceed user limit status code', async () => {
    const formData = new FormData();
    const role = Role.Teacher;
    const error = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { statusCode: StatusCode.EXCEED_USER_LIMIT },
    });
    (requestService.postFile as any).mockReturnValue(throwError(() => error));
    await new Promise<void>(resolve => {
      service.importUserAccounts(formData, role).subscribe({
        next: () => {},
        error: err => {
          expect(toastHandlingService.warn).toHaveBeenCalledWith(
            'Vượt giới hạn tài khoản',
            expect.stringContaining('Đã đạt số lượng tài khoản tối đa')
          );
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(err).toBe(error);
          resolve();
        },
      });
    });
  });
});
