import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
import { UserService } from '../../shared/services/api/user/user.service';
import { GlobalModalService } from '../../shared/services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../shared/constants/status-code.constant';
import { UserRoles } from '../../shared/constants/user-roles.constant';
import { BYPASS_AUTH_ERROR } from '../../shared/tokens/context/http-context.token';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const userService = inject(UserService);
  const globalModalService = inject(GlobalModalService);
  const toastHandlingService = inject(ToastHandlingService);
  const confirmationService = inject(ConfirmationService);

  const user = userService.currentUser;
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

  const handleMissingSchoolOrSubscription = () => {
    const roles = user()?.roles ?? [];
    if (
      roles.includes(UserRoles.SCHOOL_ADMIN) ||
      roles.includes(UserRoles.SYSTEM_ADMIN)
    ) {
      toastHandlingService.info(
        'Yêu cầu mua gói',
        'Bạn cần mua gói kích hoạt trường học thì mới có thể sử dụng hệ thống.'
      );
      router.navigateByUrl('/school-admin/subscription-plans');
    } else {
      toastHandlingService.info(
        'Trường của bạn hiện chưa có gói',
        'Vui lòng liên hệ quản trị viên của trường bạn để biết thêm thông tin.'
      );
    }
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isForbidden = error.status === 403;
      const isServerError = error.status === 0 || error.status >= 500;

      const statusCode = error.error.statusCode;

      if (isServerError) {
        handleServerError();
        return throwError(() => error);
      }

      if (isUnauthorized && !isByPass) {
        handleUnauthorized();
        return throwError(() => error);
      }

      if (isForbidden && !isByPass) {
        if (statusCode === StatusCode.SCHOOL_AND_SUBSCRIPTION_REQUIRED) {
          handleMissingSchoolOrSubscription();
        } else {
          handleForbidden();
        }
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
