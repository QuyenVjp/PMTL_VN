pino-nestjs
pino-nest.js.org
Drop-in Pino logger for NestJS with request context in every log

Tests Status Powered By pino Powered By pino-http Supports NestJS 9 Supports NestJS 10 Supports NestJS 11

Keep your NestJS logs while gaining all the benefits of pino and pino-http: structured JSON logs, exceptional performance, and automatic request context tracking.

// Other loggers - violate NestJS parameter order
this.logger.log(context, 'message'); // [FAIL] context first, message second

// With pino-nestjs - respect NestJS parameter order
this.logger.log('message', context); // [OK] message first, context second
Copy to clipboardErrorCopied
Table of contents
Table of contents
Quickstart
1. Install pino-nestjs
2. Import LoggerModule in your AppModule
3. Use app logger in main.ts
4. Use Logger in your NestJS codebase
5. Observe the logs
Key features
Comparison with other NestJS loggers
Respecting NestJS parameter order
Advanced
Configuration
Configuration parameters
Synchronous configuration
Asynchronous configuration
Asynchronous logging
Using PinoLogger directly
Testing a class that uses @InjectPinoLogger
Extending Logger and PinoLogger
Reusing the Fastify logger configuration
Assigning extra fields for future calls
Changing Pino parameters at runtime
Exposing stack trace and error class in err property
Frequently asked questions
Q: How do I disable automatic request/response logs?
Q: How do I pass X-Request-ID header or generate UUID for req.id?
Q: How does it work?
Q: Why use AsyncLocalStorage instead of REQUEST scope?
Q: What about pino built-in methods/levels?
Q: I use Fastify and want to configure pino at the Adapter level. Can I use that config for the logger?
Thanks / Inspiration
Quickstart
Let’s quickly set up pino-nestjs in your NestJS app according to NestJS Logger best practices:

1. Install pino-nestjs
npm
npm install pino-nestjs pino-http
Copy to clipboardErrorCopied
pnpm
Yarn
Bun
2. Import LoggerModule in your AppModule
// app.module.ts
import { LoggerModule } from 'pino-nestjs';

@Module({
  imports: [LoggerModule.forRoot()],
})
class AppModule {}
Copy to clipboardErrorCopied
3. Use app logger in main.ts
// main.ts
import { Logger } from 'pino-nestjs';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));
Copy to clipboardErrorCopied
4. Use Logger in your NestJS codebase
// my.service.ts
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);
  
  foo() {
    // NestJS parameter order: message first, then context (if needed)
    this.logger.verbose('My verbose message', MyService.name);
    this.logger.debug('User data processed', { userId: '123', status: 'success' });
    this.logger.log('Operation completed', MyService.name);
    
    // Object logging also works with NestJS parameter order
    this.logger.warn({ operation: 'data_sync', status: 'warning' }, MyService.name);
    
    // Error logging
    try {
      // Some operation
    } catch (error) {
      this.logger.error(error, error.stack, MyService.name);
    }
  }
}
Copy to clipboardErrorCopied
5. Observe the logs
Your logs will now be 🌲 Pino logs with request context and req.id:

// App logs
{"level":30,"time":1629823318326,"pid":14727,"hostname":"my-host","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1629823318326,"pid":14727,"hostname":"my-host","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1629823318327,"pid":14727,"hostname":"my-host","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1629823318327,"pid":14727,"hostname":"my-host","context":"RoutesResolver","msg":"AppController {/}:"}
{"level":30,"time":1629823318327,"pid":14727,"hostname":"my-host","context":"RouterExplorer","msg":"Mapped {/, GET} route"}
{"level":30,"time":1629823318327,"pid":14727,"hostname":"my-host","context":"NestApplication","msg":"Nest application successfully started"}

// Service logs with request context and req.id
{"level":10,"time":1629823792023,"pid":15067,"hostname":"my-host","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*"},"remoteAddress":"::1","remotePort":63822},"context":"MyService","foo":"bar","msg":"baz qux"}
{"level":20,"time":1629823792023,"pid":15067,"hostname":"my-host","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*"},"remoteAddress":"::1","remotePort":63822},"context":"MyService","msg":"foo bar {\"baz\":\"qux\"}"}
{"level":30,"time":1629823792023,"pid":15067,"hostname":"my-host","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*"},"remoteAddress":"::1","remotePort":63822},"context":"MyService","msg":"foo"}

// Automatic request/response logs
{"level":30,"time":1629823792029,"pid":15067,"hostname":"my-host","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*"},"remoteAddress":"::1","remotePort":63822},"res":{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"text/html; charset=utf-8","content-length":"12","etag":"W/\"c-Lve95gjOVATpfV8EL5X4nxwjKHE\""}},"responseTime":7,"msg":"request completed"}
Copy to clipboardErrorCopied
Key features
JSON logs, structured logging, high performance (via pino)
Automatic request/response logging (via pino-http)
Follows NestJS best practices out of the box
Respects NestJS parameter order
Zero config quickstart cost but still highly configurable when needed
Classic Pino mode for those preferring Pino’s native logging format
Comparison with other NestJS loggers
[!NOTE] This is a fork of nestjs-pino that implements full compatibility with NestJS’s default logger by respecting the parameter order.

