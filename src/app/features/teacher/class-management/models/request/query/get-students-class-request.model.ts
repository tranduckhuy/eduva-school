import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

export interface GetStudentsClassRequest {
  studentId: string;
  className: string;
  teacherName: string;
  schoolName: string;
  classCode: string;
  classStatus: EntityStatus;
  schoolId: number;
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  searchTerm: string;
}
