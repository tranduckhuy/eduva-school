import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, catchError, tap, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

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
import { StatusCode } from '../../../constants/status-code.constant';

import { type UserListParams } from '../../../models/api/request/query/user-list-params';

@Injectable({
  providedIn: 'root',
})
export class ImportUserAccountsService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly userService = inject(UserService);

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
        catchError((err: HttpErrorResponse) => this.handleImportError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleImportResponse(res: HttpResponse<Blob>, role: Role): void {
    if (res.body && res.body?.size > 0) {
      // ? Import file which have errors will be returned
      this.confirmationService.confirm({
        header: 'Không thể nhập dữ liệu',
        message: `
          <p>Một số dòng trong tệp đang vi phạm điều kiện hợp lệ.</p>
          <p><strong>Ví dụ:</strong> email đã tồn tại, sai định dạng, mật khẩu yếu...</p>
          <p>Bạn có muốn tải tệp lỗi về để xem chi tiết và chỉnh sửa?</p>
        `,
        acceptButtonProps: {
          label: 'Tải xuống',
          icon: 'pi pi-download',
          size: 'small',
        },
        rejectButtonProps: {
          label: 'Đóng',
          severity: 'secondary',
          size: 'small',
        },
        closable: false,
        closeOnEscape: true,
        accept: () => {
          if (res.body) {
            const fileName = getFileName(res);
            triggerBlobDownload(fileName, res.body);
          }
        },
      });
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

  private handleImportError(err: HttpErrorResponse): Observable<never> {
    if (err.error.statusCode === StatusCode.EXCEED_USER_LIMIT) {
      this.toastHandlingService.warn(
        'Vượt giới hạn tài khoản',
        'Đã đạt số lượng tài khoản tối đa theo gói. Vui lòng nâng cấp để tiếp tục.'
      );
    }
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
