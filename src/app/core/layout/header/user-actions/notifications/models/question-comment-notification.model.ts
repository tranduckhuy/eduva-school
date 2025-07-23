import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionCommentNotification {
  commentId: string;
  questionId: string;
  lessonMaterialId: string;
  title: string;
  lessonMaterialTitle: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  parentCommentId: string;
  isReply: boolean;
  actionType: QuestionActionType;
}
