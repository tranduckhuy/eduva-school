import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type LessonMaterial } from '../../../models/entities/lesson-material.model';
import { type CreateLessonMaterialsRequest } from '../../../models/api/request/command/create-lesson-material-request.model';
import {
  type GetPendingLessonMaterialsRequest,
  type GetLessonMaterialsRequest,
} from '../../../models/api/request/query/get-lesson-materials-request.model';
import { type GetPagingLessonMaterialsResponse } from '../../../models/api/response/query/get-lesson-materials-response.model';
import { type ApproveRejectMaterialRequest } from '../../../../features/moderation/moderate-lessons/models/approve-reject-material-request.model';

@Injectable({
  providedIn: 'root',
})
export class LessonMaterialsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly LESSON_MATERIALS_API_URL = `${this.BASE_API_URL}/lesson-materials`;
  private readonly LESSON_MATERIALS_BY_FOLDER_API_URL = `${this.BASE_API_URL}/folders`;

  private readonly lessonMaterialsSignal = signal<LessonMaterial[]>([]);
  lessonMaterials = this.lessonMaterialsSignal.asReadonly();

  private readonly lessonMaterialSignal = signal<LessonMaterial | null>(null);
  lessonMaterial = this.lessonMaterialSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  createLessonMaterials(
    request: CreateLessonMaterialsRequest
  ): Observable<void> {
    return this.requestService
      .post(this.LESSON_MATERIALS_API_URL, request)
      .pipe(
        tap(res => this.handleCreateResponse(res)),
        map(() => void 0),
        catchError(err => this.handleCreateError(err))
      );
  }

  getLessonMaterials(
    folderId: string,
    request?: GetLessonMaterialsRequest
  ): Observable<LessonMaterial[] | null> {
    return this.requestService
      .get<LessonMaterial[]>(
        `${this.LESSON_MATERIALS_BY_FOLDER_API_URL}/${folderId}/lesson-materials`,
        request,
        {
          loadingKey: 'get-materials',
        }
      )
      .pipe(
        tap(res => this.handleListResponse(res)),
        map(res => this.extractListResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getPendingLessonMaterials(
    request: GetPendingLessonMaterialsRequest
  ): Observable<LessonMaterial[] | null> {
    return this.requestService
      .get<GetPagingLessonMaterialsResponse>(
        `${this.LESSON_MATERIALS_API_URL}/pending-approval`,
        request,
        {
          loadingKey: 'get-materials',
        }
      )
      .pipe(
        tap(res => this.handlePagingListResponse(res)),
        map(res => this.extractPagingListResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getSharedLessonMaterials(
    request: GetPendingLessonMaterialsRequest
  ): Observable<LessonMaterial[] | null> {
    return this.requestService
      .get<GetPagingLessonMaterialsResponse>(
        `${this.LESSON_MATERIALS_API_URL}/school-public`,
        request,
        {
          loadingKey: 'get-materials',
        }
      )
      .pipe(
        tap(res => this.handlePagingListResponse(res)),
        map(res => this.extractPagingListResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getLessonMaterialById(id: string): Observable<LessonMaterial | null> {
    return this.requestService
      .get<LessonMaterial>(`${this.LESSON_MATERIALS_API_URL}/${id}`)
      .pipe(
        tap(res => this.handleDetailResponse(res)),
        map(res => this.extractDetailResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  approveRejectMaterial(
    request: ApproveRejectMaterialRequest,
    lessonMaterialId: string
  ): Observable<null> {
    return this.requestService
      .put(
        `${this.LESSON_MATERIALS_API_URL}/${lessonMaterialId}/pending-approval`,
        request,
        {
          loadingKey: 'approve-reject-material',
        }
      )
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  deleteMaterial(request: string[], folderId: string): Observable<null> {
    return this.requestService
      .deleteWithBody(
        `${this.LESSON_MATERIALS_BY_FOLDER_API_URL}/${folderId}/lesson-materials`,
        request
      )
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  restoreMaterial(request: string[], folderId: string): Observable<null> {
    return this.requestService
      .put(`${this.LESSON_MATERIALS_API_URL}/${folderId}/restore`, request)
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreateResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Tải lên thành công',
        'Tất cả tài liệu đã được tải lên thành công.'
      );
    } else {
      this.toastHandlingService.error(
        'Tải lên thất bại',
        'Không thể tải lên tài liệu. Vui lòng thử lại sau.'
      );
    }
  }

  private handleListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.lessonMaterialsSignal.set(res.data ?? []);
      this.totalRecordsSignal.set(res.data.count ?? 0);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handlePagingListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.lessonMaterialsSignal.set(res.data.data ?? []);
      this.totalRecordsSignal.set(res.data.count ?? 0);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleDetailResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.lessonMaterialSignal.set(res.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleSuccessResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractListResponse(res: any): LessonMaterial[] | null {
    return res.statusCode === StatusCode.SUCCESS && res.data ? res.data : null;
  }

  private extractPagingListResponse(res: any): LessonMaterial[] | null {
    return res.statusCode === StatusCode.SUCCESS
      ? (res.data?.data ?? [])
      : null;
  }

  private extractDetailResponse(res: any): LessonMaterial | null {
    return res.statusCode === StatusCode.SUCCESS ? res.data : null;
  }

  private handleCreateError(err: HttpErrorResponse): Observable<void> {
    if (err.error?.statusCode === StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND) {
      this.toastHandlingService.warn(
        'Thiếu gói đăng ký',
        'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
