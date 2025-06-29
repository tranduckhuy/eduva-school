import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

export interface StudentClassResponse {
  id: string;
  studentId: string;
  classId: string;
  className: string;
  teacherName: string;
  schoolName: string;
  classCode: string;
  studentName: string;
  teacherAvatarUrl: string;
  studentAvatarUrl: string;
  enrolledAt: string;
  classStatus: EntityStatus;
}

export interface GetStudentsClassResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: StudentClassResponse[];
}
