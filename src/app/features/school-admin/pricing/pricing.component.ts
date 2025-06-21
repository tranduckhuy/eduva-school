import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { PricingPlanCardComponent } from './pricing-plan-card/pricing-plan-card.component';

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

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [FormsModule, ToggleSwitch, PricingPlanCardComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {
  pricingPlans = signal<PricingPlan[]>([
    {
      id: 1,
      name: 'Start',
      description: 'Gói thử nghiệm cơ bản cho nhóm nhỏ',
      maxUsers: 10,
      storageLimitGB: 1,
      priceMonthly: 149000,
      pricePerYear: 1788000,
      status: 0,
    },
    {
      id: 2,
      name: 'Basic',
      description: 'Gói phù hợp cho trường nhỏ',
      maxUsers: 25,
      storageLimitGB: 5,
      priceMonthly: 590000,
      pricePerYear: 7080000,
      status: 0,
    },
    {
      id: 3,
      name: 'Plus',
      description: 'Gói nâng cao cho trường vừa',
      maxUsers: 50,
      storageLimitGB: 10,
      priceMonthly: 990000,
      pricePerYear: 11880000,
      status: 0,
    },
    {
      id: 4,
      name: 'Pro',
      description: 'Gói mở rộng toàn diện cho trường lớn',
      maxUsers: 100,
      storageLimitGB: 50,
      priceMonthly: 1500000,
      pricePerYear: 18000000,
      status: 0,
    },
    {
      id: 5,
      name: 'Premium',
      description: 'Gói cao cấp với tài nguyên tối đa',
      maxUsers: 500,
      storageLimitGB: 200,
      priceMonthly: 2500000,
      pricePerYear: 30000000,
      status: 0,
    },
  ]);
  isYearly = signal<boolean>(false);
}
