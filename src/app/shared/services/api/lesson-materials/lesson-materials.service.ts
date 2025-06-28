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
      .get<GetLessonMaterialsResponse>(this.LESSON_MATERIALS_API_URL, request)
      .pipe(
        tap(res => this.handleGetResponse(res)),
        map(res => this.extractLessonMaterialsFromResponse(res)),
        catchError(() => this.handleGetError())
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

  private handleGetResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const lessonMaterials = res.data;
      this.lessonMaterialsSignal.set(lessonMaterials.data ?? []);
      this.totalRecordsSignal.set(lessonMaterials.count ?? 0);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractLessonMaterialsFromResponse(
    res: any
  ): GetLessonMaterialsResponse | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleGetError(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }
}
