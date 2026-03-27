import { Injectable } from "@nestjs/common";
import { RateLimitRepository } from "./rate-limit.repository.js";
import { RATE_LIMIT_CONFIGS, type RateLimitEndpoint } from "./rate-limit.schemas.js";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

@Injectable()
export class RateLimitService {
  constructor(private readonly repository: RateLimitRepository) {}

  async checkLimit(key: string, endpoint: RateLimitEndpoint): Promise<RateLimitResult> {
    const config = RATE_LIMIT_CONFIGS[endpoint];
    
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (config.windowSeconds * 1000)) * config.windowSeconds * 1000,
    );
    const expiresAt = new Date(windowStart.getTime() + config.windowSeconds * 1000);

    const record = await this.repository.getOrCreateRecord(key, endpoint, windowStart, expiresAt);

    const allowed = record.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - record.count);

    return {
      allowed,
      remaining,
      resetAt: expiresAt,
    };
  }

  async getRemainingQuota(key: string, endpoint: RateLimitEndpoint): Promise<number> {
    const config = RATE_LIMIT_CONFIGS[endpoint];
    
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (config.windowSeconds * 1000)) * config.windowSeconds * 1000,
    );

    const record = await this.repository.getRecord(key, endpoint, windowStart);
    
    if (!record) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - record.count);
  }

  async cleanupExpired() {
    return this.repository.deleteExpired();
  }
}
