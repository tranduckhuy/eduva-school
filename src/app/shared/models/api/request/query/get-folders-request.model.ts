import { EntityStatus } from '../../../enum/entity-status.enum';
import { FolderOwnerType } from '../../../enum/folder-owner-type.enum';

export interface GetFoldersRequest {
  classId?: string;
  userId?: string;
  name?: string;
  ownerType?: FolderOwnerType;
  status?: EntityStatus;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPaging?: boolean;
}
