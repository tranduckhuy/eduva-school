import { Injectable, inject } from '@angular/core';

import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type SchoolSubscriptionPlan } from '../../../../shared/models/entities/school-subscription-plan.model';

@Injectable({
  providedIn: 'root',
})
export class SchoolSubscriptionPlanService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_SUBSCRIPTION_PLANS_API_URL = `${this.BASE_API_URL}/school-subscriptions/current`;

  getCurrentSchoolPlan(): Observable<SchoolSubscriptionPlan | null> {
    return this.requestService
      .get<SchoolSubscriptionPlan>(this.GET_SUBSCRIPTION_PLANS_API_URL)
      .pipe(
        map(res => this.extractCurrentSchoolPlan(res)),
        catchError(() => this.handleErrorResponse())
      );
  }

  // ---------------------------
  //  Private Handlers
  // ---------------------------

  private extractCurrentSchoolPlan(res: any): SchoolSubscriptionPlan | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleErrorResponse(): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return of(null);
  }
}
