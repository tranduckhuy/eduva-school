import { type LessonMaterial } from '../../../entities/lesson-material.model';

export interface GetPagingLessonMaterialsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: LessonMaterial[];
}

export interface GetClassLessonMaterialsResponse {
  id: string;
  name: string;
  countLessonMaterials: number;
  lessonMaterials: LessonMaterial[];
}
