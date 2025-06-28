import { Folder } from '../../../entities/folder.model';

export interface GetFoldersResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Folder[];
}
