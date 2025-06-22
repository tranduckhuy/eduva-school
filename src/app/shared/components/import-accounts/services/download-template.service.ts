import { inject, Injectable, signal } from '@angular/core';

import { Observable, map, finalize } from 'rxjs';

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

  private readonly isLoadingSignal = signal<boolean>(false);
  isLoading = this.isLoadingSignal.asReadonly();

  downloadTemplate(): Observable<boolean> {
    this.isLoadingSignal.set(true);
    return this.requestService
      .get<FileResponse>(this.GET_DOWNLOAD_TEMPLATE_API_URL)
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
        }),
        finalize(() => {
          this.isLoadingSignal.set(false);
        })
      );
  }
  /**
   * if (responseBlob.size === 0) {
    // Thành công và không có lỗi file → import thành công
    this.toastHandlingService.success('Thành công', 'Tải lên thành công');
  } else {
    // Có lỗi → file lỗi được trả về
    triggerBlobDownload(responseBlob)
  } */
}