To understand the motivation, see nestjs-pino#2004.

Logger	Nest App Logger	Logger Service	Auto-bind Request Data	NestJS Parameter Order	Active Maintenance
nest-winston	[OK]	[OK]	[FAIL]	[OK]	[OK]
nestjs-pino-logger	[OK]	[OK]	[FAIL]	❓	[FAIL]
nestjs-pino	[OK]	[OK]	[OK]	[FAIL]	[OK]
pino-nestjs (you’re here!)	[OK]	[OK]	[OK]	[OK]	[OK]
Respecting NestJS parameter order
This library differs from some other NestJS loggers by respecting the parameter order of the NestJS logger.

// Other loggers - violate NestJS parameter order
this.logger.log(context, 'message'); // [FAIL] context first, message second

// With pino-nestjs - respect NestJS parameter order
this.logger.log('message', context); // [OK] message first, context second
Copy to clipboardErrorCopied
This makes it a drop-in replacement for the default NestJS logger.

Advanced
Configuration
Configuration parameters
interface Params {
  /**
   * Optional parameters for `pino-http` module
   * @see https://github.com/pinojs/pino-http#api
   */
  pinoHttp?:
    | pinoHttp.Options
    | DestinationStream
    | [pinoHttp.Options, DestinationStream];

  /**
   * Optional parameter for routing. Implements interface of
   * NestJS built-in `MiddlewareConfigProxy['forRoutes']`.
   * @see https://docs.nestjs.com/middleware#applying-middleware
   */
  forRoutes?: Parameters<MiddlewareConfigProxy['forRoutes']>;

  /**
   * Optional parameter for routing. Implements interface of
   * NestJS built-in `MiddlewareConfigProxy['exclude']`.
   * @see https://docs.nestjs.com/middleware#applying-middleware
   */
  exclude?: Parameters<MiddlewareConfigProxy['exclude']>;

  /**
   * Optional parameter to skip pino configuration when using
   * FastifyAdapter with pre-configured logger.
   * @see https://github.com/yamcodes/pino-nestjs#faq
   */
  useExisting?: true;

  /**
   * Optional parameter to change property name `context` in logs
   */
  renameContext?: string;
}
Copy to clipboardErrorCopied
Synchronous configuration
// my.module.ts
import { LoggerModule } from 'pino-nestjs';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: [
        {
          name: 'my-app-name',
          level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
          // Install 'pino-pretty' package to use this option
          transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
          // Other pino-http options:
          // https://github.com/pinojs/pino-http#api
          // https://github.com/pinojs/pino/blob/HEAD/docs/api.md#options-object
        },
        someWritableStream
      ],
      forRoutes: [MyController],
      exclude: [{ method: RequestMethod.ALL, path: 'check' }]
    })
  ],
  // ...
})
class MyModule {}
Copy to clipboardErrorCopied
Asynchronous configuration
// my.module.ts
import { LoggerModule } from 'pino-nestjs';

@Injectable()
class ConfigService {
  public readonly level = 'debug';
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
class ConfigModule {}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await somePromise();
        return {
          pinoHttp: { level: config.level },
        };
      }
    })
  ],
  // ...
})
class TestModule {}
Copy to clipboardErrorCopied
Asynchronous logging
Asynchronous logging enables even faster performance by pino but risks losing the most recently buffered logs in case of system failure.

Read the pino asynchronous mode docs first.

// my.module.ts
import pino from 'pino';
import { LoggerModule } from 'pino-nestjs';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        stream: pino.destination({
          dest: './my-file', // omit for stdout
          minLength: 4096, // Buffer before writing
          sync: false, // Asynchronous logging
        }),
      },
    }),
  ],
  // ...
})
class MyModule {}
Copy to clipboardErrorCopied
See pino.destination

Using PinoLogger directly
While the recommended approach is to use the standard NestJS logger, you can also use Pino’s native logging format directly through the PinoLogger class. This gives you access to Pino’s full feature set and might be preferred by developers already familiar with Pino.

// my.service.ts
import { PinoLogger, InjectPinoLogger } from 'pino-nestjs';

export class MyService {
  constructor(
    @InjectPinoLogger(MyService.name)
    private readonly logger: PinoLogger
  ) {}

