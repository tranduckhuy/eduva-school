import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { forkJoin, of } from 'rxjs';

import {
  ToggleSwitch,
  type ToggleSwitchChangeEvent,
} from 'primeng/toggleswitch';

import { UserService } from '../../../shared/services/api/user/user.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SchoolSubscriptionPlanService } from './services/school-subscription-plan.service';

import { SubscriptionPlanCardComponent } from './subscription-plan-card/subscription-plan-card.component';

import { BillingCycle } from '../../../shared/models/api/request/command/create-plan-payment-link-request.model';

import { type SubscriptionPlan } from '../../../shared/models/entities/subscription-plan.model';
import { type SchoolSubscriptionPlan } from '../../../shared/models/entities/school-subscription-plan.model';
import { type GetSubscriptionPlanRequest } from './models/request/get-subscription-plan-request.model';

@Component({
  selector: 'subscription-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToggleSwitch,
    SubscriptionPlanCardComponent,
  ],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPlanComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly subscriptionPlanService = inject(SubscriptionPlanService);
  private readonly schoolPlanService = inject(SchoolSubscriptionPlanService);

  user = this.userService.currentUser;
  subscriptionPlans = this.subscriptionPlanService.subscriptionPlans;

  currentSchoolPlan = signal<SchoolSubscriptionPlan | null>(null);
  isYearly = signal<boolean>(false);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.isYearly.set(params.get('isYearly') === 'true');
    });

    const hasSchoolAndHasPlan =
      !!this.user()?.school &&
      this.user()?.userSubscriptionResponse.isSubscriptionActive;

    const currentPlan$ = hasSchoolAndHasPlan
      ? this.schoolPlanService.getCurrentSchoolPlan()
      : of(null);

    const request: GetSubscriptionPlanRequest = {
      activeOnly: true,
    };

    forkJoin({
      plans: this.subscriptionPlanService.getAllPlans(request),
      currentPlan: currentPlan$,
    }).subscribe(({ plans, currentPlan }) => {
      this.currentSchoolPlan.set(currentPlan);
    });
  }

  onToggleChange(event: ToggleSwitchChangeEvent) {
    this.isYearly.set(event.checked);
  }

  isCurrent(plan: SubscriptionPlan, isYearly: boolean): boolean {
    const current = this.currentSchoolPlan();
    if (!current) return false;

    // ? Compare billing cycle (Yearly/Monthly)
    const planBillingCycle = isYearly
      ? BillingCycle.Yearly
      : BillingCycle.Monthly;
    const isSameCycle = current.billingCycle === planBillingCycle;

    // ? Compare plan name (or id, if unique)
    const isSamePlan = plan.name === current.planName;

    // ? Compare price/amount paid
    const isSamePrice = isYearly
      ? plan.pricePerYear === current.pricePerYear
      : plan.priceMonthly === current.priceMonthly;

    // ? Mark as current if name, cycle, and amount all match
    return isSamePlan && isSameCycle && isSamePrice;
  }

  isPlanDisabled(plan: SubscriptionPlan, isYearly: boolean): boolean {
    const current = this.currentSchoolPlan();
    if (!current) return false;

    // ? If current user's plan have been expired then do not disabled anything
    const subscriptionEnd =
      this.user()?.userSubscriptionResponse?.subscriptionEndDate;
    if (subscriptionEnd && new Date(subscriptionEnd) < new Date()) {
      return false;
    }

    // ? All plans sorted from lowest to highest index
    const allPlans = this.subscriptionPlans();

    // ? Get index of current plan in the plan list
    const currentIndex = allPlans.findIndex(p => p.name === current.planName);
    const planIndex = allPlans.findIndex(p => p.name === plan.name);

    // ? Current plan's billing cycle
    const currentIsYearly = current.billingCycle === BillingCycle.Yearly;

    if (!currentIsYearly) {
      // ? Current is monthly
      if (!isYearly) {
        // ? Target plan is monthly: disable if index <= current index
        return planIndex <= currentIndex;
      } else {
        // ? Target plan is yearly: disable if index < current index (allow upgrade to same or higher)
        return planIndex < currentIndex;
      }
    } else {
      // ? Current is yearly, disable all plans of lower or same index, regardless of cycle
      return planIndex <= currentIndex;
    }
  }

  getRowClass(): Record<string, boolean> {
    const length = this.subscriptionPlans().length;
    const baseCols = Math.min(length, 3); // e-row-cols-[1-3]
    const mdCols = Math.min(length, 2); // md max 2
    const lgCols = Math.min(length, 2); // lg max 2

    return {
      [`e-row-cols-${baseCols}`]: true,
      [`e-row-cols-md-${mdCols}`]: true,
      [`e-row-cols-lg-${lgCols}`]: true,
      'e-row-cols-sm-1': true,
      'e-row': true,
      'e-g-4': true,
      'e-g-md-3': true,
    };
  }
}
