import { EntityStatus } from '../../../enum/entity-status.enum';
import {
  ContentType,
  LessonMaterialStatus,
} from '../../../enum/lesson-material.enum';

export interface GetLessonMaterialsRequest {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  lessonStatus?: LessonMaterialStatus;
  status?: EntityStatus;
}

export interface GetPendingLessonMaterialsRequest {
  tag?: string;
  contentType?: ContentType;
  classId?: string;
  folderId?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}

export interface GetSharedLessonMaterialsRequest {
  createdByUser?: string;
  tag?: string;
  contentType?: ContentType;
  entityStatus?: EntityStatus;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
