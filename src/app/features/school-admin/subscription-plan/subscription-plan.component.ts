import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ToggleSwitch,
  type ToggleSwitchChangeEvent,
} from 'primeng/toggleswitch';

import { SubscriptionPlanService } from './services/subscription-plan.service';

import { SubscriptionPlanCardComponent } from './subscription-plan-card/subscription-plan-card.component';

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
  private readonly subscriptionPlanService = inject(SubscriptionPlanService);

  subscriptionPlans = this.subscriptionPlanService.subscriptionPlans;

  isYearly = signal<boolean>(false);

  ngOnInit(): void {
    const request: GetSubscriptionPlanRequest = {
      activeOnly: true,
    };
    this.subscriptionPlanService.getSubscriptionPlans(request).subscribe();
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
