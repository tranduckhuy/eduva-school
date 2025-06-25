import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import {
  type RequestEnableDisable2FA,
  type ConfirmEnableDisable2FA,
} from '../../../shared/pages/settings-page/account-settings/models/toggle-2fa-request.model';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly REQUEST_ENABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/request-enable-2fa`;
  private readonly CONFIRM_ENABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/confirm-enable-2fa`;
  private readonly REQUEST_DISABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/request-disable-2fa`;
  private readonly CONFIRM_DISABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/confirm-disable-2fa`;

  requestEnableDisable2FA(
    request: RequestEnableDisable2FA,
    isEnable: boolean
  ): Observable<void> {
    const url = !isEnable
      ? this.REQUEST_ENABLE_TWO_FACTOR_API_URL
      : this.REQUEST_DISABLE_TWO_FACTOR_API_URL;

    return this.requestService
      .post(url, request, { loadingKey: 'password-modal' })
      .pipe(
        tap(res => this.handleRequest2FAResponse(res, isEnable)),
        map(() => void 0),
        catchError(err => this.handleRequest2FAError(err))
      );
  }

  confirmEnableDisable2FA(
    request: ConfirmEnableDisable2FA,
    isEnable: boolean
  ): Observable<void> {
    const url = !isEnable
      ? this.CONFIRM_ENABLE_TWO_FACTOR_API_URL
      : this.CONFIRM_DISABLE_TWO_FACTOR_API_URL;

    return this.requestService
      .post(url, request, { loadingKey: 'otp-modal' })
      .pipe(
        tap(res => this.handleConfirm2FAResponse(res, isEnable)),
        map(() => void 0),
        catchError(err => this.handleConfirm2FAError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleRequest2FAResponse(res: any, isEnable: boolean): void {
    const action = isEnable ? 'kích hoạt' : 'hủy';
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Yêu cầu thành công',
        `Vui lòng kiểm tra email của bạn để xác nhận việc ${action} xác thực hai bước.`
      );
    } else {
      this.toastHandlingService.error(
        'Đã xảy ra lỗi',
        `Không thể gửi yêu cầu ${action} xác thực hai bước. Vui lòng thử lại.`
      );
    }
  }

  private handleRequest2FAError(err: HttpErrorResponse): Observable<void> {
    if (err.error?.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID) {
      this.toastHandlingService.error(
        'Lỗi xác thực',
        'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra và thử lại.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }

  private handleConfirm2FAResponse(res: any, isEnable: boolean): void {
    const action = isEnable ? 'kích hoạt' : 'hủy';
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Xác nhận thành công',
        `Xác thực hai bước đã được ${action} thành công cho tài khoản của bạn.`
      );
    } else {
      this.toastHandlingService.error(
        'Thất bại',
        `Không thể ${action} xác thực hai bước. Vui lòng thử lại.`
      );
    }
  }

  private handleConfirm2FAError(err: HttpErrorResponse): Observable<void> {
    if (err.error?.statusCode === StatusCode.OTP_INVALID_OR_EXPIRED) {
      this.toastHandlingService.error(
        'Lỗi xác thực',
        'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }
}
