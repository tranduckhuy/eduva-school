import { EntityStatus } from '../enum/entity-status.enum';

export interface School {
  id: number;
  name: string;
  code?: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl?: string;
  status: EntityStatus;
  createdAt?: Date;
  createdBy?: string;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
}
