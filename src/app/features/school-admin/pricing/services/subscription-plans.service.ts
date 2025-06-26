import { Injectable, inject, signal } from '@angular/core';

import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type SubscriptionPlan } from '../../../../shared/models/entities/subscription-plan.model';
import { type GetSubscriptionPlanRequest } from '../models/request/get-subscription-plan-request.model';
import { type GetSubscriptionPlanResponse } from '../models/response/get-subscription-plan-response.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPlansService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_SUBSCRIPTION_PLANS_API_URL = `${this.BASE_API_URL}/subscription-plans`;

  private readonly monthlyPlansSignal = signal<SubscriptionPlan[]>([]);
  monthlyPlans = this.monthlyPlansSignal.asReadonly();

  private readonly yearlyPlansSignal = signal<SubscriptionPlan[]>([]);
  yearlyPlans = this.yearlyPlansSignal.asReadonly();

  getSubscriptionPlans(
    request: GetSubscriptionPlanRequest
  ): Observable<GetSubscriptionPlanResponse | null> {
    return this.requestService
      .get<GetSubscriptionPlanResponse>(
        this.GET_SUBSCRIPTION_PLANS_API_URL,
        request
      )
      .pipe(
        tap(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            const plans = res.data.data;
            this.monthlyPlansSignal.set(plans.filter(p => p.priceMonthly > 0));
            this.yearlyPlansSignal.set(plans.filter(p => p.pricePerYear > 0));
          }
        }),
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            return res.data;
          } else {
            this.toastHandlingService.errorGeneral();
            return null;
          }
        })
      );
  }
}
