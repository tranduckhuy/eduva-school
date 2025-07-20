import { LessonMaterialVisibility } from '../../../enum/lesson-material.enum';

export interface UpdateLessonMaterialRequest {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  visibility?: LessonMaterialVisibility;
}
