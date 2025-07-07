import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { FolderManagementService } from './folder-management.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { type Folder } from '../../../models/entities/folder.model';
import { FolderOwnerType } from '../../../models/enum/folder-owner-type.enum';
import { type CreateFolderRequest } from '../../../models/api/request/command/create-folder-request.model';
import { type GetFoldersRequest } from '../../../models/api/request/query/get-folders-request.model';
import { type GetFoldersResponse } from '../../../models/api/response/query/get-folders-response.model';

describe('FolderManagementService', () => {
  let service: FolderManagementService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockFolder: Folder = {
    id: '1',
    name: 'Folder 1',
    ownerName: 'User 1',
    ownerType: FolderOwnerType.Personal,
    order: 1,
    countLessonMaterial: 2,
    createdAt: '2024-01-01',
    lastModifiedAt: '2024-01-02',
  };
  const mockFolder2: Folder = {
    ...mockFolder,
    id: '2',
    name: 'Folder 2',
    ownerType: FolderOwnerType.Class,
  };
  const mockCreateRequest: CreateFolderRequest = { name: 'Folder 1' };
  const mockGetFoldersRequest: GetFoldersRequest = {
    pageIndex: 1,
    pageSize: 10,
  };
  const mockGetFoldersResponse: GetFoldersResponse = {
    pageIndex: 1,
    pageSize: 10,
    count: 2,
    data: [mockFolder, mockFolder2],
  };

  beforeEach(() => {
    requestService = {
      post: vi.fn(),
      get: vi.fn(),
    } as any;
    toastHandlingService = {
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      errorGeneral: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        FolderManagementService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(FolderManagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createFolder', () => {
    it('should create folder and show success toast', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.CREATED, data: mockFolder })
      );
      await new Promise<void>(resolve => {
        service.createFolder(mockCreateRequest).subscribe(result => {
          expect(result).toEqual(mockFolder);
          expect(toastHandlingService.success).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show error toast if not CREATED', async () => {
      (requestService.post as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockFolder })
      );
      await new Promise<void>(resolve => {
        service.createFolder(mockCreateRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show warn if FOLDER_NAME_ALREADY_EXISTS', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.FOLDER_NAME_ALREADY_EXISTS },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createFolder(mockCreateRequest).subscribe({
          error: () => {
            expect(toastHandlingService.warn).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
    it('should show error if FOLDER_CREATE_FAILED', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.FOLDER_CREATE_FAILED },
      });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createFolder(mockCreateRequest).subscribe({
          error: () => {
            expect(toastHandlingService.error).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
    it('should show errorGeneral for other errors', async () => {
      const error = new HttpErrorResponse({ error: { statusCode: 9999 } });
      (requestService.post as any).mockReturnValue(throwError(() => error));
      await new Promise<void>(resolve => {
        service.createFolder(mockCreateRequest).subscribe({
          error: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('getAllFolders', () => {
    it('should get all folders and update signals on SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockGetFoldersResponse })
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toEqual([mockFolder, mockFolder2]);
          expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
          expect(service.totalRecords()).toBe(2);
          resolve();
        });
      });
    });
    it('should show error toast if not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SYSTEM_ERROR,
          data: mockGetFoldersResponse,
        })
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should show error toast if data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.error).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should handle error and show errorGeneral', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });
    it('should handle edge case: empty data', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: { ...mockGetFoldersResponse, data: [] },
        })
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toEqual([]);
          expect(service.folderList()).toEqual([]);
          expect(service.totalRecords()).toBe(2);
          resolve();
        });
      });
    });
    it('should handle edge case: missing count', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: { ...mockGetFoldersResponse, count: undefined },
        })
      );
      await new Promise<void>(resolve => {
        service.getAllFolders(mockGetFoldersRequest).subscribe(result => {
          expect(service.totalRecords()).toBe(0);
          resolve();
        });
      });
    });
  });

  describe('getPersonalFolders', () => {
    it('should call fetchFolders with /user', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockGetFoldersResponse })
      );
      await new Promise<void>(resolve => {
        service.getPersonalFolders(mockGetFoldersRequest).subscribe(result => {
          expect(result).toEqual([mockFolder, mockFolder2]);
          resolve();
        });
      });
    });
  });

  describe('getClassFolders', () => {
    it('should call fetchFolders with /class/:id', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockGetFoldersResponse })
      );
      await new Promise<void>(resolve => {
        service.getClassFolders('123').subscribe(result => {
          expect(result).toEqual([mockFolder, mockFolder2]);
          resolve();
        });
      });
    });
  });
});
