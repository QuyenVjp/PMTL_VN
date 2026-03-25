Configuration
Applications often run in different environments. Depending on the environment, different configuration settings should be used. For example, usually the local environment relies on specific database credentials, valid only for the local DB instance. The production environment would use a separate set of DB credentials. Since configuration variables change, best practice is to store configuration variables in the environment.

Externally defined environment variables are visible inside Node.js through the process.env global. We could try to solve the problem of multiple environments by setting the environment variables separately in each environment. This can quickly get unwieldy, especially in the development and testing environments where these values need to be easily mocked and/or changed.

In Node.js applications, it's common to use .env files, holding key-value pairs where each key represents a particular value, to represent each environment. Running an app in different environments is then just a matter of swapping in the correct .env file.

A good approach for using this technique in Nest is to create a ConfigModule that exposes a ConfigService which loads the appropriate .env file. While you may choose to write such a module yourself, for convenience Nest provides the @nestjs/config package out-of-the box. We'll cover this package in the current chapter.

Installation#
To begin using it, we first install the required dependency.


$ npm i --save @nestjs/config
Hint
The @nestjs/config package internally uses dotenv.
Note
@nestjs/config requires TypeScript 4.1 or later.
Getting started#
Once the installation process is complete, we can import the ConfigModule. Typically, we'll import it into the root AppModule and control its behavior using the .forRoot() static method. During this step, environment variable key/value pairs are parsed and resolved. Later, we'll see several options for accessing the ConfigService class of the ConfigModule in our other feature modules.


app.module.tsJS

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
The above code will load and parse a .env file from the default location (the project root directory), merge key/value pairs from the .env file with environment variables assigned to process.env, and store the result in a private structure that you can access through the ConfigService. The forRoot() method registers the ConfigService provider, which provides a get() method for reading these parsed/merged configuration variables. Since @nestjs/config relies on dotenv, it uses that package's rules for resolving conflicts in environment variable names. When a key exists both in the runtime environment as an environment variable (e.g., via OS shell exports like export DATABASE_USER=test) and in a .env file, the runtime environment variable takes precedence.

A sample .env file looks something like this:


DATABASE_USER=test
DATABASE_PASSWORD=test
If you need some env variables to be available even before the ConfigModule is loaded and Nest application is bootstrapped (for example, to pass the microservice configuration to the NestFactory#createMicroservice method), you can use the --env-file option of the Nest CLI. This option allows you to specify the path to the .env file that should be loaded before the application starts. --env-file flag support was introduced in Node v20, see the documentation for more details.


$ nest start --env-file .env
Custom env file path#
By default, the package looks for a .env file in the root directory of the application. To specify another path for the .env file, set the envFilePath property of an (optional) options object you pass to forRoot(), as follows:



ConfigModule.forRoot({
  envFilePath: '.development.env',
});
You can also specify multiple paths for .env files like this:



ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
If a variable is found in multiple files, the first one takes precedence.

Disable env variables loading#
If you don't want to load the .env file, but instead would like to simply access environment variables from the runtime environment (as with OS shell exports like export DATABASE_USER=test), set the options object's ignoreEnvFile property to true, as follows:



ConfigModule.forRoot({
  ignoreEnvFile: true,
});
Use module globally#
When you want to use ConfigModule in other modules, you'll need to import it (as is standard with any Nest module). Alternatively, declare it as a global module by setting the options object's isGlobal property to true, as shown below. In that case, you will not need to import ConfigModule in other modules once it's been loaded in the root module (e.g., AppModule).



ConfigModule.forRoot({
  isGlobal: true,
});
Custom configuration files#
For more complex projects, you may utilize custom configuration files to return nested configuration objects. This allows you to group related configuration settings by function (e.g., database-related settings), and to store related settings in individual files to help manage them independently.

A custom configuration file exports a factory function that returns a configuration object. The configuration object can be any arbitrarily nested plain JavaScript object. The process.env object will contain the fully resolved environment variable key/value pairs (with .env file and externally defined variables resolved and merged as described above). Since you control the returned configuration object, you can add any required logic to cast values to an appropriate type, set default values, etc. For example:


config/configuration.tsJS

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});
We load this file using the load property of the options object we pass to the ConfigModule.forRoot() method:



import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
export class AppModule {}
Notice
The value assigned to the load property is an array, allowing you to load multiple configuration files (e.g. load: [databaseConfig, authConfig])
With custom configuration files, we can also manage custom files such as YAML files. Here is an example of a configuration using YAML format:


http:
  host: 'localhost'
  port: 8080

db:
  postgres:
    url: 'localhost'
    port: 5432
    database: 'yaml-db'

  sqlite:
    database: 'sqlite.db'
To read and parse YAML files, we can leverage the js-yaml package.


$ npm i js-yaml
$ npm i -D @types/js-yaml
Once the package is installed, we use the yaml#load function to load the YAML file we just created above.


config/configuration.tsJS

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};
Note
Nest CLI does not automatically move your "assets" (non-TS files) to the dist folder during the build process. To make sure that your YAML files are copied, you have to specify this in the compilerOptions#assets object in the nest-cli.json file. As an example, if the config folder is at the same level as the src folder, add compilerOptions#assets with the value "assets": [{"include": "../config/*.yaml", "outDir": "./dist/config"}]. Read more here.
Just a quick note - configuration files aren't automatically validated, even if you're using the validationSchema option in NestJS's ConfigModule. If you need validation or want to apply any transformations, you'll have to handle that within the factory function where you have complete control over the configuration object. This allows you to implement any custom validation logic as needed.

For example, if you want to ensure that port is within a certain range, you can add a validation step to the factory function:


config/configuration.tsJS

export default () => {
  const config = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  if (config.http.port < 1024 || config.http.port > 49151) {
    throw new Error('HTTP port must be between 1024 and 49151');
  }

  return config;
};
Now, if the port is outside the specified range, the application will throw an error during startup.

Explore your graph with NestJS Devtools
 Graph visualizer
 Routes navigator
 Interactive playground
 CI/CD integration
Sign up

Using the ConfigService#
To access configuration values from our ConfigService, we first need to inject ConfigService. As with any provider, we need to import its containing module - the ConfigModule - into the module that will use it (unless you set the isGlobal property in the options object passed to the ConfigModule.forRoot() method to true). Import it into a feature module as shown below.


feature.module.tsJS

@Module({
  imports: [ConfigModule],
  // ...
})
Then we can inject it using standard constructor injection:



constructor(private configService: ConfigService) {}
Hint
The ConfigService is imported from the @nestjs/config package.
And use it in our class:



// get an environment variable
const dbUser = this.configService.get<string>('DATABASE_USER');

// get a custom configuration value
const dbHost = this.configService.get<string>('database.host');
As shown above, use the configService.get() method to get a simple environment variable by passing the variable name. You can do TypeScript type hinting by passing the type, as shown above (e.g., get<string>(...)). The get() method can also traverse a nested custom configuration object (created via a Custom configuration file), as shown in the second example above.

You can also get the whole nested custom configuration object using an interface as the type hint:



interface DatabaseConfig {
  host: string;
  port: number;
}

const dbConfig = this.configService.get<DatabaseConfig>('database');

// you can now use `dbConfig.port` and `dbConfig.host`
const port = dbConfig.port;
The get() method also takes an optional second argument defining a default value, which will be returned when the key doesn't exist, as shown below:



// use "localhost" when "database.host" is not defined
const dbHost = this.configService.get<string>('database.host', 'localhost');
ConfigService has two optional generics (type arguments). The first one is to help prevent accessing a config property that does not exist. Use it as shown below:



interface EnvironmentVariables {
  PORT: number;
  TIMEOUT: string;
}

// somewhere in the code
constructor(private configService: ConfigService<EnvironmentVariables>) {
  const port = this.configService.get('PORT', { infer: true });

  // TypeScript Error: this is invalid as the URL property is not defined in EnvironmentVariables
  const url = this.configService.get('URL', { infer: true });
}
With the infer property set to true, the ConfigService#get method will automatically infer the property type based on the interface, so for example, typeof port === "number" (if you're not using strictNullChecks flag from TypeScript) since PORT has a number type in the EnvironmentVariables interface.

Also, with the infer feature, you can infer the type of a nested custom configuration object's property, even when using dot notation, as follows:



constructor(private configService: ConfigService<{ database: { host: string } }>) {
  const dbHost = this.configService.get('database.host', { infer: true })!;
  // typeof dbHost === "string"                                          |
  //                                                                     +--> non-null assertion operator
}
The second generic relies on the first one, acting as a type assertion to get rid of all undefined types that ConfigService's methods can return when strictNullChecks is on. For instance:



// ...
constructor(private configService: ConfigService<{ PORT: number }, true>) {
  //                                                               ^^^^
  const port = this.configService.get('PORT', { infer: true });
  //    ^^^ The type of port will be 'number' thus you don't need TS type assertions anymore
}
Hint
To make sure the ConfigService#get method retrieves values exclusively from custom configuration files and ignores process.env variables, set the skipProcessEnv option to true in the options object of the ConfigModule's forRoot() method.
Configuration namespaces#
The ConfigModule allows you to define and load multiple custom configuration files, as shown in Custom configuration files above. You can manage complex configuration object hierarchies with nested configuration objects as shown in that section. Alternatively, you can return a "namespaced" configuration object with the registerAs() function as follows:


config/database.config.tsJS

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));
As with custom configuration files, inside your registerAs() factory function, the process.env object will contain the fully resolved environment variable key/value pairs (with .env file and externally defined variables resolved and merged as described above).

Hint
The registerAs function is exported from the @nestjs/config package.
Load a namespaced configuration with the load property of the forRoot() method's options object, in the same way you load a custom configuration file:



import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
})
export class AppModule {}
Now, to get the host value from the database namespace, use dot notation. Use 'database' as the prefix to the property name, corresponding to the name of the namespace (passed as the first argument to the registerAs() function):



const dbHost = this.configService.get<string>('database.host');
A reasonable alternative is to inject the database namespace directly. This allows us to benefit from strong typing:



constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}
Hint
The ConfigType is exported from the @nestjs/config package.
Namespaced configurations in modules#
To use a namespaced configuration as a configuration object for another module in your application, you can utilize the .asProvider() method of the configuration object. This method converts your namespaced configuration into a provider, which can then be passed to the forRootAsync() (or any equivalent method) of the module you want to use.

Here's an example:



import databaseConfig from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
})
To understand how the .asProvider() method functions, let's examine the return value:



// Return value of the .asProvider() method
{
  imports: [ConfigModule.forFeature(databaseConfig)],
  useFactory: (configuration: ConfigType<typeof databaseConfig>) => configuration,
  inject: [databaseConfig.KEY]
}
This structure allows you to seamlessly integrate namespaced configurations into your modules, ensuring that your application remains organized and modular, without writing boilerplate, repetitive code.

Cache environment variables#
As accessing process.env can be slow, you can set the cache property of the options object passed to ConfigModule.forRoot() to increase the performance of ConfigService#get method when it comes to variables stored in process.env.



ConfigModule.forRoot({
  cache: true,
});
Partial registration#
Thus far, we've processed configuration files in our root module (e.g., AppModule), with the forRoot() method. Perhaps you have a more complex project structure, with feature-specific configuration files located in multiple different directories. Rather than load all these files in the root module, the @nestjs/config package provides a feature called partial registration, which references only the configuration files associated with each feature module. Use the forFeature() static method within a feature module to perform this partial registration, as follows:



import databaseConfig from './config/database.config';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
Warning
In some circumstances, you may need to access properties loaded via partial registration using the onModuleInit() hook, rather than in a constructor. This is because the forFeature() method is run during module initialization, and the order of module initialization is indeterminate. If you access values loaded this way by another module, in a constructor, the module that the configuration depends upon may not yet have initialized. The onModuleInit() method runs only after all modules it depends upon have been initialized, so this technique is safe.
Schema validation#
It is standard practice to throw an exception during application startup if required environment variables haven't been provided or if they don't meet certain validation rules. The @nestjs/config package enables two different ways to do this:

Joi built-in validator. With Joi, you define an object schema and validate JavaScript objects against it.
A custom validate() function which takes environment variables as an input.
To use Joi, we must install Joi package:


$ npm install --save joi
Now we can define a Joi validation schema and pass it via the validationSchema property of the forRoot() method's options object, as shown below:


app.module.tsJS

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
  ],
})
export class AppModule {}
By default, all schema keys are considered optional. Here, we set default values for NODE_ENV and PORT which will be used if we don't provide these variables in the environment (.env file or process environment). Alternatively, we can use the required() validation method to require that a value must be defined in the environment (.env file or process environment). In this case, the validation step will throw an exception if we don't provide the variable in the environment. See Joi validation methods for more on how to construct validation schemas.

By default, unknown environment variables (environment variables whose keys are not present in the schema) are allowed and do not trigger a validation exception. By default, all validation errors are reported. You can alter these behaviors by passing an options object via the validationOptions key of the forRoot() options object. This options object can contain any of the standard validation options properties provided by Joi validation options. For example, to reverse the two settings above, pass options like this:


app.module.tsJS

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
The @nestjs/config package uses default settings of:

allowUnknown: controls whether or not to allow unknown keys in the environment variables. Default is true
abortEarly: if true, stops validation on the first error; if false, returns all errors. Defaults to false.
Note that once you decide to pass a validationOptions object, any settings you do not explicitly pass will default to Joi standard defaults (not the @nestjs/config defaults). For example, if you leave allowUnknowns unspecified in your custom validationOptions object, it will have the Joi default value of false. Hence, it is probably safest to specify both of these settings in your custom object.

Hint
To disable validation of predefined environment variables, set the validatePredefined attribute to false in the forRoot() method's options object. Predefined environment variables are process variables (process.env variables) that were set before the module was imported. For example, if you start your application with PORT=3000 node main.js, then PORT is a predefined environment variable.
Custom validate function#
Alternatively, you can specify a synchronousvalidate function that takes an object containing the environment variables (from env file and process) and returns an object containing validated environment variables so that you can convert/mutate them if needed. If the function throws an error, it will prevent the application from bootstrapping.

In this example, we'll proceed with the class-transformer and class-validator packages. First, we have to define:

a class with validation constraints,
a validate function that makes use of the plainToInstance and validateSync functions.

env.validation.tsJS

import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
With this in place, use the validate function as a configuration option of the ConfigModule, as follows:


app.module.tsJS

import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
  ],
})
export class AppModule {}
Custom getter functions#
ConfigService defines a generic get() method to retrieve a configuration value by key. We may also add getter functions to enable a little more natural coding style:


JS

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
Now we can use the getter function as follows:


app.service.tsJS

@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // Authentication is enabled
    }
  }
}
Environment variables loaded hook#
If a module configuration depends on the environment variables, and these variables are loaded from the .env file, you can use the ConfigModule.envVariablesLoaded hook to ensure that the file was loaded before interacting with the process.env object, see the following example:



export async function getStorageModule() {
  await ConfigModule.envVariablesLoaded;
  return process.env.STORAGE === 'S3' ? S3StorageModule : DefaultStorageModule;
}
This construction guarantees that after the ConfigModule.envVariablesLoaded Promise resolves, all configuration variables are loaded up.

Conditional module configuration#
There may be times where you want to conditionally load in a module and specify the condition in an env variable. Fortunately, @nestjs/config provides a ConditionalModule that allows you to do just that.



@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(FooModule, 'USE_FOO'),
  ],
})
export class AppModule {}
The above module would only load in the FooModule if in the .env file there is not a false value for the env variable USE_FOO. You can also pass a custom condition yourself, a function receiving the process.env reference that should return a boolean for the ConditionalModule to handle:



@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(
      FooBarModule,
      (env: NodeJS.ProcessEnv) => !!env['foo'] && !!env['bar'],
    ),
  ],
})
export class AppModule {}
It is important to be sure that when using the ConditionalModule you also have the ConfigModule loaded in the application, so that the ConfigModule.envVariablesLoaded hook can be properly referenced and utilized. If the hook is not flipped to true within 5 seconds, or a timeout in milliseconds, set by the user in the third options parameter of the registerWhen method, then the ConditionalModule will throw an error and Nest will abort starting the application.

Expandable variables#
The @nestjs/config package supports environment variable expansion. With this technique, you can create nested environment variables, where one variable is referred to within the definition of another. For example:


APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
With this construction, the variable SUPPORT_EMAIL resolves to 'support@mywebsite.com'. Note the use of the ${...} syntax to trigger resolving the value of the variable APP_URL inside the definition of SUPPORT_EMAIL.

Hint
For this feature, @nestjs/config package internally uses dotenv-expand.
Enable environment variable expansion using the expandVariables property in the options object passed to the forRoot() method of the ConfigModule, as shown below:


app.module.tsJS

@Module({
  imports: [
    ConfigModule.forRoot({
      // ...
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
Using in the main.ts#
While our config is stored in a service, it can still be used in the main.ts file. This way, you can use it to store variables such as the application port or the CORS host.

To access it, you must use the app.get() method, followed by the service reference:



const configService = app.get(ConfigService);
You can then use it as usual, by calling the get method with the configuration key:



const port = configService.get('PORT');





Database
Nest is database agnostic, allowing you to easily integrate with any SQL or NoSQL database. You have a number of options available to you, depending on your preferences. At the most general level, connecting Nest to a database is simply a matter of loading an appropriate Node.js driver for the database, just as you would with Express or Fastify.

You can also directly use any general purpose Node.js database integration library or ORM, such as MikroORM (see MikroORM recipe), Sequelize (see Sequelize integration), Knex.js (see Knex.js tutorial), TypeORM, and Prisma (see Prisma recipe), to operate at a higher level of abstraction.

For convenience, Nest provides tight integration with TypeORM and Sequelize out-of-the-box with the @nestjs/typeorm and @nestjs/sequelize packages respectively, which we'll cover in the current chapter, and Mongoose with @nestjs/mongoose, which is covered in this chapter. These integrations provide additional NestJS-specific features, such as model/repository injection, testability, and asynchronous configuration to make accessing your chosen database even easier.

TypeORM Integration
For integrating with SQL and NoSQL databases, Nest provides the @nestjs/typeorm package. TypeORM is the most mature Object Relational Mapper (ORM) available for TypeScript. Since it's written in TypeScript, it integrates well with the Nest framework.

To begin using it, we first install the required dependencies. In this chapter, we'll demonstrate using the popular MySQL Relational DBMS, but TypeORM provides support for many relational databases, such as PostgreSQL, Oracle, Microsoft SQL Server, SQLite, and even NoSQL databases like MongoDB. The procedure we walk through in this chapter will be the same for any database supported by TypeORM. You'll simply need to install the associated client API libraries for your selected database.


$ npm install --save @nestjs/typeorm typeorm mysql2
Once the installation process is complete, we can import the TypeOrmModule into the root AppModule.


app.module.tsJS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
Warning
Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
The forRoot() method supports all the configuration properties exposed by the DataSource constructor from the TypeORM package. In addition, there are several extra configuration properties described below.

retryAttempts	Number of attempts to connect to the database (default: 10)
retryDelay	Delay between connection retry attempts (ms) (default: 3000)
autoLoadEntities	If true, entities will be loaded automatically (default: false)
Hint
Learn more about the data source options here.
Once this is done, the TypeORM DataSource and EntityManager objects will be available to inject across the entire project (without needing to import any modules), for example:


app.module.tsJS

import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
Repository pattern#
TypeORM supports the repository design pattern, so each entity has its own repository. These repositories can be obtained from the database data source.

To continue the example, we need at least one entity. Let's define the User entity.


user.entity.tsJS

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
Hint
Learn more about entities in the TypeORM documentation.
The User entity file sits in the users directory. This directory contains all files related to the UsersModule. You can decide where to keep your model files, however, we recommend creating them near their domain, in the corresponding module directory.

To begin using the User entity, we need to let TypeORM know about it by inserting it into the entities array in the module forRoot() method options (unless you use a static glob path):


app.module.tsJS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
Next, let's look at the UsersModule:


users.module.tsJS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
This module uses the forFeature() method to define which repositories are registered in the current scope. With that in place, we can inject the UsersRepository into the UsersService using the @InjectRepository() decorator:


users.service.tsJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
Notice
Don't forget to import the UsersModule into the root AppModule.
If you want to use the repository outside of the module which imports TypeOrmModule.forFeature, you'll need to re-export the providers generated by it. You can do this by exporting the whole module, like this:


users.module.tsJS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
Now if we import UsersModule in UserHttpModule, we can use @InjectRepository(User) in the providers of the latter module.


users-http.module.tsJS

import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
Relations#
Relations are associations established between two or more tables. Relations are based on common fields from each table, often involving primary and foreign keys.

There are three types of relations:

One-to-one	Every row in the primary table has one and only one associated row in the foreign table. Use the @OneToOne() decorator to define this type of relation.
One-to-many / Many-to-one	Every row in the primary table has one or more related rows in the foreign table. Use the @OneToMany() and @ManyToOne() decorators to define this type of relation.
Many-to-many	Every row in the primary table has many related rows in the foreign table, and every record in the foreign table has many related rows in the primary table. Use the @ManyToMany() decorator to define this type of relation.
To define relations in entities, use the corresponding decorators. For example, to define that each User can have multiple photos, use the @OneToMany() decorator.


user.entity.tsJS

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
Hint
To learn more about relations in TypeORM, visit the TypeORM documentation.
Auto-load entities#
Manually adding entities to the entities array of the data source options can be tedious. In addition, referencing entities from the root module breaks application domain boundaries and causes leaking implementation details to other parts of the application. To address this issue, an alternative solution is provided. To automatically load entities, set the autoLoadEntities property of the configuration object (passed into the forRoot() method) to true, as shown below:


app.module.tsJS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
With that option specified, every entity registered through the forFeature() method will be automatically added to the entities array of the configuration object.

Warning
Note that entities that aren't registered through the forFeature() method, but are only referenced from the entity (via a relationship), won't be included by way of the autoLoadEntities setting.
Separating entity definition#
You can define an entity and its columns right in the model, using decorators. But some people prefer to define entities and their columns inside separate files using the "entity schemas".



import { EntitySchema } from 'typeorm';
import { User } from './user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  relations: {
    photos: {
      type: 'one-to-many',
      target: 'Photo', // the name of the PhotoSchema
    },
  },
});
Warning
If you provide the target option, the name option value has to be the same as the name of the target class. If you do not provide the target you can use any name.
Nest allows you to use an EntitySchema instance wherever an Entity is expected, for example:



import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
TypeORM Transactions#
A database transaction symbolizes a unit of work performed within a database management system against a database, and treated in a coherent and reliable way independent of other transactions. A transaction generally represents any change in a database (learn more).

There are many different strategies to handle TypeORM transactions. We recommend using the QueryRunner class because it gives full control over the transaction.

First, we need to inject the DataSource object into a class in the normal way:



@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}
}
Hint
The DataSource class is imported from the typeorm package.
Now, we can use this object to create a transaction.



async createMany(users: User[]) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.save(users[0]);
    await queryRunner.manager.save(users[1]);

    await queryRunner.commitTransaction();
  } catch (err) {
    // since we have errors lets rollback the changes we made
    await queryRunner.rollbackTransaction();
  } finally {
    // you need to release a queryRunner which was manually instantiated
    await queryRunner.release();
  }
}
Hint
Note that the dataSource is used only to create the QueryRunner. However, to test this class would require mocking the entire DataSource object (which exposes several methods). Thus, we recommend using a helper factory class (e.g., QueryRunnerFactory) and defining an interface with a limited set of methods required to maintain transactions. This technique makes mocking these methods pretty straightforward.
Explore your graph with NestJS Devtools
 Graph visualizer
 Routes navigator
 Interactive playground
 CI/CD integration
Sign up

Alternatively, you can use the callback-style approach with the transaction method of the DataSource object (read more).



async createMany(users: User[]) {
  await this.dataSource.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
Subscribers#
With TypeORM subscribers, you can listen to specific entity events.



import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
Warning
Event subscribers can not be request-scoped.
Now, add the UserSubscriber class to the providers array:



import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
Migrations#
Migrations provide a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data in the database. To generate, run, and revert migrations, TypeORM provides a dedicated CLI.

Migration classes are separate from the Nest application source code. Their lifecycle is maintained by the TypeORM CLI. Therefore, you are not able to leverage dependency injection and other Nest specific features with migrations. To learn more about migrations, follow the guide in the TypeORM documentation.

Multiple databases#
Some projects require multiple database connections. This can also be achieved with this module. To work with multiple connections, first create the connections. In this case, data source naming becomes mandatory.

Suppose you have an Album entity stored in its own database.



const defaultOptions = {
  type: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      entities: [User],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      entities: [Album],
    }),
  ],
})
export class AppModule {}
Notice
If you don't set the name for a data source, its name is set to default. Please note that you shouldn't have multiple connections without a name, or with the same name, otherwise they will get overridden.
Notice
If you are using TypeOrmModule.forRootAsync, you have to also set the data source name outside useFactory. For example:


TypeOrmModule.forRootAsync({
  name: 'albumsConnection',
  useFactory: ...,
  inject: ...,
}),
See this issue for more details.

At this point, you have User and Album entities registered with their own data source. With this setup, you have to tell the TypeOrmModule.forFeature() method and the @InjectRepository() decorator which data source should be used. If you do not pass any data source name, the default data source is used.



@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
You can also inject the DataSource or EntityManager for a given data source:



@Injectable()
export class AlbumsService {
  constructor(
    @InjectDataSource('albumsConnection')
    private dataSource: DataSource,
    @InjectEntityManager('albumsConnection')
    private entityManager: EntityManager,
  ) {}
}
It's also possible to inject any DataSource to the providers:



@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsConnection: DataSource) => {
        return new AlbumsService(albumsConnection);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
Testing#
When it comes to unit testing an application, we usually want to avoid making a database connection, keeping our test suites independent and their execution process as fast as possible. But our classes might depend on repositories that are pulled from the data source (connection) instance. How do we handle that? The solution is to create mock repositories. In order to achieve that, we set up custom providers. Each registered repository is automatically represented by an <EntityName>Repository token, where EntityName is the name of your entity class.

The @nestjs/typeorm package exposes the getRepositoryToken() function which returns a prepared token based on a given entity.



@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
})
export class UsersModule {}
Now a substitute mockRepository will be used as the UsersRepository. Whenever any class asks for UsersRepository using an @InjectRepository() decorator, Nest will use the registered mockRepository object.

Async configuration#
You may want to pass your repository module options asynchronously instead of statically. In this case, use the forRootAsync() method, which provides several ways to deal with async configuration.

One approach is to use a factory function:



TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [],
    synchronize: true,
  }),
});
Our factory behaves like any other asynchronous provider (e.g., it can be async and it's able to inject dependencies through inject).



TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  inject: [ConfigService],
});
Alternatively, you can use the useClass syntax:



TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
The construction above will instantiate TypeOrmConfigService inside TypeOrmModule and use it to provide an options object by calling createTypeOrmOptions(). Note that this means that the TypeOrmConfigService has to implement the TypeOrmOptionsFactory interface, as shown below:



@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    };
  }
}
In order to prevent the creation of TypeOrmConfigService inside TypeOrmModule and use a provider imported from a different module, you can use the useExisting syntax.



TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
This construction works the same as useClass with one critical difference - TypeOrmModule will lookup imported modules to reuse an existing ConfigService instead of instantiating a new one.

Hint
Make sure that the name property is defined at the same level as the useFactory, useClass, or useValue property. This will allow Nest to properly register the data source under the appropriate injection token.
Custom DataSource Factory#
In conjunction with async configuration using useFactory, useClass, or useExisting, you can optionally specify a dataSourceFactory function which will allow you to provide your own TypeORM data source rather than allowing TypeOrmModule to create the data source.

dataSourceFactory receives the TypeORM DataSourceOptions configured during async configuration using useFactory, useClass, or useExisting and returns a Promise that resolves a TypeORM DataSource.



TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  // Use useFactory, useClass, or useExisting
  // to configure the DataSourceOptions.
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  // dataSource receives the configured DataSourceOptions
  // and returns a Promise<DataSource>.
  dataSourceFactory: async (options) => {
    const dataSource = await new DataSource(options).initialize();
    return dataSource;
  },
});
Hint
The DataSource class is imported from the typeorm package.
Example#
A working example is available here.

Official enterprise support
 Providing technical guidance
 Performing in-depth code reviews
 Mentoring team members
 Advising best practices
Explore more

Sequelize Integration
An alternative to using TypeORM is to use the Sequelize ORM with the @nestjs/sequelize package. In addition, we leverage the sequelize-typescript package which provides a set of additional decorators to declaratively define entities.

To begin using it, we first install the required dependencies. In this chapter, we'll demonstrate using the popular MySQL Relational DBMS, but Sequelize provides support for many relational databases, such as PostgreSQL, MySQL, Microsoft SQL Server, SQLite, and MariaDB. The procedure we walk through in this chapter will be the same for any database supported by Sequelize. You'll simply need to install the associated client API libraries for your selected database.


$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
Once the installation process is complete, we can import the SequelizeModule into the root AppModule.


app.module.tsJS

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
The forRoot() method supports all the configuration properties exposed by the Sequelize constructor (read more). In addition, there are several extra configuration properties described below.

