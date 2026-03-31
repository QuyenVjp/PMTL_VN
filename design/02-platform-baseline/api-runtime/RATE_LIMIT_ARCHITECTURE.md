# RATE_LIMIT_ARCHITECTURE — Multi-Layer Rate Limiting 2026

File này chốt kiến trúc rate limiting 3 tầng cho PMTL_VN.
Mục tiêu: bảo vệ hệ thống khỏi abuse trong khi vẫn cho phép người dùng hợp lệ hoạt động bình thường.

> **Related**: `HIGH_TRAFFIC_RESILIENCE.md`, `SECURITY_POLICY.md`, `FAILURE_MODES.md`

---

## 1. Kiến trúc 3 tầng

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: Edge (Cloudflare)                                     │
│  ├─ DDoS protection                                             │
│  ├─ Bot Fight Mode                                              │
│  ├─ WAF rules (OWASP Core)                                      │
│  ├─ Rate limit: 1000 req/min per IP                            │
│  └─ Challenge: suspicious IPs                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: Reverse Proxy (Caddy)                                 │
│  ├─ Per-IP rate limit: 100 req/min                             │
│  ├─ Per-endpoint budget                                         │
│  ├─ Slow-loris protection                                       │
│  └─ Request size limits                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Application (NestJS + Redis)                          │
│  ├─ Token bucket algorithm (Redis)                              │
│  ├─ Per-user adaptive limits                                    │
│  ├─ Per-endpoint granular limits                                │
│  ├─ Burst allowance                                             │
│  └─ IP intelligence (reputation scoring)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1: Cloudflare Edge

### 2.1 WAF Rules

```yaml
# Cloudflare WAF Configuration
rules:
  - name: "Block known bad bots"
    expression: (cf.client.bot) and not (cf.verified_bot_category in {"search_engine" "monitoring"})
    action: block
    
  - name: "Challenge suspicious countries"
    expression: ip.geoip.country in {"RU" "CN" "KP"} and not cf.verified_bot_category in {"search_engine"}
    action: managed_challenge
    
  - name: "Rate limit auth endpoints"
    expression: http.request.uri.path contains "/api/auth"
    rate_limit:
      requests_per_period: 20
      period: 60
      action: block
      
  - name: "Rate limit search"
    expression: http.request.uri.path contains "/api/search"
    rate_limit:
      requests_per_period: 60
      period: 60
      action: challenge
```

### 2.2 Bot Fight Mode settings

```yaml
bot_fight_mode:
  enabled: true
  level: super_aggressive  # Cho spiritual content site
  verified_bots:
    - googlebot
    - bingbot
    - duckduckbot
    - yandexbot
  challenge_solve_timeout: 300
```

---

## 3. Layer 2: Caddy Reverse Proxy

### 3.1 Caddyfile rate limiting

```caddyfile
# /etc/caddy/Caddyfile
{
    order rate_limit before reverse_proxy
}

api.pmtl.vn {
    # Global rate limit per IP
    rate_limit {
        zone api_global {
            key {remote_host}
            events 100
            window 1m
        }
    }
    
    # Stricter limit for auth endpoints
    @auth path /api/auth/*
    rate_limit @auth {
        zone api_auth {
            key {remote_host}
            events 10
            window 1m
        }
    }
    
    # Stricter limit for uploads
    @upload path /api/upload/*
    rate_limit @upload {
        zone api_upload {
            key {remote_host}
            events 20
            window 5m
        }
    }
    
    # Request size limits
    request_body {
        max_size 10MB
    }
    
    # Slow loris protection
    header_timeout 10s
    body_timeout 30s
    
    reverse_proxy api:3001 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Request-ID {uuid}
    }
}
```

---

## 4. Layer 3: Application Rate Limiting

### 4.1 Redis Token Bucket

