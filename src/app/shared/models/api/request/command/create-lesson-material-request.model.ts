import { ContentType } from '../../../enum/lesson-material.enum';

export interface CreateLessonMaterialRequest {
  title: string;
  description?: string;
  contentType: ContentType;
  duration: number;
  fileSize: number;
  isAIContent: boolean;
  sourceUrl: string;
}

export interface CreateLessonMaterialsRequest {
  folderId: string;
  blobNames: string[];
  lessonMaterials: CreateLessonMaterialRequest[];
}
