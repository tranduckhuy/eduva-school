import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { StorageFormatPipe } from '../../../../shared/pipes/storage-format.pipe';

import { ButtonComponent } from '../../../../shared/components/button/button.component';

import { type SubscriptionPlan } from '../../../../shared/models/entities/subscription-plan.model';

@Component({
  selector: 'app-pricing-plan-card',
  standalone: true,
  imports: [CurrencyPipe, StorageFormatPipe, ButtonComponent],
  templateUrl: './pricing-plan-card.component.html',
  styleUrl: './pricing-plan-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPlanCardComponent {
  subscriptionPlan = input.required<SubscriptionPlan>();
  isYearly = input.required<boolean>();

  subscriptionPlanOptions = signal<string[]>([
    'Dashboard nâng cao',
    'Tạo bài giảng âm thanh',
    'Tạo video bài giảng',
    'Báo cáo chi tiết',
    'Hỗ trợ kỹ thuật 24/7',
  ]);
}
