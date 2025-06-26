import { SubscriptionPlan } from '../../../../../shared/models/entities/subscription-plan.model';

export interface GetSubscriptionPlanResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: SubscriptionPlan[];
}
