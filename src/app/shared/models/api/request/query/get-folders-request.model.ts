import { FolderOwnerType } from '../../../enum/folder-owner-type.enum';

export interface GetFoldersRequest {
  classId?: string;
  userId?: string;
  name?: string;
  ownerType?: FolderOwnerType;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
