import { inject, Injectable } from '@angular/core';
import { RequestService } from '../../services/core/request/request.service';
import { ToastHandlingService } from '../../services/core/toast/toast-handling.service';
import { map, Observable } from 'rxjs';
import { StatusCode } from '../../constants/status-code.constant';
import { environment } from '../../../../environments/environment';
import { downloadTemplateResponse } from './models/download-template-response.model';
import { triggerDownload } from '../../utils/triggerDownload';

@Injectable({
  providedIn: 'root',
})
export class DownloadTemplateServiceService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_DOWNLOAD_TEMPLATE_API_URL = `${this.BASE_API_URL}/users/import-template`;

  downloadTemplate(): Observable<boolean> {
    return this.requestService
      .get<downloadTemplateResponse>(this.GET_DOWNLOAD_TEMPLATE_API_URL)
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
