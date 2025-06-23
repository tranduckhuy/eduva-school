import { inject, Injectable, signal } from '@angular/core';

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
              'Thành công',
              'Tất cả tệp tin đã được tải lên thành công.'
            );
          } else {
            this.toastHandlingService.error(
              'Lỗi',
              'Tải lên tệp tin thất bại. Vui lòng thử lại.'
            );
          }
        }),
        map(() => void 0),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(void 0);
        })
      );
  }
}
