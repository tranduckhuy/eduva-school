import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type LessonMaterial } from '../../../models/entities/lesson-material.model';
import { type CreateLessonMaterialsRequest } from '../../../models/api/request/command/create-lesson-material-request.model';
import { type UpdateLessonMaterialRequest } from '../../../models/api/request/command/update-lesson-material-request.model';
import {
  type GetLessonMaterialsRequest,
  type GetPersonalLessonMaterialsRequest,
  type GetPendingLessonMaterialsRequest,
} from '../../../models/api/request/query/get-lesson-materials-request.model';
import { type GetPagingLessonMaterialsResponse } from '../../../models/api/response/query/get-lesson-materials-response.model';
import { type ApproveRejectMaterialRequest } from '../../../../features/moderation/moderate-lessons/models/approve-reject-material-request.model';
import { type DeleteMaterialRequest } from '../../../models/api/request/command/delete-material-request.model';
import { type LessonMaterialApproval } from '../../../models/entities/lesson-material-approval.model';

@Injectable({
  providedIn: 'root',
})
export class LessonMaterialsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_LESSON_MATERIALS_API_URL = `${this.BASE_API_URL}/lesson-materials`;
  private readonly LESSON_MATERIALS_BY_FOLDER_API_URL = `${this.BASE_API_URL}/folders`;

  private readonly lessonMaterialsSignal = signal<LessonMaterial[]>([]);
  lessonMaterials = this.lessonMaterialsSignal.asReadonly();

  private readonly lessonMaterialSignal = signal<LessonMaterial | null>(null);
  lessonMaterial = this.lessonMaterialSignal.asReadonly();

  private readonly lessonMaterialApprovalSignal =
    signal<LessonMaterialApproval | null>(null);
  lessonMaterialApproval = this.lessonMaterialApprovalSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  createLessonMaterials(
    request: CreateLessonMaterialsRequest
  ): Observable<null> {
    return this.requestService
      .post(this.BASE_LESSON_MATERIALS_API_URL, request)
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError(err => this.handleError(err))
      );
  }

  updateLessonMaterial(
    materialId: string,
    request: UpdateLessonMaterialRequest
  ): Observable<null> {
    return this.requestService
      .put(`${this.BASE_LESSON_MATERIALS_API_URL}/${materialId}`, request)
      .pipe(
        tap(res => this.handleUpdateResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getLessonMaterialsByFolder(
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

  getPersonalLessonMaterials(
    request: GetPersonalLessonMaterialsRequest
  ): Observable<LessonMaterial[] | null> {
    return this.requestService
      .get<GetPagingLessonMaterialsResponse>(
        `${this.BASE_LESSON_MATERIALS_API_URL}/me`,
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

  getPendingLessonMaterials(
    request: GetPendingLessonMaterialsRequest
  ): Observable<LessonMaterial[] | null> {
    return this.requestService
      .get<GetPagingLessonMaterialsResponse>(
        `${this.BASE_LESSON_MATERIALS_API_URL}/pending-approval`,
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
        `${this.BASE_LESSON_MATERIALS_API_URL}/school-public`,
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

  getLessonMaterialById(materialId: string): Observable<LessonMaterial | null> {
    return this.requestService
      .get<LessonMaterial>(
        `${this.BASE_LESSON_MATERIALS_API_URL}/${materialId}`
      )
      .pipe(
        tap(res => this.handleDetailResponse(res)),
        map(res => this.extractDetailResponse<LessonMaterial>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getLessonMaterialApprovalById(
    materialId: string
  ): Observable<LessonMaterialApproval[] | null> {
    return this.requestService
      .get<
        LessonMaterialApproval[]
      >(`${this.BASE_LESSON_MATERIALS_API_URL}/${materialId}/approvals`)
      .pipe(
        tap(res => this.handleApprovalDetailResponse(res)),
        map(res => this.extractDetailResponse<LessonMaterialApproval[]>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  approveRejectMaterial(
    lessonMaterialId: string,
    request: ApproveRejectMaterialRequest
  ): Observable<null> {
    return this.requestService
      .put(
        `${this.BASE_LESSON_MATERIALS_API_URL}/${lessonMaterialId}/pending-approval`,
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

  deleteMaterial(request: DeleteMaterialRequest): Observable<null> {
    return this.requestService
      .deleteWithBody(this.BASE_LESSON_MATERIALS_API_URL, request)
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  restoreMaterial(folderId: string, request: string[]): Observable<null> {
    return this.requestService
      .put(
        `${this.BASE_LESSON_MATERIALS_API_URL}/${folderId}/restore`,
        request,
        {
          loadingKey: 'restore-material',
        }
      )
      .pipe(
        tap(res => this.handleSuccessResponse(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleUpdateResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Cập nhật thành công',
        'Thông tin của tài liệu đã được cập nhật thành công.'
      );
    } else {
      this.toastHandlingService.error(
        'Cập nhật thất bại',
        'Không thể cập nhật thông tin tài liệu. Vui lòng thử lại sau.'
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

  private handleApprovalDetailResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.lessonMaterialApprovalSignal.set(res.data?.[0]);
      }
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

  private extractDetailResponse<T>(res: any): T | null {
    return res.statusCode === StatusCode.SUCCESS ? (res.data as T) : null;
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    switch (err.error?.statusCode) {
      case StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND:
        this.toastHandlingService.warn(
          'Thiếu gói đăng ký',
          'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
        );
        break;
      case StatusCode.LESSON_MATERIAL_NOT_ACTIVE:
        this.toastHandlingService.warn(
          'Bài giảng đã bị xóa',
          'Bài giảng đã bị giáo viên sở hữu chuyển vào thùng rác hoặc xóa.'
        );
        break;
      case StatusCode.STUDENT_NOT_ENROLLED_IN_CLASS_WITH_MATERIAL:
        this.toastHandlingService.warn(
          'Chưa tham gia lớp học',
          'Bạn chưa tham gia lớp học có chứa tài liệu này.'
        );
        window.history.back();
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }

    return throwError(() => err);
  }
}
