import { inject, Injectable } from '@angular/core';

import { Observable, map } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { FileResponse } from '../../../models/api/response/file-response.model';

import { triggerDownload } from '../../../utils/util-functions';

@Injectable({
  providedIn: 'root',
})
export class DownloadTemplateService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_DOWNLOAD_TEMPLATE_API_URL = `${this.BASE_API_URL}/users/import-template`;

  downloadTemplate(): Observable<boolean> {
    return this.requestService
      .get<FileResponse>(this.GET_DOWNLOAD_TEMPLATE_API_URL, undefined, {
        loadingKey: 'download-template',
      })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            this.toastHandlingService.successGeneral();
            triggerDownload(res.data.fileName, res.data.content);
            return true;
          } else {
            this.toastHandlingService.errorGeneral();
            return false;
          }
        })
      );
  }
}
