import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import {
  Registry,
  Counter,
  Gauge,
  Histogram,
  collectDefaultMetrics,
  type CounterConfiguration,
  type GaugeConfiguration,
  type HistogramConfiguration,
} from "prom-client";

/**
 * Thin wrapper around prom-client.
 *
 * - Callers use incrementCounter / setGauge / recordHistogram.
 * - Metrics are auto-registered on first call (lazy init).
 * - Default Node.js metrics (memory, CPU, event-loop lag) are collected via collectDefaultMetrics().
 * - getMetrics() returns the full Prometheus text exposition format with proper _bucket lines,
 *   enabling histogram_quantile(0.95, ...) in Grafana.
 */
@Injectable()
export class MetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly registry = new Registry();

  // Lazy caches — metrics are registered once and reused
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();
  private readonly histograms = new Map<string, Histogram>();

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry, prefix: "pmtl_api_node_" });
  }

  onModuleDestroy() {
    this.registry.clear();
  }

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1) {
    const metricName = `pmtl_api_${name}`;
    let counter = this.counters.get(metricName);
    if (!counter) {
      const labelNames = Object.keys(labels);
      const config: CounterConfiguration<string> = { name: metricName, help: metricName, registers: [this.registry] };
      if (labelNames.length > 0) config.labelNames = labelNames;
      counter = new Counter(config);
      this.counters.set(metricName, counter);
    }
    counter.inc(labels, value);
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    const metricName = `pmtl_api_${name}`;
    let gauge = this.gauges.get(metricName);
    if (!gauge) {
      const labelNames = Object.keys(labels);
      const config: GaugeConfiguration<string> = { name: metricName, help: metricName, registers: [this.registry] };
      if (labelNames.length > 0) config.labelNames = labelNames;
      gauge = new Gauge(config);
      this.gauges.set(metricName, gauge);
    }
    gauge.set(labels, value);
  }

  recordHistogram(name: string, value: number, labels: Record<string, string> = {}) {
    const metricName = `pmtl_api_${name}`;
    let histogram = this.histograms.get(metricName);
    if (!histogram) {
      const labelNames = Object.keys(labels);
      // HTTP latency buckets in seconds — covers p50/p95/p99 for typical web APIs
      const config: HistogramConfiguration<string> = {
        name: metricName,
        help: metricName,
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      };
      if (labelNames.length > 0) config.labelNames = labelNames;
      histogram = new Histogram(config);
      this.histograms.set(metricName, histogram);
    }
    histogram.observe(labels, value);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  contentType(): string {
    return this.registry.contentType;
  }
}
