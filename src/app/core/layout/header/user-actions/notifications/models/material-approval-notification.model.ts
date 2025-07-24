import { type LessonMaterialStatus } from '../../../../../../shared/models/enum/lesson-material.enum';

export interface LessonMaterialApprovalNotification {
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  status: LessonMaterialStatus;
  feedback: string;
  approvedAt: string;
  performedByUserId: string;
  performedByName: string;
  performedByAvatar: string;
}
