/**
 * CircuitBreakerService — wraps async operations with opossum circuit breaker.
 *
 * opossum (Netflix open-source) provides: circuit open/close/half-open states,
 * configurable failure threshold, timeout, fallback execution.
 *
 * Usage:
 *   const cb = this.circuitBreaker.create('meilisearch', () => fetch(...), {
 *     timeout: 3000,
 *     errorThresholdPercentage: 50,
 *   });
 *   return cb.fire(...args);
 */
import { Injectable, Logger } from "@nestjs/common";
import CircuitBreaker from "opossum";

export interface CircuitBreakerOptions {
  timeout?: number;                  // ms before request considered failed (default 3000)
  errorThresholdPercentage?: number; // % failures to open circuit (default 50)
  resetTimeout?: number;             // ms to wait before half-open attempt (default 10000)
  volumeThreshold?: number;          // min requests before circuit evaluates (default 10)
}

type AsyncFn<TArgs extends unknown[], TReturn> = (...args: TArgs) => Promise<TReturn>;

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  create<TArgs extends unknown[], TReturn>(
    name: string,
    fn: AsyncFn<TArgs, TReturn>,
    options: CircuitBreakerOptions = {},
  ): CircuitBreaker<TArgs, TReturn> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as CircuitBreaker<TArgs, TReturn>;
    }

    const breaker = new CircuitBreaker(fn, {
      timeout: options.timeout ?? 3000,
      errorThresholdPercentage: options.errorThresholdPercentage ?? 50,
      resetTimeout: options.resetTimeout ?? 10000,
      volumeThreshold: options.volumeThreshold ?? 5,
      name,
    });

    breaker.on("open", () =>
      this.logger.warn({ msg: "circuit.opened", name }),
    );
    breaker.on("halfOpen", () =>
      this.logger.log({ msg: "circuit.half_open", name }),
    );
    breaker.on("close", () =>
      this.logger.log({ msg: "circuit.closed", name }),
    );
    breaker.on("fallback", (result: unknown) =>
      this.logger.warn({ msg: "circuit.fallback", name, result }),
    );

    this.breakers.set(name, breaker as CircuitBreaker);
    return breaker;
  }

  getStats(name: string) {
    const breaker = this.breakers.get(name);
    if (!breaker) return null;
    return {
      name,
      state: breaker.opened ? "open" : breaker.halfOpen ? "half-open" : "closed",
      stats: breaker.stats,
    };
  }

  getAllStats() {
    return [...this.breakers.keys()].map((name) => this.getStats(name));
  }
}
