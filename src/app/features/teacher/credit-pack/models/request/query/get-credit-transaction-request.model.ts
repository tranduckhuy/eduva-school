export interface GetCreditTransactionRequest {
  userId?: string;
  aiCreditPackId?: number;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}
