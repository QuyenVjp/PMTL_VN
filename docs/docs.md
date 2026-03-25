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