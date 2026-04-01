/**
 * Bootstrap — NEST_REQUEST_PIPELINE.md canon
 *
 * Constitution: NestFactory.create(AppModule, { bufferLogs: true })
 * then app.useLogger(app.get(Logger))
 *
 * Global pipes, filters, interceptors are registered via APP_PIPE / APP_FILTER /
 * APP_INTERCEPTOR providers in AppModule — NOT via app.useGlobal*() here.
 * This ensures DI injection works correctly for all global concerns.
 */
// OTel must initialize before NestFactory — side-effect import, no-op if OTEL_EXPORTER_OTLP_ENDPOINT unset
import "./common/tracing/otel.bootstrap.js";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { jwtVerify } from "jose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import type { Request, Response, NextFunction } from "express";
import { resolve } from "node:path";
import { AppModule } from "./app.module.js";
import { ConfigService } from "./common/config/config.service.js";

/**
 * Graceful shutdown handler for SIGTERM/SIGINT signals.
 * Enterprise 2026 requirement: Drain active requests before shutdown.
 */
function setupGracefulShutdown(app: NestExpressApplication, logger: Logger) {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn(`${signal} received during shutdown - forcing exit`);
      process.exit(1);
    }

    isShuttingDown = true;
    logger.log({ msg: "graceful_shutdown.started", signal });

    // 1. Stop accepting new connections
    const server = app.getHttpServer();
    server.close(() => {
      logger.log({ msg: "graceful_shutdown.http_closed" });
    });

    // 2. Wait for active requests to drain (max 30 seconds)
    const drainTimeout = setTimeout(() => {
      logger.warn({ msg: "graceful_shutdown.drain_timeout" });
      process.exit(1);
    }, 30000);

    try {
      // 3. Close app (triggers OnModuleDestroy hooks: Prisma disconnect, etc.)
      await app.close();
      clearTimeout(drainTimeout);
      
      logger.log({ msg: "graceful_shutdown.completed", signal });
      process.exit(0);
    } catch (error) {
      clearTimeout(drainTimeout);
      logger.error({
        msg: "graceful_shutdown.error",
        error: (error as Error).message,
      });
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Converge Nest system + app logging on single structured logger path
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  // Graceful shutdown signal handlers (Enterprise 2026 requirement)
  setupGracefulShutdown(app, logger);

  // Global prefix — locked at bootstrap
  app.setGlobalPrefix("api");

  // Security headers (pipeline position #3 — helmet)
  // Hardened: explicit CSP + HSTS 1yr (prod only) + manual Permissions-Policy
  // Helmet 8 does NOT set CSP by default — must be explicit.
  // Permissions-Policy is not in helmet 8 core; set as manual Express middleware.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc:     ["'none'"],
          imgSrc:         ["'self'"],
          mediaSrc:       ["'self'"],
          connectSrc:     ["'self'"],
          frameAncestors: ["'none'"],
          formAction:     ["'none'"],
        },
      },
      hsts: configService.isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy:              { policy: "strict-origin-when-cross-origin" },
      crossOriginResourcePolicy:   { policy: "cross-origin" },
    }),
  );
  // Permissions-Policy — not in helmet 8 built-ins (spec was unstable at release)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
    next();
  });
  app.use(cookieParser());

  // Serve uploaded files at /media (bypasses global /api prefix intentionally)
  // PUBLIC_MEDIA_BASE_URL is expected to point here: http://host:port/media
  const storageRoot = resolve(configService.localStorageRoot || "./uploads");

  // Signed URL gate — opt-in via MEDIA_REQUIRE_SIGNED_URL=true.
  // When enabled, every /media/* request must carry ?token=<signed-jwt> where
  // the token's `key` claim matches the requested path exactly.
  // Default OFF so existing web frontend URLs continue to work unchanged.
  if (configService.mediaRequireSignedUrl) {
    const rawSecret =
      configService.mediaSignedUrlSecret ?? configService.jwtAccessSecret;
    const secretBytes = new TextEncoder().encode(rawSecret);
    app.use("/media", async (req: Request, res: Response, next: NextFunction) => {
      const rawToken = req.query["token"];
      const token = Array.isArray(rawToken)
        ? (typeof rawToken[0] === "string" ? rawToken[0] : "")
        : (typeof rawToken === "string" ? rawToken : "");
      if (!token) {
        res.status(401).json({ message: "Media token required" });
        return;
      }
      try {
        const { payload } = await jwtVerify(token, secretBytes);
        // req.url under the /media mount is the sub-path, e.g. "/images/abc.jpg?token=..."
        // storageKey format is "images/abc.jpg" (no leading slash, no query string)
        const requestedKey = req.url.split("?")[0].replace(/^\//, "");
        if (payload["key"] !== requestedKey || payload["purpose"] !== "media") {
          res.status(403).json({ message: "Media token key mismatch" });
          return;
        }
        next();
      } catch {
        res.status(401).json({ message: "Media token invalid or expired" });
      }
    });
  }

  app.useStaticAssets(storageRoot, { prefix: "/media" });

  // CORS — only WEB_ORIGIN and ADMIN_ORIGIN allowed
  app.enableCors({
    origin: [configService.webOrigin, configService.adminOrigin],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-Id"],
  });

  // Swagger — decorators already on all 27 controllers, just expose UI
  if (!configService.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("PMTL API")
      .setDescription("Pháp Môn Tâm Linh Việt Nam — backend API")
      .setVersion("1.0")
      .addCookieAuth("pmtl_access")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  // Graceful shutdown hooks for Prisma + sessions cleanup
  app.enableShutdownHooks();

  const port = configService.apiPort;
  await app.listen(port);

  logger.log(`API server running on port ${port}`);
  if (!configService.isProduction) {
    logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
  }
}

void bootstrap();
