import { type EntityStatus } from '../enum/entity-status.enum';

export interface School {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  websiteUrl?: string;
  status: EntityStatus;
}

export interface SchoolDetail {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  websiteUrl?: string;
  status: EntityStatus;
  schoolAdminId: string;
  schoolAdminFullName: string;
  schoolAdminEmail: string;
}
