import { type QuestionActionType } from '../../../../../../shared/models/enum/question-action-type.enum';

export interface QuestionNotification {
  questionId: string;
  lessonMaterialId: string;
  title: string;
  lessonMaterialTitle: string;
  content: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  commentCount: number;
  actionType: QuestionActionType;
}