retryAttempts	Number of attempts to connect to the database (default: 10)
retryDelay	Delay between connection retry attempts (ms) (default: 3000)
autoLoadModels	If true, models will be loaded automatically (default: false)
keepConnectionAlive	If true, connection will not be closed on the application shutdown (default: false)
synchronize	If true, automatically loaded models will be synchronized (default: true)
Once this is done, the Sequelize object will be available to inject across the entire project (without needing to import any modules), for example:


app.service.tsJS

import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
Models#
Sequelize implements the Active Record pattern. With this pattern, you use model classes directly to interact with the database. To continue the example, we need at least one model. Let's define the User model.


user.model.tsJS

import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
Hint
Learn more about the available decorators here.
The User model file sits in the users directory. This directory contains all files related to the UsersModule. You can decide where to keep your model files, however, we recommend creating them near their domain, in the corresponding module directory.

To begin using the User model, we need to let Sequelize know about it by inserting it into the models array in the module forRoot() method options:


app.module.tsJS

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],
    }),
  ],
})
export class AppModule {}
Next, let's look at the UsersModule:


users.module.tsJS

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
This module uses the forFeature() method to define which models are registered in the current scope. With that in place, we can inject the UserModel into the UsersService using the @InjectModel() decorator:


users.service.tsJS

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
Notice
Don't forget to import the UsersModule into the root AppModule.
If you want to use the model outside of the module which imports SequelizeModule.forFeature, you'll need to re-export the providers generated by it. You can do this by exporting the whole module, like this:


users.module.tsJS

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule]
})
export class UsersModule {}
Now if we import UsersModule in UserHttpModule, we can use @InjectModel(User) in the providers of the latter module.


users-http.module.tsJS

import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
Relations#
Relations are associations established between two or more tables. Relations are based on common fields from each table, often involving primary and foreign keys.

There are three types of relations:

One-to-one	Every row in the primary table has one and only one associated row in the foreign table
One-to-many / Many-to-one	Every row in the primary table has one or more related rows in the foreign table
Many-to-many	Every row in the primary table has many related rows in the foreign table, and every record in the foreign table has many related rows in the primary table
To define relations in models, use the corresponding decorators. For example, to define that each User can have multiple photos, use the @HasMany() decorator.


user.model.tsJS

import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Photo } from '../photos/photo.model';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Photo)
  photos: Photo[];
}
Hint
To learn more about associations in Sequelize, read this chapter.
Auto-load models#
Manually adding models to the models array of the connection options can be tedious. In addition, referencing models from the root module breaks application domain boundaries and causes leaking implementation details to other parts of the application. To solve this issue, automatically load models by setting both autoLoadModels and synchronize properties of the configuration object (passed into the forRoot() method) to true, as shown below:


app.module.tsJS

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
With that option specified, every model registered through the forFeature() method will be automatically added to the models array of the configuration object.

Warning
Note that models that aren't registered through the forFeature() method, but are only referenced from the model (via an association), won't be included.
Sequelize Transactions#
A database transaction symbolizes a unit of work performed within a database management system against a database, and treated in a coherent and reliable way independent of other transactions. A transaction generally represents any change in a database (learn more).

There are many different strategies to handle Sequelize transactions. Below is a sample implementation of a managed transaction (auto-callback).

First, we need to inject the Sequelize object into a class in the normal way:



@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}
}
Hint
The Sequelize class is imported from the sequelize-typescript package.
Now, we can use this object to create a transaction.



async createMany() {
  try {
    await this.sequelize.transaction(async t => {
      const transactionHost = { transaction: t };

      await this.userModel.create(
          { firstName: 'Abraham', lastName: 'Lincoln' },
          transactionHost,
      );
      await this.userModel.create(
          { firstName: 'John', lastName: 'Boothe' },
          transactionHost,
      );
    });
  } catch (err) {
    // Transaction has been rolled back
    // err is whatever rejected the promise chain returned to the transaction callback
  }
}
Hint
Note that the Sequelize instance is used only to start the transaction. However, to test this class would require mocking the entire Sequelize object (which exposes several methods). Thus, we recommend using a helper factory class (e.g., TransactionRunner) and defining an interface with a limited set of methods required to maintain transactions. This technique makes mocking these methods pretty straightforward.
Migrations#
Migrations provide a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data in the database. To generate, run, and revert migrations, Sequelize provides a dedicated CLI.

Migration classes are separate from the Nest application source code. Their lifecycle is maintained by the Sequelize CLI. Therefore, you are not able to leverage dependency injection and other Nest specific features with migrations. To learn more about migrations, follow the guide in the Sequelize documentation.

Learn the right way!
 80+ chapters
 5+ hours of videos
 Official certificate
 Deep-dive sessions
Explore official courses

Multiple databases#
Some projects require multiple database connections. This can also be achieved with this module. To work with multiple connections, first create the connections. In this case, connection naming becomes mandatory.

Suppose you have an Album entity stored in its own database.



const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
Notice
If you don't set the name for a connection, its name is set to default. Please note that you shouldn't have multiple connections without a name, or with the same name, otherwise they will get overridden.
At this point, you have User and Album models registered with their own connection. With this setup, you have to tell the SequelizeModule.forFeature() method and the @InjectModel() decorator which connection should be used. If you do not pass any connection name, the default connection is used.



@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SequelizeModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
You can also inject the Sequelize instance for a given connection:



@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private sequelize: Sequelize,
  ) {}
}
It's also possible to inject any Sequelize instance to the providers:



@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsSequelize: Sequelize) => {
        return new AlbumsService(albumsSequelize);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
Testing#
When it comes to unit testing an application, we usually want to avoid making a database connection, keeping our test suites independent and their execution process as fast as possible. But our classes might depend on models that are pulled from the connection instance. How do we handle that? The solution is to create mock models. In order to achieve that, we set up custom providers. Each registered model is automatically represented by a <ModelName>Model token, where ModelName is the name of your model class.

The @nestjs/sequelize package exposes the getModelToken() function which returns a prepared token based on a given model.



@Module({
  providers: [
    UsersService,
    {
      provide: getModelToken(User),
      useValue: mockModel,
    },
  ],
})
export class UsersModule {}
Now a substitute mockModel will be used as the UserModel. Whenever any class asks for UserModel using an @InjectModel() decorator, Nest will use the registered mockModel object.

Async configuration#
You may want to pass your SequelizeModule options asynchronously instead of statically. In this case, use the forRootAsync() method, which provides several ways to deal with async configuration.

One approach is to use a factory function:



SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    models: [],
  }),
});
Our factory behaves like any other asynchronous provider (e.g., it can be async and it's able to inject dependencies through inject).



SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    models: [],
  }),
  inject: [ConfigService],
});
Alternatively, you can use the useClass syntax:



SequelizeModule.forRootAsync({
  useClass: SequelizeConfigService,
});
The construction above will instantiate SequelizeConfigService inside SequelizeModule and use it to provide an options object by calling createSequelizeOptions(). Note that this means that the SequelizeConfigService has to implement the SequelizeOptionsFactory interface, as shown below:



@Injectable()
class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    };
  }
}
In order to prevent the creation of SequelizeConfigService inside SequelizeModule and use a provider imported from a different module, you can use the useExisting syntax.



SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
This construction works the same as useClass with one critical difference - SequelizeModule will lookup imported modules to reuse an existing ConfigService instead of instantiating a new one.


Validation
It is best practice to validate the correctness of any data sent into a web application. To automatically validate incoming requests, Nest provides several pipes available right out-of-the-box:

ValidationPipe
ParseIntPipe
ParseBoolPipe
ParseArrayPipe
ParseUUIDPipe
The ValidationPipe makes use of the powerful class-validator package and its declarative validation decorators. The ValidationPipe provides a convenient approach to enforce validation rules for all incoming client payloads, where the specific rules are declared with simple annotations in local class/DTO declarations in each module.

Overview#
In the Pipes chapter, we went through the process of building simple pipes and binding them to controllers, methods or to the global app to demonstrate how the process works. Be sure to review that chapter to best understand the topics of this chapter. Here, we'll focus on various real world use cases of the ValidationPipe, and show how to use some of its advanced customization features.

Using the built-in ValidationPipe#
To begin using it, we first install the required dependency.


$ npm i --save class-validator class-transformer
Hint
The ValidationPipe is exported from the @nestjs/common package.
Because this pipe uses the class-validator and class-transformer libraries, there are many options available. You configure these settings via a configuration object passed to the pipe. Following are the built-in options:



export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
In addition to these, all class-validator options (inherited from the ValidatorOptions interface) are available:

Option	Type	Description
enableDebugMessages	boolean	If set to true, validator will print extra warning messages to the console when something is not right.
skipUndefinedProperties	boolean	If set to true then validator will skip validation of all properties that are undefined in the validating object.
skipNullProperties	boolean	If set to true then validator will skip validation of all properties that are null in the validating object.
skipMissingProperties	boolean	If set to true then validator will skip validation of all properties that are null or undefined in the validating object.
whitelist	boolean	If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators.
forbidNonWhitelisted	boolean	If set to true, instead of stripping non-whitelisted properties validator will throw an exception.
forbidUnknownValues	boolean	If set to true, attempts to validate unknown objects fail immediately.
disableErrorMessages	boolean	If set to true, validation errors will not be returned to the client.
errorHttpStatusCode	number	This setting allows you to specify which exception type will be used in case of an error. By default it throws BadRequestException.
exceptionFactory	Function	Takes an array of the validation errors and returns an exception object to be thrown.
groups	string[]	Groups to be used during validation of the object.
always	boolean	Set default for always option of decorators. Default can be overridden in decorator options.
strictGroups	boolean	If groups is not given or is empty, ignore decorators with at least one group.
dismissDefaultMessages	boolean	If set to true, the validation will not use default messages. Error message always will be undefined if its not explicitly set.
validationError.target	boolean	Indicates if target should be exposed in ValidationError.
validationError.value	boolean	Indicates if validated value should be exposed in ValidationError.
stopAtFirstError	boolean	When set to true, validation of the given property will stop after encountering the first error. Defaults to false.
Notice
Find more information about the class-validator package in its repository.
Auto-validation#
We'll start by binding ValidationPipe at the application level, thus ensuring all endpoints are protected from receiving incorrect data.



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
To test our pipe, let's create a basic endpoint.



@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
Hint
Since TypeScript does not store metadata about generics or interfaces, when you use them in your DTOs, ValidationPipe may not be able to properly validate incoming data. For this reason, consider using concrete classes in your DTOs.
Hint
When importing your DTOs, you can't use a type-only import as that would be erased at runtime, i.e. remember to import { CreateUserDto } instead of import type { CreateUserDto }.
Now we can add a few validation rules in our CreateUserDto. We do this using decorators provided by the class-validator package, described in detail here. In this fashion, any route that uses the CreateUserDto will automatically enforce these validation rules.



import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
With these rules in place, if a request hits our endpoint with an invalid email property in the request body, the application will automatically respond with a 400 Bad Request code, along with the following response body:


{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
In addition to validating request bodies, the ValidationPipe can be used with other request object properties as well. Imagine that we would like to accept :id in the endpoint path. To ensure that only numbers are accepted for this request parameter, we can use the following construct:



@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator. It would look like this:



import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}
Disable detailed errors#
Error messages can be helpful to explain what was incorrect in a request. However, some production environments prefer to disable detailed errors. Do this by passing an options object to the ValidationPipe:



app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);
As a result, detailed error messages won't be displayed in the response body.

Stripping properties#
Our ValidationPipe can also filter out properties that should not be received by the method handler. In this case, we can whitelist the acceptable properties, and any property not included in the whitelist is automatically stripped from the resulting object. For example, if our handler expects email and password properties, but a request also includes an age property, this property can be automatically removed from the resulting DTO. To enable such behavior, set whitelist to true.



app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);
When set to true, this will automatically remove non-whitelisted properties (those without any decorator in the validation class).

Alternatively, you can stop the request from processing when non-whitelisted properties are present, and return an error response to the user. To enable this, set the forbidNonWhitelisted option property to true, in combination with setting whitelist to true.

Learn the right way!
 80+ chapters
 5+ hours of videos
 Official certificate
 Deep-dive sessions
Explore official courses

Transform payload objects#
Payloads coming in over the network are plain JavaScript objects. The ValidationPipe can automatically transform payloads to be objects typed according to their DTO classes. To enable auto-transformation, set transform to true. This can be done at a method level:


cats.controller.tsJS

@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
To enable this behavior globally, set the option on a global pipe:



app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);
With the auto-transformation option enabled, the ValidationPipe will also perform conversion of primitive types. In the following example, the findOne() method takes one argument which represents an extracted id path parameter:



@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
By default, every path parameter and query parameter comes over the network as a string. In the above example, we specified the id type as a number (in the method signature). Therefore, the ValidationPipe will try to automatically convert a string identifier to a number.

Explicit conversion#
In the above section, we showed how the ValidationPipe can implicitly transform query and path parameters based on the expected type. However, this feature requires having auto-transformation enabled.

Alternatively (with auto-transformation disabled), you can explicitly cast values using the ParseIntPipe or ParseBoolPipe (note that ParseStringPipe is not needed because, as mentioned earlier, every path parameter and query parameter comes over the network as a string by default).



@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}
Hint
The ParseIntPipe and ParseBoolPipe are exported from the @nestjs/common package.
Mapped types#
As you build out features like CRUD (Create/Read/Update/Delete) it's often useful to construct variants on a base entity type. Nest provides several utility functions that perform type transformations to make this task more convenient.

Warning
If your application uses the @nestjs/swagger package, see this chapter for more information about Mapped Types. Likewise, if you use the @nestjs/graphql package see this chapter. Both packages heavily rely on types and so they require a different import to be used. Therefore, if you used @nestjs/mapped-types (instead of an appropriate one, either @nestjs/swagger or @nestjs/graphql depending on the type of your app), you may face various, undocumented side-effects.
When building input validation types (also called DTOs), it's often useful to build create and update variations on the same type. For example, the create variant may require all fields, while the update variant may make all fields optional.

Nest provides the PartialType() utility function to make this task easier and minimize boilerplate.

The PartialType() function returns a type (class) with all the properties of the input type set to optional. For example, suppose we have a create type as follows:



export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
By default, all of these fields are required. To create a type with the same fields, but with each one optional, use PartialType() passing the class reference (CreateCatDto) as an argument:



export class UpdateCatDto extends PartialType(CreateCatDto) {}
Hint
The PartialType() function is imported from the @nestjs/mapped-types package.
The PickType() function constructs a new type (class) by picking a set of properties from an input type. For example, suppose we start with a type like:



export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
We can pick a set of properties from this class using the PickType() utility function:



export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
Hint
The PickType() function is imported from the @nestjs/mapped-types package.
The OmitType() function constructs a type by picking all properties from an input type and then removing a particular set of keys. For example, suppose we start with a type like:



export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
We can generate a derived type that has every property exceptname as shown below. In this construct, the second argument to OmitType is an array of property names.



export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
Hint
The OmitType() function is imported from the @nestjs/mapped-types package.
The IntersectionType() function combines two types into one new type (class). For example, suppose we start with two types like:



export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}
We can generate a new type that combines all properties in both types.



export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
Hint
The IntersectionType() function is imported from the @nestjs/mapped-types package.
The type mapping utility functions are composable. For example, the following will produce a type (class) that has all of the properties of the CreateCatDto type except for name, and those properties will be set to optional:



export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
Parsing and validating arrays#
TypeScript does not store metadata about generics or interfaces, so when you use them in your DTOs, ValidationPipe may not be able to properly validate incoming data. For instance, in the following code, createUserDtos won't be correctly validated:



@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
To validate the array, create a dedicated class which contains a property that wraps the array, or use the ParseArrayPipe.



@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
In addition, the ParseArrayPipe may come in handy when parsing query parameters. Let's consider a findByIds() method that returns users based on identifiers passed as query parameters.



@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
This construction validates the incoming query parameters from an HTTP GET request like the following:


GET /?ids=1,2,3
WebSockets and Microservices#
While this chapter shows examples using HTTP style applications (e.g., Express or Fastify), the ValidationPipe works the same for WebSockets and microservices, regardless of the transport method that is used.



Logger
Nest comes with a built-in text-based logger which is used during application bootstrapping and several other circumstances such as displaying caught exceptions (i.e., system logging). This functionality is provided via the Logger class in the @nestjs/common package. You can fully control the behavior of the logging system, including any of the following:

disable logging entirely
specify the log level of detail (e.g., display errors, warnings, debug information, etc.)
configure formatting of log messages (raw, json, colorized, etc.)
override timestamp in the default logger (e.g., use ISO8601 standard as date format)
completely override the default logger
customize the default logger by extending it
make use of dependency injection to simplify composing and testing your application
You can also make use of the built-in logger, or create your own custom implementation, to log your own application-level events and messages.

If your application requires integration with external logging systems, automatic file-based logging, or forwarding logs to a centralized logging service, you can implement a fully custom logging solution using a Node.js logging library. One popular choice is Pino, known for its high performance and flexibility.

Basic customization#
To disable logging, set the logger property to false in the (optional) Nest application options object passed as the second argument to the NestFactory.create() method.



const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);
To enable specific logging levels, set the logger property to an array of strings specifying the log levels to display, as follows:



const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);
Values in the array can be any combination of 'log', 'fatal', 'error', 'warn', 'debug', and 'verbose'.

Hint
Log levels in Nest are cascading (inherited). This means that providing a specific log level (like 'log') will automatically include all higher-severity levels (e.g., 'warn', 'error', and 'fatal').
To disable colorized output, pass the ConsoleLogger object with the colors property set to false as the value of the logger property.



const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});
To configure a prefix for each log message, pass the ConsoleLogger object with the prefix attribute set:



const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});
Here are all the available options listed in the table below:

Option	Description	Default
logLevels	Enabled log levels.	['log', 'fatal', 'error', 'warn', 'debug', 'verbose']
timestamp	If enabled, will print timestamp (time difference) between current and previous log message. Note: This option is not used when json is enabled.	false
prefix	A prefix to be used for each log message. Note: This option is not used when json is enabled.	Nest
json	If enabled, will print the log message in JSON format.	false
colors	If enabled, will print the log message in color. Default true if json is disabled, false otherwise.	true
context	The context of the logger.	undefined
compact	If enabled, will print the log message in a single line, even if it is an object with multiple properties. If set to a number, the most n inner elements are united on a single line as long as all properties fit into breakLength. Short array elements are also grouped together.	true
maxArrayLength	Specifies the maximum number of Array, TypedArray, Map, Set, WeakMap, and WeakSet elements to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no elements. Ignored when json is enabled, colors are disabled, and compact is set to true as it produces a parseable JSON output.	100
maxStringLength	Specifies the maximum number of characters to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no characters. Ignored when json is enabled, colors are disabled, and compact is set to true as it produces a parseable JSON output.	10000
sorted	If enabled, will sort keys while formatting objects. Can also be a custom sorting function. Ignored when json is enabled, colors are disabled, and compact is set to true as it produces a parseable JSON output.	false
depth	Specifies the number of times to recurse while formatting object. This is useful for inspecting large objects. To recurse up to the maximum call stack size pass Infinity or null. Ignored when json is enabled, colors are disabled, and compact is set to true as it produces a parseable JSON output.	5
showHidden	If true, object's non-enumerable symbols and properties are included in the formatted result. WeakMap and WeakSet entries are also included as well as user defined prototype properties	false
breakLength	The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with "compact" set to true). Default Infinity when "compact" is true, 80 otherwise. Ignored when json is enabled, colors are disabled, and compact is set to true as it produces a parseable JSON output.	Infinity
JSON logging#
JSON logging is essential for modern application observability and integration with log management systems. To enable JSON logging in your NestJS application, configure the ConsoleLogger object with its json property set to true. Then, provide this logger configuration as the value for the logger property when creating the application instance.



const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});
This configuration outputs logs in a structured JSON format, making it easier to integrate with external systems such as log aggregators and cloud platforms. For example, platforms like AWS ECS (Elastic Container Service) natively support JSON logs, enabling advanced features like:

Log Filtering: Easily narrow down logs based on fields like log level, timestamp, or custom metadata.
Search and Analysis: Use query tools to analyze and track trends in your application's behavior.
Additionally, if you're using NestJS Mau, JSON logging simplifies the process of viewing logs in a well-organized, structured format, which is especially useful for debugging and performance monitoring.

Note
When json is set to true, the ConsoleLogger automatically disables text colorization by setting the colors property to false. This ensures that the output remains valid JSON, free of formatting artifacts. However, for development purposes, you can override this behavior by explicitly setting colors to true. This adds colorized JSON logs, which can make log entries more readable during local debugging.
When JSON logging is enabled, the log output will look like this (in a single line):


{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}
You can see different variants in this Pull Request.

Using the logger for application logging#
We can combine several of the techniques above to provide consistent behavior and formatting across both Nest system logging and our own application event/message logging.

A good practice is to instantiate Logger class from @nestjs/common in each of our services. We can supply our service name as the context argument in the Logger constructor, like so:



import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
  }
}
In the default logger implementation, context is printed in the square brackets, like NestFactory in the example below:


[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...
If we supply a custom logger via app.useLogger(), it will actually be used by Nest internally. That means that our code remains implementation agnostic, while we can easily substitute the default logger for our custom one by calling app.useLogger().

That way if we follow the steps from the previous section and call app.useLogger(app.get(MyLogger)), the following calls to this.logger.log() from MyService would result in calls to method log from MyLogger instance.

This should be suitable for most cases. But if you need more customization (like adding and calling custom methods), move to the next section.

Logs with timestamps#
To enable timestamp logging for every logged message, you can use the optional timestamp: true setting when creating the logger instance.



import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name, { timestamp: true });

  doSomething() {
    this.logger.log('Doing something with timestamp here ->');
  }
}
This will produce output in the following format:


[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms
Note the +5ms at the end of the line. For each log statement, the time difference from the previous message is calculated and displayed at the end of the line.

Custom implementation#
You can provide a custom logger implementation to be used by Nest for system logging by setting the value of the logger property to an object that fulfills the LoggerService interface. For example, you can tell Nest to use the built-in global JavaScript console object (which implements the LoggerService interface), as follows:



const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);
Implementing your own custom logger is straightforward. Simply implement each of the methods of the LoggerService interface as shown below.



import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {}

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {}
}
You can then supply an instance of MyLogger via the logger property of the Nest application options object.



const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);
This technique, while simple, doesn't utilize dependency injection for the MyLogger class. This can pose some challenges, particularly for testing, and limit the reusability of MyLogger. For a better solution, see the Dependency Injection section below.

Extend built-in logger#
Rather than writing a logger from scratch, you may be able to meet your needs by extending the built-in ConsoleLogger class and overriding selected behavior of the default implementation.



import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(...arguments);
  }
}
You can use such an extended logger in your feature modules as described in the Using the logger for application logging section below.

You can tell Nest to use your extended logger for system logging by passing an instance of it via the logger property of the application options object (as shown in the Custom implementation section above), or by using the technique shown in the Dependency Injection section below. If you do so, you should take care to call super, as shown in the sample code above, to delegate the specific log method call to the parent (built-in) class so that Nest can rely on the built-in features it expects.

Learn the right way!
 80+ chapters
 5+ hours of videos
 Official certificate
 Deep-dive sessions
Explore official courses

Dependency injection#
For more advanced logging functionality, you'll want to take advantage of dependency injection. For example, you may want to inject a ConfigService into your logger to customize it, and in turn inject your custom logger into other controllers and/or providers. To enable dependency injection for your custom logger, create a class that implements LoggerService and register that class as a provider in some module. For example, you can

Define a MyLogger class that either extends the built-in ConsoleLogger or completely overrides it, as shown in previous sections. Be sure to implement the LoggerService interface.
Create a LoggerModule as shown below, and provide MyLogger from that module.


import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
With this construct, you are now providing your custom logger for use by any other module. Because your MyLogger class is part of a module, it can use dependency injection (for example, to inject a ConfigService). There's one more technique needed to provide this custom logger for use by Nest for system logging (e.g., for bootstrapping and error handling).

Because application instantiation (NestFactory.create()) happens outside the context of any module, it doesn't participate in the normal Dependency Injection phase of initialization. So we must ensure that at least one application module imports the LoggerModule to trigger Nest to instantiate a singleton instance of our MyLogger class.

We can then instruct Nest to use the same singleton instance of MyLogger with the following construction:



const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);
Note
In the example above, we set the bufferLogs to true to make sure all logs will be buffered until a custom logger is attached (MyLogger in this case) and the application initialisation process either completes or fails. If the initialisation process fails, Nest will fallback to the original ConsoleLogger to print out any reported error messages. Also, you can set the autoFlushLogs to false (default true) to manually flush logs (using the Logger.flush() method).
Here we use the get() method on the NestApplication instance to retrieve the singleton instance of the MyLogger object. This technique is essentially a way to "inject" an instance of a logger for use by Nest. The app.get() call retrieves the singleton instance of MyLogger, and depends on that instance being first injected in another module, as described above.

You can also inject this MyLogger provider in your feature classes, thus ensuring consistent logging behavior across both Nest system logging and application logging. See Using the logger for application logging and Injecting a custom logger below for more information.

Injecting a custom logger#
To start, extend the built-in logger with code like the following. We supply the scope option as configuration metadata for the ConsoleLogger class, specifying a transient scope, to ensure that we'll have a unique instance of the MyLogger in each feature module. In this example, we do not extend the individual ConsoleLogger methods (like log(), warn(), etc.), though you may choose to do so.



import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}
Next, create a LoggerModule with a construction like this:



import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
Next, import the LoggerModule into your feature module. Since we extended default Logger we have the convenience of using setContext method. So we can start using the context-aware custom logger, like this:



import { Injectable } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(private myLogger: MyLogger) {
    // Due to transient scope, CatsService has its own unique instance of MyLogger,
    // so setting context here will not affect other instances in other services
    this.myLogger.setContext('CatsService');
  }

  findAll(): Cat[] {
    // You can call all the default methods
    this.myLogger.warn('About to return cats!');
    // And your custom methods
    this.myLogger.customLog();
    return this.cats;
  }
}
Finally, instruct Nest to use an instance of the custom logger in your main.ts file as shown below. Of course in this example, we haven't actually customized the logger behavior (by extending the Logger methods like log(), warn(), etc.), so this step isn't actually needed. But it would be needed if you added custom logic to those methods and wanted Nest to use the same implementation.



const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(new MyLogger());
await app.listen(process.env.PORT ?? 3000);
Hint
Alternatively, instead of setting bufferLogs to true, you could temporarily disable the logger with logger: false instruction. Be mindful that if you supply logger: false to NestFactory.create, nothing will be logged until you call useLogger, so you may miss some important initialization errors. If you don't mind that some of your initial messages will be logged with the default logger, you can just omit the logger: false option.
Use external logger#
Production applications often have specific logging requirements, including advanced filtering, formatting and centralized logging. Nest's built-in logger is used for monitoring Nest system behavior, and can also be useful for basic formatted text logging in your feature modules while in development, but production applications often take advantage of dedicated logging modules like Winston. As with any standard Node.js application, you can take full advantage of such modules in Nest.



Authorization
Authorization refers to the process that determines what a user is able to do. For example, an administrative user is allowed to create, edit, and delete posts. A non-administrative user is only authorized to read the posts.

Authorization is orthogonal and independent from authentication. However, authorization requires an authentication mechanism.

There are many different approaches and strategies to handle authorization. The approach taken for any project depends on its particular application requirements. This chapter presents a few approaches to authorization that can be adapted to a variety of different requirements.

Basic RBAC implementation#
Role-based access control (RBAC) is a policy-neutral access-control mechanism defined around roles and privileges. In this section, we'll demonstrate how to implement a very basic RBAC mechanism using Nest guards.

First, let's create a Role enum representing roles in the system:


role.enum.tsJS

export enum Role {
  User = 'user',
  Admin = 'admin',
}
Hint
In more sophisticated systems, you may store roles within a database, or pull them from the external authentication provider.
With this in place, we can create a @Roles() decorator. This decorator allows specifying what roles are required to access specific resources.


roles.decorator.tsJS

import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
Now that we have a custom @Roles() decorator, we can use it to decorate any route handler.


cats.controller.tsJS

@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
Finally, we create a RolesGuard class which will compare the roles assigned to the current user to the actual roles required by the current route being processed. In order to access the route's role(s) (custom metadata), we'll use the Reflector helper class, which is provided out of the box by the framework and exposed from the @nestjs/core package.


roles.guard.tsJS

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
Hint
Refer to the Reflection and metadata section of the Execution context chapter for more details on utilizing Reflector in a context-sensitive way.
Notice
This example is named "basic" as we only check for the presence of roles on the route handler level. In real-world applications, you may have endpoints/handlers that involve several operations, in which each of them requires a specific set of permissions. In this case, you'll have to provide a mechanism to check roles somewhere within your business-logic, making it somewhat harder to maintain as there will be no centralized place that associates permissions with specific actions.
In this example, we assumed that request.user contains the user instance and allowed roles (under the roles property). In your app, you will probably make that association in your custom authentication guard - see authentication chapter for more details.

To make sure this example works, your User class must look as follows:



class User {
  // ...other properties
  roles: Role[];
}
Lastly, make sure to register the RolesGuard, for example, at the controller level, or globally:



providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
When a user with insufficient privileges requests an endpoint, Nest automatically returns the following response:



{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
Hint
If you want to return a different error response, you should throw your own specific exception instead of returning a boolean value.
Learn the right way!
 19 chapters
 Authn & Authz
 Official certificate
 Deep-dive sessions
Purchase the Authentication course

Claims-based authorization#
When an identity is created it may be assigned one or more claims issued by a trusted party. A claim is a name-value pair that represents what the subject can do, not what the subject is.

To implement a Claims-based authorization in Nest, you can follow the same steps we have shown above in the RBAC section with one significant difference: instead of checking for specific roles, you should compare permissions. Every user would have a set of permissions assigned. Likewise, each resource/endpoint would define what permissions are required (for example, through a dedicated @RequirePermissions() decorator) to access them.


cats.controller.tsJS

@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
Hint
In the example above, Permission (similar to Role we have shown in RBAC section) is a TypeScript enum that contains all the permissions available in your system.
Integrating CASL#
CASL is an isomorphic authorization library which restricts what resources a given client is allowed to access. It's designed to be incrementally adoptable and can easily scale between a simple claim based and fully featured subject and attribute based authorization.

To start, first install the @casl/ability package:


$ npm i @casl/ability
Hint
In this example, we chose CASL, but you can use any other library like accesscontrol or acl, depending on your preferences and project needs.
Once the installation is complete, for the sake of illustrating the mechanics of CASL, we'll define two entity classes: User and Article.



class User {
  id: number;
  isAdmin: boolean;
}
User class consists of two properties, id, which is a unique user identifier, and isAdmin, indicating whether a user has administrator privileges.



class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}
Article class has three properties, respectively id, isPublished, and authorId. id is a unique article identifier, isPublished indicates whether an article was already published or not, and authorId, which is an ID of a user who wrote the article.

Now let's review and refine our requirements for this example:

Admins can manage (create/read/update/delete) all entities
Users have read-only access to everything
Users can update their articles (article.authorId === userId)
Articles that are published already cannot be removed (article.isPublished === true)
With this in mind, we can start off by creating an Action enum representing all possible actions that the users can perform with entities:



export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
Notice
manage is a special keyword in CASL which represents "any action".
To encapsulate CASL library, let's generate the CaslModule and CaslAbilityFactory now.


$ nest g module casl
$ nest g class casl/casl-ability.factory
With this in place, we can define the createForUser() method on the CaslAbilityFactory. This method will create the Ability object for a given user:



type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
Notice
all is a special keyword in CASL that represents "any subject".
Hint
Since CASL v6, MongoAbility serves as the default ability class, replacing the legacy Ability to better support condition-based permissions using MongoDB-like syntax. Despite the name, it is not tied to MongoDB — it works with any kind of data by simply comparing objects against conditions written in Mongo-like syntax.
Hint
MongoAbility, AbilityBuilder, AbilityClass, and ExtractSubjectType classes are exported from the @casl/ability package.
Hint
detectSubjectType option let CASL understand how to get subject type out of an object. For more information read CASL documentation for details.
In the example above, we created the MongoAbility instance using the AbilityBuilder class. As you probably guessed, can and cannot accept the same arguments but have different meanings, can allows to do an action on the specified subject and cannot forbids. Both may accept up to 4 arguments. To learn more about these functions, visit the official CASL documentation.

Lastly, make sure to add the CaslAbilityFactory to the providers and exports arrays in the CaslModule module definition:



import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
With this in place, we can inject the CaslAbilityFactory to any class using standard constructor injection as long as the CaslModule is imported in the host context:



constructor(private caslAbilityFactory: CaslAbilityFactory) {}
Then use it in a class as follows.



const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}
Hint
Learn more about the MongoAbility class in the official CASL documentation.
For example, let's say we have a user who is not an admin. In this case, the user should be able to read articles, but creating new ones or removing the existing articles should be prohibited.



const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false
Hint
Although both MongoAbility and AbilityBuilder classes provide can and cannot methods, they have different purposes and accept slightly different arguments.
Also, as we have specified in our requirements, the user should be able to update its articles:



const user = new User();
user.id = 1;

const article = new Article();
article.authorId = user.id;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Update, article); // true

article.authorId = 2;
ability.can(Action.Update, article); // false
As you can see, MongoAbility instance allows us to check permissions in pretty readable way. Likewise, AbilityBuilder allows us to define permissions (and specify various conditions) in a similar fashion. To find more examples, visit the official documentation.

Advanced: Implementing a PoliciesGuard#
In this section, we'll demonstrate how to build a somewhat more sophisticated guard, which checks if a user meets specific authorization policies that can be configured on the method-level (you can extend it to respect policies configured on the class-level too). In this example, we are going to use the CASL package just for illustration purposes, but using this library is not required. Also, we will use the CaslAbilityFactory provider that we've created in the previous section.

First, let's flesh out the requirements. The goal is to provide a mechanism that allows specifying policy checks per route handler. We will support both objects and functions (for simpler checks and for those who prefer more functional-style code).

Let's start off by defining interfaces for policy handlers:



import { AppAbility } from '../casl/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
As mentioned above, we provided two possible ways of defining a policy handler, an object (instance of a class that implements the IPolicyHandler interface) and a function (which meets the PolicyHandlerCallback type).

With this in place, we can create a @CheckPolicies() decorator. This decorator allows specifying what policies have to be met to access specific resources.



export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
Now let's create a PoliciesGuard that will extract and execute all the policy handlers bound to a route handler.



@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
Hint
In this example, we assumed that request.user contains the user instance. In your app, you will probably make that association in your custom authentication guard - see authentication chapter for more details.
Let's break this example down. The policyHandlers is an array of handlers assigned to the method through the @CheckPolicies() decorator. Next, we use the CaslAbilityFactory#create method which constructs the Ability object, allowing us to verify whether a user has sufficient permissions to perform specific actions. We are passing this object to the policy handler which is either a function or an instance of a class that implements the IPolicyHandler, exposing the handle() method that returns a boolean. Lastly, we use the Array#every method to make sure that every handler returned true value.

Finally, to test this guard, bind it to any route handler, and register an inline policy handler (functional approach), as follows:



@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
findAll() {
  return this.articlesService.findAll();
}
Alternatively, we can define a class which implements the IPolicyHandler interface:



export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}
And use it as follows:



@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.articlesService.findAll();
}
Notice
Since we must instantiate the policy handler in-place using the new keyword, ReadArticlePolicyHandler class cannot use the Dependency Injection. This can be addressed with the ModuleRef#get method (read more here). Basically, instead of registering functions and instances through the @CheckPolicies() decorator, you must allow passing a Type<IPolicyHandler>. Then, inside your guard, you could retrieve an instance using a type reference: moduleRef.get(YOUR_HANDLER_TYPE) or even dynamically instantiate it using the ModuleRef#create method.


Encryption and Hashing
Encryption is the process of encoding information. This process converts the original representation of the information, known as plaintext, into an alternative form known as ciphertext. Ideally, only authorized parties can decipher a ciphertext back to plaintext and access the original information. Encryption does not itself prevent interference but denies the intelligible content to a would-be interceptor. Encryption is a two-way function; what is encrypted can be decrypted with the proper key.

Hashing is the process of converting a given key into another value. A hash function is used to generate the new value according to a mathematical algorithm. Once hashing has been done, it should be impossible to go from the output to the input.

Encryption#
Node.js provides a built-in crypto module that you can use to encrypt and decrypt strings, numbers, buffers, streams, and more. Nest itself does not provide any additional package on top of this module to avoid introducing unnecessary abstractions.

As an example, let's use AES (Advanced Encryption System) 'aes-256-ctr' algorithm CTR encryption mode.



import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);
Now to decrypt encryptedText value:



import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
Hashing#
For hashing, we recommend using either the bcrypt or argon2 packages. Nest itself does not provide any additional wrappers on top of these modules to avoid introducing unnecessary abstractions (making the learning curve short).

As an example, let's use bcrypt to hash a random password.

First install required packages:


$ npm i bcrypt
$ npm i -D @types/bcrypt
Once the installation is complete, you can use the hash function, as follows:



import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);
To generate a salt, use the genSalt function:



const salt = await bcrypt.genSalt();
To compare/check a password, use the compare function:



const isMatch = await bcrypt.compare(password, hash);
You can read more about available functions here.


CORS
Cross-origin resource sharing (CORS) is a mechanism that allows resources to be requested from another domain. Under the hood, Nest makes use of the Express cors or Fastify @fastify/cors packages depending on the underlying platform. These packages provide various options that you can customize based on your requirements.

Getting started#
To enable CORS, call the enableCors() method on the Nest application object.



const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
The enableCors() method takes an optional configuration object argument. The available properties of this object are described in the official CORS documentation. Another way is to pass a callback function that lets you define the configuration object asynchronously based on the request (on the fly).

Alternatively, enable CORS via the create() method's options object. Set the cors property to true to enable CORS with default settings. Or, pass a CORS configuration object or callback function as the cors property value to customize its behavior.



const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);


CSRF Protection
Cross-site request forgery (CSRF or XSRF) is a type of attack where unauthorized commands are sent from a trusted user to a web application. To help prevent this, you can use the csrf-csrf package.

Use with Express (default)#
Start by installing the required package:


$ npm i csrf-csrf
Warning
As noted in the csrf-csrf documentation, this middleware requires session middleware or cookie-parser to be initialized beforehand. Please refer to the documentation for further details.
Once the installation is complete, register the csrf-csrf middleware as global middleware.



import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
Use with Fastify#
Start by installing the required package:


$ npm i --save @fastify/csrf-protection
Once the installation is complete, register the @fastify/csrf-protection plugin, as follows:



import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
Warning
As explained in the @fastify/csrf-protection docs here, this plugin requires a storage plugin to be initialized first. Please, see that documentation for further instructions.

Rate Limiting
A common technique to protect applications from brute-force attacks is rate-limiting. To get started, you'll need to install the @nestjs/throttler package.


$ npm i --save @nestjs/throttler
Once the installation is complete, the ThrottlerModule can be configured as any other Nest package with forRoot or forRootAsync methods.


app.module.tsJS

@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class AppModule {}
The above will set the global options for the ttl, the time to live in milliseconds, and the limit, the maximum number of requests within the ttl, for the routes of your application that are guarded.

Once the module has been imported, you can then choose how you would like to bind the ThrottlerGuard. Any kind of binding as mentioned in the guards section is fine. If you wanted to bind the guard globally, for example, you could do so by adding this provider to any module:



{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}
Multiple Throttler Definitions#
There may come upon times where you want to set up multiple throttling definitions, like no more than 3 calls in a second, 20 calls in 10 seconds, and 100 calls in a minute. To do so, you can set up your definitions in the array with named options, that can later be referenced in the @SkipThrottle() and @Throttle() decorators to change the options again.


app.module.tsJS

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
})
export class AppModule {}
Customization#
There may be a time where you want to bind the guard to a controller or globally, but want to disable rate limiting for one or more of your endpoints. For that, you can use the @SkipThrottle() decorator, to negate the throttler for an entire class or a single route. The @SkipThrottle() decorator can also take in an object of string keys with boolean values for if there is a case where you want to exclude most of a controller, but not every route, and configure it per throttler set if you have more than one. If you do not pass an object, the default is to use { default: true }



@SkipThrottle()
@Controller('users')
export class UsersController {}
This @SkipThrottle() decorator can be used to skip a route or a class or to negate the skipping of a route in a class that is skipped.



@SkipThrottle()
@Controller('users')
export class UsersController {
  // Rate limiting is applied to this route.
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // This route will skip rate limiting.
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
There is also the @Throttle() decorator which can be used to override the limit and ttl set in the global module, to give tighter or looser security options. This decorator can be used on a class or a function as well. With version 5 and onwards, the decorator takes in an object with the string relating to the name of the throttler set, and an object with the limit and ttl keys and integer values, similar to the options passed to the root module. If you do not have a name set in your original options, use the string default. You have to configure it like this:



// Override default configuration for Rate limiting and duration.
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
Proxies#
If your application is running behind a proxy server, it’s essential to configure the HTTP adapter to trust the proxy. You can refer to the specific HTTP adapter options for Express and Fastify to enable the trust proxy setting.

Here's an example that demonstrates how to enable trust proxy for the Express adapter:


main.tsJS

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();
Enabling trust proxy allows you to retrieve the original IP address from the X-Forwarded-For header. You can also customize the behavior of your application by overriding the getTracker() method to extract the IP address from this header instead of relying on req.ip. The following example demonstrates how to achieve this for both Express and Fastify:


throttler-behind-proxy.guard.tsJS

import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }
}
Hint
You can find the API of the req Request object for express here and for fastify here.
Websockets#
This module can work with websockets, but it requires some class extension. You can extend the ThrottlerGuard and override the handleRequest method like so:



@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    const client = context.switchToWs().getClient();
    const tracker = client._socket.remoteAddress;
    const key = generateKey(context, tracker, throttler.name);
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name,
      );

    const getThrottlerSuffix = (name: string) =>
      name === 'default' ? '' : `-${name}`;

    // Throw an error when the user reached their limit.
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    return true;
  }
}
Hint
If you are using ws, it is necessary to replace the _socket with conn
There's a few things to keep in mind when working with WebSockets:

Guard cannot be registered with the APP_GUARD or app.useGlobalGuards()
When a limit is reached, Nest will emit an exception event, so make sure there is a listener ready for this
Hint
If you are using the @nestjs/platform-ws package you can use client._socket.remoteAddress instead.
GraphQL#
The ThrottlerGuard can also be used to work with GraphQL requests. Again, the guard can be extended, but this time the getRequestResponse method will be overridden



@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
Configuration#
The following options are valid for the object passed to the array of the ThrottlerModule's options:

name	the name for internal tracking of which throttler set is being used. Defaults to default if not passed
ttl	the number of milliseconds that each request will last in storage
limit	the maximum number of requests within the TTL limit
blockDuration	the number of milliseconds that request will be blocked for that time
ignoreUserAgents	an array of regular expressions of user-agents to ignore when it comes to throttling requests
skipIf	a function that takes in the ExecutionContext and returns a boolean to short circuit the throttler logic. Like @SkipThrottler(), but based on the request
If you need to set up storage instead, or want to use some of the above options in a more global sense, applying to each throttler set, you can pass the options above via the throttlers option key and use the below table

storage	a custom storage service for where the throttling should be kept track. See here.
ignoreUserAgents	an array of regular expressions of user-agents to ignore when it comes to throttling requests
skipIf	a function that takes in the ExecutionContext and returns a boolean to short circuit the throttler logic. Like @SkipThrottler(), but based on the request
throttlers	an array of throttler sets, defined using the table above
errorMessage	a string OR a function that takes in the ExecutionContext and the ThrottlerLimitDetail and returns a string which overrides the default throttler error message
getTracker	a function that takes in the Request and returns a string to override the default logic of the getTracker method
generateKey	a function that takes in the ExecutionContext, the tacker string and the throttler name as a string and returns a string to override the final key which will be used to store the rate limit value. This overrides the default logic of the generateKey method
Async Configuration#
You may want to get your rate-limiting configuration asynchronously instead of synchronously. You can use the forRootAsync() method, which allows for dependency injection and async methods.

One approach would be to use a factory function:



@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
})
export class AppModule {}
You can also use the useClass syntax:



@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
    }),
  ],
})
export class AppModule {}
This is doable, as long as ThrottlerConfigService implements the interface ThrottlerOptionsFactory.

Storages#
The built in storage is an in memory cache that keeps track of the requests made until they have passed the TTL set by the global options. You can drop in your own storage option to the storage option of the ThrottlerModule so long as the class implements the ThrottlerStorage interface.

For distributed servers you could use the community storage provider for Redis to have a single source of truth.

Note
ThrottlerStorage can be imported from @nestjs/throttler.
Time Helpers#
There are a couple of helper methods to make the timings more readable if you prefer to use them over the direct definition. @nestjs/throttler exports five different helpers, seconds, minutes, hours, days, and weeks. To use them, simply call seconds(5) or any of the other helpers, and the correct number of milliseconds will be returned.

Migration Guide#
For most people, wrapping your options in an array will be enough.

If you are using a custom storage, you should wrap your ttl and limit in an array and assign it to the throttlers property of the options object.

Any @SkipThrottle() decorator can be used to bypass throttling for specific routes or methods. It accepts an optional boolean parameter, which defaults to true. This is useful when you want to skip rate limiting on particular endpoints.

Any @Throttle() decorators should also now take in an object with string keys, relating to the names of the throttler contexts (again, 'default' if no name) and values of objects that have limit and ttl keys.

Important
The ttl is now in milliseconds. If you want to keep your ttl in seconds for readability, use the seconds helper from this package. It just multiplies the ttl by 1000 to make it in milliseconds.
For more info, see the Changelog



Session
HTTP sessions provide a way to store information about the user across multiple requests, which is particularly useful for MVC applications.

Use with Express (default)#
First install the required package (and its types for TypeScript users):


$ npm i express-session
$ npm i -D @types/express-session
Once the installation is complete, apply the express-session middleware as global middleware (for example, in your main.ts file).



import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);
Notice
The default server-side session storage is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing. Read more in the official repository.
The secret is used to sign the session ID cookie. This can be either a string for a single secret, or an array of multiple secrets. If an array of secrets is provided, only the first element will be used to sign the session ID cookie, while all the elements will be considered when verifying the signature in requests. The secret itself should be not easily parsed by a human and would best be a random set of characters.

Enabling the resave option forces the session to be saved back to the session store, even if the session was never modified during the request. The default value is true, but using the default has been deprecated, as the default will change in the future.

Likewise, enabling the saveUninitialized option Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with race conditions where a client makes multiple parallel requests without a session (source).

You can pass several other options to the session middleware, read more about them in the API documentation.

Hint
Please note that secure: true is a recommended option. However, it requires an https-enabled website, i.e., HTTPS is necessary for secure cookies. If secure is set, and you access your site over HTTP, the cookie will not be set. If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express.
With this in place, you can now set and read session values from within the route handlers, as follows:



@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}
Hint
The @Req() decorator is imported from the @nestjs/common, while Request from the express package.
Alternatively, you can use the @Session() decorator to extract a session object from the request, as follows:



@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}
Hint
The @Session() decorator is imported from the @nestjs/common package.
Use with Fastify#
First install the required package:


$ npm i @fastify/secure-session
Once the installation is complete, register the fastify-secure-session plugin:



import secureSession from '@fastify/secure-session';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
await app.register(secureSession, {
  secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
});
Hint
You can also pregenerate a key (see instructions) or use keys rotation.
Read more about the available options in the official repository.

With this in place, you can now set and read session values from within the route handlers, as follows:



@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}
Alternatively, you can use the @Session() decorator to extract a session object from the request, as follows:



@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}
Hint
The @Session() decorator is imported from the @nestjs/common, while secureSession.Session from the @fastify/secure-session package (import statement: import * as secureSession from '@fastify/secure-session'






Introduction
The OpenAPI specification is a language-agnostic definition format used to describe RESTful APIs. Nest provides a dedicated module which allows generating such a specification by leveraging decorators.

Installation#
To begin using it, we first install the required dependency.


$ npm install --save @nestjs/swagger
Bootstrap#
Once the installation process is complete, open the main.ts file and initialize Swagger using the SwaggerModule class:


main.tsJS

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
Hint
The factory method SwaggerModule.createDocument() is used specifically to generate the Swagger document when you request it. This approach helps save some initialization time, and the resulting document is a serializable object that conforms to the OpenAPI Document specification. Instead of serving the document over HTTP, you can also save it as a JSON or YAML file and use it in various ways.
The DocumentBuilder helps to structure a base document that conforms to the OpenAPI Specification. It provides several methods that allow setting such properties as title, description, version, etc. In order to create a full document (with all HTTP routes defined) we use the createDocument() method of the SwaggerModule class. This method takes two arguments, an application instance and a Swagger options object. Alternatively, we can provide a third argument, which should be of type SwaggerDocumentOptions. More on this in the Document options section.

Once we create a document, we can call the setup() method. It accepts:

The path to mount the Swagger UI
An application instance
The document object instantiated above
Optional configuration parameter (read more here)
Now you can run the following command to start the HTTP server:


$ npm run start
While the application is running, open your browser and navigate to http://localhost:3000/api. You should see the Swagger UI.


As you can see, the SwaggerModule automatically reflects all of your endpoints.

Hint
To generate and download a Swagger JSON file, navigate to http://localhost:3000/api-json (assuming that your Swagger documentation is available under http://localhost:3000/api). It is also possible to expose it on a route of your choice using only the setup method from @nestjs/swagger, like this:


SwaggerModule.setup('swagger', app, documentFactory, {
  jsonDocumentUrl: 'swagger/json',
});
Which would expose it at http://localhost:3000/swagger/json

Warning
When using fastify and helmet, there may be a problem with CSP, to solve this collision, configure the CSP as shown below:


app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    },
  },
});

// If you are not going to use CSP at all, you can use this:
app.register(helmet, {
  contentSecurityPolicy: false,
});
Document options#
When creating a document, it is possible to provide some extra options to fine tune the library's behavior. These options should be of type SwaggerDocumentOptions, which can be the following:


export interface SwaggerDocumentOptions {
  /**
   * List of modules to include in the specification
   */
  include?: Function[];

  /**
   * Additional, extra models that should be inspected and included in the specification
   */
  extraModels?: Function[];

  /**
   * If `true`, swagger will ignore the global prefix set through `setGlobalPrefix()` method
   */
  ignoreGlobalPrefix?: boolean;

  /**
   * If `true`, swagger will also load routes from the modules imported by `include` modules
   */
  deepScanRoutes?: boolean;

  /**
   * Custom operationIdFactory that will be used to generate the `operationId`
   * based on the `controllerKey`, `methodKey`, and version.
   * @default () => controllerKey_methodKey_version
   */
  operationIdFactory?: OperationIdFactory;

  /**
   * Custom linkNameFactory that will be used to generate the name of links
   * in the `links` field of responses
   *
   * @see [Link objects](https://swagger.io/docs/specification/links/)
   *
   * @default () => `${controllerKey}_${methodKey}_from_${fieldKey}`
   */
  linkNameFactory?: (
    controllerKey: string,
    methodKey: string,
    fieldKey: string
  ) => string;

  /*
   * Generate tags automatically based on the controller name.
   * If `false`, you must use the `@ApiTags()` decorator to define tags.
   * Otherwise, the controller name without the suffix `Controller` will be used.
   * @default true
   */
  autoTagControllers?: boolean;
}
For example, if you want to make sure that the library generates operation names like createUser instead of UsersController_createUser, you can set the following:


const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
Setup options#
You can configure Swagger UI by passing the options object which fulfills the SwaggerCustomOptions interface as a fourth argument of the SwaggerModule#setup method.


export interface SwaggerCustomOptions {
  /**
   * If `true`, Swagger resources paths will be prefixed by the global prefix set through `setGlobalPrefix()`.
   * Default: `false`.
   * @see https://docs.nestjs.com/faq/global-prefix
   */
  useGlobalPrefix?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   * @deprecated Use `ui` instead.
   */
  swaggerUiEnabled?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   */
  ui?: boolean;

  /**
   * If `true`, raw definitions for all formats will be served.
   * Alternatively, you can pass an array to specify the formats to be served, e.g., `raw: ['json']` to serve only JSON definitions.
   * If omitted or set to an empty array, no definitions (JSON or YAML) will be served.
   * Use this option to control the availability of Swagger-related endpoints.
   * Default: `true`.
   */
  raw?: boolean | Array<'json' | 'yaml'>;

  /**
   * Url point the API definition to load in Swagger UI.
   */
  swaggerUrl?: string;

  /**
   * Path of the JSON API definition to serve.
   * Default: `<path>-json`.
   */
  jsonDocumentUrl?: string;

  /**
   * Path of the YAML API definition to serve.
   * Default: `<path>-yaml`.
   */
  yamlDocumentUrl?: string;

  /**
   * Hook allowing to alter the OpenAPI document before being served.
   * It's called after the document is generated and before it is served as JSON & YAML.
   */
  patchDocumentOnRequest?: <TRequest = any, TResponse = any>(
    req: TRequest,
    res: TResponse,
    document: OpenAPIObject
  ) => OpenAPIObject;

  /**
   * If `true`, the selector of OpenAPI definitions is displayed in the Swagger UI interface.
   * Default: `false`.
   */
  explorer?: boolean;

  /**
   * Additional Swagger UI options
   */
  swaggerOptions?: SwaggerUiOptions;

  /**
   * Custom CSS styles to inject in Swagger UI page.
   */
  customCss?: string;

  /**
   * URL(s) of a custom CSS stylesheet to load in Swagger UI page.
   */
  customCssUrl?: string | string[];

  /**
   * URL(s) of custom JavaScript files to load in Swagger UI page.
   */
  customJs?: string | string[];

  /**
   * Custom JavaScript scripts to load in Swagger UI page.
   */
  customJsStr?: string | string[];

  /**
   * Custom favicon for Swagger UI page.
   */
  customfavIcon?: string;

  /**
   * Custom title for Swagger UI page.
   */
  customSiteTitle?: string;

  /**
   * File system path (ex: ./node_modules/swagger-ui-dist) containing static Swagger UI assets.
   */
  customSwaggerUiPath?: string;

  /**
   * @deprecated This property has no effect.
   */
  validatorUrl?: string;

  /**
   * @deprecated This property has no effect.
   */
  url?: string;

  /**
   * @deprecated This property has no effect.
   */
  urls?: Record<'url' | 'name', string>[];
}
Hint
ui and raw are independent options. Disabling Swagger UI (ui: false) does not disable API definitions (JSON/YAML). Conversely, disabling API definitions (raw: []) does not disable the Swagger UI.
For example, the following configuration will disable the Swagger UI but still allow access to API definitions:



const options: SwaggerCustomOptions = {
  ui: false, // Swagger UI is disabled
  raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
};
SwaggerModule.setup('api', app, options);
In this case, http://localhost:3000/api-json will still be accessible, but http://localhost:3000/api (Swagger UI) will not.

Example#
A working example is available here.


Prisma
Prisma is an open-source ORM for Node.js and TypeScript. It is used as an alternative to writing plain SQL, or using another database access tool such as SQL query builders (like knex.js) or ORMs (like TypeORM and Sequelize). Prisma currently supports PostgreSQL, MySQL, SQL Server, SQLite, MongoDB and CockroachDB (Preview).

While Prisma can be used with plain JavaScript, it embraces TypeScript and provides a level to type-safety that goes beyond the guarantees other ORMs in the TypeScript ecosystem. You can find an in-depth comparison of the type-safety guarantees of Prisma and TypeORM here.

Note
If you want to get a quick overview of how Prisma works, you can follow the Quickstart or read the Introduction in the documentation. There also are ready-to-run examples for REST and GraphQL in the prisma-examples repo.
Getting started#
In this recipe, you'll learn how to get started with NestJS and Prisma from scratch. You are going to build a sample NestJS application with a REST API that can read and write data in a database.

For the purpose of this guide, you'll use a SQLite database to save the overhead of setting up a database server. Note that you can still follow this guide, even if you're using PostgreSQL or MySQL – you'll get extra instructions for using these databases at the right places.

Note
If you already have an existing project and consider migrating to Prisma, you can follow the guide for adding Prisma to an existing project. If you are migrating from TypeORM, you can read the guide Migrating from TypeORM to Prisma.
Create your NestJS project#
To get started, install the NestJS CLI and create your app skeleton with the following commands:


$ npm install -g @nestjs/cli
$ nest new hello-prisma
See the First steps page to learn more about the project files created by this command. Note also that you can now run npm start to start your application. The REST API running at http://localhost:3000/ currently serves a single route that's implemented in src/app.controller.ts. Over the course of this guide, you'll implement additional routes to store and retrieve data about users and posts.

Set up Prisma#
Start by installing the Prisma CLI as a development dependency in your project:


$ cd hello-prisma
$ npm install prisma --save-dev
In the following steps, we'll be utilizing the Prisma CLI. As a best practice, it's recommended to invoke the CLI locally by prefixing it with npx:


$ npx prisma
Expand if you're using Yarn
Now create your initial Prisma setup using the init command of the Prisma CLI:


$ npx prisma init
This command creates a new prisma directory with the following contents:

schema.prisma: Specifies your database connection and contains the database schema
prisma.config.ts: A configuration file for your projects
.env: A dotenv file, typically used to store your database credentials in a group of environment variables
Set the generator output path#
Specify your output path for the generated Prisma client either by passing --output ../src/generated/prisma during prisma init, or directly in your Prisma schema:


generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
}
Configure the module format#
Set moduleFormat in the generator to cjs:


generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat    = "cjs"
}
Note
The moduleFormat configuration is required because Prisma v7 ships as an ES module by default, which does not work with NestJS's CommonJS setup. Setting moduleFormat to cjs forces Prisma to generate a CommonJS module instead of ESM.
Set the database connection#
Your database connection is configured in the datasource block in your schema.prisma file. By default it's set to postgresql, but since you're using a SQLite database in this guide you need to adjust the provider field of the datasource block to sqlite:


datasource db {
  provider = "sqlite"
}

