import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { UserService } from '../user/user.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import {
  type School,
  type SchoolDetail,
} from '../../../models/entities/school.model';
import { type CreateSchoolRequest } from '../../../models/api/request/command/create-school-request.model';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private readonly userService = inject(UserService);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_SCHOOL_API_URL = `${this.BASE_API_URL}/schools`;
  private readonly GET_CURRENT_SCHOOL_API_URL = `${this.BASE_API_URL}/schools/current`;

  private readonly schoolDetailSignal = signal<SchoolDetail | null>(null);
  schoolDetail = this.schoolDetailSignal.asReadonly();

  createSchool(request: CreateSchoolRequest): Observable<School | null> {
    return this.requestService
      .post<School>(this.BASE_SCHOOL_API_URL, request)
      .pipe(
        map(res => this.handleCreateSchoolResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  updateSchool(
    schoolId: number,
    request?: CreateSchoolRequest
  ): Observable<null> {
    return this.requestService
      .put(`${this.BASE_SCHOOL_API_URL}/${schoolId}`, request, {
        loadingKey: 'update-school-information',
      })
      .pipe(
        tap(res => this.handleSuccess(res)),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getCurrentSchoolInformation(): Observable<SchoolDetail | null> {
    return this.requestService
      .get<SchoolDetail>(this.GET_CURRENT_SCHOOL_API_URL, undefined, {
        loadingKey: 'get-current-school',
      })
      .pipe(
        tap(res => this.handleCurrentSchoolResponse(res)),
        map(res => this.extractSchoolDetail(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
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

  private handleCurrentSchoolResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.schoolDetailSignal.set(res.data as SchoolDetail);
    }
  }

  private extractSchoolDetail(res: any): SchoolDetail | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data as SchoolDetail;
    }
    return null;
  }

  private handleSuccess(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    if (err.error.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID) {
      this.toastHandlingService.warn(
        'Cảnh báo',
        'Địa chỉ email liên hệ đã tồn tại. Vui lòng kiểm tra lại.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }

    return throwError(() => err);
  }
}
