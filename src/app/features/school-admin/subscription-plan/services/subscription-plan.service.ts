import { Injectable, inject, signal } from '@angular/core';

import { EMPTY, Observable, catchError, map, tap } from 'rxjs';

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
export class SubscriptionPlanService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_SUBSCRIPTION_PLAN_API_URL = `${this.BASE_API_URL}/subscription-plans`;

  private readonly monthlyPlansSignal = signal<SubscriptionPlan[]>([]);
  monthlyPlans = this.monthlyPlansSignal.asReadonly();

  private readonly yearlyPlansSignal = signal<SubscriptionPlan[]>([]);
  yearlyPlans = this.yearlyPlansSignal.asReadonly();

  private readonly subscriptionPlanSignal = signal<SubscriptionPlan | null>(
    null
  );
  subscriptionPlan = this.subscriptionPlanSignal.asReadonly();

  getSubscriptionPlans(
    request: GetSubscriptionPlanRequest
  ): Observable<GetSubscriptionPlanResponse | null> {
    return this.requestService
      .get<GetSubscriptionPlanResponse>(
        this.GET_SUBSCRIPTION_PLAN_API_URL,
        request
      )
      .pipe(
        tap(res => this.handleGetSubscriptionPlansResponse(res)),
        map(res => this.extractSubscriptionFromResponse(res)),
        catchError(() => this.handleGetSubscriptionPlanError())
      );
  }

  getSubscriptionPlan(id: number): Observable<SubscriptionPlan | null> {
    return this.requestService
      .get<SubscriptionPlan>(`${this.GET_SUBSCRIPTION_PLAN_API_URL}/${id}`)
      .pipe(
        tap(res => this.handleGetSingleSubscriptionPlanResponse(res)),
        map(res => res.data!),
        catchError(() => this.handleGetSubscriptionPlanError())
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleGetSubscriptionPlansResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const plans = res.data.data as SubscriptionPlan[];

      if (!plans) return;

      this.monthlyPlansSignal.set(plans.filter(p => p.priceMonthly > 0));
      this.yearlyPlansSignal.set(plans.filter(p => p.pricePerYear > 0));
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleGetSingleSubscriptionPlanResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const plan = res.data as SubscriptionPlan;

      if (!plan) return;

      this.subscriptionPlanSignal.set(plan);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractSubscriptionFromResponse(
    res: any
  ): GetSubscriptionPlanResponse | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    } else {
      return null;
    }
  }

  private handleGetSubscriptionPlanError(): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return EMPTY;
  }
}
