import { z } from "zod";

const serverEnvSchema = z.object({
  CMS_PUBLIC_URL: z.url().default("http://localhost:3001"),
  MEILI_HOST: z.url().default("http://meilisearch:7700"),
  MEILI_MASTER_KEY: z.string().min(1).optional(),
  PAYLOAD_API_TOKEN: z.string().min(1).optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.url().default("http://localhost:3001"),
});

export const serverEnv = serverEnvSchema.parse({
  CMS_PUBLIC_URL: process.env.CMS_PUBLIC_URL,
  MEILI_HOST: process.env.MEILI_HOST,
  MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
  PAYLOAD_API_TOKEN: process.env.PAYLOAD_API_TOKEN,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
});

