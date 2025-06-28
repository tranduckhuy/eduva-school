import { LessonMaterial } from '../../../entities/lesson-material.model';

export interface GetLessonMaterialsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: LessonMaterial[];
}
