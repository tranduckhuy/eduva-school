import { PeriodType } from '../../../enum/period-type.enum';

export interface DashboardRequest {
  startDate?: string;
  endDate?: string;
  lessonActivityPeriod?: PeriodType;
  lessonStatusPeriod?: PeriodType;
  contentTypePeriod?: PeriodType;
  questionVolumePeriod?: PeriodType;
  reviewLessonsLimit?: number;
  topTeachersLimit?: number;
  recentLessonsLimit?: number;
  unAnswerQuestionsLimit?: number;
}
