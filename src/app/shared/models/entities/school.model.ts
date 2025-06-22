export interface School {
  id: number;
  name: string;
  code?: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  createdBy?: string;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
}
