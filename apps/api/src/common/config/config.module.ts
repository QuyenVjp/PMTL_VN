import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { ConfigService } from "./config.service.js";
import {
  coreConfig,
  corsConfig,
  databaseConfig,
  authConfig,
  securityConfig,
  storageConfig,
  emailConfig,
  revalidationConfig,
  cacheConfig,
} from "./config.namespaces.js";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        coreConfig,
        corsConfig,
        databaseConfig,
        authConfig,
        securityConfig,
        storageConfig,
        emailConfig,
        revalidationConfig,
        cacheConfig,
      ],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
