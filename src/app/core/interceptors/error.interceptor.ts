import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
import { UserService } from '../../shared/services/api/user/user.service';
import { ToastHandlingService } from '../../shared/services/core/toast/toast-handling.service';
import { GlobalModalService } from '../../shared/services/layout/global-modal/global-modal.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const userService = inject(UserService);
  const toastHandlingService = inject(ToastHandlingService);
  const globalModalService = inject(GlobalModalService);
  const confirmationService = inject(ConfirmationService);

  const excludedUrls = ['/auth/login', '/auth/refresh-token'];
  const shouldSkipToast = excludedUrls.some(url => req.url.includes(url));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastHandlingService.error(
          'Lỗi hệ thống',
          'Không thể kết nối đến máy chủ.'
        );
      } else if (error.status >= 500) {
        toastHandlingService.errorGeneral(); // ? Sau sẽ redirect tới trang 500
      } else if (error.status === 401 && !shouldSkipToast) {
        globalModalService.close();
        confirmationService.confirm({
          message: 'Vui lòng đăng nhập lại.',
          header: 'Phiên đã hết hạn',
          closable: false,
          rejectVisible: false,
          acceptButtonProps: {
            label: 'Đồng ý',
          },
          accept: () => {
            jwtService.clearAll();
            userService.clearCurrentUser();
            router.navigateByUrl('/auth/login', {
              replaceUrl: true,
            });
          },
        });
      } else if (error.status === 403 && !shouldSkipToast) {
        toastHandlingService.error(
          'Không có quyền truy cập',
          'Bạn không có quyền truy cập chức năng này.'
        ); // ? Sau sẽ redirect tới trang 403
      }

      return throwError(() => error);
    })
  );
};
