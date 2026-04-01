/**
 * AppModule — Root composition shell
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 *
 * Pipeline order enforced via provider registration:
 *   1. RequestIdMiddleware (via NestModule.configure)
 *   2. pino-http (via LoggerModule — genReqId reads X-Request-Id)
 *   3. helmet (via main.ts — transport concern)
 *   4. AuthGuard (APP_GUARD #1 — authn)
 *   5. RolesGuard (APP_GUARD #2 — authz after authn)
 *   6. RateLimitGuard (APP_GUARD #3 — per-route metadata)
 *   6b. CsrfGuard (APP_GUARD #4 — double-submit cookie CSRF)
 *   7. ZodValidationPipe (APP_PIPE — boundary validation)
 *   8. Controller → Service (thin controller calls service)
 *   9. ResponseInterceptor (APP_INTERCEPTOR — success envelope)
 *  10. GlobalExceptionFilter (APP_FILTER — error envelope canon)
 *
 * All global concerns registered via APP_* providers, NOT app.useGlobal*().
 */
import { Module, type NestModule, type MiddlewareConsumer } from "@nestjs/common";
import { APP_GUARD, APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

// Common modules
import { ConfigModule } from "./common/config/config.module.js";
import { CacheModule } from "./common/cache/cache.module.js";
import { LoggerModule } from "./common/logging/logger.module.js";
import { ValidationModule } from "./common/validation/validation.module.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import { EncryptionModule } from "./common/encryption/encryption.module.js";
import { TracingModule } from "./common/tracing/tracing.module.js";
import { ResilienceModule } from "./common/resilience/resilience.module.js";
import { NestCacheModule } from "./common/nestcache/nest-cache.module.js";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./common/auth/strategies/jwt.strategy.js";
import { QueueModule } from "./platform/queue/queue.module.js";

// Common global concerns — registered via providers for DI
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware.js";
import { AuthGuard } from "./common/auth/auth.guard.js";
import { RolesGuard } from "./common/auth/roles.guard.js";
import { RateLimitGuard } from "./platform/rate-limit/rate-limit.guard.js";
import { CsrfGuard } from "./platform/csrf/csrf.guard.js";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { GlobalExceptionFilter } from "./common/errors/global-exception.filter.js";

// Platform modules
import { HealthModule } from "./platform/health/health.module.js";
import { MetricsModule } from "./platform/metrics/metrics.module.js";
import { AuditModule } from "./platform/audit/audit.module.js";
import { FeatureFlagsModule } from "./platform/feature-flags/feature-flags.module.js";
import { RateLimitModule } from "./platform/rate-limit/rate-limit.module.js";
import { StorageModule } from "./platform/storage/storage.module.js";
import { SessionsModule } from "./platform/sessions/sessions.module.js";
import { WebhookModule } from "./platform/webhook/webhook.module.js";
import { AdminSystemModule } from "./platform/admin-system/admin-system.module.js";

// Domain modules (11 — maps 1:1 with design/03-domains/)
import { IdentityModule } from "./modules/identity/identity.module.js";
import { ContentModule } from "./modules/content/content.module.js";
import { ModerationModule } from "./modules/moderation/moderation.module.js";
import { CommunityModule } from "./modules/community/community.module.js";
import { EngagementModule } from "./modules/engagement/engagement.module.js";
import { SearchModule } from "./modules/search/search.module.js";
import { CalendarModule } from "./modules/calendar/calendar.module.js";
import { NotificationModule } from "./modules/notification/notification.module.js";
import { ContactModule } from "./modules/contact/contact.module.js";
import { VowsMeritModule } from "./modules/vows-merit/vows-merit.module.js";
import { WisdomQaModule } from "./modules/wisdom-qa/wisdom-qa.module.js";

@Module({
  imports: [
    // ── Common ──────────────────────────────────────
    ConfigModule,
    EncryptionModule,
    TracingModule,
    ResilienceModule,
    NestCacheModule,
    CacheModule,
    LoggerModule,
    ValidationModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),

    // ── Platform ────────────────────────────────────
    QueueModule,
    HealthModule,
    MetricsModule,
    AuditModule,
    FeatureFlagsModule,
    RateLimitModule,
    StorageModule,
    SessionsModule,
    WebhookModule,
    AdminSystemModule,

    // ── Domain (11 modules — design/03-domains/) ────
    IdentityModule,
    ContentModule,
    ModerationModule,
    CommunityModule,
    EngagementModule,
    SearchModule,
    CalendarModule,
    NotificationModule,
    ContactModule,
    VowsMeritModule,
    WisdomQaModule,
  ],
  providers: [
    // Passport JWT strategy — validates tokens for AuthGuard
    JwtStrategy,

    // Guard chain: authn → authz → rate-limit → csrf (order matters)
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },

    // Boundary validation authority — Zod, NOT class-validator
    { provide: APP_PIPE, useClass: ZodValidationPipe },

    // Success envelope — wraps all responses in { data, meta }
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

    // Error envelope authority — canon format { error: { code, message, status, requestId } }
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Position #1: Request-ID correlation for all routes
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
