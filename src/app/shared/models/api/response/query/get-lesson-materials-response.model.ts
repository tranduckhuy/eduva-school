import { LessonMaterial } from '../../../entities/lesson-material.model';

export interface GetPagingLessonMaterialsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: LessonMaterial[];
}
