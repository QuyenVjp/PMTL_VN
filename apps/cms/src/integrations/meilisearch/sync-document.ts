import { meilisearchClient } from "./client";

type SearchDocument = {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  type: "post" | "event";
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
  };

  await meilisearchClient.index(indexName).addDocuments([normalizedDocument], {
    primaryKey: "id",
  });
}

