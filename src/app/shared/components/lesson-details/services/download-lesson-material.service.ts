import { inject, Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, tap, catchError, throwError } from 'rxjs';

import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';

@Injectable({
  providedIn: 'root',
})
export class DownloadLessonMaterialService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  downloadLessonMaterial(url: string): Observable<HttpResponse<Blob>> {
    return this.requestService
      .getFile(url, undefined, {
        bypassAuth: true,
        loadingKey: 'download-lesson-material',
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
