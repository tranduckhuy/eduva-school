import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionCommentNotification {
  userNotificationId: string;
  commentId: string;
  questionId: string;
  title: string;
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  content: string;
  createdAt: string;
  createdByUserId: string;
  performedByUserId: string;
  createdByName: string;
  performedByName: string;
  createdByAvatar: string;
  createdByRole: string;
  parentCommentId: string;
  isReply: boolean;
  actionType: QuestionActionType;
}
