import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin } from 'rxjs';

import {
  ToggleSwitch,
  type ToggleSwitchChangeEvent,
} from 'primeng/toggleswitch';

import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SchoolSubscriptionPlanService } from './services/school-subscription-plan.service';

import { SubscriptionPlanCardComponent } from './subscription-plan-card/subscription-plan-card.component';

import { type GetSubscriptionPlanRequest } from './models/request/get-subscription-plan-request.model';
import { type SchoolSubscriptionPlan } from '../../../shared/models/entities/school-subscription-plan.model';

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
  private readonly subscriptionPlanService = inject(SubscriptionPlanService);
  private readonly schoolPlanService = inject(SchoolSubscriptionPlanService);

  subscriptionPlans = this.subscriptionPlanService.subscriptionPlans;

  currentSchoolPlan = signal<SchoolSubscriptionPlan | null>(null);
  isYearly = signal<boolean>(false);

  ngOnInit(): void {
    const request: GetSubscriptionPlanRequest = {
      activeOnly: true,
    };
    forkJoin({
      plans: this.subscriptionPlanService.getAllPlans(request),
      currentPlan: this.schoolPlanService.getCurrentSchoolPlan(),
    }).subscribe(({ plans, currentPlan }) => {
      this.currentSchoolPlan.set(currentPlan);
    });
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

  onToggleChange(event: ToggleSwitchChangeEvent) {
    this.isYearly.set(event.checked);
  }
}
