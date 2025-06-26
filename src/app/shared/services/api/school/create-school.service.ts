import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type CreateSchoolRequest } from '../../../models/api/request/create-school-request.model';

@Injectable({
  providedIn: 'root',
})
export class CreateSchoolService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly CREATE_SCHOOL_API_URL = `${this.BASE_API_URL}/schools`;

  createSchool(request: CreateSchoolRequest): Observable<void> {
    return this.requestService.post(this.CREATE_SCHOOL_API_URL, request).pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS) {
          this.toastHandlingService.info(
            'Thành công',
            'Thông tin trường học đã được ghi nhận. Hệ thống đang tạo đường dẫn thanh toán, vui lòng chờ trong giây lát...'
          );
          return;
        }
      }),
      catchError((err: HttpErrorResponse) => this.handleCreateSchoolError(err))
    );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreateSchoolError(err: HttpErrorResponse): Observable<void> {
    if (err.error.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID) {
      this.toastHandlingService.error(
        'Lỗi',
        'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }
}
