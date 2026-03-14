import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  CMS_PUBLIC_URL: z.url().default("http://localhost:3001"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CMS_PUBLIC_URL: process.env.CMS_PUBLIC_URL,
});

