import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient } from "redis";
import { ConfigService } from "../config/config.service.js";

type InMemoryEntry = {
  value: string;
  expiresAt: number;
};

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, InMemoryEntry>();
  private redisClient: ReturnType<typeof createClient> | null = null;
  private redisConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.valkeyUrl;
    if (!redisUrl) {
      this.logger.warn("VALKEY_URL is not configured. Falling back to in-memory cache.");
      return;
    }

    try {
      const client = createClient({ url: redisUrl });
      client.on("error", (error: unknown) => {
        this.redisConnected = false;
        const reason = error instanceof Error ? error.message : "Unknown redis error";
        this.logger.error(`Redis error: ${reason}`);
      });
      client.on("ready", () => {
        this.redisConnected = true;
        this.logger.log("Redis cache ready.");
      });

      await client.connect();
      this.redisClient = client;
      this.redisConnected = true;
    } catch (error) {
      this.redisConnected = false;
      this.redisClient = null;
      const reason = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Redis connection failed (${reason}). Using in-memory cache.`);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
      this.redisConnected = false;
    }
    this.memoryCache.clear();
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (this.redisClient && this.redisConnected) {
      const raw = await this.redisClient.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    }

    const memory = this.memoryCache.get(key);
    if (!memory) return null;
    if (Date.now() > memory.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(memory.value) as T;
  }

  async setJson(key: string, value: unknown, ttlSeconds = this.configService.cacheTtlSeconds): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.redisClient && this.redisConnected) {
      await this.redisClient.setEx(key, ttlSeconds, serialized);
      return;
    }

    this.memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.redisClient && this.redisConnected) {
      await this.redisClient.del(key);
      return;
    }
    this.memoryCache.delete(key);
  }

  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    await this.setJson(key, fresh, ttlSeconds);
    return fresh;
  }
}
