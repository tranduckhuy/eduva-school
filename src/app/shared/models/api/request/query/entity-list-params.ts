export interface EntityListParams {
  activeOnly?: boolean;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
