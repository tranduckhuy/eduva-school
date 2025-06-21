import {
  ChangeDetectionStrategy,
  Component,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  maxUsers: number;
  storageLimitGB: number;
  priceMonthly: number;
  pricePerYear: number;
  status: number;
}

registerLocaleData(localeVi);

@Component({
  selector: 'app-pricing-plan-card',
  standalone: true,
  imports: [ButtonComponent, CurrencyPipe],
  templateUrl: './pricing-plan-card.component.html',
  styleUrl: './pricing-plan-card.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPlanCardComponent {
  pricingPlan = input.required<PricingPlan>();
  isYearly = input.required<boolean>();

  pricingPlanOptions = signal<string[]>([
    'Dashboard nâng cao',
    'Tạo bài giảng âm thanh',
    'Tạo video bài giảng',
    'Báo cáo chi tiết',
    'Hỗ trợ kỹ thuật 24/7',
  ]);
}
