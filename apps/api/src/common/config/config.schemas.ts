import { z } from "zod";

// Core API config schema
export const coreConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PMTL_APP_ENV: z.enum(["dev", "staging", "prod"]).default("dev"),
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_BASE_URL: z.string().url(),
  API_INTERNAL_URL: z.string().url(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  REQUEST_ID_HEADER: z.string().default("x-request-id"),
});

// CORS config schema
export const corsConfigSchema = z.object({
  WEB_ORIGIN: z.string().url(),
  ADMIN_ORIGIN: z.string().url(),
});

// Database config schema
export const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_DIRECT_URL: z.string().optional(),
});

// Auth config schema
export const authConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

// Security config schema
export const securityConfigSchema = z.object({
  CSRF_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string(),
  COOKIE_SECURE: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(true),
});

// Storage config schema
export const storageConfigSchema = z.object({
  STORAGE_ADAPTER: z.enum(["local", "r2"]).default("local"),
  LOCAL_STORAGE_ROOT: z.string().optional(),
  PUBLIC_MEDIA_BASE_URL: z.string().url(),
  MAX_AVATAR_MB: z.coerce.number().positive().default(5),
  MAX_IMAGE_MB: z.coerce.number().positive().default(10),
  MAX_DOCUMENT_MB: z.coerce.number().positive().default(25),
  MAX_VIDEO_MB: z.coerce.number().positive().default(100),
});

// Email config schema
export const emailConfigSchema = z.object({
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(false),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_FROM_EMAIL: z.string().email(),
  EMAIL_HASH_SALT: z.string().min(16),
});

// Web revalidation config
export const revalidationConfigSchema = z.object({
  REVALIDATE_SECRET: z.string().min(32),
  NEXT_REVALIDATE_URL: z.string().url().optional(),
});

// Cache/Redis config schema
export const cacheConfigSchema = z.object({
  VALKEY_URL: z.string().url().optional(),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

// Search config schema
export const searchConfigSchema = z.object({
  SEARCH_ENGINE: z.enum(["meilisearch", "sql"]).default("meilisearch"),
  MEILI_HOST: z.string().url().default("http://127.0.0.1:7700"),
  MEILI_API_KEY: z.string().optional(),
  MEILI_INDEX_PREFIX: z.string().default("pmtl_"),
  SEARCH_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
  SEARCH_SQL_FALLBACK_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(true),
});

// Antivirus config schema
export const antivirusConfigSchema = z.object({
  CLAMAV_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(false),
  CLAMAV_HOST: z.string().default("127.0.0.1"),
  CLAMAV_PORT: z.coerce.number().int().positive().default(3310),
  CLAMAV_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

// Combined env schema for validation
export const envSchema = z.object({
  ...coreConfigSchema.shape,
  ...corsConfigSchema.shape,
  ...databaseConfigSchema.shape,
  ...authConfigSchema.shape,
  ...securityConfigSchema.shape,
  ...storageConfigSchema.shape,
  ...emailConfigSchema.shape,
  ...revalidationConfigSchema.shape,
  ...cacheConfigSchema.shape,
  ...searchConfigSchema.shape,
  ...antivirusConfigSchema.shape,
});

export type EnvConfig = z.infer<typeof envSchema>;
