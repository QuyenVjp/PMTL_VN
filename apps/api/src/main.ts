import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { ConfigService } from "./common/config/config.service.js";
import { GlobalExceptionFilter } from "./common/errors/global-exception.filter.js";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix("api");

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [configService.webOrigin, configService.adminOrigin],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-Id"],
  });

  // Global pipes and filters
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.apiPort;
  await app.listen(port);

  logger.log(`🚀 API server running on port ${port}`);
}

void bootstrap();
