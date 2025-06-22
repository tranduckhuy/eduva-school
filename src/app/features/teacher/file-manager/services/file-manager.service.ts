import { inject, Injectable, signal } from '@angular/core';

import { Observable, catchError, finalize, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type LessonMaterialRequest } from '../../../../shared/models/api/request/lesson-material-request.model';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly UPLOAD_LESSON_MATERIALS_API_URL = `${this.BASE_API_URL}/lesson-materials`;

  private readonly isLoadingSignal = signal<boolean>(false);
  isLoading = this.isLoadingSignal.asReadonly();

  uploadLessonMaterials(request: LessonMaterialRequest[]): Observable<void> {
    this.isLoadingSignal.set(true);

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
        }),
        finalize(() => {
          this.isLoadingSignal.set(false);
        })
      );
  }
}
