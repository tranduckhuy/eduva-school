export interface GetTeacherClassRequest {
  classId?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
