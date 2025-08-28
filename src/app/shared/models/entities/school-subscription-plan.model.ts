import { type BillingCycle } from '../api/request/command/create-plan-payment-link-request.model';
import { type SubscriptionStatus } from '../enum/subscription-status.enum';

export interface SchoolSubscriptionPlan {
  planName: string;
  description: string;
  startDate: string;
  endDate: string;
  subscriptionStatus: SubscriptionStatus;
  billingCycle: BillingCycle;
  priceMonthly: number;
  pricePerYear: number;
  maxUsers: number;
  storageLimitGB: number;
  amountPaid: number;
}
