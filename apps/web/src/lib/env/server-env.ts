import { z } from "zod";

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim() ? value : undefined;
}

const serverEnvSchema = z.object({
  CMS_PUBLIC_URL: z.url().default("http://localhost:3001"),
  MEILI_HOST: z.url().default("http://meilisearch:7700"),
  MEILI_MASTER_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  CMS_API_TOKEN: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export const serverEnv = serverEnvSchema.parse({
  CMS_PUBLIC_URL: process.env.CMS_PUBLIC_URL,
  MEILI_HOST: process.env.MEILI_HOST,
  MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
  CMS_API_TOKEN: process.env.CMS_API_TOKEN,
});

