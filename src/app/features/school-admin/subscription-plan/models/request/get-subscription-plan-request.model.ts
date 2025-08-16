export interface GetSubscriptionPlanRequest {
  activeOnly?: boolean;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  isPagingEnabled?: boolean;
}
