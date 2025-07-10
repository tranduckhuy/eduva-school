import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, tap, map, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type CreditTransaction } from '../models/response/query/get-credit-transaction-response.model';
import { type GetCreditPacksRequest } from '../models/request/query/get-credit-packs-request.model';
import { type GetCreditPacksResponse } from '../models/response/query/get-credit-packs-response.model';

@Injectable({
  providedIn: 'root',
})
export class CreditPackTransactionService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_PACK_TRANSACTIONS_API_URL = `${this.BASE_API_URL}/credit-transactions`;

  private readonly creditTransactionsSignal = signal<CreditTransaction[]>([]);
  creditTransactions = this.creditTransactionsSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  getCreditTransactions(
    request: GetCreditPacksRequest
  ): Observable<CreditTransaction[] | null> {
    return this.requestService
      .get<GetCreditPacksResponse>(
        this.GET_PACK_TRANSACTIONS_API_URL,
        request,
        {
          loadingKey: 'load-transactions',
        }
      )
      .pipe(
        tap(res => this.handleGetCreditTransactionResponse(res)),
        map(res => this.extractCreditTransactionsResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleGetCreditTransactionResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.creditTransactionsSignal.set(res.data.data);
      this.totalRecordsSignal.set(res.data.count);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractCreditTransactionsResponse(
    res: any
  ): CreditTransaction[] | null {
    if (res.statusCode === StatusCode.SUCCESS) {
      return res.data.data;
    }
    return null;
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    return throwError(() => err);
  }
}
