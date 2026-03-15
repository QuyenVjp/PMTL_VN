const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_EMBEDDING_DIMENSIONS = 1536;

function getSemanticEmbeddingConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL,
    dimensions: Number(process.env.MEILI_SEMANTIC_DIMENSIONS ?? DEFAULT_EMBEDDING_DIMENSIONS),
    embedder: process.env.MEILI_SEMANTIC_EMBEDDER?.trim() || "default",
  };
}

export function isSemanticEmbeddingEnabled(): boolean {
  return getSemanticEmbeddingConfig() !== null;
}

export function getSemanticEmbedderName(): string {
  return getSemanticEmbeddingConfig()?.embedder ?? "default";
}

export function getSemanticEmbeddingDimensions(): number {
  return getSemanticEmbeddingConfig()?.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
}

export async function generateSemanticEmbedding(input: string): Promise<number[] | null> {
  const config = getSemanticEmbeddingConfig();
  const text = input.trim();

  if (!config || !text) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: text,
      dimensions: config.dimensions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  const embedding = payload.data?.[0]?.embedding;
  return Array.isArray(embedding) ? embedding : null;
}