  foo() {
    // When using PinoLogger directly, use Pino's native format
    this.logger.trace('This is a trace message');
    
    // Traditional Pino object + message format
    this.logger.trace({ operation: 'init' }, 'System initialized');
  }
}
Copy to clipboardErrorCopied
Testing a class that uses @InjectPinoLogger
When using the direct Pino logger, you can test a class that uses @InjectPinoLogger by providing a mock logger, with the help of the getLoggerToken() function:

// my.service.spec.ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: getLoggerToken(MyService.name),
      useValue: mockLogger,
    },
  ],
}).compile();
Copy to clipboardErrorCopied
Extending Logger and PinoLogger
// logger.service.ts
import { Logger, PinoLogger, Params, PARAMS_PROVIDER_TOKEN } from 'pino-nestjs';

@Injectable()
class LoggerService extends Logger {
  constructor(
    logger: PinoLogger,
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params
  ) {
    super();
    // ...
  }
  // Extended method
  myMethod(): any {}
}
Copy to clipboardErrorCopied
// logger.service.ts
@Injectable()
class LoggerService extends PinoLogger {
  constructor(
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params
  ) {
    super();
    // ...
  }
  // Extended method
  myMethod(): any {}
}
Copy to clipboardErrorCopied
// logger.module.ts
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
  imports: [LoggerModule.forRoot()],
})
class LoggerModule {}
Copy to clipboardErrorCopied
Reusing the Fastify logger configuration
If you use useExisting: true with Fastify, you can reuse the Fastify logger configuration by providing the same options in forRoot/forRootAsync:

import { LoggerModule } from 'pino-nestjs'; 

@Module({
  imports: [
    LoggerModule.forRoot({
      useExisting: true,
    }),
  ],
})
class MyModule {} 
Copy to clipboardErrorCopied
When working with Fastify and pino-nestjs together, you need to understand how logger instances are managed:

Request vs. Application Context:

Fastify creates a logger with your configuration for each request
NestJS has additional execution contexts (like lifecycle events) that occur outside request context
For these non-request contexts, Logger/PinoLogger services use a separate pino instance configured via forRoot/forRootAsync
Configuration Sharing Issues:

When configuring pino via FastifyAdapter, there’s no way to extract that configuration and apply it to the out-of-context logger
Without explicit configuration in forRoot/forRootAsync, the out-of-context logger will use default parameters
Potential Solutions:

For consistency, you must provide identical configurations to both Fastify and LoggerModule
A better approach is to configure only through LoggerModule and drop the useExisting option entirely
When to use useExisting: true:

Only when you don’t need logging for lifecycle events and application-level logging
Only when using pino with default parameters in Fastify-based NestJS apps
For all other scenarios, using useExisting: true will lead to either code duplication or unexpected behavior.

Assigning extra fields for future calls
You can enrich your logs using the assign method of PinoLogger:

// my.controller.ts
@Controller('/')
class TestController {
  constructor(
    private readonly logger: PinoLogger,
    private readonly service: MyService,
  ) {}

  @Get()
  get() {
    // Assign extra fields in one place...
    this.logger.assign({ userID: '42' });
    return this.service.test();
  }
}
Copy to clipboardErrorCopied
// my.service.ts
@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  test() {
    // ...and it will be logged in another place
    this.logger.log('hello world');
  }
}
Copy to clipboardErrorCopied
Set the assignResponse parameter to true to also enrich request completion logs.

Changing Pino parameters at runtime
You can modify the pino root logger parameters at runtime:

// my.controller.ts
@Controller('/')
class MyController {
  @Post('/change-logging-level')
  setLevel() {
    PinoLogger.root.level = 'info';
    return null;
  }
}
Copy to clipboardErrorCopied
Exposing stack trace and error class in err property
Use the provided interceptor to expose detailed error information:

import { LoggerErrorInterceptor } from 'pino-nestjs';

const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggerErrorInterceptor());
Copy to clipboardErrorCopied
Frequently asked questions
Q: How do I disable automatic request/response logs?
A: Use the autoLogging field of pino-http in the pinoHttp configuration.

Q: How do I pass X-Request-ID header or generate UUID for req.id?
A: Use the genReqId field of pino-http in the pinoHttp configuration.

Q: How does it work?
A: It uses pino-http to create a child-logger for each request, and with AsyncLocalStorage, Logger and PinoLogger can access it from any service. This allows logs to be grouped by req.id.

Q: Why useAsyncLocalStorage instead of REQUEST scope?
A: REQUEST scope can have performance issues as it creates new instances of each service per request.

Q: What about pino built-in methods/levels?
A: Here’s the mapping between methods:

pino	PinoLogger	NestJS Logger
trace	trace	verbose
debug	debug	debug
info	info	log
warn	warn	warn
error	error	error
fatal	fatal	fatal (since nestjs@10.2)
Q: I use Fastify and want to configure pino at the Adapter level. Can I use that config for the logger?
A: You can use useExisting: true, but there are caveats. For most use cases, this is not recommended.
