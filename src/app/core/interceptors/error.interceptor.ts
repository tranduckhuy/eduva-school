import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../../shared/services/api/user/user.service';
import { GlobalModalService } from '../../shared/services/layout/global-modal/global-modal.service';

import { StatusCode } from '../../shared/constants/status-code.constant';
import { UserRoles } from '../../shared/constants/user-roles.constant';
import {
  BYPASS_AUTH_ERROR,
  BYPASS_NOT_FOUND_ERROR,
  BYPASS_PAYMENT_ERROR,
} from '../../shared/tokens/context/http-context.token';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const globalModalService = inject(GlobalModalService);
  const confirmationService = inject(ConfirmationService);

  const user = userService.currentUser;
  const isByPassAuth = req.context.get(BYPASS_AUTH_ERROR);
  const isByPassPayment = req.context.get(BYPASS_PAYMENT_ERROR);
  const isByPassNotFound = req.context.get(BYPASS_NOT_FOUND_ERROR);

  const isAdmin = () => {
    const roles = user()?.roles ?? [];
    return roles.includes(UserRoles.SCHOOL_ADMIN);
  };

  const clearSessionData = () => {
    // ? Clear session
    authService.clearSession();

    // ? Clear accordion open
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('accordion-open:')) {
        localStorage.removeItem(key);
      }
    });

    // ? Close Modal
    globalModalService.close();

    // ? Close Submenus
    window.dispatchEvent(new Event('close-all-submenus'));
  };

  const handleServerError = () => {
    globalModalService.close();
    router.navigateByUrl('/errors/500');
  };

  const handleForbidden = () => {
    globalModalService.close();
    router.navigateByUrl('/errors/403');
  };

  const handleNotFound = () => {
    globalModalService.close();
    router.navigateByUrl('/errors/404');
  };

  const handleUnauthorized = () => {
    globalModalService.close();
    confirmationService.confirm({
      header: 'Phiên đã hết hạn',
      message: 'Vui lòng đăng nhập lại.',
      closable: false,
      rejectVisible: false,
      acceptButtonProps: { label: 'Đồng ý' },
      accept: () => {
        clearSessionData();
        router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
    });
  };

  const createSubscriptionConfirmation = (
    header: string,
    message: string,
    adminAction: string,
    userAction: string
  ) => {
    const admin = isAdmin();
    confirmationService.confirm({
      header,
      message: admin ? message : message.replace(adminAction, userAction),
      acceptButtonProps: { label: admin ? adminAction : 'Đăng xuất' },
      rejectVisible: false,
      closable: false,
      accept: () => {
        if (admin) {
          router.navigateByUrl('/school-admin/subscription-plans');
        } else {
          clearSessionData();
          router.navigateByUrl('/auth/login', { replaceUrl: true });
        }
      },
    });
  };

  const handleMissingSchoolOrSubscription = () => {
    createSubscriptionConfirmation(
      'Trường chưa được kích hoạt',
      `
        <p>Trường của bạn hiện chưa có gói sử dụng.</p>
        <p>Vui lòng <strong>chọn và kích hoạt</strong> gói để tiếp tục sử dụng hệ thống.</p>
      `,
      'Xem các gói',
      'liên hệ với <strong>quản trị viên của trường</strong> để được cấp quyền truy cập'
    );
  };

  const handleSubscriptionExpired = () => {
    userService.getCurrentProfile().subscribe();

    createSubscriptionConfirmation(
      'Gói sử dụng đã hết hạn',
      `
        <p>Gói sử dụng của trường bạn đã hết hạn.</p>
        <p>Vui lòng <strong>gia hạn</strong> để tiếp tục sử dụng hệ thống.</p>
      `,
      'Gia hạn',
      'liên hệ với <strong>quản trị viên</strong> để gia hạn và tiếp tục sử dụng hệ thống'
    );
  };

  const handleErrorByStatusCode = (error: HttpErrorResponse) => {
    const { status, error: errorData } = error;
    const errorStatusCode = errorData?.statusCode;

    // Server errors
    if (status === 0 || status >= 500) {
      handleServerError();
      return;
    }

    // Unauthorized
    if (status === 401 && !isByPassAuth) {
      handleUnauthorized();
      return;
    }

    // No status code to process
    if (!errorStatusCode) {
      return;
    }

    // Payment required
    if (
      status === 402 &&
      !isByPassPayment &&
      errorStatusCode === StatusCode.SUBSCRIPTION_EXPIRED_WITH_DATA_LOSS_RISK
    ) {
      handleSubscriptionExpired();
      return;
    }

    // Forbidden
    if (status === 403 && !isByPassAuth) {
      if (errorStatusCode === StatusCode.SCHOOL_AND_SUBSCRIPTION_REQUIRED) {
        handleMissingSchoolOrSubscription();
      } else {
        handleForbidden();
      }
      return;
    }

    // Not found
    if (status === 404 && !isByPassNotFound) {
      if (errorStatusCode === StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND) {
        handleMissingSchoolOrSubscription();
      } else {
        handleNotFound();
      }
    }
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleErrorByStatusCode(error);
      return throwError(() => error);
    })
  );
};
