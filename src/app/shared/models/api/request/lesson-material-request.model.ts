import { ContentType } from '../../enum/content-type.enum';

export interface LessonMaterialRequest {
  title: string;
  description?: string;
  contentType: ContentType;
  tag?: string;
  duration: number;
  fileSize: number;
  isAIContent: boolean;
  sourceUrl: string;
}

export interface LessonMaterialsRequest {
  folderId: number;
  lessonMaterials: LessonMaterialRequest[];
}
