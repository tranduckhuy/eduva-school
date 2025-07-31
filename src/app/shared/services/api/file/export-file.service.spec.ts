import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { ExportFileService } from './export-file.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';
import { type ExportUsersRequest } from '../../../models/api/request/query/export-users-request.model';
import { environment } from '../../../../../environments/environment';
import { Role } from '../../../models/enum/role.enum';
import { EntityStatus } from '../../../models/enum/entity-status.enum';

// Mock the utility functions
vi.mock('../../../utils/util-functions', () => ({
  getFileName: vi.fn(),
  triggerBlobDownload: vi.fn(),
}));

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://test-api.com',
  },
}));

describe('ExportFileService', () => {
  let service: ExportFileService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;
  let mockGetFileName: ReturnType<typeof vi.fn>;
  let mockTriggerBlobDownload: ReturnType<typeof vi.fn>;

  const mockRequestService = {
    getFile: vi.fn(),
  };

  const mockToastHandlingService = {
    successGeneral: vi.fn(),
    errorGeneral: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportFileService,
        { provide: RequestService, useValue: mockRequestService },
        { provide: ToastHandlingService, useValue: mockToastHandlingService },
      ],
    });

    service = TestBed.inject(ExportFileService);
    requestService = TestBed.inject(RequestService);
    toastHandlingService = TestBed.inject(ToastHandlingService);

    // Get references to mocked utility functions
    mockGetFileName = vi.mocked(getFileName);
    mockTriggerBlobDownload = vi.mocked(triggerBlobDownload);

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportUsers', () => {
    const mockRequest: ExportUsersRequest = {
      role: Role.Student,
      status: EntityStatus.Active,
      searchTerm: 'test',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    const mockFileName = 'exported_users.pdf';

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should call requestService.getFile with correct parameters', () => {
      // Arrange
      const expectedUrl = `${environment.baseApiUrl}/users/export`;
      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act
      service.exportUsers(mockRequest);

      // Assert
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        expectedUrl,
        mockRequest,
        { loadingKey: 'export-users' }
      );
    });

    it('should handle successful response with valid blob', () => {
      // Arrange
      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
        headers: {
          get: vi
            .fn()
            .mockReturnValue('attachment; filename="exported_users.pdf"'),
        } as any,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act
      service.exportUsers(mockRequest).subscribe();

      // Assert
      expect(mockGetFileName).toHaveBeenCalledWith(mockResponse);
      expect(mockTriggerBlobDownload).toHaveBeenCalledWith(
        mockFileName,
        mockBlob
      );
      expect(mockToastHandlingService.successGeneral).toHaveBeenCalled();
      expect(mockToastHandlingService.errorGeneral).not.toHaveBeenCalled();
    });

    it('should handle response with empty blob', () => {
      // Arrange
      const emptyBlob = new Blob([], { type: 'application/pdf' });
      const mockResponse = new HttpResponse<Blob>({
        body: emptyBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));

      // Act
      service.exportUsers(mockRequest).subscribe();

      // Assert
      expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
      expect(mockToastHandlingService.successGeneral).not.toHaveBeenCalled();
      expect(mockGetFileName).not.toHaveBeenCalled();
      expect(mockTriggerBlobDownload).not.toHaveBeenCalled();
    });

    it('should handle response with null blob', () => {
      // Arrange
      const mockResponse = new HttpResponse<Blob>({
        body: null,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));

      // Act
      service.exportUsers(mockRequest).subscribe();

      // Assert
      expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
      expect(mockToastHandlingService.successGeneral).not.toHaveBeenCalled();
      expect(mockGetFileName).not.toHaveBeenCalled();
      expect(mockTriggerBlobDownload).not.toHaveBeenCalled();
    });

    it('should handle response with blob size 0', () => {
      // Arrange
      const zeroSizeBlob = new Blob([''], { type: 'application/pdf' });
      const mockResponse = new HttpResponse<Blob>({
        body: zeroSizeBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));

      // Act
      service.exportUsers(mockRequest).subscribe();

      // Assert
      expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
      expect(mockToastHandlingService.successGeneral).not.toHaveBeenCalled();
      expect(mockGetFileName).not.toHaveBeenCalled();
      expect(mockTriggerBlobDownload).not.toHaveBeenCalled();
    });

    it('should handle HTTP error response', () => {
      // Arrange
      const mockError = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      });
      mockRequestService.getFile.mockReturnValue(throwError(() => mockError));

      // Act
      service.exportUsers(mockRequest).subscribe({
        error: (error: HttpErrorResponse) => {
          // Assert
          expect(error).toBe(mockError);
          expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(
            mockToastHandlingService.successGeneral
          ).not.toHaveBeenCalled();
          expect(mockGetFileName).not.toHaveBeenCalled();
          expect(mockTriggerBlobDownload).not.toHaveBeenCalled();
        },
      });
    });

    it('should handle network error', () => {
      // Arrange
      const mockError = new HttpErrorResponse({
        error: new ErrorEvent('Network error'),
        status: 0,
        statusText: 'Network Error',
      });
      mockRequestService.getFile.mockReturnValue(throwError(() => mockError));

      // Act
      service.exportUsers(mockRequest).subscribe({
        error: (error: HttpErrorResponse) => {
          // Assert
          expect(error).toBe(mockError);
          expect(mockToastHandlingService.errorGeneral).toHaveBeenCalled();
          expect(
            mockToastHandlingService.successGeneral
          ).not.toHaveBeenCalled();
          expect(mockGetFileName).not.toHaveBeenCalled();
          expect(mockTriggerBlobDownload).not.toHaveBeenCalled();
        },
      });
    });

    it('should handle successful response with different blob types', () => {
      // Arrange
      const excelBlob = new Blob(['excel content'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockResponse = new HttpResponse<Blob>({
        body: excelBlob,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue('attachment; filename="users.xlsx"'),
        } as any,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue('users.xlsx');

      // Act
      service.exportUsers(mockRequest).subscribe();

      // Assert
      expect(mockGetFileName).toHaveBeenCalledWith(mockResponse);
      expect(mockTriggerBlobDownload).toHaveBeenCalledWith(
        'users.xlsx',
        excelBlob
      );
      expect(mockToastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle request with minimal parameters', () => {
      // Arrange
      const minimalRequest: ExportUsersRequest = {};
      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act
      service.exportUsers(minimalRequest).subscribe();

      // Assert
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        minimalRequest,
        { loadingKey: 'export-users' }
      );
      expect(mockToastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle request with all parameters', () => {
      // Arrange
      const fullRequest: ExportUsersRequest = {
        role: Role.Teacher,
        status: EntityStatus.InActive,
        searchTerm: 'john doe',
        sortBy: 'name',
        sortDirection: 'asc',
      };
      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act
      service.exportUsers(fullRequest).subscribe();

      // Assert
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        fullRequest,
        { loadingKey: 'export-users' }
      );
      expect(mockToastHandlingService.successGeneral).toHaveBeenCalled();
    });

    it('should handle request with different role types', () => {
      // Arrange
      const teacherRequest: ExportUsersRequest = {
        role: Role.Teacher,
        status: EntityStatus.Active,
      };
      const moderatorRequest: ExportUsersRequest = {
        role: Role.ContentModerator,
        status: EntityStatus.Active,
      };
      const adminRequest: ExportUsersRequest = {
        role: Role.SchoolAdmin,
        status: EntityStatus.Active,
      };

      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act & Assert for Teacher
      service.exportUsers(teacherRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        teacherRequest,
        { loadingKey: 'export-users' }
      );

      // Act & Assert for ContentModerator
      service.exportUsers(moderatorRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        moderatorRequest,
        { loadingKey: 'export-users' }
      );

      // Act & Assert for SchoolAdmin
      service.exportUsers(adminRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        adminRequest,
        { loadingKey: 'export-users' }
      );
    });

    it('should handle request with different status types', () => {
      // Arrange
      const activeRequest: ExportUsersRequest = {
        role: Role.Student,
        status: EntityStatus.Active,
      };
      const inactiveRequest: ExportUsersRequest = {
        role: Role.Student,
        status: EntityStatus.InActive,
      };
      const deletedRequest: ExportUsersRequest = {
        role: Role.Student,
        status: EntityStatus.Deleted,
      };
      const archivedRequest: ExportUsersRequest = {
        role: Role.Student,
        status: EntityStatus.Archived,
      };

      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act & Assert for Active
      service.exportUsers(activeRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        activeRequest,
        { loadingKey: 'export-users' }
      );

      // Act & Assert for InActive
      service.exportUsers(inactiveRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        inactiveRequest,
        { loadingKey: 'export-users' }
      );

      // Act & Assert for Deleted
      service.exportUsers(deletedRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        deletedRequest,
        { loadingKey: 'export-users' }
      );

      // Act & Assert for Archived
      service.exportUsers(archivedRequest).subscribe();
      expect(mockRequestService.getFile).toHaveBeenCalledWith(
        `${environment.baseApiUrl}/users/export`,
        archivedRequest,
        { loadingKey: 'export-users' }
      );
    });

    it('should return the observable from requestService.getFile', () => {
      // Arrange
      const mockResponse = new HttpResponse<Blob>({
        body: mockBlob,
        status: 200,
      });
      mockRequestService.getFile.mockReturnValue(of(mockResponse));
      mockGetFileName.mockReturnValue(mockFileName);

      // Act & Assert
      service
        .exportUsers(mockRequest)
        .subscribe((response: HttpResponse<Blob>) => {
          expect(response).toBe(mockResponse);
        });
    });
  });
});
