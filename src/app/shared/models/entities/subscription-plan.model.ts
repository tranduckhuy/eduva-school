import { EntityStatus } from '../enum/entity-status.enum';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  maxUsers: number;
  storageLimitGB: number;
  priceMonthly: number;
  pricePerYear: number;
  isRecommend: boolean;
  status: EntityStatus;
}
