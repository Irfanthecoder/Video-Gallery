import { DEFAULT_LIST_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants/index.js";
import type { PaginationParams, NormalizedPagination } from "../interfaces/index.js";

export type { PaginationParams, NormalizedPagination } from "../interfaces/index.js";

/** Normalizes pagination parameters */
export function normalizePagination(params: PaginationParams): NormalizedPagination {
  const limit = Math.min(
    Math.max(1, Number(params.limit) || DEFAULT_LIST_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const offset = Math.max(0, Number(params.offset) || 0);
  return { limit, offset };
}
