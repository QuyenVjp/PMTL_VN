import { meilisearchClient } from "./client";
import {
  generateSemanticEmbedding,
  getSemanticEmbedderName,
  getSemanticEmbeddingDimensions,
  isSemanticEmbeddingEnabled,
} from "./semantic-embeddings";

type SearchDocument = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  type: "post" | "event";
  semanticText?: string;
  [key: string]: unknown;
};

const ensuredIndexes = new Set<string>();

async function ensureSearchIndex(indexName: string): Promise<void> {
  if (!meilisearchClient || ensuredIndexes.has(indexName)) {
    return;
  }

  await meilisearchClient.index(indexName).updateSettings({
    filterableAttributes: ["type", "topicSlug", "tagSlugs", "publishedAt", "featured"],
    sortableAttributes: ["publishedAt", "views"],
    searchableAttributes: [
      "title",
      "excerpt",
      "contentPlainText",
      "semanticText",
      "semanticHints",
      "normalizedSearchText",
      "sourceRef",
      "topic",
      "tags",
    ],
    ...(isSemanticEmbeddingEnabled()
      ? {
          embedders: {
            [getSemanticEmbedderName()]: {
              source: "userProvided",
              dimensions: getSemanticEmbeddingDimensions(),
            },
          },
        }
      : {}),
  });

  ensuredIndexes.add(indexName);
}

export async function syncSearchDocument(
  indexName: string,
  document: SearchDocument,
): Promise<void> {
  if (!meilisearchClient) {
    return;
  }

  await ensureSearchIndex(indexName);

  const normalizedDocument = {
    ...document,
    id: document.id.toString(),
    excerpt: document.excerpt ?? "",
  } as SearchDocument & {
    _vectors?: Record<string, number[]>;
  };

  if (isSemanticEmbeddingEnabled() && typeof document.semanticText === "string" && document.semanticText.trim()) {
    try {
      const embedding = await generateSemanticEmbedding(document.semanticText);

      if (embedding) {
        normalizedDocument._vectors = {
          [getSemanticEmbedderName()]: embedding,
        };
      }
    } catch (error) {
      console.error("[Meilisearch] Failed to generate semantic embedding:", error);
    }
  }

  await meilisearchClient.index(indexName).addDocuments([normalizedDocument], {
    primaryKey: "id",
  });
}