generator client {
  provider      = "prisma-client"
  output        = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
Now, open up .env and adjust the DATABASE_URL environment variable to look as follows:


DATABASE_URL="file:./dev.db"
Make sure you have a ConfigModule configured, otherwise the DATABASE_URL variable will not be picked up from .env.

SQLite databases are simple files; no server is required to use a SQLite database. So instead of configuring a connection URL with a host and port, you can just point it to a local file which in this case is called dev.db. This file will be created in the next step.

Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL
Create two database tables with Prisma Migrate#
In this section, you'll create two new tables in your database using Prisma Migrate. Prisma Migrate generates SQL migration files for your declarative data model definition in the Prisma schema. These migration files are fully customizable so that you can configure any additional features of the underlying database or include additional commands, e.g. for seeding.

Add the following two models to your schema.prisma file:


model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
With your Prisma models in place, you can generate your SQL migration files and run them against the database. Run the following commands in your terminal:


$ npx prisma migrate dev --name init
This prisma migrate dev command generates SQL files and directly runs them against the database. In this case, the following migration files was created in the existing prisma directory:


$ tree prisma
prisma
├── dev.db
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma
Expand to view the generated SQL statements
Install and generate Prisma Client#
Prisma Client is a type-safe database client that's generated from your Prisma model definition. Because of this approach, Prisma Client can expose CRUD operations that are tailored specifically to your models.

To install Prisma Client in your project, run the following command in your terminal:


$ npm install @prisma/client
Once installed, you can run the generate command to generate the types and Client needed for your project. If any changes are made to your schema, you will need to rerun the generate command to keep those types in sync.


$ npx prisma generate
In addition to Prisma Client, you also need to a driver adapter for the type of database you are working with. For SQLite, you can install the @prisma/adapter-better-sqlite3 driver.


npm install @prisma/adapter-better-sqlite3
Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL
Use Prisma Client in your NestJS services#
You're now able to send database queries with Prisma Client. If you want to learn more about building queries with Prisma Client, check out the API documentation.

When setting up your NestJS application, you'll want to abstract away the Prisma Client API for database queries within a service. To get started, you can create a new PrismaService that takes care of instantiating PrismaClient and connecting to your database.

Inside the src directory, create a new file called prisma.service.ts and add the following code to it:



import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }
}
Next, you can write services that you can use to make database calls for the User and Post models from your Prisma schema.

Still inside the src directory, create a new file called user.service.ts and add the following code to it:



import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
Notice how you're using Prisma Client's generated types to ensure that the methods that are exposed by your service are properly typed. You therefore save the boilerplate of typing your models and creating additional interface or DTO files.

Now do the same for the Post model.

Still inside the src directory, create a new file called post.service.ts and add the following code to it:



import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
Your UsersService and PostsService currently wrap the CRUD queries that are available in Prisma Client. In a real world application, the service would also be the place to add business logic to your application. For example, you could have a method called updatePassword inside the UsersService that would be responsible for updating the password of a user.

Remember to register the new services in the app module.

Implement your REST API routes in the main app controller
Finally, you'll use the services you created in the previous sections to implement the different routes of your app. For the purpose of this guide, you'll put all your routes into the already existing AppController class.

Replace the contents of the app.controller.ts file with the following code:



import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { PostsService } from './post.service';
import { User as UserModel, Post as PostModel } from 'generated/prisma';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
This controller implements the following routes:

GET
/post/:id: Fetch a single post by its id
/feed: Fetch all published posts
/filter-posts/:searchString: Filter posts by title or content
POST
/post: Create a new post
Body:
title: String (required): The title of the post
content: String (optional): The content of the post
authorEmail: String (required): The email of the user that creates the post
/user: Create a new user
Body:
email: String (required): The email address of the user
name: String (optional): The name of the user
PUT
/publish/:id: Publish a post by its id
DELETE
/post/:id: Delete a post by its id
Summary#
In this recipe, you learned how to use Prisma along with NestJS to implement a REST API. The controller that implements the routes of the API is calling a PrismaService which in turn uses Prisma Client to send queries to a database to fulfill the data needs of incoming requests.

If you want to learn more about using NestJS with Prisma, be sure to check out the following resources:

NestJS & Prisma
Ready-to-run example projects for REST & GraphQL
Production-ready starter kit
Video: Accessing Databases using NestJS with Prisma (5min) by Marc Stammerjohann


Healthchecks (Terminus)
Terminus integration provides you with readiness/liveness health checks. Healthchecks are crucial when it comes to complex backend setups. In a nutshell, a health check in the realm of web development usually consists of a special address, for example, https://my-website.com/health/readiness. A service or a component of your infrastructure (e.g., Kubernetes checks this address continuously). Depending on the HTTP status code returned from a GET request to this address the service will take action when it receives an "unhealthy" response. Since the definition of "healthy" or "unhealthy" varies with the type of service you provide, the Terminus integration supports you with a set of health indicators.

As an example, if your web server uses MongoDB to store its data, it would be vital information whether MongoDB is still up and running. In that case, you can make use of the MongooseHealthIndicator. If configured correctly - more on that later - your health check address will return a healthy or unhealthy HTTP status code, depending on whether MongoDB is running.

Getting started#
To get started with @nestjs/terminus we need to install the required dependency.


$ npm install --save @nestjs/terminus
Setting up a Healthcheck#
A health check represents a summary of health indicators. A health indicator executes a check of a service, whether it is in a healthy or unhealthy state. A health check is positive if all the assigned health indicators are up and running. Because a lot of applications will need similar health indicators, @nestjs/terminus provides a set of predefined indicators, such as:

HttpHealthIndicator
TypeOrmHealthIndicator
MongooseHealthIndicator
SequelizeHealthIndicator
MikroOrmHealthIndicator
PrismaHealthIndicator
MicroserviceHealthIndicator
GRPCHealthIndicator
MemoryHealthIndicator
DiskHealthIndicator
To get started with our first health check, let's create the HealthModule and import the TerminusModule into it in its imports array.

Hint
To create the module using the Nest CLI, simply execute the $ nest g module health command.

health.module.tsJS

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}
Our healthcheck(s) can be executed using a controller, which can be easily set up using the Nest CLI.


$ nest g controller health
Info
It is highly recommended to enable shutdown hooks in your application. Terminus integration makes use of this lifecycle event if enabled. Read more about shutdown hooks here.
HTTP Healthcheck#
Once we have installed @nestjs/terminus, imported our TerminusModule and created a new controller, we are ready to create a health check.

The HTTPHealthIndicator requires the @nestjs/axios package so make sure to have it installed:


$ npm i --save @nestjs/axios axios
Now we can setup our HealthController:


health.controller.tsJS

import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}

health.module.tsJS

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
Our health check will now send a GET-request to the https://docs.nestjs.com address. If we get a healthy response from that address, our route at http://localhost:3000/health will return the following object with a 200 status code.


{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    }
  }
}
The interface of this response object can be accessed from the @nestjs/terminus package with the HealthCheckResult interface.

status	If any health indicator failed the status will be 'error'. If the NestJS app is shutting down but still accepting HTTP requests, the health check will have the 'shutting_down' status.	'error' | 'ok' | 'shutting_down'
info	Object containing information of each health indicator which is of status 'up', or in other words "healthy".	object
error	Object containing information of each health indicator which is of status 'down', or in other words "unhealthy".	object
details	Object containing all information of each health indicator	object
Check for specific HTTP response codes
In certain cases, you might want to check for specific criteria and validate the response. As an example, let's assume https://my-external-service.com returns a response code 204. With HttpHealthIndicator.responseCheck you can check for that response code specifically and determine all other codes as unhealthy.

In case any other response code other than 204 gets returned, the following example would be unhealthy. The third parameter requires you to provide a function (sync or async) which returns a boolean whether the response is considered healthy (true) or unhealthy (false).


health.controller.tsJS

// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () =>
      this.http.responseCheck(
        'my-external-service',
        'https://my-external-service.com',
        (res) => res.status === 204,
      ),
  ]);
}
TypeOrm health indicator#
Terminus offers the capability to add database checks to your health check. In order to get started with this health indicator, you should check out the Database chapter and make sure your database connection within your application is established.

Hint
Behind the scenes the TypeOrmHealthIndicator simply executes a SELECT 1-SQL command which is often used to verify whether the database still alive. In case you are using an Oracle database it uses SELECT 1 FROM DUAL.

health.controller.tsJS

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
If your database is reachable, you should now see the following JSON-result when requesting http://localhost:3000/health with a GET request:


{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
In case your app uses multiple databases, you need to inject each connection into your HealthController. Then, you can simply pass the connection reference to the TypeOrmHealthIndicator.


health.controller.tsJS

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection('albumsConnection')
    private albumsConnection: Connection,
    @InjectConnection()
    private defaultConnection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('albums-database', { connection: this.albumsConnection }),
      () => this.db.pingCheck('database', { connection: this.defaultConnection }),
    ]);
  }
}
Disk health indicator#
With the DiskHealthIndicator we can check how much storage is in use. To get started, make sure to inject the DiskHealthIndicator into your HealthController. The following example checks the storage used of the path / (or on Windows you can use C:\\). If that exceeds more than 50% of the total storage space it would response with an unhealthy Health Check.


health.controller.tsJS

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }
}
With the DiskHealthIndicator.checkStorage function you also have the possibility to check for a fixed amount of space. The following example would be unhealthy in case the path /my-app/ would exceed 250GB.


health.controller.tsJS

// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.disk.checkStorage('storage', {  path: '/', threshold: 250 * 1024 * 1024 * 1024, })
  ]);
}
Memory health indicator#
To make sure your process does not exceed a certain memory limit the MemoryHealthIndicator can be used. The following example can be used to check the heap of your process.

Hint
Heap is the portion of memory where dynamically allocated memory resides (i.e. memory allocated via malloc). Memory allocated from the heap will remain allocated until one of the following occurs:
The memory is free'd
The program terminates

health.controller.tsJS

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
It is also possible to verify the memory RSS of your process with MemoryHealthIndicator.checkRSS. This example would return an unhealthy response code in case your process does have more than 150MB allocated.

Hint
RSS is the Resident Set Size and is used to show how much memory is allocated to that process and is in RAM. It does not include memory that is swapped out. It does include memory from shared libraries as long as the pages from those libraries are actually in memory. It does include all stack and heap memory.

health.controller.tsJS

// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
  ]);
}
Custom health indicator#
In some cases, the predefined health indicators provided by @nestjs/terminus do not cover all of your health check requirements. In that case, you can set up a custom health indicator according to your needs.

Let's get started by creating a service that will represent our custom indicator. To get a basic understanding of how an indicator is structured, we will create an example DogHealthIndicator. This service should have the state 'up' if every Dog object has the type 'goodboy'. If that condition is not satisfied then it should throw an error.


dog.health.tsJS

import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

export interface Dog {
  name: string;
  type: string;
}

@Injectable()
export class DogHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  private dogs: Dog[] = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key: string){
    const indicator = this.healthIndicatorService.check(key);
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;

    if (!isHealthy) {
      return indicator.down({ badboys: badboys.length });
    }

    return indicator.up();
  }
}
The next thing we need to do is register the health indicator as a provider.


health.module.tsJS

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class HealthModule { }
Hint
In a real-world application the DogHealthIndicator should be provided in a separate module, for example, DogModule, which then will be imported by the HealthModule.
The last required step is to add the now available health indicator in the required health check endpoint. For that, we go back to our HealthController and add it to our check function.


health.controller.tsJS

import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Dependencies, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
Logging#
Terminus only logs error messages, for instance when a Healthcheck has failed. With the TerminusModule.forRoot() method you have more control over how errors are being logged as well as completely take over the logging itself.

In this section, we are going to walk you through how you create a custom logger TerminusLogger. This logger extends the built-in logger. Therefore you can pick and choose which part of the logger you would like to overwrite

Info
If you want to learn more about custom loggers in NestJS, read more here.

terminus-logger.service.tsJS

import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TerminusLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: any[]): void;
  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    // Overwrite here how error messages should be logged
  }
}
Once you have created your custom logger, all you need to do is simply pass it into the TerminusModule.forRoot() as such.


health.module.tsJS

@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}
To completely suppress any log messages coming from Terminus, including error messages, configure Terminus as such.


health.module.tsJS

@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}
Terminus allows you to configure how Healthcheck errors should be displayed in your logs.

Error Log Style	Description	Example
json (default)	Prints a summary of the health check result in case of an error as JSON object	

pretty	Prints a summary of the health check result in case of an error within formatted boxes and highlights successful/erroneous results	

You can change the log style using the errorLogStyle configuration option as in the following snippet.


health.module.tsJS

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}
Graceful shutdown timeout#
If your application requires postponing its shutdown process, Terminus can handle it for you. This setting can prove particularly beneficial when working with an orchestrator such as Kubernetes. By setting a delay slightly longer than the readiness check interval, you can achieve zero downtime when shutting down containers.


health.module.tsJS

@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ]
})
export class HealthModule {}
More examples#
More working examples are available here.


Execution context
Nest provides several utility classes that help make it easy to write applications that function across multiple application contexts (e.g., Nest HTTP server-based, microservices and WebSockets application contexts). These utilities provide information about the current execution context which can be used to build generic guards, filters, and interceptors that can work across a broad set of controllers, methods, and execution contexts.

We cover two such classes in this chapter: ArgumentsHost and ExecutionContext.

ArgumentsHost class#
The ArgumentsHost class provides methods for retrieving the arguments being passed to a handler. It allows choosing the appropriate context (e.g., HTTP, RPC (microservice), or WebSockets) to retrieve the arguments from. The framework provides an instance of ArgumentsHost, typically referenced as a host parameter, in places where you may want to access it. For example, the catch() method of an exception filter is called with an ArgumentsHostinstance.

ArgumentsHost simply acts as an abstraction over a handler's arguments. For example, for HTTP server applications (when @nestjs/platform-express is being used), the host object encapsulates Express's [request, response, next] array, where request is the request object, response is the response object, and next is a function that controls the application's request-response cycle. On the other hand, for GraphQL applications, the host object contains the [root, args, context, info] array.

Current application context#
When building generic guards, filters, and interceptors which are meant to run across multiple application contexts, we need a way to determine the type of application that our method is currently running in. Do this with the getType() method of ArgumentsHost:



if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
Hint
The GqlContextType is imported from the @nestjs/graphql package.
With the application type available, we can write more generic components, as shown below.

Host handler arguments#
To retrieve the array of arguments being passed to the handler, one approach is to use the host object's getArgs() method.



const [req, res, next] = host.getArgs();
You can pluck a particular argument by index using the getArgByIndex() method:



const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
In these examples we retrieved the request and response objects by index, which is not typically recommended as it couples the application to a particular execution context. Instead, you can make your code more robust and reusable by using one of the host object's utility methods to switch to the appropriate application context for your application. The context switch utility methods are shown below.



/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
Let's rewrite the previous example using the switchToHttp() method. The host.switchToHttp() helper call returns an HttpArgumentsHost object that is appropriate for the HTTP application context. The HttpArgumentsHost object has two useful methods we can use to extract the desired objects. We also use the Express type assertions in this case to return native Express typed objects:



const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
Similarly WsArgumentsHost and RpcArgumentsHost have methods to return appropriate objects in the microservices and WebSockets contexts. Here are the methods for WsArgumentsHost:



export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}
Following are the methods for RpcArgumentsHost:



export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}
ExecutionContext class#
ExecutionContext extends ArgumentsHost, providing additional details about the current execution process. Like ArgumentsHost, Nest provides an instance of ExecutionContext in places you may need it, such as in the canActivate() method of a guard and the intercept() method of an interceptor. It provides the following methods:



export interface ExecutionContext extends ArgumentsHost {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass<T>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
The getHandler() method returns a reference to the handler about to be invoked. The getClass() method returns the type of the Controller class which this particular handler belongs to. For example, in an HTTP context, if the currently processed request is a POST request, bound to the create() method on the CatsController, getHandler() returns a reference to the create() method and getClass() returns the CatsControllerclass (not instance).



const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
The ability to access references to both the current class and handler method provides great flexibility. Most importantly, it gives us the opportunity to access the metadata set through either decorators created via Reflector#createDecorator or the built-in @SetMetadata() decorator from within guards or interceptors. We cover this use case below.

Official enterprise support
 Providing technical guidance
 Performing in-depth code reviews
 Mentoring team members
 Advising best practices
Explore more

Reflection and metadata#
Nest provides the ability to attach custom metadata to route handlers through decorators created via Reflector#createDecorator method, and the built-in @SetMetadata() decorator. In this section, let's compare the two approaches and see how to access the metadata from within a guard or interceptor.

To create strongly-typed decorators using Reflector#createDecorator, we need to specify the type argument. For example, let's create a Roles decorator that takes an array of strings as an argument.


roles.decorator.tsJS

import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
The Roles decorator here is a function that takes a single argument of type string[].

Now, to use this decorator, we simply annotate the handler with it:


cats.controller.tsJS

@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
Here we've attached the Roles decorator metadata to the create() method, indicating that only users with the admin role should be allowed to access this route.

To access the route's role(s) (custom metadata), we'll use the Reflector helper class again. Reflector can be injected into a class in the normal way:


roles.guard.tsJS

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
Hint
The Reflector class is imported from the @nestjs/core package.
Now, to read the handler metadata, use the get() method:



const roles = this.reflector.get(Roles, context.getHandler());
The Reflector#get method allows us to easily access the metadata by passing in two arguments: a decorator reference and a context (decorator target) to retrieve the metadata from. In this example, the specified decorator is Roles (refer back to the roles.decorator.ts file above). The context is provided by the call to context.getHandler(), which results in extracting the metadata for the currently processed route handler. Remember, getHandler() gives us a reference to the route handler function.

Alternatively, we may organize our controller by applying metadata at the controller level, applying to all routes in the controller class.


cats.controller.tsJS

@Roles(['admin'])
@Controller('cats')
export class CatsController {}
In this case, to extract controller metadata, we pass context.getClass() as the second argument (to provide the controller class as the context for metadata extraction) instead of context.getHandler():


roles.guard.tsJS

const roles = this.reflector.get(Roles, context.getClass());
Given the ability to provide metadata at multiple levels, you may need to extract and merge metadata from several contexts. The Reflector class provides two utility methods used to help with this. These methods extract both controller and method metadata at once, and combine them in different ways.

Consider the following scenario, where you've supplied Roles metadata at both levels.


cats.controller.tsJS

@Roles(['user'])
@Controller('cats')
export class CatsController {
  @Post()
  @Roles(['admin'])
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
If your intent is to specify 'user' as the default role, and override it selectively for certain methods, you would probably use the getAllAndOverride() method.



const roles = this.reflector.getAllAndOverride(Roles, [context.getHandler(), context.getClass()]);
A guard with this code, running in the context of the create() method, with the above metadata, would result in roles containing ['admin'].

To get metadata for both and merge it (this method merges both arrays and objects), use the getAllAndMerge() method:



const roles = this.reflector.getAllAndMerge(Roles, [context.getHandler(), context.getClass()]);
This would result in roles containing ['user', 'admin'].

For both of these merge methods, you pass the metadata key as the first argument, and an array of metadata target contexts (i.e., calls to the getHandler() and/or getClass() methods) as the second argument.

Low-level approach#
As mentioned earlier, instead of using Reflector#createDecorator, you can also use the built-in @SetMetadata() decorator to attach metadata to a handler.


cats.controller.tsJS

@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
Hint
The @SetMetadata() decorator is imported from the @nestjs/common package.
With the construction above, we attached the roles metadata (roles is a metadata key and ['admin'] is the associated value) to the create() method. While this works, it's not good practice to use @SetMetadata() directly in your routes. Instead, you can create your own decorators, as shown below:


roles.decorator.tsJS

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
This approach is much cleaner and more readable, and somewhat resembles the Reflector#createDecorator approach. The difference is that with @SetMetadata you have more control over the metadata key and value, and also can create decorators that take more than one argument.

Now that we have a custom @Roles() decorator, we can use it to decorate the create() method.


cats.controller.tsJS

@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
To access the route's role(s) (custom metadata), we'll use the Reflector helper class again:


roles.guard.tsJS

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
Hint
The Reflector class is imported from the @nestjs/core package.
Now, to read the handler metadata, use the get() method.



const roles = this.reflector.get<string[]>('roles', context.getHandler());
Here instead of passing a decorator reference, we pass the metadata key as the first argument (which in our case is 'roles'). Everything else remains the same as in the Reflector#createDecorator example.




Injection scopes
For people coming from different programming language backgrounds, it might be unexpected to learn that in Nest, almost everything is shared across incoming requests. We have a connection pool to the database, singleton services with global state, etc. Remember that Node.js doesn't follow the request/response Multi-Threaded Stateless Model in which every request is processed by a separate thread. Hence, using singleton instances is fully safe for our applications.

However, there are edge cases when request-based lifetime may be the desired behavior, for instance, per-request caching in GraphQL applications, request tracking, and multi-tenancy. Injection scopes provide a mechanism to obtain the desired provider lifetime behavior.

Provider scope#
A provider can have any of the following scopes:

DEFAULT	A single instance of the provider is shared across the entire application. The instance lifetime is tied directly to the application lifecycle. Once the application has bootstrapped, all singleton providers have been instantiated. Singleton scope is used by default.
REQUEST	A new instance of the provider is created exclusively for each incoming request. The instance is garbage-collected after the request has completed processing.
TRANSIENT	Transient providers are not shared across consumers. Each consumer that injects a transient provider will receive a new, dedicated instance.
Hint
Using singleton scope is recommended for most use cases. Sharing providers across consumers and across requests means that an instance can be cached and its initialization occurs only once, during application startup.
Usage#
Specify injection scope by passing the scope property to the @Injectable() decorator options object:



import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
Similarly, for custom providers, set the scope property in the long-hand form for a provider registration:



{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
Hint
Import the Scope enum from @nestjs/common
Singleton scope is used by default and does not need be declared. If you do want to declare a provider as singleton scoped, use the Scope.DEFAULT value for the scope property.

Notice
Websocket Gateways should not use request-scoped providers because they must act as singletons. Each gateway encapsulates a real socket and cannot be instantiated multiple times. The limitation also applies to some other providers, like Passport strategies or Cron controllers.
Controller scope#
Controllers can also have scope, which applies to all request method handlers declared in that controller. Like provider scope, the scope of a controller declares its lifetime. For a request-scoped controller, a new instance is created for each inbound request, and garbage-collected when the request has completed processing.

Declare controller scope with the scope property of the ControllerOptions object:



@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
Scope hierarchy#
The REQUEST scope bubbles up the injection chain. A controller that depends on a request-scoped provider will, itself, be request-scoped.

Imagine the following dependency graph: CatsController <- CatsService <- CatsRepository. If CatsService is request-scoped (and the others are default singletons), the CatsController will become request-scoped as it is dependent on the injected service. The CatsRepository, which is not dependent, would remain singleton-scoped.

Transient-scoped dependencies don't follow that pattern. If a singleton-scoped DogsService injects a transient LoggerService provider, it will receive a fresh instance of it. However, DogsService will stay singleton-scoped, so injecting it anywhere would not resolve to a new instance of DogsService. In case it's desired behavior, DogsService must be explicitly marked as TRANSIENT as well.

Learn the right way!
 80+ chapters
 5+ hours of videos
 Official certificate
 Deep-dive sessions
Explore official courses

Request provider#
In an HTTP server-based application (e.g., using @nestjs/platform-express or @nestjs/platform-fastify), you may want to access a reference to the original request object when using request-scoped providers. You can do this by injecting the REQUEST object.

The REQUEST provider is inherently request-scoped, meaning you don't need to specify the REQUEST scope explicitly when using it. Additionally, even if you attempt to do so, it will be disregarded. Any provider that relies on a request-scoped provider automatically adopts a request scope, and this behavior cannot be altered.



import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
Because of underlying platform/protocol differences, you access the inbound request slightly differently for Microservice or GraphQL applications. In GraphQL applications, you inject CONTEXT instead of REQUEST:



import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private context) {}
}
You then configure your context value (in the GraphQLModule) to contain request as its property.

Inquirer provider#
If you want to get the class where a provider was constructed, for instance in logging or metrics providers, you can inject the INQUIRER token.



import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class HelloService {
  constructor(@Inject(INQUIRER) private parentClass: object) {}

  sayHello(message: string) {
    console.log(`${this.parentClass?.constructor?.name}: ${message}`);
  }
}
And then use it as follows:



import { Injectable } from '@nestjs/common';
import { HelloService } from './hello.service';

@Injectable()
export class AppService {
  constructor(private helloService: HelloService) {}

  getRoot(): string {
    this.helloService.sayHello('My name is getRoot');

    return 'Hello world!';
  }
}
In the example above when AppService#getRoot is called, "AppService: My name is getRoot" will be logged to the console.

Performance#
Using request-scoped providers will have an impact on application performance. While Nest tries to cache as much metadata as possible, it will still have to create an instance of your class on each request. Hence, it will slow down your average response time and overall benchmarking result. Unless a provider must be request-scoped, it is strongly recommended that you use the default singleton scope.

Hint
Although it all sounds quite intimidating, a properly designed application that leverages request-scoped providers should not slow down by more than ~5% latency-wise.
Durable providers#
Request-scoped providers, as mentioned in the section above, may lead to increased latency since having at least 1 request-scoped provider (injected into the controller instance, or deeper - injected into one of its providers) makes the controller request-scoped as well. That means it must be recreated (instantiated) per each individual request (and garbage collected afterward). Now, that also means, that for let's say 30k requests in parallel, there will be 30k ephemeral instances of the controller (and its request-scoped providers).

Having a common provider that most providers depend on (think of a database connection, or a logger service), automatically converts all those providers to request-scoped providers as well. This can pose a challenge in multi-tenant applications, especially for those that have a central request-scoped "data source" provider that grabs headers/token from the request object and based on its values, retrieves the corresponding database connection/schema (specific to that tenant).

For instance, let's say you have an application alternately used by 10 different customers. Each customer has its own dedicated data source, and you want to make sure customer A will never be able to reach customer B's database. One way to achieve this could be to declare a request-scoped "data source" provider that - based on the request object - determines what's the "current customer" and retrieves its corresponding database. With this approach, you can turn your application into a multi-tenant application in just a few minutes. But, a major downside to this approach is that since most likely a large chunk of your application' components rely on the "data source" provider, they will implicitly become "request-scoped", and therefore you will undoubtedly see an impact in your apps performance.

But what if we had a better solution? Since we only have 10 customers, couldn't we have 10 individual DI sub-trees per customer (instead of recreating each tree per request)? If your providers don't rely on any property that's truly unique for each consecutive request (e.g., request UUID) but instead there're some specific attributes that let us aggregate (classify) them, there's no reason to recreate DI sub-tree on every incoming request.

And that's exactly when the durable providers come in handy.

Before we start flagging providers as durable, we must first register a strategy that instructs Nest what are those "common request attributes", provide logic that groups requests - associates them with their corresponding DI sub-trees.



import {
  HostComponentInfo,
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
} from '@nestjs/core';
import { Request } from 'express';

const tenants = new Map<string, ContextId>();

export class AggregateByTenantContextIdStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    let tenantSubTreeId: ContextId;

    if (tenants.has(tenantId)) {
      tenantSubTreeId = tenants.get(tenantId);
    } else {
      tenantSubTreeId = ContextIdFactory.create();
      tenants.set(tenantId, tenantSubTreeId);
    }

    // If tree is not durable, return the original "contextId" object
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? tenantSubTreeId : contextId;
  }
}
Hint
Similar to the request scope, durability bubbles up the injection chain. That means if A depends on B which is flagged as durable, A implicitly becomes durable too (unless durable is explicitly set to false for A provider).
Warning
Note this strategy is not ideal for applications operating with a large number of tenants.
The value returned from the attach method instructs Nest what context identifier should be used for a given host. In this case, we specified that the tenantSubTreeId should be used instead of the original, auto-generated contextId object, when the host component (e.g., request-scoped controller) is flagged as durable (you can learn how to mark providers as durable below). Also, in the above example, no payload would be registered (where payload = REQUEST/CONTEXT provider that represents the "root" - parent of the sub-tree).

If you want to register the payload for a durable tree, use the following construction instead:



// The return of `AggregateByTenantContextIdStrategy#attach` method:
return {
  resolve: (info: HostComponentInfo) =>
    info.isTreeDurable ? tenantSubTreeId : contextId,
  payload: { tenantId },
};
Now whenever you inject the REQUEST provider (or CONTEXT for GraphQL applications) using the @Inject(REQUEST)/@Inject(CONTEXT), the payload object would be injected (consisting of a single property - tenantId in this case).

Alright so with this strategy in place, you can register it somewhere in your code (as it applies globally anyway), so for example, you could place it in the main.ts file:



ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());
Hint
The ContextIdFactory class is imported from the @nestjs/core package.
As long as the registration occurs before any request hits your application, everything will work as intended.

Lastly, to turn a regular provider into a durable provider, simply set the durable flag to true and change its scope to Scope.REQUEST (not needed if the REQUEST scope is in the injection chain already):



import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST, durable: true })
export class CatsService {}
Similarly, for custom providers, set the durable property in the long-hand form for a provider registration:



{
  provide: 'foobar',
  useFactory: () => { ... },
  scope: Scope.REQUEST,
  durable: true,
}




