import { registerAs } from "@nestjs/config";
import {
  coreConfigSchema,
  corsConfigSchema,
  databaseConfigSchema,
  authConfigSchema,
  securityConfigSchema,
  storageConfigSchema,
  emailConfigSchema,
  revalidationConfigSchema,
  cacheConfigSchema,
  searchConfigSchema,
  antivirusConfigSchema,
  aiConfigSchema,
} from "./config.schemas.js";

export const coreConfig = registerAs("core", () => {
  const parsed = coreConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Core config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const corsConfig = registerAs("cors", () => {
  const parsed = corsConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`CORS config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const databaseConfig = registerAs("database", () => {
  const parsed = databaseConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Database config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const authConfig = registerAs("auth", () => {
  const parsed = authConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Auth config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const securityConfig = registerAs("security", () => {
  const parsed = securityConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Security config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const storageConfig = registerAs("storage", () => {
  const parsed = storageConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Storage config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const emailConfig = registerAs("email", () => {
  const parsed = emailConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Email config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const revalidationConfig = registerAs("revalidation", () => {
  const parsed = revalidationConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Revalidation config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const cacheConfig = registerAs("cache", () => {
  const parsed = cacheConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Cache config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const searchConfig = registerAs("search", () => {
  const parsed = searchConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Search config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const antivirusConfig = registerAs("antivirus", () => {
  const parsed = antivirusConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Antivirus config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});

export const aiConfig = registerAs("ai", () => {
  const parsed = aiConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`AI config validation failed: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
});
