import { EntityStatus } from '../enum/entity-status.enum';

export interface School {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  websiteUrl?: string;
  status: EntityStatus;
}
