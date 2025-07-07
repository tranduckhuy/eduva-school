import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { EMPTY, Observable, catchError, map, of, tap } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

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
  private readonly confirmationService = inject(ConfirmationService);

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
          return of(null);
        })
      );
  }

  confirmPaymentReturn(request: ConfirmPaymentReturnRequest): Observable<void> {
    return this.requestService
      .get(this.CONFIRM_PAYMENT_RETURN_API_URL, request, {
        bypassPaymentError: true,
      })
      .pipe(
        tap(res => this.handleConfirmPaymentReturnResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) =>
          this.handleConfirmPaymentReturnError(err)
        )
      );
  }

  protected redirectToUrl(url: string) {
    window.location.href = url;
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreatePaymentLinkResponse(res: any): void {
    if (res.statusCode !== StatusCode.SUCCESS || !res.data) {
      this.toastHandlingService.error(
        'Sự cố hệ thống',
        'Đã xảy ra lỗi trong quá trình tạo đường dẫn thanh toán. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
      );
      return;
    }

    const data = res.data as CreatePlanPaymentLinkResponse;

    const proceedToCheckout = () => {
      this.redirectToUrl(data.checkoutUrl);
    };

    if (data.deductedAmount > 0) {
      const formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
      }).format(data.deductedAmount);

      this.confirmationService.confirm({
        header: 'Thông báo khuyến mãi',
        message: `
        Bạn sẽ được giảm <strong>${formattedAmount}</strong> do gói hiện tại vẫn còn thời hạn sử dụng.
        <br />
        Hệ thống sẽ trừ số tiền chưa sử dụng của gói hiện tại vào giá trị đơn hàng.
      `,
        acceptButtonProps: { label: 'Tiếp tục thanh toán' },
        rejectVisible: true,
        rejectButtonProps: {
          label: 'Hủy',
          severity: 'secondary',
          outlined: true,
        },
        closable: false,
        accept: proceedToCheckout,
      });
    } else {
      proceedToCheckout();
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
    switch (err.error?.statusCode) {
      case StatusCode.PAYMENT_FAILED:
        this.toastHandlingService.info(
          'Thanh toán bị hủy',
          'Bạn đã hủy giao dịch. Không có khoản phí nào bị trừ.'
        );
        break;

      case StatusCode.PAYMENT_ALREADY_CONFIRMED:
        this.toastHandlingService.info(
          'Giao dịch đã hoàn tất',
          'Giao dịch của bạn đã hoàn tất trước đó. EDUVA xin chân trọng cảm ơn bạn đã tin tưởng.'
        );
        break;

      default:
        this.toastHandlingService.errorGeneral();
        break;
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
