import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';

import { type User } from '../../../models/entities/user.model';
import { type UpdateProfileRequest } from '../../../pages/settings-page/personal-information/models/update-profile-request.model';
import { EntityListResponse } from '../../../models/api/response/query/entity-list-response.model';
import { BaseResponse } from '../../../models/api/base-response.model';
import { UserListParams } from '../../../models/api/request/query/user-list-params';
import { CreateUserRequest } from '../../../models/api/request/command/create-user-request.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly USER_API_URL = `${this.BASE_API_URL}/users`;
  private readonly USER_DETAIL_API_URL = `${this.BASE_API_URL}/users/school`;
  private readonly USER_PROFILE_API_URL = `${this.BASE_API_URL}/users/profile`;

  private readonly LOCAL_STORAGE_USER_KEY = 'eduva_user';

  private readonly currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  private readonly usersSignal = signal<User[]>([]);
  readonly users = this.usersSignal.asReadonly();

  private readonly totalUsersSignal = signal<number>(0);
  readonly totalUsers = this.totalUsersSignal.asReadonly();

  private readonly userDetailSignal = signal<User | null>(null);
  readonly userDetail = this.userDetailSignal.asReadonly();

  constructor() {
    // Hydrate signal from sessionStorage if sessionStorage have data
    const cachedUser = this.loadUserFromStorage();
    if (cachedUser) {
      this.currentUserSignal.set(cachedUser);
    }
  }

  getCurrentProfile(): Observable<User | null> {
    return this.requestService.get<User>(this.USER_PROFILE_API_URL).pipe(
      tap(res => this.handleGetProfileSideEffect(res)),
      map(res => this.extractUserFromResponse(res)),
      catchError(() => this.handleErrorResponse())
    );
  }

  updateUserProfile(request: UpdateProfileRequest): Observable<User | null> {
    return this.requestService
      .put<User>(this.USER_PROFILE_API_URL, request)
      .pipe(
        tap(res => this.handleUpdateProfileSideEffect(res)),
        map(res => this.extractUserFromResponse(res)),
        catchError(() => this.handleErrorResponse())
      );
  }

  updateCurrentUserPartial(update: Partial<User>): void {
    const current = this.currentUserSignal();
    if (!current) return;
    const merged = { ...current, ...update };
    this.setCurrentUser(merged);
  }

  clearCurrentUser(): void {
    this.setCurrentUser(null);
  }

  getUsers(
    params: UserListParams
  ): Observable<EntityListResponse<User> | null> {
    return this.handleRequest<EntityListResponse<User>>(
      this.requestService.get<EntityListResponse<User>>(
        this.USER_API_URL,
        { ...params, schoolId: this.currentUserSignal()?.school?.id },
        {
          loadingKey: 'get-users',
        }
      ),
      {
        successHandler: data => {
          this.usersSignal.set(data.data);
          this.totalUsersSignal.set(data.count);
        },
        errorHandler: () => this.resetUsers(),
      }
    );
  }

  createUser(request: CreateUserRequest): Observable<boolean> {
    return this.requestService
      .post<void>(this.USER_API_URL, request, {
        bypassAuthError: true,
        loadingKey: 'create-user',
      })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS) {
            this.toastHandlingService.success(
              'Thành công!',
              'Tài khoản người dùng đã được tạo thành công'
            );
            return true;
          } else {
            this.toastHandlingService.errorGeneral();
            return false;
          }
        }),
        catchError((err: HttpErrorResponse) => {
          this.handleCreateUserError(err);
          return of(false);
        })
      );
  }

  /**
   * Fetches user details by ID
   * @param id User ID
   * @returns Observable with User data or null
   */
  getUserDetailById(id: string): Observable<User | null> {
    return this.handleRequest<User>(
      this.requestService.get<User>(`${this.USER_DETAIL_API_URL}/${id}`),
      {
        successHandler: data => this.userDetailSignal.set(data),
        errorHandler: () => this.resetUser(),
      }
    );
  }

  /**
   * Activates a user account
   * @param id User ID to activate
   * @returns Observable<void>
   */
  activateUser(id: string): Observable<void> {
    return this.handleModificationRequest(
      this.requestService.put<void>(`${this.USER_API_URL}/${id}/unlock`, '', {
        loadingKey: 'activate-user',
      }),
      'Kích hoạt người dùng thành công!'
    );
  }

  /**
   * Archives a user account
   * @param id User ID to archive
   * @returns Observable<void>
   */
  archiveUser(id: string): Observable<void> {
    return this.handleModificationRequest(
      this.requestService.put<void>(`${this.USER_API_URL}/${id}/lock`, '', {
        loadingKey: 'archive-user',
      }),
      'Vô hiệu người dùng thành công!'
    );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleGetProfileSideEffect(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.setCurrentUser(res.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleUpdateProfileSideEffect(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.toastHandlingService.success(
        'Thành công',
        'Hồ sơ của bạn đã được thay đổi thành công'
      );

      const updated = res.data as User;

      if (!updated) {
        this.toastHandlingService.errorGeneral();
        return;
      }

      this.updateCurrentUserPartial({
        fullName: updated.fullName,
        phoneNumber: updated.phoneNumber,
        avatarUrl: updated.avatarUrl,
      });
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractUserFromResponse(res: any): User | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleErrorResponse(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.LOCAL_STORAGE_USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) {
      localStorage.setItem(this.LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.LOCAL_STORAGE_USER_KEY);
    }
  }

  /**
   * Handles common request patterns with success/error handling
   */
  private handleRequest<T>(
    request$: Observable<BaseResponse<T>>,
    options: {
      successHandler?: (data: T) => void;
      errorHandler?: () => void;
    } = {}
  ): Observable<T | null> {
    return request$.pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS && res.data) {
          options.successHandler?.(res.data);
          return res.data;
        }
        options.errorHandler?.();
        this.toastHandlingService.errorGeneral();
        return null;
      }),
      catchError((err: HttpErrorResponse) => {
        this.toastHandlingService.errorGeneral();
        return throwError(() => err);
      })
    );
  }

  /**
   * Handles modification requests (activate/archive) with common patterns
   */
  private handleModificationRequest(
    request$: Observable<BaseResponse<void>>,
    successMessage: string
  ): Observable<void> {
    return request$.pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS) {
          this.toastHandlingService.success('Thành công', successMessage);
        } else {
          this.toastHandlingService.errorGeneral();
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.toastHandlingService.errorGeneral();
        return throwError(() => err);
      })
    );
  }

  private handleCreateUserError(err: HttpErrorResponse): void {
    const statusCode = err.error?.statusCode;

    switch (statusCode) {
      case StatusCode.EMAIL_ALREADY_EXISTS:
        this.toastHandlingService.error(
          'Đăng ký thất bại',
          'Email đã tồn tại. Vui lòng chọn email khác!'
        );
        break;
      case StatusCode.EXCEED_USER_LIMIT:
        this.toastHandlingService.error(
          'Đăng ký thất bại',
          'Số lượng tài khoản được phép tạo đã đạt đến mức tối đa!'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
  }

  private resetUsers(): void {
    this.usersSignal.set([]);
    this.totalUsersSignal.set(0);
  }

  private resetUser(): void {
    this.userDetailSignal.set(null);
  }
}
