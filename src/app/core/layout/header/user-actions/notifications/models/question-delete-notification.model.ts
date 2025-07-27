import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionDeleteNotification {
  userNotificationId: string;
  questionId: string;
  title: string;
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  createdByUserId: string;
  performedByUserId: string;
  createdByName: string;
  performedByName: string;
  createdByAvatar: string;
  createdByRole: string;
  deletedAt: string;
  actionType: QuestionActionType;
}
