import { createHash } from "node:crypto";
import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import {
  coreConfig,
  corsConfig,
  databaseConfig,
  authConfig,
  securityConfig,
  storageConfig,
  emailConfig,
  monitoringConfig,
  revalidationConfig,
  cacheConfig,
  searchConfig,
  antivirusConfig,
  aiConfig,
} from "./config.namespaces.js";

@Injectable()
export class ConfigService {
  constructor(
    @Inject(coreConfig.KEY)
    private readonly core: ConfigType<typeof coreConfig>,
    @Inject(corsConfig.KEY)
    private readonly cors: ConfigType<typeof corsConfig>,
    @Inject(databaseConfig.KEY)
    private readonly database: ConfigType<typeof databaseConfig>,
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
    @Inject(securityConfig.KEY)
    private readonly security: ConfigType<typeof securityConfig>,
    @Inject(storageConfig.KEY)
    private readonly storage: ConfigType<typeof storageConfig>,
    @Inject(emailConfig.KEY)
    private readonly email: ConfigType<typeof emailConfig>,
    @Inject(monitoringConfig.KEY)
    private readonly monitoring: ConfigType<typeof monitoringConfig>,
    @Inject(revalidationConfig.KEY)
    private readonly revalidation: ConfigType<typeof revalidationConfig>,
    @Inject(cacheConfig.KEY)
    private readonly cache: ConfigType<typeof cacheConfig>,
    @Inject(searchConfig.KEY)
    private readonly search: ConfigType<typeof searchConfig>,
    @Inject(antivirusConfig.KEY)
    private readonly antivirus: ConfigType<typeof antivirusConfig>,
    @Inject(aiConfig.KEY)
    private readonly ai: ConfigType<typeof aiConfig>,
  ) {}

  // Core
  get nodeEnv() {
    return this.core.NODE_ENV;
  }
  get appEnv() {
    return this.core.PMTL_APP_ENV;
  }
  get apiPort() {
    return this.core.API_PORT;
  }
  get apiBaseUrl() {
    return this.core.API_BASE_URL;
  }
  get apiInternalUrl() {
    return this.core.API_INTERNAL_URL;
  }
  get logLevel() {
    return this.core.LOG_LEVEL;
  }
  get requestIdHeader() {
    return this.core.REQUEST_ID_HEADER;
  }
  get isProduction() {
    return this.core.NODE_ENV === "production";
  }
  get isDevelopment() {
    return this.core.NODE_ENV === "development";
  }

  // CORS
  get webOrigin() {
    return this.cors.WEB_ORIGIN;
  }
  get adminOrigin() {
    return this.cors.ADMIN_ORIGIN;
  }

  // Database
  get databaseUrl() {
    return this.database.DATABASE_URL;
  }
  get databaseDirectUrl() {
    return this.database.DATABASE_DIRECT_URL;
  }

  // Auth
  get jwtAccessSecret() {
    return this.auth.JWT_ACCESS_SECRET;
  }
  get jwtRefreshSecret() {
    return this.auth.JWT_REFRESH_SECRET;
  }
  get accessTokenTtlMinutes() {
    return this.auth.ACCESS_TOKEN_TTL_MINUTES;
  }
  get refreshTokenTtlDays() {
    return this.auth.REFRESH_TOKEN_TTL_DAYS;
  }

  // Security
  get csrfSecret() {
    return this.security.CSRF_SECRET;
  }
  get cookieDomain() {
    return this.security.COOKIE_DOMAIN;
  }
  get cookieSecure() {
    return this.security.COOKIE_SECURE;
  }
  /**
   * Salt for one-way hashing of client IPs in audit logs.
   * Prefer explicit AUDIT_IP_SALT; otherwise derive from CSRF_SECRET so no
   * committed static fallback string is required.
   */
  get auditIpSalt(): string {
    if (this.security.AUDIT_IP_SALT) return this.security.AUDIT_IP_SALT;
    // Derive from CSRF_SECRET so no committed static fallback is required.
    // Rotating CSRF_SECRET intentionally rotates IP hashes.
    return createHash("sha256").update(`${this.security.CSRF_SECRET}:audit-ip-salt`, "utf8").digest("hex");
  }

