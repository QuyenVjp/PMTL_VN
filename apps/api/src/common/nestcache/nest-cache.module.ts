/**
 * NestCacheModule — @nestjs/cache-manager v3 global cache registration.
 *
 * Uses cache-manager's built-in in-memory store (no Keyv, no @keyv/redis).
 * TTL default: 300s. Key prefix handled per caller.
 *
 * WHY no Keyv/Redis here:
 *   @nestjs/cache-manager's cachingFactory wraps stores in `new CJS-Keyv(store)`.
 *   Our ESM dist imports Keyv via ESM; cache-manager loads Keyv via CJS.
 *   ESM class !== CJS class → instanceof check always fails → double-wrap crash
 *   (`_checkIterableAdapter: Cannot read opts.url of undefined`).
 *   Passing no `stores` bypasses cachingFactory entirely — cache-manager creates
 *   its own default in-memory cache with no Keyv involved.
 *
 * Redis-backed caching is CacheService's responsibility (apps/api/src/common/cache/).
 * Use @Cache() decorator for lightweight in-memory auto-caching on controller methods.
 * Use CacheService directly for fine-grained Redis cache operations.
 */
import { Module, Global } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const ttlMs = (config.get<number>("CACHE_TTL_SECONDS") ?? 300) * 1000;
        // No `stores` — cache-manager uses its own built-in in-memory cache.
        // This avoids the ESM/CJS Keyv instanceof mismatch crash entirely.
        return { ttl: ttlMs };
      },
      inject: [ConfigService],
    }),
  ],
})
export class NestCacheModule {}
