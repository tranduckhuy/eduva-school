import { Injectable, inject, signal } from '@angular/core';

import { Observable, map } from 'rxjs';

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
  private readonly GET_CURRENT_PROFILE_API_URL = `${this.BASE_API_URL}/users/profile`;

  private readonly currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  getCurrentProfile(): Observable<User | null> {
    return this.requestService.get<User>(this.GET_CURRENT_PROFILE_API_URL).pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS && res.data) {
          this.currentUserSignal.set(res.data);
          return res.data;
        } else {
          this.toastHandlingService.errorGeneral();
          return null;
        }
      })
    );
  }
}
