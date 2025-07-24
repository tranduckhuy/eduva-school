import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionCommentDeleteNotification {
  commentId: string;
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
  deletedRepliesCount: number;
  actionType: QuestionActionType;
}
