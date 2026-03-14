import { Meilisearch } from "meilisearch";

const meiliHost = process.env.MEILI_HOST;

export const meilisearchClient = meiliHost
  ? new Meilisearch({
      host: meiliHost,
      ...(process.env.MEILI_MASTER_KEY ? { apiKey: process.env.MEILI_MASTER_KEY } : {}),
    })
  : null;