  // Storage
  get storageAdapter() {
    return this.storage.STORAGE_ADAPTER;
  }
  get localStorageRoot() {
    return this.storage.LOCAL_STORAGE_ROOT;
  }
  get r2Bucket() {
    return this.storage.R2_BUCKET;
  }
  get r2Endpoint() {
    return this.storage.R2_ENDPOINT;
  }
  get r2Region() {
    return this.storage.R2_REGION;
  }
  get r2AccessKeyId() {
    return this.storage.R2_ACCESS_KEY_ID;
  }
  get r2SecretAccessKey() {
    return this.storage.R2_SECRET_ACCESS_KEY;
  }
  get r2ForcePathStyle() {
    return this.storage.R2_FORCE_PATH_STYLE;
  }
  get publicMediaBaseUrl() {
    return this.storage.PUBLIC_MEDIA_BASE_URL;
  }
  get maxAvatarMb() {
    return this.storage.MAX_AVATAR_MB;
  }
  get maxImageMb() {
    return this.storage.MAX_IMAGE_MB;
  }
  get maxDocumentMb() {
    return this.storage.MAX_DOCUMENT_MB;
  }
  get maxVideoMb() {
    return this.storage.MAX_VIDEO_MB;
  }
  get mediaRequireSignedUrl() {
    return this.storage.MEDIA_REQUIRE_SIGNED_URL;
  }
  get mediaSignedUrlSecret() {
    return this.storage.MEDIA_SIGNED_URL_SECRET;
  }

  // Email
  get emailProvider() {
    return this.email.EMAIL_PROVIDER;
  }
  get smtpHost() {
    return this.email.SMTP_HOST;
  }
  get smtpPort() {
    return this.email.SMTP_PORT;
  }
  get smtpSecure() {
    return this.email.SMTP_SECURE;
  }
  get smtpUser() {
    return this.email.SMTP_USER;
  }
  get smtpPass() {
    return this.email.SMTP_PASS;
  }
  get smtpFromName() {
    return this.email.SMTP_FROM_NAME;
  }
  get smtpFromEmail() {
    return this.email.SMTP_FROM_EMAIL;
  }
  get resendApiKey() {
    return this.email.RESEND_API_KEY;
  }
  get resendFromEmail() {
    return this.email.RESEND_FROM_EMAIL;
  }
  get emailHashSalt() {
    return this.email.EMAIL_HASH_SALT;
  }

  // Monitoring
  get sentryDsn() {
    return this.monitoring.SENTRY_DSN;
  }
  get sentryEnvironment() {
    return this.monitoring.SENTRY_ENVIRONMENT;
  }
  get sentryRelease() {
    return this.monitoring.SENTRY_RELEASE;
  }
  get sentryTracesSampleRate() {
    return this.monitoring.SENTRY_TRACES_SAMPLE_RATE;
  }
  get sentryProfilesSampleRate() {
    return this.monitoring.SENTRY_PROFILES_SAMPLE_RATE;
  }

  // Revalidation
  get revalidateSecret() {
    return this.revalidation.REVALIDATE_SECRET;
  }
  get nextRevalidateUrl() {
    return this.revalidation.NEXT_REVALIDATE_URL;
  }

  // Cache
  get valkeyUrl() {
    return this.cache.VALKEY_URL;
  }
  get cacheTtlSeconds() {
    return this.cache.CACHE_TTL_SECONDS;
  }

  // Search
  get searchEngine() {
    return this.search.SEARCH_ENGINE;
  }
  get meiliHost() {
    return this.search.MEILI_HOST;
  }
  get meiliApiKey() {
    return this.search.MEILI_API_KEY;
  }
  get meiliIndexPrefix() {
    return this.search.MEILI_INDEX_PREFIX;
  }
  get searchTimeoutMs() {
    return this.search.SEARCH_TIMEOUT_MS;
  }
  get searchSqlFallbackEnabled() {
    return this.search.SEARCH_SQL_FALLBACK_ENABLED;
  }

  // Antivirus
  get clamavEnabled() {
    return this.antivirus.CLAMAV_ENABLED;
  }
  get clamavHost() {
    return this.antivirus.CLAMAV_HOST;
  }
  get clamavPort() {
    return this.antivirus.CLAMAV_PORT;
  }
  get clamavTimeoutMs() {
    return this.antivirus.CLAMAV_TIMEOUT_MS;
  }

  // AI
  get geminiApiKey() {
    return this.ai.GEMINI_API_KEY;
  }
  get geminiModel() {
    return this.ai.GEMINI_MODEL;
  }
  get geminiTimeoutMs() {
    return this.ai.GEMINI_TIMEOUT_MS;
  }
}
