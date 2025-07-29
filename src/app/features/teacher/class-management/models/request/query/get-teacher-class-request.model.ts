import { type EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

export interface GetTeacherClassRequest {
  schoolId?: string;
  teacherId?: string;
  classId?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  status?: EntityStatus;
  isPagingEnabled?: boolean;
}
