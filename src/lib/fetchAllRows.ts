import type { PostgrestError } from '@supabase/supabase-js';

/** PostgREST caps responses at this many rows per request (server `max_rows`). */
export const POSTGREST_MAX_ROWS = 1000;

interface FetchAllOptions {
  /** Rows per request. Must not exceed the server max_rows (1000). */
  pageSize?: number;
  /** Hard cap on total rows fetched. When reached, `truncated` is true. */
  maxRows?: number;
}

interface FetchAllResult<T> {
  data: T[];
  error: PostgrestError | null;
  /** True when `maxRows` was reached and more rows may exist. */
  truncated: boolean;
}

/**
 * Fetches every row of a query by paging with `.range()`. PostgREST silently
 * truncates single responses at max_rows, so unbounded lists must page.
 *
 * `buildQuery(from, to)` must return a fresh query with a deterministic
 * `.order(...)` (include a unique tie-breaker such as `id`) and `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  buildQuery: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
  { pageSize = POSTGREST_MAX_ROWS, maxRows = Number.POSITIVE_INFINITY }: FetchAllOptions = {}
): Promise<FetchAllResult<T>> {
  const size = Math.min(pageSize, POSTGREST_MAX_ROWS);
  const rows: T[] = [];

  while (rows.length < maxRows) {
    const from = rows.length;
    const to = Math.min(from + size, maxRows) - 1;
    const { data, error } = await buildQuery(from, to);
    if (error) return { data: rows, error, truncated: false };

    const page = data ?? [];
    rows.push(...page);
    // A short page means we've reached the end
    if (page.length < to - from + 1) return { data: rows, error: null, truncated: false };
  }

  return { data: rows, error: null, truncated: true };
}
