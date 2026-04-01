/**
 * NestCacheModule — @nestjs/cache-manager v3 global cache registration.
 *
 * Uses cache-manager v6 (keyv-based) with @keyv/redis for Redis backend.
 * Falls back to in-memory (no Redis URL configured) for local dev.
 * TTL default: 300s. Key prefix: "pmtl:".
 *
 * Note: coexists with the custom CacheService (apps/api/src/common/cache/).
 * Use @Cache() decorator on controller methods for auto-caching.
 * Use CacheService directly for manual cache operations with fine-grained control.
 */
import { Module, Global } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Keyv from "keyv";
import { createKeyv } from "@keyv/redis";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const valkeyUrl = config.get<string>("VALKEY_URL");
        const ttlMs = (config.get<number>("CACHE_TTL_SECONDS") ?? 300) * 1000;

        if (valkeyUrl) {
          return {
            ttl: ttlMs,
            stores: [
              new Keyv({
                store: createKeyv(valkeyUrl),
                namespace: "pmtl",
                ttl: ttlMs,
              }),
            ],
          };
        }

        // In-memory store (local dev without Redis) — Keyv() with no store arg uses Map
        return {
          ttl: ttlMs,
          stores: [new Keyv({ namespace: "pmtl", ttl: ttlMs })],
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class NestCacheModule {}
