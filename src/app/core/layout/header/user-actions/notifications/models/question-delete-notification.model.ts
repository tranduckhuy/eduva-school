import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionDeleteNotification {
  questionId: string;
  lessonMaterialId: string;
  title: string;
  lessonMaterialTitle: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  deletedAt: string;
  actionType: QuestionActionType;
}
