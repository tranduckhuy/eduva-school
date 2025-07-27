import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, tap, map, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type AiUsageLog } from '../../../../shared/models/entities/ai-usage-log.model';
import { type GetAiUsageLogsRequest } from '../models/get-ai-usage-logs-request.model';
import { type GetAiUsageLogsResponse } from '../models/get-ai-usage-logs.response.model';

@Injectable({
  providedIn: 'root',
})
export class AiUsageLogsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_AI_USAGE_LOGS_API_URL = `${this.BASE_API_URL}/ai-usage-logs`;

  private readonly aiUsageLogsSignal = signal<AiUsageLog[]>([]);
  aiUsageLogs = this.aiUsageLogsSignal.asReadonly();

  private readonly totalRecordsSignal = signal<number>(0);
  totalRecords = this.totalRecordsSignal.asReadonly();

  getAiUsageLogs(
    request: GetAiUsageLogsRequest
  ): Observable<AiUsageLog[] | null> {
    return this.requestService
      .get<GetAiUsageLogsResponse>(this.GET_AI_USAGE_LOGS_API_URL, request)
      .pipe(
        tap(res => this.handleAiUsageLogsResponse(res)),
        map(res => this.extractListUsageLogs(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleAiUsageLogsResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data.data) {
      this.aiUsageLogsSignal.set(res.data.data);
      this.totalRecordsSignal.set(res.data.count);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractListUsageLogs(res: any): AiUsageLog[] | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data.data) {
      return res.data.data as AiUsageLog[];
    }
    return null;
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
