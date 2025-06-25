import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { RequestService } from '../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../shared/constants/status-code.constant';

import { type ConfirmEmailRequest } from '../models/request/confirm-email-request.model';
import { type EmailLinkRequest } from '../models/request/email-link-request.model';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly CONFIRM_EMAIL_API_URL = `${this.BASE_API_URL}/auth/confirm-email`;
  private readonly RESEND_CONFIRM_EMAIL_API_URL = `${this.BASE_API_URL}/auth/resend-confirm-email`;

  private readonly CLIENT_URL = `${environment.clientUrl}/login`;

  confirmEmail(request: ConfirmEmailRequest): Observable<void> {
    return this.requestService.get(this.CONFIRM_EMAIL_API_URL, request).pipe(
      tap(res => this.handleConfirmEmailResponse(res)),
      map(() => void 0),
      catchError(err => this.handleConfirmEmailError(err, request.email))
    );
  }

  resendConfirmEmail(
    request: EmailLinkRequest,
    toastMessage?: { title: string; description: string },
    toastType: 'success' | 'warn' = 'success'
  ): Observable<void> {
    const payload = {
      ...request,
      clientUrl: this.CLIENT_URL,
    };

    return this.requestService
      .post(this.RESEND_CONFIRM_EMAIL_API_URL, payload)
      .pipe(
        tap(res =>
          this.handleResendEmailResponse(res, toastMessage, toastType)
        ),
        map(() => void 0),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(void 0);
        })
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleConfirmEmailResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Kích hoạt thành công',
        'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập để tiếp tục.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleConfirmEmailError(
    err: HttpErrorResponse,
    email: string
  ): Observable<void> {
    if (
      err.error?.statusCode ===
      StatusCode.CONFIRM_EMAIL_TOKEN_INVALID_OR_EXPIRED
    ) {
      const resendRequest: EmailLinkRequest = {
        email,
        clientUrl: this.CLIENT_URL,
      };

      const toastMessage = {
        title: 'Liên kết hết hạn',
        description:
          'Liên kết xác thực đã hết hạn. Một email xác thực mới đã được gửi lại cho bạn.',
      };

      return this.resendConfirmEmail(resendRequest, toastMessage, 'warn');
    }

    this.toastHandlingService.errorGeneral();
    return of(void 0);
  }

  private handleResendEmailResponse(
    res: any,
    toastMessage?: { title: string; description: string },
    toastType: 'success' | 'warn' = 'success'
  ): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      const { title, description } = toastMessage ?? {
        title: 'Email đã được gửi lại',
        description:
          'Một liên kết xác thực mới đã được gửi tới địa chỉ email của bạn.',
      };

      if (toastType === 'warn') {
        this.toastHandlingService.warn(title, description);
      } else {
        this.toastHandlingService.success(title, description);
      }
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }
}
