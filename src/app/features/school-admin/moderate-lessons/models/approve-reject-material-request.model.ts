import { LessonMaterialStatus } from '../../../../shared/models/enum/lesson-material.enum';

export interface ApproveRejectMaterialRequest {
  status: LessonMaterialStatus;
  feedback?: string;
}
