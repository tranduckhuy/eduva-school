import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import { type EmailLinkRequest } from '../models/request/email-link-request.model';
import { type ResetPasswordRequest } from '../pages/reset-password/models/reset-password-request.model';
import { type ChangePasswordRequest } from '../../../shared/models/api/request/command/change-password-request.model';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly FORGOT_PASSWORD_API_URL = `${this.BASE_API_URL}/auth/forgot-password`;
  private readonly RESET_PASSWORD_API_URL = `${this.BASE_API_URL}/auth/reset-password`;
  private readonly CHANGE_PASSWORD_API_URL = `${this.BASE_API_URL}/auth/change-password`;

  private readonly CLIENT_URL = `${environment.clientUrl}/reset-password`;

  forgotPassword(request: EmailLinkRequest): Observable<void> {
    const payload = { ...request, clientUrl: this.CLIENT_URL };
    return this.requestService.post(this.FORGOT_PASSWORD_API_URL, payload).pipe(
      tap(res => this.handleForgotPasswordResponse(res)),
      map(() => void 0),
      catchError(err => this.handleForgotPasswordError(err))
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.requestService.post(this.RESET_PASSWORD_API_URL, request).pipe(
      tap(res => this.handleResetPasswordResponse(res)),
      map(() => void 0),
      catchError(err => this.handleResetPasswordError(err))
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.requestService
      .post(this.CHANGE_PASSWORD_API_URL, request, {
        loadingKey: 'change-password-form',
      })
      .pipe(
        tap(res => this.handleChangePasswordResponse(res)),
        map(() => void 0),
        catchError(err => this.handleChangePasswordError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleForgotPasswordResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Thành công',
        'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến hoặc thư rác.'
      );
    } else {
      this.toastHandlingService.error(
        'Không thể gửi yêu cầu',
        'Có lỗi xảy ra khi gửi liên kết đặt lại mật khẩu. Vui lòng thử lại sau.'
      );
    }
  }

  private handleForgotPasswordError(err: HttpErrorResponse): Observable<void> {
    if (err.error?.statusCode === StatusCode.USER_NOT_EXISTS) {
      this.toastHandlingService.warn(
        'Email không tồn tại',
        'Vui lòng kiểm tra lại địa chỉ email.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }

  private handleResetPasswordResponse(res: any): void {
    this.handleChangePasswordResponse(res);
  }

  private handleResetPasswordError(err: HttpErrorResponse): Observable<void> {
    switch (err.error?.statusCode) {
      case StatusCode.INVALID_TOKEN:
        this.toastHandlingService.error(
          'Liên kết hết hạn',
          'Vui lòng gửi lại yêu cầu đặt lại mật khẩu mới.'
        );
        break;
      case StatusCode.NEW_PASSWORD_SAME_AS_OLD:
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }

  private handleChangePasswordResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Thành công',
        'Mật khẩu của bạn đã được đặt lại.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleChangePasswordError(err: HttpErrorResponse): Observable<void> {
    switch (err.error?.statusCode) {
      case StatusCode.PROVIDED_INFORMATION_IS_INVALID:
        this.toastHandlingService.error(
          'Lỗi xác thực',
          'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra và thử lại.'
        );
        break;
      case StatusCode.NEW_PASSWORD_SAME_AS_OLD:
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }
}
