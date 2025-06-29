import { EntityStatus } from '../enum/entity-status.enum';

export interface ClassModel {
  id: string;
  schoolId: number;
  name: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  schoolName: string;
  backgroundImageUrl: string;
  teacherAvatarUrl: string;
  createdAt: string;
  lastModifiedAt: string;
  status: EntityStatus;
}
