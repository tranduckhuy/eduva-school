export interface GetCreditPacksRequest {
  activeOnly?: boolean;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