Module reference
Nest provides the ModuleRef class to navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key. The ModuleRef class also provides a way to dynamically instantiate both static and scoped providers. ModuleRef can be injected into a class in the normal way:


cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
Hint
The ModuleRef class is imported from the @nestjs/core package.
Retrieving instances#
The ModuleRef instance (hereafter we'll refer to it as the module reference) has a get() method. By default, this method returns a provider, controller, or injectable (e.g., guard, interceptor, etc.) that was registered and has been instantiated in the current module using its injection token/class name. If the instance is not found, an exception will be raised.


cats.service.tsJS

@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
Warning
You can't retrieve scoped providers (transient or request-scoped) with the get() method. Instead, use the technique described below. Learn how to control scopes here.
To retrieve a provider from the global context (for example, if the provider has been injected in a different module), pass the { strict: false } option as a second argument to get().



this.moduleRef.get(Service, { strict: false });
Resolving scoped providers#
To dynamically resolve a scoped provider (transient or request-scoped), use the resolve() method, passing the provider's injection token as an argument.


cats.service.tsJS

@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
The resolve() method returns a unique instance of the provider, from its own DI container sub-tree. Each sub-tree has a unique context identifier. Thus, if you call this method more than once and compare instance references, you will see that they are not equal.


cats.service.tsJS

@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
To generate a single instance across multiple resolve() calls, and ensure they share the same generated DI container sub-tree, you can pass a context identifier to the resolve() method. Use the ContextIdFactory class to generate a context identifier. This class provides a create() method that returns an appropriate unique identifier.


cats.service.tsJS

@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
Hint
The ContextIdFactory class is imported from the @nestjs/core package.
Registering REQUEST provider#
Manually generated context identifiers (with ContextIdFactory.create()) represent DI sub-trees in which REQUEST provider is undefined as they are not instantiated and managed by the Nest dependency injection system.

To register a custom REQUEST object for a manually created DI sub-tree, use the ModuleRef#registerRequestByContextId() method, as follows:



const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);
Getting current sub-tree#
Occasionally, you may want to resolve an instance of a request-scoped provider within a request context. Let's say that CatsService is request-scoped and you want to resolve the CatsRepository instance which is also marked as a request-scoped provider. In order to share the same DI container sub-tree, you must obtain the current context identifier instead of generating a new one (e.g., with the ContextIdFactory.create() function, as shown above). To obtain the current context identifier, start by injecting the request object using @Inject() decorator.


cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}
Hint
Learn more about the request provider here.
Now, use the getByRequest() method of the ContextIdFactory class to create a context id based on the request object, and pass this to the resolve() call:



const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);
Instantiating custom classes dynamically#
To dynamically instantiate a class that wasn't previously registered as a provider, use the module reference's create() method.


cats.service.tsJS

@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
This technique enables you to conditionally instantiate different classes outside of the framework container.



Circular dependency
A circular dependency occurs when two classes depend on each other. For example, class A needs class B, and class B also needs class A. Circular dependencies can arise in Nest between modules and between providers.

While circular dependencies should be avoided where possible, you can't always do so. In such cases, Nest enables resolving circular dependencies between providers in two ways. In this chapter, we describe using forward referencing as one technique, and using the ModuleRef class to retrieve a provider instance from the DI container as another.

We also describe resolving circular dependencies between modules.

Warning
A circular dependency might also be caused when using "barrel files"/index.ts files to group imports. Barrel files should be omitted when it comes to module/provider classes. For example, barrel files should not be used when importing files within the same directory as the barrel file, i.e. cats/cats.controller should not import cats to import the cats/cats.service file. For more details please also see this GitHub issue.
Forward reference#
A forward reference allows Nest to reference classes which aren't yet defined using the forwardRef() utility function. For example, if CatsService and CommonService depend on each other, both sides of the relationship can use @Inject() and the forwardRef() utility to resolve the circular dependency. Otherwise Nest won't instantiate them because all of the essential metadata won't be available. Here's an example:


cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
Hint
The forwardRef() function is imported from the @nestjs/common package.
That covers one side of the relationship. Now let's do the same with CommonService:


common.service.tsJS

@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
Warning
The order of instantiation is indeterminate. Make sure your code does not depend on which constructor is called first. Having circular dependencies depend on providers with Scope.REQUEST can lead to undefined dependencies. More information available here
ModuleRef class alternative#
An alternative to using forwardRef() is to refactor your code and use the ModuleRef class to retrieve a provider on one side of the (otherwise) circular relationship. Learn more about the ModuleRef utility class here.

Module forward reference#
In order to resolve circular dependencies between modules, use the same forwardRef() utility function on both sides of the modules association. For example:


common.module.tsJS

@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
That covers one side of the relationship. Now let's do the same with CatsModule:


cats.module.tsJS

@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}


HTTP module
Axios is a richly featured HTTP client package that is widely used. Nest wraps Axios and exposes it via the built-in HttpModule. The HttpModule exports the HttpService class, which exposes Axios-based methods to perform HTTP requests. The library also transforms the resulting HTTP responses into Observables.

Hint
You can also use any general purpose Node.js HTTP client library directly, including got or undici.
Installation#
To begin using it, we first install required dependencies.


$ npm i --save @nestjs/axios axios
Getting started#
Once the installation process is complete, to use the HttpService, first import HttpModule.



@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
Next, inject HttpService using normal constructor injection.

Hint
HttpModule and HttpService are imported from @nestjs/axios package.

JS

@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats');
  }
}
Hint
AxiosResponse is an interface exported from the axios package ($ npm i axios).
All HttpService methods return an AxiosResponse wrapped in an Observable object.

Configuration#
Axios can be configured with a variety of options to customize the behavior of the HttpService. Read more about them here. To configure the underlying Axios instance, pass an optional options object to the register() method of HttpModule when importing it. This options object will be passed directly to the underlying Axios constructor.



@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CatsService],
})
export class CatsModule {}
Async configuration#
When you need to pass module options asynchronously instead of statically, use the registerAsync() method. As with most dynamic modules, Nest provides several techniques to deal with async configuration.

One technique is to use a factory function:



HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});
Like other factory providers, our factory function can be async and can inject dependencies through inject.



HttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    timeout: configService.get('HTTP_TIMEOUT'),
    maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
  }),
  inject: [ConfigService],
});
Alternatively, you can configure the HttpModule using a class instead of a factory, as shown below.



HttpModule.registerAsync({
  useClass: HttpConfigService,
});
The construction above instantiates HttpConfigService inside HttpModule, using it to create an options object. Note that in this example, the HttpConfigService has to implement HttpModuleOptionsFactory interface as shown below. The HttpModule will call the createHttpOptions() method on the instantiated object of the supplied class.



@Injectable()
class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}
If you want to reuse an existing options provider instead of creating a private copy inside the HttpModule, use the useExisting syntax.



HttpModule.registerAsync({
  imports: [ConfigModule],
  useExisting: HttpConfigService,
});
You can also pass so-called extraProviders to the registerAsync() method. These providers will be merged with the module providers.



HttpModule.registerAsync({
  imports: [ConfigModule],
  useClass: HttpConfigService,
  extraProviders: [MyAdditionalProvider],
});
This is useful when you want to provide additional dependencies to the factory function or the class constructor.

Using Axios directly#
If you think that HttpModule.register's options are not enough for you, or if you just want to access the underlying Axios instance created by @nestjs/axios, you can access it via HttpService#axiosRef as follows:



@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Promise<AxiosResponse<Cat[]>> {
    return this.httpService.axiosRef.get('http://localhost:3000/cats');
    //                      ^ AxiosInstance interface
  }
}
Full example#
Since the return value of the HttpService methods is an Observable, we can use rxjs - firstValueFrom or lastValueFrom to retrieve the data of the request in the form of a promise.



import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<Cat[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Cat[]>('http://localhost:3000/cats').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}
Hint
Visit RxJS's documentation on firstValueFrom and lastValueFrom for differences between them.


File upload
To handle file uploading, Nest provides a built-in module based on the multer middleware package for Express. Multer handles data posted in the multipart/form-data format, which is primarily used for uploading files via an HTTP POST request. This module is fully configurable and you can adjust its behavior to your application requirements.

Warning
Multer cannot process data which is not in the supported multipart format (multipart/form-data). Also, note that this package is not compatible with the FastifyAdapter.
For better type safety, let's install Multer typings package:


$ npm i -D @types/multer
With this package installed, we can now use the Express.Multer.File type (you can import this type as follows: import { Express } from 'express').

Basic example#
To upload a single file, simply tie the FileInterceptor() interceptor to the route handler and extract file from the request using the @UploadedFile() decorator.


JS

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}
Hint
The FileInterceptor() decorator is exported from the @nestjs/platform-express package. The @UploadedFile() decorator is exported from @nestjs/common.
The FileInterceptor() decorator takes two arguments:

fieldName: string that supplies the name of the field from the HTML form that holds a file
options: optional object of type MulterOptions. This is the same object used by the multer constructor (more details here).
Warning
FileInterceptor() may not be compatible with third party cloud providers like Google Firebase or others.
File validation#
Often times it can be useful to validate incoming file metadata, like file size or file mime-type. For this, you can create your own Pipe and bind it to the parameter annotated with the UploadedFile decorator. The example below demonstrates how a basic file size validator pipe could be implemented:



import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const oneKb = 1000;
    return value.size < oneKb;
  }
}
This can be used in conjunction with the FileInterceptor as follows:



@Post('file')
@UseInterceptors(FileInterceptor('file'))
uploadFileAndValidate(@UploadedFile(
  new FileSizeValidationPipe(),
  // other pipes can be added here
) file: Express.Multer.File, ) {
  return file;
}
Nest provides a built-in pipe to handle common use cases and facilitate/standardize the addition of new ones. This pipe is called ParseFilePipe, and you can use it as follows:



@Post('file')
uploadFileAndPassValidation(
  @Body() body: SampleDto,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        // ... Set of file validator instances here
      ]
    })
  )
  file: Express.Multer.File,
) {
  return {
    body,
    file: file.buffer.toString(),
  };
}
As you can see, it's required to specify an array of file validators that will be executed by the ParseFilePipe. We'll discuss the interface of a validator, but it's worth mentioning this pipe also has two additional optional options:

errorHttpStatusCode	The HTTP status code to be thrown in case any validator fails. Default is 400 (BAD REQUEST)
exceptionFactory	A factory which receives the error message and returns an error.
Now, back to the FileValidator interface. To integrate validators with this pipe, you have to either use built-in implementations or provide your own custom FileValidator. See example below:



export abstract class FileValidator<TValidationOptions = Record<string, any>> {
  constructor(protected readonly validationOptions: TValidationOptions) {}

  /**
   * Indicates if this file should be considered valid, according to the options passed in the constructor.
   * @param file the file from the request object
   */
  abstract isValid(file?: any): boolean | Promise<boolean>;

  /**
   * Builds an error message in case the validation fails.
   * @param file the file from the request object
   */
  abstract buildErrorMessage(file: any): string;
}
Hint
The FileValidator interfaces supports async validation via its isValid function. To leverage type security, you can also type the file parameter as Express.Multer.File in case you are using express (default) as a driver.
FileValidator is a regular class that has access to the file object and validates it according to the options provided by the client. Nest has two built-in FileValidator implementations you can use in your project:

MaxFileSizeValidator - Checks if a given file's size is less than the provided value (measured in bytes)
FileTypeValidator - Checks if a given file's mime-type matches a given string or RegExp. By default, validates the mime-type using file content magic number
To understand how these can be used in conjunction with the aforementioned FileParsePipe, we'll use an altered snippet of the last presented example:



@UploadedFile(
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000 }),
      new FileTypeValidator({ fileType: 'image/jpeg' }),
    ],
  }),
)
file: Express.Multer.File,
Hint
If the number of validators increase largely or their options are cluttering the file, you can define this array in a separate file and import it here as a named constant like fileValidators.
Finally, you can use the special ParseFilePipeBuilder class that lets you compose & construct your validators. By using it as shown below you can avoid manual instantiation of each validator and just pass their options directly:



@UploadedFile(
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'jpeg',
    })
    .addMaxSizeValidator({
      maxSize: 1000
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),
)
file: Express.Multer.File,
Hint
File presence is required by default, but you can make it optional by adding fileIsRequired: false parameter inside build function options (at the same level as errorHttpStatusCode).
Array of files#
To upload an array of files (identified with a single field name), use the FilesInterceptor() decorator (note the plural Files in the decorator name). This decorator takes three arguments:

fieldName: as described above
maxCount: optional number defining the maximum number of files to accept
options: optional MulterOptions object, as described above
When using FilesInterceptor(), extract files from the request with the @UploadedFiles() decorator.


JS

@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
Hint
The FilesInterceptor() decorator is exported from the @nestjs/platform-express package. The @UploadedFiles() decorator is exported from @nestjs/common.
Multiple files#
To upload multiple files (all with different field name keys), use the FileFieldsInterceptor() decorator. This decorator takes two arguments:

uploadedFields: an array of objects, where each object specifies a required name property with a string value specifying a field name, as described above, and an optional maxCount property, as described above
options: optional MulterOptions object, as described above
When using FileFieldsInterceptor(), extract files from the request with the @UploadedFiles() decorator.


JS

@Post('upload')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
  console.log(files);
}
Any files#
To upload all fields with arbitrary field name keys, use the AnyFilesInterceptor() decorator. This decorator can accept an optional options object as described above.

When using AnyFilesInterceptor(), extract files from the request with the @UploadedFiles() decorator.


JS

@Post('upload')
@UseInterceptors(AnyFilesInterceptor())
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
No files#
To accept multipart/form-data but not allow any files to be uploaded, use the NoFilesInterceptor. This sets multipart data as attributes on the request body. Any files sent with the request will throw a BadRequestException.



@Post('upload')
@UseInterceptors(NoFilesInterceptor())
handleMultiPartData(@Body() body) {
  console.log(body)
}
Default options#
You can specify multer options in the file interceptors as described above. To set default options, you can call the static register() method when you import the MulterModule, passing in supported options. You can use all options listed here.



MulterModule.register({
  dest: './upload',
});
Hint
The MulterModule class is exported from the @nestjs/platform-express package.
Async configuration#
When you need to set MulterModule options asynchronously instead of statically, use the registerAsync() method. As with most dynamic modules, Nest provides several techniques to deal with async configuration.

One technique is to use a factory function:



MulterModule.registerAsync({
  useFactory: () => ({
    dest: './upload',
  }),
});
Like other factory providers, our factory function can be async and can inject dependencies through inject.



MulterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    dest: configService.get<string>('MULTER_DEST'),
  }),
  inject: [ConfigService],
});
Alternatively, you can configure the MulterModule using a class instead of a factory, as shown below:



MulterModule.registerAsync({
  useClass: MulterConfigService,
});
The construction above instantiates MulterConfigService inside MulterModule, using it to create the required options object. Note that in this example, the MulterConfigService has to implement the MulterOptionsFactory interface, as shown below. The MulterModule will call the createMulterOptions() method on the instantiated object of the supplied class.



@Injectable()
class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: './upload',
    };
  }
}
If you want to reuse an existing options provider instead of creating a private copy inside the MulterModule, use the useExisting syntax.



MulterModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
You can also pass so-called extraProviders to the registerAsync() method. These providers will be merged with the module providers.



MulterModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});
This is useful when you want to provide additional dependencies to the factory function or the class constructor.

Example#
A working example is available here.



Raw body
One of the most common use-case for having access to the raw request body is performing webhook signature verifications. Usually to perform webhook signature validations the unserialized request body is required to calculate an HMAC hash.

Warning
This feature can be used only if the built-in global body parser middleware is enabled, ie., you must not pass bodyParser: false when creating the app.
Use with Express#
First enable the option when creating your Nest Express application:



import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);
To access the raw request body in a controller, a convenience interface RawBodyRequest is provided to expose a rawBody field on the request: use the interface RawBodyRequest type:



import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
Registering a different parser#
By default, only json and urlencoded parsers are registered. If you want to register a different parser on the fly, you will need to do so explicitly.

For example, to register a text parser, you can use the following code:



app.useBodyParser('text');
Warning
Ensure that you are providing the correct application type to the NestFactory.create call. For Express applications, the correct type is NestExpressApplication. Otherwise the .useBodyParser method will not be found.
Body parser size limit#
If your application needs to parse a body larger than the default 100kb of Express, use the following:



app.useBodyParser('json', { limit: '10mb' });
The .useBodyParser method will respect the rawBody option that is passed in the application options.

Use with Fastify#
First enable the option when creating your Nest Fastify application:



import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  },
);
await app.listen(process.env.PORT ?? 3000);
To access the raw request body in a controller, a convenience interface RawBodyRequest is provided to expose a rawBody field on the request: use the interface RawBodyRequest type:



import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<FastifyRequest>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
Registering a different parser#
By default, only application/json and application/x-www-form-urlencoded parsers are registered. If you want to register a different parser on the fly, you will need to do so explicitly.

For example, to register a text/plain parser, you can use the following code:



app.useBodyParser('text/plain');
Warning
Ensure that you are providing the correct application type to the NestFactory.create call. For Fastify applications, the correct type is NestFastifyApplication. Otherwise the .useBodyParser method will not be found.
Body parser size limit#
If your application needs to parse a body larger than the default 1MiB of Fastify, use the following:



const bodyLimit = 10_485_760; // 10MiB
app.useBodyParser('application/json', { bodyLimit });
The .useBodyParser method will respect the rawBody option that is passed in the application options


Streaming files
Note
This chapter shows how you can stream files from your HTTP application. The examples presented below do not apply to GraphQL or Microservice applications.
There may be times where you would like to send back a file from your REST API to the client. To do this with Nest, normally you'd do the following:



@Controller('file')
export class FileController {
  @Get()
  getFile(@Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    file.pipe(res);
  }
}
But in doing so you end up losing access to your post-controller interceptor logic. To handle this, you can return a StreamableFile instance and under the hood, the framework will take care of piping the response.

Streamable File class#
A StreamableFile is a class that holds onto the stream that is to be returned. To create a new StreamableFile, you can pass either a Buffer or a Stream to the StreamableFile constructor.

hint
The StreamableFile class can be imported from @nestjs/common.
Cross-platform support#
Fastify, by default, can support sending files without needing to call stream.pipe(res), so you don't need to use the StreamableFile class at all. However, Nest supports the use of StreamableFile in both platform types, so if you end up switching between Express and Fastify there's no need to worry about compatibility between the two engines.

Example#
You can find a simple example of returning the package.json as a file instead of a JSON below, but the idea extends out naturally to images, documents, and any other file type.



import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
}
The default content type (the value for Content-Type HTTP response header) is application/octet-stream. If you need to customize this value you can use the type option from StreamableFile, or use the res.set method or the @Header() decorator, like this:



import { Controller, Get, StreamableFile, Res } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express'; // Assuming that we are using the ExpressJS HTTP Adapter

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file, {
      type: 'application/json',
      disposition: 'attachment; filename="package.json"',
      // If you want to define the Content-Length value to another value instead of file's length:
      // length: 123,
    });
  }

  // Or even:
  @Get()
  getFileChangingResponseObjDirectly(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }

  // Or even:
  @Get()
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFileUsingStaticValues(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }  
}
Support us


Performance (Fastify)
By default, Nest makes use of the Express framework. As mentioned earlier, Nest also provides compatibility with other libraries such as, for example, Fastify. Nest achieves this framework independence by implementing a framework adapter whose primary function is to proxy middleware and handlers to appropriate library-specific implementations.

Hint
Note that in order for a framework adapter to be implemented, the target library has to provide similar request/response pipeline processing as found in Express.
Fastify provides a good alternative framework for Nest because it solves design issues in a similar manner to Express. However, fastify is much faster than Express, achieving almost two times better benchmarks results. A fair question is why does Nest use Express as the default HTTP provider? The reason is that Express is widely-used, well-known, and has an enormous set of compatible middleware, which is available to Nest users out-of-the-box.

But since Nest provides framework-independence, you can easily migrate between them. Fastify can be a better choice when you place high value on very fast performance. To utilize Fastify, simply choose the built-in FastifyAdapter as shown in this chapter.

Installation#
First, we need to install the required package:


$ npm i --save @nestjs/platform-fastify
Adapter#
Once the Fastify platform is installed, we can use the FastifyAdapter.


main.tsJS

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
By default, Fastify listens only on the localhost 127.0.0.1 interface (read more). If you want to accept connections on other hosts, you should specify '0.0.0.0' in the listen() call:



async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}
Platform specific packages#
Keep in mind that when you use the FastifyAdapter, Nest uses Fastify as the HTTP provider. This means that each recipe that relies on Express may no longer work. You should, instead, use Fastify equivalent packages.

Redirect response#
Fastify handles redirect responses slightly differently than Express. To do a proper redirect with Fastify, return both the status code and the URL, as follows:



@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}
Fastify options#
You can pass options into the Fastify constructor through the FastifyAdapter constructor. For example:



new FastifyAdapter({ logger: true });
Middleware#
Middleware functions retrieve the raw req and res objects instead of Fastify's wrappers. This is how the middie package works (that's used under the hood) and fastify - check out this page for more information,


logger.middleware.tsJS

import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    next();
  }
}
Route Config#
You can use the route config feature of Fastify with the @RouteConfig() decorator.



@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}
Route Constraints#
As of v10.3.0, @nestjs/platform-fastify supports route constraints feature of Fastify with @RouteConstraints decorator.



@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}
Hint
@RouteConfig() and @RouteConstraints are imported from @nestjs/platform-fastify.
Example#
A working example is available here.









--------new------------------



Custom route decorators
Nest is built around a language feature called decorators. Decorators are a well-known concept in a lot of commonly used programming languages, but in the JavaScript world, they're still relatively new. In order to better understand how decorators work, we recommend reading this article. Here's a simple definition:

An ES2016 decorator is an expression which returns a function and can take a target, name and property descriptor as arguments. You apply it by prefixing the decorator with an @ character and placing this at the very top of what you are trying to decorate. Decorators can be defined for either a class, a method or a property.
Param decorators#
Nest provides a set of useful param decorators that you can use together with the HTTP route handlers. Below is a list of the provided decorators and the plain Express (or Fastify) objects they represent

@Request(), @Req()	req
@Response(), @Res()	res
@Next()	next
@Session()	req.session
@Param(param?: string)	req.params / req.params[param]
@Body(param?: string)	req.body / req.body[param]
@Query(param?: string)	req.query / req.query[param]
@Headers(param?: string)	req.headers / req.headers[param]
@Ip()	req.ip
@HostParam()	req.hosts
Additionally, you can create your own custom decorators. Why is this useful?

In the node.js world, it's common practice to attach properties to the request object. Then you manually extract them in each route handler, using code like the following:



const user = req.user;
In order to make your code more readable and transparent, you can create a @User() decorator and reuse it across all of your controllers.


user.decorator.tsJS

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
Then, you can simply use it wherever it fits your requirements.


JS

@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
Passing data#
When the behavior of your decorator depends on some conditions, you can use the data parameter to pass an argument to the decorator's factory function. One use case for this is a custom decorator that extracts properties from the request object by key. Let's assume, for example, that our authentication layer validates requests and attaches a user entity to the request object. The user entity for an authenticated request might look like:


{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
Let's define a decorator that takes a property name as key, and returns the associated value if it exists (or undefined if it doesn't exist, or if the user object has not been created).


user.decorator.tsJS

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
Here's how you could then access a particular property via the @User() decorator in the controller:


JS

@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
You can use this same decorator with different keys to access different properties. If the user object is deep or complex, this can make for easier and more readable request handler implementations.

Hint
For TypeScript users, note that createParamDecorator<T>() is a generic. This means you can explicitly enforce type safety, for example createParamDecorator<string>((data, ctx) => ...). Alternatively, specify a parameter type in the factory function, for example createParamDecorator((data: string, ctx) => ...). If you omit both, the type for data will be any.
Working with pipes#
Nest treats custom param decorators in the same fashion as the built-in ones (@Body(), @Param() and @Query()). This means that pipes are executed for the custom annotated parameters as well (in our examples, the user argument). Moreover, you can apply the pipe directly to the custom decorator:


JS

@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}
Hint
Note that validateCustomDecorators option must be set to true. ValidationPipe does not validate arguments annotated with the custom decorators by default.
Decorator composition#
Nest provides a helper method to compose multiple decorators. For example, suppose you want to combine all decorators related to authentication into a single decorator. This could be done with the following construction:


auth.decorator.tsJS

import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
You can then use this custom @Auth() decorator as follows:



@Get('users')
@Auth('admin')
findAllUsers() {}
This has the effect of applying all four decorators with a single declaration.

Warning
The @ApiHideProperty() decorator from the @nestjs/swagger package is not composable and won't work properly with the applyDecorators function.


Asynchronous providers
At times, the application start should be delayed until one or more asynchronous tasks are completed. For example, you may not want to start accepting requests until the connection with the database has been established. You can achieve this using asynchronous providers.

The syntax for this is to use async/await with the useFactory syntax. The factory returns a Promise, and the factory function can await asynchronous tasks. Nest will await resolution of the promise before instantiating any class that depends on (injects) such a provider.



{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
Hint
Learn more about custom provider syntax here.
Injection#
Asynchronous providers are injected to other components by their tokens, like any other provider. In the example above, you would use the construct @Inject('ASYNC_CONNECTION').

Example#
The TypeORM recipe has a more substantial example of an asynchronous provider.





Lazy loading modules
By default, modules are eagerly loaded, which means that as soon as the application loads, so do all the modules, whether or not they are immediately necessary. While this is fine for most applications, it may become a bottleneck for apps/workers running in the serverless environment, where the startup latency ("cold start") is crucial.

Lazy loading can help decrease bootstrap time by loading only modules required by the specific serverless function invocation. In addition, you could also load other modules asynchronously once the serverless function is "warm" to speed-up the bootstrap time for subsequent calls even further (deferred modules registration).

Hint
If you're familiar with the Angular framework, you might have seen the "lazy-loading modules" term before. Be aware that this technique is functionally different in Nest and so think about this as an entirely different feature that shares similar naming conventions.
Warning
Do note that lifecycle hooks methods are not invoked in lazy loaded modules and services.
Getting started#
To load modules on-demand, Nest provides the LazyModuleLoader class that can be injected into a class in the normal way:


cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}
Hint
The LazyModuleLoader class is imported from the @nestjs/core package.
Alternatively, you can obtain a reference to the LazyModuleLoader provider from within your application bootstrap file (main.ts), as follows:



// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);
With this in place, you can now load any module using the following construction:



const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);
Hint
"Lazy loaded" modules are cached upon the first LazyModuleLoader#load method invocation. That means, each consecutive attempt to load LazyModule will be very fast and will return a cached instance, instead of loading the module again.

Load "LazyModule" attempt: 1
time: 2.379ms
Load "LazyModule" attempt: 2
time: 0.294ms
Load "LazyModule" attempt: 3
time: 0.303ms
Also, "lazy loaded" modules share the same modules graph as those eagerly loaded on the application bootstrap as well as any other lazy modules registered later in your app.

Where lazy.module.ts is a TypeScript file that exports a regular Nest module (no extra changes are required).

The LazyModuleLoader#load method returns the module reference (of LazyModule) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

For example, let's say we have a LazyModule with the following definition:



@Module({
  providers: [LazyService],
  exports: [LazyService],
})
export class LazyModule {}
Hint
Lazy loaded modules cannot be registered as global modules as it simply makes no sense (since they are registered lazily, on-demand when all the statically registered modules have been already instantiated). Likewise, registered global enhancers (guards/interceptors/etc.) will not work properly either.
With this, we could obtain a reference to the LazyService provider, as follows:



const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

const { LazyService } = await import('./lazy.service');
const lazyService = moduleRef.get(LazyService);
Warning
If you use Webpack, make sure to update your tsconfig.json file - setting compilerOptions.module to "esnext" and adding compilerOptions.moduleResolution property with "node" as a value:

{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    ...
  }
}
With these options set up, you'll be able to leverage the code splitting feature.

Lazy loading controllers, gateways, and resolvers#
Since controllers (or resolvers in GraphQL applications) in Nest represent sets of routes/paths/topics (or queries/mutations), you cannot lazy load them using the LazyModuleLoader class.

Warning
Controllers, resolvers, and gateways registered inside lazy loaded modules will not behave as expected. Similarly, you cannot register middleware functions (by implementing the MiddlewareConsumer interface) on-demand.
For example, let's say you're building a REST API (HTTP application) with a Fastify driver under the hood (using the @nestjs/platform-fastify package). Fastify does not let you register routes after the application is ready/successfully listening to messages. That means even if we analyzed route mappings registered in the module's controllers, all lazy loaded routes wouldn't be accessible since there is no way to register them at runtime.

Likewise, some transport strategies we provide as part of the @nestjs/microservices package (including Kafka, gRPC, or RabbitMQ) require to subscribe/listen to specific topics/channels before the connection is established. Once your application starts listening to messages, the framework would not be able to subscribe/listen to new topics.

Lastly, the @nestjs/graphql package with the code first approach enabled automatically generates the GraphQL schema on-the-fly based on the metadata. That means, it requires all classes to be loaded beforehand. Otherwise, it would not be doable to create the appropriate, valid schema.

