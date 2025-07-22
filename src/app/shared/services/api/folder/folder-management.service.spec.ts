import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
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
import { type RenameFolderRequest } from '../../../models/api/request/command/rename-material-request.model';

describe('FolderManagementService', () => {
  let service: FolderManagementService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockFolder: Folder = {
    id: '1',
    name: 'Test Folder',
    ownerName: 'Test User',
    ownerType: FolderOwnerType.Personal,
    order: 1,
    countLessonMaterial: 5,
    createdAt: '2024-01-01T00:00:00Z',
    lastModifiedAt: '2024-01-02T00:00:00Z',
  };

  const mockFolder2: Folder = {
    id: '2',
    name: 'Test Folder 2',
    ownerName: 'Test User 2',
    ownerType: FolderOwnerType.Class,
    order: 2,
    countLessonMaterial: 3,
    createdAt: '2024-01-03T00:00:00Z',
    lastModifiedAt: '2024-01-04T00:00:00Z',
  };

  const mockCreateRequest: CreateFolderRequest = {
    name: 'New Folder',
  };

  const mockRenameRequest: RenameFolderRequest = {
    name: 'Renamed Folder',
  };

  const mockGetFoldersRequest: GetFoldersRequest = {
    pageIndex: 1,
    pageSize: 10,
    searchTerm: 'test',
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
      put: vi.fn(),
      delete: vi.fn(),
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

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial empty folder list signal', () => {
      expect(service.folderList()).toEqual([]);
    });

    it('should have initial total records signal as 0', () => {
      expect(service.totalRecords()).toBe(0);
    });

    it('should have initial total trash records signal as 0', () => {
      expect(service.totalTrashRecords()).toBe(0);
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully with CREATED status and return folder', async () => {
      const successResponse = {
        statusCode: StatusCode.CREATED,
        data: mockFolder,
      };

      (requestService.post as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toEqual(mockFolder);
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Tạo thư mục thành công',
        `Thư mục "${mockFolder.name}" đã được tạo thành công.`
      );
    });

    it('should create folder with SUCCESS status and return data', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockFolder,
      };

      (requestService.post as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toEqual(mockFolder);
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Tạo thư mục thành công',
        `Thư mục "${mockFolder.name}" đã được tạo thành công.`
      );
    });

    it('should handle create folder failure and show error toast', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };

      (requestService.post as any).mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Tạo thư mục thất bại',
        'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle FOLDER_NAME_ALREADY_EXISTS error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.FOLDER_NAME_ALREADY_EXISTS },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.createFolder(mockCreateRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.warn).toHaveBeenCalledWith(
        'Cảnh báo',
        'Tên thư mục đã tồn tại. Vui lòng chọn tên khác.'
      );
    });

    it('should handle FOLDER_CREATE_FAILED error', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: StatusCode.FOLDER_CREATE_FAILED },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.createFolder(mockCreateRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Tạo thư mục thất bại',
        'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle unknown error with errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: { statusCode: 9999 },
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.createFolder(mockCreateRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.post as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.createFolder(mockCreateRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('getPersonalFolders', () => {
    it('should get personal folders successfully and update signals', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockGetFoldersResponse,
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      expect(service.totalRecords()).toBe(2);
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining('/folders/user'),
        mockGetFoldersRequest,
        { loadingKey: 'get-folders' }
      );
    });

    it('should handle response without data and show error', async () => {
      const responseWithoutData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(responseWithoutData));

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Lấy danh sách thư mục thất bại',
        'Không thể lấy được danh sách thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle response with empty data array', async () => {
      const responseWithEmptyData = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, data: [] },
      };

      (requestService.get as any).mockReturnValue(of(responseWithEmptyData));

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toEqual([]);
      expect(service.folderList()).toEqual([]);
      expect(service.totalRecords()).toBe(2);
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.getPersonalFolders(mockGetFoldersRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle isPaging: false explicitly', async () => {
      const requestWithIsPagingFalse = {
        ...mockGetFoldersRequest,
        isPaging: false,
      };
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockFolder, mockFolder2],
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getPersonalFolders(requestWithIsPagingFalse)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      // Should not update total records for non-paging requests
      expect(service.totalRecords()).toBe(0);
      expect(service.totalTrashRecords()).toBe(0);
    });

    it('should handle isPaging: true explicitly', async () => {
      const requestWithIsPagingTrue = {
        ...mockGetFoldersRequest,
        isPaging: true,
      };
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockGetFoldersResponse,
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getPersonalFolders(requestWithIsPagingTrue)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      expect(service.totalRecords()).toBe(2);
      expect(service.totalTrashRecords()).toBe(2);
    });

    it('should handle isPaging: undefined (default to true)', async () => {
      const requestWithIsPagingUndefined = { ...mockGetFoldersRequest };
      delete requestWithIsPagingUndefined.isPaging;

      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockGetFoldersResponse,
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getPersonalFolders(requestWithIsPagingUndefined)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      expect(service.totalRecords()).toBe(2);
      expect(service.totalTrashRecords()).toBe(2);
    });
  });

  describe('getClassFolders', () => {
    const classId = 'class-123';

    it('should get class folders successfully and update signal', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockFolder, mockFolder2],
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.getClassFolders(classId));

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      expect(requestService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/class/${classId}`),
        { loadingKey: 'get-folders' }
      );
    });

    it('should handle response with CREATED status code', async () => {
      const createdResponse = {
        statusCode: StatusCode.CREATED,
        data: [mockFolder],
      };

      (requestService.get as any).mockReturnValue(of(createdResponse));

      const result = await firstValueFrom(service.getClassFolders(classId));

      expect(result).toBeNull(); // extractFolderListFromResponse only accepts SUCCESS
      expect(service.folderList()).toEqual([]); // handleFolderListResponse only accepts SUCCESS
    });

    it('should handle response without data and show error', async () => {
      const responseWithoutData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(responseWithoutData));

      const result = await firstValueFrom(service.getClassFolders(classId));

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Lấy danh sách thư mục thất bại',
        'Không thể lấy được danh sách thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.get as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.getClassFolders(classId))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('archiveFolder', () => {
    const folderId = 'folder-123';

    it('should archive folder successfully and show success toast', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
      };

      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.archiveFolder(folderId));

      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}/archive`)
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle archive failure and show error toast', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
      };

      (requestService.put as any).mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(service.archiveFolder(folderId));

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.archiveFolder(folderId))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('removeClassFolder', () => {
    const folderId = 'folder-123';

    it('should remove folder successfully and show success toast', async () => {
      const successResponse = {
        statusCode: StatusCode.DELETED,
      };

      (requestService.delete as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.removeClassFolder(folderId));

      expect(result).toBeNull();
      expect(requestService.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}`)
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle remove failure and show error toast', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
      };

      (requestService.delete as any).mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(service.removeClassFolder(folderId));

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.delete as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.removeClassFolder(folderId))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('renameFolder', () => {
    const folderId = 'folder-123';

    it('should rename folder successfully and show success toast', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
      };

      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.renameFolder(folderId, mockRenameRequest)
      );

      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}/rename`),
        mockRenameRequest,
        { loadingKey: 'rename-folder' }
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle rename failure and show error toast', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
      };

      (requestService.put as any).mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(
        service.renameFolder(folderId, mockRenameRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.renameFolder(folderId, mockRenameRequest))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('restoreFolder', () => {
    const folderId = 'folder-123';

    it('should restore folder successfully and show success toast', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
      };

      (requestService.put as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.restoreFolder(folderId));

      expect(result).toBeNull();
      expect(requestService.put).toHaveBeenCalledWith(
        expect.stringContaining(`/folders/${folderId}/restore`)
      );
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle restore failure and show error toast', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
      };

      (requestService.put as any).mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(service.restoreFolder(folderId));

      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should handle error and call errorGeneral', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });

      (requestService.put as any).mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.restoreFolder(folderId))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });

  describe('Signal Updates', () => {
    it('should update folderList signal when getting personal folders', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: mockGetFoldersResponse,
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      // Verify initial state
      expect(service.folderList()).toEqual([]);
      expect(service.totalRecords()).toBe(0);
      expect(service.totalTrashRecords()).toBe(0);

      await firstValueFrom(service.getPersonalFolders(mockGetFoldersRequest));

      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      expect(service.totalRecords()).toBe(2);
      expect(service.totalTrashRecords()).toBe(2);
    });

    it('should update folderList signal when getting class folders', async () => {
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockFolder],
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      // Verify initial state
      expect(service.folderList()).toEqual([]);

      await firstValueFrom(service.getClassFolders('class-123'));

      expect(service.folderList()).toEqual([mockFolder]);
    });

    it('should not update signals on error responses', async () => {
      const errorResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(errorResponse));

      // Set initial state by calling a method that updates signals
      const initialResponse = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, data: [mockFolder], count: 1 },
      };
      (requestService.get as any).mockReturnValue(of(initialResponse));
      await firstValueFrom(service.getPersonalFolders(mockGetFoldersRequest));

      // Now test with error response
      (requestService.get as any).mockReturnValue(of(errorResponse));
      await firstValueFrom(service.getPersonalFolders(mockGetFoldersRequest));

      // Signals should remain unchanged
      expect(service.folderList()).toEqual([mockFolder]);
      expect(service.totalRecords()).toBe(1);
      expect(service.totalTrashRecords()).toBe(1);
    });

    it('should handle non-paging response for personal folders', async () => {
      const nonPagingRequest = { ...mockGetFoldersRequest, isPaging: false };
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: [mockFolder, mockFolder2],
      };

      (requestService.get as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.getPersonalFolders(nonPagingRequest)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.folderList()).toEqual([mockFolder, mockFolder2]);
      // Should not update total records for non-paging requests
      expect(service.totalRecords()).toBe(0);
      expect(service.totalTrashRecords()).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data in paging response', async () => {
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, data: null },
      };

      (requestService.get as any).mockReturnValue(of(responseWithNullData));

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle undefined count in paging response', async () => {
      const responseWithUndefinedCount = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, count: undefined },
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithUndefinedCount)
      );

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toEqual([mockFolder, mockFolder2]);
      expect(service.totalRecords()).toBe(0);
    });

    it('should handle empty folder name in create success message with CREATED status', async () => {
      const folderWithEmptyName = { ...mockFolder, name: '' };
      const successResponse = {
        statusCode: StatusCode.CREATED,
        data: folderWithEmptyName,
      };

      (requestService.post as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toEqual(folderWithEmptyName);
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Tạo thư mục thành công',
        'Thư mục "" đã được tạo thành công.'
      );
    });

    it('should handle empty folder name in create success message with SUCCESS status', async () => {
      const folderWithEmptyName = { ...mockFolder, name: '' };
      const successResponse = {
        statusCode: StatusCode.SUCCESS,
        data: folderWithEmptyName,
      };

      (requestService.post as any).mockReturnValue(of(successResponse));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toEqual(folderWithEmptyName);
      expect(toastHandlingService.success).toHaveBeenCalledWith(
        'Tạo thư mục thành công',
        'Thư mục "" đã được tạo thành công.'
      );
    });

    it('should handle null data in create response with CREATED status', async () => {
      const responseWithNullData = {
        statusCode: StatusCode.CREATED,
        data: null,
      };

      (requestService.post as any).mockReturnValue(of(responseWithNullData));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Tạo thư mục thất bại',
        'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle null data in create response with SUCCESS status', async () => {
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.post as any).mockReturnValue(of(responseWithNullData));

      const result = await firstValueFrom(
        service.createFolder(mockCreateRequest)
      );

      expect(result).toBeNull();
      expect(toastHandlingService.error).toHaveBeenCalledWith(
        'Tạo thư mục thất bại',
        'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
      );
    });

    it('should handle undefined data in class folders response', async () => {
      const responseWithUndefinedData = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithUndefinedData)
      );

      const result = await firstValueFrom(service.getClassFolders('class-123'));

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle null data in class folders response', async () => {
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(responseWithNullData));

      const result = await firstValueFrom(service.getClassFolders('class-123'));

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle undefined data in non-paging response', async () => {
      const requestWithIsPagingFalse = {
        ...mockGetFoldersRequest,
        isPaging: false,
      };
      const responseWithUndefinedData = {
        statusCode: StatusCode.SUCCESS,
        data: undefined,
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithUndefinedData)
      );

      const result = await firstValueFrom(
        service.getPersonalFolders(requestWithIsPagingFalse)
      );

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle null data in non-paging response', async () => {
      const requestWithIsPagingFalse = {
        ...mockGetFoldersRequest,
        isPaging: false,
      };
      const responseWithNullData = {
        statusCode: StatusCode.SUCCESS,
        data: null,
      };

      (requestService.get as any).mockReturnValue(of(responseWithNullData));

      const result = await firstValueFrom(
        service.getPersonalFolders(requestWithIsPagingFalse)
      );

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle undefined data.data in paging response', async () => {
      const responseWithUndefinedDataData = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, data: undefined },
      };

      (requestService.get as any).mockReturnValue(
        of(responseWithUndefinedDataData)
      );

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });

    it('should handle null data.data in paging response', async () => {
      const responseWithNullDataData = {
        statusCode: StatusCode.SUCCESS,
        data: { ...mockGetFoldersResponse, data: null },
      };

      (requestService.get as any).mockReturnValue(of(responseWithNullDataData));

      const result = await firstValueFrom(
        service.getPersonalFolders(mockGetFoldersRequest)
      );

      expect(result).toBeNull();
      expect(service.folderList()).toEqual([]);
    });
  });

  describe('removeFolder', () => {
    const folderIds = ['folder1', 'folder2'];
    const url = '/api/folders/user'; // This will be replaced by the actual base URL in the service

    it('should remove folder successfully and show success toast', async () => {
      const successResponse = {
        statusCode: StatusCode.DELETED,
      };
      // Patch the actual URL used in the service
      (requestService.deleteWithBody as any) = vi
        .fn()
        .mockReturnValue(of(successResponse));

      const result = await firstValueFrom(service.removeFolder(folderIds));
      expect(requestService.deleteWithBody).toHaveBeenCalledWith(
        expect.stringContaining('/folders/user'),
        folderIds
      );
      expect(result).toBeNull();
      expect(toastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should show error toast on non-DELETED statusCode', async () => {
      const failureResponse = {
        statusCode: StatusCode.SYSTEM_ERROR,
      };
      (requestService.deleteWithBody as any) = vi
        .fn()
        .mockReturnValue(of(failureResponse));

      const result = await firstValueFrom(service.removeFolder(folderIds));
      expect(result).toBeNull();
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });

    it('should show errorGeneral on error', async () => {
      const error = new HttpErrorResponse({
        error: new Error('Network error'),
      });
      (requestService.deleteWithBody as any) = vi
        .fn()
        .mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.removeFolder(folderIds))
      ).rejects.toBe(error);
      expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
    });
  });
});
