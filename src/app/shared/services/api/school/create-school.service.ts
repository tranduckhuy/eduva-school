import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { UserService } from '../user/user.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type School } from '../../../models/entities/school.model';
import { type CreateSchoolRequest } from '../../../models/api/request/command/create-school-request.model';

@Injectable({
  providedIn: 'root',
})
export class CreateSchoolService {
  private readonly userService = inject(UserService);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly CREATE_SCHOOL_API_URL = `${this.BASE_API_URL}/schools`;

  createSchool(request: CreateSchoolRequest): Observable<School | null> {
    return this.requestService
      .post<School>(this.CREATE_SCHOOL_API_URL, request)
      .pipe(
        map(res => this.handleCreateSchoolResponse(res)),
        catchError((err: HttpErrorResponse) =>
          this.handleCreateSchoolError(err)
        )
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreateSchoolResponse(res: any): School | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.toastHandlingService.info(
        'Thành công',
        'Thông tin trường học đã được ghi nhận. Hệ thống đang tạo đường dẫn thanh toán, vui lòng chờ trong giây lát...'
      );
      this.userService.updateCurrentUserPartial({ school: res.data });
      return res.data;
    }
    return null;
  }

  private handleCreateSchoolError(err: HttpErrorResponse): Observable<null> {
    if (err.error.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID) {
      this.toastHandlingService.error(
        'Lỗi',
        'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(null);
  }
}
