import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
import { ToastHandlingService } from '../../shared/services/core/toast/toast-handling.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const confirmationService = inject(ConfirmationService);
  const toastHandlingService = inject(ToastHandlingService);

  const excludedUrls = ['/auth/login', '/auth/refresh-token'];
  const shouldSkip401Toast = excludedUrls.some(url => req.url.includes(url));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastHandlingService.error('Lỗi', 'Không thể kết nối đến máy chủ.'); // ? Cái này thì chắc báo toast thôi
      } else if (error.status >= 500) {
        toastHandlingService.errorGeneral(); // ? Sau sẽ redirect tới trang 500
      } else if (error.status === 401 && !shouldSkip401Toast) {
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
            router.navigateByUrl('/auth/login', {
              replaceUrl: true,
            });
          },
        });
      } else if (error.status === 403) {
        toastHandlingService.error(
          'Lỗi',
          'Bạn không có quyền truy cập chức năng này.'
        ); // ? Sau sẽ redirect tới trang 403
      }

      return throwError(() => error);
    })
  );
};
