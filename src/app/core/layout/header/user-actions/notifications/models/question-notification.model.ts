import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionNotification {
  userNotificationId: string;
  questionId: string;
  title: string;
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  content: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  performedByUserId: string;
  createdByName: string;
  performedByName: string;
  createdByAvatar: string;
  createdByRole: string;
  commentCount: number;
  actionType: QuestionActionType;
}
