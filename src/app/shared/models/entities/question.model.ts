import { CommentEntity } from './comment.model';

export interface Question {
  id: string;
  lessonMaterialId: string;
  lessonMaterialTitle: string;
  title: string;
  content: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  commentCount: number;
  canUpdate: boolean;
  canDelete: boolean;
  canComment: boolean;
  comments: CommentEntity[];
}
