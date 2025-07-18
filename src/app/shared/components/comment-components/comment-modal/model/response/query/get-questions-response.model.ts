import { Question } from '../../../../../../../shared/models/entities/question.model';

export interface GetQuestionsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Question[];
}
