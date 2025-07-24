import { type LessonMaterialStatus } from '../enum/lesson-material.enum';

export interface LessonMaterialApproval {
  id: string;
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  approverId: string;
  approverName: string;
  approverAvatarUrl: string;
  statusChangeTo: LessonMaterialStatus;
  feedback: string;
  createdAt: string;
  creatorName: string;
  schoolId: string;
  schoolName: string;
}
