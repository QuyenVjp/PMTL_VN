import { z } from "zod";

const serverEnvSchema = z.object({
  MEILI_HOST: z.url().default("http://meilisearch:7700"),
  MEILI_MASTER_KEY: z.string().min(1).optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.url().default("http://localhost:3001"),
});

export const serverEnv = serverEnvSchema.parse({
  MEILI_HOST: process.env.MEILI_HOST,
  MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
});

