import { Injectable } from "@nestjs/common";

interface MetricValue {
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

@Injectable()
export class MetricsService {
  private counters = new Map<string, MetricValue[]>();
  private gauges = new Map<string, MetricValue>();
  private histograms = new Map<string, MetricValue[]>();

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1) {
    const key = this.getKey(name, labels);
    const existing = this.counters.get(key) || [];
    existing.push({
      value,
      labels,
      timestamp: Date.now(),
    });
    this.counters.set(key, existing);
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.getKey(name, labels);
    this.gauges.set(key, {
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  recordHistogram(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.getKey(name, labels);
    const existing = this.histograms.get(key) || [];
    existing.push({
      value,
      labels,
      timestamp: Date.now(),
    });
    this.histograms.set(key, existing);
  }

  getMetrics(): string {
    const lines: string[] = [];
    const prefix = "pmtl_api_";

    // Counters
    for (const [key, values] of this.counters) {
      const total = values.reduce((sum, v) => sum + v.value, 0);
      const labels = values[0]?.labels || {};
      const labelStr = this.formatLabels(labels);
      lines.push(`${prefix}${key}${labelStr} ${total}`);
    }

    // Gauges
    for (const [key, metric] of this.gauges) {
      const labelStr = this.formatLabels(metric.labels);
      lines.push(`${prefix}${key}${labelStr} ${metric.value}`);
    }

    // Histograms (simplified - just count and sum)
    for (const [key, values] of this.histograms) {
      const count = values.length;
      const sum = values.reduce((s, v) => s + v.value, 0);
      const labels = values[0]?.labels || {};
      const labelStr = this.formatLabels(labels);
      lines.push(`${prefix}${key}_count${labelStr} ${count}`);
      lines.push(`${prefix}${key}_sum${labelStr} ${sum}`);
    }

    return lines.join("\n");
  }

  private getKey(name: string, labels: Record<string, string>): string {
    const labelParts = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return labelParts ? `${name}{${labelParts}}` : name;
  }

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return "";
    
    const parts = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`);
    return `{${parts.join(",")}}`;
  }
}
