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
import { Logger } from "nestjs-pino";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { ConfigService } from "./common/config/config.service.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Converge Nest system + app logging on single structured logger path
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  // Global prefix — locked at bootstrap
  app.setGlobalPrefix("api");

  // Security headers (pipeline position #3 — helmet)
  app.use(helmet());
  app.use(cookieParser());

  // CORS — only WEB_ORIGIN and ADMIN_ORIGIN allowed
  app.enableCors({
    origin: [configService.webOrigin, configService.adminOrigin],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-Id"],
  });

  // Graceful shutdown hooks for Prisma + sessions cleanup
  app.enableShutdownHooks();

  const port = configService.apiPort;
  await app.listen(port);

  logger.log(`API server running on port ${port}`);
}

void bootstrap();
