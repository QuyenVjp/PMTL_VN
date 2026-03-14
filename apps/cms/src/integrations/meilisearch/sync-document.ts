import { meilisearchClient } from "./client";

type SearchDocument = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  type: "post" | "event";
  [key: string]: unknown;
};

export async function syncSearchDocument(
  indexName: string,
  document: SearchDocument,
): Promise<void> {
  if (!meilisearchClient) {
    return;
  }

  const normalizedDocument = {
    ...document,
    id: document.id.toString(),
    excerpt: document.excerpt ?? "",
  };

  await meilisearchClient.index(indexName).addDocuments([normalizedDocument], {
    primaryKey: "id",
  });
}