Common use-cases#
Most commonly, you will see lazy loaded modules in situations when your worker/cron job/lambda & serverless function/webhook must trigger different services (different logic) based on the input arguments (route path/date/query parameters, etc.). On the other hand, lazy loading modules may not make too much sense for monolithic applications, where the startup time is rather irrelevant.



Lifecycle Events
A Nest application, as well as every application element, has a lifecycle managed by Nest. Nest provides lifecycle hooks that give visibility into key lifecycle events, and the ability to act (run registered code on your modules, providers or controllers) when they occur.

Lifecycle sequence#
The following diagram depicts the sequence of key application lifecycle events, from the time the application is bootstrapped until the node process exits. We can divide the overall lifecycle into three phases: initializing, running and terminating. Using this lifecycle, you can plan for appropriate initialization of modules and services, manage active connections, and gracefully shutdown your application when it receives a termination signal.


Lifecycle events#
Lifecycle events happen during application bootstrapping and shutdown. Nest calls registered lifecycle hook methods on modules, providers and controllers at each of the following lifecycle events (shutdown hooks need to be enabled first, as described below). As shown in the diagram above, Nest also calls the appropriate underlying methods to begin listening for connections, and to stop listening for connections.

In the following table, onModuleInit and onApplicationBootstrap are only triggered if you explicitly call app.init() or app.listen().

In the following table, onModuleDestroy, beforeApplicationShutdown and onApplicationShutdown are only triggered if you explicitly call app.close() or if the process receives a special system signal (such as SIGTERM) and you have correctly called enableShutdownHooks at application bootstrap (see below Application shutdown part).

Lifecycle hook method	Lifecycle event triggering the hook method call
onModuleInit()	Called once the host module's dependencies have been resolved.
onApplicationBootstrap()	Called once all modules have been initialized, but before listening for connections.
onModuleDestroy()*	Called after a termination signal (e.g., SIGTERM) has been received.
beforeApplicationShutdown()*	Called after all onModuleDestroy() handlers have completed (Promises resolved or rejected);
once complete (Promises resolved or rejected), all existing connections will be closed (app.close() called).
onApplicationShutdown()*	Called after connections close (app.close() resolves).
* For these events, if you're not calling app.close() explicitly, you must opt-in to make them work with system signals such as SIGTERM. See Application shutdown below.

Warning
The lifecycle hooks listed above are not triggered for request-scoped classes. Request-scoped classes are not tied to the application lifecycle and their lifespan is unpredictable. They are exclusively created for each request and automatically garbage-collected after the response is sent.
Hint
Execution order of onModuleInit() and onApplicationBootstrap() directly depends on the order of module imports, awaiting the previous hook.
Usage#
Each lifecycle hook is represented by an interface. Interfaces are technically optional because they do not exist after TypeScript compilation. Nonetheless, it's good practice to use them in order to benefit from strong typing and editor tooling. To register a lifecycle hook, implement the appropriate interface. For example, to register a method to be called during module initialization on a particular class (e.g., Controller, Provider or Module), implement the OnModuleInit interface by supplying an onModuleInit() method, as shown below:


JS

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
Asynchronous initialization#
Both the OnModuleInit and OnApplicationBootstrap hooks allow you to defer the application initialization process (return a Promise or mark the method as async and await an asynchronous method completion in the method body).


JS

async onModuleInit(): Promise<void> {
  await this.fetch();
}
Application shutdown#
The onModuleDestroy(), beforeApplicationShutdown() and onApplicationShutdown() hooks are called in the terminating phase (in response to an explicit call to app.close() or upon receipt of system signals such as SIGTERM if opted-in). This feature is often used with Kubernetes to manage containers' lifecycles, by Heroku for dynos or similar services.

Shutdown hook listeners consume system resources, so they are disabled by default. To use shutdown hooks, you must enable listeners by calling enableShutdownHooks():



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
warning
Due to inherent platform limitations, NestJS has limited support for application shutdown hooks on Windows. You can expect SIGINT to work, as well as SIGBREAK and to some extent SIGHUP - read more. However SIGTERM will never work on Windows because killing a process in the task manager is unconditional, "i.e., there's no way for an application to detect or prevent it". Here's some relevant documentation from libuv to learn more about how SIGINT, SIGBREAK and others are handled on Windows. Also, see Node.js documentation of Process Signal Events
Info
enableShutdownHooks consumes memory by starting listeners. In cases where you are running multiple Nest apps in a single Node process (e.g., when running parallel tests with Jest), Node may complain about excessive listener processes. For this reason, enableShutdownHooks is not enabled by default. Be aware of this condition when you are running multiple instances in a single Node process.
When the application receives a termination signal it will call any registered onModuleDestroy(), beforeApplicationShutdown(), then onApplicationShutdown() methods (in the sequence described above) with the corresponding signal as the first parameter. If a registered function awaits an asynchronous call (returns a promise), Nest will not continue in the sequence until the promise is resolved or rejected.


JS

@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
Info
Calling app.close() doesn't terminate the Node process but only triggers the onModuleDestroy() and onApplicationShutdown() hooks, so if there are some intervals, long-running background tasks, etc. the process won't be automatically terminated.


Discovery service
The DiscoveryService provided by the @nestjs/core package is a powerful utility that allows developers to dynamically inspect and retrieve providers, controllers, and other metadata within a NestJS application. This is particularly useful when building plugins, decorators, or advanced features that rely on runtime introspection. By leveraging DiscoveryService, developers can create more flexible and modular architectures, enabling automation and dynamic behavior in their applications.

Getting started#
Before using DiscoveryService, you need to import the DiscoveryModule in the module where you intend to use it. This ensures that the service is available for dependency injection. Below is an example of how to configure it within a NestJS module:



import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ExampleService } from './example.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ExampleService],
})
export class ExampleModule {}
Once the module is set up, DiscoveryService can be injected into any provider or service where dynamic discovery is required.


example.service.tsJS

@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}
Discovering providers and controllers#
One of the key capabilities of DiscoveryService is retrieving all registered providers in the application. This is useful for dynamically processing providers based on specific conditions. The following snippet demonstrates how to access all providers:



const providers = this.discoveryService.getProviders();
console.log(providers);
Each provider object contains information such as its instance, token, and metadata. Similarly, if you need to retrieve all registered controllers within the application, you can do so with:



const controllers = this.discoveryService.getControllers();
console.log(controllers);
This feature is particularly beneficial for scenarios where controllers need to be processed dynamically, such as analytics tracking, or automatic registration mechanisms.

Extracting metadata#
Beyond discovering providers and controllers, DiscoveryService also enables retrieval of metadata attached to these components. This is particularly valuable when working with custom decorators that store metadata at runtime.

For example, consider a case where a custom decorator is used to tag providers with specific metadata:



import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();
Applying this decorator to a service allows it to store metadata that can later be queried:



import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}
Once metadata is attached to providers in this way, DiscoveryService makes it easy to filter providers based on assigned metadata. The following code snippet demonstrates how to retrieve providers that have been tagged with a specific metadata value:



const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  'Providers with the "experimental" feature flag metadata:',
  provider,
);
Conclusion#
The DiscoveryService is a versatile and powerful tool that enables runtime introspection in NestJS applications. By allowing dynamic discovery of providers, controllers, and metadata, it plays a crucial role in building extensible frameworks, plugins, and automation-driven features. Whether you need to scan and process providers, extract metadata for advanced processing, or create modular and scalable architectures, DiscoveryService provides an efficient and structured approach to achieving these goals.

Platform agnosticism
Nest is a platform-agnostic framework. This means you can develop reusable logical parts that can be used across different types of applications. For example, most components can be re-used without change across different underlying HTTP server frameworks (e.g., Express and Fastify), and even across different types of applications (e.g., HTTP server frameworks, Microservices with different transport layers, and Web Sockets).

Build once, use everywhere#
The Overview section of the documentation primarily shows coding techniques using HTTP server frameworks (e.g., apps providing a REST API or providing an MVC-style server-side rendered app). However, all those building blocks can be used on top of different transport layers (microservices or websockets).

Furthermore, Nest comes with a dedicated GraphQL module. You can use GraphQL as your API layer interchangeably with providing a REST API.

In addition, the application context feature helps to create any kind of Node.js application - including things like CRON jobs and CLI apps - on top of Nest.

Nest aspires to be a full-fledged platform for Node.js apps that brings a higher-level of modularity and reusability to your applications. Build once, use everywhere!

Serialization
Serialization is a process that happens before objects are returned in a network response. This is an appropriate place to provide rules for transforming and sanitizing the data to be returned to the client. For example, sensitive data like passwords should always be excluded from the response. Or, certain properties might require additional transformation, such as sending only a subset of properties of an entity. Performing these transformations manually can be tedious and error prone, and can leave you uncertain that all cases have been covered.

Overview#
Nest provides a built-in capability to help ensure that these operations can be performed in a straightforward way. The ClassSerializerInterceptor interceptor uses the powerful class-transformer package to provide a declarative and extensible way of transforming objects. The basic operation it performs is to take the value returned by a method handler and apply the instanceToPlain() function from class-transformer. In doing so, it can apply rules expressed by class-transformer decorators on an entity/DTO class, as described below.

Hint
The serialization does not apply to StreamableFile responses.
Exclude properties#
Let's assume that we want to automatically exclude a password property from a user entity. We annotate the entity as follows:



import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
Now consider a controller with a method handler that returns an instance of this class.



@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}
Warning
Note that we must return an instance of the class. If you return a plain JavaScript object, for example, { user: new UserEntity() }, the object won't be properly serialized.
Hint
The ClassSerializerInterceptor is imported from @nestjs/common.
When this endpoint is requested, the client receives the following response:


{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
Note that the interceptor can be applied application-wide (as covered here). The combination of the interceptor and the entity class declaration ensures that any method that returns a UserEntity will be sure to remove the password property. This gives you a measure of centralized enforcement of this business rule.

Expose properties#
You can use the @Expose() decorator to provide alias names for properties, or to execute a function to calculate a property value (analogous to getter functions), as shown below.



@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
Transform#
You can perform additional data transformation using the @Transform() decorator. For example, the following construct returns the name property of the RoleEntity instead of returning the whole object.



@Transform(({ value }) => value.name)
role: RoleEntity;
Pass options#
You may want to modify the default behavior of the transformation functions. To override default settings, pass them in an options object with the @SerializeOptions() decorator.



@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}
Hint
The @SerializeOptions() decorator is imported from @nestjs/common.
Options passed via @SerializeOptions() are passed as the second argument of the underlying instanceToPlain() function. In this example, we are automatically excluding all properties that begin with the _ prefix.

Transform plain objects#
You can enforce transformations at the controller level by using the @SerializeOptions decorator. This ensures that all responses are transformed into instances of the specified class, applying any decorators from class-validator or class-transformer, even when plain objects are returned. This approach leads to cleaner code without the need to repeatedly instantiate the class or call plainToInstance.

In the example below, despite returning plain JavaScript objects in both conditional branches, they will be automatically converted into UserEntity instances, with the relevant decorators applied:



@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Get()
findOne(@Query() { id }: { id: number }): UserEntity {
  if (id === 1) {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
    };
  }

  return {
    id: 2,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password2',
  };
}
Hint
By specifying the expected return type for the controller, you can leverage TypeScript's type-checking capabilities to ensure that the returned plain object adheres to the shape of the DTO or entity. The plainToInstance function doesn't provide this level of type hinting, which can lead to potential bugs if the plain object doesn't match the expected DTO or entity structure.
Example#
A working example is available here.

WebSockets and Microservices#
While this chapter shows examples using HTTP style applications (e.g., Express or Fastify), the ClassSerializerInterceptor works the same for WebSockets and Microservices, regardless of the transport method that is used.

Learn more#
Read more about available decorators and options as provided by the class-transformer package here.





Versioning
Hint
This chapter is only relevant to HTTP-based applications.
Versioning allows you to have different versions of your controllers or individual routes running within the same application. Applications change very often and it is not unusual that there are breaking changes that you need to make while still needing to support the previous version of the application.

There are 4 types of versioning that are supported:

URI Versioning	The version will be passed within the URI of the request (default)
Header Versioning	A custom request header will specify the version
Media Type Versioning	The Accept header of the request will specify the version
Custom Versioning	Any aspect of the request may be used to specify the version(s). A custom function is provided to extract said version(s).
URI Versioning Type#
URI Versioning uses the version passed within the URI of the request, such as https://example.com/v1/route and https://example.com/v2/route.

Notice
With URI Versioning the version will be automatically added to the URI after the global path prefix (if one exists), and before any controller or route paths.
To enable URI Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
Notice
The version in the URI will be automatically prefixed with v by default, however the prefix value can be configured by setting the prefix key to your desired prefix or false if you wish to disable it.
Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Header Versioning Type#
Header Versioning uses a custom, user specified, request header to specify the version where the value of the header will be the version to use for the request.

Example HTTP Requests for Header Versioning:

To enable Header Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
The header property should be the name of the header that will contain the version of the request.

Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Media Type Versioning Type#
Media Type Versioning uses the Accept header of the request to specify the version.

Within the Accept header, the version will be separated from the media type with a semi-colon, ;. It should then contain a key-value pair that represents the version to use for the request, such as Accept: application/json;v=2. They key is treated more as a prefix when determining the version will to be configured to include the key and separator.

To enable Media Type Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
The key property should be the key and separator of the key-value pair that contains the version. For the example Accept: application/json;v=2, the key property would be set to v=.

Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Custom Versioning Type#
Custom Versioning uses any aspect of the request to specify the version (or versions). The incoming request is analyzed using an extractor function that returns a string or array of strings.

If multiple versions are provided by the requester, the extractor function can return an array of strings, sorted in order of greatest/highest version to smallest/lowest version. Versions are matched to routes in order from highest to lowest.

If an empty string or array is returned from the extractor, no routes are matched and a 404 is returned.

For example, if an incoming request specifies it supports versions 1, 2, and 3, the extractorMUST return [3, 2, 1]. This ensures that the highest possible route version is selected first.

If versions [3, 2, 1] are extracted, but routes only exist for version 2 and 1, the route that matches version 2 is selected (version 3 is automatically ignored).

Notice
Selecting the highest matching version based on the array returned from extractor > does not reliably work with the Express adapter due to design limitations. A single version (either a string or array of 1 element) works just fine in Express. Fastify correctly supports both highest matching version selection and single version selection.
To enable Custom Versioning for your application, create an extractor function and pass it into your application like so:


main.tsJS

// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
Usage#
Versioning allows you to version controllers, individual routes, and also provides a way for certain resources to opt-out of versioning. The usage of versioning is the same regardless of the Versioning Type your application uses.

Notice
If versioning is enabled for the application but the controller or route does not specify the version, any requests to that controller/route will be returned a 404 response status. Similarly, if a request is received containing a version that does not have a corresponding controller or route, it will also be returned a 404 response status.
Controller versions#
A version can be applied to a controller, setting the version for all routes within the controller.

To add a version to a controller do the following:


cats.controller.tsJS

@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1';
  }
}
Route versions#
A version can be applied to an individual route. This version will override any other version that would effect the route, such as the Controller Version.

To add a version to an individual route do the following:


cats.controller.tsJS

import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1(): string {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2(): string {
    return 'This action returns all cats for version 2';
  }
}
Multiple versions#
Multiple versions can be applied to a controller or route. To use multiple versions, you would set the version to be an Array.

To add multiple versions do the following:


cats.controller.tsJS

@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1 or 2';
  }
}
Version "Neutral"#
Some controllers or routes may not care about the version and would have the same functionality regardless of the version. To accommodate this, the version can be set to VERSION_NEUTRAL symbol.

An incoming request will be mapped to a VERSION_NEUTRAL controller or route regardless of the version sent in the request in addition to if the request does not contain a version at all.

Notice
For URI Versioning, a VERSION_NEUTRAL resource would not have the version present in the URI.
To add a version neutral controller or route do the following:


cats.controller.tsJS

import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats regardless of version';
  }
}
Global default version#
If you do not want to provide a version for each controller/or individual routes, or if you want to have a specific version set as the default version for every controller/route that don't have the version specified, you could set the defaultVersion as follows:


main.tsJS

app.enableVersioning({
  // ...
  defaultVersion: '1'
  // or
  defaultVersion: ['1', '2']
  // or
  defaultVersion: VERSION_NEUTRAL
});
Middleware versioning#
Middlewares can also use versioning metadata to configure the middleware for a specific route's version. To do so, provide the version number as one of the parameters for the MiddlewareConsumer.forRoutes() method:


app.module.tsJS

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET, version: '2' });
  }
}
With the code above, the LoggerMiddleware will only be applied to the version '2' of /cats endpoint.

Notice
Middlewares work with any versioning type described in the this section: URI, Header, Media Type or Custom.



Task scheduling
Task scheduling allows you to schedule arbitrary code (methods/functions) to execute at a fixed date/time, at recurring intervals, or once after a specified interval. In the Linux world, this is often handled by packages like cron at the OS level. For Node.js apps, there are several packages that emulate cron-like functionality. Nest provides the @nestjs/schedule package, which integrates with the popular Node.js cron package. We'll cover this package in the current chapter.

Installation#
To begin using it, we first install the required dependencies.


$ npm install --save @nestjs/schedule
To activate job scheduling, import the ScheduleModule into the root AppModule and run the forRoot() static method as shown below:


app.module.tsJS

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
The .forRoot() call initializes the scheduler and registers any declarative cron jobs, timeouts and intervals that exist within your app. Registration occurs when the onApplicationBootstrap lifecycle hook occurs, ensuring that all modules have loaded and declared any scheduled jobs.

Declarative cron jobs#
A cron job schedules an arbitrary function (method call) to run automatically. Cron jobs can run:

Once, at a specified date/time.
On a recurring basis; recurring jobs can run at a specified instant within a specified interval (for example, once per hour, once per week, once every 5 minutes)
Declare a cron job with the @Cron() decorator preceding the method definition containing the code to be executed, as follows:



import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
In this example, the handleCron() method will be called each time the current second is 45. In other words, the method will be run once per minute, at the 45 second mark.

The @Cron() decorator supports the following standard cron patterns:

Asterisk (e.g. *)
Ranges (e.g. 1-3,5)
Steps (e.g. */2)
In the example above, we passed 45 * * * * * to the decorator. The following key shows how each position in the cron pattern string is interpreted:


* * * * * *
| | | | | |
| | | | | day of week
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
Some sample cron patterns are:

* * * * * *	every second
45 * * * * *	every minute, on the 45th second
0 10 * * * *	every hour, at the start of the 10th minute
0 */30 9-17 * * *	every 30 minutes between 9am and 5pm
0 30 11 * * 1-5	Monday to Friday at 11:30am
The @nestjs/schedule package provides a convenient enum with commonly used cron patterns. You can use this enum as follows:



import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.logger.debug('Called every 30 seconds');
  }
}
In this example, the handleCron() method will be called every 30 seconds. If an exception occurs, it will be logged to the console, as every method annotated with @Cron() is automatically wrapped in a try-catch block.

Alternatively, you can supply a JavaScript Date object to the @Cron() decorator. Doing so causes the job to execute exactly once, at the specified date.

Hint
Use JavaScript date arithmetic to schedule jobs relative to the current date. For example, @Cron(new Date(Date.now() + 10 * 1000)) to schedule a job to run 10 seconds after the app starts.
Also, you can supply additional options as the second parameter to the @Cron() decorator.

name	Useful to access and control a cron job after it's been declared.
timeZone	Specify the timezone for the execution. This will modify the actual time relative to your timezone. If the timezone is invalid, an error is thrown. You can check all timezones available at Moment Timezone website.
utcOffset	This allows you to specify the offset of your timezone rather than using the timeZone param.
waitForCompletion	If true, no additional instances of the cron job will run until the current onTick callback has been completed. Any new scheduled executions that occur while the current cron job is running will be skipped entirely.
disabled	This indicates whether the job will be executed at all.


import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  @Cron('* * 0 * * *', {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  triggerNotifications() {}
}
You can access and control a cron job after it's been declared, or dynamically create a cron job (where its cron pattern is defined at runtime) with the Dynamic API. To access a declarative cron job via the API, you must associate the job with a name by passing the name property in an optional options object as the second argument of the decorator.

Declarative intervals#
To declare that a method should run at a (recurring) specified interval, prefix the method definition with the @Interval() decorator. Pass the interval value, as a number in milliseconds, to the decorator as shown below:



@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}
Hint
This mechanism uses the JavaScript setInterval() function under the hood. You can also utilize a cron job to schedule recurring jobs.
If you want to control your declarative interval from outside the declaring class via the Dynamic API, associate the interval with a name using the following construction:



@Interval('notifications', 2500)
handleInterval() {}
If an exception occurs, it will be logged to the console, as every method annotated with @Interval() is automatically wrapped in a try-catch block.

The Dynamic API also enables creating dynamic intervals, where the interval's properties are defined at runtime, and listing and deleting them.

Official enterprise support
 Providing technical guidance
 Performing in-depth code reviews
 Mentoring team members
 Advising best practices
Explore more

Declarative timeouts#
To declare that a method should run (once) at a specified timeout, prefix the method definition with the @Timeout() decorator. Pass the relative time offset (in milliseconds), from application startup, to the decorator as shown below:



@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}
Hint
This mechanism uses the JavaScript setTimeout() function under the hood.
If an exception occurs, it will be logged to the console, as every method annotated with @Timeout() is automatically wrapped in a try-catch block.

If you want to control your declarative timeout from outside the declaring class via the Dynamic API, associate the timeout with a name using the following construction:



@Timeout('notifications', 2500)
handleTimeout() {}
The Dynamic API also enables creating dynamic timeouts, where the timeout's properties are defined at runtime, and listing and deleting them.

Dynamic schedule module API#
The @nestjs/schedule module provides a dynamic API that enables managing declarative cron jobs, timeouts and intervals. The API also enables creating and managing dynamic cron jobs, timeouts and intervals, where the properties are defined at runtime.

Dynamic cron jobs#
Obtain a reference to a CronJob instance by name from anywhere in your code using the SchedulerRegistry API. First, inject SchedulerRegistry using standard constructor injection:



constructor(private schedulerRegistry: SchedulerRegistry) {}
Hint
Import the SchedulerRegistry from the @nestjs/schedule package.
Then use it in a class as follows. Assume a cron job was created with the following declaration:



@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
Access this job using the following:



const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());
The getCronJob() method returns the named cron job. The returned CronJob object has the following methods:

stop() - stops a job that is scheduled to run.
start() - restarts a job that has been stopped.
setTime(time: CronTime) - stops a job, sets a new time for it, and then starts it
lastDate() - returns a DateTime representation of the date on which the last execution of a job occurred.
nextDate() - returns a DateTime representation of the date when the next execution of a job is scheduled.
nextDates(count: number) - Provides an array (size count) of DateTime representations for the next set of dates that will trigger job execution. count defaults to 0, returning an empty array.
Hint
Use toJSDate() on DateTime objects to render them as a JavaScript Date equivalent to this DateTime.
Create a new cron job dynamically using the SchedulerRegistry#addCronJob method, as follows:



addCronJob(name: string, seconds: string) {
  const job = new CronJob(`${seconds} * * * * *`, () => {
    this.logger.warn(`time (${seconds}) for job ${name} to run!`);
  });

  this.schedulerRegistry.addCronJob(name, job);
  job.start();

  this.logger.warn(
    `job ${name} added for each minute at ${seconds} seconds!`,
  );
}
In this code, we use the CronJob object from the cron package to create the cron job. The CronJob constructor takes a cron pattern (just like the @Cron()decorator) as its first argument, and a callback to be executed when the cron timer fires as its second argument. The SchedulerRegistry#addCronJob method takes two arguments: a name for the CronJob, and the CronJob object itself.

Warning
Remember to inject the SchedulerRegistry before accessing it. Import CronJob from the cron package.
Delete a named cron job using the SchedulerRegistry#deleteCronJob method, as follows:



deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}
List all cron jobs using the SchedulerRegistry#getCronJobs method as follows:



getCrons() {
  const jobs = this.schedulerRegistry.getCronJobs();
  jobs.forEach((value, key, map) => {
    let next;
    try {
      next = value.nextDate().toJSDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.log(`job: ${key} -> next: ${next}`);
  });
}
The getCronJobs() method returns a map. In this code, we iterate over the map and attempt to access the nextDate() method of each CronJob. In the CronJob API, if a job has already fired and has no future firing date, it throws an exception.

Dynamic intervals#
Obtain a reference to an interval with the SchedulerRegistry#getInterval method. As above, inject SchedulerRegistry using standard constructor injection:



constructor(private schedulerRegistry: SchedulerRegistry) {}
And use it as follows:



const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);
Create a new interval dynamically using the SchedulerRegistry#addInterval method, as follows:



