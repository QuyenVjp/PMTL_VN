# PRODUCTION_LIFECYCLE_RESILIENCE — Graceful Shutdown & Resilience Patterns 2026

File này chốt production lifecycle hooks và resilience patterns cho PMTL_VN.
Mục tiêu: zero-downtime deploys, graceful degradation, và fault tolerance.

> **Related**: `HIGH_TRAFFIC_RESILIENCE.md`, `FAILURE_MODES.md`, `SLA_SLO.md`

---

## 1. Graceful Shutdown Sequence

### 1.1 NestJS Shutdown Flow

```
SIGTERM received
     │
     ▼
┌─────────────────────────────────────┐
│ 1. Stop accepting new requests      │
│    (health endpoint returns 503)    │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 2. Wait for in-flight requests      │
│    (grace period: 30 seconds)       │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 3. Stop background jobs/queues      │
│    (BullMQ graceful shutdown)       │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 4. Close database connections       │
│    (Prisma disconnect)              │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 5. Close Redis connections          │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 6. Exit process                     │
└─────────────────────────────────────┘
```

### 1.2 Implementation

```typescript
// apps/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const logger = app.get(Logger);
  app.useLogger(logger);
  
  // Enable shutdown hooks
  app.enableShutdownHooks();
  
  // Graceful shutdown timeout
  const SHUTDOWN_TIMEOUT = 30_000; // 30 seconds
  
  const server = app.getHttpServer();
  
  // Track connections for drain
  let connections = new Set();
  server.on("connection", (conn) => {
    connections.add(conn);
    conn.on("close", () => connections.delete(conn));
  });
  
  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    logger.log({ msg: "shutdown.initiated", signal });
    
    // 1. Stop accepting new connections
    server.close();
    
    // 2. Drain existing connections
    const drainStart = Date.now();
    while (connections.size > 0 && Date.now() - drainStart < SHUTDOWN_TIMEOUT) {
      await new Promise(r => setTimeout(r, 100));
    }
    
    // 3. Force close remaining connections
    if (connections.size > 0) {
      logger.warn({ msg: "shutdown.force_close", remaining: connections.size });
      connections.forEach(conn => conn.destroy());
    }
    
    // 4. Close app (triggers OnModuleDestroy hooks)
    await app.close();
    
    logger.log({ msg: "shutdown.complete", durationMs: Date.now() - drainStart });
    process.exit(0);
  };
  
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  
  await app.listen(3001, "0.0.0.0");
  logger.log({ msg: "server.started", port: 3001 });
}

bootstrap();
```

### 1.3 Module Cleanup Hooks

```typescript
// apps/api/src/common/prisma/prisma.service.ts
import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleDestroy() {
    this.logger.log({ msg: "prisma.disconnecting" });
    await this.$disconnect();
    this.logger.log({ msg: "prisma.disconnected" });
  }
}
```

```typescript
// apps/api/src/platform/queue/queue.service.ts
import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { Queue, Worker } from "bullmq";

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private workers: Worker[] = [];
  private queues: Queue[] = [];

  async onModuleDestroy() {
    this.logger.log({ msg: "queue.shutdown.start" });
    
    // Stop accepting new jobs
    await Promise.all(this.workers.map(w => w.pause()));
    
    // Wait for in-progress jobs (max 25 seconds)
    await Promise.all(
      this.workers.map(w => 
        w.close().catch(e => this.logger.warn({ msg: "worker.close.error", error: e.message }))
      )
    );
    
    // Close queues
    await Promise.all(this.queues.map(q => q.close()));
    
    this.logger.log({ msg: "queue.shutdown.complete" });
  }
}
```

---

## 2. Health Checks (Terminus)

```typescript
// apps/api/src/platform/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../../common/prisma/prisma.service.js";

@Controller("api/health")
export class HealthController {
  private isShuttingDown = false;

  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  setShuttingDown() {
    this.isShuttingDown = true;
  }

  @Get("live")
  @HealthCheck()
  liveness() {
    // During shutdown, return 503 to stop receiving traffic
    if (this.isShuttingDown) {
      return { status: "shutting_down" };
    }
    return { status: "ok" };
  }

  @Get("ready")
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prisma.pingCheck("postgres", this.prismaService),
      () => this.memory.checkHeap("memory_heap", 500 * 1024 * 1024), // 500MB
      () => this.memory.checkRSS("memory_rss", 1024 * 1024 * 1024), // 1GB
    ]);
  }

  @Get("startup")
  @HealthCheck()
  startup() {
    // Used by k8s/Docker for initial startup probe
    return this.health.check([
      () => this.prisma.pingCheck("postgres", this.prismaService),
    ]);
  }
}
```

