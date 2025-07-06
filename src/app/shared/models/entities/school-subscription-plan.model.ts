import { BillingCycle } from '../api/request/command/create-plan-payment-link-request.model';

enum SubscriptionStatus {
  Active = 0,
  Pending = 1,
  Expired = 2,
  Canceled = 3,
}

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
