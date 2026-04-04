const defaultEnv: Record<string, string> = {
  NODE_ENV: "test",
  PMTL_APP_ENV: "dev",
  API_PORT: "3001",
  API_BASE_URL: "http://127.0.0.1:3001/api",
  API_INTERNAL_URL: "http://127.0.0.1:3001/api",
  WEB_ORIGIN: "http://127.0.0.1:5173",
  ADMIN_ORIGIN: "http://127.0.0.1:4173",
  DATABASE_URL: "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl_test",
  DATABASE_DIRECT_URL: "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl_test",
  JWT_ACCESS_SECRET: "test-access-secret-test-access-secret-test-access-secret-123",
  JWT_REFRESH_SECRET: "test-refresh-secret-test-refresh-secret-test-refresh-secret-123",
  ACCESS_TOKEN_TTL_MINUTES: "15",
  REFRESH_TOKEN_TTL_DAYS: "30",
  CSRF_SECRET: "test-csrf-secret-test-csrf-secret-test-csrf-secret-123",
  COOKIE_DOMAIN: "127.0.0.1",
  COOKIE_SECURE: "false",
  STORAGE_ADAPTER: "local",
  LOCAL_STORAGE_ROOT: "C:/Users/ADMIN/DEV2/PMTL_VN/tmp/test-media",
  PUBLIC_MEDIA_BASE_URL: "http://127.0.0.1:3001/media",
  MAX_AVATAR_MB: "5",
  MAX_IMAGE_MB: "10",
  MAX_DOCUMENT_MB: "25",
  MAX_VIDEO_MB: "100",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_SECURE: "false",
  SMTP_USER: "test",
  SMTP_PASS: "test",
  SMTP_FROM_NAME: "PMTL_VN Test",
  SMTP_FROM_EMAIL: "test@pmtl.local",
  EMAIL_HASH_SALT: "test-email-hash-salt-12345",
  REVALIDATE_SECRET: "test-revalidate-secret-test-revalidate-secret-123",
  NEXT_REVALIDATE_URL: "http://127.0.0.1:5173/api/revalidate",
};

for (const [key, value] of Object.entries(defaultEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