---

## 3. Circuit Breaker Pattern

```typescript
// apps/api/src/common/resilience/circuit-breaker.ts
import { Logger } from "@nestjs/common";

export enum CircuitState {
  CLOSED = "CLOSED",     // Normal operation
  OPEN = "OPEN",         // Failing, reject requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;    // Failures before opening
  successThreshold: number;    // Successes to close
  timeout: number;             // Time in OPEN state before HALF_OPEN
  fallback?: () => Promise<any>;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly logger = new Logger(`CircuitBreaker:${this.config.name}`);

  constructor(private readonly config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.log({ msg: "circuit.half_open" });
      } else {
        // Reject request
        this.logger.debug({ msg: "circuit.rejected" });
        if (this.config.fallback) {
          return this.config.fallback();
        }
        throw new Error(`Circuit breaker ${this.config.name} is OPEN`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        this.logger.log({ msg: "circuit.closed" });
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger.warn({ msg: "circuit.opened", failures: this.failures });
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### Usage với Meilisearch

```typescript
// apps/api/src/modules/search/search.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { CircuitBreaker } from "../../common/resilience/circuit-breaker.js";

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly searchCircuit: CircuitBreaker;

  constructor(
    private readonly meilisearch: MeilisearchService,
    private readonly sqlFallback: SqlSearchService,
  ) {
    this.searchCircuit = new CircuitBreaker({
      name: "meilisearch",
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30_000, // 30 seconds
      fallback: () => this.sqlFallback.search(this.lastQuery),
    });
  }

  private lastQuery: SearchQuery;

  async search(query: SearchQuery) {
    this.lastQuery = query;
    
    return this.searchCircuit.execute(async () => {
      const result = await this.meilisearch.search(query);
      return { ...result, engine: "meilisearch" };
    }).catch(async (error) => {
      this.logger.warn({ msg: "search.fallback", error: error.message });
      const result = await this.sqlFallback.search(query);
      return { ...result, engine: "sql-fallback" };
    });
  }
}
```

---

## 4. Retry Pattern

```typescript
// apps/api/src/common/resilience/retry.ts
import { Logger } from "@nestjs/common";

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: (error: Error) => boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  logger?: Logger,
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;
  let delay = cfg.initialDelayMs;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      if (cfg.retryableErrors && !cfg.retryableErrors(lastError)) {
        throw lastError;
      }

      if (attempt < cfg.maxAttempts) {
        logger?.debug({
          msg: "retry.attempt",
          attempt,
          nextDelayMs: delay,
          error: lastError.message,
        });
        
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * cfg.backoffMultiplier, cfg.maxDelayMs);
      }
    }
  }

  throw lastError!;
}

// Decorator version
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return retry(
        () => originalMethod.apply(this, args),
        config,
        new Logger(`${target.constructor.name}.${propertyKey}`),
      );
    };
    
    return descriptor;
  };
}
```

---

## 5. Timeout Pattern

```typescript
// apps/api/src/common/resilience/timeout.ts
export class TimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation ${operation} timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operation = "operation",
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(operation, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Decorator version
export function Timeout(ms: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return withTimeout(
        () => originalMethod.apply(this, args),
        ms,
        `${target.constructor.name}.${propertyKey}`,
      );
    };
    
    return descriptor;
  };
}
```

---

## 6. Bulkhead Pattern

```typescript
// apps/api/src/common/resilience/bulkhead.ts
import { Logger } from "@nestjs/common";

export interface BulkheadConfig {
  name: string;
  maxConcurrent: number;
  maxQueue: number;
  timeout?: number;
}

