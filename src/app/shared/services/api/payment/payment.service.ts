import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { EMPTY, Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { JwtService } from '../../../../core/auth/services/jwt.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type CreatePlanPaymentLinkRequest } from '../../../models/api/request/command/create-plan-payment-link-request.model';
import { type CreatePlanPaymentLinkResponse } from '../../../models/api/response/command/create-plan-payment-link-response.model';
import { type ConfirmPaymentReturnRequest } from '../../../models/api/request/query/confirm-payment-return-request.model';
import { type RefreshTokenRequest } from '../../../../core/auth/models/request/refresh-token-request.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly jwtService = inject(JwtService);
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly CREATE_PLAN_PAYMENT_LINK_API_URL = `${this.BASE_API_URL}/school-subscriptions/payment-link`;
  private readonly CONFIRM_PAYMENT_RETURN_API_URL = `${this.BASE_API_URL}/payments/payos-return`;

  createPlanPaymentLink(
    request: CreatePlanPaymentLinkRequest
  ): Observable<CreatePlanPaymentLinkResponse | null> {
    return this.requestService
      .post<CreatePlanPaymentLinkResponse>(
        this.CREATE_PLAN_PAYMENT_LINK_API_URL,
        request
      )
      .pipe(
        tap(res => this.handleCreatePaymentLinkResponse(res)),
        map(res => this.extractDataFromResponse(res)),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return EMPTY;
        })
      );
  }

  confirmPaymentReturn(request: ConfirmPaymentReturnRequest): Observable<void> {
    return this.requestService
      .get(this.CONFIRM_PAYMENT_RETURN_API_URL, request)
      .pipe(
        tap(res => this.handleConfirmPaymentReturnResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) =>
          this.handleConfirmPaymentReturnError(err)
        )
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreatePaymentLinkResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const data = res.data as CreatePlanPaymentLinkResponse;
      window.location.href = data.checkoutUrl;
    } else {
      this.toastHandlingService.error(
        'Sự cố hệ thống',
        'Đã xảy ra lỗi trong quá trình tạo đường dẫn thanh toán. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
      );
    }
  }

  private handleConfirmPaymentReturnResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.success(
        'Thanh toán thành công',
        'Cảm ơn bạn đã tin tưởng sử dụng hệ thống EDUVA. Chúc bạn có trải nghiệm dạy và học thật hiệu quả!'
      );
      this.refreshTokenAfterConfirm();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleConfirmPaymentReturnError(
    err: HttpErrorResponse
  ): Observable<void> {
    if (err.error.statusCode === StatusCode.PAYMENT_FAILED) {
      this.toastHandlingService.info(
        'Thanh toán bị hủy',
        'Bạn đã hủy giao dịch. Không có khoản phí nào bị trừ.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return of(void 0);
  }

  private extractDataFromResponse(
    res: any
  ): CreatePlanPaymentLinkResponse | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private refreshTokenAfterConfirm() {
    const accessToken = this.jwtService.getAccessToken();
    const refreshToken = this.jwtService.getRefreshToken();
    if (accessToken && refreshToken) {
      const request: RefreshTokenRequest = {
        accessToken,
        refreshToken,
      };
      this.authService.refreshToken(request).subscribe();
    }
  }
}
