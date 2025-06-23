import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type LessonMaterialsRequest } from '../../../models/api/request/lesson-material-request.model';

@Injectable({
  providedIn: 'root',
})
export class LessonMaterialsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly UPLOAD_LESSON_MATERIALS_API_URL = `${this.BASE_API_URL}/lesson-materials`;

  createLessonMaterials(request: LessonMaterialsRequest): Observable<void> {
    return this.requestService
      .post(this.UPLOAD_LESSON_MATERIALS_API_URL, request)
      .pipe(
        tap(res => {
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
        }),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => {
          if (
            err.error.statusCode === StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND
          ) {
            this.toastHandlingService.warn(
              'Thiếu gói đăng ký',
              'Trường học của bạn hiện chưa đăng ký gói sử dụng hệ thống.'
            );
            return of(void 0);
          }
          this.toastHandlingService.errorGeneral();
          return of(void 0);
        })
      );
  }
}
