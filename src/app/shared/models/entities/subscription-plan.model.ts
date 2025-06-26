import { EntityStatus } from '../enum/entity-status.enum';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  storageLimitGB: number;
  priceMonthly: number;
  pricePerYear: number;
  status: EntityStatus;
}
