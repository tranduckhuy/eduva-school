import { type EntityStatus } from '../../../enum/entity-status.enum';
import { type Role } from '../../../enum/role.enum';

export interface ExportUsersRequest {
  role?: Role;
  status?: EntityStatus;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
}
