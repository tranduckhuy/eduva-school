import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { EMPTY, Observable, catchError, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../services/core/request/request.service';
import { UserService } from '../../../services/api/user/user.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import {
  getFileName,
  triggerBlobDownload,
} from '../../../utils/util-functions';

import { Role } from '../../../models/enum/role.enum';
import { PAGE_SIZE } from '../../../constants/common.constant';

import { type UserListParams } from '../../../models/api/request/query/user-list-params';

@Injectable({
  providedIn: 'root',
})
export class ImportUserAccountsService {
  private readonly requestService = inject(RequestService);
  private readonly userService = inject(UserService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly IMPORT_USER_ACCOUNTS_API_URL = `${this.BASE_API_URL}/users/import`;

  importUserAccounts(
    formData: FormData,
    role: Role
  ): Observable<HttpResponse<Blob>> {
    return this.requestService
      .postFile(this.IMPORT_USER_ACCOUNTS_API_URL, formData, {
        loadingKey: 'upload',
      })
      .pipe(
        tap(res => this.handleImportResponse(res, role)),
        catchError(() => this.handleImportError())
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleImportResponse(res: HttpResponse<Blob>, role: Role): void {
    if (res.body && res.body?.size > 0) {
      // ? Import file which have errors will be returned
      this.toastHandlingService.error(
        'Dữ liệu không hợp lệ',
        'Hệ thống đã phát hiện lỗi trong dữ liệu. Vui lòng kiểm tra các chú thích được thêm vào file lỗi và sửa lại dữ liệu.'
      );
      const fileName = getFileName(res);
      triggerBlobDownload(fileName, res.body);
    } else {
      // ? Do not have response body -> Import data successfully
      this.toastHandlingService.success(
        'Thành công',
        'Tất cả tài khoản đã được nhập vào hệ thống thành công.'
      );

      const params: UserListParams = {
        role,
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        activeOnly: true,
      };
      this.userService.getUsers(params).subscribe();
    }
  }

  private handleImportError(): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return EMPTY;
  }
}
