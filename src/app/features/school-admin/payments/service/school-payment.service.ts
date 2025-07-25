import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError, map, Observable, throwError } from 'rxjs';

import { Payment } from '../../../../shared/models/entities/payment.model';
import { PaymentListParams } from '../model/payment-list-params';
import { SchoolSubscriptionDetail } from '../model/school-subscription-detail.model';
import { CreditTransactionDetail } from '../model/credit-transaction-detail';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { environment } from '../../../../../environments/environment';
import { EntityListResponse } from '../../../../shared/models/api/response/query/entity-list-response.model';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { BaseResponse } from '../../../../shared/models/api/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class SchoolPaymentService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastHandlingService);

  // API URLs
  private readonly PAYMENT_URL = `${environment.baseApiUrl}/payments/my`;
  private readonly SCHOOL_SUBSCRIPTION_URL = `${environment.baseApiUrl}/school-subscriptions`;
  private readonly CREDIT_TRANSACTION_URL = `${environment.baseApiUrl}/credit-transactions`;

  // Signals
  private readonly paymentsSignal = signal<Payment[]>([]);
  private readonly totalPaymentsSignal = signal<number>(0);
  private readonly schoolSubscriptionDetailSignal =
    signal<SchoolSubscriptionDetail | null>(null);
  private readonly creditTransactionDetailSignal =
    signal<CreditTransactionDetail | null>(null);

  // Readonly signals
  readonly payments = this.paymentsSignal.asReadonly();
  readonly totalPayments = this.totalPaymentsSignal.asReadonly();
  readonly schoolSubscriptionDetail =
    this.schoolSubscriptionDetailSignal.asReadonly();
  readonly creditTransactionDetail =
    this.creditTransactionDetailSignal.asReadonly();

  /**
   * Fetches a list of payments
   * @param params List parameters
   * @returns Observable with EntityListResponse or null
   */
  getPayments(
    params: PaymentListParams
  ): Observable<EntityListResponse<Payment> | null> {
    return this.handleRequest<EntityListResponse<Payment>>(
      this.requestService.get<EntityListResponse<Payment>>(
        this.PAYMENT_URL,
        params,
        {
          loadingKey: 'get-payments',
        }
      ),
      {
        successHandler: data => {
          this.paymentsSignal.set(data.data);
          this.totalPaymentsSignal.set(data.count);
        },
        errorHandler: () => this.resetPayments(),
      }
    );
  }

  /**
   * Fetches school subscription details by ID
   * @param id School ID
   * @returns Observable with subscription details data or null
   */
  getSchoolSubscriptionDetailById(
    id: string
  ): Observable<SchoolSubscriptionDetail | null> {
    return this.handleRequest<SchoolSubscriptionDetail>(
      this.requestService.get<SchoolSubscriptionDetail>(
        `${this.SCHOOL_SUBSCRIPTION_URL}/${id}`
      ),
      {
        successHandler: data => this.schoolSubscriptionDetailSignal.set(data),
        errorHandler: () => this.resetPayment(),
      }
    );
  }

  /**
   * Fetches credit transaction details by ID
   * @param id School ID
   * @returns Observable with credit transaction details data or null
   */
  getCreditTransactionDetailById(
    id: string
  ): Observable<CreditTransactionDetail | null> {
    return this.handleRequest<CreditTransactionDetail>(
      this.requestService.get<CreditTransactionDetail>(
        `${this.CREDIT_TRANSACTION_URL}/${id}`
      ),
      {
        successHandler: data => this.creditTransactionDetailSignal.set(data),
        errorHandler: () => this.resetPayment(),
      }
    );
  }

  // Private helper methods

  private handleRequest<T>(
    request$: Observable<BaseResponse<T>>,
    options: {
      successHandler?: (data: T) => void;
      errorHandler?: () => void;
    } = {}
  ): Observable<T | null> {
    return request$.pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS && res.data !== undefined) {
          options.successHandler?.(res.data);
          return res.data;
        }
        options.errorHandler?.();
        this.toastService.errorGeneral();
        return null;
      }),
      catchError((err: HttpErrorResponse) => {
        this.toastService.errorGeneral();
        return throwError(() => err);
      })
    );
  }

  private resetPayments(): void {
    this.paymentsSignal.set([]);
    this.totalPaymentsSignal.set(0);
  }

  private resetPayment(): void {
    this.schoolSubscriptionDetailSignal.set(null);
  }
}
