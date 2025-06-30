export interface EntityListResponse<T> {
  count: number;
  data: T[];
  page?: number;
  pageSize?: number;
}
