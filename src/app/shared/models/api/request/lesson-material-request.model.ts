import { ContentType } from '../../enum/content-type.enum';

export interface LessonMaterialRequest {
  title: string;
  description?: string;
  tag?: string;
  contentType: ContentType;
  duration: number;
  fileSize: number;
  isAIContent: boolean;
  sourceUrl: string;
  folderId: number;
}
