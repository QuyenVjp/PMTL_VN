import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

// Common modules
import { ConfigModule } from "./common/config/config.module.js";
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

@Module({
  imports: [
    // Common
    ConfigModule,
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

    // Domain
    IdentityModule,
    ContentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
