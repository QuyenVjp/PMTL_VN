/**
 * Request-ID Middleware — Position #1 in NEST_REQUEST_PIPELINE.md
 *
 * Generates or propagates a unique request identifier for every incoming request.
 * This ID flows through the entire pipeline: logging, error envelope, response headers.
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 * Pipeline position: 1 (request-id / correlation middleware)
 */
import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

const REQUEST_ID_HEADER = "x-request-id";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existing = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof existing === "string" && existing.length > 0
        ? existing
        : `req_${nanoid(21)}`;

    // Set on request for downstream consumers (guards, pipes, services, filters)
    req.headers[REQUEST_ID_HEADER] = requestId;

    // Echo back in response header for client correlation
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
