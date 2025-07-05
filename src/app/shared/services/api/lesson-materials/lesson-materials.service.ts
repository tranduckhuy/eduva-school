import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type LessonMaterial } from '../../../models/entities/lesson-material.model';
import { type CreateLessonMaterialsRequest } from '../../../models/api/request/command/create-lesson-material-request.model';
import { type GetLessonMaterialsRequest } from '../../../models/api/request/query/get-lesson-materials-request.model';
import { type GetLessonMaterialsResponse } from '../../../models/api/response/query/get-lesson-materials-response.model';

@Injectable({
  providedIn: 'root',
})
export class LessonMaterialsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly LESSON_MATERIALS_API_URL = `${this.BASE_API_URL}/lesson-materials`;

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
    request: GetLessonMaterialsRequest
  ): Observable<GetLessonMaterialsResponse | null> {
    return this.requestService
      .get<GetLessonMaterialsResponse>(this.LESSON_MATERIALS_API_URL, request, {
        loadingKey: 'get-materials',
      })
      .pipe(
        tap(res => this.handleListResponse(res)),
        map(res => this.extractListResponse(res)),
        catchError(() => this.handleError())
      );
  }

  getLessonMaterialById(id: string): Observable<LessonMaterial | null> {
    return this.requestService
      .get<LessonMaterial>(`${this.LESSON_MATERIALS_API_URL}/${id}`)
      .pipe(
        tap(res => this.handleDetailResponse(res)),
        map(res => this.extractDetailResponse(res)),
        catchError(() => this.handleError())
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

  private handleListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.lessonMaterialsSignal.set(res.data.data ?? []);
      this.totalRecordsSignal.set(res.data.count ?? 0);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractListResponse(res: any): GetLessonMaterialsResponse | null {
    return res.statusCode === StatusCode.SUCCESS ? res.data : null;
  }

  private handleDetailResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.lessonMaterialSignal.set(res.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractDetailResponse(res: any): LessonMaterial | null {
    return res.statusCode === StatusCode.SUCCESS ? res.data : null;
  }

  private handleError(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }
}
