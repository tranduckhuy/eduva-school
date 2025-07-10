import { EntityStatus } from '../enum/entity-status.enum';

export interface CreditPack {
  id: number;
  name: string;
  price: number;
  credits: number;
  bonusCredits: number;
  status: EntityStatus;
  createdAt: string;
  lastModifiedAt: string;
}
