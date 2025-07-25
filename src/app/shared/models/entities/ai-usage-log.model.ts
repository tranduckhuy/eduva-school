import { type LessonGenerationType } from '../enum/lesson-generation-type.enum';

export interface AiUsageLog {
  id: string;
  userId: string;
  aiServiceType: LessonGenerationType;
  durationMinutes: number;
  creditsCharged: number;
  createdAt: string;
}