export class Bulkhead {
  private running = 0;
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    fn: () => Promise<any>;
  }> = [];
  private readonly logger = new Logger(`Bulkhead:${this.config.name}`);

  constructor(private readonly config: BulkheadConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.config.maxConcurrent) {
      if (this.queue.length >= this.config.maxQueue) {
        this.logger.warn({ msg: "bulkhead.rejected", running: this.running, queued: this.queue.length });
        throw new Error(`Bulkhead ${this.config.name} is full`);
      }

      // Add to queue
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject, fn });
        this.logger.debug({ msg: "bulkhead.queued", position: this.queue.length });
      });
    }

    return this.run(fn);
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.running++;
    
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running < this.config.maxConcurrent) {
      const next = this.queue.shift()!;
      this.run(next.fn)
        .then(next.resolve)
        .catch(next.reject);
    }
  }

  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueue: this.config.maxQueue,
    };
  }
}
```

### Usage

```typescript
// apps/api/src/modules/search/search.service.ts
@Injectable()
export class SearchService {
  private readonly searchBulkhead = new Bulkhead({
    name: "search",
    maxConcurrent: 20,
    maxQueue: 50,
  });

  async search(query: SearchQuery) {
    return this.searchBulkhead.execute(() => 
      this.meilisearch.search(query)
    );
  }
}
```

---

## 7. Combined Resilience

```typescript
// apps/api/src/common/resilience/resilient-call.ts
import { CircuitBreaker, CircuitBreakerConfig } from "./circuit-breaker.js";
import { retry, RetryConfig } from "./retry.js";
import { withTimeout } from "./timeout.js";
import { Bulkhead, BulkheadConfig } from "./bulkhead.js";

export interface ResilientCallConfig {
  name: string;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  bulkhead?: Partial<BulkheadConfig>;
  fallback?: () => Promise<any>;
}

export function createResilientCall(config: ResilientCallConfig) {
  const circuit = config.circuitBreaker
    ? new CircuitBreaker({
        name: config.name,
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 30_000,
        ...config.circuitBreaker,
        fallback: config.fallback,
      })
    : null;

  const bulkhead = config.bulkhead
    ? new Bulkhead({
        name: config.name,
        maxConcurrent: 10,
        maxQueue: 20,
        ...config.bulkhead,
      })
    : null;

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    // Layer 1: Bulkhead
    const bulkheadFn = bulkhead
      ? () => bulkhead.execute(fn)
      : fn;

    // Layer 2: Circuit breaker
    const circuitFn = circuit
      ? () => circuit.execute(bulkheadFn)
      : bulkheadFn;

    // Layer 3: Retry
    const retryFn = config.retry
      ? () => retry(circuitFn, config.retry)
      : circuitFn;

    // Layer 4: Timeout
    const timeoutFn = config.timeout
      ? () => withTimeout(retryFn, config.timeout!, config.name)
      : retryFn;

    return timeoutFn();
  };
}

// Usage
const resilientSearch = createResilientCall({
  name: "meilisearch",
  timeout: 5000,
  retry: { maxAttempts: 2 },
  circuitBreaker: { failureThreshold: 3 },
  bulkhead: { maxConcurrent: 20 },
  fallback: () => sqlFallbackSearch(),
});

const result = await resilientSearch(() => meilisearch.search(query));
```

---

## 8. Docker Compose Lifecycle

```yaml
# compose.prod.yml
services:
  api:
    image: ${API_IMAGE}
    # Graceful shutdown: Docker waits this long before SIGKILL
    stop_grace_period: 30s
    # Healthcheck during startup
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:3001/api/health/live"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 1024M
        reservations:
          cpus: "0.5"
          memory: 256M
```

---

## 9. Checklist

- [ ] SIGTERM/SIGINT handlers implemented
- [ ] Connection draining implemented
- [ ] OnModuleDestroy hooks for all services
- [ ] Health endpoints: /live, /ready, /startup
- [ ] Circuit breaker for external services
- [ ] Retry with exponential backoff
- [ ] Timeouts on all external calls
- [ ] Bulkhead for resource isolation
- [ ] stop_grace_period in Docker Compose
- [ ] Healthchecks configured
- [ ] Graceful shutdown tested in staging

---

*Owner: `design/02-platform-baseline/deploy-ops/` · Last updated: 2026-03-31*
