export interface GetAiUsageLogsRequest {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  isPagingEnabled?: boolean;
}