addInterval(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${milliseconds})!`);
  };

  const interval = setInterval(callback, milliseconds);
  this.schedulerRegistry.addInterval(name, interval);
}
In this code, we create a standard JavaScript interval, then pass it to the SchedulerRegistry#addInterval method. That method takes two arguments: a name for the interval, and the interval itself.

Delete a named interval using the SchedulerRegistry#deleteInterval method, as follows:



deleteInterval(name: string) {
  this.schedulerRegistry.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}
List all intervals using the SchedulerRegistry#getIntervals method as follows:



getIntervals() {
  const intervals = this.schedulerRegistry.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}
Dynamic timeouts#
Obtain a reference to a timeout with the SchedulerRegistry#getTimeout method. As above, inject SchedulerRegistry using standard constructor injection:



constructor(private readonly schedulerRegistry: SchedulerRegistry) {}
And use it as follows:



const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);
Create a new timeout dynamically using the SchedulerRegistry#addTimeout method, as follows:



addTimeout(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
  };

  const timeout = setTimeout(callback, milliseconds);
  this.schedulerRegistry.addTimeout(name, timeout);
}
In this code, we create a standard JavaScript timeout, then pass it to the SchedulerRegistry#addTimeout method. That method takes two arguments: a name for the timeout, and the timeout itself.

Delete a named timeout using the SchedulerRegistry#deleteTimeout method, as follows:



deleteTimeout(name: string) {
  this.schedulerRegistry.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}
List all timeouts using the SchedulerRegistry#getTimeouts method as follows:



getTimeouts() {
  const timeouts = this.schedulerRegistry.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}
Example#
A working example is available here.


Queues
Queues are a powerful design pattern that help you deal with common application scaling and performance challenges. Some examples of problems that Queues can help you solve are:

Smooth out processing peaks. For example, if users can initiate resource-intensive tasks at arbitrary times, you can add these tasks to a queue instead of performing them synchronously. Then you can have worker processes pull tasks from the queue in a controlled manner. You can easily add new Queue consumers to scale up the back-end task handling as the application scales up.
Break up monolithic tasks that may otherwise block the Node.js event loop. For example, if a user request requires CPU intensive work like audio transcoding, you can delegate this task to other processes, freeing up user-facing processes to remain responsive.
Provide a reliable communication channel across various services. For example, you can queue tasks (jobs) in one process or service, and consume them in another. You can be notified (by listening for status events) upon completion, error or other state changes in the job life cycle from any process or service. When Queue producers or consumers fail, their state is preserved and task handling can restart automatically when nodes are restarted.
Nest provides the @nestjs/bullmq package for BullMQ integration and @nestjs/bull package for Bull integration. Both packages are abstractions/wrappers on top of their respective libraries, which were developed by the same team. Bull is currently in maintenance mode, with the team focusing on fixing bugs, while BullMQ is actively developed, featuring a modern TypeScript implementation and a different set of features. If Bull meets your requirements, it remains a reliable and battle-tested choice. The Nest packages make it easy to integrate both, BullMQ or Bull Queues, into your Nest application in a friendly way.

Both BullMQ and Bull use Redis to persist job data, so you'll need to have Redis installed on your system. Because they are Redis-backed, your Queue architecture can be completely distributed and platform-independent. For example, you can have some Queue producers and consumers and listeners running in Nest on one (or several) nodes, and other producers, consumers and listeners running on other Node.js platforms on other network nodes.

This chapter covers the @nestjs/bullmq and @nestjs/bull packages. We also recommend reading the BullMQ and Bull documentation for more background and specific implementation details.

BullMQ installation#
To begin using BullMQ, we first install the required dependencies.


$ npm install --save @nestjs/bullmq bullmq
Once the installation process is complete, we can import the BullModule into the root AppModule.


app.module.tsJS

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
The forRoot() method is used to register a bullmq package configuration object that will be used by all queues registered in the application (unless specified otherwise). For your reference, the following are a few of the properties within a configuration object:

connection: ConnectionOptions - Options to configure the Redis connection. See Connections for more information. Optional.
prefix: string - Prefix for all queue keys. Optional.
defaultJobOptions: JobOpts - Options to control the default settings for new jobs. See JobOpts for more information. Optional.
settings: AdvancedSettings - Advanced Queue configuration settings. These should usually not be changed. See AdvancedSettings for more information. Optional.
extraOptions - Extra options for module init. See Manual Registration
All the options are optional, providing detailed control over queue behavior. These are passed directly to the BullMQ Queue constructor. Read more about these options and other options here.

To register a queue, import the BullModule.registerQueue() dynamic module, as follows:



BullModule.registerQueue({
  name: 'audio',
});
Hint
Create multiple queues by passing multiple comma-separated configuration objects to the registerQueue() method.
The registerQueue() method is used to instantiate and/or register queues. Queues are shared across modules and processes that connect to the same underlying Redis database with the same credentials. Each queue is unique by its name property. A queue name is used as both an injection token (for injecting the queue into controllers/providers), and as an argument to decorators to associate consumer classes and listeners with queues.

You can also override some of the pre-configured options for a specific queue, as follows:



BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});
BullMQ also supports parent - child relationships between jobs. This functionality enables the creation of flows where jobs are the node of trees of arbitrary depth. To read more about them check here.

To add a flow, you can do the following:



BullModule.registerFlowProducer({
  name: 'flowProducerName',
});
Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

Each queue can have one or many producers, consumers, and listeners. Consumers retrieve jobs from the queue in a specific order: FIFO (the default), LIFO, or according to priorities. Controlling queue processing order is discussed here.

Official enterprise support
 Providing technical guidance
 Performing in-depth code reviews
 Mentoring team members
 Advising best practices
Explore more

Named configurations#
If your queues connect to multiple different Redis instances, you can use a technique called named configurations. This feature allows you to register several configurations under specified keys, which then you can refer to in the queue options.

For example, assuming that you have an additional Redis instance (apart from the default one) used by a few queues registered in your application, you can register its configuration as follows:



BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});
In the example above, 'alternative-config' is just a configuration key (it can be any arbitrary string).

With this in place, you can now point to this configuration in the registerQueue() options object:



BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
Producers#
Job producers add jobs to queues. Producers are typically application services (Nest providers). To add jobs to a queue, first inject the queue into the service as follows:



import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
Hint
The @InjectQueue() decorator identifies the queue by its name, as provided in the registerQueue() method call (e.g., 'audio').
Now, add a job by calling the queue's add() method, passing a user-defined job object. Jobs are represented as serializable JavaScript objects (since that is how they are stored in the Redis database). The shape of the job you pass is arbitrary; use it to represent the semantics of your job object. You also need to give it a name. This allows you to create specialized consumers that will only process jobs with a given name.



const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
Job options#
Jobs can have additional options associated with them. Pass an options object after the job argument in the Queue.add() method. Some of the job options properties are:

priority: number - Optional priority value. Ranges from 1 (highest priority) to MAX_INT (lowest priority). Note that using priorities has a slight impact on performance, so use them with caution.
delay: number - An amount of time (milliseconds) to wait until this job can be processed. Note that for accurate delays, both server and clients should have their clocks synchronized.
attempts: number - The total number of attempts to try the job until it completes.
repeat: RepeatOpts - Repeat job according to a cron specification. See RepeatOpts.
backoff: number | BackoffOpts - Backoff setting for automatic retries if the job fails. See BackoffOpts.
lifo: boolean - If true, adds the job to the right end of the queue instead of the left (default false).
jobId: number | string - Override the job ID - by default, the job ID is a unique integer, but you can use this setting to override it. If you use this option, it is up to you to ensure the jobId is unique. If you attempt to add a job with an id that already exists, it will not be added.
removeOnComplete: boolean | number - If true, removes the job when it successfully completes. A number specifies the amount of jobs to keep. Default behavior is to keep the job in the completed set.
removeOnFail: boolean | number - If true, removes the job when it fails after all attempts. A number specifies the amount of jobs to keep. Default behavior is to keep the job in the failed set.
stackTraceLimit: number - Limits the amount of stack trace lines that will be recorded in the stacktrace.
Here are a few examples of customizing jobs with job options.

To delay the start of a job, use the delay configuration property.



const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
To add a job to the right end of the queue (process the job as LIFO (Last In First Out)), set the lifo property of the configuration object to true.



const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true },
);
To prioritize a job, use the priority property.



const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 },
);
For a full list of options, check the API documentation here and here.

Consumers#
A consumer is a class defining methods that either process jobs added into the queue, or listen for events on the queue, or both. Declare a consumer class using the @Processor() decorator as follows:



import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}
Hint
Consumers must be registered as providers so the @nestjs/bullmq package can pick them up.
Where the decorator's string argument (e.g., 'audio') is the name of the queue to be associated with the class methods.



import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.updateProgress(progress);
    }
    return {};
  }
}
The process method is called whenever the worker is idle and there are jobs to process in the queue. This handler method receives the job object as its only argument. The value returned by the handler method is stored in the job object and can be accessed later on, for example in a listener for the completed event.

Job objects have multiple methods that allow you to interact with their state. For example, the above code uses the updateProgress() method to update the job's progress. See here for the complete Job object API reference.

In the older version, Bull, you could designate that a job handler method will handle only jobs of a certain type (jobs with a specific name) by passing that name to the @Process() decorator as shown below.

Warning
This doesn't work with BullMQ, keep reading.


@Process('transcode')
async transcode(job: Job<unknown>) { ... }
This behavior is not supported in BullMQ due to confusions it generated. Instead, you need switch cases to call different services or logic for each job name:



import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'transcode': {
        let progress = 0;
        for (i = 0; i < 100; i++) {
          await doSomething(job.data);
          progress += 1;
          await job.progress(progress);
        }
        return {};
      }
      case 'concatenate': {
        await doSomeLogic2();
        break;
      }
    }
  }
}
This is covered in the named processor section of the BullMQ documentation.

Request-scoped consumers#
When a consumer is flagged as request-scoped (learn more about the injection scopes here), a new instance of the class will be created exclusively for each job. The instance will be garbage-collected after the job has completed.



@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
Since request-scoped consumer classes are instantiated dynamically and scoped to a single job, you can inject a JOB_REF through the constructor using a standard approach.



constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
Hint
The JOB_REF token is imported from the @nestjs/bullmq package.
Event listeners#
BullMQ generates a set of useful events when queue and/or job state changes occur. These events can be subscribed to at the Worker level using the @OnWorkerEvent(event) decorator, or at the Queue level with a dedicated listener class and the @OnQueueEvent(event) decorator.

Worker events must be declared within a consumer class (i.e., within a class decorated with the @Processor() decorator). To listen for an event, use the @OnWorkerEvent(event) decorator with the event you want to be handled. For example, to listen to the event emitted when a job enters the active state in the audio queue, use the following construct:



import { Processor, Process, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer {
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  // ...
}
You can see the complete list of events and their arguments as properties of WorkerListener here.

QueueEvent listeners must use the @QueueEventsListener(queue) decorator and extend the QueueEventsHost class provided by @nestjs/bullmq. To listen for an event, use the @OnQueueEvent(event) decorator with the event you want to be handled. For example, to listen to the event emitted when a job enters the active state in the audio queue, use the following construct:



import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';

@QueueEventsListener('audio')
export class AudioEventsListener extends QueueEventsHost {
  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    console.log(`Processing job ${job.jobId}...`);
  }

  // ...
}
Hint
QueueEvent Listeners must be registered as providers so the @nestjs/bullmq package can pick them up.
You can see the complete list of events and their arguments as properties of QueueEventsListener here.

Queue management#
Queues have an API that allows you to perform management functions like pausing and resuming, retrieving the count of jobs in various states, and several more. You can find the full queue API here. Invoke any of these methods directly on the Queue object, as shown below with the pause/resume examples.

Pause a queue with the pause() method call. A paused queue will not process new jobs until resumed, but current jobs being processed will continue until they are finalized.



await audioQueue.pause();
To resume a paused queue, use the resume() method, as follows:



await audioQueue.resume();
Separate processes#
Job handlers can also be run in a separate (forked) process (source). This has several advantages:

The process is sandboxed so if it crashes it does not affect the worker.
You can run blocking code without affecting the queue (jobs will not stall).
Much better utilization of multi-core CPUs.
Less connections to redis.

app.module.tsJS

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'node:path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
Warning
Please note that because your function is being executed in a forked process, Dependency Injection (and IoC container) won't be available. That means that your processor function will need to contain (or create) all instances of external dependencies it needs.
Async configuration#
You may want to pass bullmq options asynchronously instead of statically. In this case, use the forRootAsync() method which provides several ways to deal with async configuration. Likewise, if you want to pass queue options asynchronously, use the registerQueueAsync() method.

One approach is to use a factory function:



BullModule.forRootAsync({
  useFactory: () => ({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
Our factory behaves like any other asynchronous provider (e.g., it can be async and it's able to inject dependencies through inject).



BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    connection: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
Alternatively, you can use the useClass syntax:



BullModule.forRootAsync({
  useClass: BullConfigService,
});
The construction above will instantiate BullConfigService inside BullModule and use it to provide an options object by calling createSharedConfiguration(). Note that this means that the BullConfigService has to implement the SharedBullConfigurationFactory interface, as shown below:



@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
In order to prevent the creation of BullConfigService inside BullModule and use a provider imported from a different module, you can use the useExisting syntax.



BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
This construction works the same as useClass with one critical difference - BullModule will lookup imported modules to reuse an existing ConfigService instead of instantiating a new one.

Likewise, if you want to pass queue options asynchronously, use the registerQueueAsync() method, just keep in mind to specify the name attribute outside the factory function.



BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
Manual registration#
By default, BullModule automatically registers BullMQ components (queues, processors, and event listener services) in the onModuleInit lifecycle function. However, in some cases, this behavior may not be ideal. To prevent automatic registration, enable manualRegistration in BullModule like this:



BullModule.forRoot({
  extraOptions: {
    manualRegistration: true,
  },
});
To register these components manually, inject BullRegistrar and call the register function, ideally within OnModuleInit or OnApplicationBootstrap.



import { Injectable, OnModuleInit } from '@nestjs/common';
import { BullRegistrar } from '@nestjs/bullmq';

@Injectable()
export class AudioService implements OnModuleInit {
  constructor(private bullRegistrar: BullRegistrar) {}

  onModuleInit() {
    if (yourConditionHere) {
      this.bullRegistrar.register();
    }
  }
}
Unless you call the BullRegistrar#register function, no BullMQ components will work—meaning no jobs will be processed.

Bull installation#
Note
If you decided to use BullMQ, skip this section and the following chapters.
To begin using Bull, we first install the required dependencies.


$ npm install --save @nestjs/bull bull
Once the installation process is complete, we can import the BullModule into the root AppModule.


app.module.tsJS

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
The forRoot() method is used to register a bull package configuration object that will be used by all queues registered in the application (unless specified otherwise). A configuration object consists of the following properties:

limiter: RateLimiter - Options to control the rate at which the queue's jobs are processed. See RateLimiter for more information. Optional.
redis: RedisOpts - Options to configure the Redis connection. See RedisOpts for more information. Optional.
prefix: string - Prefix for all queue keys. Optional.
defaultJobOptions: JobOpts - Options to control the default settings for new jobs. See JobOpts for more information. Optional. Note: These do not take effect if you schedule jobs via a FlowProducer. See bullmq#1034 for explanation.
settings: AdvancedSettings - Advanced Queue configuration settings. These should usually not be changed. See AdvancedSettings for more information. Optional.
All the options are optional, providing detailed control over queue behavior. These are passed directly to the Bull Queue constructor. Read more about these options here.

To register a queue, import the BullModule.registerQueue() dynamic module, as follows:



BullModule.registerQueue({
  name: 'audio',
});
Hint
Create multiple queues by passing multiple comma-separated configuration objects to the registerQueue() method.
The registerQueue() method is used to instantiate and/or register queues. Queues are shared across modules and processes that connect to the same underlying Redis database with the same credentials. Each queue is unique by its name property. A queue name is used as both an injection token (for injecting the queue into controllers/providers), and as an argument to decorators to associate consumer classes and listeners with queues.

You can also override some of the pre-configured options for a specific queue, as follows:



BullModule.registerQueue({
  name: 'audio',
  redis: {
    port: 6380,
  },
});
Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

Each queue can have one or many producers, consumers, and listeners. Consumers retrieve jobs from the queue in a specific order: FIFO (the default), LIFO, or according to priorities. Controlling queue processing order is discussed here.

Official enterprise support
 Providing technical guidance
 Performing in-depth code reviews
 Mentoring team members
 Advising best practices
Explore more

Named configurations#
If your queues connect to multiple Redis instances, you can use a technique called named configurations. This feature allows you to register several configurations under specified keys, which then you can refer to in the queue options.

For example, assuming that you have an additional Redis instance (apart from the default one) used by a few queues registered in your application, you can register its configuration as follows:



BullModule.forRoot('alternative-config', {
  redis: {
    port: 6381,
  },
});
In the example above, 'alternative-config' is just a configuration key (it can be any arbitrary string).

With this in place, you can now point to this configuration in the registerQueue() options object:



BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
Producers#
Job producers add jobs to queues. Producers are typically application services (Nest providers). To add jobs to a queue, first inject the queue into the service as follows:



import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
Hint
The @InjectQueue() decorator identifies the queue by its name, as provided in the registerQueue() method call (e.g., 'audio').
Now, add a job by calling the queue's add() method, passing a user-defined job object. Jobs are represented as serializable JavaScript objects (since that is how they are stored in the Redis database). The shape of the job you pass is arbitrary; use it to represent the semantics of your job object.



const job = await this.audioQueue.add({
  foo: 'bar',
});
Named jobs#
Jobs may have unique names. This allows you to create specialized consumers that will only process jobs with a given name.



const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
Warning
When using named jobs, you must create processors for each unique name added to a queue, or the queue will complain that you are missing a processor for the given job. See here for more information on consuming named jobs.
Job options#
Jobs can have additional options associated with them. Pass an options object after the job argument in the Queue.add() method. Job options properties are:

priority: number - Optional priority value. Ranges from 1 (highest priority) to MAX_INT (lowest priority). Note that using priorities has a slight impact on performance, so use them with caution.
delay: number - An amount of time (milliseconds) to wait until this job can be processed. Note that for accurate delays, both server and clients should have their clocks synchronized.
attempts: number - The total number of attempts to try the job until it completes.
repeat: RepeatOpts - Repeat job according to a cron specification. See RepeatOpts.
backoff: number | BackoffOpts - Backoff setting for automatic retries if the job fails. See BackoffOpts.
lifo: boolean - If true, adds the job to the right end of the queue instead of the left (default false).
timeout: number - The number of milliseconds after which the job should fail with a timeout error.
jobId: number | string - Override the job ID - by default, the job ID is a unique integer, but you can use this setting to override it. If you use this option, it is up to you to ensure the jobId is unique. If you attempt to add a job with an id that already exists, it will not be added.
removeOnComplete: boolean | number - If true, removes the job when it successfully completes. A number specifies the amount of jobs to keep. Default behavior is to keep the job in the completed set.
removeOnFail: boolean | number - If true, removes the job when it fails after all attempts. A number specifies the amount of jobs to keep. Default behavior is to keep the job in the failed set.
stackTraceLimit: number - Limits the amount of stack trace lines that will be recorded in the stacktrace.
Here are a few examples of customizing jobs with job options.

To delay the start of a job, use the delay configuration property.



const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
To add a job to the right end of the queue (process the job as LIFO (Last In First Out)), set the lifo property of the configuration object to true.



const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true },
);
To prioritize a job, use the priority property.



const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 },
);
Consumers#
A consumer is a class defining methods that either process jobs added into the queue, or listen for events on the queue, or both. Declare a consumer class using the @Processor() decorator as follows:



import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}
Hint
Consumers must be registered as providers so the @nestjs/bull package can pick them up.
Where the decorator's string argument (e.g., 'audio') is the name of the queue to be associated with the class methods.

Within a consumer class, declare job handlers by decorating handler methods with the @Process() decorator.



import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.progress(progress);
    }
    return {};
  }
}
The decorated method (e.g., transcode()) is called whenever the worker is idle and there are jobs to process in the queue. This handler method receives the job object as its only argument. The value returned by the handler method is stored in the job object and can be accessed later on, for example in a listener for the completed event.

Job objects have multiple methods that allow you to interact with their state. For example, the above code uses the progress() method to update the job's progress. See here for the complete Job object API reference.

You can designate that a job handler method will handle only jobs of a certain type (jobs with a specific name) by passing that name to the @Process() decorator as shown below. You can have multiple @Process() handlers in a given consumer class, corresponding to each job type (name). When you use named jobs, be sure to have a handler corresponding to each name.



@Process('transcode')
async transcode(job: Job<unknown>) { ... }
Warning
When defining multiple consumers for the same queue, the concurrency option in @Process({ concurrency: 1 }) won't take effect. The minimum concurrency will match the number of consumers defined. This also applies even if @Process() handlers use a different name to handle named jobs.
Request-scoped consumers#
When a consumer is flagged as request-scoped (learn more about the injection scopes here), a new instance of the class will be created exclusively for each job. The instance will be garbage-collected after the job has completed.



@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
Since request-scoped consumer classes are instantiated dynamically and scoped to a single job, you can inject a JOB_REF through the constructor using a standard approach.



constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
Hint
The JOB_REF token is imported from the @nestjs/bull package.
Event listeners#
Bull generates a set of useful events when queue and/or job state changes occur. Nest provides a set of decorators that allow subscribing to a core set of standard events. These are exported from the @nestjs/bull package.

Event listeners must be declared within a consumer class (i.e., within a class decorated with the @Processor() decorator). To listen for an event, use one of the decorators in the table below to declare a handler for the event. For example, to listen to the event emitted when a job enters the active state in the audio queue, use the following construct:



import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  ...
Since Bull operates in a distributed (multi-node) environment, it defines the concept of event locality. This concept recognizes that events may be triggered either entirely within a single process, or on shared queues from different processes. A local event is one that is produced when an action or state change is triggered on a queue in the local process. In other words, when your event producers and consumers are local to a single process, all events happening on queues are local.

When a queue is shared across multiple processes, we encounter the possibility of global events. For a listener in one process to receive an event notification triggered by another process, it must register for a global event.

Event handlers are invoked whenever their corresponding event is emitted. The handler is called with the signature shown in the table below, providing access to information relevant to the event. We discuss one key difference between local and global event handler signatures below.

Local event listeners	Global event listeners	Handler method signature / When fired
@OnQueueError()	@OnGlobalQueueError()	handler(error: Error) - An error occurred. error contains the triggering error.
@OnQueueWaiting()	@OnGlobalQueueWaiting()	handler(jobId: number | string) - A Job is waiting to be processed as soon as a worker is idling. jobId contains the id for the job that has entered this state.
@OnQueueActive()	@OnGlobalQueueActive()	handler(job: Job) - Job jobhas started.
@OnQueueStalled()	@OnGlobalQueueStalled()	handler(job: Job) - Job job has been marked as stalled. This is useful for debugging job workers that crash or pause the event loop.
@OnQueueProgress()	@OnGlobalQueueProgress()	handler(job: Job, progress: number) - Job job's progress was updated to value progress.
@OnQueueCompleted()	@OnGlobalQueueCompleted()	handler(job: Job, result: any) Job job successfully completed with a result result.
@OnQueueFailed()	@OnGlobalQueueFailed()	handler(job: Job, err: Error) Job job failed with reason err.
@OnQueuePaused()	@OnGlobalQueuePaused()	handler() The queue has been paused.
@OnQueueResumed()	@OnGlobalQueueResumed()	handler(job: Job) The queue has been resumed.
@OnQueueCleaned()	@OnGlobalQueueCleaned()	handler(jobs: Job[], type: string) Old jobs have been cleaned from the queue. jobs is an array of cleaned jobs, and type is the type of jobs cleaned.
@OnQueueDrained()	@OnGlobalQueueDrained()	handler() Emitted whenever the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed).
@OnQueueRemoved()	@OnGlobalQueueRemoved()	handler(job: Job) Job job was successfully removed.
When listening for global events, the method signatures can be slightly different from their local counterpart. Specifically, any method signature that receives job objects in the local version, instead receives a jobId (number) in the global version. To get a reference to the actual job object in such a case, use the Queue#getJob method. This call should be awaited, and therefore the handler should be declared async. For example:



@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}
Hint
To access the Queue object (to make a getJob() call), you must of course inject it. Also, the Queue must be registered in the module where you are injecting it.
In addition to the specific event listener decorators, you can also use the generic @OnQueueEvent() decorator in combination with either BullQueueEvents or BullQueueGlobalEvents enums. Read more about events here.

Queue management#
Queue's have an API that allows you to perform management functions like pausing and resuming, retrieving the count of jobs in various states, and several more. You can find the full queue API here. Invoke any of these methods directly on the Queue object, as shown below with the pause/resume examples.

Pause a queue with the pause() method call. A paused queue will not process new jobs until resumed, but current jobs being processed will continue until they are finalized.



await audioQueue.pause();
To resume a paused queue, use the resume() method, as follows:



await audioQueue.resume();
Separate processes#
Job handlers can also be run in a separate (forked) process (source). This has several advantages:

The process is sandboxed so if it crashes it does not affect the worker.
You can run blocking code without affecting the queue (jobs will not stall).
Much better utilization of multi-core CPUs.
Less connections to redis.

app.module.tsJS

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
Please note that because your function is being executed in a forked process, Dependency Injection (and IoC container) won't be available. That means that your processor function will need to contain (or create) all instances of external dependencies it needs.


processor.tsJS

import { Job, DoneCallback } from 'bull';

export default function (job: Job, cb: DoneCallback) {
  console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);
  cb(null, 'It works');
}
Async configuration#
You may want to pass bull options asynchronously instead of statically. In this case, use the forRootAsync() method which provides several ways to deal with async configuration.

One approach is to use a factory function:



BullModule.forRootAsync({
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
Our factory behaves like any other asynchronous provider (e.g., it can be async and it's able to inject dependencies through inject).



BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
Alternatively, you can use the useClass syntax:



BullModule.forRootAsync({
  useClass: BullConfigService,
});
The construction above will instantiate BullConfigService inside BullModule and use it to provide an options object by calling createSharedConfiguration(). Note that this means that the BullConfigService has to implement the SharedBullConfigurationFactory interface, as shown below:



@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
In order to prevent the creation of BullConfigService inside BullModule and use a provider imported from a different module, you can use the useExisting syntax.



BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
This construction works the same as useClass with one critical difference - BullModule will lookup imported modules to reuse an existing ConfigService instead of instantiating a new one.

Likewise, if you want to pass queue options asynchronously, use the registerQueueAsync() method, just keep in mind to specify the name attribute outside the factory function.



BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
Example#
A working example is available here.








Compression
Compression can greatly decrease the size of the response body, thereby increasing the speed of a web app.

For high-traffic websites in production, it is strongly recommended to offload compression from the application server - typically in a reverse proxy (e.g., Nginx). In that case, you should not use compression middleware.

Use with Express (default)#
Use the compression middleware package to enable gzip compression.

First install the required package:


$ npm i --save compression
$ npm i --save-dev @types/compression
Once the installation is complete, apply the compression middleware as global middleware.



import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
Use with Fastify#
If using the FastifyAdapter, you'll want to use fastify-compress:


$ npm i --save @fastify/compress
Once the installation is complete, apply the @fastify/compress middleware as global middleware.

Warning
Please ensure, that you use the type NestFastifyApplication when creating the application. Otherwise, you cannot use register to apply the compression-middleware.


import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

// inside bootstrap()
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(compression);
By default, @fastify/compress will use Brotli compression (on Node >= 11.7.0) when browsers indicate support for the encoding. While Brotli can be quite efficient in terms of compression ratio, it can also be quite slow. By default, Brotli sets a maximum compression quality of 11, although it can be adjusted to reduce compression time in lieu of compression quality by adjusting the BROTLI_PARAM_QUALITY between 0 min and 11 max. This will require fine tuning to optimize space/time performance. An example with quality 4:



import { constants } from 'node:zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });
To simplify, you may want to tell fastify-compress to only use deflate and gzip to compress responses; you'll end up with potentially larger responses but they'll be delivered much more quickly.

To specify encodings, provide a second argument to app.register:



await app.register(compression, { encodings: ['gzip', 'deflate'] });
The above tells fastify-compress to only use gzip and deflate encodings, preferring gzip if the client supports both.







Cookies
An HTTP cookie is a small piece of data stored by the user's browser. Cookies were designed to be a reliable mechanism for websites to remember stateful information. When the user visits the website again, the cookie is automatically sent with the request.

Use with Express (default)#
First install the required package (and its types for TypeScript users):


$ npm i cookie-parser
$ npm i -D @types/cookie-parser
Once the installation is complete, apply the cookie-parser middleware as global middleware (for example, in your main.ts file).



import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
You can pass several options to the cookieParser middleware:

secret a string or array used for signing cookies. This is optional and if not specified, will not parse signed cookies. If a string is provided, this is used as the secret. If an array is provided, an attempt will be made to unsign the cookie with each secret in order.
options an object that is passed to cookie.parse as the second option. See cookie for more information.
The middleware will parse the Cookie header on the request and expose the cookie data as the property req.cookies and, if a secret was provided, as the property req.signedCookies. These properties are name value pairs of the cookie name to cookie value.

When a secret is provided, this module will unsign and validate any signed cookie values and move those name value pairs from req.cookies into req.signedCookies. A signed cookie is a cookie that has a value prefixed with s:. Signed cookies that fail signature validation will have the value false instead of the tampered value.

With this in place, you can now read cookies from within the route handlers, as follows:



@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
Hint
The @Req() decorator is imported from the @nestjs/common, while Request from the express package.
To attach a cookie to an outgoing response, use the Response#cookie() method:



@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
Warning
If you want to leave the response handling logic to the framework, remember to set the passthrough option to true, as shown above. Read more here.
Hint
The @Res() decorator is imported from the @nestjs/common, while Response from the express package.
Use with Fastify#
First install the required package:


$ npm i @fastify/cookie
Once the installation is complete, register the @fastify/cookie plugin:



import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
With this in place, you can now read cookies from within the route handlers, as follows:



@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
Hint
The @Req() decorator is imported from the @nestjs/common, while FastifyRequest from the fastify package.
To attach a cookie to an outgoing response, use the FastifyReply#setCookie() method:



@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}
To read more about FastifyReply#setCookie() method, check out this page.

Warning
If you want to leave the response handling logic to the framework, remember to set the passthrough option to true, as shown above. Read more here.
Hint
The @Res() decorator is imported from the @nestjs/common, while FastifyReply from the fastify package.
Creating a custom decorator (cross-platform)#
To provide a convenient, declarative way of accessing incoming cookies, we can create a custom decorator.



import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});
The @Cookies() decorator will extract all cookies, or a named cookie from the req.cookies object and populate the decorated parameter with that value.

With this in place, we can now use the decorator in a route handler signature, as follows:



@Get()
findAll(@Cookies('name') name: string) {}
Support us








Encryption and Hashing
Encryption is the process of encoding information. This process converts the original representation of the information, known as plaintext, into an alternative form known as ciphertext. Ideally, only authorized parties can decipher a ciphertext back to plaintext and access the original information. Encryption does not itself prevent interference but denies the intelligible content to a would-be interceptor. Encryption is a two-way function; what is encrypted can be decrypted with the proper key.

Hashing is the process of converting a given key into another value. A hash function is used to generate the new value according to a mathematical algorithm. Once hashing has been done, it should be impossible to go from the output to the input.

Encryption#
Node.js provides a built-in crypto module that you can use to encrypt and decrypt strings, numbers, buffers, streams, and more. Nest itself does not provide any additional package on top of this module to avoid introducing unnecessary abstractions.

As an example, let's use AES (Advanced Encryption System) 'aes-256-ctr' algorithm CTR encryption mode.



import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);
Now to decrypt encryptedText value:



import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
Hashing#
For hashing, we recommend using either the bcrypt or argon2 packages. Nest itself does not provide any additional wrappers on top of these modules to avoid introducing unnecessary abstractions (making the learning curve short).

As an example, let's use bcrypt to hash a random password.

First install required packages:


$ npm i bcrypt
$ npm i -D @types/bcrypt
Once the installation is complete, you can use the hash function, as follows:



import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);
To generate a salt, use the genSalt function:



const salt = await bcrypt.genSalt();
To compare/check a password, use the compare function:



const isMatch = await bcrypt.compare(password, hash);
You can read more about available functions here.




Performance (Fastify)
By default, Nest makes use of the Express framework. As mentioned earlier, Nest also provides compatibility with other libraries such as, for example, Fastify. Nest achieves this framework independence by implementing a framework adapter whose primary function is to proxy middleware and handlers to appropriate library-specific implementations.

Hint
Note that in order for a framework adapter to be implemented, the target library has to provide similar request/response pipeline processing as found in Express.
Fastify provides a good alternative framework for Nest because it solves design issues in a similar manner to Express. However, fastify is much faster than Express, achieving almost two times better benchmarks results. A fair question is why does Nest use Express as the default HTTP provider? The reason is that Express is widely-used, well-known, and has an enormous set of compatible middleware, which is available to Nest users out-of-the-box.

But since Nest provides framework-independence, you can easily migrate between them. Fastify can be a better choice when you place high value on very fast performance. To utilize Fastify, simply choose the built-in FastifyAdapter as shown in this chapter.

Installation#
First, we need to install the required package:


$ npm i --save @nestjs/platform-fastify
Adapter#
Once the Fastify platform is installed, we can use the FastifyAdapter.


main.tsJS

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
By default, Fastify listens only on the localhost 127.0.0.1 interface (read more). If you want to accept connections on other hosts, you should specify '0.0.0.0' in the listen() call:



async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}
Platform specific packages#
Keep in mind that when you use the FastifyAdapter, Nest uses Fastify as the HTTP provider. This means that each recipe that relies on Express may no longer work. You should, instead, use Fastify equivalent packages.

Redirect response#
Fastify handles redirect responses slightly differently than Express. To do a proper redirect with Fastify, return both the status code and the URL, as follows:



@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}
Fastify options#
You can pass options into the Fastify constructor through the FastifyAdapter constructor. For example:



new FastifyAdapter({ logger: true });
Middleware#
Middleware functions retrieve the raw req and res objects instead of Fastify's wrappers. This is how the middie package works (that's used under the hood) and fastify - check out this page for more information,


logger.middleware.tsJS

import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    next();
  }
}
Route Config#
You can use the route config feature of Fastify with the @RouteConfig() decorator.



@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}
Route Constraints#
As of v10.3.0, @nestjs/platform-fastify supports route constraints feature of Fastify with @RouteConstraints decorator.



@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}
Hint
@RouteConfig() and @RouteConstraints are imported from @nestjs/platform-fastify.
Example#
A working example is available here.



Standalone applications
There are several ways of mounting a Nest application. You can create a web app, a microservice or just a bare Nest standalone application (without any network listeners). The Nest standalone application is a wrapper around the Nest IoC container, which holds all instantiated classes. We can obtain a reference to any existing instance from within any imported module directly using the standalone application object. Thus, you can take advantage of the Nest framework anywhere, including, for example, scripted CRON jobs. You can even build a CLI on top of it.

Getting started#
To create a Nest standalone application, use the following construction:


JS

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // your application logic here ...
}
bootstrap();
Retrieving providers from static modules#
The standalone application object allows you to obtain a reference to any instance registered within the Nest application. Let's imagine that we have a TasksService provider in the TasksModule module that was imported by our AppModule module. This class provides a set of methods that we want to call from within a CRON job.


JS

const tasksService = app.get(TasksService);
To access the TasksService instance we use the get() method. The get() method acts like a query that searches for an instance in each registered module. You can pass any provider's token to it. Alternatively, for strict context checking, pass an options object with the strict: true property. With this option in effect, you have to navigate through specific modules to obtain a particular instance from the selected context.


JS

const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
Following is a summary of the methods available for retrieving instance references from the standalone application object.

get()	Retrieves an instance of a controller or provider (including guards, filters, and so on) available in the application context.
select()	Navigates through the module's graph to pull out a specific instance of the selected module (used together with strict mode as described above).
Hint
In non-strict mode, the root module is selected by default. To select any other module, you need to navigate the modules graph manually, step by step.
Keep in mind that a standalone application does not have any network listeners, so any Nest features related to HTTP (e.g., middleware, interceptors, pipes, guards, etc.) are not available in this context.

For example, even if you register a global interceptor in your application and then retrieve a controller's instance using the app.get() method, the interceptor will not be executed.

Retrieving providers from dynamic modules#
When dealing with dynamic modules, we should supply the same object that represents the registered dynamic module in the application to app.select. For example:


JS

export const dynamicConfigModule = ConfigModule.register({ folder: './config' });

@Module({
  imports: [dynamicConfigModule],
})
export class AppModule {}
Then you can select that module later on:


JS

const configService = app.select(dynamicConfigModule).get(ConfigService, { strict: true });
Terminating phase#
If you want the Node application to close after the script finishes (e.g., for a script running CRON jobs), you must call the app.close() method in the end of your bootstrap function like this:


JS

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // application logic...
  await app.close();
}
bootstrap();
And as mentioned in the Lifecycle events chapter, that will trigger lifecycle hooks.

Example#
A working example is available here.



Async Local Storage
AsyncLocalStorage is a Node.js API (based on the async_hooks API) that provides an alternative way of propagating local state through the application without the need to explicitly pass it as a function parameter. It is similar to a thread-local storage in other languages.

The main idea of Async Local Storage is that we can wrap some function call with the AsyncLocalStorage#run call. All code that is invoked within the wrapped call gets access to the same store, which will be unique to each call chain.

In the context of NestJS, that means if we can find a place within the request's lifecycle where we can wrap the rest of the request's code, we will be able to access and modify state visible only to that request, which may serve as an alternative to REQUEST-scoped providers and some of their limitations.

Alternatively, we can use ALS to propagate context for only a part of the system (for example the transaction object) without passing it around explicitly across services, which can increase isolation and encapsulation.

Custom implementation#
NestJS itself does not provide any built-in abstraction for AsyncLocalStorage, so let's walk through how we could implement it ourselves for the simplest HTTP case to get a better understanding of the whole concept:

info
For a ready-made dedicated package, continue reading below.
First, create a new instance of the AsyncLocalStorage in some shared source file. Since we're using NestJS, let's also turn it into a module with a custom provider.

als.module.tsJS

@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule {}
Hint
AsyncLocalStorage is imported from async_hooks.
We're only concerned with HTTP, so let's use a middleware to wrap the next function with AsyncLocalStorage#run. Since a middleware is the first thing that the request hits, this will make the store available in all enhancers and the rest of the system.

app.module.tsJS

@Module({
  imports: [AlsModule],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule implements NestModule {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {
        // populate the store with some default values
        // based on the request,
        const store = {
          userId: req.headers['x-user-id'],
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      .forRoutes('*path');
  }
}
Now, anywhere within the lifecycle of a request, we can access the local store instance.

cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ALS instance.
    private readonly als: AsyncLocalStorage,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // The "getStore" method will always return the
    // store instance associated with the given request.
    const userId = this.als.getStore()["userId"] as number;
    return this.catsRepository.getForUser(userId);
  }
}
That's it. Now we have a way to share request related state without needing to inject the whole REQUEST object.
warning
Please be aware that while the technique is useful for many use-cases, it inherently obfuscates the code flow (creating implicit context), so use it responsibly and especially avoid creating contextual "God objects".
NestJS CLS
The nestjs-cls package provides several DX improvements over using plain AsyncLocalStorage (CLS is an abbreviation of the term continuation-local storage). It abstracts the implementation into a ClsModule that offers various ways of initializing the store for different transports (not only HTTP), as well as a strong-typing support.

The store can then be accessed with an injectable ClsService, or entirely abstracted away from the business logic by using Proxy Providers.

info
nestjs-cls is a third party package and is not managed by the NestJS core team. Please, report any issues found with the library in the appropriate repository.
Installation#
Apart from a peer dependency on the @nestjs libs, it only uses the built-in Node.js API. Install it as any other package.


npm i nestjs-cls
Usage#
A similar functionality as described above can be implemented using nestjs-cls as follows:

Import the ClsModule in the root module.

app.module.tsJS

@Module({
  imports: [
    // Register the ClsModule,
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req) => {
          cls.set('userId', req.headers['x-user-id']);
        },
      },
    }),
  ],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule {}
And then can use the ClsService to access the store values.

cats.service.tsJS

@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ClsService instance,
    private readonly cls: ClsService,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // and use the "get" method to retrieve any stored value.
    const userId = this.cls.get('userId');
    return this.catsRepository.getForUser(userId);
  }
}
To get strong typing of the store values managed by the ClsService (and also get auto-suggestions of the string keys), we can use an optional type parameter ClsService<MyClsStore> when injecting it.


export interface MyClsStore extends ClsStore {
  userId: number;
}
hint
It it also possible to let the package automatically generate a Request ID and access it later with cls.getId(), or to get the whole Request object using cls.get(CLS_REQ).
Testing#
Since the ClsService is just another injectable provider, it can be entirely mocked out in unit tests.

However, in certain integration tests, we might still want to use the real ClsService implementation. In that case, we will need to wrap the context-aware piece of code with a call to ClsService#run or ClsService#runWith.



describe('CatsService', () => {
  let service: CatsService
  let cls: ClsService
  const mockCatsRepository = createMock<CatsRepository>()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // Set up most of the testing module as we normally would.
      providers: [
        CatsService,
        {
          provide: CatsRepository
          useValue: mockCatsRepository
        }
      ],
      imports: [
        // Import the static version of ClsModule which only provides
        // the ClsService, but does not set up the store in any way.
        ClsModule
      ],
    }).compile()

    service = module.get(CatsService)

    // Also retrieve the ClsService for later use.
    cls = module.get(ClsService)
  })

  describe('getCatForUser', () => {
    it('retrieves cat based on user id', async () => {
      const expectedUserId = 42
      mocksCatsRepository.getForUser.mockImplementationOnce(
        (id) => ({ userId: id })
      )

      // Wrap the test call in the `runWith` method
      // in which we can pass hand-crafted store values.
      const cat = await cls.runWith(
        { userId: expectedUserId },
        () => service.getCatForUser()
      )

      expect(cat.userId).toEqual(expectedUserId)
    })
  })
})
More information#
Visit the NestJS CLS GitHub Page for the full API documentation and more code examples.



HTTP adapter
Occasionally, you may want to access the underlying HTTP server, either within the Nest application context or from the outside.

Every native (platform-specific) HTTP server/library (e.g., Express and Fastify) instance is wrapped in an adapter. The adapter is registered as a globally available provider that can be retrieved from the application context, as well as injected into other providers.

Outside application context strategy#
To get a reference to the HttpAdapter from outside of the application context, call the getHttpAdapter() method.


JS

const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
As injectable#
To get a reference to the HttpAdapterHost from within the application context, inject it using the same technique as any other existing provider (e.g., using constructor injection).


JS

export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
Hint
The HttpAdapterHost is imported from the @nestjs/core package.
The HttpAdapterHost is not an actual HttpAdapter. To get the actual HttpAdapter instance, simply access the httpAdapter property.



const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
The httpAdapter is the actual instance of the HTTP adapter used by the underlying framework. It is an instance of either ExpressAdapter or FastifyAdapter (both classes extend AbstractHttpAdapter).

The adapter object exposes several useful methods to interact with the HTTP server. However, if you want to access the library instance (e.g., the Express instance) directly, call the getInstance() method.



const instance = httpAdapter.getInstance();
Listening event#
To execute an action when the server begins listening for incoming requests, you can subscribe to the listen$ stream, as demonstrated below:



this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);
Additionally, the HttpAdapterHost provides a listening boolean property that indicates whether the server is currently active and listening:



if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}



Keep alive connections
By default, the HTTP adapters of NestJS will wait until the response is finished before closing the application. But sometimes, this behavior is not desired, or unexpected. There might be some requests that use Connection: Keep-Alive headers that live for a long time.

For these scenarios where you always want your application to exit without waiting for requests to end, you can enable the forceCloseConnections option when creating your NestJS application.

Tip
Most users will not need to enable this option. But the symptom of needing this option is that your application will not exit when you expect it to. Usually when app.enableShutdownHooks() is enabled and you notice that the application is not restarting/exiting. Most likely while running the NestJS application during development with --watch.
Usage#
In your main.ts file, enable the option when creating your NestJS application:



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();




Global prefix
To set a prefix for every route registered in an HTTP application, use the setGlobalPrefix() method of the INestApplication instance.



const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
You can exclude routes from the global prefix using the following construction:



app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});
Alternatively, you can specify route as a string (it will apply to every request method):



app.setGlobalPrefix('v1', { exclude: ['cats'] });
Hint
The path property supports wildcard parameters using the path-to-regexp package. Note: this does not accept wildcard asterisks *. Instead, you must use parameters (:param) or named wildcards (*splat).



HTTPS
To create an application that uses the HTTPS protocol, set the httpsOptions property in the options object passed to the create() method of the NestFactory class:



const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
await app.listen(process.env.PORT ?? 3000);
If you use the FastifyAdapter, create the application as follows:



const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);
Multiple simultaneous servers#
The following recipe shows how to instantiate a Nest application that listens on multiple ports (for example, on a non-HTTPS port and an HTTPS port) simultaneously.



const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
await app.init();

const httpServer = http.createServer(server).listen(3000);
const httpsServer = https.createServer(httpsOptions, server).listen(443);
Because we called http.createServer / https.createServer ourselves, NestJS doesn't close them when calling app.close / on termination signal. We need to do this ourselves:



@Injectable()
export class ShutdownObserver implements OnApplicationShutdown {
  private httpServers: http.Server[] = [];

  public addHttpServer(server: http.Server): void {
    this.httpServers.push(server);
  }

  public async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      this.httpServers.map(
        (server) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
              } else {
                resolve(null);
              }
            });
          }),
      ),
    );
  }
}

const shutdownObserver = app.get(ShutdownObserver);
shutdownObserver.addHttpServer(httpServer);
shutdownObserver.addHttpServer(httpsServer);
Hint
The ExpressAdapter is imported from the @nestjs/platform-express package. The http and https packages are native Node.js packages.
Warning
This recipe does not work with GraphQL Subscriptions.




Request lifecycle
Nest applications handle requests and produce responses in a sequence we refer to as the request lifecycle. With the use of middleware, pipes, guards, and interceptors, it can be challenging to track down where a particular piece of code executes during the request lifecycle, especially as global, controller level, and route level components come into play. In general, a request flows through middleware to guards, then to interceptors, then to pipes and finally back to interceptors on the return path (as the response is generated).

Middleware#
Middleware is executed in a particular sequence. First, Nest runs globally bound middleware (such as middleware bound with app.use) and then it runs module bound middleware, which are determined on paths. Middleware are run sequentially in the order they are bound, similar to the way middleware in Express works. In the case of middleware bound across different modules, the middleware bound to the root module will run first, and then middleware will run in the order that the modules are added to the imports array.

Guards#
Guard execution starts with global guards, then proceeds to controller guards, and finally to route guards. As with middleware, guards run in the order in which they are bound. For example:



@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
Guard1 will execute before Guard2 and both will execute before Guard3.

Hint
When speaking about globally bound vs controller or locally bound, the difference is where the guard (or other component is bound). If you are using app.useGlobalGuard() or providing the component via a module, it is globally bound. Otherwise, it is bound to a controller if the decorator precedes a controller class, or to a route if the decorator precedes a route declaration.
Interceptors#
Interceptors, for the most part, follow the same pattern as guards, with one catch: as interceptors return RxJS Observables, the observables will be resolved in a first in last out manner. So inbound requests will go through the standard global, controller, route level resolution, but the response side of the request (i.e., after returning from the controller method handler) will be resolved from route to controller to global. Also, any errors thrown by pipes, controllers, or services can be read in the catchError operator of an interceptor.

Pipes#
Pipes follow the standard global to controller to route bound sequence, with the same first in first out in regards to the @UsePipes() parameters. However, at a route parameter level, if you have multiple pipes running, they will run in the order of the last parameter with a pipe to the first. This also applies to the route level and controller level pipes. For example, if we have the following controller:



@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}
then the GeneralValidationPipe will run for the query, then the params, and then the body objects before moving on to the RouteSpecificPipe, which follows the same order. If any parameter-specific pipes were in place, they would run (again, from the last to first parameter) after the controller and route level pipes.

Filters#
Filters are the only component that do not resolve global first. Instead, filters resolve from the lowest level possible, meaning execution starts with any route bound filters and proceeding next to controller level, and finally to global filters. Note that exceptions cannot be passed from filter to filter; if a route level filter catches the exception, a controller or global level filter cannot catch the same exception. The only way to achieve an effect like this is to use inheritance between the filters.

Hint
Filters are only executed if any uncaught exception occurs during the request process. Caught exceptions, such as those caught with a try/catch will not trigger Exception Filters to fire. As soon as an uncaught exception is encountered, the rest of the lifecycle is ignored and the request skips straight to the filter.
Summary#
In general, the request lifecycle looks like the following:

Incoming request
Middleware
2.1. Globally bound middleware
2.2. Module bound middleware
Guards
3.1 Global guards
3.2 Controller guards
3.3 Route guards
Interceptors (pre-controller)
4.1 Global interceptors
4.2 Controller interceptors
4.3 Route interceptors
Pipes
5.1 Global pipes
5.2 Controller pipes
5.3 Route pipes
5.4 Route parameter pipes
Controller (method handler)
Service (if exists)
Interceptors (post-request)
8.1 Route interceptor
8.2 Controller interceptor
8.3 Global interceptor
Exception filters
9.1 route
9.2 controller
9.3 global
Server response





Common errors
During your development with NestJS, you may encounter various errors as you learn the framework.

"Cannot resolve dependency" error#
Hint
Check out the NestJS Devtools which can help you resolve the "Cannot resolve dependency" error effortlessly.
Probably the most common error message is about Nest not being able to resolve dependencies of a provider. The error message usually looks something like this:


Nest can't resolve dependencies of the <provider> (?). Please make sure that the argument <unknown_token> at index [<index>] is available in the <module> context.

Potential solutions:
- Is <module> a valid NestJS module?
- If <unknown_token> is a provider, is it part of the current <module>?
- If <unknown_token> is exported from a separate @Module, is that module imported within <module>?
  @Module({
    imports: [ /* the Module containing <unknown_token> */ ]
  })
The most common culprit of the error, is not having the <provider> in the module's providers array. Please make sure that the provider is indeed in the providers array and following standard NestJS provider practices.

There are a few gotchas, that are common. One is putting a provider in an imports array. If this is the case, the error will have the provider's name where <module> should be.

If you run across this error while developing, take a look at the module mentioned in the error message and look at its providers. For each provider in the providers array, make sure the module has access to all of the dependencies. Often times, providers are duplicated in a "Feature Module" and a "Root Module" which means Nest will try to instantiate the provider twice. More than likely, the module containing the <provider> being duplicated should be added in the "Root Module"'s imports array instead.

If the <unknown_token> above is dependency, you might have a circular file import. This is different from the circular dependency below because instead of having providers depend on each other in their constructors, it just means that two files end up importing each other. A common case would be a module file declaring a token and importing a provider, and the provider import the token constant from the module file. If you are using barrel files, ensure that your barrel imports do not end up creating these circular imports as well.

If the <unknown_token> above is Object, it means that you're injecting using an type/interface without a proper provider's token. To fix that, make sure that:

you're importing the class reference or use a custom token with @Inject() decorator. Read the custom providers page, and
for class-based providers, you're importing the concrete classes instead of only the type via import type ... syntax.
Also, make sure you didn't end up injecting the provider on itself because self-injections are not allowed in NestJS. When this happens, <unknown_token> will likely be equal to <provider>.

Explore your graph with NestJS Devtools
 Graph visualizer
 Routes navigator
 Interactive playground
 CI/CD integration
Sign up

If you are in a monorepo setup, you may face the same error as above but for core provider called ModuleRef as a <unknown_token>:


Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...
This likely happens when your project end up loading two Node modules of the package @nestjs/core, like this:


.
├── package.json
├── apps
│   └── api
│       └── node_modules
│           └── @nestjs/bull
│               └── node_modules
│                   └── @nestjs/core
└── node_modules
    ├── (other packages)
    └── @nestjs/core
Solutions:

For Yarn Workspaces, use the nohoist feature to prevent hoisting the package @nestjs/core.
For pnpm Workspaces, set @nestjs/core as a peerDependencies in your other module and "dependenciesMeta": {"other-module-name": {"injected": true }} in the app package.json where the module is imported. see: dependenciesmetainjected
"Circular dependency" error#
Occasionally you'll find it difficult to avoid circular dependencies in your application. You'll need to take some steps to help Nest resolve these. Errors that arise from circular dependencies look like this:


Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: https://docs.nestjs.com/fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule
Circular dependencies can arise from both providers depending on each other, or typescript files depending on each other for constants, such as exporting constants from a module file and importing them in a service file. In the latter case, it is advised to create a separate file for your constants. In the former case, please follow the guide on circular dependencies and make sure that both the modules and the providers are marked with forwardRef.

Debugging dependency errors#
Along with just manually verifying your dependencies are correct, as of Nest 8.1.0 you can set the NEST_DEBUG environment variable to a string that resolves as truthy, and get extra logging information while Nest is resolving all of the dependencies for the application.


In the above image, the string in yellow is the host class of the dependency being injected, the string in blue is the name of the injected dependency, or its injection token, and the string in purple is the module in which the dependency is being searched for. Using this, you can usually trace back the dependency resolution for what's happening and why you're getting dependency injection problems.

"File change detected" loops endlessly#
Windows users who are using TypeScript version 4.9 and up may encounter this problem. This happens when you're trying to run your application in watch mode, e.g npm run start:dev and see an endless loop of the log messages:


XX:XX:XX AM - File change detected. Starting incremental compilation...
XX:XX:XX AM - Found 0 errors. Watching for file changes.
When you're using the NestJS CLI to start your application in watch mode it is done by calling tsc --watch, and as of version 4.9 of TypeScript, a new strategy for detecting file changes is used which is likely to be the cause of this problem. In order to fix this problem, you need to add a setting to your tsconfig.json file after the "compilerOptions" option as follows:


  "watchOptions": {
    "watchFile": "fixedPollingInterval"
  }
This tells TypeScript to use the polling method for checking for file changes instead of file system events (the new default method), which can cause issues on some machines. You can read more about the "watchFile" option in TypeScript documentation.


Serialization
Serialization is a process that happens before objects are returned in a network response. This is an appropriate place to provide rules for transforming and sanitizing the data to be returned to the client. For example, sensitive data like passwords should always be excluded from the response. Or, certain properties might require additional transformation, such as sending only a subset of properties of an entity. Performing these transformations manually can be tedious and error prone, and can leave you uncertain that all cases have been covered.

Overview#
Nest provides a built-in capability to help ensure that these operations can be performed in a straightforward way. The ClassSerializerInterceptor interceptor uses the powerful class-transformer package to provide a declarative and extensible way of transforming objects. The basic operation it performs is to take the value returned by a method handler and apply the instanceToPlain() function from class-transformer. In doing so, it can apply rules expressed by class-transformer decorators on an entity/DTO class, as described below.

Hint
The serialization does not apply to StreamableFile responses.
Exclude properties#
Let's assume that we want to automatically exclude a password property from a user entity. We annotate the entity as follows:



import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
Now consider a controller with a method handler that returns an instance of this class.



@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}
Warning
Note that we must return an instance of the class. If you return a plain JavaScript object, for example, { user: new UserEntity() }, the object won't be properly serialized.
Hint
The ClassSerializerInterceptor is imported from @nestjs/common.
When this endpoint is requested, the client receives the following response:


{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
Note that the interceptor can be applied application-wide (as covered here). The combination of the interceptor and the entity class declaration ensures that any method that returns a UserEntity will be sure to remove the password property. This gives you a measure of centralized enforcement of this business rule.

Expose properties#
You can use the @Expose() decorator to provide alias names for properties, or to execute a function to calculate a property value (analogous to getter functions), as shown below.



@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
Transform#
You can perform additional data transformation using the @Transform() decorator. For example, the following construct returns the name property of the RoleEntity instead of returning the whole object.



@Transform(({ value }) => value.name)
role: RoleEntity;
Pass options#
You may want to modify the default behavior of the transformation functions. To override default settings, pass them in an options object with the @SerializeOptions() decorator.



@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}
Hint
The @SerializeOptions() decorator is imported from @nestjs/common.
Options passed via @SerializeOptions() are passed as the second argument of the underlying instanceToPlain() function. In this example, we are automatically excluding all properties that begin with the _ prefix.

Transform plain objects#
You can enforce transformations at the controller level by using the @SerializeOptions decorator. This ensures that all responses are transformed into instances of the specified class, applying any decorators from class-validator or class-transformer, even when plain objects are returned. This approach leads to cleaner code without the need to repeatedly instantiate the class or call plainToInstance.

In the example below, despite returning plain JavaScript objects in both conditional branches, they will be automatically converted into UserEntity instances, with the relevant decorators applied:



@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Get()
findOne(@Query() { id }: { id: number }): UserEntity {
  if (id === 1) {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
    };
  }

  return {
    id: 2,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password2',
  };
}
Hint
By specifying the expected return type for the controller, you can leverage TypeScript's type-checking capabilities to ensure that the returned plain object adheres to the shape of the DTO or entity. The plainToInstance function doesn't provide this level of type hinting, which can lead to potential bugs if the plain object doesn't match the expected DTO or entity structure.
Example#
A working example is available here.

WebSockets and Microservices#
While this chapter shows examples using HTTP style applications (e.g., Express or Fastify), the ClassSerializerInterceptor works the same for WebSockets and Microservices, regardless of the transport method that is used.

Learn more#
Read more about available decorators and options as provided by the class-transformer package here.



Versioning
Hint
This chapter is only relevant to HTTP-based applications.
Versioning allows you to have different versions of your controllers or individual routes running within the same application. Applications change very often and it is not unusual that there are breaking changes that you need to make while still needing to support the previous version of the application.

There are 4 types of versioning that are supported:

URI Versioning	The version will be passed within the URI of the request (default)
Header Versioning	A custom request header will specify the version
Media Type Versioning	The Accept header of the request will specify the version
Custom Versioning	Any aspect of the request may be used to specify the version(s). A custom function is provided to extract said version(s).
URI Versioning Type#
URI Versioning uses the version passed within the URI of the request, such as https://example.com/v1/route and https://example.com/v2/route.

Notice
With URI Versioning the version will be automatically added to the URI after the global path prefix (if one exists), and before any controller or route paths.
To enable URI Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
Notice
The version in the URI will be automatically prefixed with v by default, however the prefix value can be configured by setting the prefix key to your desired prefix or false if you wish to disable it.
Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Header Versioning Type#
Header Versioning uses a custom, user specified, request header to specify the version where the value of the header will be the version to use for the request.

Example HTTP Requests for Header Versioning:

To enable Header Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
The header property should be the name of the header that will contain the version of the request.

Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Media Type Versioning Type#
Media Type Versioning uses the Accept header of the request to specify the version.

Within the Accept header, the version will be separated from the media type with a semi-colon, ;. It should then contain a key-value pair that represents the version to use for the request, such as Accept: application/json;v=2. They key is treated more as a prefix when determining the version will to be configured to include the key and separator.

To enable Media Type Versioning for your application, do the following:


main.tsJS

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
The key property should be the key and separator of the key-value pair that contains the version. For the example Accept: application/json;v=2, the key property would be set to v=.

Hint
The VersioningType enum is available to use for the type property and is imported from the @nestjs/common package.
Custom Versioning Type#
Custom Versioning uses any aspect of the request to specify the version (or versions). The incoming request is analyzed using an extractor function that returns a string or array of strings.

If multiple versions are provided by the requester, the extractor function can return an array of strings, sorted in order of greatest/highest version to smallest/lowest version. Versions are matched to routes in order from highest to lowest.

If an empty string or array is returned from the extractor, no routes are matched and a 404 is returned.

For example, if an incoming request specifies it supports versions 1, 2, and 3, the extractorMUST return [3, 2, 1]. This ensures that the highest possible route version is selected first.

If versions [3, 2, 1] are extracted, but routes only exist for version 2 and 1, the route that matches version 2 is selected (version 3 is automatically ignored).

Notice
Selecting the highest matching version based on the array returned from extractor > does not reliably work with the Express adapter due to design limitations. A single version (either a string or array of 1 element) works just fine in Express. Fastify correctly supports both highest matching version selection and single version selection.
To enable Custom Versioning for your application, create an extractor function and pass it into your application like so:


main.tsJS

// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
Usage#
Versioning allows you to version controllers, individual routes, and also provides a way for certain resources to opt-out of versioning. The usage of versioning is the same regardless of the Versioning Type your application uses.

Notice
If versioning is enabled for the application but the controller or route does not specify the version, any requests to that controller/route will be returned a 404 response status. Similarly, if a request is received containing a version that does not have a corresponding controller or route, it will also be returned a 404 response status.
Controller versions#
A version can be applied to a controller, setting the version for all routes within the controller.

To add a version to a controller do the following:


cats.controller.tsJS

@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1';
  }
}
Route versions#
A version can be applied to an individual route. This version will override any other version that would effect the route, such as the Controller Version.

To add a version to an individual route do the following:


cats.controller.tsJS

import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1(): string {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2(): string {
    return 'This action returns all cats for version 2';
  }
}
Multiple versions#
Multiple versions can be applied to a controller or route. To use multiple versions, you would set the version to be an Array.

To add multiple versions do the following:


cats.controller.tsJS

@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1 or 2';
  }
}
Version "Neutral"#
Some controllers or routes may not care about the version and would have the same functionality regardless of the version. To accommodate this, the version can be set to VERSION_NEUTRAL symbol.

An incoming request will be mapped to a VERSION_NEUTRAL controller or route regardless of the version sent in the request in addition to if the request does not contain a version at all.

Notice
For URI Versioning, a VERSION_NEUTRAL resource would not have the version present in the URI.
To add a version neutral controller or route do the following:


cats.controller.tsJS

import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats regardless of version';
  }
}
Global default version#
If you do not want to provide a version for each controller/or individual routes, or if you want to have a specific version set as the default version for every controller/route that don't have the version specified, you could set the defaultVersion as follows:


main.tsJS

app.enableVersioning({
  // ...
  defaultVersion: '1'
  // or
  defaultVersion: ['1', '2']
  // or
  defaultVersion: VERSION_NEUTRAL
});
Middleware versioning#
Middlewares can also use versioning metadata to configure the middleware for a specific route's version. To do so, provide the version number as one of the parameters for the MiddlewareConsumer.forRoutes() method:


app.module.tsJS

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET, version: '2' });
  }
}
With the code above, the LoggerMiddleware will only be applied to the version '2' of /cats endpoint.

Notice
Middlewares work with any versioning type described in the this section: URI, Header, Media Type or Custom.


