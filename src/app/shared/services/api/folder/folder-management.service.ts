import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

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
          if (res.statusCode === StatusCode.CREATED && res.data) {
            this.toastHandlingService.success(
              'Tạo bài giảng thành công',
              `Bài giảng "${res.data.name}" đã được tạo thành công.`
            );
            const currentList = this.folderListSignal();
            const updatedList = [...currentList, res.data];
            this.folderListSignal.set(updatedList);
            this.totalRecordsSignal.set(updatedList.length);
          } else {
            this.toastHandlingService.error(
              'Tạo bài giảng thất bại',
              'Đã xảy ra sự cố trong quá trình tạo bài giảng. Vui lòng thử lại sau.'
            );
          }
        }),
        map(res => this.extractData<Folder>(res)),
        catchError((err: HttpErrorResponse) => this.handleCreateError(err))
      );
  }

  getAllFolders(
    request: GetFoldersRequest
  ): Observable<GetFoldersResponse | null> {
    return this.fetchFolders(this.BASE_FOLDERS_API_URL, request);
  }

  getPersonalFolders(
    request: GetFoldersRequest
  ): Observable<GetFoldersResponse | null> {
    return this.fetchFolders(`${this.BASE_FOLDERS_API_URL}/user`, request);
  }

  getClassFolders(
    request: GetFoldersRequest,
    classId: string
  ): Observable<GetFoldersResponse | null> {
    return this.fetchFolders(
      `${this.BASE_FOLDERS_API_URL}/class/${classId}`,
      request
    );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private fetchFolders(
    api: string,
    request: GetFoldersRequest
  ): Observable<GetFoldersResponse | null> {
    return this.requestService.get<GetFoldersResponse>(api, request).pipe(
      tap(res => {
        if (res.statusCode === StatusCode.SUCCESS && res.data) {
          const folders = res.data;
          this.folderListSignal.set(folders.data ?? []);
          this.totalRecordsSignal.set(folders.count ?? 0);
        } else {
          this.toastHandlingService.error(
            'Lấy danh sách bài giảng thất bại',
            'Không thể lấy được danh sách bài giảng. Vui lòng thử lại sau.'
          );
        }
      }),
      map(res => this.extractData<GetFoldersResponse>(res)),
      catchError(() => this.handleGetError())
    );
  }

  private extractData<T>(res: any): T | null {
    return res.statusCode === StatusCode.SUCCESS && res.data ? res.data : null;
  }

  private handleGetError(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }

  private handleCreateError(err: HttpErrorResponse): Observable<null> {
    switch (err.error.statusCode) {
      case StatusCode.FOLDER_NAME_ALREADY_EXISTS:
        this.toastHandlingService.error(
          'Tạo bài giảng thất bại',
          'Tên bài giảng đã tồn tại. Vui lòng chọn tên khác.'
        );
        break;
      case StatusCode.FOLDER_CREATE_FAILED:
        this.toastHandlingService.error(
          'Tạo bài giảng thất bại',
          'Đã xảy ra sự cố trong quá trình tạo bài giảng. Vui lòng thử lại sau.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
    return of(null);
  }
}
