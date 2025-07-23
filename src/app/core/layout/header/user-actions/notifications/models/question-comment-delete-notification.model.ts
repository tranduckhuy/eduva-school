import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionCommentDeleteNotification {
  commentId: string;
  questionId: string;
  lessonMaterialId: string;
  title: string;
  lessonMaterialTitle: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  deletedAt: string;
  deletedRepliesCount: number;
  actionType: QuestionActionType;
}
