import { Injectable, inject, signal } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, map, catchError, throwError, tap } from 'rxjs';

import { environment } from '../../../../../../../environments/environment';

import { RequestService } from '../../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../../../shared/constants/status-code.constant';
import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { BYPASS_AUTH } from '../../../../../../shared/tokens/context/http-context.token';

import { type AiJob } from '../../../../../../shared/models/entities/ai-job.model';
import { type CreateAiJobsRequest } from '../../models/request/command/create-ai-jobs-request.model';
import { type CreateAiJobsResponse } from '../../models/response/command/create-ai-jobs-response.model';
import { type ConfirmCreateContent } from '../../models/request/command/confirm-create-content-request.model';

@Injectable({
  providedIn: 'root',
})
export class AiJobsService {
  private readonly httpClient = inject(HttpClient);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_AI_JOBS_API_URL = `${this.BASE_API_URL}/ai-jobs`;

  private readonly jobSignal = signal<AiJob | null>(null);
  job = this.jobSignal.asReadonly();

  private readonly jobIdSignal = signal<string>('');
  jobId = this.jobIdSignal.asReadonly();

  private readonly generationTypeSignal = signal<LessonGenerationType>(
    LessonGenerationType.Audio
  );
  generationType = this.generationTypeSignal.asReadonly();

  createAiJobs(
    request: CreateAiJobsRequest
  ): Observable<CreateAiJobsResponse | null> {
    return this.requestService
      .postWithFormData<CreateAiJobsResponse>(
        this.BASE_AI_JOBS_API_URL,
        request
      )
      .pipe(
        tap(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            this.jobIdSignal.set(res.data.jobId);
          }
        }),
        map(res => this.extractData<CreateAiJobsResponse>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  confirmCreateContent(
    jobId: string,
    request: ConfirmCreateContent
  ): Observable<null> {
    return this.requestService
      .post(`${this.BASE_AI_JOBS_API_URL}/${jobId}/confirm`, request, {
        bypassPaymentError: true,
      })
      .pipe(
        tap(res => {
          if (res.statusCode === StatusCode.SUCCESS) {
            this.generationTypeSignal.set(request.type);
          }
        }),
        map(() => null),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getJobById(jobId: string): Observable<AiJob | null> {
    return this.requestService
      .get<AiJob>(`${this.BASE_AI_JOBS_API_URL}/${jobId}`, undefined, {
        loadingKey: 'get-job-detail',
      })
      .pipe(
        tap(res => {
          if (res.statusCode === StatusCode.SUCCESS) {
            this.jobSignal.set(res.data as AiJob);
          }
        }),
        map(res => this.extractData<AiJob>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getFileSizeByBlobNameUrl(blobNameUrl: string): Observable<number> {
    return this.httpClient
      .head(blobNameUrl, {
        observe: 'response',
        context: new HttpContext().set(BYPASS_AUTH, true),
      })
      .pipe(
        map(response => {
          const contentLength = response.headers.get('Content-Length');
          return contentLength ? +contentLength : 1;
        }),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  clearJob() {
    this.jobSignal.set(null);
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private extractData<T>(res: any): T | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data as T;
    }
    return null;
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    if (err.error.statusCode === StatusCode.INSUFFICIENT_USER_CREDIT) {
      this.toastHandlingService.warn(
        'Thiếu Ecoin',
        'Bạn hiện không đủ Ecoin để thực hiện yêu cầu này. Vui lòng nạp thêm Ecoin để tiếp tục sử dụng dịch vụ.'
      );
    }
    return throwError(() => err);
  }
}
