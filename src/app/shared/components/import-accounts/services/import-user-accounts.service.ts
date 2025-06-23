import { Injectable, inject } from '@angular/core';
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
export class ImportUserAccountsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly IMPORT_USER_ACCOUNTS_API_URL = `${this.BASE_API_URL}/users/import`;

  importUserAccounts(formData: FormData): Observable<HttpResponse<Blob>> {
    return this.requestService
      .postFile(this.IMPORT_USER_ACCOUNTS_API_URL, formData, {
        loadingKey: 'upload',
      })
      .pipe(
        tap(res => {
          if (res.body) {
            this.toastHandlingService.error(
              'Dữ liệu không hợp lệ',
              'Hệ thống đã phát hiện lỗi trong dữ liệu. Vui lòng kiểm tra các chú thích được thêm vào file lỗi và sửa lại dữ liệu.'
            );
            const fileName = getFileName(res);
            triggerBlobDownload(fileName, res.body);
          } else {
            this.toastHandlingService.success(
              'Thành công',
              'Tất cả tài khoản đã được nhập vào hệ thống thành công.'
            );
          }
        }),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return EMPTY;
        })
      );
  }
}
