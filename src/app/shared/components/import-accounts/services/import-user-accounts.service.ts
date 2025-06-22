import { Injectable, inject, signal } from '@angular/core';

import { catchError, finalize, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../services/core/request/request.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import {
  triggerDownload,
  triggerBlobDownload,
} from '../../../utils/util-functions';

import { FileResponse } from '../../../models/api/response/file-response.model';

@Injectable({
  providedIn: 'root',
})
export class ImportUserAccountsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly IMPORT_USER_ACCOUNTS_API_URL = `${this.BASE_API_URL}/users/import`;

  private readonly isLoadingSignal = signal<boolean>(false);
  isLoading = this.isLoadingSignal.asReadonly();

  importUserAccountsJson(formData: FormData): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.requestService
      .postFormData<FileResponse>(this.IMPORT_USER_ACCOUNTS_API_URL, formData)
      .pipe(
        tap(res => {
          if (
            res.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID &&
            res.data
          ) {
            triggerDownload(res.data.fileName, res.data.content);
            this.toastHandlingService.error(
              'Dữ liệu không hợp lệ',
              'Hệ thống đã phát hiện lỗi trong dữ liệu. Vui lòng kiểm tra các chú thích được thêm vào file lỗi và sửa lại dữ liệu.'
            );
          } else {
            this.toastHandlingService.success(
              'Thành công',
              'Import tài khoản thành công'
            );
          }
        }),
        map(() => void 0),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(void 0);
        }),
        finalize(() => {
          this.isLoadingSignal.set(false);
        })
      );
  }

  importUserAccountsBlob(formData: FormData): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.requestService
      .postFile(this.IMPORT_USER_ACCOUNTS_API_URL, formData)
      .pipe(
        tap(blob => {
          if (blob.size === 0) {
            this.toastHandlingService.success(
              'Thành công',
              'Tất cả tài khoản đã được nhập vào hệ thống thành công.'
            );
          } else {
            const date = new Date().toISOString().slice(0, 10);
            const fileName = `Import_Errors_${date}.xlsx`;

            triggerBlobDownload(fileName, blob);
            this.toastHandlingService.error(
              'Import thất bại',
              'Hệ thống đã phát hiện lỗi trong dữ liệu. Vui lòng kiểm tra file lỗi được tải về và sửa lại cho đúng.'
            );
          }
        }),
        map(() => void 0),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(void 0);
        }),
        finalize(() => {
          this.isLoadingSignal.set(false);
        })
      );
  }
}
