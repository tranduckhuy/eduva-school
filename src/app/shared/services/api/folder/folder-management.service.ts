import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type Folder } from '../../../models/entities/folder.model';
import { type CreateFolderRequest } from '../../../models/api/request/command/create-folder-request.model';
import { type GetFoldersRequest } from '../../../models/api/request/query/get-folders-request.model';
import { type GetFoldersResponse } from '../../../models/api/response/query/get-folders-response.model';

@Injectable({
  providedIn: 'root',
})
export class FolderManagementService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_FOLDERS_API_URL = `${this.BASE_API_URL}/folders`;

  private readonly folderListSignal = signal<Folder[]>([]);
  folderList = this.folderListSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  createFolder(request: CreateFolderRequest): Observable<Folder | null> {
    return this.requestService
      .post<Folder>(this.BASE_FOLDERS_API_URL, request, {
        loadingKey: 'create-folder',
      })
      .pipe(
        tap(res => {
          if (
            (res.statusCode === StatusCode.CREATED ||
              res.statusCode === StatusCode.SUCCESS) &&
            res.data
          ) {
            this.toastHandlingService.success(
              'Tạo thư mục thành công',
              `Thư mục "${res.data.name}" đã được tạo thành công.`
            );
          } else {
            this.toastHandlingService.error(
              'Tạo thư mục thất bại',
              'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
            );
          }
        }),
        map(res => this.extractSingleData(res)),
        catchError(err => this.handleCreateError(err))
      );
  }

  getPersonalFolders(request: GetFoldersRequest): Observable<Folder[] | null> {
    return this.requestService
      .get<GetFoldersResponse | Folder[]>(
        `${this.BASE_FOLDERS_API_URL}/user`,
        request,
        {
          loadingKey: 'get-folders',
        }
      )
      .pipe(
        tap(res =>
          this.handleFolderListResponse(res, {
            isPaging: request.isPaging !== false,
          })
        ),
        map(res =>
          this.extractFolderListFromResponse(res, {
            isPaging: request.isPaging !== false,
          })
        ),
        catchError(err => this.handleError(err))
      );
  }

  getClassFolders(classId: string): Observable<Folder[] | null> {
    return this.requestService
      .get<GetFoldersResponse>(
        `${this.BASE_FOLDERS_API_URL}/class/${classId}`,
        {
          loadingKey: 'get-folders',
        }
      )
      .pipe(
        tap(res => this.handleFolderListResponse(res)),
        map(res => this.extractFolderListFromResponse(res)),
        catchError(err => this.handleError(err))
      );
  }

  archiveFolder(folderId: string): Observable<null> {
    return this.requestService
      .put(`${this.BASE_FOLDERS_API_URL}/${folderId}/archive`)
      .pipe(
        tap(res => this.handleArchiveResponse(res)),
        map(() => null),
        catchError(err => this.handleError(err))
      );
  }

  removeFolder(folderId: string): Observable<null> {
    return this.requestService
      .delete(`${this.BASE_FOLDERS_API_URL}/${folderId}`)
      .pipe(
        tap(res => this.handleRemoveResponse(res)),
        map(() => null),
        catchError(err => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleFolderListResponse(
    res: any,
    options: { isPaging?: boolean } = {}
  ) {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const isPaging = options.isPaging ?? false;
      const folders = isPaging ? (res.data.data ?? []) : (res.data ?? []);

      this.folderListSignal.set([...folders]);
      if (isPaging) this.totalRecordsSignal.set(res.data.count ?? 0);
    } else {
      this.toastHandlingService.error(
        'Lấy danh sách thư mục thất bại',
        'Không thể lấy được danh sách thư mục. Vui lòng thử lại sau.'
      );
    }
  }

  private extractFolderListFromResponse(
    res: any,
    options: { isPaging?: boolean } = {}
  ): Folder[] | null {
    if (res.statusCode !== StatusCode.SUCCESS || !res.data) return null;

    const isPaging = options.isPaging ?? false;
    return isPaging
      ? ((res.data.data as Folder[]) ?? null)
      : ((res.data as Folder[]) ?? null);
  }

  private extractSingleData(res: any): Folder | null {
    return (res.statusCode === StatusCode.SUCCESS ||
      res.statusCode === StatusCode.CREATED) &&
      res.data
      ? (res.data as Folder)
      : null;
  }

  private handleArchiveResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleRemoveResponse(res: any): void {
    if (res.statusCode === StatusCode.DELETED) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleCreateError(err: HttpErrorResponse): Observable<null> {
    switch (err.error.statusCode) {
      case StatusCode.FOLDER_NAME_ALREADY_EXISTS:
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Tên thư mục đã tồn tại. Vui lòng chọn tên khác.'
        );
        break;
      case StatusCode.FOLDER_CREATE_FAILED:
        this.toastHandlingService.error(
          'Tạo thư mục thất bại',
          'Đã xảy ra sự cố trong quá trình tạo thư mục. Vui lòng thử lại sau.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
    return throwError(() => err);
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
