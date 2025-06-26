export enum BillingCycle {
  Monthly = 0,
  Yearly = 1,
}

export interface CreatePlanPaymentLinkRequest {
  planId: number;
  billingCycle: BillingCycle;
}
