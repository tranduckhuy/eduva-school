import { inject, Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { EMPTY, Observable, catchError, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';

import { type TemplateType } from '../../../models/enum/template-type.enum';

@Injectable({
  providedIn: 'root',
})
export class DownloadTemplateService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly DOWNLOAD_TEMPLATE_API_URL = `${this.BASE_API_URL}/users/import-template`;

  downloadTemplate(type: TemplateType): Observable<HttpResponse<Blob>> {
    return this.requestService
      .getFile(`${this.DOWNLOAD_TEMPLATE_API_URL}/${type}`, undefined, {
        loadingKey: 'download-template',
      })
      .pipe(
        tap(res => {
          this.handleDownloadResponse(res);
        }),
        catchError(() => this.handleDownloadError())
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

  private handleDownloadError(): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return EMPTY;
  }
}
