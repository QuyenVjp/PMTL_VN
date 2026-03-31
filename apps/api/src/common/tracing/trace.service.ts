import { Injectable } from "@nestjs/common";
import { trace } from "@opentelemetry/api";

@Injectable()
export class TraceService {
  getCurrentTraceContext(): { traceId?: string; spanId?: string } {
    const activeSpan = trace.getActiveSpan();
    if (!activeSpan) return {};
    const spanContext = activeSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }
}
