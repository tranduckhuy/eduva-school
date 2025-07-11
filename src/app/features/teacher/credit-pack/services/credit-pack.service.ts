import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, map, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type CreditPack } from '../../../../shared/models/entities/credit-pack.model';
import { type GetCreditPacksRequest } from '../models/request/query/get-credit-packs-request.model';
import { type GetCreditPacksResponse } from '../models/response/query/get-credit-packs-response.model';

@Injectable({
  providedIn: 'root',
})
export class CreditPackService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_CREDIT_PACKS_API_URL = `${this.BASE_API_URL}/credit-packs`;

  private readonly creditPacksSignal = signal<CreditPack[]>([]);
  creditPacks = this.creditPacksSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  getCreditPacks(
    request: GetCreditPacksRequest
  ): Observable<CreditPack[] | null> {
    return this.requestService
      .get<GetCreditPacksResponse>(this.GET_CREDIT_PACKS_API_URL, request, {
        loadingKey: 'load-credit-packs',
      })
      .pipe(
        tap(res => this.handleGetCreditPacksResponse(res)),
        map(res => this.extractCreditPacksResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleGetCreditPacksResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.creditPacksSignal.set(res.data.data);
      this.totalRecordsSignal.set(res.data.count);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractCreditPacksResponse(res: any): CreditPack[] | null {
    if (res.statusCode === StatusCode.SUCCESS) {
      return res.data.data as CreditPack[];
    }
    return null;
  }

  private handleError(err: HttpErrorResponse) {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
