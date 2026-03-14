import { searchQuerySchema, type SearchResultItem } from "@pmtl/shared";

import { fallbackSearchResults } from "../utils/fallback-results";

export function searchContent(query: string): SearchResultItem[] {
  const parsedQuery = searchQuerySchema.safeParse({ q: query });

  if (!parsedQuery.success) {
    return [];
  }

  return fallbackSearchResults.filter((item) =>
    `${item.title} ${item.excerpt}`.toLowerCase().includes(parsedQuery.data.q.toLowerCase()),
  );
}