```typescript
// apps/api/src/platform/rate-limit/redis-rate-limit.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";

export interface RateLimitConfig {
  key: string;
  maxTokens: number;       // Bucket capacity
  refillRate: number;      // Tokens per second
  burstAllowance: number;  // Extra tokens for burst
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  retryAfterMs?: number;
}

@Injectable()
export class RedisRateLimitService {
  private readonly logger = new Logger(RedisRateLimitService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Token bucket algorithm với Redis
   * - Mỗi bucket có capacity = maxTokens + burstAllowance
   * - Tokens refill liên tục theo refillRate
   * - Request consume 1 token
   */
  async consume(config: RateLimitConfig, tokensNeeded = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const bucketKey = `ratelimit:${config.key}`;
    const totalCapacity = config.maxTokens + config.burstAllowance;
    
    // Lua script for atomic token bucket
    const luaScript = `
      local bucket_key = KEYS[1]
      local now = tonumber(ARGV[1])
      local capacity = tonumber(ARGV[2])
      local refill_rate = tonumber(ARGV[3])
      local tokens_needed = tonumber(ARGV[4])
      
      -- Get current state
      local bucket = redis.call('HMGET', bucket_key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now
      
      -- Calculate refill
      local elapsed = (now - last_refill) / 1000
      local refill = elapsed * refill_rate
      tokens = math.min(capacity, tokens + refill)
      
      -- Try to consume
      local allowed = 0
      if tokens >= tokens_needed then
        tokens = tokens - tokens_needed
        allowed = 1
      end
      
      -- Save state
      redis.call('HMSET', bucket_key, 'tokens', tokens, 'last_refill', now)
      redis.call('EXPIRE', bucket_key, 3600)
      
      -- Calculate reset time
      local reset_in = 0
      if tokens < 1 then
        reset_in = math.ceil((1 - tokens) / refill_rate * 1000)
      end
      
      return {allowed, math.floor(tokens), reset_in}
    `;
    
    const result = await this.redis.eval(
      luaScript,
      1,
      bucketKey,
      now,
      totalCapacity,
      config.refillRate,
      tokensNeeded,
    ) as [number, number, number];
    
    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetInMs: result[2],
      retryAfterMs: result[0] === 0 ? result[2] : undefined,
    };
  }

  /**
   * Get current bucket state without consuming
   */
  async peek(key: string): Promise<{ tokens: number; lastRefill: number } | null> {
    const data = await this.redis.hgetall(`ratelimit:${key}`);
    if (!data.tokens) return null;
    return {
      tokens: parseFloat(data.tokens),
      lastRefill: parseInt(data.last_refill, 10),
    };
  }
}
```

### 4.2 Per-endpoint configurations

```typescript
// apps/api/src/platform/rate-limit/rate-limit.config.ts
export interface EndpointRateLimit {
  maxTokens: number;
  refillRate: number;  // tokens per second
  burstAllowance: number;
  keyType: "ip" | "user" | "ip+user";
}

export const ENDPOINT_RATE_LIMITS: Record<string, EndpointRateLimit> = {
  // Auth - strict limits
  "auth.login": {
    maxTokens: 5,
    refillRate: 0.1,  // 1 token per 10 seconds
    burstAllowance: 2,
    keyType: "ip",
  },
  "auth.register": {
    maxTokens: 3,
    refillRate: 0.02,  // 1 token per 50 seconds
    burstAllowance: 0,
    keyType: "ip",
  },
  "auth.refresh": {
    maxTokens: 10,
    refillRate: 0.5,
    burstAllowance: 5,
    keyType: "user",
  },
  "auth.password-reset": {
    maxTokens: 3,
    refillRate: 0.01,  // 1 per 100 seconds
    burstAllowance: 0,
    keyType: "ip",
  },
  
  // Search - medium limits
  "search.query": {
    maxTokens: 30,
    refillRate: 1,  // 1 per second
    burstAllowance: 10,
    keyType: "ip+user",
  },
  
  // Content read - generous limits
  "content.read": {
    maxTokens: 100,
    refillRate: 5,
    burstAllowance: 50,
    keyType: "ip",
  },
  
  // Community write - moderate limits
  "community.post": {
    maxTokens: 5,
    refillRate: 0.1,
    burstAllowance: 2,
    keyType: "user",
  },
  "community.comment": {
    maxTokens: 10,
    refillRate: 0.2,
    burstAllowance: 3,
    keyType: "user",
  },
  "guestbook.submit": {
    maxTokens: 3,
    refillRate: 0.05,  // 1 per 20 seconds
    burstAllowance: 0,
    keyType: "ip",
  },
  
  // Upload - strict limits
  "upload.media": {
    maxTokens: 10,
    refillRate: 0.1,
    burstAllowance: 5,
    keyType: "user",
  },
  
  // Practice logs - user-specific
  "practice.log": {
    maxTokens: 20,
    refillRate: 0.5,
    burstAllowance: 10,
    keyType: "user",
  },
};
```

### 4.3 Rate limit guard

```typescript
// apps/api/src/platform/rate-limit/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { RedisRateLimitService } from "./redis-rate-limit.service.js";
import { ENDPOINT_RATE_LIMITS, EndpointRateLimit } from "./rate-limit.config.js";
import { IpIntelligenceService } from "./ip-intelligence.service.js";
import { RATE_LIMIT_KEY } from "../../common/decorators/rate-limit.decorator.js";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RedisRateLimitService,
    private readonly ipIntelligence: IpIntelligenceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    
    // Get endpoint key from decorator
    const endpointKey = this.reflector.get<string>(RATE_LIMIT_KEY, context.getHandler());
    if (!endpointKey) return true;
    
    const config = ENDPOINT_RATE_LIMITS[endpointKey];
    if (!config) return true;
    
    // Build rate limit key
    const ip = this.getClientIp(request);
    const userId = (request as any).user?.id;
    const key = this.buildKey(endpointKey, ip, userId, config.keyType);
    
    // Check IP reputation for adjustment
    const ipScore = await this.ipIntelligence.getScore(ip);
    const adjustedConfig = this.adjustForReputation(config, ipScore);
    
    // Check rate limit
    const result = await this.rateLimitService.consume({
      key,
      ...adjustedConfig,
    });
    
    // Set headers
    response.setHeader("X-RateLimit-Limit", adjustedConfig.maxTokens);
    response.setHeader("X-RateLimit-Remaining", result.remaining);
    response.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() / 1000 + result.resetInMs / 1000));
    
    if (!result.allowed) {
      response.setHeader("Retry-After", Math.ceil(result.retryAfterMs! / 1000));
      throw new HttpException(
        {
          success: false,
          code: "rate_limit.exceeded",
          message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
          retryAfter: Math.ceil(result.retryAfterMs! / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }

  private getClientIp(request: Request): string {
    // Trust Cloudflare/Caddy headers
    return (
      request.headers["cf-connecting-ip"] as string ||
      request.headers["x-real-ip"] as string ||
      request.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      request.ip ||
      "unknown"
    );
  }

  private buildKey(
    endpoint: string,
    ip: string,
    userId: string | undefined,
    keyType: "ip" | "user" | "ip+user",
  ): string {
    switch (keyType) {
      case "ip":
        return `${endpoint}:ip:${ip}`;
      case "user":
        return userId ? `${endpoint}:user:${userId}` : `${endpoint}:ip:${ip}`;
      case "ip+user":
        return userId ? `${endpoint}:user:${userId}` : `${endpoint}:ip:${ip}`;
    }
  }

  private adjustForReputation(
    config: EndpointRateLimit,
    ipScore: number,
  ): EndpointRateLimit {
    // ipScore: 0 = very suspicious, 100 = very trusted
    if (ipScore < 30) {
      // Suspicious IP: 50% capacity
      return {
        ...config,
        maxTokens: Math.ceil(config.maxTokens * 0.5),
        burstAllowance: 0,
      };
    }
    if (ipScore > 80) {
      // Trusted IP: 150% capacity
      return {
        ...config,
        maxTokens: Math.ceil(config.maxTokens * 1.5),
        burstAllowance: Math.ceil(config.burstAllowance * 1.5),
      };
    }
    return config;
  }
}
```

### 4.4 IP Intelligence Service

```typescript
// apps/api/src/platform/rate-limit/ip-intelligence.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";

interface IpReputation {
  score: number;  // 0-100
  lastUpdated: number;
  failedLogins: number;
  blockedRequests: number;
  successfulRequests: number;
}

@Injectable()
export class IpIntelligenceService {
  private readonly logger = new Logger(IpIntelligenceService.name);
  private readonly DEFAULT_SCORE = 70;
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getScore(ip: string): Promise<number> {
    const key = `ip:reputation:${ip}`;
    const data = await this.redis.hgetall(key);
    
    if (!data.score) {
      return this.DEFAULT_SCORE;
    }
    
    return parseInt(data.score, 10);
  }

  async recordEvent(ip: string, event: "failed_login" | "blocked" | "success") {
    const key = `ip:reputation:${ip}`;
    
    const pipeline = this.redis.pipeline();
    
    switch (event) {
      case "failed_login":
        pipeline.hincrby(key, "failedLogins", 1);
        pipeline.hincrby(key, "score", -5);  // Decrease score
        break;
      case "blocked":
        pipeline.hincrby(key, "blockedRequests", 1);
        pipeline.hincrby(key, "score", -10);
        break;
      case "success":
        pipeline.hincrby(key, "successfulRequests", 1);
        pipeline.hincrby(key, "score", 1);  // Slowly increase
        break;
    }
    
    pipeline.hset(key, "lastUpdated", Date.now());
    pipeline.expire(key, this.CACHE_TTL);
    
    await pipeline.exec();
    
    // Clamp score to 0-100
    const score = await this.redis.hget(key, "score");
    if (score) {
      const clamped = Math.max(0, Math.min(100, parseInt(score, 10)));
      await this.redis.hset(key, "score", clamped);
    }
  }

  async getReputation(ip: string): Promise<IpReputation | null> {
    const key = `ip:reputation:${ip}`;
    const data = await this.redis.hgetall(key);
    
    if (!data.score) return null;
    
    return {
      score: parseInt(data.score, 10),
      lastUpdated: parseInt(data.lastUpdated, 10),
      failedLogins: parseInt(data.failedLogins || "0", 10),
      blockedRequests: parseInt(data.blockedRequests || "0", 10),
      successfulRequests: parseInt(data.successfulRequests || "0", 10),
    };
  }
}
```

---

## 5. Decorator và Usage

```typescript
// apps/api/src/common/decorators/rate-limit.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "rate_limit_endpoint";

export const RateLimit = (endpointKey: string) => 
  SetMetadata(RATE_LIMIT_KEY, endpointKey);
```

```typescript
// Usage in controller
@Controller("auth")
export class AuthController {
  @Post("login")
  @RateLimit("auth.login")
  async login(@Body() dto: LoginDto) {
    // ...
  }
  
  @Post("register")
  @RateLimit("auth.register")
  async register(@Body() dto: RegisterDto) {
    // ...
  }
}
```

---

## 6. Monitoring và Alerts

### 6.1 Metrics

```typescript
// apps/api/src/platform/metrics/rate-limit.metrics.ts
import { Injectable } from "@nestjs/common";
import { Counter, Gauge } from "prom-client";

@Injectable()
export class RateLimitMetrics {
  private readonly requestsTotal = new Counter({
    name: "rate_limit_requests_total",
    help: "Total rate limited requests",
    labelNames: ["endpoint", "result", "key_type"],
  });
  
  private readonly currentBuckets = new Gauge({
    name: "rate_limit_bucket_tokens",
    help: "Current tokens in rate limit buckets",
    labelNames: ["endpoint"],
  });
  
  recordRequest(endpoint: string, allowed: boolean, keyType: string) {
    this.requestsTotal.inc({
      endpoint,
      result: allowed ? "allowed" : "blocked",
      key_type: keyType,
    });
  }
  
  updateBucket(endpoint: string, tokens: number) {
    this.currentBuckets.set({ endpoint }, tokens);
  }
}
```

### 6.2 Alert rules

```yaml
# infra/monitoring/alerts.yml
groups:
  - name: rate_limit
    rules:
      - alert: HighRateLimitBlocks
        expr: rate(rate_limit_requests_total{result="blocked"}[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate of blocked requests"
          description: "{{ $value }} requests/sec blocked by rate limiter"
          
      - alert: PossibleDDoS
        expr: rate(rate_limit_requests_total{result="blocked"}[1m]) > 1000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Possible DDoS attack detected"
          description: "{{ $value }} requests/sec blocked - possible attack"
```

---

## 7. Fallback khi Redis down

```typescript
// apps/api/src/platform/rate-limit/fallback-rate-limit.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

/**
 * Fallback rate limiter khi Redis không available
 * Dùng Postgres table - chậm hơn nhưng vẫn hoạt động
 */
@Injectable()
export class FallbackRateLimitService {
  private readonly logger = new Logger(FallbackRateLimitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkLimit(key: string, maxRequests: number, windowSeconds: number) {
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000,
    );
    const expiresAt = new Date(windowStart.getTime() + windowSeconds * 1000);

    // Upsert với atomic increment
    const record = await this.prisma.rateLimitRecord.upsert({
      where: {
        key_windowStart: { key, windowStart },
      },
      create: {
        key,
        windowStart,
        expiresAt,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });

    const allowed = record.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - record.count);

    return {
      allowed,
      remaining,
      resetAt: expiresAt,
    };
  }
}
```

---

## 8. Checklist

- [ ] Cloudflare WAF rules configured
- [ ] Bot Fight Mode enabled
- [ ] Caddy rate limiting configured
- [ ] Redis rate limit service implemented
- [ ] IP intelligence service implemented
- [ ] Per-endpoint limits defined
- [ ] Rate limit decorator created
- [ ] Fallback to Postgres when Redis down
- [ ] Metrics exposed
- [ ] Alerts configured
- [ ] Load test passed
- [ ] Documentation updated

---

*Owner: `design/02-platform-baseline/api-runtime/` · Last updated: 2026-03-31*
