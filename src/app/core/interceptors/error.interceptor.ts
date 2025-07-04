import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
import { UserService } from '../../shared/services/api/user/user.service';
import { GlobalModalService } from '../../shared/services/layout/global-modal/global-modal.service';

import { BYPASS_AUTH_ERROR } from '../../shared/tokens/context/http-context.token';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const userService = inject(UserService);
  const globalModalService = inject(GlobalModalService);
  const confirmationService = inject(ConfirmationService);

  const isByPass = req.context.get(BYPASS_AUTH_ERROR);

  const handleServerError = () => router.navigateByUrl('/errors/500');

  const handleUnauthorized = () => {
    globalModalService.close();
    confirmationService.confirm({
      message: 'Vui lòng đăng nhập lại.',
      header: 'Phiên đã hết hạn',
      closable: false,
      rejectVisible: false,
      acceptButtonProps: { label: 'Đồng ý' },
      accept: () => {
        jwtService.clearAll();
        userService.clearCurrentUser();
        router.navigateByUrl('/auth/login', {
          replaceUrl: true,
        });
      },
    });
  };

  const handleForbidden = () => router.navigateByUrl('/errors/403');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthError = error.status === 401;
      const isForbidden = error.status === 403;
      const isServerError = error.status === 0 || error.status >= 500;

      if (isServerError) {
        handleServerError();
      } else if (isAuthError && !isByPass) {
        handleUnauthorized();
      } else if (isForbidden && !isByPass) {
        handleForbidden();
      }

      return throwError(() => error);
    })
  );
};
