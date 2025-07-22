export interface GetAiJobCompletedRequest {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPagingEnabled?: boolean;
}
