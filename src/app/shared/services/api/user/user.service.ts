import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { RequestService } from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';
import { StatusCode } from '../../../constants/status-code.constant';

import { type User } from '../../../models/entities/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_CURRENT_USER_PROFILE_API_URL = `${this.BASE_API_URL}/users/profile`;

  private readonly SESSION_STORAGE_KEY = 'eduva_user';

  private readonly currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    // Hydrate signal from sessionStorage if sessionStorage have data
    const cachedUser = this.loadUserFromStorage();
    if (cachedUser) {
      this.currentUserSignal.set(cachedUser);
    }
  }

  getCurrentProfile(): Observable<User | null> {
    return this.requestService
      .get<User>(this.GET_CURRENT_USER_PROFILE_API_URL)
      .pipe(
        tap(res => this.handleGetProfileSideEffect(res)),
        map(res => this.extractUserFromResponse(res)),
        catchError(() => this.handleGetProfileError())
      );
  }

  clearCurrentUser(): void {
    this.setCurrentUser(null);
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

  private extractUserFromResponse(res: any): User | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleGetProfileError(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }

  private loadUserFromStorage(): User | null {
    const raw = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    }
  }
}
