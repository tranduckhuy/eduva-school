import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
import { UserService } from '../../shared/services/api/user/user.service';
import { GlobalModalService } from '../../shared/services/layout/global-modal/global-modal.service';

import { StatusCode } from '../../shared/constants/status-code.constant';
import { UserRoles } from '../../shared/constants/user-roles.constant';
import {
  BYPASS_AUTH_ERROR,
  BYPASS_PAYMENT_ERROR,
} from '../../shared/tokens/context/http-context.token';

let hasShownUnauthorizedDialog = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const userService = inject(UserService);
  const globalModalService = inject(GlobalModalService);
  const confirmationService = inject(ConfirmationService);

  const user = userService.currentUser;
  const isByPassAuth = req.context.get(BYPASS_AUTH_ERROR);
  const isByPassPayment = req.context.get(BYPASS_PAYMENT_ERROR);

  const handleServerError = () => {
    globalModalService.close();
    router.navigateByUrl('/errors/500');
  };

  const handleUnauthorized = () => {
    if (hasShownUnauthorizedDialog) return;

    hasShownUnauthorizedDialog = true;

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

  const handleForbidden = () => {
    globalModalService.close();
    router.navigateByUrl('/errors/403');
  };

  const handleMissingSchoolOrSubscription = () => {
    const roles = user()?.roles ?? [];
    const isAdmin =
      roles.includes(UserRoles.SCHOOL_ADMIN) ||
      roles.includes(UserRoles.SYSTEM_ADMIN);

    confirmationService.confirm({
      header: 'Trường chưa được kích hoạt',
      message: isAdmin
        ? `
        <p>Trường của bạn hiện chưa có gói sử dụng.</p>
        <p>Vui lòng <strong>chọn và kích hoạt</strong> gói để tiếp tục sử dụng hệ thống.</p>
      `
        : `
        <p>Trường của bạn hiện chưa được kích hoạt.</p>
        <p>Vui lòng liên hệ với <strong>quản trị viên của trường</strong> để được cấp quyền truy cập.</p>
      `,
      acceptButtonProps: { label: isAdmin ? 'Xem các gói' : 'Đăng xuất' },
      rejectVisible: false,
      closable: false,
      accept: () => {
        if (isAdmin) {
          router.navigateByUrl('/school-admin/subscription-plans');
        } else {
          jwtService.clearAll();
          userService.clearCurrentUser();
          router.navigateByUrl('/auth/login', { replaceUrl: true });
        }
      },
    });
  };

  const handleSubscriptionExpired = () => {
    userService.getCurrentProfile().subscribe();

    const roles = user()?.roles ?? [];
    const isAdmin =
      roles.includes(UserRoles.SCHOOL_ADMIN) ||
      roles.includes(UserRoles.SYSTEM_ADMIN);

    confirmationService.confirm({
      header: 'Gói sử dụng đã hết hạn',
      message: isAdmin
        ? `
        <p>Gói sử dụng của trường bạn đã hết hạn.</p>
        <p>Vui lòng <strong>gia hạn</strong> để tiếp tục sử dụng hệ thống.</p>
      `
        : `
        <p>Gói sử dụng của trường bạn đã hết hạn.</p>
        <p>Vui lòng liên hệ với <strong>quản trị viên</strong> để gia hạn và tiếp tục sử dụng hệ thống.</p>
      `,
      acceptButtonProps: { label: isAdmin ? 'Gia hạn' : 'Đăng xuất' },
      rejectVisible: false,
      closable: false,
      accept: () => {
        if (isAdmin) {
          router.navigateByUrl('/school-admin/subscription-plans');
        } else {
          jwtService.clearAll();
          userService.clearCurrentUser();
          router.navigateByUrl('/auth/login', { replaceUrl: true });
        }
      },
    });
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isPaymentRequired = error.status === 402;
      const isForbidden = error.status === 403;
      const isNotFound = error.status === 404;
      const isServerError = error.status === 0 || error.status >= 500;

      const statusCode = error.error?.statusCode;

      if (!statusCode) return throwError(() => error);

      if (isServerError) {
        handleServerError();
        return throwError(() => error);
      }

      if (isUnauthorized && !isByPassAuth) {
        handleUnauthorized();
        return throwError(() => error);
      }

      if (
        isPaymentRequired &&
        !isByPassPayment &&
        statusCode === statusCode.SUBSCRIPTION_EXPIRED_WITH_DATA_LOSS_RISK
      ) {
        handleSubscriptionExpired();
        return throwError(() => error);
      }

      if (isForbidden && !isByPassAuth) {
        if (statusCode === StatusCode.SCHOOL_AND_SUBSCRIPTION_REQUIRED) {
          handleMissingSchoolOrSubscription();
        } else {
          handleForbidden();
        }
        return throwError(() => error);
      }

      if (
        isNotFound &&
        statusCode === StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND
      ) {
        handleMissingSchoolOrSubscription();
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
