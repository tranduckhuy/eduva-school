import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { JwtService } from '../auth/services/jwt.service';
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

const isSchoolAdminOrSystemAdmin = (roles: string[] = []) =>
  roles.includes(UserRoles.SCHOOL_ADMIN) ||
  roles.includes(UserRoles.SYSTEM_ADMIN);

const clearAndRedirectToLogin = (
  jwtService: JwtService,
  userService: UserService,
  router: Router
) => {
  jwtService.clearAll();
  userService.clearCurrentUser();
  router.navigateByUrl('/auth/login', { replaceUrl: true });
};

const showConfirm = (
  confirmationService: ConfirmationService,
  config: {
    header: string;
    message: string;
    acceptLabel: string;
    onAccept: () => void;
  }
) => {
  confirmationService.confirm({
    header: config.header,
    message: config.message,
    closable: false,
    rejectVisible: false,
    acceptButtonProps: { label: config.acceptLabel },
    accept: config.onAccept,
  });
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const globalModalService = inject(GlobalModalService);
  const confirmationService = inject(ConfirmationService);

  const user = userService.currentUser;
  const isByPassAuth = req.context.get(BYPASS_AUTH_ERROR);
  const isByPassPayment = req.context.get(BYPASS_PAYMENT_ERROR);
  const isByPassNotFound = req.context.get(BYPASS_NOT_FOUND_ERROR);

  const navigateError = (path: string) => {
    globalModalService.close();
    router.navigateByUrl(path);
  };

  const handleUnauthorized = () => {
    globalModalService.close();
    showConfirm(confirmationService, {
      header: 'Phiên đã hết hạn',
      message: 'Vui lòng đăng nhập lại.',
      acceptLabel: 'Đồng ý',
      onAccept: () => {
        authService.clearSession();
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('accordion-open:')) {
            localStorage.removeItem(key);
          }
        });
        globalModalService.close();
        window.dispatchEvent(new Event('close-all-submenus'));
        router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
    });
  };

  const handleSchoolActivationOrExpiry = (expired: boolean) => {
    const roles = user()?.roles ?? [];
    const isAdmin = isSchoolAdminOrSystemAdmin(roles);

    const header = expired
      ? 'Gói sử dụng đã hết hạn'
      : 'Trường chưa được kích hoạt';

    let message: string;
    if (expired) {
      message = isAdmin
        ? `
            <p>Gói sử dụng của trường bạn đã hết hạn.</p>
            <p>Vui lòng <strong>gia hạn</strong> để tiếp tục sử dụng hệ thống.</p>
          `
        : `
          <p>Gói sử dụng của trường bạn đã hết hạn.</p>
          <p>Vui lòng liên hệ với <strong>quản trị viên</strong> để gia hạn và tiếp tục sử dụng hệ thống.</p>
        `;
    } else {
      message = isAdmin
        ? `
            <p>Trường của bạn hiện chưa có gói sử dụng.</p>
            <p>Vui lòng <strong>chọn và kích hoạt</strong> gói để tiếp tục sử dụng hệ thống.</p>
          `
        : `
          <p>Trường của bạn hiện chưa được kích hoạt.</p>
          <p>Vui lòng liên hệ với <strong>quản trị viên của trường</strong> để được cấp quyền truy cập.</p>
        `;
    }

    showConfirm(confirmationService, {
      header,
      message,
      acceptLabel: isAdmin
        ? expired
          ? 'Gia hạn'
          : 'Xem các gói'
        : 'Đăng xuất',
      onAccept: () => {
        if (isAdmin) {
          router.navigateByUrl('/school-admin/subscription-plans');
        } else {
          clearAndRedirectToLogin(jwtService, userService, router);
        }
      },
    });
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      const errorStatusCode = error.error?.statusCode;

      if (status === 0 || status >= 500) {
        navigateError('/errors/500');
        return throwError(() => error);
      }

      if (status === 401 && !isByPassAuth) {
        handleUnauthorized();
        return throwError(() => error);
      }

      if (!errorStatusCode) {
        return throwError(() => error);
      }

      if (
        status === 402 &&
        !isByPassPayment &&
        errorStatusCode === StatusCode.SUBSCRIPTION_EXPIRED_WITH_DATA_LOSS_RISK
      ) {
        handleSchoolActivationOrExpiry(true);
        return throwError(() => error);
      }

      if (status === 403 && !isByPassAuth) {
        if (errorStatusCode === StatusCode.SCHOOL_AND_SUBSCRIPTION_REQUIRED) {
          handleSchoolActivationOrExpiry(false);
        } else {
          navigateError('/errors/403');
        }
        return throwError(() => error);
      }

      if (status === 404 && !isByPassNotFound) {
        if (errorStatusCode === StatusCode.SCHOOL_SUBSCRIPTION_NOT_FOUND) {
          handleSchoolActivationOrExpiry(false);
        } else {
          navigateError('/errors/404');
        }
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
