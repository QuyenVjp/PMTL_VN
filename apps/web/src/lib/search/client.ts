import { fetchJson } from "@/lib/api/fetch-json";
import { serverEnv } from "@/lib/env/server-env";

export type SearchResponse<T> = {
  hits: T[];
};

export async function searchIndex<T>(
  indexName: string,
  query: string,
): Promise<SearchResponse<T>> {
  const headers = serverEnv.MEILI_MASTER_KEY
    ? { Authorization: `Bearer ${serverEnv.MEILI_MASTER_KEY}` }
    : {};

  return fetchJson<SearchResponse<T>>(
    `${serverEnv.MEILI_HOST}/indexes/${indexName}/search`,
    {
      method: "POST",
      body: JSON.stringify({ q: query }),
      headers,
      cache: "no-store",
    },
  );
}
