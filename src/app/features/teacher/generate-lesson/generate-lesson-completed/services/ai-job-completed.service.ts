import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, tap, map, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../../environments/environment';

import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';

import { type AiJob } from '../../../../../shared/models/entities/ai-job.model';
import { type GetAiJobCompletedRequest } from '../models/get-job-completed-request.model';
import { type GetAiJobCompletedResponse } from '../models/get-job-completed-response.model';
import { StatusCode } from '../../../../../shared/constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class AiJobCompletedService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_AI_JOB_COMPLETED_API_URL = `${this.BASE_API_URL}/ai-jobs/completed`;

  private readonly jobListSignal = signal<AiJob[]>([]);
  jobList = this.jobListSignal.asReadonly();

  private readonly totalJobsSignal = signal<number>(0);
  totalJobs = this.totalJobsSignal.asReadonly();

  getAiJobCompleted(
    request: GetAiJobCompletedRequest
  ): Observable<AiJob[] | null> {
    return this.requestService
      .get<GetAiJobCompletedResponse>(
        this.GET_AI_JOB_COMPLETED_API_URL,
        request
      )
      .pipe(
        tap(res => this.handleListResponse(res)),
        map(res => this.extractListResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.jobListSignal.set(res.data.data as AiJob[]);
      this.totalJobsSignal.set(res.data.count);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractListResponse(res: any): AiJob[] | null {
    if (res.statusCode === StatusCode.SUCCESS) {
      return res.data.data as AiJob[];
    }
    return null;
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
