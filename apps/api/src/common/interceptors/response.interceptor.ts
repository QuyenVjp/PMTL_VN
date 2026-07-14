/**
 * Response Interceptor — Standardized success envelope
 *
 * Wraps all successful responses in a consistent envelope:
 * { data: T, meta: { timestamp, requestId, path } }
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 * "response logging / metrics capture" — position #11
 *
 * Registered via APP_INTERCEPTOR provider (NOT app.useGlobalInterceptors).
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import type { Request } from "express";

export interface SuccessEnvelope<T> {
  data: T;
  meta: {
    /** @deprecated use generatedAt — kept for backward compatibility during envelope migration. */
    timestamp: string;
    /** Canonical generation timestamp per API_DTO_SHAPE_PLAN.md DTO envelope rules. */
    generatedAt: string;
    requestId?: string;
    path: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessEnvelope<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessEnvelope<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.headers["x-request-id"] as string | undefined;

    return next.handle().pipe(
      map((data) => {
        const generatedAt = new Date().toISOString();
        return {
          data,
          meta: {
            // timestamp kept during migration; prefer generatedAt (API_DTO_SHAPE_PLAN).
            timestamp: generatedAt,
            generatedAt,
            requestId,
            path: request.url,
          },
        };
      }),
    );
  }
}
