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

  private readonly subscriptionPlansSignal = signal<SubscriptionPlan[]>([]);
  subscriptionPlans = this.subscriptionPlansSignal.asReadonly();

  private readonly subscriptionPlanSignal = signal<SubscriptionPlan | null>(
    null
  );
  subscriptionPlan = this.subscriptionPlanSignal.asReadonly();

  getAllPlans(
    request: GetSubscriptionPlanRequest
  ): Observable<GetSubscriptionPlanResponse | null> {
    return this.requestService
      .get<GetSubscriptionPlanResponse>(
        this.GET_SUBSCRIPTION_PLAN_API_URL,
        request
      )
      .pipe(
        tap(res => this.handleListResponse(res)),
        map(res => this.handleExtractList(res)),
        catchError(() => this.handleError())
      );
  }

  getPlanById(id: number): Observable<SubscriptionPlan | null> {
    return this.requestService
      .get<SubscriptionPlan>(`${this.GET_SUBSCRIPTION_PLAN_API_URL}/${id}`)
      .pipe(
        tap(res => this.handleSingleResponse(res)),
        map(res => res.data!),
        catchError(() => this.handleError())
      );
  }

  // ---------------------------
  //  Private Handlers
  // ---------------------------

  private handleListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data?.data) {
      this.subscriptionPlansSignal.set(res.data.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleSingleResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.subscriptionPlanSignal.set(res.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleExtractList(res: any): GetSubscriptionPlanResponse | null {
    return res.statusCode === StatusCode.SUCCESS && res.data ? res.data : null;
  }

  private handleError(): Observable<never> {
    this.toastHandlingService.errorGeneral();
    return EMPTY;
  }
}
