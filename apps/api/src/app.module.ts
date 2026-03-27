import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

// Common modules
import { ConfigModule } from "./common/config/config.module.js";
import { CacheModule } from "./common/cache/cache.module.js";
import { LoggerModule } from "./common/logging/logger.module.js";
import { ValidationModule } from "./common/validation/validation.module.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import { AuthGuard } from "./common/auth/auth.guard.js";

// Platform modules
import { HealthModule } from "./platform/health/health.module.js";
import { MetricsModule } from "./platform/metrics/metrics.module.js";
import { AuditModule } from "./platform/audit/audit.module.js";
import { FeatureFlagsModule } from "./platform/feature-flags/feature-flags.module.js";
import { RateLimitModule } from "./platform/rate-limit/rate-limit.module.js";
import { StorageModule } from "./platform/storage/storage.module.js";
import { SessionsModule } from "./platform/sessions/sessions.module.js";

// Domain modules
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
    // Common
    ConfigModule,
    CacheModule,
    LoggerModule,
    ValidationModule,
    PrismaModule,

    // Platform
    HealthModule,
    MetricsModule,
    AuditModule,
    FeatureFlagsModule,
    RateLimitModule,
    StorageModule,
    SessionsModule,

    // Domain (11 modules — maps 1:1 with design/03-domains/)
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
