import type { ContentDocument } from "./types";
import { syncSearchDocument } from "@/integrations/meilisearch/sync-document";

export async function syncPostSearch(
  document: ContentDocument,
  _: unknown,
): Promise<void> {
  await syncSearchDocument("posts", {
    ...document,
    excerpt: document.excerpt ?? "",
    type: "post",
  });
}

export async function syncEventSearch(
  document: ContentDocument,
  _: unknown,
): Promise<void> {
  await syncSearchDocument("events", {
    ...document,
    excerpt: document.excerpt ?? "",
    type: "event",
  });
}

