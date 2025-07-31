import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';

import { type ExportUsersRequest } from '../../../models/api/request/query/export-users-request.model';

@Injectable({
  providedIn: 'root',
})
export class ExportFileService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly EXPORT_USERS_API_URL = `${this.BASE_API_URL}/users/export`;

  exportUsers(request: ExportUsersRequest): Observable<HttpResponse<Blob>> {
    return this.requestService
      .getFile(this.EXPORT_USERS_API_URL, request, {
        loadingKey: 'export-users',
      })
      .pipe(
        tap(res => {
          this.handleDownloadResponse(res);
        }),
        catchError((err: HttpErrorResponse) => this.handleDownloadError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleDownloadResponse(res: HttpResponse<Blob>): void {
    if (res.body && res.body?.size > 0) {
      this.toastHandlingService.successGeneral();
      const fileName = getFileName(res);
      triggerBlobDownload(fileName, res.body);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleDownloadError(err: HttpErrorResponse): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
