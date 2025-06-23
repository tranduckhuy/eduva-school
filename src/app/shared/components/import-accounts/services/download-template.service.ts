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

@Injectable({
  providedIn: 'root',
})
export class DownloadTemplateService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_DOWNLOAD_TEMPLATE_API_URL = `${this.BASE_API_URL}/users/import-template`;

  downloadTemplate(): Observable<HttpResponse<Blob>> {
    return this.requestService
      .getFile(this.GET_DOWNLOAD_TEMPLATE_API_URL, undefined, {
        loadingKey: 'download-template',
      })
      .pipe(
        tap(res => {
          console.log(res);
          console.log(res.headers.get('Content-Disposition'));
          if (res.body) {
            this.toastHandlingService.successGeneral();
            const fileName = getFileName(res);
            triggerBlobDownload(fileName, res.body);
          } else {
            this.toastHandlingService.errorGeneral();
          }
        }),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return EMPTY;
        })
      );
  }
}
