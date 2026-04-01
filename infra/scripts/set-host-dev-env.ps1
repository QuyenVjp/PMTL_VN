Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$mediaRoot = Join-Path $repoRoot "tmp/runtime/media"

New-Item -ItemType Directory -Force -Path $mediaRoot | Out-Null

$hostEnv = @{
  NODE_ENV = "development"
  PMTL_APP_ENV = "dev"
  API_PORT = "3001"
  API_BASE_URL = "http://127.0.0.1:3001/api"
  API_INTERNAL_URL = "http://127.0.0.1:3001/api"
  WEB_ORIGIN = "http://127.0.0.1:3000"
  ADMIN_ORIGIN = "http://127.0.0.1:3002"
  NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000"
  NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:3001"
  NEXT_PUBLIC_MEDIA_BASE_URL = "http://127.0.0.1:3001/media"
  VITE_API_BASE_URL = "http://127.0.0.1:3001"
  VITE_ADMIN_URL = "http://127.0.0.1:3002"
  DATABASE_URL = "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl"
  DATABASE_DIRECT_URL = "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl"
  JWT_ACCESS_SECRET = "dev-access-secret-12345678901234567890"
  JWT_REFRESH_SECRET = "dev-refresh-secret-12345678901234567890"
  ACCESS_TOKEN_TTL_MINUTES = "15"
  REFRESH_TOKEN_TTL_DAYS = "30"
  CSRF_SECRET = "dev-csrf-secret-1234567890123456789012"
  COOKIE_DOMAIN = ""
  COOKIE_SECURE = "false"
  STORAGE_ADAPTER = "local"
  LOCAL_STORAGE_ROOT = $mediaRoot
  PUBLIC_MEDIA_BASE_URL = "http://127.0.0.1:3001/media"
  MAX_AVATAR_MB = "5"
  MAX_IMAGE_MB = "10"
  MAX_DOCUMENT_MB = "25"
  MAX_VIDEO_MB = "100"
  SMTP_HOST = "localhost"
  SMTP_PORT = "587"
  SMTP_SECURE = "false"
  SMTP_USER = "dev"
  SMTP_PASS = "dev"
  SMTP_FROM_NAME = "PMTL_VN"
  SMTP_FROM_EMAIL = "noreply@example.com"
  EMAIL_HASH_SALT = "1234567890abcdef"
  LOG_LEVEL = "info"
  REQUEST_ID_HEADER = "x-request-id"
  REVALIDATE_SECRET = "revalidate-secret-12345678901234567890"
  NEXT_REVALIDATE_URL = "http://127.0.0.1:3000/api/revalidate"
  VALKEY_URL = "redis://127.0.0.1:6379"
  MEILISEARCH_URL = "http://127.0.0.1:7700"
  MEILISEARCH_API_KEY = "YSc9DR7IjNACcdDcwtk1oZ1jL7TZ4OirvIW0Xu2To9U="
  SEARCH_ENGINE = "meilisearch"
  SEED_ADMIN_ENABLED = "true"
  SEED_ADMIN_EMAIL = "admin@pmtl.local"
  SEED_ADMIN_PASSWORD = "PmtlAdmin!123"
  SEED_ADMIN_DISPLAY_NAME = "PMTL Admin"
  SEED_ADMIN_ROLE = "SUPER_ADMIN"
  # Encryption key for EncryptionService — min 32 chars, dev-only value
  ENCRYPTION_MASTER_KEY = "dev-encryption-master-key-1234567890ab"
}

foreach ($entry in $hostEnv.GetEnumerator()) {
  Set-Item -Path "Env:$($entry.Key)" -Value $entry.Value
}
