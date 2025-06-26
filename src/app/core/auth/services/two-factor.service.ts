import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { AuthService } from './auth.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import {
  type RequestEnableDisable2FA,
  type ConfirmEnableDisable2FA,
} from '../../../shared/pages/settings-page/account-settings/models/toggle-2fa-request.model';
import { type VerifyOtpRequest } from '../models/request/verify-otp-request.model';
import { type AuthTokenResponse } from '../models/response/auth-response.model';
import { type ResendOtpRequest } from '../models/request/resend-otp-request.model';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly REQUEST_ENABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/request-enable-2fa`;
  private readonly CONFIRM_ENABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/confirm-enable-2fa`;
  private readonly REQUEST_DISABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/request-disable-2fa`;
  private readonly CONFIRM_DISABLE_TWO_FACTOR_API_URL = `${this.BASE_API_URL}/auth/security/confirm-disable-2fa`;
  private readonly VERIFY_OTP_LOGIN_API_URL = `${this.BASE_API_URL}/auth/verify-otp-login`;
  private readonly RESEND_OTP_LOGIN_API_URL = `${this.BASE_API_URL}/auth/resend-otp`;

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

  verifyTwoFactor(
    request: VerifyOtpRequest
  ): Observable<AuthTokenResponse | null> {
    return this.requestService
      .post<AuthTokenResponse>(this.VERIFY_OTP_LOGIN_API_URL, request)
      .pipe(
        tap(res => this.handleVerify2FAResponse(res, res.data)),
        map(res => this.extractAuthDataFromResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleVerify2FAError(err))
      );
  }

  resendOtp(request: ResendOtpRequest): Observable<void> {
    return this.requestService
      .post(this.RESEND_OTP_LOGIN_API_URL, request)
      .pipe(
        tap(res => this.handleResendOtpResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleResendOtpError(err))
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
        `Vui lòng kiểm tra hộp thư của bạn để xác nhận việc ${action} xác thực hai bước.`
      );
    } else {
      this.toastHandlingService.error(
        'Đã xảy ra lỗi',
        `Không thể gửi yêu cầu ${action} xác thực hai bước. Vui lòng thử lại sau.`
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
      this.userService.updateCurrentUserPartial({ is2FAEnabled: !isEnable });
    } else {
      this.toastHandlingService.error(
        'Thất bại',
        `Không thể ${action} xác thực hai bước. Vui lòng thử lại sau.`
      );
    }
  }

  private handleConfirm2FAError(err: HttpErrorResponse): Observable<void> {
    this.handleOtpInvalidError(err);
    return of(void 0);
  }

  private handleVerify2FAResponse(res: any, data?: AuthTokenResponse): void {
    if (res.statusCode === StatusCode.SUCCESS && data) {
      this.authService.handleLoginSuccess(data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleVerify2FAError(err: HttpErrorResponse): Observable<null> {
    this.handleOtpInvalidError(err);
    return of(null);
  }

  private extractAuthDataFromResponse(res: any): AuthTokenResponse | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleResendOtpResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Yêu cầu đã được xử lý',
        'Một mã xác minh gồm 6 chữ số đã được gửi tới địa chỉ email của bạn. Vui lòng kiểm tra hộp thư để tiếp tục.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleResendOtpError(err: HttpErrorResponse): Observable<void> {
    this.handleOtpInvalidError(err);
    return of(void 0);
  }

  private handleOtpInvalidError(err: HttpErrorResponse): void {
    switch (err.error?.statusCode) {
      case StatusCode.OTP_INVALID_OR_EXPIRED:
        this.toastHandlingService.error(
          'Lỗi xác thực',
          'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.'
        );
        break;
      case StatusCode.USER_NOT_EXISTS:
        this.toastHandlingService.error(
          'Email không tồn tại',
          'Không tìm thấy tài khoản nào tương ứng với địa chỉ email của bạn.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
  }
}
