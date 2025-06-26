import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ToggleSwitch,
  type ToggleSwitchChangeEvent,
} from 'primeng/toggleswitch';

import { SubscriptionPlansService } from './services/subscription-plans.service';

import { PricingPlanCardComponent } from './pricing-plan-card/pricing-plan-card.component';

import { type SubscriptionPlan } from '../../../shared/models/entities/subscription-plan.model';
import { type GetSubscriptionPlanRequest } from './models/request/get-subscription-plan-request.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [FormsModule, ToggleSwitch, PricingPlanCardComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent implements OnInit {
  private readonly subscriptionPlanService = inject(SubscriptionPlansService);

  monthlyPlans = this.subscriptionPlanService.monthlyPlans;
  yearlyPlans = this.subscriptionPlanService.yearlyPlans;

  subscriptionPlans = signal<SubscriptionPlan[]>([]);
  isYearly = signal<boolean>(false);

  ngOnInit(): void {
    const request: GetSubscriptionPlanRequest = {
      activeOnly: true,
    };
    this.subscriptionPlanService
      .getSubscriptionPlans(request)
      .subscribe(() => this.subscriptionPlans.set(this.monthlyPlans()));
  }

  onToggleChange(event: ToggleSwitchChangeEvent) {
    this.isYearly.set(event.checked);
    if (event.checked) {
      this.subscriptionPlans.set(this.yearlyPlans());
    } else {
      this.subscriptionPlans.set(this.monthlyPlans());
    }
  }
}
