import {
  ContentType,
  LessonMaterialStatus,
  LessonMaterialVisibility,
} from '../../../enum/lesson-material.enum';

export interface GetLessonMaterialsRequest {
  schoolId?: number;
  classId?: string;
  folderId?: string;
  createdByUserId?: string;
  tag?: string;
  contentType?: ContentType;
  lessonStatus?: LessonMaterialStatus;
  visibility?: LessonMaterialVisibility;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
