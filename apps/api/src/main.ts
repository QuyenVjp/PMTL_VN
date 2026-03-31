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
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import type { Request, Response, NextFunction } from "express";
import { resolve } from "node:path";
import { AppModule } from "./app.module.js";
import { ConfigService } from "./common/config/config.service.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Converge Nest system + app logging on single structured logger path
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

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
