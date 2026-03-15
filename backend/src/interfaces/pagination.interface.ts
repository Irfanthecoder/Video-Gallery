export interface PaginationParams {
  limit?: unknown;
  offset?: unknown;
}

export interface NormalizedPagination {
  limit: number;
  offset: number;
}
