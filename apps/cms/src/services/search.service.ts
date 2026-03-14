import type { ContentDocument } from "./types";
import { syncSearchDocument } from "@/integrations/meilisearch/sync-document";

export async function syncPostSearch(document: ContentDocument): Promise<void> {
  await syncSearchDocument("posts", {
    id: document.id,
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    type: "post",
  });
}

export async function syncEventSearch(document: ContentDocument): Promise<void> {
  await syncSearchDocument("events", {
    id: document.id,
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    type: "event",
  });
}

