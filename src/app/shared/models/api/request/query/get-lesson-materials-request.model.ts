import { type EntityStatus } from '../../../enum/entity-status.enum';
import {
  type ContentType,
  type LessonMaterialStatus,
} from '../../../enum/lesson-material.enum';

export interface GetLessonMaterialsRequest {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  lessonStatus?: LessonMaterialStatus;
  status?: EntityStatus;
}

export interface GetPersonalLessonMaterialsRequest {
  entityStatus?: EntityStatus;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPagingEnabled?: boolean;
}

export interface GetPendingLessonMaterialsRequest {
  contentType?: ContentType;
  classId?: string;
  folderId?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPagingEnabled?: boolean;
}

export interface GetSharedLessonMaterialsRequest {
  createdByUser?: string;
  contentType?: ContentType;
  entityStatus?: EntityStatus;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPagingEnabled?: boolean;
}

export interface GetClassLessonMaterialsRequest {
  status?: EntityStatus;
  lessonStatus?: LessonMaterialStatus;
}
