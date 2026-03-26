# PostgreSQL (/docs/prisma-orm/quickstart/postgresql)



[PostgreSQL](https://www.postgresql.org) is a powerful, open-source relational database. In this guide, you will learn how to set up a new TypeScript project from scratch, connect it to PostgreSQL using Prisma ORM, and generate a Prisma Client for easy, type-safe access to your database.

Prerequisites [#prerequisites]

You also need:

* A [PostgreSQL](https://www.postgresql.org/) database server running and accessible
* Database connection details (host, port, username, password, database name)

<CalloutContainer type="info">
  <CalloutTitle>
    Need a PostgreSQL database?
  </CalloutTitle>

  <CalloutDescription>
    If you don't already have a PostgreSQL database, follow the quickstart to set up a production-ready [Prisma Postgres](/prisma-orm/quickstart/prisma-postgres) database with Prisma ORM in a new project.
  </CalloutDescription>
</CalloutContainer>

1. Create a new project [#1-create-a-new-project]

```shell
mkdir hello-prisma
cd hello-prisma
```

Initialize a TypeScript project:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm init -y
    npm install typescript tsx @types/node --save-dev
    npx tsc --init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm init -y
    pnpm add typescript tsx @types/node --save-dev
    pnpm dlx tsc --init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn init -y
    yarn add typescript tsx @types/node --dev
    yarn dlx tsc --init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun init -y
    bun add typescript tsx @types/node --dev
    bun x tsc --init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

2. Install required dependencies [#2-install-required-dependencies]

Install the packages needed for this quickstart:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma @types/pg --save-dev
    npm install @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma @types/pg --save-dev
    pnpm add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma @types/pg --dev
    yarn add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma @types/pg --dev
    bun add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Here's what each package does:

* **`prisma`** - The Prisma CLI for running commands like `prisma init`, `prisma migrate`, and `prisma generate`
* **`@prisma/client`** - The Prisma Client library for querying your database
* **`@prisma/adapter-pg`** - The [`node-postgres` driver adapter](/orm/core-concepts/supported-databases/postgresql#using-driver-adapters) that connects Prisma Client to your database
* **`pg`** - The node-postgres database driver
* **`@types/pg`** - TypeScript type definitions for node-postgres
* **`dotenv`** - Loads environment variables from your `.env` file

3. Configure ESM support [#3-configure-esm-support]

Update `tsconfig.json` for ESM compatibility:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}
```

Update `package.json` to enable ESM:

```json title="package.json"
{
  "type": "module" // [!code ++]
}
```

4. Initialize Prisma ORM [#4-initialize-prisma-orm]

You can now invoke the Prisma CLI by prefixing it with `npx`:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Next, set up your Prisma ORM project by creating your [Prisma Schema](/orm/prisma-schema/overview) file with the following command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command does a few things:

* Creates a `prisma/` directory with a `schema.prisma` file containing your database connection and schema models
* Creates a `.env` file in the root directory for environment variables
* Creates a `prisma.config.ts` file for Prisma configuration

The generated `prisma.config.ts` file looks like this:

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

The generated schema uses [the ESM-first `prisma-client` generator](/orm/prisma-schema/overview/generators#prisma-client) with a custom output path:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Update your `.env` file with your PostgreSQL connection string:

```text title=".env"
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

Replace the placeholders with your actual database credentials:

* `username`: Your PostgreSQL username
* `password`: Your PostgreSQL password
* `localhost:5432`: Your PostgreSQL host and port
* `mydb`: Your database name

5. Define your data model [#5-define-your-data-model]

Open `prisma/schema.prisma` and add the following models:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User { // [!code ++]
  id    Int     @id @default(autoincrement()) // [!code ++]
  email String  @unique // [!code ++]
  name  String? // [!code ++]
  posts Post[] // [!code ++]
} // [!code ++]

model Post { // [!code ++]
  id        Int     @id @default(autoincrement()) // [!code ++]
  title     String // [!code ++]
  content   String? // [!code ++]
  published Boolean @default(false) // [!code ++]
  author    User    @relation(fields: [authorId], references: [id]) // [!code ++]
  authorId  Int // [!code ++]
} // [!code ++]
```

6. Create and apply your first migration [#6-create-and-apply-your-first-migration]

Create your first migration to set up the database tables:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command creates the database tables based on your schema.

Now run the following command to generate the Prisma Client:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

7. Instantiate Prisma Client [#7-instantiate-prisma-client]

Now that you have all the dependencies installed, you can instantiate Prisma Client. You need to pass an instance of the Prisma ORM driver adapter adapter to the `PrismaClient` constructor:

```typescript title="lib/prisma.ts"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

8. Write your first query [#8-write-your-first-query]

Create a `script.ts` file to test your setup:

```typescript title="script.ts"
import { prisma } from "./lib/prisma";

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("Created user:", user);

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run the script:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun tsx script.ts
    ```
  </CodeBlockTab>
</CodeBlockTabs>

You should see the created user and all users printed to the console!

9. Explore your data with Prisma Studio [#9-explore-your-data-with-prisma-studio]

Prisma Studio is a visual editor for your database. Launch it with:

```shell
npx prisma studio
```

Next steps [#next-steps]

You've successfully set up Prisma ORM. Here's what you can explore next:

* **Learn more about Prisma Client**: Explore the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction) for advanced querying, filtering, and relations
* **Database migrations**: Learn about [Prisma Migrate](/orm/prisma-migrate) for evolving your database schema
* **Performance optimization**: Discover [query optimization techniques](/orm/prisma-client/queries/advanced/query-optimization-performance)
* **Build a full application**: Check out our [framework guides](/guides) to integrate Prisma ORM with Next.js, Express, and more
* **Join the community**: Connect with other developers on [Discord](https://pris.ly/discord)

More info [#more-info]

* [PostgreSQL database connector](/orm/core-concepts/supported-databases/postgresql)
* [Prisma Config reference](/orm/reference/prisma-config-reference)
* [Database connection management](/orm/prisma-client/setup-and-configuration/databases-connections)
# PostgreSQL (/docs/prisma-orm/add-to-existing-project/postgresql)



[PostgreSQL](https://www.postgresql.org/) is a popular open-source relational database known for its reliability, feature robustness, and performance. In this guide, you will learn how to add Prisma ORM to an existing TypeScript project, connect it to PostgreSQL, introspect your existing database schema, and start querying with type-safe Prisma Client.

Prerequisites [#prerequisites]

1. Set up Prisma ORM [#1-set-up-prisma-orm]

Navigate to your existing project directory and install the required dependencies:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma @types/node @types/pg --save-dev
    npm install @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma @types/node @types/pg --save-dev
    pnpm add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma @types/node @types/pg --dev
    yarn add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma @types/node @types/pg --dev
    bun add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Here's what each package does:

* **`prisma`** - The Prisma CLI for running commands like `prisma init`, `prisma db pull`, and `prisma generate`
* **`@prisma/client`** - The Prisma Client library for querying your database
* **`@prisma/adapter-pg`** - The [`node-postgres` driver adapter](/orm/core-concepts/supported-databases/postgresql#using-driver-adapters) that connects Prisma Client to your database
* **`pg`** - The node-postgres database driver
* **`@types/pg`** - TypeScript type definitions for node-postgres
* **`dotenv`** - Loads environment variables from your `.env` file

2. Initialize Prisma ORM [#2-initialize-prisma-orm]

Set up your Prisma ORM project by creating your [Prisma Schema](/orm/prisma-schema/overview) file with the following command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init --datasource-provider postgresql --output ../generated/prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command does a few things:

* Creates a `prisma/` directory with a `schema.prisma` file containing your database connection configuration
* Creates a `.env` file in the root directory for environment variables
* Creates a `prisma.config.ts` file for Prisma configuration

The generated `prisma.config.ts` file looks like this:

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

The generated schema uses [the ESM-first `prisma-client` generator](/orm/prisma-schema/overview/generators#prisma-client) with a custom output path:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

3. Connect your database [#3-connect-your-database]

Update the `.env` file with your PostgreSQL connection URL:

```text title=".env"
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

The [format of the connection URL](/orm/reference/connection-urls) for PostgreSQL looks as follows:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

4. Introspect your database [#4-introspect-your-database]

Run the following command to introspect your existing database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db pull
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command reads the `DATABASE_URL` environment variable, connects to your database, and introspects the database schema. It then translates the database schema from SQL into a data model in your Prisma schema.

<img alt="Introspect your database with Prisma ORM" src="/img/getting-started/prisma-db-pull-generate-schema.png" width="1600" height="750" />

After introspection, your Prisma schema will contain models that represent your existing database tables.

5. Baseline your database [#5-baseline-your-database]

To use Prisma Migrate with your existing database, you need to [baseline your database](/orm/prisma-migrate/getting-started).

First, create a `migrations` directory:

```bash
mkdir -p prisma/migrations/0_init
```

Next, generate the migration file with `prisma migrate diff`:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Review the generated migration file to ensure it matches your database schema.

Then, mark the migration as applied:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --applied 0_init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --applied 0_init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --applied 0_init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --applied 0_init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

You now have a baseline for your current database schema.

6. Generate Prisma ORM types [#6-generate-prisma-orm-types]

Generate Prisma Client based on your introspected schema:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This creates a type-safe Prisma Client tailored to your database schema in the `generated/prisma` directory.

7. Instantiate Prisma Client [#7-instantiate-prisma-client]

Create a utility file to instantiate Prisma Client. You need to pass an instance of the Prisma ORM driver adapter adapter to the `PrismaClient` constructor:

```typescript title="lib/prisma.ts"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

8. Query your database [#8-query-your-database]

Now you can use Prisma Client to query your database. Create a `script.ts` file:

```typescript title="script.ts"
import { prisma } from "./lib/prisma";

async function main() {
  // Example: Fetch all records from a table
  // Replace 'user' with your actual model name
  const allUsers = await prisma.user.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run the script:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun tsx script.ts
    ```
  </CodeBlockTab>
</CodeBlockTabs>

9. Evolve your schema [#9-evolve-your-schema]

To make changes to your database schema:

9.1. Update your Prisma schema file [#91-update-your-prisma-schema-file]

Update your Prisma schema file to reflect the changes you want to make to your database schema. For example, add a new model:

```prisma title="prisma/schema.prisma"
model Post { // [!code ++]
  id        Int      @id @default(autoincrement()) // [!code ++]
  title     String // [!code ++]
  content   String? // [!code ++]
  published Boolean  @default(false) // [!code ++]
  authorId  Int // [!code ++]
  author    User     @relation(fields: [authorId], references: [id]) // [!code ++]
} // [!code ++]

model User { // [!code ++]
  id    Int    @id @default(autoincrement()) // [!code ++]
  email String @unique // [!code ++]
  name  String? // [!code ++]
  posts Post[] // [!code ++]
} // [!code ++]
```

9.2. Create and apply a migration: [#92-create-and-apply-a-migration]

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name your_migration_name
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name your_migration_name
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name your_migration_name
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name your_migration_name
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command will:

* Create a new SQL migration file
* Apply the migration to your database
* Regenerate Prisma Client

10. Explore your data with Prisma Studio [#10-explore-your-data-with-prisma-studio]

```shell
npx prisma studio
```

Next steps [#next-steps]

You've successfully set up Prisma ORM. Here's what you can explore next:

* **Learn more about Prisma Client**: Explore the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction) for advanced querying, filtering, and relations
* **Database migrations**: Learn about [Prisma Migrate](/orm/prisma-migrate) for evolving your database schema
* **Performance optimization**: Discover [query optimization techniques](/orm/prisma-client/queries/advanced/query-optimization-performance)
* **Build a full application**: Check out our [framework guides](/guides) to integrate Prisma ORM with Next.js, Express, and more
* **Join the community**: Connect with other developers on [Discord](https://pris.ly/discord)

More info [#more-info]

* [PostgreSQL database connector](/orm/core-concepts/supported-databases/postgresql)
* [Prisma Config reference](/orm/reference/prisma-config-reference)
* [Database introspection](/orm/prisma-schema/introspection)
* [Prisma Migrate](/orm/prisma-migrate)
# Prisma ORM (/docs/prisma-postgres/quickstart/prisma-orm)



[Prisma Postgres](/postgres) is a fully managed PostgreSQL database that scales to zero and integrates smoothly with both Prisma ORM and Prisma Studio. In this guide, you will learn how to set up a new TypeScript project from scratch, connect it to Prisma Postgres using Prisma ORM, and generate a Prisma Client for easy, type-safe access to your database.

Prerequisites [#prerequisites]

1. Create a new project [#1-create-a-new-project]

2. Install required dependencies [#2-install-required-dependencies]

Install the packages needed for this quickstart:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma @types/node --save-dev
    npm install @prisma/client @prisma/adapter-pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma @types/node --save-dev
    pnpm add @prisma/client @prisma/adapter-pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma @types/node --dev
    yarn add @prisma/client @prisma/adapter-pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma @types/node --dev
    bun add @prisma/client @prisma/adapter-pg dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Here's what each package does:

* **`prisma`** - The Prisma CLI for running commands like `prisma init`, `prisma migrate`, and `prisma generate`
* **`@prisma/client`** - The Prisma Client library for querying your database
* **`@prisma/adapter-pg`** - The [`node-postgres` driver adapter](/orm/core-concepts/supported-databases/postgresql#using-driver-adapters) that connects Prisma Client to your database
* **`dotenv`** - Loads environment variables from your `.env` file

3. Configure ESM support [#3-configure-esm-support]

Update `tsconfig.json` for ESM compatibility:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}
```

Update `package.json` to enable ESM:

```json title="package.json"
{
  "type": "module" // [!code ++]
}
```

4. Initialize Prisma ORM [#4-initialize-prisma-orm]

Next, set up your Prisma ORM project by creating your [Prisma Schema](/orm/prisma-schema/overview) file with the following command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    `prisma init` creates the Prisma scaffolding and a local `DATABASE_URL`. In the next step, replace that value with a direct `postgres://...` connection string from Prisma Postgres.
  </CalloutDescription>
</CalloutContainer>

This command does a few things:

* Creates a `prisma/` directory with a `schema.prisma` file containing your database connection and schema models
* Creates a `.env` file in the root directory for environment variables
* Generates the Prisma Client in the `generated/prisma/` directory
* Creates a `prisma.config.ts` file for Prisma configuration

The generated `prisma.config.ts` file looks like this:

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

The generated schema uses [the ESM-first `prisma-client` generator](/orm/prisma-schema/overview/generators#prisma-client) with a custom output path:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Create a Prisma Postgres database and replace the generated `DATABASE_URL` in your `.env` file with the `postgres://...` connection string from the CLI output:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun create-db
    ```
  </CodeBlockTab>
</CodeBlockTabs>

5. Define your data model [#5-define-your-data-model]

Open `prisma/schema.prisma` and add the following models:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User { // [!code ++]
  id    Int     @id @default(autoincrement()) // [!code ++]
  email String  @unique // [!code ++]
  name  String? // [!code ++]
  posts Post[] // [!code ++]
} // [!code ++]

model Post { // [!code ++]
  id        Int     @id @default(autoincrement()) // [!code ++]
  title     String // [!code ++]
  content   String? // [!code ++]
  published Boolean @default(false) // [!code ++]
  author    User    @relation(fields: [authorId], references: [id]) // [!code ++]
  authorId  Int // [!code ++]
} // [!code ++]
```

6. Create and apply your first migration [#6-create-and-apply-your-first-migration]

Create your first migration to set up the database tables:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command creates the database tables based on your schema.

Now run the following command to generate the Prisma Client:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

7. Instantiate Prisma Client [#7-instantiate-prisma-client]

Now that you have all the dependencies installed, you can instantiate Prisma Client. You need to pass an instance of the Prisma ORM driver adapter adapter to the `PrismaClient` constructor:

```typescript title="lib/prisma.ts"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

<CalloutContainer type="info">
  <CalloutDescription>
    If you need to query your database via HTTP from an edge runtime (Cloudflare Workers, Vercel Edge Functions, etc.), use the [Prisma Postgres serverless driver](/postgres/database/serverless-driver#use-with-prisma-orm).
  </CalloutDescription>
</CalloutContainer>

8. Write your first query [#8-write-your-first-query]

Create a `script.ts` file to test your setup:

```typescript title="script.ts"
import { prisma } from "./lib/prisma";

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("Created user:", user);

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run the script:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx tsx script.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun tsx script.ts
    ```
  </CodeBlockTab>
</CodeBlockTabs>

You should see the created user and all users printed to the console!

9. Explore your data with Prisma Studio [#9-explore-your-data-with-prisma-studio]

```shell
npx prisma studio
```

Next steps [#next-steps]

You've successfully set up Prisma ORM. Here's what you can explore next:

* **Learn more about Prisma Client**: Explore the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction) for advanced querying, filtering, and relations
* **Database migrations**: Learn about [Prisma Migrate](/orm/prisma-migrate) for evolving your database schema
* **Performance optimization**: Discover [query optimization techniques](/orm/prisma-client/queries/advanced/query-optimization-performance)
* **Build a full application**: Check out our [framework guides](/guides) to integrate Prisma ORM with Next.js, Express, and more
* **Join the community**: Connect with other developers on [Discord](https://pris.ly/discord)

More info [#more-info]

* [Prisma Postgres documentation](/postgres)
* [Prisma Config reference](/orm/reference/prisma-config-reference)
* [Database connection management](/orm/prisma-client/setup-and-configuration/databases-connections)


# Upgrade to v7 (/docs/guides/upgrade-prisma-orm/v7)



Prisma ORM v7 introduces **breaking changes** when you upgrade from an earlier Prisma ORM version. This guide explains how this upgrade might affect your application and gives instructions on how to handle any changes.

<details>
  <summary>
    Questions answered in this page
  </summary>

  * What changed in Prisma v7?
  * How do I upgrade safely?
  * Which breaking changes affect my app?
</details>

For developers using AI Agents, we have a [migration prompt](/ai/prompts/prisma-7) that you can
add to your project for automatic migrations.

<CalloutContainer type="info">
  <CalloutDescription>
    If you are using MongoDB, please note that Prisma ORM v7 does not yet support MongoDB. You should continue using Prisma ORM v6 for now. Support for MongoDB is coming soon in v7.
  </CalloutDescription>
</CalloutContainer>

Update packages [#update-packages]

To upgrade to Prisma ORM v7 from an earlier version, you need to update both the `prisma` and `@prisma/client` packages:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install @prisma/client@7
    npm install -D prisma@7
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add @prisma/client@7
    pnpm add -D prisma@7
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add @prisma/client@7
    yarn add --dev prisma@7
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add @prisma/client@7
    bun add --dev prisma@7
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="error">
  <CalloutDescription>
    Before you upgrade, check each breaking change below to see how the upgrade might affect your application.
  </CalloutDescription>
</CalloutContainer>

Breaking changes [#breaking-changes]

This section gives an overview of breaking changes in Prisma ORM v7.

Prerequisites [#prerequisites]

|            | Minimum Version | Recommended |
| ---------- | --------------- | ----------- |
| Node       | 20.19.0         | 22.x        |
| TypeScript | 5.4.0           | 5.9.x       |

ESM support [#esm-support]

Prisma ORM now ships as an ES module, the module format supported in Bun, Deno, and Node. Set the
`type` field in your `package.json` to `module`

```json
{
  "type": "module",
  "scripts": {...},
}
```

If you are using TypeScript, you need to configure your `tsconfig.json` to be able to consume ES modules

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

Schema changes [#schema-changes]

The older `prisma-client-js` provider will be removed in future releases of Prisma ORM. Upgrade to
the new `prisma-client` provider which uses the new Rust-free client. This will give you faster
queries, smaller bundle size, and require less system resources when deployed to your server.

Additionally, the `output` field is now **required** in the generator block. Prisma Client will no longer be generated in `node_modules` by default. You must specify a custom output path.

<CodeBlockTabs defaultValue="Before">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Before">
      Before
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="After">
      After
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Before">
    ```prisma
    generator client {
      provider = "prisma-client-js"
      engineType = "binary"
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="After">
    ```prisma
    generator client {
      provider = "prisma-client"
      output   = "./generated/prisma"
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

After running `npx prisma generate`, you'll need to update your imports to use the new generated path:

```ts
// Before
import { PrismaClient } from "@prisma/client";

// After
import { PrismaClient } from "./generated/prisma/client";
```

<CalloutContainer type="info">
  <CalloutDescription>
    The import path depends on where you place your generated client. Adjust the path based on your `output` configuration and the location of the file you're importing from.
  </CalloutDescription>
</CalloutContainer>

Additionally other fields such as `url`, `directUrl`, and `shadowDatabaseUrl` in the `datasource` block are deprecated. You can configure them in the [Prisma Config](/orm/reference/prisma-config-reference).

If you were previously using `directUrl` to run migrations then you need to pass the `directUrl` value in the `url` field of `prisma.config.ts` instead as the connection string defined in `url` is used by Prisma CLI for migrations.

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
```

Driver adapters [#driver-adapters]

The way to create a new Prisma Client has changed to require a driver adapter for all databases.
This change aligns with the move to make the main Prisma Client as lean and open as possible. For
instance, if you are using Prisma Postgres, you now need the `@prisma/adapter-pg` adapter. This also
means the signature for creating a new Prisma Client has changed slightly:

<CalloutContainer type="warning">
  <CalloutDescription>
    Connection pools have changed.

    Driver adapters use the connection pool settings from the underlying Node.js database driver, which may differ significantly from Prisma ORM v6 defaults. For example, the `pg` driver has no connection timeout by default (`0`), while Prisma ORM v6 used a 5-second timeout.

    **If you experience timeout issues after upgrading**, configure your driver adapter to match v6 behavior. See the [connection pool guide](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool#prisma-orm-v7-driver-adapter-defaults) for detailed configuration examples for each database.
  </CalloutDescription>
</CalloutContainer>

Before [#before]

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
  datasourceUrl: process.env.DATABASE_URL,
});
```

After [#after]

```ts
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });
```

If you are using SQLite, you can use the `@prisma/adapter-better-sqlite3`:

```ts
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

export const prisma = new PrismaClient({ adapter });
```

Prisma Accelerate [#prisma-accelerate]

If you used Prisma Accelerate (including Prisma Postgres' `prisma+postgres://` URLs) in v6, keep using the Accelerate URL with the Accelerate extension. Do **not** pass the Accelerate URL to a driver adapter—`PrismaPg` expects a direct database connection string and will fail with `prisma://` or `prisma+postgres://`.

1. Keep your Accelerate URL in `.env` (for example `DATABASE_URL="prisma://..."` or `prisma+postgres://...`).
2. You can point `prisma.config.ts` directly to that same Accelerate URL for CLI operations:

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

* If you prefer a separate direct URL for migrations, you can still use `DIRECT_DATABASE_URL` as above—but it's optional for Accelerate users.

3. Instantiate Prisma Client with the Accelerate URL and extension (no adapter):

```ts
import { PrismaClient } from "./generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());
```

If you later switch away from Accelerate to direct TCP, provide the direct URL to the appropriate driver adapter (for example `PrismaPg`) instead of `accelerateUrl`.

SSL certificate validation changes [#ssl-certificate-validation-changes]

Since Prisma ORM v7 uses `node-pg` instead of the Rust-based query engine, SSL certificate defaults have changed. Previously, invalid SSL certificates were ignored. In v7, you may encounter the following error:

```bash
Error: P1010: User was denied access on the database <database>
```

To fix this, either keep the previous behavior:

```ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
```

Or properly configure your database certificates using `node --use-openssl-ca` or by setting the `NODE_EXTRA_CA_CERTS` environment variable.

For more details, see [GitHub issue #28795](https://github.com/prisma/prisma/issues/28795).

Environment variables [#environment-variables]

In Prisma ORM 7.0.0, environment variables are not loaded by default. Instead developers need to
explicitly load the variables when calling the `prisma` CLI. Libraries like [`dotenv`](https://github.com/motdotla/dotenv) can be used to manage loading environment variables by reading the appropriate `.env` file.

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

For bun users, no action is required as bun will automatically load `.env` files.

Prisma config [#prisma-config]

Prisma Config is now the default place for configuring how the Prisma CLI interacts with your
database. You now configure your database URL, schema location, migration output, and custom seed
scripts.

<CalloutContainer type="info">
  <CalloutDescription>
    The `prisma.config.ts` file should be placed at the **root of your project** (where your `package.json` is located).
  </CalloutDescription>
</CalloutContainer>

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // the main entry for your schema
  schema: "prisma/schema.prisma",
  // where migrations should be generated
  // what script to run for "prisma db seed"
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // The database URL
  datasource: {
    // Type Safe env() helper
    // Does not replace the need for dotenv
    url: env("DATABASE_URL"),
  },
});
```

Metrics removed [#metrics-removed]

The Metrics preview feature was deprecated in [Prisma ORM 6.14.0](https://github.com/prisma/prisma/releases/tag/6.14.0) and has been removed for Prisma ORM 7.0.0.
If you need this feature, you can use the underlying driver adapter for your database, or Client Extensions to make this information available.

For example, a basic `totalQueries` counter:

```ts
const total = 0;
const prisma = new PrismaClient().$extends({
  client: {
    $log: (s: string) => console.log(s),
    async $totalQueries() {
      return total;
    },
  },
  query: {
    $allModels: {
      async $allOperations({ query, args }) {
        total += 1;
        return query(args);
      },
    },
  },
});

async function main() {
  prisma.$log("Hello world");
  const totalQueries = await prisma.$totalQueries();
  console.log(totalQueries);
}
```

Mapped enum values in generated TypeScript [#mapped-enum-values-in-generated-typescript]

<CalloutContainer type="info">
  <CalloutTitle>
    Reversion to Prisma 6 behavior
  </CalloutTitle>

  <CalloutDescription>
    The mapped enum implementation that was initially planned for Prisma ORM v7 has been reverted. Mapped enum behavior now matches Prisma ORM v6 to avoid breaking changes. We plan to implement a similar feature in the future with different syntax.
  </CalloutDescription>
</CalloutContainer>

In Prisma ORM v7, the generated TypeScript enum values use the **schema names**, not the mapped values. This maintains compatibility with Prisma ORM v6 behavior.

Prisma ORM v6 behavior [#prisma-orm-v6-behavior]

Given this Prisma schema:

```prisma
enum SuggestionStatus {
  PENDING  @map("pending")
  ACCEPTED @map("accepted")
  REJECTED @map("rejected")
}
```

In v6, the generated TypeScript enum was:

```ts
export const SuggestionStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;
```

Prisma ORM v7 (reverted behavior) [#prisma-orm-v7-reverted-behavior]

In v7, the same schema generates the same TypeScript as v6:

```ts
export const SuggestionStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;
```

This means that `SuggestionStatus.PENDING` evaluates to `"PENDING"`, not `"pending"`. The mapping is handled at the database level only.

Migration steps [#migration-steps]

No migration is required for this change. The behavior now matches Prisma ORM v6, so existing code will continue to work as expected.

Client middleware removed [#client-middleware-removed]

The client middleware API has been removed. If possible, use [Client Extensions](/orm/prisma-client/client-extensions).

```ts
// ❌ Old (removed)
prisma.$use(async (params, next) => {
  // middleware logic
  return next(params);
});
// ✅ New (use extensions)
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        // extension logic
        return query(args);
      },
    },
  },
});
```

Seeding changes [#seeding-changes]

In Prisma ORM v6 and earlier, running `prisma migrate dev` or `prisma migrate reset` would automatically execute your seed script after applying migrations. This automatic seeding behavior has been removed in Prisma ORM v7.

To seed your database in v7, you must explicitly run:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db seed
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Removed CLI flags [#removed-cli-flags]

The `--skip-generate` flag was removed from `prisma migrate dev` and `prisma db push`. The `--skip-seed` flag was removed from `prisma migrate dev`.

`migrate dev` and `db push` no longer run `prisma generate` automatically. You must run `prisma generate` explicitly to generate Prisma Client.

Removed db execute flags [#removed-db-execute-flags]

The `--schema` and `--url` flags have been removed from the `prisma db execute` command. Previously, you could use `--schema` to specify the path to your Prisma schema file, or `--url` to specify the database URL directly. Now, the database connection must be configured in `prisma.config.ts`.

Before (v6) [#before-v6]

```bash
# Using --schema
prisma db execute --file ./script.sql --schema prisma/schema.prisma

# Using --url
prisma db execute --file ./script.sql --url "$DATABASE_URL"
```

After (v7) [#after-v7]

Configure your database connection in `prisma.config.ts` instead:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Then run the command without `--schema` or `--url`:

```bash
prisma db execute --file ./script.sql
```

Migrate diff changes [#migrate-diff-changes]

Several options have been removed from `prisma migrate diff` and replaced with new options that use `prisma.config.ts`:

| Removed Option             | Replacement                     |
| -------------------------- | ------------------------------- |
| `--from-url`               | `--from-config-datasource`      |
| `--to-url`                 | `--to-config-datasource`        |
| `--from-schema-datasource` | `--from-config-datasource`      |
| `--to-schema-datasource`   | `--to-config-datasource`        |
| `--shadow-database-url`    | Configure in `prisma.config.ts` |

Before (v6) [#before-v6-1]

```bash
prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema schema.prisma \
  --script
```

After (v7) [#after-v7-1]

Configure your database connection in `prisma.config.ts`, then use `--from-config-datasource` or `--to-config-datasource`:

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-schema schema.prisma \
  --script
```

Various environment variables have been removed [#various-environment-variables-have-been-removed]

We've removed a small selection of Prisma-specific environment variables.

* `PRISMA_CLI_QUERY_ENGINE_TYPE`
* `PRISMA_CLIENT_ENGINE_TYPE`
* `PRISMA_QUERY_ENGINE_BINARY`
* `PRISMA_QUERY_ENGINE_LIBRARY`
* `PRISMA_GENERATE_SKIP_AUTOINSTALL`
* `PRISMA_SKIP_POSTINSTALL_GENERATE`
* `PRISMA_GENERATE_IN_POSTINSTALL`
* `PRISMA_GENERATE_DATAPROXY`
* `PRISMA_GENERATE_NO_ENGINE`
* `PRISMA_CLIENT_NO_RETRY`
* `PRISMA_MIGRATE_SKIP_GENERATE`
* `PRISMA_MIGRATE_SKIP_SEED`




# NestJS (/docs/guides/frameworks/nestjs)



Introduction [#introduction]

This guide shows you how to use Prisma ORM with [NestJS](https://nestjs.com/), a progressive Node.js framework for building efficient and scalable server-side applications. You'll build a REST API with NestJS that uses Prisma ORM to store and retrieve data from a database.

[Prisma ORM](https://www.prisma.io) is an open-source ORM for Node.js and TypeScript. It is used as an **alternative** to writing plain SQL, or using another database access tool such as SQL query builders (like [knex.js](https://knexjs.org/)) or ORMs (like [TypeORM](https://typeorm.io/) and [Sequelize](https://sequelize.org/)). Prisma currently supports PostgreSQL, MySQL, SQL Server, SQLite, MongoDB and CockroachDB.

While Prisma can be used with plain JavaScript, it embraces TypeScript and provides a level of type-safety that goes beyond the guarantees other ORMs in the TypeScript ecosystem offer.

You can find a ready-to-run example [here](https://github.com/prisma/prisma-examples/tree/latest/orm/nest)

Prerequisites [#prerequisites]

* [Node.js 20+](https://nodejs.org)

1. Create your NestJS project [#1-create-your-nestjs-project]

Install the NestJS CLI and create a new project:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install -g @nestjs/cli
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add -g @nestjs/cli
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn global add @nestjs/cli
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add --global @nestjs/cli
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```bash
nest new nestjs-prisma
```

When prompted, select **npm** as your package manager. Navigate to the project directory:

```bash
cd nestjs-prisma
```

You can run `npm start` to start your application at `http://localhost:3000/`. Over the course of this guide, you'll add routes to store and retrieve data about *users* and *posts*.

In `package.json`, add the `type` field set to `"module"`:

```json title="package.json"
{
  "type": "module" // [!code ++]
}
```

2. Set up Prisma [#2-set-up-prisma]

2.1. Install Prisma and dependencies [#21-install-prisma-and-dependencies]

Install the necessary Prisma packages and database drivers:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma --dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma --dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install @prisma/client @prisma/adapter-pg pg
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add @prisma/client @prisma/adapter-pg pg
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add @prisma/client @prisma/adapter-pg pg
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add @prisma/client @prisma/adapter-pg pg
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    If you are using a different database provider (MySQL, SQL Server), install the corresponding driver adapter package instead of `@prisma/adapter-pg`. For more information, see [Database drivers](/orm/core-concepts/supported-databases/database-drivers).
  </CalloutDescription>
</CalloutContainer>

2.2. Initialize Prisma [#22-initialize-prisma]

Initialize Prisma in your project:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init --output ../src/generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init --output ../src/generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init --output ../src/generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init --output ../src/generated/prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This creates a new `prisma` directory with the following contents:

* `schema.prisma`: Specifies your database connection and contains the database schema
* `prisma.config.ts`: A configuration file for your projects
* `.env`: A [dotenv](https://github.com/motdotla/dotenv) file, typically used to store your database credentials in a group of environment variables

Create a Prisma Postgres database and replace the generated `DATABASE_URL` in your `.env` file with the `postgres://...` connection string from the CLI output:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx create-db
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun create-db
    ```
  </CodeBlockTab>
</CodeBlockTabs>

2.3. Set the generator output path [#23-set-the-generator-output-path]

Specify your output `path` for the generated Prisma client by either passing `--output ../src/generated/prisma` during `prisma init` or directly in your Prisma schema:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

2.4. Configure your database connection [#24-configure-your-database-connection]

Your database connection is configured in the `datasource` block in your `schema.prisma` file. By default it's set to `postgresql` which is what you need for this guide.

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Now, open up `.env` and you should see a `DATABASE_URL` already specified:

```text title=".env"
DATABASE_URL="postgres://..."
```

<CalloutContainer type="info">
  <CalloutDescription>
    Make sure you have a [ConfigModule](https://docs.nestjs.com/techniques/configuration) configured, otherwise the `DATABASE_URL` variable will not be picked up from `.env`.
  </CalloutDescription>
</CalloutContainer>

2.5. Define your data model [#25-define-your-data-model]

Add the following two models to your `schema.prisma` file:

```prisma title="prisma/schema.prisma"
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

2.6. Create and run your migration [#26-create-and-run-your-migration]

With your Prisma models in place, you can generate your SQL migration files and run them against the database. Run the following commands in your terminal:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This `prisma migrate dev` command generates SQL files and directly runs them against the database. In this case, the following migration files was created in the existing `prisma` directory:

```bash
$ tree prisma
prisma
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma
```

2.7. Generate Prisma Client [#27-generate-prisma-client]

Once installed, you can run the generate command to generate the types and Client needed for your project. If any changes are made to your schema, you will need to rerun the `generate` command to keep those types in sync.

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

3. Create a Prisma service [#3-create-a-prisma-service]

You're now able to send database queries with Prisma Client. When setting up your NestJS application, you'll want to abstract away the Prisma Client API for database queries within a service. To get started, you can create a new `PrismaService` that takes care of instantiating `PrismaClient` and connecting to your database.

Inside the `src` directory, create a new file called `prisma.service.ts` and add the following code to it:

```typescript title="src/prisma.service.ts"
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }
}
```

4. Create User and Post services [#4-create-user-and-post-services]

Next, you can write services that you can use to make database calls for the `User` and `Post` models from your Prisma schema.

4.1. Create the User service [#41-create-the-user-service]

Still inside the `src` directory, create a new file called `user.service.ts` and add the following code to it:

```typescript title="src/user.service.ts"
import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { User, Prisma } from "./generated/prisma/client.js";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
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
```

Notice how you're using Prisma Client's generated types to ensure that the methods that are exposed by your service are properly typed. You therefore save the boilerplate of typing your models and creating additional interface or DTO files.

4.2. Create the Post service [#42-create-the-post-service]

Now do the same for the `Post` model.

Still inside the `src` directory, create a new file called `post.service.ts` and add the following code to it:

```typescript title="src/post.service.ts"
import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { Post, Prisma } from "./generated/prisma/client.js";

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async post(postWhereUniqueInput: Prisma.PostWhereUniqueInput): Promise<Post | null> {
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
```

Your `UserService` and `PostService` currently wrap the CRUD queries that are available in Prisma Client. In a real world application, the service would also be the place to add business logic to your application. For example, you could have a method called `updatePassword` inside the `UserService` that would be responsible for updating the password of a user.

5. Implement REST API routes [#5-implement-rest-api-routes]

5.1. Create the controller [#51-create-the-controller]

Finally, you'll use the services you created in the previous sections to implement the different routes of your app. For the purpose of this guide, you'll put all your routes into the already existing `AppController` class.

Replace the contents of the `app.controller.ts` file with the following code:

```typescript title="src/app.controller.ts"
import { Controller, Get, Param, Post, Body, Put, Delete } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { PostService } from "./post.service.js";
import { User as UserModel } from "./generated/prisma/client.js";
import { Post as PostModel } from "./generated/prisma/client.js";

@Controller()
export class AppController {
  constructor(
    private readonly UserService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get("post/:id")
  async getPostById(@Param("id") id: string): Promise<PostModel | null> {
    return this.postService.post({ id: Number(id) });
  }

  @Get("feed")
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get("filtered-posts/:searchString")
  async getFilteredPosts(@Param("searchString") searchString: string): Promise<PostModel[]> {
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

  @Post("post")
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

  @Post("user")
  async signupUser(@Body() userData: { name?: string; email: string }): Promise<UserModel> {
    return this.UserService.createUser(userData);
  }

  @Put("publish/:id")
  async publishPost(@Param("id") id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete("post/:id")
  async deletePost(@Param("id") id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
```

This controller implements the following routes:

GET [#get]

* `/post/:id`: Fetch a single post by its `id`
* `/feed`: Fetch all *published* posts
* `/filtered-posts/:searchString`: Filter posts by `title` or `content`

POST [#post]

* `/post`: Create a new post
  * Body:
    * `title: String` (required): The title of the post
    * `content: String` (optional): The content of the post
    * `authorEmail: String` (required): The email of the user that creates the post
* `/user`: Create a new user
  * Body:
    * `email: String` (required): The email address of the user
    * `name: String` (optional): The name of the user

PUT [#put]

* `/publish/:id`: Publish a post by its `id`

DELETE [#delete]

* `/post/:id`: Delete a post by its `id`

5.2. Register services in the app module [#52-register-services-in-the-app-module]

Remember to register the new services in the app module.

Update `src/app.module.ts` to register all services:

```typescript title="src/app.module.ts"
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service.js";
import { PrismaService } from "./prisma.service.js"; // [!code ++]
import { UserService } from "./user.service.js"; // [!code ++]
import { PostService } from "./post.service.js"; // [!code ++]

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService, PostService], // [!code ++]
})
export class AppModule {}
```

6. Test your API [#6-test-your-api]

Start your application:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm start
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm start
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn start
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun start
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Test your endpoints with curl, [Postman](https://www.postman.com/), or [HTTPie](https://httpie.io/).

**Create a user:**

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@prisma.io"}'
```

**Create a post:**

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "authorEmail": "alice@prisma.io"}'
```

**Get published posts:**

```bash
curl http://localhost:3000/feed
```

**Publish a post:**

```bash
curl -X PUT http://localhost:3000/publish/1
```

**Search posts:**

```bash
curl http://localhost:3000/filtered-posts/hello
```

Summary [#summary]

In this guide, you learned how to use Prisma ORM with NestJS to implement a REST API. The controller that implements the routes of the API is calling a `PrismaService` which in turn uses Prisma Client to send queries to a database to fulfill the data needs of incoming requests.

If you want to learn more about using NestJS with Prisma, be sure to check out the following resources:

* [NestJS & Prisma](https://www.prisma.io/nestjs)
* [Ready-to-run example projects for REST & GraphQL](https://github.com/prisma/prisma-examples/)
* [Production-ready starter kit](https://github.com/notiz-dev/nestjs-prisma-starter#instructions)
* [Video: Accessing Databases using NestJS with Prisma (5min)](https://www.youtube.com/watch?v=UlVJ340UEuk\&ab_channel=Prisma) by [Marc Stammerjohann](https://github.com/marcjulian)




# Docker (/docs/guides/deployment/docker)



This guide walks you through setting up a Prisma ORM application within a Docker environment. You'll learn how to configure a Node.js project, integrate Prisma for database management, and orchestrate the application using Docker Compose. By the end, you'll have a fully functional Prisma application running in a Docker container.

Prerequisites [#prerequisites]

* [Docker](https://docs.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed
* Node.js version: A [compatible Node.js version](/guides/upgrade-prisma-orm/v6#minimum-supported-nodejs-versions), required for Prisma 6.

See our [system requirements](/orm/reference/system-requirements) for all minimum version requirements.

Before starting, ensure that no PostgreSQL services are running locally, and that the following ports are free to avoid conflicts: `5432` (PostgreSQL), `3000` (application server) or `5555` (Prisma Studio server).

To stop existing PostgreSQL services, use:

```bash
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS
net stop postgresql             # Windows (Run as Administrator)
```

To stop all running Docker containers and free up ports:

```bash
docker ps -q | xargs docker stop
```

1. Set up your Node.js and Prisma application [#1-set-up-your-nodejs-and-prisma-application]

Let's start by creating a simple Node.js application with Prisma ORM and [Express.js](https://expressjs.com/).

1.1. Initialize your project [#11-initialize-your-project]

First, create a new project directory and initialize a Node.js project:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    mkdir docker-test
    cd docker-test
    npm init -y
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    mkdir docker-test
    cd docker-test
    pnpm init -y
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    mkdir docker-test
    cd docker-test
    yarn init -y
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    mkdir docker-test
    cd docker-test
    bun init -y
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will generate a `package.json` file:

```json title="package.json"
{
  "name": "docker-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

1.2. Install required dependencies [#12-install-required-dependencies]

Next, install the Prisma CLI as a development dependency and Express.js for the server:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma @types/pg --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma @types/pg --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma @types/pg --dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma @types/pg --dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install @prisma/client @prisma/adapter-pg pg dotenv express
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add @prisma/client @prisma/adapter-pg pg dotenv express
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add @prisma/client @prisma/adapter-pg pg dotenv express
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add @prisma/client @prisma/adapter-pg pg dotenv express
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    If you are using a different database provider (MySQL, SQL Server, SQLite), install the corresponding driver adapter package instead of `@prisma/adapter-pg`. For more information, see [Database drivers](/orm/core-concepts/supported-databases/database-drivers).
  </CalloutDescription>
</CalloutContainer>

1.3. Set up Prisma ORM [#13-set-up-prisma-orm]

Now, initialize Prisma to generate the necessary files:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init --output ../generated/prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This creates:

* A `prisma` folder containing `schema.prisma`, where you will define your database schema.
* An `.env` file in the project root, which stores environment variables.

Add a `User` model to the `schema.prisma` file located in the `prisma/schema.prisma` folder:

```prisma title="prisma/schema.prisma"
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output = "../generated/prisma_client" // [!code ++]
}

model User { // [!code ++]
  id        Int      @id @default(autoincrement()) // [!code ++]
  createdAt DateTime @default(now()) // [!code ++]
  email     String   @unique // [!code ++]
  name      String? // [!code ++]
} // [!code ++]
```

<CalloutContainer type="info">
  <CalloutDescription>
    In the `schema.prisma` file, we specify a [custom `output` path](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider) where Prisma will generate its types. This ensures Prisma's types are resolved correctly across different package managers and can be accessed by application consistently inside the container without any permission issues. In this guide, the types will be generated in the `./generated/prisma_client` directory.
  </CalloutDescription>
</CalloutContainer>

Now, create a `prisma.config.ts` file in the root of your project:

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

<CalloutContainer type="info">
  <CalloutDescription>
    You'll need to install the `dotenv` package to load environment variables:

    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install dotenv
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add dotenv
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add dotenv
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add dotenv
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </CalloutDescription>
</CalloutContainer>

1.4. Create an Express.js server [#14-create-an-expressjs-server]

With the Prisma schema in place, let's create an Express.js server to interact with the database. Start by creating an `index.js` file:

```bash
touch index.js
```

Add the following code to set up a basic Express server:

```js title="index.js"
const express = require("express"); // [!code ++]
const { PrismaClient } = require("./generated/prisma_client/client"); // [!code ++]
const { PrismaPg } = require("@prisma/adapter-pg"); // [!code ++]
// [!code ++]
const adapter = new PrismaPg({
  // [!code ++]
  connectionString: process.env.DATABASE_URL, // [!code ++]
}); // [!code ++]
// [!code ++]
const app = express(); // [!code ++]
const prisma = new PrismaClient({
  // [!code ++]
  adapter, // [!code ++]
}); // [!code ++]
app.use(express.json()); // [!code ++]
// [!code ++]
// Get all users // [!code ++]
app.get("/", async (req, res) => {
  // [!code ++]
  const userCount = await prisma.user.count(); // [!code ++]
  res.json(
    // [!code ++]
    userCount == 0 // [!code ++]
      ? "No users have been added yet." // [!code ++]
      : "Some users have been added to the database.", // [!code ++]
  ); // [!code ++]
}); // [!code ++]
// [!code ++]
const PORT = 3000; // [!code ++]
// [!code ++]
app.listen(PORT, () => {
  // [!code ++]
  console.log(`Server is running on http://localhost:${PORT}`); // [!code ++]
}); // [!code ++]
```

Update the `package.json` scripts to include commands for running the server and deploying migrations:

```json title="package.json"
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1", // [!code --]
  "dev": "node index.js", // [!code ++]
  "db:deploy": "npx prisma migrate deploy && npx prisma generate" // [!code ++]
}
```

Now that the application is set up, let's move on to configuring a PostgreSQL database using Docker Compose.

2. Set up a PostgreSQL database with Docker Compose [#2-set-up-a-postgresql-database-with-docker-compose]

To perform database migrations, we'll create a standalone PostgreSQL database using Docker Compose.

2.1. Create a Docker Compose file for PostgreSQL [#21-create-a-docker-compose-file-for-postgresql]

Create a `docker-compose.postgres.yml` file in the root directory:

```yml title="docker-compose.postgres.yml"
version: '3.7' // [!code ++]
 // [!code ++]
services: // [!code ++]
  postgres: // [!code ++]
    image: postgres:15 // [!code ++]
    restart: always // [!code ++]
    environment: // [!code ++]
      - POSTGRES_DB=postgres // [!code ++]
      - POSTGRES_USER=postgres // [!code ++]
      - POSTGRES_PASSWORD=prisma // [!code ++]
    ports: // [!code ++]
      - "5432:5432" // [!code ++]
    networks: // [!code ++]
      - prisma-network // [!code ++]
    healthcheck: // [!code ++]
      test: ["CMD-SHELL", "pg_isready -U prisma -d postgres"] // [!code ++]
      interval: 5s // [!code ++]
      timeout: 2s // [!code ++]
      retries: 20 // [!code ++]
    volumes: // [!code ++]
      - postgres_data:/var/lib/postgresql/data // [!code ++]
    command: postgres -c listen_addresses='*' // [!code ++]
    logging: // [!code ++]
      options: // [!code ++]
        max-size: "10m" // [!code ++]
        max-file: "3" // [!code ++]
 // [!code ++]
networks: // [!code ++]
  prisma-network: // [!code ++]
 // [!code ++]
volumes: // [!code ++]
  postgres_data: // [!code ++]
```

2.2. Start the PostgreSQL container [#22-start-the-postgresql-container]

Run the following command to start the database:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

2.3. Perform database migrations [#23-perform-database-migrations]

With the database running, update the `.env` file with the following database connection url:

```bash title=".env"
DATABASE_URL="postgresql://postgres:prisma@localhost:5432/postgres?schema=public" # [!code highlight]
```

Run the migration to create the database schema:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Then generate Prisma Client:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This should generate a `migrations` folder in the `prisma` folder and the Prisma Client in the `generated/prisma_client` directory.

2.4. Test the application [#24-test-the-application]

Start the server and verify it works:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm run dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm run dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun run dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Visit [`http://localhost:3000`](http://localhost:3000) to see the message:

```bash
No users have been added yet.
```

Stop the local server.

2.5. Clean up the standalone database [#25-clean-up-the-standalone-database]

Once testing is complete, remove the standalone PostgreSQL container:

```bash
docker compose -f docker-compose.postgres.yml down --remove-orphans
```

This command will:

* Stop running containers.
* Remove containers.
* Remove the default network created by Docker Compose.
* Remove associated volumes (if not named explicitly).

Now that we've tested the application locally, let's containerize it using Docker.

3. Run the app and database together with Docker Compose [#3-run-the-app-and-database-together-with-docker-compose]

We'll now containerize the application using Docker, ensuring it can run in any environment.

To do that create a `Dockerfile` in project root:

```bash
touch Dockerfile
```

For the next step, you'll need to choose between two options for the base image: `node:alpine` (lightweight) or `node:slim` (stable). Both options are fully supported by Prisma ORM, but may have to be configured differently.

3.1. Option 1: Use Linux Alpine (node:alpine) as a base image [#31-option-1-use-linux-alpine-nodealpine-as-a-base-image]

The `node:alpine` image is based on Alpine Linux, a lightweight Linux distribution that uses the `musl` C standard library. It's perfect if you want to keep your container small and efficient. Prisma supports Alpine on `amd64` out of the box, and supports it on `arm64` since `prisma@4.10.0`.

Add the following content to the `Dockerfile`:

```shell title="Dockerfile"
FROM node:lts-alpine3.17

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
```

<CalloutContainer type="info">
  <CalloutDescription>
    When running on Linux Alpine, Prisma downloads engines that are compiled for the `musl` C standard library. Please don't install `glibc` on Alpine (e.g., via the `libc6-compat` package), as that would prevent Prisma from running successfully.
  </CalloutDescription>
</CalloutContainer>

Related Docker images:

* `node:lts-alpine`
* `node:16-alpine`
* `node:14-alpine`

3.1. Option 2: Use Linux Debian (node:slim) as a base image [#31-option-2-use-linux-debian-nodeslim-as-a-base-image]

The `node:slim` image is based on Linux Debian, a stable and widely supported distribution that uses the `glibc` C standard library. It is mostly supported out of the box on `amd64` and `arm64`, making it a good choice if you're running into compatibility issues with Alpine or need a more production-ready environment. However, some older versions of this image may come without `libssl` installed, so it's sometimes necessary to install it manually.

Add the following content to the `Dockerfile`:

```shell title="Dockerfile"
FROM node:slim

RUN apt-get update -y \
&& apt-get install -y openssl

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
```

Related Docker images:

* `node:lts-slim`
* `node:bullseye-slim`
* `node:buster-slim`
* `node:stretch-slim`

3.2. Create and configure a Docker Compose file [#32-create-and-configure-a-docker-compose-file]

Now that the `Dockerfile` is ready, we'll use Docker Compose to manage both the app and the database together. This makes it easy to start, stop, and manage the entire setup.

Create a `docker-compose.yml` file in your project folder:

```bash
touch docker-compose.yml
```

Add the following configuration to the file:

```yml title="docker-compose.yml"
version: '3.7' // [!code ++]
 // [!code ++]
services: // [!code ++]
  postgres_db: // [!code ++]
    image: postgres:15 // [!code ++]
    hostname: postgres_db // [!code ++]
    container_name: postgres_db // [!code ++]
    restart: always // [!code ++]
    environment: // [!code ++]
      POSTGRES_DB: postgres // [!code ++]
      POSTGRES_USER: postgres // [!code ++]
      POSTGRES_PASSWORD: prisma // [!code ++]
    ports: // [!code ++]
      - '5432:5432' // [!code ++]
    networks: // [!code ++]
      - prisma-network // [!code ++]
    healthcheck: // [!code ++]
      test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"] // [!code ++]
      interval: 5s // [!code ++]
      timeout: 2s // [!code ++]
      retries: 20 // [!code ++]
 // [!code ++]
  server: // [!code ++]
    build: // [!code ++]
      context: . // [!code ++]
      dockerfile: Dockerfile // [!code ++]
    ports: // [!code ++]
      - '3000:3000' // [!code ++]
    stdin_open: true // [!code ++]
    tty: true  # Keeps the container running for debugging // [!code ++]
    depends_on: // [!code ++]
      postgres_db: // [!code ++]
        condition: service_healthy // [!code ++]
    env_file: // [!code ++]
      - .env.prod // [!code ++]
    networks: // [!code ++]
      - prisma-network // [!code ++]
networks: // [!code ++]
  prisma-network: // [!code ++]
    name: prisma-network // [!code ++]
```

3.3. Configure environment variable for the container [#33-configure-environment-variable-for-the-container]

Before running the app, we need to configure the environment variables. Create a `.env.prod` file:

```
touch .env.prod
```

Add the following database connection url to the `.env.prod` file:

```bash title=".env.prod"
DATABASE_URL="postgresql://postgres:prisma@postgres_db:5432/postgres?schema=public" # [!code highlight]
```

3.4. Build and run the application [#34-build-and-run-the-application]

With everything set up, it's time to build and run the app using Docker Compose. Run the following command:

```bash
docker compose -f docker-compose.yml up --build -d
```

Visit `http://localhost:3000` to see your app running with the message:

```bash
No users have been added yet.
```

3.5. Bonus: Add Prisma Studio for database management [#35-bonus-add-prisma-studio-for-database-management]

[Prisma Studio](/studio) offers a graphical user interface (GUI) that allows you to view and manage your database directly in the browser. It's a great tool for debugging and managing your data during development.

To add Prisma Studio to your Docker setup, update the `docker-compose.yml` file:

```yml title="docker.compose.yml"
version: '3.7'

services:
  postgres_db:
    image: postgres:15
    hostname: postgres_db
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: prisma
    ports:
      - '5432:5432'
    networks:
      - prisma-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"]
      interval: 5s
      timeout: 2s
      retries: 20

  server:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    stdin_open: true
    tty: true  # Keeps the container running for debugging
    depends_on:
      postgres_db:
        condition: service_healthy
    env_file:
      - .env.prod
    networks:
      - prisma-network
  prisma-studio: // [!code ++]
    image: node:lts-alpine3.17 // [!code ++]
    working_dir: /usr/src/app // [!code ++]
    volumes: // [!code ++]
      - .:/usr/src/app // [!code ++]
    command: npx prisma studio --port 5555 --browser none // [!code ++]
    ports: // [!code ++]
      - "5555:5555" // [!code ++]
    env_file: // [!code ++]
      - .env.prod // [!code ++]
    networks: // [!code ++]
      - prisma-network // [!code ++]
    depends_on: // [!code ++]
      postgres_db: // [!code ++]
        condition: service_healthy // [!code ++]
      server: // [!code ++]
        condition: service_started // [!code ++]
networks:
  prisma-network:
    name: prisma-network
```

This will start Prisma Studio at [`http://localhost:5555`](http://localhost:5555) alongside the main app at [`http://localhost:3000`](http://localhost:3000). You can use Prisma Studio to manage your database with a GUI.

Run the following command to start everything:

```bash
docker compose -f docker-compose.yml up --build -d
```

By following this guide, you've successfully containerized your Prisma app and database using Docker Compose.


# Turborepo (/docs/guides/deployment/turborepo)



Prisma is a powerful ORM for managing databases, and [Turborepo](https://turborepo.dev/docs) simplifies monorepo workflows. By combining these tools, you can create a scalable, modular architecture for your projects.

This guide will show you how to set up Prisma as a standalone package in a Turborepo monorepo, enabling efficient configuration, type sharing, and database management across multiple apps.

What you'll learn: [#what-youll-learn]

* How to set up Prisma in a Turborepo monorepo.
* Steps to generate and reuse PrismaClient across packages.
* Integrating the Prisma package into other applications in the monorepo.

Prerequisites [#prerequisites]

* [Node.js 20.19.0+](https://nodejs.org/)
* [TypeScript 5.4.0+](https://www.typescriptlang.org/)

1. Set up your project [#1-set-up-your-project]

To set up a Turborepo monorepo named `turborepo-prisma`, run the following command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx create-turbo@latest turborepo-prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx create-turbo@latest turborepo-prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx create-turbo@latest turborepo-prisma
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun create-turbo@latest turborepo-prisma
    ```
  </CodeBlockTab>
</CodeBlockTabs>

You'll be prompted to select your package manager, this guide will use `npm`:

<CalloutContainer type="info">
  <CalloutDescription>
    * *Which package manager do you want to use?* `npm`
  </CalloutDescription>
</CalloutContainer>

After the setup, navigate to the project root directory:

```bash
cd turborepo-prisma
```

2. Add a new database package to the monorepo [#2-add-a-new-database-package-to-the-monorepo]

2.1 Create the package and install Prisma [#21-create-the-package-and-install-prisma]

Create a `database` directory inside `packages` and navigate into it:

```bash
mkdir -p packages/database
cd packages/database
```

Then initialize it with a `package.json`:

```json title="packages/database/package.json"
{
  "name": "@repo/db",
  "version": "0.0.0"
}
```

Then install the required Prisma ORM dependencies:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma --save-dev
    npm install @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma --save-dev
    pnpm add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma --dev
    yarn add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma --dev
    bun add @prisma/client @prisma/adapter-pg pg dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    If you are using a different database provider (MySQL, SQL Server, SQLite), install the corresponding driver adapter package instead of `@prisma/adapter-pg`. For more information, see [Database drivers](/orm/core-concepts/supported-databases/database-drivers).
  </CalloutDescription>
</CalloutContainer>

2.2. Initialize Prisma and define models [#22-initialize-prisma-and-define-models]

Inside the `database` directory, initialize Prisma by running:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will create several files inside `packages/database`:

* A `prisma` directory with a `schema.prisma` file.
* A `prisma.config.ts` file for configuring Prisma.
* A `.env` file containing a local `DATABASE_URL` in the `packages/database` directory.

Create a Prisma Postgres database and replace the generated `DATABASE_URL` in your `.env` file with the `postgres://...` connection string from the CLI output:

```bash
npx create-db
```

In the `packages/database/prisma/schema.prisma` file, add the following models:

```prisma title="packages/database/prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User { // [!code ++]
  id    Int     @id @default(autoincrement()) // [!code ++]
  email String  @unique // [!code ++]
  name  String? // [!code ++]
  posts Post[] // [!code ++]
} // [!code ++]
 // [!code ++]
model Post { // [!code ++]
  id        Int     @id @default(autoincrement()) // [!code ++]
  title     String // [!code ++]
  content   String? // [!code ++]
  published Boolean @default(false) // [!code ++]
  authorId  Int // [!code ++]
  author    User    @relation(fields: [authorId], references: [id]) // [!code ++]
} // [!code ++]
```

The `prisma.config.ts` file created in the `packages/database` directory should look like this:

```typescript title="packages/database/prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

<CalloutContainer type="warning">
  <CalloutDescription>
    It is recommended to add `packages/database/generated` to your root `.gitignore` because generated Prisma Client code is a build artifact that can be recreated with `db:generate`.
  </CalloutDescription>
</CalloutContainer>

The importance of generating Prisma types in a custom directory [#the-importance-of-generating-prisma-types-in-a-custom-directory]

In the `schema.prisma` file, we specify a custom [`output`](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider) path where Prisma will generate its types. This ensures Prisma's types are resolved correctly across different package managers.

<CalloutContainer type="info">
  <CalloutDescription>
    In this guide, the types will be generated in the `database/generated/prisma` directory.
  </CalloutDescription>
</CalloutContainer>

2.3. Add scripts and run migrations [#23-add-scripts-and-run-migrations]

Let's add some scripts to the `package.json` inside `packages/database`:

```json title="packages/database/package.json"
{
  "name": "@repo/db",
  "version": "0.0.0",
  "type": "module", // [!code ++]
  "scripts": {
    // [!code ++]
    "db:generate": "prisma generate", // [!code ++]
    "db:migrate": "prisma migrate dev", // [!code ++]
    "db:deploy": "prisma migrate deploy" // [!code ++]
  }, // [!code ++]
  "devDependencies": {
    "prisma": "^7.0.0"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.0.0",
    "dotenv": "^16.0.0"
  }
}
```

Let's also add these scripts to `turbo.json` in the root and ensure that `DATABASE_URL` is added to the environment:

```json title="turbo.json"
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "globalEnv": ["DATABASE_URL"], // [!code ++]
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": { // [!code ++]
      "cache": false // [!code ++]
    }, // [!code ++]
    "db:migrate": { // [!code ++]
      "cache": false // [!code ++]
    }, // [!code ++]
    "db:deploy": { // [!code ++]
      "cache": false // [!code ++]
    } // [!code ++]
  }
}
```

Run your first migration and generate Prisma Client

Navigate to the project root and run the following command to create and apply your first migration:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx turbo run db:migrate -- --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx turbo run db:migrate -- --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx turbo run db:migrate -- --name init
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun turbo run db:migrate -- --name init
    ```
  </CodeBlockTab>
</CodeBlockTabs>

In Prisma 7, `migrate dev` no longer runs `prisma generate` automatically, so run generate explicitly:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx turbo run db:generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx turbo run db:generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx turbo run db:generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun turbo run db:generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Use the same `npx turbo run db:generate` command after future schema changes.

2.4. Export the Prisma client and types [#24-export-the-prisma-client-and-types]

Next, export the generated types and an instance of `PrismaClient` so it can be used in your applications.

In the `packages/database` directory, create a `src` folder and add a `client.ts` file. This file will define an instance of `PrismaClient`:

```ts title="packages/database/src/client.ts"
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Then create an `index.ts` file in the `src` folder to re-export the generated prisma types and the `PrismaClient` instance:

```ts title="packages/database/src/index.ts"
export { prisma } from "./client"; // exports instance of prisma
export * from "../generated/prisma/client"; // exports generated types from prisma
```

Follow the [Just-in-Time packaging pattern](https://turborepo.dev/docs/core-concepts/internal-packages#just-in-time-packages) and create an entrypoint to the package inside `packages/database/package.json`:

<CalloutContainer type="warning">
  <CalloutDescription>
    If you're not using a bundler, use the [Compiled Packages](https://turborepo.dev/docs/core-concepts/internal-packages#compiled-packages) strategy instead.
  </CalloutDescription>
</CalloutContainer>

```json title="packages/database/package.json"
{
  "name": "@repo/db",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy"
  },
  "devDependencies": {
    "prisma": "^7.0.0"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.0.0",
    "dotenv": "^16.0.0"
  },
  "exports": {
    // [!code ++]
    ".": "./src/index.ts" // [!code ++]
  } // [!code ++]
}
```

By completing these steps, you'll make the Prisma types and `PrismaClient` instance accessible throughout the monorepo.

3. Import the database package in the web app [#3-import-the-database-package-in-the-web-app]

The `turborepo-prisma` project should have an app called `web` at `apps/web`. Add the `database` dependency to `apps/web/package.json`:

<CodeBlockTabs defaultValue="npm">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```json
    {
      // ...
      "dependencies": {
        "@repo/db": "*" // [!code ++]
        // ...
      }
      // ...
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```json
    {
      // ...
      "dependencies": {
        "@repo/db": "workspace:*" // [!code ++]
        // ...
      }
      // ...
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```json
    {
      // ...
      "dependencies": {
        "@repo/db": "workspace:*" // [!code ++]
        // ...
      }
      // ...
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Run your package manager's install command from the project root to link the workspace dependency:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm install
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn install
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun install
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Let's import the instantiated `prisma` client from the `database` package in the `web` app.

In the `apps/web/app` directory, open the `page.tsx` file and add the following code:

```tsx title="apps/web/app/page.tsx"
import styles from "./page.module.css";
import { prisma } from "@repo/db";

export default async function Home() {
  const user = await prisma.user.findFirst();
  return <div className={styles.page}>{user?.name ?? "No user added yet"}</div>;
}
```

Then, create a `.env` file in the `web` directory and copy into it the contents of the `.env` file from the `/database` directory containing the `DATABASE_URL`:

```text title="apps/web/.env"
DATABASE_URL="Same database URL as used in the database directory"
```

<CalloutContainer type="info">
  <CalloutDescription>
    If you want to use a single `.env` file in the root directory across your apps and packages in a Turborepo setup, consider using a package like [`dotenvx`](https://dotenvx.com/docs/monorepos/turborepo).

    To implement this, update the `package.json` files for each package or app to ensure they load the required environment variables from the shared `.env` file. For detailed instructions, refer to the [`dotenvx` guide for Turborepo](https://dotenvx.com/docs/monorepos/turborepo).

    Keep in mind that Turborepo [recommends using separate `.env` files for each package](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables#use-env-files-in-packages) to promote modularity and avoid potential conflicts.
  </CalloutDescription>
</CalloutContainer>

4. Configure task dependencies in Turborepo [#4-configure-task-dependencies-in-turborepo]

The `db:generate` script is essential for `dev` and `build` tasks in a monorepo setup.

If a new developer runs `turbo dev` on an application without first running `db:generate`, they will encounter errors.

To prevent this, ensure that `db:generate` is always executed before running `dev` or `build`. Keep `db:deploy` uncached for staging/production migration runs in CI. Here's how to configure this in your `turbo.json` file:

```json title="turbo.json"
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "globalEnv": ["DATABASE_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"], // [!code highlight]
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "dependsOn": ["^db:generate"], // [!code ++]
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:deploy": {
      "cache": false
    }
  }
}
```

5. Run the project in development [#5-run-the-project-in-development]

Then from the project root run the project:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx turbo run dev --filter=web
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx turbo run dev --filter=web
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx turbo run dev --filter=web
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun turbo run dev --filter=web
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Navigate to the `http://localhost:3000` and you should see the message:

```
No user added yet
```

<CalloutContainer type="info">
  <CalloutDescription>
    You can add users to your database by creating a seed script or manually by using [Prisma Studio](/studio).

    To use Prisma Studio to add manually data via a GUI, navigate inside the `packages/database` directory and run `prisma studio` using your package manager:

    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx prisma studio
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx prisma studio
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx prisma studio
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bunx --bun prisma studio
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    This command starts a server with a GUI at [http://localhost:5555](http://localhost:5555), allowing you to view and modify your data.
  </CalloutDescription>
</CalloutContainer>

Congratulations, you're done setting up Prisma for Turborepo!

Next Steps [#next-steps]

* Expand your Prisma models to handle more complex data relationships.
* Implement additional CRUD operations to enhance your application's functionality.
* Check out [Prisma Postgres](https://www.prisma.io/postgres) to see how you can scale your application.

More Info [#more-info]

* [Turborepo Docs](https://turborepo.dev/docs)
* [Next.js Docs](https://nextjs.org/docs)
* [Prisma ORM Docs](/orm)



# pnpm workspaces (/docs/guides/deployment/pnpm-workspaces)



Prisma is a powerful ORM for managing your database, and when combined with [pnpm Workspaces](https://pnpm.io/workspaces), you can maintain a lean and modular monorepo architecture. In this guide, we’ll walk through setting up Prisma in its own package within a pnpm Workspaces monorepo, enabling maintainable type sharing and efficient database management across your apps.

What you'll learn: [#what-youll-learn]

* How to initialize a monorepo using pnpm Workspaces.
* Steps to integrate Prisma as a standalone package.
* How to generate and share the Prisma Client across packages.
* Integrating the Prisma package into an application within your workspace.

1. Prepare your project and configure pnpm workspaces [#1-prepare-your-project-and-configure-pnpm-workspaces]

Before integrating Prisma, you need to set up your project structure. Start by creating a new directory for your project (for example, `my-monorepo`) and initialize a Node.js project:

```bash
mkdir my-monorepo
cd my-monorepo
pnpm init
```

Next, create a `pnpm-workspace.yaml` file to define your workspace structure and pin the Prisma version:

```bash
touch pnpm-workspace.yaml
```

Add the following configuration to `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
packages:
  - "apps/*"
  - "packages/*"
catalogs:
  prisma:
    prisma: latest
```

<CalloutContainer type="info">
  <CalloutDescription>
    The `catalogs` help you pin a certain version of prisma across your repositories. You can learn more about them [here](https://pnpm.io/catalogs). *Explicitly* pin the latest version of [prisma](https://www.npmjs.com/package/prisma) in the `pnpm-workspace.yaml` file. At the time of writing, this is version `6.3.1`.
  </CalloutDescription>
</CalloutContainer>

Finally, create directories for your applications and shared packages:

```bash
mkdir apps
mkdir -p packages/database
```

2. Setup the shared database package [#2-setup-the-shared-database-package]

This section covers creating a standalone database package that uses Prisma. The package will house all database models and the generated Prisma Client, making it reusable across your monorepo.

2.1. Initialize the package and install dependencies [#21-initialize-the-package-and-install-dependencies]

Navigate to the `packages/database` directory and initialize a new package:

```bash
cd packages/database
pnpm init
```

Add Prisma as a development dependency in your `package.json` using the pinned `catalog`:

```json title="database/package.json"
"devDependencies": { // [!code ++]
  "prisma": "catalog:prisma" // [!code ++]
} // [!code ++]
```

Then install Prisma:

```bash
pnpm install
```

Then, add additional dependencies:

```bash
pnpm add typescript tsx @types/node @types/pg -D
pnpm add @prisma/adapter-pg pg
```

<CalloutContainer type="info">
  <CalloutDescription>
    If you are using a different database provider (MySQL, SQL Server, SQLite), install the corresponding driver adapter package instead of `@prisma/adapter-pg`. For more information, see [Database drivers](/orm/core-concepts/supported-databases/database-drivers).
  </CalloutDescription>
</CalloutContainer>

Initialize a `tsconfig.json` file for your `database` package:

```bash
pnpm tsc --init
```

2.2. Setup Prisma ORM in your database package [#22-setup-prisma-orm-in-your-database-package]

Initialize Prisma ORM with an instance of [Prisma Postgres](/postgres) in the `database` package by running the following command:

```bash
pnpm dlx prisma init
```

<CalloutContainer type="info">
  <CalloutDescription>
    `prisma init` creates the Prisma scaffolding and a local `DATABASE_URL`. In the next step, create a Prisma Postgres database and replace that value with a direct `postgres://...` connection string.
  </CalloutDescription>
</CalloutContainer>

This command:

* Creates a `prisma` directory containing a `schema.prisma` file for your database models.
* Creates a `.env` file with a local `DATABASE_URL`.

Create a Prisma Postgres database and replace the generated `DATABASE_URL` in your `.env` file with the `postgres://...` connection string from the CLI output:

```bash
npx create-db
```

Edit the `schema.prisma` file to define a `User` model in your database and specify a [custom `output` directory](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider) to generate the Prisma Client. This ensures that generated types are resolved correctly:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output = "../generated/client" // [!code ++]
}

datasource db {
  provider = "postgresql"
}

model User { // [!code ++]
  id    Int     @id @default(autoincrement()) // [!code ++]
  email String  @unique // [!code ++]
  name  String? // [!code ++]
} // [!code ++]
```

Now, create a `prisma.config.ts` file in the `database` package to configure Prisma:

```typescript title="database/prisma.config.ts"
import "dotenv/config"; // [!code ++]
import { defineConfig, env } from "prisma/config"; // [!code ++]
// [!code ++]
export default defineConfig({
  // [!code ++]
  schema: "prisma/schema.prisma", // [!code ++]
  migrations: {
    // [!code ++]
    path: "prisma/migrations", // [!code ++]
  }, // [!code ++]
  datasource: {
    // [!code ++]
    url: env("DATABASE_URL"), // [!code ++]
  }, // [!code ++]
}); // [!code ++]
```

<CalloutContainer type="info">
  <CalloutDescription>
    You'll need to install the `dotenv` package to load environment variables from the `.env` file:

    ```bash
    pnpm add dotenv
    ```
  </CalloutDescription>
</CalloutContainer>

Next, add helper scripts to your `package.json` to simplify Prisma commands:

```json title="database/package.json"
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1", // [!code --]
    "db:generate": "prisma generate", // [!code ++]
    "db:migrate": "prisma migrate dev", // [!code ++]
    "db:deploy": "prisma migrate deploy", // [!code ++]
    "db:studio": "prisma studio" // [!code ++]
  }
}
```

Use [Prisma Migrate](/orm/prisma-migrate) to migrate your database changes:

```bash
pnpm run db:migrate
```

When prompted by the CLI, enter a descriptive name for your migration.

Once the migration is successful, create a `client.ts` file to initialize Prisma Client with a driver adapter:

```ts title="database/client.ts"
import { PrismaClient } from "./generated/client"; // [!code ++]
import { PrismaPg } from "@prisma/adapter-pg"; // [!code ++]
// [!code ++]
const adapter = new PrismaPg({
  // [!code ++]
  connectionString: process.env.DATABASE_URL, // [!code ++]
}); // [!code ++]
// [!code ++]
// Use globalThis for broader environment compatibility // [!code ++]
const globalForPrisma = globalThis as typeof globalThis & {
  // [!code ++]
  prisma?: PrismaClient; // [!code ++]
}; // [!code ++]
// [!code ++]
// Named export with global memoization // [!code ++]
export const prisma: PrismaClient = // [!code ++]
  globalForPrisma.prisma ??
  new PrismaClient({
    // [!code ++]
    adapter, // [!code ++]
  }); // [!code ++]
// [!code ++]
if (process.env.NODE_ENV !== "production") {
  // [!code ++]
  globalForPrisma.prisma = prisma; // [!code ++]
} // [!code ++]
```

Then, create an `index.ts` file to re-export the instance of Prisma Client and all generated types:

```ts title="database/index.ts"
export { prisma } from "./client"; // [!code ++]
export * from "./generated/client"; // [!code ++]
```

At this point, your shared database package is fully configured and ready for use across your monorepo.

3. Set up and integrate your frontend application [#3-set-up-and-integrate-your-frontend-application]

Now that the database package is set up, create a frontend application (using Next.js) that uses the shared Prisma Client to interact with your database.

3.1. Bootstrap a Next.js application [#31-bootstrap-a-nextjs-application]

Navigate to the `apps` directory:

```bash
cd ../../apps
```

Create a new Next.js app named `web`:

```bash
pnpm create next-app@latest web --yes
```

<CalloutContainer type="info">
  <CalloutTitle>
    important
  </CalloutTitle>

  <CalloutDescription>
    The `--yes` flag uses default configurations to bootstrap the Next.js app (which in this guide uses the app router without a `src/` directory and `pnpm` as the installer).

    Additionally, the flag may automatically initialize a Git repository in the `web` folder. If that happens, please remove the `.git` directory by running `rm -r .git`.
  </CalloutDescription>
</CalloutContainer>

Then, navigate into the web directory:

```bash
cd web/
```

Copy the `.env` file from the database package to ensure the same environment variables are available:

```bash
cp ../../packages/database/.env .
```

Open the `package.json` file of your Next.js app and add the shared `database` package as a dependency:

```json title="web/package.json"
"dependencies": {
  "database": "workspace:*", // [!code ++]
  // additional dependencies
  // ...
}
```

Run the following command to install the `database` package:

```bash
pnpm install
```

3.2. Integrate the shared database package in your app code [#32-integrate-the-shared-database-package-in-your-app-code]

Modify your Next.js application code to use Prisma Client from the database package. Update `app/page.tsx` as follows:

```tsx title="app/page.tsx"
import { prisma } from "database"; // [!code ++]
// [!code ++]
export default async function Home() {
  // [!code ++]
  const user = await prisma.user.findFirst({
    // [!code ++]
    select: {
      // [!code ++]
      name: true, // [!code ++]
    }, // [!code ++]
  }); // [!code ++]
  // [!code ++]
  return (
    // [!code ++]
    <div>
      {" "}
      // [!code ++]
      {user?.name && <p>Hello from {user.name}</p>} // [!code ++]
      {!user?.name && <p>No user has been added to the database yet. </p>} // [!code ++]
    </div> // [!code ++]
  ); // [!code ++]
} // [!code ++]
```

This code demonstrates importing and using the shared Prisma Client to query your `User` model.

3.3. Add helper scripts and run your application [#33-add-helper-scripts-and-run-your-application]

Add the following scripts to the root `package.json` of your monorepo. They ensure that database migrations, type generation, and app builds run in the proper order:

```json
"scripts": {
  "build": "pnpm --filter database db:deploy && pnpm --filter database db:generate  && pnpm --filter web build", // [!code ++]
  "start": "pnpm --filter web start", // [!code ++]
  "dev": "pnpm --filter database db:generate && pnpm --filter web dev", // [!code ++]
  "studio": "pnpm --filter database db:studio" // [!code ++]
}
```

3.4. Run your application [#34-run-your-application]

Then head back to the root of the monorepo:

```bash
cd ../../
```

Start your development server by executing:

```bash
pnpm run dev
```

Open your browser at [`http://localhost:3000`](http://localhost:3000) to see your app in action.

3.5. (Optional) Add data to your database using Prisma Studio [#35-optional-add-data-to-your-database-using-prisma-studio]

There shouldn't be data in your database yet. You can execute `pnpm run studio` in your CLI to start a [Prisma Studio](/studio) in [`http://localhost:5555`](http://localhost:5555) to interact with your database and add data to it.

Next Steps [#next-steps]

You have now created a monorepo that uses Prisma ORM effectively, with a shared database package integrated into a Next.js application.

For further exploration and to enhance your setup, consider reading the [How to use Prisma ORM with Turborepo](/guides/deployment/turborepo) guide.
# Transactions and batch queries (/docs/orm/prisma-client/queries/transactions)



A database transaction is a sequence of read/write operations guaranteed to succeed or fail as a whole (ACID properties: Atomic, Consistent, Isolated, Durable).

Prisma Client supports transactions in several ways:

| Scenario            | Technique                                |
| :------------------ | :--------------------------------------- |
| Dependent writes    | Nested writes                            |
| Independent writes  | `$transaction([])` API, Batch operations |
| Read, modify, write | Interactive transactions                 |

Nested writes [#nested-writes]

A [nested write](/orm/prisma-client/queries/relation-queries#nested-writes) performs multiple operations on related records in a single transaction:

```ts
// Create user with posts in a single transaction
const user = await prisma.user.create({
  data: {
    email: "alice@prisma.io",
    posts: {
      create: [{ title: "Post 1" }, { title: "Post 2" }],
    },
  },
});
```

Batch operations [#batch-operations]

These bulk operations run as transactions:

* `createMany()` / `createManyAndReturn()`
* `updateMany()` / `updateManyAndReturn()`
* `deleteMany()`

The $transaction API [#the-transaction-api]

Sequential operations [#sequential-operations]

Pass an array of queries to execute sequentially in a transaction:

```ts
const [posts, totalPosts] = await prisma.$transaction([
  prisma.post.findMany({ where: { title: { contains: "prisma" } } }),
  prisma.post.count(),
]);
```

With options:

```ts
await prisma.$transaction(
  [prisma.resource.deleteMany({ where: { name: "name" } }), prisma.resource.createMany({ data })],
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
);
```

Interactive transactions [#interactive-transactions]

For complex logic between queries, use interactive transactions:

```ts
const result = await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    data: { balance: { decrement: 100 } },
    where: { email: "alice@prisma.io" },
  });

  if (sender.balance < 0) {
    throw new Error("Insufficient funds");
  }

  return await tx.account.update({
    data: { balance: { increment: 100 } },
    where: { email: "bob@prisma.io" },
  });
});
```

<CalloutContainer type="warning">
  <CalloutDescription>
    Keep transactions short. Long-running transactions hurt performance and can cause deadlocks.
  </CalloutDescription>
</CalloutContainer>

**Options:**

```ts
await prisma.$transaction(
  async (tx) => {
    /* ... */
  },
  {
    maxWait: 5000, // Max wait to acquire transaction (default: 2000ms)
    timeout: 10000, // Max transaction run time (default: 5000ms)
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
);
```

Transaction isolation level [#transaction-isolation-level]

<CalloutContainer type="info">
  <CalloutDescription>
    This feature is not available on MongoDB, because MongoDB does not support isolation levels.
  </CalloutDescription>
</CalloutContainer>

You can set the transaction [isolation level](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels) for transactions.

Set the isolation level [#set-the-isolation-level]

To set the transaction isolation level, use the `isolationLevel` option in the second parameter of the API.

For sequential operations:

```ts
await prisma.$transaction(
  [
    // Prisma Client operations running in a transaction...
  ],
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
  },
);
```

For an interactive transaction:

```jsx
await prisma.$transaction(
  async (prisma) => {
    // Code running in a transaction...
  },
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
  },
);
```

Supported isolation levels [#supported-isolation-levels]

Prisma Client supports the following isolation levels if they are available in the underlying database:

* `ReadUncommitted`
* `ReadCommitted`
* `RepeatableRead`
* `Snapshot`
* `Serializable`

The isolation levels available for each database connector are as follows:

| Database    | `ReadUncommitted` | `ReadCommitted` | `RepeatableRead` | `Snapshot` | `Serializable` |
| ----------- | ----------------- | --------------- | ---------------- | ---------- | -------------- |
| PostgreSQL  | ✔️                | ✔️              | ✔️               | No         | ✔️             |
| MySQL       | ✔️                | ✔️              | ✔️               | No         | ✔️             |
| SQL Server  | ✔️                | ✔️              | ✔️               | ✔️         | ✔️             |
| CockroachDB | No                | No              | No               | No         | ✔️             |
| SQLite      | No                | No              | No               | No         | ✔️             |

By default, Prisma Client sets the isolation level to the value currently configured in your database.

The isolation levels configured by default in each database are as follows:

| Database    | Default          |
| ----------- | ---------------- |
| PostgreSQL  | `ReadCommitted`  |
| MySQL       | `RepeatableRead` |
| SQL Server  | `ReadCommitted`  |
| CockroachDB | `Serializable`   |
| SQLite      | `Serializable`   |

Database-specific information on isolation levels [#database-specific-information-on-isolation-levels]

See the following resources:

* [Transaction isolation levels in PostgreSQL](https://www.postgresql.org/docs/9.3/runtime-config-client.html#GUC-DEFAULT-TRANSACTION-ISOLATION)
* [Transaction isolation levels in Microsoft SQL Server](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver15)
* [Transaction isolation levels in MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)

CockroachDB and SQLite only support the `Serializable` isolation level.

Transaction timing issues [#transaction-timing-issues]

<CalloutContainer type="info">
  <CalloutDescription>
    * The solution in this section does not apply to MongoDB, because MongoDB does not support [isolation levels](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels).
    * The timing issues discussed in this section do not apply to CockroachDB and SQLite, because these databases only support the highest `Serializable` isolation level.
  </CalloutDescription>
</CalloutContainer>

When two or more transactions run concurrently in certain [isolation levels](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels), timing issues can cause write conflicts or deadlocks, such as the violation of unique constraints. For example, consider the following sequence of events where Transaction A and Transaction B both attempt to execute a `deleteMany` and a `createMany` operation:

1. Transaction B: `createMany` operation creates a new set of rows.
2. Transaction B: The application commits transaction B.
3. Transaction A: `createMany` operation.
4. Transaction A: The application commits transaction A. The new rows conflict with the rows that transaction B added at step 2.

This conflict can occur at the isolation level `ReadCommitted`, which is the default isolation level in PostgreSQL and Microsoft SQL Server. To avoid this problem, you can set a higher isolation level (`RepeatableRead` or `Serializable`). You can set the isolation level on a transaction. This overrides your database isolation level for that transaction.

To avoid transaction write conflicts and deadlocks on a transaction:

1. On your transaction, use the `isolationLevel` parameter to `Prisma.TransactionIsolationLevel.Serializable`.

   This ensures that your application commits multiple concurrent or parallel transactions as if they were run serially. When a transaction fails due to a write conflict or deadlock, Prisma Client returns a [P2034 error](/orm/reference/error-reference#p2034).

2. In your application code, add a retry around your transaction to handle any P2034 errors, as shown in this example:

   ```ts
   import { Prisma, PrismaClient } from "../prisma/generated/client";

   const prisma = new PrismaClient();
   async function main() {
     const MAX_RETRIES = 5;
     let retries = 0;

     let result;
     while (retries < MAX_RETRIES) {
       try {
         result = await prisma.$transaction(
           [
             prisma.user.deleteMany({
               where: {
                 /** args */
               },
             }),
             prisma.post.createMany({
               data: {
                 /** args */
               },
             }),
           ],
           {
             isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
           },
         );
         break;
       } catch (error) {
         if (error.code === "P2034") {
           retries++;
           continue;
         }
         throw error;
       }
     }
   }
   ```

Using $transaction within Promise.all() [#using-transaction-within-promiseall]

If you wrap a `$transaction` inside a call to `Promise.all()`, the queries inside the transaction will be executed *serially* (i.e. one after another):

```ts
await prisma.$transaction(async (prisma) => {
  await Promise.all([
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
  ]);
});
```

This may be counterintuitive because `Promise.all()` usually *parallelizes* the calls passed into it.

The reason for this behaviour is that:

* One transaction means that all queries inside it have to be run on the same connection.
* A database connection can only ever execute one query at a time.
* As one query blocks the connection while it is doing its work, putting a transaction into `Promise.all` effectively means that queries should be ran one after another.

Dependent writes [#dependent-writes]

Writes are **dependent** when operations rely on the result of a preceding operation (e.g., using a database-generated ID).

Nested writes for dependent operations [#nested-writes-for-dependent-operations]

Use nested writes when you need to create related records atomically:

```ts
const team = await prisma.team.create({
  data: {
    name: "Aurora Adventures",
    members: {
      create: { email: "alice@prisma.io" },
    },
  },
});
```

If any operation fails, Prisma Client rolls back the entire transaction.

<CalloutContainer type="info">
  <CalloutDescription>
    The `$transaction([])` API cannot pass IDs between operations - use nested writes when you need the generated ID from one record to create another.
  </CalloutDescription>
</CalloutContainer>

Independent writes [#independent-writes]

Writes are **independent** if they don't rely on the result of a previous operation. Use these for:

* Updating the status of multiple orders to "Dispatched"
* Marking a list of emails as "Read"

Bulk operations [#bulk-operations]

```ts
const updateUsers = await prisma.user.updateMany({
  where: { email: { contains: "prisma.io" } },
  data: { role: "ADMIN" },
});
```

Using $transaction([]) for independent writes [#using-transaction-for-independent-writes]

```ts
const [deleteResult, createResult] = await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 7 } }),
  prisma.user.delete({ where: { id: 7 } }),
]);
```

Scenario: Pre-computed IDs and the $transaction([]) API [#scenario-pre-computed-ids-and-the-transaction-api]

If you pre-compute IDs (e.g., using UUIDs), you can use either nested writes or `$transaction([])` since both operations know the ID upfront.

When to use bulk operations [#when-to-use-bulk-operations]

Consider bulk operations as a solution if:

* ✔ You want to update a batch of the *same type* of record, like a batch of emails

Scenario: Marking emails as read [#scenario-marking-emails-as-read]

You are building a service like gmail.com, and your customer wants a **"Mark as read"** feature that allows users to mark all emails as read. Each update to the status of an email is an independent write because the emails do not depend on one another - for example, the "Happy Birthday! 🍰" email from your aunt is unrelated to the promotional email from IKEA.

In the following schema, a `User` can have many received emails (a one-to-many relationship):

```ts
model User {
  id    Int       @id @default(autoincrement())
  email           String @unique
  receivedEmails  Email[] // Many emails
}

model Email {
  id      Int     @id @default(autoincrement())
  user    User    @relation(fields: [userId], references: [id])
  userId  Int
  subject String
  body    String
  unread  Boolean
}
```

Based on this schema, you can use `updateMany` to mark all unread emails as read:

```ts
await prisma.email.updateMany({
  where: {
    user: {
      id: 10,
    },
    unread: true,
  },
  data: {
    unread: false,
  },
});
```

Can I use nested writes with bulk operations? [#can-i-use-nested-writes-with-bulk-operations]

No - neither `updateMany` nor `deleteMany` currently supports nested writes. For example, you cannot delete multiple teams and all of their members (a cascading delete):

```ts highlight=8;delete
await prisma.team.deleteMany({
  where: {
    id: {
      in: [2, 99, 2, 11],
    },
  },
  data: {
    members: {}, // Cannot access members here // [!code --]
  },
});
```

Can I use bulk operations with the $transaction([]) API? [#can-i-use-bulk-operations-with-the-transaction-api]

Yes — for example, you can include multiple `deleteMany` operations inside a `$transaction([])`.

$transaction([]) API [#transaction-api]

The `$transaction([])` API is generic solution to independent writes that allows you to run multiple operations as a single, atomic operation - if any operation fails, Prisma Client rolls back the entire transaction.

Its also worth noting that operations are executed according to the order they are placed in the transaction.

```ts
await prisma.$transaction([iRunFirst, iRunSecond, iRunThird]);
```

> **Note**: Using a query in a transaction does not influence the order of operations in the query itself.

As Prisma Client evolves, use cases for the `$transaction([])` API will increasingly be replaced by more specialized bulk operations (such as `createMany`) and nested writes.

When to use the $transaction([]) API [#when-to-use-the-transaction-api]

Consider the `$transaction([])` API if:

* ✔ You want to update a batch that includes different types of records, such as emails and users. The records do not need to be related in any way.
* ✔ You want to batch raw SQL queries (`$executeRaw`) - for example, for features that Prisma Client does not yet support.

Scenario: Privacy legislation [#scenario-privacy-legislation]

GDPR and other privacy legislation give users the right to request that an organization deletes all of their personal data. In the following example schema, a `User` can have many posts and private messages:

```prisma
model User {
  id              Int              @id @default(autoincrement())
  posts           Post[]
  privateMessages PrivateMessage[]
}

model Post {
  id      Int    @id @default(autoincrement())
  user    User   @relation(fields: [userId], references: [id])
  userId  Int
  title   String
  content String
}

model PrivateMessage {
  id      Int    @id @default(autoincrement())
  user    User   @relation(fields: [userId], references: [id])
  userId  Int
  message String
}
```

If a user invokes the right to be forgotten, we must delete three records: the user record, private messages, and posts. It is critical that *all* delete operations succeed together or not at all, which makes this a use case for a transaction. However, using a single bulk operation like `deleteMany` is not possible in this scenario because we need to delete across three models. Instead, we can use the `$transaction([])` API to run three operations together - two `deleteMany` and one `delete`:

```ts
const id = 9; // User to be deleted

const deletePosts = prisma.post.deleteMany({
  where: {
    userId: id,
  },
});

const deleteMessages = prisma.privateMessage.deleteMany({
  where: {
    userId: id,
  },
});

const deleteUser = prisma.user.delete({
  where: {
    id: id,
  },
});

await prisma.$transaction([deletePosts, deleteMessages, deleteUser]); // Operations succeed or fail together
```

Scenario: Pre-computed IDs and the $transaction([]) API [#scenario-pre-computed-ids-and-the-transaction-api-1]

Dependent writes are not supported by the `$transaction([])` API - if operation A relies on the ID generated by operation B, use [nested writes](#nested-writes). However, if you *pre-computed* IDs (for example, by generating GUIDs), your writes become independent. Consider the sign-up flow from the nested writes example:

```ts
await prisma.team.create({
  data: {
    name: "Aurora Adventures",
    members: {
      create: {
        email: "alice@prisma.io",
      },
    },
  },
});
```

Instead of auto-generating IDs, change the `id` fields of `Team` and `User` to a `String` (if you do not provide a value, a UUID is generated automatically). This example uses UUIDs:

```prisma highlight=2,9;delete|3,10;add
model Team {
  id      Int    @id @default(autoincrement()) // [!code --]
  id      String @id @default(uuid()) // [!code ++]
  name    String
  members User[]
}

model User {
  id    Int    @id @default(autoincrement()) // [!code --]
  id    String @id @default(uuid()) // [!code ++]
  email String @unique
  teams Team[]
}
```

Refactor the sign-up flow example to use the `$transaction([])` API instead of nested writes:

```ts
import { v4 } from "uuid";

const teamID = v4();
const userID = v4();

await prisma.$transaction([
  prisma.user.create({
    data: {
      id: userID,
      email: "alice@prisma.io",
      team: {
        id: teamID,
      },
    },
  }),
  prisma.team.create({
    data: {
      id: teamID,
      name: "Aurora Adventures",
    },
  }),
]);
```

Technically you can still use nested writes with pre-computed APIs if you prefer that syntax:

```ts
import { v4 } from "uuid";

const teamID = v4();
const userID = v4();

await prisma.team.create({
  data: {
    id: teamID,
    name: "Aurora Adventures",
    members: {
      create: {
        id: userID,
        email: "alice@prisma.io",
        team: {
          id: teamID,
        },
      },
    },
  },
});
```

There's no compelling reason to switch to manually generated IDs and the `$transaction([])` API if you are already using auto-generated IDs and nested writes.

Read, modify, write [#read-modify-write]

In some cases you may need to perform custom logic as part of an atomic operation - also known as the [read-modify-write pattern](https://en.wikipedia.org/wiki/Read%E2%80%93modify%E2%80%93write). The following is an example of the read-modify-write pattern:

* Read a value from the database
* Run some logic to manipulate that value (for example, contacting an external API)
* Write the value back to the database

All operations should **succeed or fail together** without making unwanted changes to the database, but you do not necessarily need to use an actual database transaction. This section of the guide describes two ways to work with Prisma Client and the read-modify-write pattern:

* Designing idempotent APIs
* Optimistic concurrency control

Idempotent APIs [#idempotent-apis]

Idempotency is the ability to run the same logic with the same parameters multiple times with the same result: the **effect on the database** is the same whether you run the logic once or one thousand times. For example:

* **NOT IDEMPOTENT**: Upsert (update-or-insert) a user in the database with email address `"letoya@prisma.io"`. The `User` table **does not** enforce unique email addresses. The effect on the database is different if you run the logic once (one user created) or ten times (ten users created).
* **IDEMPOTENT**: Upsert (update-or-insert) a user in the database with the email address `"letoya@prisma.io"`. The `User` table **does** enforce unique email addresses. The effect on the database is the same if you run the logic once (one user created) or ten times (existing user is updated with the same input).

Idempotency is something you can and should actively design into your application wherever possible.

When to design an idempotent API [#when-to-design-an-idempotent-api]

* ✔ You need to be able to retry the same logic without creating unwanted side-effects in the databases

Scenario: Upgrading a Slack team [#scenario-upgrading-a-slack-team]

You are creating an upgrade flow for Slack that allows teams to unlock paid features. Teams can choose between different plans and pay per user, per month. You use Stripe as your payment gateway, and extend your `Team` model to store a `stripeCustomerId`. Subscriptions are managed in Stripe.

```prisma highlight=5;normal
model Team {
  id               Int     @id @default(autoincrement())
  name             String
  User             User[]
  stripeCustomerId String? // [!code highlight]
}
```

The upgrade flow looks like this:

1. Count the number of users
2. Create a subscription in Stripe that includes the number of users
3. Associate the team with the Stripe customer ID to unlock paid features

```ts
const teamId = 9;
const planId = "plan_id";

// Count team members
const numTeammates = await prisma.user.count({
  where: {
    teams: {
      some: {
        id: teamId,
      },
    },
  },
});

// Create a customer in Stripe for plan-9454549
const customer = await stripe.customers.create({
  externalId: teamId,
  plan: planId,
  quantity: numTeammates,
});

// Update the team with the customer id to indicate that they are a customer
// and support querying this customer in Stripe from our application code.
await prisma.team.update({
  data: {
    customerId: customer.id,
  },
  where: {
    id: teamId,
  },
});
```

This example has a problem: you can only run the logic *once*. Consider the following scenario:

1. Stripe creates a new customer and subscription, and returns a customer ID
2. Updating the team **fails** - the team is not marked as a customer in the Slack database
3. The customer is charged by Stripe, but paid features are not unlocked in Slack because the team lacks a valid `customerId`
4. Running the same code again either:
   * Results in an error because the team (defined by `externalId`) already exists - Stripe never returns a customer ID
   * If `externalId` is not subject to a unique constraint, Stripe creates yet another subscription (**not idempotent**)

You cannot re-run this code in case of an error and you cannot change to another plan without being charged twice.

The following refactor (highlighted) introduces a mechanism that checks if a subscription already exists, and either creates the description or updates the existing subscription (which will remain unchanged if the input is identical):

```ts highlight=12-27;normal
// Calculate the number of users times the cost per user
const numTeammates = await prisma.user.count({
  where: {
    teams: {
      some: {
        id: teamId,
      },
    },
  },
});

// Find customer in Stripe // [!code highlight]
let customer = await stripe.customers.get({ externalId: teamID }); // [!code highlight]

if (customer) {
  // [!code highlight]
  // If team already exists, update // [!code highlight]
  customer = await stripe.customers.update({
    // [!code highlight]
    externalId: teamId, // [!code highlight]
    plan: "plan_id", // [!code highlight]
    quantity: numTeammates, // [!code highlight]
  });
} else {
  customer = await stripe.customers.create({
    // If team does not exist, create customer
    externalId: teamId,
    plan: "plan_id",
    quantity: numTeammates,
  });
}

// Update the team with the customer id to indicate that they are a customer
// and support querying this customer in Stripe from our application code.
await prisma.team.update({
  data: {
    customerId: customer.id,
  },
  where: {
    id: teamId,
  },
});
```

You can now retry the same logic multiple times with the same input without adverse effect. To further enhance this example, you can introduce a mechanism whereby the subscription is cancelled or temporarily deactivated if the update does not succeed after a set number of attempts.

Optimistic concurrency control [#optimistic-concurrency-control]

Optimistic concurrency control (OCC) is a model for handling concurrent operations on a single entity that does not rely on 🔒 locking. Instead, we **optimistically** assume that a record will remain unchanged in between reading and writing, and use a concurrency token (a timestamp or version field) to detect changes to a record.

If a ❌ conflict occurs (someone else has changed the record since you read it), you cancel the transaction. Depending on your scenario, you can then:

* Re-try the transaction (book another cinema seat)
* Throw an error (alert the user that they are about to overwrite changes made by someone else)

This section describes how to build your own optimistic concurrency control. See also: Plans for [application-level optimistic concurrency control on GitHub](https://github.com/prisma/prisma/issues/4988)

When to use optimistic concurrency control [#when-to-use-optimistic-concurrency-control]

* ✔ You anticipate a high number of concurrent requests (multiple people booking cinema seats)
* ✔ You anticipate that conflicts between those concurrent requests will be rare

Avoiding locks in an application with a high number of concurrent requests makes the application more resilient to load and more scalable overall. Although locking is not inherently bad, locking in a high concurrency environment can lead to unintended consequences - even if you are locking individual rows, and only for a short amount of time. For more information, see:

* [Why ROWLOCK Hints Can Make Queries Slower and Blocking Worse in SQL Server](https://kendralittle.com/2016/02/04/why-rowlock-hints-can-make-queries-slower-and-blocking-worse-in-sql-server/)

Scenario: Reserving a seat at the cinema [#scenario-reserving-a-seat-at-the-cinema]

You are creating a booking system for a cinema. Each movie has a set number of seats. The following schema models movies and seats:

```ts
model Seat {
  id        Int   @id @default(autoincrement())
  userId    Int?
  claimedBy User? @relation(fields: [userId], references: [id])
  movieId   Int
  movie     Movie @relation(fields: [movieId], references: [id])
}

model Movie {
  id    Int    @id     @default(autoincrement())
  name  String @unique
  seats Seat[]
}
```

The following sample code finds the first available seat and assigns that seat to a user:

```ts
const movieName = "Hidden Figures";

// Find first available seat
const availableSeat = await prisma.seat.findFirst({
  where: {
    movie: {
      name: movieName,
    },
    claimedBy: null,
  },
});

// Throw an error if no seats are available
if (!availableSeat) {
  throw new Error(`Oh no! ${movieName} is all booked.`);
}

// Claim the seat
await prisma.seat.update({
  data: {
    claimedBy: userId,
  },
  where: {
    id: availableSeat.id,
  },
});
```

However, this code suffers from the "double-booking problem" - it is possible for two people to book the same seats:

1. Seat 3A returned to Sorcha (`findFirst`)
2. Seat 3A returned to Ellen (`findFirst`)
3. Seat 3A claimed by Sorcha (`update`)
4. Seat 3A claimed by Ellen (`update` - overwrites Sorcha's claim)

Even though Sorcha has successfully booked the seat, the system ultimately stores Ellen's claim. To solve this problem with optimistic concurrency control, add a `version` field to the seat:

```prisma highlight=7;normal
model Seat {
  id        Int   @id @default(autoincrement())
  userId    Int?
  claimedBy User? @relation(fields: [userId], references: [id])
  movieId   Int
  movie     Movie @relation(fields: [movieId], references: [id])
  version   Int // [!code highlight]
}
```

Next, adjust the code to check the `version` field before updating:

```ts highlight=19-38;normal
const userEmail = "alice@prisma.io";
const movieName = "Hidden Figures";

// Find the first available seat
// availableSeat.version might be 0
const availableSeat = await client.seat.findFirst({
  where: {
    Movie: {
      name: movieName,
    },
    claimedBy: null,
  },
});

if (!availableSeat) {
  throw new Error(`Oh no! ${movieName} is all booked.`);
}

// Only mark the seat as claimed if the availableSeat.version // [!code highlight]
// matches the version we're updating. Additionally, increment the // [!code highlight]
// version when we perform this update so all other clients trying // [!code highlight]
// to book this same seat will have an outdated version. // [!code highlight]
const seats = await client.seat.updateMany({
  // [!code highlight]
  data: {
    // [!code highlight]
    claimedBy: userEmail, // [!code highlight]
    version: {
      // [!code highlight]
      increment: 1, // [!code highlight]
    }, // [!code highlight]
  }, // [!code highlight]
  where: {
    // [!code highlight]
    id: availableSeat.id, // [!code highlight]
    version: availableSeat.version, // This version field is the key; only claim seat if in-memory version matches database version, indicating that the field has not been updated // [!code highlight]
  }, // [!code highlight]
}); // [!code highlight]

if (seats.count === 0) {
  // [!code highlight]
  throw new Error(`That seat is already booked! Please try again.`); // [!code highlight]
} // [!code highlight]
```

It is now impossible for two people to book the same seat:

1. Seat 3A returned to Sorcha (`version` is 0)
2. Seat 3A returned to Ellen (`version` is 0)
3. Seat 3A claimed by Sorcha (`version` is incremented to 1, booking succeeds)
4. Seat 3A claimed by Ellen (in-memory `version` (0) does not match database `version` (1) - booking does not succeed)

Interactive transactions [#interactive-transactions-1]

If you have an existing application, it can be a significant undertaking to refactor your application to use optimistic concurrency control. Interactive Transactions offers a useful escape hatch for cases like this.

To create an interactive transaction, pass an async function into [$transaction](#transaction-api).

The first argument passed into this async function is an instance of the Prisma Client. Below, we will call this instance `tx`. Any Prisma Client call invoked on this `tx` instance is encapsulated into the transaction.

In the example below, Alice and Bob each have $100 in their account. If they try to send more money than they have, the transfer is rejected.

The expected outcome would be for Alice to make 1 transfer for $100 and the other transfer would be rejected. This would result in Alice having $0 and Bob having $200.

```ts
import { PrismaClient } from "../prisma/generated/client";
const prisma = new PrismaClient();

async function transfer(from: string, to: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Decrement amount from the sender.
    const sender = await tx.account.update({
      data: {
        balance: {
          decrement: amount,
        },
      },
      where: {
        email: from,
      },
    });

    // 2. Verify that the sender's balance didn't go below zero.
    if (sender.balance < 0) {
      throw new Error(`${from} doesn't have enough to send ${amount}`);
    }

    // 3. Increment the recipient's balance by amount
    const recipient = tx.account.update({
      data: {
        balance: {
          increment: amount,
        },
      },
      where: {
        email: to,
      },
    });

    return recipient;
  });
}

async function main() {
  // This transfer is successful
  await transfer("alice@prisma.io", "bob@prisma.io", 100);
  // This transfer fails because Alice doesn't have enough funds in her account
  await transfer("alice@prisma.io", "bob@prisma.io", 100);
}

main();
```

In the example above, both `update` queries run within a database transaction. When the application reaches the end of the function, the transaction is **committed** to the database.

If the application encounters an error along the way, the async function will throw an exception and automatically **rollback** the transaction.

You can learn more about interactive transactions in this [section](#interactive-transactions).

<CalloutContainer type="warning">
  <CalloutDescription>
    **Use interactive transactions with caution**. Keeping transactions
    open for a long time hurts database performance and can even cause deadlocks.
    Try to avoid performing network requests and executing slow queries inside your
    transaction functions. We recommend you get in and out as quick as possible!
  </CalloutDescription>
</CalloutContainer>

Conclusion [#conclusion]

Prisma Client supports multiple ways of handling transactions, either directly through the API or by supporting your ability to introduce optimistic concurrency control and idempotency into your application. If you feel like you have use cases in your application that are not covered by any of the suggested options, please open a [GitHub issue](https://github.com/prisma/prisma/issues/new/choose) to start a discussion.



# Overview of Prisma Schema (/docs/orm/prisma-schema/overview)



The Prisma Schema (or *schema* for short) is the main method of configuration for your Prisma ORM setup. It consists of the following parts:

* [**Data sources**](/orm/prisma-schema/overview/data-sources): Specify the details of the data sources Prisma ORM should connect to (e.g. a PostgreSQL database)
* [**Generators**](/orm/prisma-schema/overview/generators): Specifies what clients should be generated based on the data model (e.g. Prisma Client)
* [**Data model definition**](/orm/prisma-schema/data-model/models): Specifies your application [models](/orm/prisma-schema/data-model/models#defining-models) (the shape of the data per data source) and their [relations](/orm/prisma-schema/data-model/relations)

It is typically a single file called `schema.prisma` (or multiple files with `.prisma` file extension) that is stored in a defined but customizable [location](/orm/prisma-schema/overview/location). You can also [organize your Prisma schema in multiple files](/orm/prisma-schema/overview/location#multi-file-prisma-schema) if you prefer that.

See the [Prisma schema API reference](/orm/reference/prisma-schema-reference) <span class="api" /> for detailed information about each section of the schema.

Whenever a `prisma` command is invoked, the CLI typically reads some information from the schema, e.g.:

* `prisma generate`: Reads *all* above mentioned information from the Prisma schema to generate the correct data source client code (e.g. Prisma Client).
* `prisma migrate dev`: Reads the data sources and data model definition to create a new migration.

You can also [use environment variables](#accessing-environment-variables-from-the-schema) inside the schema to provide configuration options when a CLI command is invoked.

Example [#example]

The following is an example of a Prisma Schema that specifies:

* A data source (PostgreSQL or MongoDB)
* A generator (Prisma Client)
* A data model definition with two models (with one relation) and one `enum`
* Several [native data type attributes](/orm/prisma-schema/data-model/models#native-types-mapping) (`@db.VarChar(255)`, `@db.ObjectId`)

<CodeBlockTabs defaultValue="Relational Databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational Databases">
      Relational Databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational Databases">
    ```prisma
    datasource db {
      provider = "postgresql"
    }

    generator client {
      provider = "prisma-client"
      output   = "./generated"
    }

    model User {
      id        Int      @id @default(autoincrement())
      createdAt DateTime @default(now())
      email     String   @unique
      name      String?
      role      Role     @default(USER)
      posts     Post[]
    }

    model Post {
      id        Int      @id @default(autoincrement())
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      published Boolean  @default(false)
      title     String   @db.VarChar(255)
      author    User     @relation(fields: [authorId], references: [id])
      authorId  Int
    }

    enum Role {
      USER
      ADMIN
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    datasource db {
      provider = "mongodb"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id        String   @id @default(auto()) @map("_id") @db.ObjectId
      createdAt DateTime @default(now())
      email     String   @unique
      name      String?
      role      Role     @default(USER)
      posts     Post[]
    }

    model Post {
      id        String   @id @default(auto()) @map("_id") @db.ObjectId
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      published Boolean  @default(false)
      title     String
      author    User     @relation(fields: [authorId], references: [id])
      authorId  String   @db.ObjectId
    }

    enum Role {
      USER
      ADMIN
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Syntax [#syntax]

Prisma Schema files are written in Prisma Schema Language (PSL). See the [data sources](/orm/prisma-schema/overview/data-sources), [generators](/orm/prisma-schema/overview/generators), [data model definition](/orm/prisma-schema/data-model/models) and of course [Prisma Schema API reference](/orm/reference/prisma-schema-reference) pages for details and examples.

VS Code [#vs-code]

Syntax highlighting for PSL is available via a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) (which also lets you auto-format the contents of your Prisma schema and indicates syntax errors with red squiggly lines). Learn more about [setting up Prisma ORM in your editor](/orm/more/dev-environment/editor-setup).

GitHub [#github]

PSL code snippets on GitHub can be rendered with syntax highlighting as well by using the `.prisma` file extension or annotating fenced code blocks in Markdown with `prisma`:

````mdx
```prisma
model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
}
```
````

Accessing environment variables from the schema [#accessing-environment-variables-from-the-schema]

You can use environment variables to provide configuration options when a CLI command is invoked, or a Prisma Client query is run.

Hardcoding URLs directly in your schema is possible but is discouraged because it poses a security risk. Using environment variables in the schema allows you to **keep secrets out of the schema** which in turn **improves the portability of the schema** by allowing you to use it in different environments.

Environment variables can be accessed using the `env()` function:

```prisma
datasource db {
  provider = "postgresql"
}
```

You can use the `env()` function in the following places:

* A datasource url
* Generator binary targets

See [Environment variables](/orm/more/dev-environment/environment-variables) for more information about how to use an `.env` file during development.

Comments [#comments]

There are three types of comments that are supported in Prisma Schema Language:

* `// comment`: This comment is for the reader's clarity and is not present in the abstract syntax tree (AST) of the schema.
* `/// comment`: These comments will show up in the abstract syntax tree (AST) of the schema as descriptions to AST nodes. Tools can then use these comments to provide additional information. All comments are attached to the next available node - [free-floating comments](https://github.com/prisma/prisma/issues/3544) are not supported and are not included in the AST.
* `/* block comment */`: These comments will show up in the abstract syntax tree, similarly to `///` comments.

Here are some different examples:

```prisma
/// This comment will get attached to the `User` node in the AST
model User {
  /// This comment will get attached to the `id` node in the AST
  id     Int   @default(autoincrement())
  // This comment is just for you
  weight Float /// This comment gets attached to the `weight` node
}

// This comment is just for you. It will not
// show up in the AST.

/// This comment will get attached to the
/// Customer node.
model Customer {
  /**
   * ...and so will this comment
   */
}
```

Auto formatting [#auto-formatting]

Prisma ORM supports formatting `.prisma` files automatically. There are two ways to format `.prisma` files:

* Run the [`prisma format`](/orm/reference/prisma-cli-reference#format) <span class="api" /> command.
* Install the [Prisma VS Code extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) and invoke the [VS Code format action](https://code.visualstudio.com/docs/editor/codebasics#_formatting) - manually or on save.

There are no configuration options - [formatting rules](#formatting-rules) are fixed (similar to Golang's `gofmt` but unlike Javascript's `prettier`):

Formatting rules [#formatting-rules]

Configuration blocks are aligned by their = sign [#configuration-blocks-are-aligned-by-theirsign]

```
block _ {
  key      = "value"
  key2     = 1
  long_key = true
}
```

Field definitions are aligned into columns separated by 2 or more spaces [#field-definitions-are-aligned-into-columns-separated-by-2-or-more-spaces]

```
block _ {
  id          String       @id
  first_name  LongNumeric  @default
}
```

Empty lines resets block alignment and formatting rules [#empty-lines-resets-block-alignment-and-formatting-rules]

```
block _ {
  key   = "value"
  key2  = 1
  key10 = true

  long_key   = true
  long_key_2 = true
}
```

```
block _ {
  id  String  @id
              @default

  first_name  LongNumeric  @default
}
```

Multiline field attributes are properly aligned with the rest of the field attributes [#multiline-field-attributes-are-properly-aligned-with-the-rest-of-the-field-attributes]

```
block _ {
  id          String       @id
                           @default
  first_name  LongNumeric  @default
}
```

Block attributes are sorted to the end of the block [#block-attributes-are-sorted-to-the-end-of-the-block]

```
block _ {
  key   = "value"

  @@attribute
}
```


# Data sources (/docs/orm/prisma-schema/overview/data-sources)



A data source determines how Prisma ORM connects to your database, and is represented by the [`datasource`](/orm/reference/prisma-schema-reference#datasource) block in the Prisma schema. Connection details (such as the database URL) are configured in [Prisma Config](/orm/reference/prisma-config-reference). The following data source uses the `postgresql` provider:

```prisma
datasource db {
  provider = "postgresql"
}
```

A Prisma schema can only have *one* data source. However, you can:

* [Override the database connection when creating your `PrismaClient`](/orm/reference/prisma-client-reference)
* [Specify a different **database** for Prisma Migrate's shadow database if you are working with cloud-hosted development databases](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database#cloud-hosted-shadow-databases-must-be-created-manually)

Securing database connections [#securing-database-connections]

Some data source `provider`s allow you to configure your connection with SSL/TLS **by specifying certificate locations in your connection configuration**.

* [Configuring an SSL connection with PostgreSQL](/orm/core-concepts/supported-databases/postgresql#common-patterns)
* [Configuring an SSL connection with MySQL](/orm/core-concepts/supported-databases/mysql#common-patterns)
* [Configure a TLS connection with Microsoft SQL Server](/orm/core-concepts/supported-databases/sql-server#connection-details)

See the database-specific documentation above for examples of SSL/TLS connection configuration in Prisma Config.


# Generators (/docs/orm/prisma-schema/overview/generators)



A Prisma schema can have one or more generators, represented by the [`generator`](/orm/reference/prisma-schema-reference#generator) block:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

A generator determines which assets are created when you run the `prisma generate` command.

The default generator for Prisma Client is `prisma-client`, which outputs plain TypeScript code and *requires* a custom `output` path (read more about it [here](https://www.prisma.io/blog/why-prisma-orm-generates-code-into-node-modules-and-why-it-ll-change)).

Alternatively, you can configure any npm package that complies with our generator specification.

prisma-client [#prisma-client]

The new `prisma-client` generator offers greater control and flexibility when using Prisma ORM across different JavaScript environments (such as ESM, Bun, Deno, ...).

It generates Prisma Client into a custom directory in your application's codebase that's specified via the `output` field on the `generator` block. This gives you full visibility and control over the generated code. It also [splits](#importing-types) the generated Prisma Client library into multiple files.

This generator ensures you can bundle your application code exactly the way you want, without relying on hidden or automatic behaviors.

Here are the main differences compared to `prisma-client-js`:

* Requires an `output` path; no "magic" generation into `node_modules` any more
* Doesn't load `.env` at runtime; use `dotenv` or set environment variables manually instead
* Supports ESM and CommonJS via the `moduleFormat` field
* More flexible thanks to additional [fields](#field-reference)
* Outputs plain TypeScript that's bundled just like the rest of your application code

The `prisma-client` generator is the default generator.

Getting started [#getting-started]

Follow these steps to use the new `prisma-client` generator in your project.

1. Configure the prisma-client generator in schema.prisma [#1-configure-the-prisma-client-generator-in-schemaprisma]

Update your [`generator`](/orm/prisma-schema/overview/generators) block:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"            // Required // [!code ++]
  output   = "../src/generated/prisma"  // Required // [!code ++]
}
```

The **`output` option is required** and tells Prisma ORM where to put the generated Prisma Client code. You can choose any location suitable for your project structure. For instance, if you have the following layout:

```txt
.
├── package.json
├── prisma
│   └── schema.prisma
├── src
│   └── index.ts
└── tsconfig.json
```

Then `../src/generated/prisma` places the generated code in `src/generated/prisma` relative to `schema.prisma`.

2. Generate Prisma Client [#2-generate-prisma-client]

Generate Prisma Client by running:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This generates the code for Prisma Client (including the query engine binary) into the specified `output` folder.

3. Use Prisma Client in your application [#3-use-prisma-client-in-your-application]

Importing Prisma Client [#importing-prisma-client]

After generating the Prisma Client, import it from the path you specified:

```ts title="src/index.ts"
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // or the adapter for your database
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

Prisma Client is now ready to use in your project.

Importing generated model types [#importing-generated-model-types]

If you're importing types generated for your models, you can do so as follows:

```ts title="src/index.ts"
import { UserModel, PostModel } from "./generated/prisma/models";
```

Importing generated enum types [#importing-generated-enum-types]

If you're importing types generated for your enums, you can do so as follows:

```ts title="src/index.ts"
import { Role, User } from "./generated/prisma/enums";
```

Importing in browser environments [#importing-in-browser-environments]

If you need to access generated types in your frontend code, you can import them as follows:

```ts title="src/index.ts"
import { Role } from "./generated/prisma/browser";
```

Note that `./generated/prisma/browser` does not expose a `PrismaClient`.

Field reference [#field-reference]

Use the following options in the `generator client { ... }` block. Only `output` is required. The other fields have defaults or are inferred from your environment and `tsconfig.json`.

```prisma title="schema.prisma"
generator client {
  // Required
  provider = "prisma-client"
  output   = "../src/generated/prisma"

  // Optional
  engineType             = "client"
  runtime                = "nodejs"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "ts"
}
```

Below are the options for the `prisma-client` generator:

| **Option**               | **Default**               | **Description**                                                                                                                                                        |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `output` (**required**)  |                           | Directory where Prisma Client is generated, e.g. `../src/generated/prisma`.                                                                                            |
| `runtime`                | `nodejs`                  | Target runtime environment. <br />Supported values: <br />`nodejs`, `deno`, `bun`, `workerd` (alias `cloudflare`), `vercel-edge` (alias `edge-light`), `react-native`. |
| `moduleFormat`           | Inferred from environment | Module format (`esm` or `cjs`). Determines whether `import.meta.url` or `__dirname` is used.                                                                           |
| `generatedFileExtension` | `ts`                      | File extension for generated TypeScript files (`ts`, `mts`, `cts`).                                                                                                    |
| `importFileExtension`    | Inferred from environment | File extension used in **import statements**. Can be `ts`, `mts`, `cts`, `js`, `mjs`, `cjs`, or empty (for bare imports).                                              |

<CalloutContainer type="info">
  <CalloutDescription>
    `nodejs`, `deno`, and `bun` all map to the same internal codepath but are preserved as separate user-facing values for clarity.
  </CalloutDescription>
</CalloutContainer>

Importing types [#importing-types]

The new `prisma-client` generator creates individual `.ts` files which allow for a more fine granular import of types. This can improve compile and typecheck performance and be useful for tree-shaking, too.
You can still use the top level barrel files that export all types through a single import.

The overall structure of the generated output looks like this:

```
generated/
└── prisma
    ├── browser.ts
    ├── client.ts
    ├── commonInputTypes.ts
    ├── enums.ts
    ├── internal
    │   ├── ...
    ├── models
    │   ├── Post.ts
    │   └── User.ts
    └── models.ts
```

client.ts [#clientts]

For use in your server code.

* Provides access to the `PrismaClient` instance and all model and utility types.
* Provides best compatibility with the `prisma-client-js` generated output.
* Contains transitive dependencies on server only-packages, so cannot be used in browser contexts.

Example:

```ts title="src/index.ts"
import { Prisma, type Post, PrismaClient } from "./generated/prisma/client";
```

browser.ts [#browserts]

For using types in your frontend (i.e. code that runs in the browser).

* Contains no transitive dependencies on Node.js or other server-only packages.
* Contains no real `PrismaClient` constructor.
* Contains all model and enum types and values.
* Provides access to various utilities like `Prisma.JsonNull` and `Prisma.Decimal`.

Example:

```ts title="src/index.ts"
import { Prisma, type Post } from "./generated/prisma/browser";
```

enums.ts [#enumsts]

Isolated access to user defined enum types and values.

* Contains no transitive dependencies and is very slim.
* Can be used on backend and frontend.
* Prefer this for optimal tree shaking and typecheck performance when accessing enums.

Example:

```ts title="src/index.ts"
import { MyEnum } from "./generated/prisma/enums";
```

models.ts [#modelsts]

Isolated access to all model types.

* Can be used on backend and frontend.
* Contains all models including their derived utility types like `<ModelName>WhereInput` or `<ModelName>UpdateInput>`.

<CalloutContainer type="info">
  <CalloutDescription>
    Plain model types are exposed here as `<ModelName>Model` (e.g. `PostModel`). This is in contrast to the exposed name in `client.ts` and `browser.ts` which is simply `<ModelName>` (e.g. `Post`).

    This is necessary due to internal constraints to avoid potential naming conflicts with internal types.
  </CalloutDescription>
</CalloutContainer>

Example:

```ts title="src/index.ts"
import type {
  UserModel,
  PostModel,
  PostWhereInput,
  UserUpdateInput,
} from "./generated/prisma/models";
```

models/<ModelName>.ts [#modelsmodelnamets]

Isolated access to the types for an individual model.

* Can be used on backend and frontend.
* Contains the models including its derived utility types like `<ModelName>WhereInput` or `<ModelName>UpdateInput>`.

<CalloutContainer type="info">
  <CalloutDescription>
    The plain model type is exposed here as `<ModelName>Model` (e.g. `PostModel`).
  </CalloutDescription>
</CalloutContainer>

Example:

```ts title="src/index.ts"
import type { UserModel, UserWhereInput, UserUpdateInput } from "./generated/prisma/models/User";
```

commonInputTypes.ts [#commoninputtypests]

Provides shared utility types that you should rarely directly need.

Example:

```ts
import type { IntFilter } from "./generated/prisma/commonInputTypes";
```

internal/* [#internal]

<CalloutContainer type="warning">
  <CalloutDescription>
    Do not directly import from these files! They are not part of the stable API of the generated code and can change at any time in breaking ways.

    Usually anything you might need from there is exposed via `browser.ts` or `client.ts` under the `Prisma` namespace.
  </CalloutDescription>
</CalloutContainer>

Breaking changes from prisma-client-js [#breaking-changes-from-prisma-client-js]

* Requires an `output` path on the `generator` block
* No `Prisma.validator` function; you can use TypeScript native [`satisfies`](https://www.prisma.io/blog/satisfies-operator-ur8ys8ccq7zb) keyword instead

Examples [#examples]

To see what the new `prisma-client` generator looks like in practice, check out our minimal and [ready-to-run examples](https://github.com/prisma/prisma-examples):

| Example                                                                                                                                                            | Framework      | Bundler           | Runtime                                          | Monorepo  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------- | ------------------------------------------------ | --------- |
| [`nextjs-starter-webpack`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nextjs-starter-webpack)                                   | Next.js 15     | Webpack           | Node.js                                          | n/a       |
| [`nextjs-starter-turbopack`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nextjs-starter-turbopack)                               | Next.js 15     | Turbopack (alpha) | Node.js                                          | n/a       |
| [`nextjs-starter-webpack-monorepo`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nextjs-starter-webpack-monorepo)                 | Next.js 15     | Webpack           | Node.js                                          | pnpm      |
| [`nextjs-starter-webpack-with-middleware`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nextjs-starter-webpack-with-middleware)   | Next.js 15     | Webpack           | Node.js (main pages), `vercel-edge` (middleware) | n/a       |
| [`nextjs-starter-webpack-turborepo`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nextjs-starter-webpack-turborepo)               | Next.js 15     | Webpack           | Node.js                                          | turborepo |
| [`react-router-starter-nodejs`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/react-router-starter-nodejs)                         | React Router 7 | Vite 6            | Node.js                                          | n/a       |
| [`react-router-starter-cloudflare-workerd`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/react-router-starter-cloudflare-workerd) | React Router 7 |                   |                                                  | n/a       |
| [`nuxt3-starter-nodejs`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nuxt3-starter-nodejs)                                       | Nuxt 3         | Vite 6            | Node.js                                          | n/a       |
| [`nuxt4-starter-nodejs`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/nuxt4-starter-nodejs)                                       | Nuxt 4         | Vite 7            | Node.js                                          | n/a       |
| [`bun`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/deno-deploy)                                                                 | None           | None              | Deno 2                                           | n/a       |
| [`deno`](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/deno-deploy)                                                                | None           | None              | Deno 2                                           | n/a       |

prisma-client-js (Deprecated) [#prisma-client-js-deprecated]

<CalloutContainer type="warning">
  <CalloutTitle>
    Deprecated
  </CalloutTitle>

  <CalloutDescription>
    The `prisma-client-js` generator is deprecated. We recommend using [`prisma-client`](#prisma-client) for new projects and updating existing projects when possible.
  </CalloutDescription>
</CalloutContainer>

The `prisma-client-js` generator requires the `@prisma/client` npm package and generates Prisma Client into `node_modules`.

Field reference [#field-reference-1]

The generator for Prisma's JavaScript Client accepts multiple additional properties:

* `previewFeatures`: [Preview features](/orm/reference/preview-features/client-preview-features) to include
* `binaryTargets`: Engine binary targets for `prisma-client-js` (for example, `debian-openssl-1.1.x` if you are deploying to Ubuntu 18+, or `native` if you are working locally)

```prisma title="prisma/schema.prisma"
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["sample-preview-feature"]
  binaryTargets   = ["debian-openssl-1.1.x"] // defaults to `"native"`
}
```

Community generators [#community-generators]

<CalloutContainer type="info">
  <CalloutDescription>
    Existing generators or new ones should not be affected if you are using a [multi-file Prisma schema](/orm/prisma-schema/overview/location#multi-file-prisma-schema), unless a generator reads the schema manually.
  </CalloutDescription>
</CalloutContainer>

The following is a list of community created generators.

* [`prisma-dbml-generator`](https://notiz.dev/blog/prisma-dbml-generator/): Transforms the Prisma schema into [Database Markup Language](https://dbml.dbdiagram.io/home/) (DBML) which allows for an easy visual representation
* [`prisma-docs-generator`](https://github.com/pantharshit00/prisma-docs-generator): Generates an individual API reference for Prisma Client
* [`prisma-json-schema-generator`](https://github.com/valentinpalkovic/prisma-json-schema-generator): Transforms the Prisma schema in [JSON schema](https://json-schema.org/)
* [`prisma-json-types-generator`](https://github.com/arthurfiorette/prisma-json-types-generator): Enhances `prisma-client-js` (or `prisma-client`) to provide strongly typed JSON fields for all databases, based on your schema. It improves code generation, Intellisense, and more, without affecting runtime code.
* [`typegraphql-prisma`](https://github.com/MichalLytek/typegraphql-prisma#readme): Generates [TypeGraphQL](https://typegraphql.com/) CRUD resolvers for Prisma models
* [`typegraphql-prisma-nestjs`](https://github.com/EndyKaufman/typegraphql-prisma-nestjs#readme): Fork of [`typegraphql-prisma`](https://github.com/MichalLytek/typegraphql-prisma), which also generates CRUD resolvers for Prisma models but for NestJS
* [`prisma-typegraphql-types-gen`](https://github.com/YassinEldeeb/prisma-tgql-types-gen): Generates [TypeGraphQL](https://typegraphql.com/) class types and enums from your prisma type definitions, the generated output can be edited without being overwritten by the next gen and has the ability to correct you when you mess up the types with your edits.
* [`nexus-prisma`](https://github.com/prisma/nexus-prisma/): Allows for projecting Prisma models to GraphQL via [GraphQL Nexus](https://nexusjs.org/docs/)
* [`prisma-nestjs-graphql`](https://github.com/unlight/prisma-nestjs-graphql): Generates object types, inputs, args, etc. from the Prisma Schema for usage with `@nestjs/graphql` module
* [`prisma-appsync`](https://github.com/maoosi/prisma-appsync): Generates a full-blown GraphQL API for [AWS AppSync](https://aws.amazon.com/appsync/)
* [`prisma-kysely`](https://github.com/valtyr/prisma-kysely): Generates type definitions for Kysely, a TypeScript SQL query builder. This can be useful to perform queries against your database from an edge runtime, or to write more complex SQL queries not possible in Prisma without dropping type safety.
* [`prisma-generator-nestjs-dto`](https://github.com/vegardit/prisma-generator-nestjs-dto): Generates DTO and Entity classes with relation `connect` and `create` options for use with [NestJS Resources](https://docs.nestjs.com/recipes/crud-generator) and [@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)
* [`prisma-erd-generator`](https://github.com/keonik/prisma-erd-generator): Generates an entity relationship diagram
* [`prisma-generator-plantuml-erd`](https://github.com/dbgso/prisma-generator-plantuml-erd/tree/main/packages/generator): Generator to generate ER diagrams for PlantUML. Markdown and Asciidoc documents can also be generated by activating the option.
* [`prisma-class-generator`](https://github.com/kimjbstar/prisma-class-generator): Generates classes from your Prisma Schema that can be used as DTO, Swagger Response, TypeGraphQL and so on.
* [`zod-prisma`](https://github.com/CarterGrimmeisen/zod-prisma): Creates Zod schemas from your Prisma models.
* [`prisma-pothos-types`](https://github.com/hayes/pothos/tree/main/packages/plugin-prisma): Makes it easier to define Prisma-based object types, and helps solve n+1 queries for relations. It also has integrations for the Relay plugin to make defining nodes and connections easy and efficient.
* [`prisma-generator-pothos-codegen`](https://github.com/Cauen/prisma-generator-pothos-codegen): Auto generate input types (for use as args) and auto generate decoupled type-safe base files makes it easy to create customizable objects, queries and mutations for [Pothos](https://pothos-graphql.dev/) from Prisma schema. Optionally generate all crud at once from the base files.
* [`prisma-joi-generator`](https://github.com/omar-dulaimi/prisma-joi-generator): Generate full Joi schemas from your Prisma schema.
* [`prisma-yup-generator`](https://github.com/omar-dulaimi/prisma-yup-generator): Generate full Yup schemas from your Prisma schema.
* [`prisma-class-validator-generator`](https://github.com/omar-dulaimi/prisma-class-validator-generator): Emit TypeScript models from your Prisma schema with class validator validations ready.
* [`prisma-zod-generator`](https://github.com/omar-dulaimi/prisma-zod-generator): Emit Zod schemas from your Prisma schema.
* [`prisma-trpc-generator`](https://github.com/omar-dulaimi/prisma-trpc-generator): Emit fully implemented tRPC routers.
* [`prisma-json-server-generator`](https://github.com/omar-dulaimi/prisma-json-server-generator): Emit a JSON file that can be run with json-server.
* [`prisma-trpc-shield-generator`](https://github.com/omar-dulaimi/prisma-trpc-shield-generator): Emit a tRPC shield from your Prisma schema.
* [`prisma-custom-models-generator`](https://github.com/omar-dulaimi/prisma-custom-models-generator): Emit custom models from your Prisma schema, based on Prisma recommendations.
* [`nestjs-prisma-graphql-crud-gen`](https://github.com/mk668a/nestjs-prisma-graphql-crud-gen): Generate CRUD resolvers from GraphQL schema with NestJS and Prisma.
* [`prisma-generator-dart`](https://github.com/FredrikBorgstrom/abcx3/tree/master/libs/prisma-generator-dart): Generates Dart/Flutter class files with to- and fromJson methods.
* [`prisma-generator-graphql-typedef`](https://github.com/mavvy22/prisma-generator-graphql-typedef): Generates graphql schema.
* [`prisma-markdown`](https://github.com/samchon/prisma-markdown): Generates markdown document composed with ERD diagrams and their descriptions. Supports pagination of ERD diagrams through `@namespace` comment tag.
* [`prisma-models-graph`](https://github.com/dangchinh25/prisma-models-graph): Generates a bi-directional models graph for schema without strict relationship defined in the schema, works via a custom schema annotation.
* [`prisma-generator-fake-data`](https://github.com/luisrudge/prisma-generator-fake-data): Generates realistic-looking fake data for your Prisma models that can be used in unit/integration tests, demos, and more.
* [`prisma-generator-drizzle`](https://github.com/farreldarian/prisma-generator-drizzle): A Prisma generator for generating Drizzle schema with ease.
* [`prisma-generator-express`](https://github.com/multipliedtwice/prisma-generator-express): Generates Express CRUD and Router generator function.
* [`prismabox`](https://github.com/m1212e/prismabox): Generates versatile [typebox](https://github.com/sinclairzx81/typebox) schema from your Prisma models.
* [`prisma-generator-typescript-interfaces`](https://github.com/mogzol/prisma-generator-typescript-interfaces): Generates zero-dependency TypeScript interfaces from your Prisma schema.
* [`prisma-openapi`](https://github.com/nitzano/prisma-openapi): Generates OpenAPI schema from Prisma models.


# Schema location (/docs/orm/prisma-schema/overview/location)



The default name for the Prisma Schema is a single file `schema.prisma` in your `prisma` folder. When your schema is named like this, the Prisma CLI will detect it automatically.

Prisma Schema location [#prisma-schema-location]

The Prisma CLI looks for the Prisma Schema in the following locations, in the following order:

1. The location specified by the [`--schema` flag](/orm/reference/prisma-cli-reference), which is available when you `introspect`, `generate`, `migrate`, and `studio`:

   ```bash
   prisma generate --schema=./alternative/schema.prisma
   ```

2. The location specified in the `prisma.config.ts` file:

   ```ts title="prisma.config.ts"
   import { defineConfig } from "prisma/config";

   export default defineConfig({
     schema: "prisma/",
     ...
   });
   ```

3. Default locations:
   * `./prisma/schema.prisma`
   * `./schema.prisma`

The Prisma CLI outputs the path of the schema that will be used. The following example shows the terminal output for `prisma db pull`:

```text
Environment variables loaded from .env
Prisma Schema loaded from prisma/schema.prisma

Introspecting based on datasource defined in prisma/schema.prisma …

✔ Introspected 4 models and wrote them into prisma/schema.prisma in 239ms

Run prisma generate to generate Prisma Client.
```

Multi-file Prisma schema [#multi-file-prisma-schema]

<Accordions>
  <Accordion title="Watch video: Multi-file Prisma schema">
    <Youtube videoId="yGgoP2KK8Bo" title="How to organize and use a multi-file Prisma schema" />
  </Accordion>
</Accordions>

If you prefer splitting your Prisma schema into multiple files, you can have a setup that looks as follows:

```
prisma/
├── migrations
├── models
│   ├── posts.prisma
│   ├── users.prisma
│   └── ... other `.prisma` files
└── schema.prisma
```

Usage [#usage]

When using a multi-file Prisma schema, you must always explicitly specify the location of the directory that contains your schema files (including the main `schema.prisma` file with your `generator` block).

You can do this in two ways:

* pass the `--schema` option to your Prisma CLI command (e.g. `prisma migrate dev --schema ./prisma`)
* set the `schema` property in [`prisma.config.ts`](/orm/reference/prisma-config-reference#schema) (for Prisma ORM v7):

  ```ts title="prisma.config.ts"
  import { defineConfig, env } from "prisma/config";
  import "dotenv/config";

  export default defineConfig({
    schema: "prisma/",
    migrations: {
      path: "prisma/migrations",
      seed: "tsx prisma/seed.ts",
    },
    datasource: {
      url: env("DATABASE_URL"),
    },
  });
  ```

<CalloutContainer type="info">
  <CalloutDescription>
    We recommend using the [Prisma Config file](/orm/reference/prisma-config-reference#schema) to specify the location of your Prisma schema. This is the most flexible way to specify the location of your Prisma schema alongside other configuration options.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="warning">
  <CalloutDescription>
    The `schema.prisma` file (which contains your `generator` block) must be located in the same directory that you specify in your schema configuration. For example, if you configure `schema: 'prisma'`, your `schema.prisma` file must be at `prisma/schema.prisma`, not in a subdirectory like `prisma/models/schema.prisma`.
  </CalloutDescription>
</CalloutContainer>

You must also place the `migrations` directory at the same level as your `schema.prisma` file.

For example, assuming `schema.prisma` defines the `generator` block, here's the correct directory structure:

```
# All files must be inside the `prisma/` directory
# `migrations` and `schema.prisma` must be at the same level
prisma/
├── migrations
├── models
│   ├── posts.prisma
│   └── users.prisma
└── schema.prisma  # Contains generator block
```

<CalloutContainer type="info">
  <CalloutDescription>
    If your schema files are in a `prisma/` directory (as shown above), the Prisma CLI commands like `prisma generate` and `prisma migrate dev` will work without additional configuration, as `./prisma/schema.prisma` is a default location.
  </CalloutDescription>
</CalloutContainer>

Tips for multi-file Prisma Schema [#tips-for-multi-file-prisma-schema]

We've found that a few patterns work well with this feature and will help you get the most out of it:

* Organize your files by domain: group related models into the same file. For example, keep all user-related models in `user.prisma` while post-related models go in `post.prisma`.
* Use clear naming conventions: schema files should be named clearly and succinctly. Use names like `user.prisma` and `post.prisma` and not `myModels.prisma` or `CommentFeaturesSchema.prisma`.
* Have an obvious "main" schema file: while you can now have as many schema files as you want, you'll still need a place where you define your `generator` block. We recommend having a single schema file that's obviously the "main" file so that this block is easy to find. `main.prisma`, `schema.prisma`, and `base.prisma` are a few we've seen that work well.
# Models (/docs/orm/prisma-schema/data-model/models)



The data model definition part of the [Prisma schema](/orm/prisma-schema/overview) defines your application models (also called **Prisma models**). Models:

* Represent the **entities** of your application domain
* Map to the **tables** (relational databases like PostgreSQL) or **collections** (MongoDB) in your database
* Form the foundation of the **queries** available in the generated [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction)
* When used with TypeScript, Prisma Client provides generated **type definitions** for your models and any [variations](/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types) of them to make database access entirely type safe.

The following schema describes a blogging platform - the data model definition is highlighted:

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=10-46;normal 
    datasource db {
      provider = "postgresql"
    }

    generator client {
      provider = "prisma-client"
      output   = "./generated"
    }

    model User { // [!code highlight]
      id      Int      @id @default(autoincrement()) // [!code highlight]
      email   String   @unique // [!code highlight]
      name    String? // [!code highlight]
      role    Role     @default(USER) // [!code highlight]
      posts   Post[] // [!code highlight]
      profile Profile? // [!code highlight]
    } // [!code highlight]

    model Profile { // [!code highlight]
      id     Int    @id @default(autoincrement()) // [!code highlight]
      bio    String // [!code highlight]
      user   User   @relation(fields: [userId], references: [id]) // [!code highlight]
      userId Int    @unique // [!code highlight]
    } // [!code highlight]

    model Post { // [!code highlight]
      id         Int        @id @default(autoincrement()) // [!code highlight]
      createdAt  DateTime   @default(now()) // [!code highlight]
      updatedAt  DateTime   @updatedAt // [!code highlight]
      title      String // [!code highlight]
      published  Boolean    @default(false) // [!code highlight]
      author     User       @relation(fields: [authorId], references: [id]) // [!code highlight]
      authorId   Int // [!code highlight]
      categories Category[] // [!code highlight]
    } // [!code highlight]

    model Category { // [!code highlight]
      id    Int    @id @default(autoincrement()) // [!code highlight]
      name  String // [!code highlight]
      posts Post[] // [!code highlight]
    } // [!code highlight]

    enum Role { // [!code highlight]
      USER // [!code highlight]
      ADMIN // [!code highlight]
    } // [!code highlight]
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=10-45;normal 
    datasource db {
      provider = "mongodb"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User { // [!code highlight]
      id      String   @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
      email   String   @unique // [!code highlight]
      name    String? // [!code highlight]
      role    Role     @default(USER) // [!code highlight]
      posts   Post[] // [!code highlight]
      profile Profile? // [!code highlight]
    } // [!code highlight]

    model Profile { // [!code highlight]
      id     String @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
      bio    String // [!code highlight]
      user   User   @relation(fields: [userId], references: [id]) // [!code highlight]
      userId String @unique @db.ObjectId // [!code highlight]
    } // [!code highlight]

    model Post { // [!code highlight]
      id          String     @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
      createdAt   DateTime   @default(now()) // [!code highlight]
      title       String // [!code highlight]
      published   Boolean    @default(false) // [!code highlight]
      author      User       @relation(fields: [authorId], references: [id]) // [!code highlight]
      authorId    String     @db.ObjectId // [!code highlight]
      categoryIDs String[]   @db.ObjectId // [!code highlight]
      categories  Category[] @relation(fields: [categoryIDs], references: [id]) // [!code highlight]
    } // [!code highlight]

    model Category { // [!code highlight]
      id      String   @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
      name    String // [!code highlight]
      postIDs String[] @db.ObjectId // [!code highlight]
      posts   Post[]   @relation(fields: [postIDs], references: [id]) // [!code highlight]
    } // [!code highlight]

    enum Role { // [!code highlight]
      USER // [!code highlight]
      ADMIN
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

The data model definition is made up of:

* [Models](#defining-models) ([`model`](/orm/reference/prisma-schema-reference#model) primitives) that define a number of fields, including [relations between models](#relation-fields)
* [Enums](#defining-enums) ([`enum`](/orm/reference/prisma-schema-reference#enum) primitives) (if your connector supports Enums)
* [Attributes](#defining-attributes) and [functions](#using-functions) that change the behavior of fields and models

The corresponding database looks like this:

<img alt="Sample database" src="/img/orm/sample-database.png" width="1768" height="938" />

<details>
  <summary>
    A model maps to the underlying structures of the data source.
  </summary>

  * In relational databases like PostgreSQL and MySQL, a `model` maps to a **table**
  * In MongoDB, a `model` maps to a **collection**

  > **Note**: In the future there might be connectors for non-relational databases and other data sources. For example, for a REST API it would map to a *resource*.
</details>

The following query creates a `User` with nested `Post` and `Category` records:

```ts
const user = await prisma.user.create({
  data: {
    email: "ariadne@prisma.io",
    name: "Ariadne",
    posts: {
      create: [
        {
          title: "My first day at Prisma",
          categories: { create: { name: "Office" } },
        },
        {
          title: "How to connect to a SQLite database",
          categories: { create: [{ name: "Databases" }, { name: "Tutorials" }] },
        },
      ],
    },
  },
});
```

Your data model reflects *your* application domain. For example:

* In an **ecommerce** application you probably have models like `Customer`, `Order`, `Item` and `Invoice`.
* In a **social media** application you probably have models like `User`, `Post`, `Photo` and `Message`.

Introspection and migration [#introspection-and-migration]

There are two ways to define a data model:

* **Write the data model manually and use Prisma Migrate**: You can write your data model manually and map it to your database using [Prisma Migrate](/orm/prisma-migrate). In this case, the data model is the single source of truth for the models of your application.
* **Generate the data model via introspection**: When you have an existing database or prefer migrating your database schema with SQL, you generate the data model by [introspecting](/orm/prisma-schema/introspection) your database. In this case, the database schema is the single source of truth for the models of your application.

Defining models [#defining-models]

Models represent the entities of your application domain. Models are represented by [`model`](/orm/reference/prisma-schema-reference#model) blocks and define a number of [fields](/orm/reference/prisma-schema-reference#model-fields). In the example data model above, `User`, `Profile`, `Post` and `Category` are models.

A blogging platform can be extended with the following models:

```prisma
model Comment {
  // Fields
}

model Tag {
  // Fields
}
```

Mapping model names to tables or collections [#mapping-model-names-to-tables-or-collections]

Prisma model [naming conventions (singular form, PascalCase)](/orm/reference/prisma-schema-reference#naming-conventions) do not always match table names in the database. A common approach for naming tables/collections in databases is to use plural form and [snake\_case](https://en.wikipedia.org/wiki/Snake_case) notation - for example: `comments`. When you introspect a database with a table named `comments`, the resulting Prisma model will look like this:

```prisma
model comments {
  // Fields
}
```

However, you can still adhere to the naming convention without renaming the underlying `comments` table in the database by using the [`@@map`](/orm/reference/prisma-schema-reference) attribute:

```prisma
model Comment {
  // Fields

  @@map("comments")
}
```

With this model definition, Prisma ORM automatically maps the `Comment` model to the `comments` table in the underlying database.

> **Note**: You can also [`@map`](/orm/reference/prisma-schema-reference#map) a column name or enum value, and `@@map` an enum name.

`@map` and `@@map` allow you to [tune the shape of your Prisma Client API](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names#using-map-and-map-to-rename-fields-and-models-in-the-prisma-client-api) by decoupling model and field names from table and column names in the underlying database.

Defining fields [#defining-fields]

The properties of a model are called *fields*, which consist of:

* A **[field name](/orm/reference/prisma-schema-reference#model-fields)**
* A **[field type](/orm/reference/prisma-schema-reference#model-fields)**
* Optional **[type modifiers](#type-modifiers)**
* Optional **[attributes](#defining-attributes)**, including [native database type attributes](#native-types-mapping)

A field's type determines its *structure*, and fits into one of two categories:

* [Scalar types](#scalar-fields) (includes [enums](#defining-enums)) that map to columns (relational databases) or document fields (MongoDB) - for example, [`String`](/orm/reference/prisma-schema-reference#string) or [`Int`](/orm/reference/prisma-schema-reference#int)
* Model types (the field is then called [relation field](/orm/prisma-schema/data-model/relations#relation-fields)) - for example `Post` or `Comment[]`

Scalar fields [#scalar-fields]

The following example extends the `Comment` and `Tag` models with several scalar types. Some fields include [attributes](#defining-attributes):

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=2-4,8;normal 
    model Comment {
      id      Int    @id @default(autoincrement()) // [!code highlight]
      title   String // [!code highlight]
      content String // [!code highlight]
    }

    model Tag {
      name String @id // [!code highlight]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=2-4,8;normal 
    model Comment {
      id      String @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
      title   String // [!code highlight]
      content String // [!code highlight]
    }

    model Tag {
      name String @id @map("_id") // [!code highlight]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

See [complete list of scalar field types](/orm/reference/prisma-schema-reference#model-field-scalar-types) .

Relation fields [#relation-fields]

A relation field's type is another model - for example, a post (`Post`) can have multiple comments (`Comment[]`):

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=4,10;normal 
    model Post {
      id       Int       @id @default(autoincrement())
      // Other fields
      comments Comment[] // A post can have many comments // [!code highlight]
    }

    model Comment {
      id     Int
      // Other fields
      post   Post @relation(fields: [postId], references: [id]) // A comment can have one post // [!code highlight]
      postId Int
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=4,10;normal 
    model Post {
      id       String    @id @default(auto()) @map("_id") @db.Objectid
      // Other fields
      comments Comment[] // A post can have many comments // [!code highlight]
    }

    model Comment {
      id     String @id @default(auto()) @map("_id") @db.Objectid
      // Other fields
      post   Post   @relation(fields: [postId], references: [id]) // A comment can have one post // [!code highlight]
      postId String @db.ObjectId
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Refer to the [relations documentation](/orm/prisma-schema/data-model/relations) for more examples and information about relationships between models.

Native types mapping [#native-types-mapping]

**Native database type attributes** describe the underlying database type:

```prisma
model Post {
  id      Int    @id
  title   String @db.VarChar(200)
  content String
}
```

Type attributes are:

* Specific to the underlying provider (e.g., PostgreSQL uses `@db.Boolean`, MySQL uses `@db.TinyInt(1)`)
* Written in PascalCase and prefixed by `@db`
* Only added during [introspection](/orm/prisma-schema/introspection) if the native type differs from the default

See [native database type attributes](/orm/reference/prisma-schema-reference#model-field-scalar-types) for the complete list.

Type modifiers [#type-modifiers]

The type of a field can be modified by appending either of two modifiers:

* [`[]`](/orm/reference/prisma-schema-reference#-modifier) Make a field a list
* [`?`](/orm/reference/prisma-schema-reference#-modifier-1) Make a field optional

> **Note**: You **cannot** combine type modifiers - optional lists are not supported.

Lists [#lists]

The following example includes a scalar list and a list of related models:

```prisma
model Post {
  id       Int       @id @default(autoincrement())
  comments Comment[] // A list of comments
  keywords String[]  // A scalar list
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    Scalar lists are only supported if the database connector supports them natively or at a Prisma ORM level.
  </CalloutDescription>
</CalloutContainer>

Optional and mandatory fields [#optional-and-mandatory-fields]

```prisma
model Comment {
  id      Int     @id @default(autoincrement())
  title   String       // Required field
  content String?      // Optional field (nullable)
}
```

Fields without `?` are required:

* **Relational databases**: Represented via `NOT NULL` constraints
* **Prisma Client**: TypeScript types enforce these fields at compile time

Unsupported types [#unsupported-types]

When you introspect a relational database, unsupported data types are added as [`Unsupported`](/orm/reference/prisma-schema-reference#unsupported):

```prisma
location    Unsupported("POLYGON")?
```

Fields of type `Unsupported` don't appear in the generated Prisma Client API, but you can still use [raw database access](/orm/prisma-client/using-raw-sql/raw-queries) to query them.

<CalloutContainer type="info">
  <CalloutDescription>
    The MongoDB connector doesn't support `Unsupported` types because it supports all scalar types.
  </CalloutDescription>
</CalloutContainer>

Defining attributes [#defining-attributes]

Attributes modify the behavior of fields or model blocks. The following example includes three field attributes ([`@id`](/orm/reference/prisma-schema-reference#id) , [`@default`](/orm/reference/prisma-schema-reference#default) , and [`@unique`](/orm/reference/prisma-schema-reference#unique) ) and one block attribute ([`@@unique`](/orm/reference/prisma-schema-reference)):

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        Int     @id @default(autoincrement())
      firstName String
      lastName  String
      email     String  @unique
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName])
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String  @id @default(auto()) @map("_id") @db.ObjectId
      firstName String
      lastName  String
      email     String  @unique
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName])
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Some attributes accept [arguments](/orm/reference/prisma-schema-reference#attribute-argument-types) - for example, `@default` accepts `true` or `false`:

```prisma
isAdmin   Boolean @default(false) // short form of @default(value: false)
```

See [complete list of field and block attributes](/orm/reference/prisma-schema-reference#attributes)

Defining an ID field [#defining-an-id-field]

An ID uniquely identifies individual records of a model. A model can only have *one* ID:

* In **relational databases**, the ID can be a single field or based on multiple fields. If a model does not have an `@id` or an `@@id`, you must define a mandatory `@unique` field or `@@unique` block instead.
* In **MongoDB**, an ID must be a single field that defines an `@id` attribute and a `@map("_id")` attribute.

Defining IDs in relational databases [#defining-ids-in-relational-databases]

In relational databases, an ID can be defined by a single field using the [`@id`](/orm/reference/prisma-schema-reference#id) attribute, or multiple fields using the [`@@id`](/orm/reference/prisma-schema-reference) attribute.

Single field IDs [#single-field-ids]

In the following example, the `User` ID is represented by the `id` integer field:

```prisma highlight=2;normal
model User {
  id      Int      @id @default(autoincrement()) // [!code highlight]
  email   String   @unique
  name    String?
  role    Role     @default(USER)
  posts   Post[]
  profile Profile?
}
```

Composite IDs [#composite-ids]

In the following example, the `User` ID is represented by a combination of the `firstName` and `lastName` fields:

```prisma highlight=7;normal
model User {
  firstName String
  lastName  String
  email     String  @unique
  isAdmin   Boolean @default(false)

  @@id([firstName, lastName]) // [!code highlight]
}
```

By default, the name of this field in Prisma Client queries will be `firstName_lastName`.

You can also provide your own name for the composite ID using the [`@@id`](/orm/reference/prisma-schema-reference) attribute's `name` field:

```prisma highlight=7;normal
model User {
  firstName String
  lastName  String
  email     String  @unique
  isAdmin   Boolean @default(false)

  @@id(name: "fullName", fields: [firstName, lastName]) // [!code highlight]
}
```

The `firstName_lastName` field will now be named `fullName` instead.

<CalloutContainer type="info">
  <CalloutDescription>
    Refer to the documentation on [working with composite IDs](/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints) to learn how to interact with a composite ID in Prisma Client.
  </CalloutDescription>
</CalloutContainer>

@unique fields as unique identifiers [#unique-fields-as-unique-identifiers]

In the following example, users are uniquely identified by a `@unique` field. Because the `email` field functions as a unique identifier for the model (which is required), it must be mandatory:

```prisma highlight=2;normal
model User {
  email   String   @unique // [!code highlight]
  name    String?
  role    Role     @default(USER)
  posts   Post[]
  profile Profile?
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    **Constraint names in relational databases** <br />
    You can optionally define a [custom primary key constraint name](/orm/prisma-schema/data-model/database-mapping#constraint-and-index-names) in the underlying database.
  </CalloutDescription>
</CalloutContainer>

Defining IDs in MongoDB [#defining-ids-in-mongodb]

The MongoDB connector has [specific rules for defining an ID field](/orm/reference/prisma-schema-reference#mongodb) that differs from relational databases. An ID must be defined by a single field using the [`@id`](/orm/reference/prisma-schema-reference#id) attribute and must include `@map("_id")`.

In the following example, the `User` ID is represented by the `id` string field that accepts an auto-generated `ObjectId`:

```prisma highlight=2;normal
model User {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId // [!code highlight]
  email   String   @unique
  name    String?
  role    Role     @default(USER)
  posts   Post[]
  profile Profile?
}
```

In the following example, the `User` ID is represented by the `id` string field that accepts something other than an `ObjectId` - for example, a unique username:

```prisma highlight=2;normal
model User {
  id      String   @id @map("_id") // [!code highlight]
  email   String   @unique
  name    String?
  role    Role     @default(USER)
  posts   Post[]
  profile Profile?
}
```

<CalloutContainer type="warning">
  <CalloutDescription>
    **MongoDB does not support `@@id`**<br />
    MongoDB does not support composite IDs, which means you cannot identify a model with a `@@id` block.
  </CalloutDescription>
</CalloutContainer>

Defining a default value [#defining-a-default-value]

You can define default values for scalar fields using the [`@default`](/orm/reference/prisma-schema-reference#default) attribute:

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  title      String
  published  Boolean    @default(false)
  data       Json       @default("{ \"hello\": \"world\" }")
}
```

Default values can be:

* **Static values**: `5` (`Int`), `"Hello"` (`String`), `false` (`Boolean`)
* **Lists**: `[5, 6, 8]` (`Int[]`), `["Hello", "Goodbye"]` (`String[]`)
* **Functions**: [`now()`](/orm/reference/prisma-schema-reference#now), [`uuid()`](/orm/reference/prisma-schema-reference#uuid), [`cuid()`](/orm/reference/prisma-schema-reference#cuid)
* **JSON**: Use escaped strings, e.g., `@default("{ \"hello\": \"world\" }")`

See [attribute functions](/orm/reference/prisma-schema-reference#attribute-functions) for connector support details.

Defining a unique field [#defining-a-unique-field]

Unique attributes can be defined on a single field using [`@unique`](/orm/reference/prisma-schema-reference#unique), or on multiple fields using [`@@unique`](/orm/reference/prisma-schema-reference):

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique      // Single field unique
  name  String?
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int

  @@unique([authorId, title]) // Composite unique
}
```

You can customize the constraint name with the `name` field: `@@unique(name: "authorTitle", [authorId, title])`

See [working with composite unique identifiers](/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints) for Prisma Client usage.

Composite type unique constraints (MongoDB) [#composite-type-unique-constraints-mongodb]

For MongoDB composite types, you can define unique constraints on nested fields:

```prisma
type Address {
  street String
  number Int
}

model User {
  id      Int     @id
  email   String
  address Address

  @@unique([email, address.number])
}
```

Defining an index [#defining-an-index]

Define indexes via [`@@index`](/orm/reference/prisma-schema-reference#index):

```prisma
model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?

  @@index([title, content])
}
```

For MongoDB composite types, use dot notation: `@@index([address.city.name])`

See [custom index names](/orm/prisma-schema/data-model/database-mapping#constraint-and-index-names) for naming customization.

Defining enums [#defining-enums]

Enums are defined via the [`enum`](/orm/reference/prisma-schema-reference#enum) block when [supported by your database](/orm/reference/database-features#misc):

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  role  Role    @default(USER)
}

enum Role {
  USER
  ADMIN
}
```

Defining composite types (MongoDB) [#defining-composite-types-mongodb]

<CalloutContainer type="warning">
  <CalloutDescription>
    Composite types are only available on MongoDB.
  </CalloutDescription>
</CalloutContainer>

Composite types (embedded documents) allow embedding records inside other records:

```prisma
model Product {
  id     String  @id @default(auto()) @map("_id") @db.ObjectId
  name   String
  photos Photo[]
}

type Photo {
  height Int
  width  Int
  url    String
}
```

**Supported attributes in composite types:** `@default`, `@map`, native types (`@db.ObjectId`)

**Not supported:** `@unique`, `@id`, `@relation`, `@ignore`, `@updatedAt`

Using functions [#using-functions]

The Prisma schema supports [functions](/orm/reference/prisma-schema-reference#attribute-functions) for default values:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  uuid      String   @default(uuid())
}
```

Common functions: `now()`, `uuid()`, `cuid()`, `autoincrement()`, `auto()` (MongoDB ObjectId)

Relations [#relations]

See [relations documentation](/orm/prisma-schema/data-model/relations) for relationship details.

Models in Prisma Client [#models-in-prisma-client]

Queries (CRUD) [#queries-crud]

Every model generates CRUD queries in the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction):

`findMany()` | `findFirst()` | `findUnique()` | `create()` | `update()` | `upsert()` | `delete()` | `createMany()` | `updateMany()` | `deleteMany()`

Access via the lowercase model name property: `prisma.user.create({ ... })`

Type definitions [#type-definitions]

Prisma Client generates TypeScript types for your models:

```ts
export type User = {
  id: number;
  email: string;
  name: string | null;
};
```

These types ensure type-safe database queries.

Limitations [#limitations]

Every Prisma model must have at least one unique identifier:

* `@id` or `@@id` for primary key
* `@unique` or `@@unique` for unique constraint
# Relations (/docs/orm/prisma-schema/data-model/relations)



A relation is a *connection* between two models in the Prisma schema. For example, there is a one-to-many relation between `User` and `Post` because one user can have many blog posts:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  // Foreign key connecting Post to User
  title    String
}
```

At a Prisma ORM level, the `User` / `Post` relation consists of:

* **Relation fields** (`author` and `posts`): Define connections at Prisma ORM level, do not exist in the database
* **Relation scalar field** (`authorId`): The foreign key that exists in the database

Relations in the database [#relations-in-the-database]

Relational databases [#relational-databases]

In SQL, you use a *foreign key* to create a relation between two tables:

* A foreign key column (`authorId`) in `Post` references the primary key (`id`) in `User`

```prisma
author     User        @relation(fields: [authorId], references: [id])
```

<CalloutContainer type="info">
  <CalloutDescription>
    Relations in the Prisma schema represent relationships that exist between tables in the database.
  </CalloutDescription>
</CalloutContainer>

MongoDB [#mongodb]

MongoDB uses a normalized data model design where documents reference each other by ID:

```json
// User document
{ "_id": { "$oid": "60d5922d00581b8f0062e3a8" }, "name": "Ella" }

// Post documents referencing the user
{ "_id": "...", "title": "How to make sushi", "authorId": { "$oid": "60d5922d00581b8f0062e3a8" } }
```

If using `ObjectId`, add `@db.ObjectId` to both the model ID and relation scalar field:

```prisma
model Post {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  author   User   @relation(fields: [authorId], references: [id])
  authorId String @db.ObjectId
}
```

Relations in Prisma Client [#relations-in-prisma-client]

Create records with nested relations [#create-records-with-nested-relations]

```ts
const userAndPosts = await prisma.user.create({
  data: {
    posts: {
      create: [{ title: "Prisma Day 2020" }, { title: "How to write a Prisma schema" }],
    },
  },
});
```

Retrieve records with related data [#retrieve-records-with-related-data]

```ts
const getAuthor = await prisma.user.findUnique({
  where: { id: "20" },
  include: { posts: true },
});
```

Connect existing records [#connect-existing-records]

```ts
await prisma.user.update({
  where: { id: 20 },
  data: {
    posts: { connect: { id: 4 } },
  },
});
```

Types of relations [#types-of-relations]

There are three different types (or [cardinalities](https://en.wikipedia.org/wiki/Cardinality_\(data_modeling\))) of relations in Prisma ORM:

* [One-to-one](/orm/prisma-schema/data-model/relations/one-to-one-relations) (also called 1-1 relations)
* [One-to-many](/orm/prisma-schema/data-model/relations/one-to-many-relations) (also called 1-n relations)
* [Many-to-many](/orm/prisma-schema/data-model/relations/many-to-many-relations) (also called m-n relations)

The following Prisma schema includes every type of relation:

* one-to-one: `User` ↔ `Profile`
* one-to-many: `User` ↔ `Post`
* many-to-many: `Post` ↔ `Category`

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id      Int      @id @default(autoincrement())
      posts   Post[]
      profile Profile?
    }

    model Profile {
      id     Int  @id @default(autoincrement())
      user   User @relation(fields: [userId], references: [id])
      userId Int  @unique // relation scalar field (used in the `@relation` attribute above)
    }

    model Post {
      id         Int        @id @default(autoincrement())
      author     User       @relation(fields: [authorId], references: [id])
      authorId   Int // relation scalar field  (used in the `@relation` attribute above)
      categories Category[]
    }

    model Category {
      id    Int    @id @default(autoincrement())
      posts Post[]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id      String   @id @default(auto()) @map("_id") @db.ObjectId
      posts   Post[]
      profile Profile?
    }

    model Profile {
      id     String @id @default(auto()) @map("_id") @db.ObjectId
      user   User   @relation(fields: [userId], references: [id])
      userId String @unique @db.ObjectId // relation scalar field (used in the `@relation` attribute above)
    }

    model Post {
      id          String     @id @default(auto()) @map("_id") @db.ObjectId
      author      User       @relation(fields: [authorId], references: [id])
      authorId    String     @db.ObjectId // relation scalar field  (used in the `@relation` attribute above)
      categories  Category[] @relation(fields: [categoryIds], references: [id])
      categoryIds String[]   @db.ObjectId
    }

    model Category {
      id      String   @id @default(auto()) @map("_id") @db.ObjectId
      posts   Post[]   @relation(fields: [postIds], references: [id])
      postIds String[] @db.ObjectId
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    This schema is the same as the [example data model](/orm/prisma-schema/data-model/models) but has all [scalar fields](/orm/prisma-schema/data-model/models#scalar-fields) removed (except for the required [relation scalar fields](/orm/prisma-schema/data-model/relations#relation-fields)) so you can focus on the [relation fields](#relation-fields).
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    This example uses [implicit many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations#implicit-many-to-many-relations). These relations do not require the `@relation` attribute unless you need to [disambiguate relations](#disambiguating-relations).
  </CalloutDescription>
</CalloutContainer>

Notice that the syntax is slightly different between relational databases and MongoDB - particularly for [many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations).

For relational databases, the following entity relationship diagram represents the database that corresponds to the sample Prisma schema:

<img alt="The sample schema as an entity relationship diagram" src="/img/orm/prisma-schema/data-model/relations/sample-schema.png" width="1768" height="900" />

For MongoDB, Prisma ORM uses a [normalized data model design](https://www.mongodb.com/docs/manual/data-modeling/), which means that documents reference each other by ID in a similar way to relational databases. See [the MongoDB section](#mongodb) for more details.

Implicit and explicit many-to-many relations [#implicit-and-explicit-many-to-many-relations]

Many-to-many relations in relational databases can be modelled in two ways:

* [explicit many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations#explicit-many-to-many-relations), where the relation table is represented as an explicit model in your Prisma schema
* [implicit many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations#implicit-many-to-many-relations), where Prisma ORM manages the relation table and it does not appear in the Prisma schema.

Implicit many-to-many relations require both models to have a single `@id`. Be aware of the following:

* You cannot use a [multi-field ID](/orm/reference/prisma-schema-reference)
* You cannot use a `@unique` in place of an `@id`

To use either of these features, you must set up an explicit many-to-many instead.

The implicit many-to-many relation still manifests in a relation table in the underlying database. However, Prisma ORM manages this relation table.

If you use an implicit many-to-many relation instead of an explicit one, it makes the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction) simpler (because, for example, you have one fewer level of nesting inside of [nested writes](/orm/prisma-client/queries/relation-queries#nested-writes)).

If you're not using Prisma Migrate but obtain your data model from [introspection](/orm/prisma-schema/introspection), you can still make use of implicit many-to-many relations by following Prisma ORM's [conventions for relation tables](/orm/prisma-schema/data-model/relations/many-to-many-relations#relation-table-conventions).

Relation fields [#relation-fields]

Relation fields are fields on a Prisma model whose type is another model (not a scalar type). Every relation needs exactly two relation fields, one on each model.

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[] // relation field
}

model Post {
  id       Int    @id @default(autoincrement())
  author   User   @relation(fields: [authorId], references: [id]) // annotated relation field
  authorId Int    // relation scalar field (foreign key)
}
```

**Key concepts:**

* `posts` and `author` are relation fields (exist at Prisma ORM level only)
* `authorId` is the relation scalar field (exists in the database as foreign key)

Annotated relation fields [#annotated-relation-fields]

Relations annotated with `@relation` attribute (one-to-one, one-to-many, and many-to-many for MongoDB) represent the side that stores the foreign key:

```prisma
author     User    @relation(fields: [authorId], references: [id])
authorId   Int     // relation scalar field
```

**Naming convention:** Relation scalar fields typically use the pattern `fieldName` + `Id` (e.g., `author` → `authorId`).

The @relation attribute [#the-relation-attribute]

The `@relation` attribute is required when:

* Defining one-to-one or one-to-many relations
* Disambiguating multiple relations between the same models
* Defining [self-relations](/orm/prisma-schema/data-model/relations/self-relations)
* Defining many-to-many relations for MongoDB

<CalloutContainer type="info">
  <CalloutDescription>
    [Implicit many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations#implicit-many-to-many-relations) in relational databases do not require `@relation`.
  </CalloutDescription>
</CalloutContainer>

Disambiguating relations [#disambiguating-relations]

When you have two relations between the same models, use the `name` argument in `@relation` to disambiguate:

```prisma
model User {
  id           Int     @id @default(autoincrement())
  writtenPosts Post[]  @relation("WrittenPosts")
  pinnedPost   Post?   @relation("PinnedPost")
}

model Post {
  id         Int     @id @default(autoincrement())
  author     User    @relation("WrittenPosts", fields: [authorId], references: [id])
  authorId   Int
  pinnedBy   User?   @relation("PinnedPost", fields: [pinnedById], references: [id])
  pinnedById Int?    @unique
}
```

The `name` must be the same on both sides of the relation.
# Referential actions (/docs/orm/prisma-schema/data-model/relations/referential-actions)



Referential actions determine what happens to a record when your application deletes or updates a related record. They are defined in the [`@relation`](/orm/reference/prisma-schema-reference#relation) attribute and map to foreign key constraints in the database.

In the following example, `onDelete: Cascade` means that deleting a `User` record will also delete all related `Post` records.

```prisma title="schema.prisma" highlight=4;normal showLineNumbers
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}

model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

If you do not specify a referential action, Prisma ORM [uses a default](#referential-action-defaults).

<details>
  <summary>
    Questions answered in this page
  </summary>

  * What do referential actions do?
  * Which defaults apply if none are set?
  * How do actions map to my database?
  * How do I fix cascade cycles on SQL Server?
  * Do MongoDB self-relations require NoAction?
  * How do I handle multiple cascade paths?
</details>

Available referential actions [#available-referential-actions]

Prisma ORM supports five referential actions:

* **[`Cascade`](#cascade)** - Deletes/updates cascade to related records
* **[`Restrict`](#restrict)** - Prevents deletion/update if related records exist
* **[`NoAction`](#noaction)** - Similar to Restrict, behavior varies by database
* **[`SetNull`](#setnull)** - Sets foreign key to NULL (requires optional relation)
* **[`SetDefault`](#setdefault)** - Sets foreign key to default value

Referential action defaults [#referential-action-defaults]

If you do not specify a referential action, Prisma ORM uses the following defaults:

| Clause     | Optional relations | Mandatory relations |
| :--------- | :----------------- | :------------------ |
| `onDelete` | `SetNull`          | `Restrict`          |
| `onUpdate` | `Cascade`          | `Cascade`           |

Caveats [#caveats]

The following caveats apply:

* Referential actions are **not** supported on [implicit many-to-many relations](/orm/prisma-schema/data-model/relations/many-to-many-relations#implicit-many-to-many-relations). To use referential actions, you must define an explicit many-to-many relation and define your referential actions on the [join table](/orm/prisma-schema/data-model/relations/troubleshooting-relations#how-to-use-a-relation-table-with-a-many-to-many-relationship).
* Certain combinations of referential actions and required/optional relations are incompatible. For example, using `SetNull` on a required relation will lead to database errors when deleting referenced records because the non-nullable constraint would be violated. See [this GitHub issue](https://github.com/prisma/prisma/issues/7909) for more information.

Types of referential actions [#types-of-referential-actions]

The following table shows which referential action each database supports.

| Database      | Cascade | Restrict | NoAction | SetNull | SetDefault |
| :------------ | :------ | :------- | :------- | :------ | :--------- |
| PostgreSQL    | ✔️      | ✔️       | ✔️       | ✔️⌘     | ✔️         |
| MySQL/MariaDB | ✔️      | ✔️       | ✔️       | ✔️      | ❌ (✔️†)    |
| SQLite        | ✔️      | ✔️       | ✔️       | ✔️      | ✔️         |
| SQL Server    | ✔️      | ❌‡       | ✔️       | ✔️      | ✔️         |
| CockroachDB   | ✔️      | ✔️       | ✔️       | ✔️      | ✔️         |
| MongoDB       | ✔️      | ✔️       | ✔️       | ✔️      | ❌          |

* † See [special cases for MySQL](#mysqlmariadb).
* ⌘ See [special cases for PostgreSQL](#postgresql).
* ‡ See [special cases for SQL Server](#sql-server).

Special cases for referential actions [#special-cases-for-referential-actions]

Referential actions are part of the ANSI SQL standard. However, there are special cases where some relational databases diverge from the standard.

MySQL/MariaDB [#mysqlmariadb]

MySQL/MariaDB, and the underlying InnoDB storage engine, does not support `SetDefault`. The exact behavior depends on the database version:

* In MySQL versions 8 and later, and MariaDB versions 10.5 and later, `SetDefault` effectively acts as an alias for `NoAction`. You can define tables using the `SET DEFAULT` referential action, but a foreign key constraint error is triggered at runtime.
* In MySQL versions 5.6 and later, and MariaDB versions before 10.5, attempting to create a table definition with the `SET DEFAULT` referential action fails with a syntax error.

For this reason, when you set `mysql` as the database provider, Prisma ORM warns users to replace `SetDefault` referential actions in the Prisma schema with another action.

PostgreSQL [#postgresql]

PostgreSQL is the only database supported by Prisma ORM that allows you to define a `SetNull` referential action that refers to a non-nullable field. However, this raises a foreign key constraint error when the action is triggered at runtime.

For this reason, when you set `postgres` as the database provider in the (default) `foreignKeys` relation mode, Prisma ORM warns users to mark as optional any fields that are included in a `@relation` attribute with a `SetNull` referential action. For all other database providers, Prisma ORM rejects the schema with a validation error.

SQL Server [#sql-server]

[`Restrict`](#restrict) is not available for SQL Server databases, but you can use [`NoAction`](#noaction) instead.

Cascade [#cascade]

* `onDelete: Cascade` Deleting a referenced record will trigger the deletion of referencing record.
* `onUpdate: Cascade` Updates the relation scalar fields if the referenced scalar fields of the dependent record are updated.

Example usage [#example-usage]

```prisma title="schema.prisma" highlight=4;add showLineNumbers
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: Cascade) // [!code ++]
  authorId Int
}

model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

**Result:** If a `User` record is deleted, their posts are deleted too. If the user's `id` is updated, the corresponding `authorId` is also updated.

Restrict [#restrict]

* `onDelete: Restrict` Prevents the deletion if any referencing records exist.
* `onUpdate: Restrict` Prevents the identifier of a referenced record from being changed.

Example usage [#example-usage-1]

```prisma title="schema.prisma" highlight=4;add showLineNumbers
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Restrict, onUpdate: Restrict) // [!code ++]
  authorId Int
}

model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

**Result:** `User`s with posts cannot be deleted. The `User`'s `id` cannot be changed.

<CalloutContainer type="warning">
  <CalloutDescription>
    The `Restrict` action is **not** available on [Microsoft SQL Server](/orm/core-concepts/supported-databases/sql-server) and triggers a schema validation error. Instead, you can use [`NoAction`](#noaction), which produces the same result and is compatible with SQL Server.
  </CalloutDescription>
</CalloutContainer>

NoAction [#noaction]

The `NoAction` action is similar to `Restrict`, the difference between the two is dependent on the database being used:

* **PostgreSQL**: `NoAction` allows the check (if a referenced row on the table exists) to be deferred until later in the transaction. See [the PostgreSQL docs](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) for more information.
* **MySQL**: `NoAction` behaves exactly the same as `Restrict`. See [the MySQL docs](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html#foreign-key-referential-actions) for more information.
* **SQLite**: When a related primary key is modified or deleted, no action is taken. See [the SQLite docs](https://www.sqlite.org/foreignkeys.html#fk_actions) for more information.
* **SQL Server**: When a referenced record is deleted or modified, an error is raised. See [the SQL Server docs](https://learn.microsoft.com/en-us/sql/relational-databases/tables/graph-edge-constraints?view=sql-server-ver15#on-delete-referential-actions-on-edge-constraints) for more information.
* **MongoDB**: When a record is modified or deleted, nothing is done to any related records.

<CalloutContainer type="warning">
  <CalloutDescription>
    If you are [managing relations in Prisma Client](/orm/prisma-schema/data-model/relations/relation-mode#emulate-relations-in-prisma-orm-with-the-prisma-relation-mode) rather than using foreign keys in the database, you should be aware that currently Prisma ORM only implements the referential actions. Foreign keys also create constraints, which make it impossible to manipulate data in a way that would violate these constraints: instead of executing the query, the database responds with an error. These constraints will not be created if you emulate referential integrity in Prisma Client, so if you set the referential action to `NoAction` there will be no checks to prevent you from breaking the referential integrity.
  </CalloutDescription>
</CalloutContainer>

Example usage [#example-usage-2]

```prisma title="schema.prisma" highlight=4;add showLineNumbers
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: NoAction, onUpdate: NoAction) // [!code ++]
  authorId Int
}

model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

**Result:** `User`s with posts cannot be deleted. The `User`'s `id` cannot be changed.

SetNull [#setnull]

* `onDelete: SetNull` The scalar field of the referencing object will be set to `NULL`.

* `onUpdate: SetNull` When updating the identifier of a referenced object, the scalar fields of the referencing objects will be set to `NULL`.

`SetNull` will only work on optional relations. On required relations, a runtime error will be thrown since the scalar fields cannot be null.

```prisma title="schema.prisma" highlight=4;add showLineNumbers
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User?  @relation(fields: [authorId], references: [id], onDelete: SetNull, onUpdate: SetNull) // [!code ++]
  authorId Int?
}

model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

**Result:** When deleting or updating a `User`, the `authorId` is set to `NULL` for all their posts.

SetDefault [#setdefault]

* `onDelete: SetDefault` The scalar field of the referencing object will be set to the fields default value.

* `onUpdate: SetDefault` The scalar field of the referencing object will be set to the fields default value.

These require setting a default for the relation scalar field with [`@default`](/orm/reference/prisma-schema-reference#default). If no defaults are provided for any of the scalar fields, a runtime error will be thrown.

```prisma title="schema.prisma" highlight=4,5;add showLineNumbers
model Post {
  id             Int     @id @default(autoincrement())
  title          String
  authorUsername String? @default("anonymous") // [!code ++]
  author         User?   @relation(fields: [authorUsername], references: [username], onDelete: SetDefault, onUpdate: SetDefault) // [!code ++]
}

model User {
  username String @id
  posts    Post[]
}
```

**Result:** When deleting or updating a `User`, their posts' `authorUsername` is set to the default value ('anonymous').

Special rules for SQL Server and MongoDB [#special-rules-for-sql-server-and-mongodb]

<CalloutContainer type="info">
  <CalloutTitle>
    Quick summary
  </CalloutTitle>

  <CalloutDescription>
    This section explains special rules and common issues when using referential actions with SQL Server and MongoDB, including how to avoid cycles and multiple cascade paths.
  </CalloutDescription>
</CalloutContainer>

**SQL Server** doesn't allow cascading referential actions if the relation chain causes a cycle or multiple cascade paths. The server will return an error when executing the SQL.

**MongoDB** requires `NoAction` for self-referential relations or cycles between three models to prevent infinite loops. MongoDB uses `relationMode = "prisma"` by default, meaning Prisma ORM manages [referential integrity](/orm/prisma-schema/data-model/relations/relation-mode).

Prisma ORM validates your data model *before* generating SQL, highlighting problematic relations to help you fix these issues early.

Self-relation (SQL Server and MongoDB) [#self-relation-sql-server-and-mongodb]

The following model describes a self-relation where an `Employee` can have a manager and managees, referencing entries of the same model.

```prisma
model Employee {
  id        Int        @id @default(autoincrement())
  manager   Employee?  @relation(name: "management", fields: [managerId], references: [id])
  managees  Employee[] @relation(name: "management")
  managerId Int?
}
```

This will result in the following error:

```bash wrap
Error parsing attribute "@relation": A self-relation must have `onDelete` and `onUpdate` referential actions set to `NoAction` in one of the @relation attributes. (Implicit default `onDelete`: `SetNull`, and `onUpdate`: `Cascade`)
```

By not defining any actions, Prisma ORM will use the following default values depending if the underlying [scalar fields](/orm/prisma-schema/data-model/models#scalar-fields) are set to be optional or required.

| Clause     | All of the scalar fields are optional | At least one scalar field is required |
| :--------- | :------------------------------------ | :------------------------------------ |
| `onDelete` | `SetNull`                             | `NoAction`                            |
| `onUpdate` | `Cascade`                             | `Cascade`                             |

Since the default referential action for `onUpdate` in the above relation would be `Cascade` and for `onDelete` it would be `SetNull`, it creates a cycle and the solution is to explicitly set the `onUpdate` and `onDelete` values to `NoAction`.

```prisma highlight=3;delete|4;add
model Employee {
  id        Int        @id @default(autoincrement())
  manager   Employee   @relation(name: "management", fields: [managerId], references: [id]) // [!code --]
  manager   Employee   @relation(name: "management", fields: [managerId], references: [id], onDelete: NoAction, onUpdate: NoAction) // [!code ++]
  managees  Employee[] @relation(name: "management")
  managerId Int
}
```

Cyclic relation between three tables (SQL Server and MongoDB) [#cyclic-relation-between-three-tables-sql-server-and-mongodb]

The following models describe a cyclic relation between a `Chicken`, an `Egg` and a `Fox`, where each model references the other.

```prisma
model Chicken {
  id        Int   @id @default(autoincrement())
  egg       Egg   @relation(fields: [eggId], references: [id])
  eggId     Int
  predators Fox[]
}

model Egg {
  id         Int       @id @default(autoincrement())
  predator   Fox       @relation(fields: [predatorId], references: [id])
  predatorId Int
  parents    Chicken[]
}

model Fox {
  id        Int     @id @default(autoincrement())
  meal      Chicken @relation(fields: [mealId], references: [id])
  mealId    Int
  foodStore Egg[]
}
```

This will result in validation errors indicating a cycle exists:

```bash wrap
Error parsing attribute "@relation": Reference causes a cycle. One of the @relation attributes in this cycle must have `onDelete` and `onUpdate` referential actions set to `NoAction`. Cycle path: Chicken.egg → Egg.predator → Fox.meal. (Implicit default `onUpdate`: `Cascade`)
```

Since the default `onUpdate` action is `Cascade`, it creates a cycle. Set `onUpdate: NoAction` on any one of the relations to break the cycle:

```prisma highlight=3;delete|4;add
model Chicken {
  id        Int   @id @default(autoincrement())
  egg       Egg   @relation(fields: [eggId], references: [id]) // [!code --]
  egg       Egg   @relation(fields: [eggId], references: [id], onUpdate: NoAction) // [!code ++]
  eggId     Int
  predators Fox[]
}
```

Multiple cascade paths between two models (SQL Server only) [#multiple-cascade-paths-between-two-models-sql-server-only]

The data model describes two different paths between same models, with both relations triggering cascading referential actions.

```prisma
model User {
  id       Int       @id @default(autoincrement())
  comments Comment[]
  posts    Post[]
}

model Post {
  id       Int       @id @default(autoincrement())
  authorId Int
  author   User      @relation(fields: [authorId], references: [id])
  comments Comment[]
}

model Comment {
  id          Int  @id @default(autoincrement())
  writtenById Int
  postId      Int
  writtenBy   User @relation(fields: [writtenById], references: [id])
  post        Post @relation(fields: [postId], references: [id])
}
```

There are two paths from `Comment` to `User`, and the default `onUpdate: Cascade` creates multiple cascade paths:

```bash wrap
Error parsing attribute "@relation": When any of the records in model `User` is updated or deleted, the referential actions on the relations cascade to model `Comment` through multiple paths. Please break one of these paths by setting the `onUpdate` and `onDelete` to `NoAction`. (Implicit default `onUpdate`: `Cascade`)
```

Set `onUpdate: NoAction` on any one of the relations to break the multiple cascade paths:

```prisma highlight=5;delete|6;add
model Comment {
  id          Int  @id @default(autoincrement())
  writtenById Int
  postId      Int
  writtenBy   User @relation(fields: [writtenById], references: [id]) // [!code --]
  writtenBy   User @relation(fields: [writtenById], references: [id], onUpdate: NoAction) // [!code ++]
  post        Post @relation(fields: [postId], references: [id])
}
```
# Database mapping (/docs/orm/prisma-schema/data-model/database-mapping)



The [Prisma schema](/orm/prisma-schema/overview) includes mechanisms that allow you to define names of certain database objects. You can:

* [Map model and field names to different collection/table and field/column names](#mapping-collectiontable-and-fieldcolumn-names)
* [Define constraint and index names](#constraint-and-index-names)

Mapping collection/table and field/column names [#mapping-collectiontable-and-fieldcolumn-names]

Sometimes the names used to describe entities in your database might not match the names you would prefer in your generated API. Mapping names in the Prisma schema allows you to influence the naming in your Client API without having to change the underlying database names.

A common approach for naming tables/collections in databases for example is to use plural form and [snake\_case](https://en.wikipedia.org/wiki/Snake_case) notation. However, we recommended a different [naming convention (singular form, PascalCase)](/orm/reference/prisma-schema-reference#naming-conventions).

`@map` and `@@map` allow you to [tune the shape of your Prisma Client API](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) by decoupling model and field names from table and column names in the underlying database.

Map collection / table names [#map-collection--table-names]

As an example, when you [introspect](/orm/prisma-schema/introspection) a database with a table named `comments`, the resulting Prisma model will look like this:

```prisma
model comments {
  // Fields
}
```

However, you can still choose `Comment` as the name of the model (e.g. to follow the naming convention) without renaming the underlying `comments` table in the database by using the [`@@map`](/orm/reference/prisma-schema-reference) attribute:

```prisma highlight=4;normal
model Comment {
  // Fields

  @@map("comments") // [!code highlight]
}
```

With this modified model definition, Prisma Client automatically maps the `Comment` model to the `comments` table in the underlying database.

Map field / column names [#map-field--column-names]

You can also [`@map`](/orm/reference/prisma-schema-reference#map) a column/field name:

```prisma highlight=2-4;normal
model Comment {
  content String @map("comment_text") // [!code highlight]
  email   String @map("commenter_email") // [!code highlight]
  type    Enum   @map("comment_type") // [!code highlight]

  @@map("comments")
}
```

This way the `comment_text` column is not available under `prisma.comment.comment_text` in the Prisma Client API, but can be accessed via `prisma.comment.content`.

Map enum names and values [#map-enum-names-and-values]

You can also `@map` an enum value, or `@@map` an enum:

```prisma highlight=3,5;normal
enum Type {
  Blog,
  Twitter @map("comment_twitter") // [!code highlight]

  @@map("comment_source_enum") // [!code highlight]
}
```

In this example:

* `@@map("comment_source_enum")` maps the enum name `Type` to `comment_source_enum` in the database
* `@map("comment_twitter")` maps the enum value `Twitter` to `comment_twitter` in the database

Effect on generated TypeScript [#effect-on-generated-typescript]

When you use `@map` on enum values, the generated TypeScript enum uses the **schema names**, not the mapped values:

```prisma
enum Status {
  PENDING  @map("pending")
  APPROVED @map("approved")
}
```

This generates the following TypeScript:

```ts
export const Status = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
} as const;
```

This means `Status.PENDING` evaluates to `"PENDING"`, not `"pending"`. The mapping is handled at the database level only.

Constraint and index names [#constraint-and-index-names]

You can optionally use the `map` argument to explicitly define the **underlying constraint and index names** in the Prisma schema for the attributes [`@id`](/orm/reference/prisma-schema-reference#id), [`@@id`](/orm/reference/prisma-schema-reference), [`@unique`](/orm/reference/prisma-schema-reference#unique), [`@@unique`](/orm/reference/prisma-schema-reference), [`@@index`](/orm/reference/prisma-schema-reference#index) and [`@relation`](/orm/reference/prisma-schema-reference#relation).

When introspecting a database, the `map` argument will *only* be rendered in the schema if the name *differs* from Prisma ORM's [default constraint naming convention for indexes and constraints](#prisma-orms-default-naming-conventions-for-indexes-and-constraints).

Use cases for named constraints [#use-cases-for-named-constraints]

Some use cases for explicitly named constraints include:

* Company policy
* Conventions of other tools

Prisma ORM's default naming conventions for indexes and constraints [#prisma-orms-default-naming-conventions-for-indexes-and-constraints]

Prisma ORM naming convention was chosen to align with PostgreSQL since it is deterministic. It also helps to maximize the amount of times where names do not need to be rendered because many databases out there they already align with the convention.

Prisma ORM always uses the database names of entities when generating the default index and constraint names. If a model is remapped to a different name in the data model via `@@map` or `@map`, the default name generation will still take the name of the *table* in the database as input. The same is true for fields and *columns*.

| Entity            | Convention                           | Example                        |
| ----------------- | ------------------------------------ | ------------------------------ |
| Primary Key       | \{tablename}\_pkey                   | `User_pkey`                    |
| Unique Constraint | \{tablename}\_\{column\_names}\_key  | `User_firstName_last_Name_key` |
| Non-Unique Index  | \{tablename}\_\{column\_names}\_idx  | `User_age_idx`                 |
| Foreign Key       | \{tablename}\_\{column\_names}\_fkey | `User_childName_fkey`          |

Since most databases have a length limit for entity names, the names will be trimmed if necessary to not violate the database limits. We will shorten the part before the `_suffix` as necessary so that the full name is at most the maximum length permitted.

Using default constraint names [#using-default-constraint-names]

When no explicit names are provided via `map` arguments Prisma ORM will generate index and constraint names following the [default naming convention](#prisma-orms-default-naming-conventions-for-indexes-and-constraints).

If you introspect a database the names for indexes and constraints will be added to your schema unless they follow Prisma ORM's naming convention. If they do, the names are not rendered to keep the schema more readable. When you migrate such a schema Prisma will infer the default names and persist them in the database.

Example [#example]

The following schema defines three constraints (`@id`, `@unique`, and `@relation`) and one index (`@@index`):

```prisma highlight=2,8,11,13;normal
model User {
  id    Int    @id @default(autoincrement()) // [!code highlight]
  name  String @unique
  posts Post[]
}

model Post {
  id         Int    @id @default(autoincrement()) // [!code highlight]
  title      String
  authorName String @default("Anonymous")
  author     User?  @relation(fields: [authorName], references: [name]) // [!code highlight]

  @@index([title, authorName]) // [!code highlight]
}
```

Since no explicit names are provided via `map` arguments Prisma will assume they follow our default naming convention.

The following table lists the name of each constraint and index in the underlying database:

| Constraint or index                | Follows convention | Underlying constraint or index names |
| ---------------------------------- | ------------------ | ------------------------------------ |
| `@id` (on `User` > `id` field)     | Yes                | `User_pk`                            |
| `@@index` (on `Post`)              | Yes                | `Post_title_authorName_idx`          |
| `@id` (on `Post` > `id` field)     | Yes                | `Post_pk`                            |
| `@relation` (on `Post` > `author`) | Yes                | `Post_authorName_fkey`               |

Using custom constraint / index names [#using-custom-constraint--index-names]

You can use the `map` argument to define **custom constraint and index names** in the underlying database.

Example [#example-1]

The following example adds custom names to one `@id` and the `@@index`:

```prisma highlight=2,13;normal
model User {
  id    Int    @id(map: "Custom_Primary_Key_Constraint_Name") @default(autoincrement()) // [!code highlight]
  name  String @unique
  posts Post[]
}

model Post {
  id         Int    @id @default(autoincrement()) // [!code highlight]
  title      String
  authorName String @default("Anonymous")
  author     User?  @relation(fields: [authorName], references: [name]) // [!code highlight]

  @@index([title, authorName], map: "My_Custom_Index_Name") // [!code highlight]
}
```

The following table lists the name of each constraint and index in the underlying database:

| Constraint or index                | Follows convention | Underlying constraint or index names |
| ---------------------------------- | ------------------ | ------------------------------------ |
| `@id` (on `User` > `id` field)     | No                 | `Custom_Primary_Key_Constraint_Name` |
| `@@index` (on `Post`)              | No                 | `My_Custom_Index_Name`               |
| `@id` (on `Post` > `id` field)     | Yes                | `Post_pk`                            |
| `@relation` (on `Post` > `author`) | Yes                | `Post_authorName_fkey`               |

Related: Naming indexes and primary keys for Prisma Client [#related-naming-indexes-and-primary-keys-for-prisma-client]

Additionally to `map`, the `@@id` and `@@unique` attributes take an optional `name` argument that allows you to customize your Prisma Client API.

On a model like:

```prisma
model User {
  firstName String
  lastName  String

  @@id([firstName, lastName])
}
```

the default API for selecting on that primary key uses a generated combination of the fields:

```ts
const user = await prisma.user.findUnique({
  where: {
    firstName_lastName: {
      firstName: "Paul",
      lastName: "Panther",
    },
  },
});
```

Specifying `@@id([firstName, lastName], name: "fullName")` will change the Prisma Client API to this instead:

```ts highlight=3;edit
const user = await prisma.user.findUnique({
  where: {
    fullName: {
      // [!code highlight]
      firstName: "Paul",
      lastName: "Panther",
    },
  },
});
```
# Indexes (/docs/orm/prisma-schema/data-model/indexes)



Prisma ORM allows configuration of database indexes, unique constraints and primary key constraints. Full text indexes in MySQL and MongoDB are available through the `fullTextIndex` preview feature using the `@@fulltext` attribute.

Index configuration [#index-configuration]

You can configure indexes, unique constraints, and primary key constraints with the following attribute arguments:

* The [`length` argument](#configuring-the-length-of-indexes-with-length-mysql) allows you to specify a maximum length for the subpart of the value to be indexed on `String` and `Bytes` types
  * Available on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes
  * MySQL only

* The [`sort` argument](#configuring-the-index-sort-order-with-sort) allows you to specify the order that the entries of the constraint or index are stored in the database
  * Available on the `@unique`, `@@unique` and `@@index` attributes in all databases, and on the `@id` and `@@id` attributes in SQL Server

* The [`type` argument](#configuring-the-access-type-of-indexes-with-type-postgresql) allows you to support index access methods other than PostgreSQL's default `BTree` access method
  * Available on the `@@index` attribute
  * PostgreSQL only
  * Supported index access methods: `Hash`, `Gist`, `Gin`, `SpGist` and `Brin`

* The [`clustered` argument](#configuring-if-indexes-are-clustered-or-non-clustered-with-clustered-sql-server) allows you to configure whether a constraint or index is clustered or non-clustered
  * Available on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes
  * SQL Server only

* The [`map` argument](#configuring-the-name-of-indexes-with-map) allows you to specify a custom name for the index or constraint in the underlying database
  * Available on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes
  * Supported in all databases

Configuring the length of indexes with length (MySQL) [#configuring-the-length-of-indexes-with-length-mysql]

The `length` argument is specific to MySQL and allows you to define indexes and constraints on columns of `String` and `Byte` types. For these types, MySQL requires you to specify a maximum length for the subpart of the value to be indexed in cases where the full value would exceed MySQL's limits for index sizes. See [the MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-limits.html) for more details.

The `length` argument is available on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes.

As an example, the following data model declares an `id` field with a maximum length of 3000 characters:

```prisma title="schema.prisma" showLineNumbers
model Id {
  id String @id @db.VarChar(3000)
}
```

This is not valid in MySQL because it exceeds MySQL's index storage limit and therefore Prisma ORM rejects the data model. The generated SQL would be rejected by the database.

```sql
CREATE TABLE `Id` (
  `id` VARCHAR(3000) PRIMARY KEY
)
```

The `length` argument allows you to specify that only a subpart of the `id` value represents the primary key. In the example below, the first 100 characters are used:

```prisma title="schema.prisma" showLineNumbers
model Id {
  id String @id(length: 100) @db.VarChar(3000)
}
```

Prisma Migrate is able to create constraints and indexes with the `length` argument if specified in your data model. This means that you can create indexes and constraints on values of Prisma schema type `Byte` and `String`. If you don't specify the argument the index is treated as covering the full value as before.

Introspection will fetch these limits where they are present in your existing database. This allows Prisma ORM to support indexes and constraints that were previously suppressed and results in better support of MySQL databases utilizing this feature.

The `length` argument can also be used on compound primary keys, using the `@@id` attribute, as in the example below:

```prisma title="schema.prisma" showLineNumbers
model CompoundId {
  id_1 String @db.VarChar(3000)
  id_2 String @db.VarChar(3000)

  @@id([id_1(length: 100), id_2(length: 10)])
}
```

A similar syntax can be used for the `@@unique` and `@@index` attributes.

Configuring the index sort order with sort [#configuring-the-index-sort-order-with-sort]

The `sort` argument allows you to specify the order that the entries of the index or constraint are stored in the database. This can have an effect on whether the database is able to use an index for specific queries. The behavior and support varies by database:

* In MySQL/MariaDB, you can specify sort order (`ASC`/`DESC`) directly in unique constraints and indexes
* In PostgreSQL, sort order can only be specified on indexes, not on unique constraints
* In SQL Server, sort order is supported on all constraints and indexes including `@id` and `@@id`

For example, in MySQL/MariaDB, the following table using a descending unique constraint:

```sql
CREATE TABLE `Unique` (
  `unique` INT,
  CONSTRAINT `Unique_unique_key` UNIQUE (`unique` DESC)
)
```

would be introspected as

```prisma title="schema.prisma" showLineNumbers
model Unique {
  unique Int @unique(sort: Desc)
}
```

Note that in PostgreSQL, while you cannot specify sort order on unique constraints directly, you can create a unique index with a sort order that will enforce uniqueness:

```sql
-- PostgreSQL approach
CREATE UNIQUE INDEX "unique_index_desc" ON "Unique" ("unique" DESC);
```

The `sort` argument can also be used on compound indexes:

```prisma title="schema.prisma" showLineNumbers
model CompoundUnique {
  unique_1 Int
  unique_2 Int

  @@unique([unique_1(sort: Desc), unique_2])
}
```

Example: using sort and length together [#example-using-sort-and-length-together]

The following example demonstrates the use of the `sort` and `length` arguments to configure indexes and constraints for a `Post` model:

```prisma title="schema.prisma" showLineNumbers
model Post {
  title      String   @db.VarChar(300)
  abstract   String   @db.VarChar(3000)
  slug       String   @unique(sort: Desc, length: 42) @db.VarChar(3000)
  author     String
  created_at DateTime

  @@id([title(length: 100, sort: Desc), abstract(length: 10)])
  @@index([author, created_at(sort: Desc)])
}
```

Configuring the access type of indexes with type (PostgreSQL) [#configuring-the-access-type-of-indexes-with-type-postgresql]

The `type` argument is available for configuring the index type in PostgreSQL with the `@@index` attribute. The index access methods available are `Hash`, `Gist`, `Gin`, `SpGist` and `Brin`, as well as the default `BTree` index access method.

Hash [#hash]

The `Hash` type will store the index data in a format that is much faster to search and insert, and that will use less disk space. However, only the `=` and `<>` comparisons can use the index, so other comparison operators such as `<` and `>` will be much slower with `Hash` than when using the default `BTree` type.

As an example, the following model adds an index with a `type` of `Hash` to the `value` field:

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int @id
  value Int

  @@index([value], type: Hash)
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE "Example" (
  id INT PRIMARY KEY,
  value INT NOT NULL
);

CREATE INDEX "Example_value_idx" ON "Example" USING HASH (value);
```

Generalized Inverted Index (GIN) [#generalized-inverted-index-gin]

The GIN index stores composite values, such as arrays or `JsonB` data. This is useful for speeding up querying whether one object is part of another object. It is commonly used for full-text searches.

An indexed field can define the operator class, which defines the operators handled by the index.

<CalloutContainer type="warning">
  <CalloutDescription>
    Indexes using a function (such as `to_tsvector`) to determine the indexed value are not yet supported by Prisma ORM. Indexes defined in this way will not be visible with `prisma db pull`.
  </CalloutDescription>
</CalloutContainer>

As an example, the following model adds a `Gin` index to the `value` field, with `JsonbPathOps` as the class of operators allowed to use the index:

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int  @id
  value Json
  //    ^ field type matching the operator class

  @@index([value(ops: JsonbPathOps)], type: Gin)
  //                  ^ operator class      ^ index type
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE "Example" (
  id INT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX "Example_value_idx" ON "Example" USING GIN (value jsonb_path_ops);
```

As part of the `JsonbPathOps` the `@>` operator is handled by the index, speeding up queries such as `value @> '{"foo": 2}'`.

Supported Operator Classes for GIN [#supported-operator-classes-for-gin]

Prisma ORM generally supports operator classes provided by PostgreSQL in versions 10 and later. If the operator class requires the field type to be of a type Prisma ORM does not yet support, using the `raw` function with a string input allows you to use these operator classes without validation.

The default operator class (marked with ✅) can be omitted from the index definition.

| Operator class | Allowed field type (native types) | Default | Other                         |
| -------------- | --------------------------------- | ------- | ----------------------------- |
| `ArrayOps`     | Any array                         | ✅       | Also available in CockroachDB |
| `JsonbOps`     | `Json` (`@db.JsonB`)              | ✅       | Also available in CockroachDB |
| `JsonbPathOps` | `Json` (`@db.JsonB`)              |         |                               |
| `raw("other")` |                                   |         |                               |

Read more about built-in operator classes in the [official PostgreSQL documentation](https://www.postgresql.org/docs/14/gin-builtin-opclasses.html).

CockroachDB [#cockroachdb]

GIN and BTree are the only index types supported by CockroachDB. The operator classes marked to work with CockroachDB are the only ones allowed on that database and supported by Prisma ORM. The operator class cannot be defined in the Prisma Schema Language: the `ops` argument is not necessary or allowed on CockroachDB.

Generalized Search Tree (GiST) [#generalized-search-tree-gist]

The GiST index type is used for implementing indexing schemes for user-defined types. By default there are not many direct uses for GiST indexes, but for example the B-Tree index type is built using a GiST index.

As an example, the following model adds a `Gist` index to the `value` field with `InetOps` as the operators that will be using the index:

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int    @id
  value String @db.Inet
  //           ^ native type matching the operator class
  //                                   ^ index type
  //                  ^ operator class

  @@index([value(ops: InetOps)], type: Gist)
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE "Example" (
  id INT PRIMARY KEY,
  value INET NOT NULL
);

CREATE INDEX "Example_value_idx" ON "Example" USING GIST (value inet_ops);
```

Queries comparing IP addresses, such as `value > '10.0.0.2'`, will use the index.

Supported Operator Classes for GiST [#supported-operator-classes-for-gist]

Prisma ORM generally supports operator classes provided by PostgreSQL in versions 10 and later. If the operator class requires the field type to be of a type Prisma ORM does not yet support, using the `raw` function with a string input allows you to use these operator classes without validation.

| Operator class | Allowed field type (allowed native types) |
| -------------- | ----------------------------------------- |
| `InetOps`      | `String` (`@db.Inet`)                     |
| `raw("other")` |                                           |

Read more about built-in operator classes in the [official PostgreSQL documentation](https://www.postgresql.org/docs/14/gist-builtin-opclasses.html).

Space-Partitioned GiST (SP-GiST) [#space-partitioned-gist-sp-gist]

The SP-GiST index is a good choice for many different non-balanced data structures. If the query matches the partitioning rule, it can be very fast.

As with GiST, SP-GiST is important as a building block for user-defined types, allowing implementation of custom search operators directly with the database.

As an example, the following model adds a `SpGist` index to the `value` field with `TextOps` as the operators using the index:

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int    @id
  value String
  //    ^ field type matching the operator class

  @@index([value], type: SpGist)
  //                     ^ index type
  //       ^ using the default ops: TextOps
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE "Example" (
  id INT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX "Example_value_idx" ON "Example" USING SPGIST (value);
```

Queries such as `value LIKE 'something%'` will be sped up by the index.

Supported Operator Classes for SP-GiST [#supported-operator-classes-for-sp-gist]

Prisma ORM generally supports operator classes provided by PostgreSQL in versions 10 and later. If the operator class requires the field type to be of a type Prisma ORM does not yet support, using the `raw` function with a string input allows you to use these operator classes without validation.

The default operator class (marked with ✅) can be omitted from the index definition.

| Operator class | Allowed field type (native types)    | Default | Supported PostgreSQL versions |
| -------------- | ------------------------------------ | ------- | ----------------------------- |
| `InetOps`      | `String` (`@db.Inet`)                | ✅       | 10+                           |
| `TextOps`      | `String` (`@db.Text`, `@db.VarChar`) | ✅       |                               |
| `raw("other")` |                                      |         |                               |

Read more about built-in operator classes from [official PostgreSQL documentation](https://www.postgresql.org/docs/14/spgist-builtin-opclasses.html).

Block Range Index (BRIN) [#block-range-index-brin]

The BRIN index type is useful if you have lots of data that does not change after it is inserted, such as date and time values. If your data is a good fit for the index, it can store large datasets in a minimal space.

As an example, the following model adds a `Brin` index to the `value` field with `Int4BloomOps` as the operators that will be using the index:

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int @id
  value Int
  //    ^ field type matching the operator class

  @@index([value(ops: Int4BloomOps)], type: Brin)
  //                  ^ operator class      ^ index type
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE "Example" (
  id INT PRIMARY KEY,
  value INT4 NOT NULL
);

CREATE INDEX "Example_value_idx" ON "Example" USING BRIN (value int4_bloom_ops);
```

Queries like `value = 2` will now use the index, which uses a fraction of the space used by the `BTree` or `Hash` indexes.

Supported Operator Classes for BRIN [#supported-operator-classes-for-brin]

Prisma ORM generally supports operator classes provided by PostgreSQL in versions 10 and later, and some supported operators are only available from PostgreSQL versions 14 and later. If the operator class requires the field type to be of a type Prisma ORM does not yet support, using the `raw` function with a string input allows you to use these operator classes without validation.

The default operator class (marked with ✅) can be omitted from the index definition.

| Operator class              | Allowed field type (native types)    | Default | Supported PostgreSQL versions |
| --------------------------- | ------------------------------------ | ------- | ----------------------------- |
| `BitMinMaxOps`              | `String` (`@db.Bit`)                 | ✅       |                               |
| `VarBitMinMaxOps`           | `String` (`@db.VarBit`)              | ✅       |                               |
| `BpcharBloomOps`            | `String` (`@db.Char`)                |         | 14+                           |
| `BpcharMinMaxOps`           | `String` (`@db.Char`)                | ✅       |                               |
| `ByteaBloomOps`             | `Bytes` (`@db.Bytea`)                |         | 14+                           |
| `ByteaMinMaxOps`            | `Bytes` (`@db.Bytea`)                | ✅       |                               |
| `DateBloomOps`              | `DateTime` (`@db.Date`)              |         | 14+                           |
| `DateMinMaxOps`             | `DateTime` (`@db.Date`)              | ✅       |                               |
| `DateMinMaxMultiOps`        | `DateTime` (`@db.Date`)              |         | 14+                           |
| `Float4BloomOps`            | `Float` (`@db.Real`)                 |         | 14+                           |
| `Float4MinMaxOps`           | `Float` (`@db.Real`)                 | ✅       |                               |
| `Float4MinMaxMultiOps`      | `Float` (`@db.Real`)                 |         | 14+                           |
| `Float8BloomOps`            | `Float` (`@db.DoublePrecision`)      |         | 14+                           |
| `Float8MinMaxOps`           | `Float` (`@db.DoublePrecision`)      | ✅       |                               |
| `Float8MinMaxMultiOps`      | `Float` (`@db.DoublePrecision`)      |         | 14+                           |
| `InetInclusionOps`          | `String` (`@db.Inet`)                | ✅       | 14+                           |
| `InetBloomOps`              | `String` (`@db.Inet`)                |         | 14+                           |
| `InetMinMaxOps`             | `String` (`@db.Inet`)                |         |                               |
| `InetMinMaxMultiOps`        | `String` (`@db.Inet`)                |         | 14+                           |
| `Int2BloomOps`              | `Int` (`@db.SmallInt`)               |         | 14+                           |
| `Int2MinMaxOps`             | `Int` (`@db.SmallInt`)               | ✅       |                               |
| `Int2MinMaxMultiOps`        | `Int` (`@db.SmallInt`)               |         | 14+                           |
| `Int4BloomOps`              | `Int` (`@db.Integer`)                |         | 14+                           |
| `Int4MinMaxOps`             | `Int` (`@db.Integer`)                | ✅       |                               |
| `Int4MinMaxMultiOps`        | `Int` (`@db.Integer`)                |         | 14+                           |
| `Int8BloomOps`              | `BigInt` (`@db.BigInt`)              |         | 14+                           |
| `Int8MinMaxOps`             | `BigInt` (`@db.BigInt`)              | ✅       |                               |
| `Int8MinMaxMultiOps`        | `BigInt` (`@db.BigInt`)              |         | 14+                           |
| `NumericBloomOps`           | `Decimal` (`@db.Decimal`)            |         | 14+                           |
| `NumericMinMaxOps`          | `Decimal` (`@db.Decimal`)            | ✅       |                               |
| `NumericMinMaxMultiOps`     | `Decimal` (`@db.Decimal`)            |         | 14+                           |
| `OidBloomOps`               | `Int` (`@db.Oid`)                    |         | 14+                           |
| `OidMinMaxOps`              | `Int` (`@db.Oid`)                    | ✅       |                               |
| `OidMinMaxMultiOps`         | `Int` (`@db.Oid`)                    |         | 14+                           |
| `TextBloomOps`              | `String` (`@db.Text`, `@db.VarChar`) |         | 14+                           |
| `TextMinMaxOps`             | `String` (`@db.Text`, `@db.VarChar`) | ✅       |                               |
| `TextMinMaxMultiOps`        | `String` (`@db.Text`, `@db.VarChar`) |         | 14+                           |
| `TimestampBloomOps`         | `DateTime` (`@db.Timestamp`)         |         | 14+                           |
| `TimestampMinMaxOps`        | `DateTime` (`@db.Timestamp`)         | ✅       |                               |
| `TimestampMinMaxMultiOps`   | `DateTime` (`@db.Timestamp`)         |         | 14+                           |
| `TimestampTzBloomOps`       | `DateTime` (`@db.Timestamptz`)       |         | 14+                           |
| `TimestampTzMinMaxOps`      | `DateTime` (`@db.Timestamptz`)       | ✅       |                               |
| `TimestampTzMinMaxMultiOps` | `DateTime` (`@db.Timestamptz`)       |         | 14+                           |
| `TimeBloomOps`              | `DateTime` (`@db.Time`)              |         | 14+                           |
| `TimeMinMaxOps`             | `DateTime` (`@db.Time`)              | ✅       |                               |
| `TimeMinMaxMultiOps`        | `DateTime` (`@db.Time`)              |         | 14+                           |
| `TimeTzBloomOps`            | `DateTime` (`@db.Timetz`)            |         | 14+                           |
| `TimeTzMinMaxOps`           | `DateTime` (`@db.Timetz`)            | ✅       |                               |
| `TimeTzMinMaxMultiOps`      | `DateTime` (`@db.Timetz`)            |         | 14+                           |
| `UuidBloomOps`              | `String` (`@db.Uuid`)                |         | 14+                           |
| `UuidMinMaxOps`             | `String` (`@db.Uuid`)                | ✅       |                               |
| `UuidMinMaxMultiOps`        | `String` (`@db.Uuid`)                |         | 14+                           |
| `raw("other")`              |                                      |         |                               |

Read more about built-in operator classes in the [official PostgreSQL documentation](https://www.postgresql.org/docs/14/brin-builtin-opclasses.html).

Configuring if indexes are clustered or non-clustered with clustered (SQL Server) [#configuring-if-indexes-are-clustered-or-non-clustered-with-clustered-sql-server]

The `clustered` argument is available to configure (non)clustered indexes in SQL Server. It can be used on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes.

As an example, the following model configures the `@id` to be non-clustered (instead of the clustered default):

```prisma title="schema.prisma" showLineNumbers
model Example {
  id    Int @id(clustered: false)
  value Int
}
```

This translates to the following SQL commands:

```sql
CREATE TABLE [Example] (
  id INT NOT NULL,
  value INT,
  CONSTRAINT [Example_pkey] PRIMARY KEY NONCLUSTERED (id)
)
```

The default value of `clustered` for each attribute is as follows:

| Attribute  | Value   |
| ---------- | ------- |
| `@id`      | `true`  |
| `@@id`     | `true`  |
| `@unique`  | `false` |
| `@@unique` | `false` |
| `@@index`  | `false` |

A table can have at most one clustered index.

Configuring the name of indexes with map [#configuring-the-name-of-indexes-with-map]

The `map` argument allows you to specify a custom name for the index or constraint in the underlying database. This is useful when you want to use a specific naming convention or when the auto-generated name doesn't meet your requirements.

The `map` argument is available on the `@id`, `@@id`, `@unique`, `@@unique` and `@@index` attributes.

As an example, the following model configures a custom name for the index on the `title` field:

```prisma title="schema.prisma" showLineNumbers
model Post {
  id    Int    @id
  title String

  @@index([title], map: "my_custom_index_name")
}
```

This translates to the following SQL command (PostgreSQL example):

```sql
CREATE INDEX "my_custom_index_name" ON "Post" ("title");
```

Without the `map` argument, Prisma would generate a default name like `Post_title_idx`.

The `map` argument can also be used on unique constraints:

```prisma title="schema.prisma" showLineNumbers
model User {
  id    Int    @id
  email String @unique(map: "unique_user_email")
}
```

And on composite indexes and constraints:

```prisma title="schema.prisma" showLineNumbers
model Post {
  id        Int    @id
  title     String
  author    String
  createdAt DateTime

  @@index([author, createdAt], map: "posts_author_date_idx")
  @@unique([title, author], map: "posts_title_author_unique")
}
```

Configuring partial indexes with where [#configuring-partial-indexes-with-where]

The `where` argument allows you to define [partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html) (also known as filtered indexes). A partial index only includes rows that match a specified condition, which reduces the index size and improves both write performance and query performance for the indexed subset of data.

The `where` argument is available on the `@unique`, `@@unique` and `@@index` attributes. It requires the `partialIndexes` Preview feature.

<CalloutContainer type="info">
  <CalloutDescription>
    Partial indexes are supported on **PostgreSQL**, **SQLite**, **SQL Server**, and **CockroachDB**. They are **not** supported on MySQL.
  </CalloutDescription>
</CalloutContainer>

Enabling the partialIndexes Preview feature [#enabling-the-partialindexes-preview-feature]

To use partial indexes, add the `partialIndexes` feature flag to the `generator` block of your `schema.prisma` file:

```prisma title="schema.prisma" showLineNumbers
generator client {
  provider        = "prisma-client"
  output          = "./generated"
  previewFeatures = ["partialIndexes"]
}
```

Raw SQL syntax with raw() [#raw-sql-syntax-with-raw]

You can define a partial index with a raw SQL predicate string using the `raw()` function. This approach supports any valid SQL `WHERE` expression that your database accepts:

```prisma title="schema.prisma" showLineNumbers
model User {
  id        Int       @id
  email     String
  status    String
  deletedAt DateTime?

  @@unique([email], where: raw("status = 'active'"))
  @@index([email], where: raw("\"deletedAt\" IS NULL"))
}
```

This generates SQL like:

**PostgreSQL:**

```sql
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email") WHERE (status = 'active');
CREATE INDEX "User_email_idx" ON "User" ("email") WHERE ("deletedAt" IS NULL);
```

**SQLite:**

```sql
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email") WHERE status = 'active';
CREATE INDEX "User_email_idx" ON "User" ("email") WHERE "deletedAt" IS NULL;
```

**SQL Server:**

```sql
CREATE UNIQUE NONCLUSTERED INDEX [User_email_key] ON [dbo].[User]([email]) WHERE ([status]='active');
CREATE NONCLUSTERED INDEX [User_email_idx] ON [dbo].[User]([email]) WHERE ([deletedAt] IS NULL);
```

The `raw()` syntax can be used with any SQL expression your database supports, making it the most flexible option.

Object literal syntax (type-safe alternative) [#object-literal-syntax-type-safe-alternative]

You can also define partial indexes using an object literal syntax, which provides type-safety by validating field names and value types against your Prisma schema:

```prisma title="schema.prisma" showLineNumbers
model Post {
  id        Int      @id
  title     String
  published Boolean

  @@index([title], where: { published: true })
  @@unique([title], where: { published: true })
}
```

The object literal syntax supports the following value types:

| Value type       | Example                                  | Notes                                                  |
| ---------------- | ---------------------------------------- | ------------------------------------------------------ |
| `Boolean`        | `{ active: true }`, `{ deleted: false }` | For `Boolean` fields                                   |
| `String`         | `{ status: "active" }`                   | For `String`, `DateTime`, and `Enum` fields            |
| `Number`         | `{ priority: 1 }`, `{ score: 1.5 }`      | For `Int`, `BigInt`, `Float`, and `Decimal` fields     |
| `null`           | `{ deletedAt: null }`                    | Translates to `IS NULL`. Works with any nullable field |
| `{ not: value }` | `{ deletedAt: { not: null } }`           | Negation. Translates to `IS NOT NULL` or `!= value`    |

You can combine multiple conditions in a single object:

```prisma title="schema.prisma" showLineNumbers
model User {
  id        Int       @id
  email     String
  active    Boolean
  deletedAt DateTime?

  @@unique([email], where: { active: true, deletedAt: null })
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    The object literal syntax validates field types. For example, you cannot use a `Boolean` value for a `String` field. For fields with types that are not supported by the object syntax (such as `Unsupported` or composite types), use `raw()` instead.
  </CalloutDescription>
</CalloutContainer>

Using where with other index arguments [#using-where-with-other-index-arguments]

The `where` argument can be combined with other index arguments such as `name` and `map`:

```prisma title="schema.prisma" showLineNumbers
model User {
  id     Int    @id
  email  String
  status String

  @@unique([email], name: "email_active_unique", map: "idx_email_active", where: raw("status = 'active'"))
}
```

Database-specific behavior [#database-specific-behavior]

| Database    | Migrations    | Introspection | Notes                                                                  |
| ----------- | ------------- | ------------- | ---------------------------------------------------------------------- |
| PostgreSQL  | Full support  | Full support  | Full predicate support                                                 |
| SQLite      | Full support  | Full support  | Full predicate support                                                 |
| SQL Server  | Full support  | Full support  | Filtered indexes via `CREATE INDEX`                                    |
| CockroachDB | Create only   | Not supported | Cannot introspect predicate text; predicate modifications not detected |
| MySQL       | Not supported | Not supported | Partial indexes are not supported by the database                      |

<CalloutContainer type="warning">
  <CalloutDescription>
    **CockroachDB limitation**: CockroachDB supports creating partial indexes, but it cannot introspect the predicate text from existing indexes. This means that after initial creation, modifications to the `where` clause (adding, changing, or removing a predicate) will not be detected by Prisma Migrate. The differ skips predicate comparison for CockroachDB to prevent false-positive migrations.
  </CalloutDescription>
</CalloutContainer>

Introspection [#introspection]

When you run `prisma db pull` on a database that contains partial indexes, Prisma ORM will:

1. Automatically add `"partialIndexes"` to the `previewFeatures` list in your generator block
2. Represent the partial index predicate using the `raw()` syntax with the database's normalized form of the SQL expression

For example, a PostgreSQL partial unique index on a single field will be introspected as:

```prisma title="schema.prisma" showLineNumbers
model User {
  id     Int    @id
  email  String @unique(where: raw("(status = 'active'::text)"))
  status String
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    The introspected `raw()` string reflects the database's normalized form of the SQL expression, which may differ from what you originally wrote. For example, PostgreSQL adds parentheses and explicit type casts (e.g., `'active'::text`), SQL Server wraps column names in brackets and adds parentheses (e.g., `([status]='active')`), while SQLite generally preserves the original expression as-is.
  </CalloutDescription>
</CalloutContainer>

Full text indexes (MySQL and MongoDB) [#full-text-indexes-mysql-and-mongodb]

The `fullTextIndex` preview feature provides support for introspection and migration of full text indexes in MySQL and MongoDB. This can be configured using the `@@fulltext` attribute. Existing full text indexes in the database are added to your Prisma schema after introspecting with `db pull`, and new full text indexes added in the Prisma schema are created in the database when using Prisma Migrate.

<CalloutContainer type="warning">
  <CalloutDescription>
    For now we do not enable the full text search commands in Prisma Client for MongoDB; the progress can be followed in the [MongoDB](https://github.com/prisma/prisma/issues/9413) issue.
  </CalloutDescription>
</CalloutContainer>

Enabling the fullTextIndex preview feature [#enabling-the-fulltextindex-preview-feature]

To enable the `fullTextIndex` preview feature, add the `fullTextIndex` feature flag to the `generator` block of the `schema.prisma` file:

```prisma title="schema.prisma" showLineNumbers
generator client {
  provider        = "prisma-client"
  output          = "./generated"
  previewFeatures = ["fullTextIndex"]
}
```

Examples [#examples]

The following example demonstrates adding a `@@fulltext` index to the `title` and `content` fields of a `Post` model:

```prisma title="schema.prisma" showLineNumbers
model Post {
  id      Int    @id
  title   String @db.VarChar(255)
  content String @db.Text

  @@fulltext([title, content])
}
```

On MongoDB, you can use the `@@fulltext` index attribute (via the `fullTextIndex` preview feature) with the `sort` argument to add fields to your full-text index in ascending or descending order. The following example adds a `@@fulltext` index to the `title` and `content` fields of the `Post` model, and sorts the `title` field in descending order:

```prisma title="schema.prisma" showLineNumbers
generator js {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextIndex"]
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Post {
  id      String @id @map("_id") @db.ObjectId
  title   String
  content String

  @@fulltext([title(sort: Desc), content])
}
```
# Introduction to Prisma Client (/docs/orm/prisma-client/setup-and-configuration/introduction)



Prisma Client is an auto-generated and type-safe query builder that's *tailored* to your data. The easiest way to get started with Prisma Client is by following the **[Quickstart](/prisma-orm/quickstart/sqlite)**.

[Quickstart (5 min)](/prisma-orm/quickstart/sqlite)

Prerequisites [#prerequisites]

In order to set up Prisma Client, you need a Prisma Config and a [Prisma schema file](/orm/prisma-schema/overview):

<CodeBlockTabs defaultValue="Prisma Config">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Prisma Config">
      Prisma Config
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Prisma Schema">
      Prisma Schema
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Prisma Config">
    ```ts title="prisma.config.ts" 
    import 'dotenv/config';
    import { defineConfig, env } from 'prisma/config';

    export default defineConfig({
      schema: './prisma/schema.prisma',
      datasource: {
        url: env('DATABASE_URL'),
      },
    });
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Prisma Schema">
    ```prisma title="schema.prisma" 
    datasource db {
      provider = "postgresql"
    }

    generator client {
      provider = "prisma-client"
      output   = "../src/generated/prisma"
    }

    model User {
      id        Int      @id @default(autoincrement())
      createdAt DateTime @default(now())
      email     String   @unique
      name      String?
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Installation [#installation]

[Install the Prisma CLI](/orm/reference/prisma-cli-reference), the Prisma Client library, and the [driver adapter](/orm/core-concepts/supported-databases/database-drivers) for your database:

<CodeBlockTabs defaultValue="PostgreSQL">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="PostgreSQL">
      PostgreSQL
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MySQL / MariaDB">
      MySQL / MariaDB
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="SQLite">
      SQLite
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="PostgreSQL">
    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install prisma --save-dev
        npm install @prisma/client @prisma/adapter-pg pg
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add prisma --save-dev
        pnpm add @prisma/client @prisma/adapter-pg pg
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add prisma --dev
        yarn add @prisma/client @prisma/adapter-pg pg
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add prisma --dev
        bun add @prisma/client @prisma/adapter-pg pg
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </CodeBlockTab>

  <CodeBlockTab value="MySQL / MariaDB">
    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install prisma --save-dev
        npm install @prisma/client @prisma/adapter-mariadb mariadb
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add prisma --save-dev
        pnpm add @prisma/client @prisma/adapter-mariadb mariadb
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add prisma --dev
        yarn add @prisma/client @prisma/adapter-mariadb mariadb
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add prisma --dev
        bun add @prisma/client @prisma/adapter-mariadb mariadb
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </CodeBlockTab>

  <CodeBlockTab value="SQLite">
    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install prisma --save-dev
        npm install @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add prisma --save-dev
        pnpm add @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add prisma --dev
        yarn add @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add prisma --dev
        bun add @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    Prisma 7 requires a [driver adapter](/orm/core-concepts/supported-databases/database-drivers) to connect to your database. Make sure your `package.json` includes `"type": "module"` for ESM support. See the [upgrade guide](/guides/upgrade-prisma-orm/v7) for details.
  </CalloutDescription>
</CalloutContainer>

Generate the Client API [#generate-the-client-api]

Prisma Client is based on the models in Prisma Schema. To provide the correct types, you need generate the client code:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will create a `generated` directory based on where you set the `output` to in the Prisma Schema. Any time your import Prisma Client, it will need to come from this generated client API.

Importing Prisma Client [#importing-prisma-client]

With the client generated, import it along with your [driver adapter](/orm/core-concepts/supported-databases/database-drivers) and create a new instance:

<CodeBlockTabs defaultValue="PostgreSQL">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="PostgreSQL">
      PostgreSQL
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MySQL / MariaDB">
      MySQL / MariaDB
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="SQLite">
      SQLite
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="PostgreSQL (Edge)">
      PostgreSQL (Edge)
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="PostgreSQL">
    ```ts
    import { PrismaClient } from "./path/to/generated/prisma";
    import { PrismaPg } from "@prisma/adapter-pg";

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    export const prisma = new PrismaClient({ adapter });
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MySQL / MariaDB">
    ```ts
    import { PrismaClient } from "./path/to/generated/prisma";
    import { PrismaMariaDb } from "@prisma/adapter-mariadb";

    const adapter = new PrismaMariaDb({
      host: "localhost",
      user: "root",
      database: "mydb",
    });

    export const prisma = new PrismaClient({ adapter });
    ```
  </CodeBlockTab>

  <CodeBlockTab value="SQLite">
    ```ts
    import { PrismaClient } from "./path/to/generated/prisma";
    import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

    const adapter = new PrismaBetterSQLite3({
      url: "file:./dev.db",
    });

    export const prisma = new PrismaClient({ adapter });
    ```
  </CodeBlockTab>

  <CodeBlockTab value="PostgreSQL (Edge)">
    ```ts
    import { PrismaClient } from "./path/to/generated/prisma/edge";
    import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

    const adapter = new PrismaPostgresAdapter({
      connectionString: process.env.DATABASE_URL!,
    });

    export const prisma = new PrismaClient({ adapter });
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="warning">
  <CalloutDescription>
    `PrismaClient` requires a driver adapter in Prisma 7. Calling `new PrismaClient()` without an `adapter` will result in an error.
  </CalloutDescription>
</CalloutContainer>

Find out what [driver adapter](/orm/core-concepts/supported-databases/database-drivers) is needed for your database.

Your application should generally only create **one instance** of `PrismaClient`. How to achieve this depends on whether you are using Prisma ORM in a [long-running application](/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications) or in a [serverless environment](/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-serverless-environments).

Creating multiple instances of `PrismaClient` will create multiple connection pools and can hit the connection limit for your database. Too many connections may start to **slow down your database** and eventually lead to errors such as:

```bash
Error in connector: Error querying the database: db error: FATAL: sorry, too many clients already
   at PrismaClientFetcher.request
```

Use Prisma Client to send queries to your database [#use-prisma-client-to-send-queries-to-your-database]

Once you have instantiated `PrismaClient`, you can start sending queries in your code:

```ts
// run inside `async` function
const newUser = await prisma.user.create({
  data: {
    name: "Alice",
    email: "alice@prisma.io",
  },
});

const users = await prisma.user.findMany();
```

Evolving your application [#evolving-your-application]

Whenever you make changes to your database that are reflected in the Prisma schema, you need to manually re-generate Prisma Client to update the generated code in your output directory:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma generate
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma generate
    ```
  </CodeBlockTab>
</CodeBlockTabs>
# Database connections (/docs/orm/prisma-client/setup-and-configuration/databases-connections)



Databases can handle a limited number of concurrent connections. Each connection requires RAM, which means that simply increasing the database connection limit without scaling available resources:

* ✔ might allow more processes to connect *but*
* ✘ significantly affects **database performance**, and can result in the database being **shut down** due to **exhaustion of system resources**

The way your application **manages connections** also impacts performance. This guide describes how to approach connection management in [serverless environments](#serverless-environments-faas) and [long-running processes](#long-running-processes).

<CalloutContainer type="warning">
  <CalloutDescription>
    This guide focuses on **relational databases** and how to configure and tune the Prisma ORM connection pool (MongoDB uses the MongoDB driver connection pool).
  </CalloutDescription>
</CalloutContainer>

Long-running processes [#long-running-processes]

Examples of long-running processes include Node.js applications hosted on a service like Heroku or a virtual machine. Use the following checklist as a guide to connection management in long-running environments:

* Configure [pool size and timeouts](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) for your driver adapter (defaults and options are adapter-specific)
* Make sure you have [**one** global instance of `PrismaClient`](#prismaclient-in-long-running-applications)

PrismaClient in long-running applications [#prismaclient-in-long-running-applications]

In **long-running** applications, we recommend that you:

* ✔ Create **one** instance of `PrismaClient` and re-use it across your application
* ✔ Assign `PrismaClient` to a global variable *in dev environments only* to [prevent hot reloading from creating new instances](#prevent-hot-reloading-from-creating-new-instances-of-prismaclient)

Re-using a single PrismaClient instance [#re-using-a-single-prismaclient-instance]

To re-use a single instance, create a module that exports a `PrismaClient` object:

```ts title="client.ts"
import { PrismaClient } from "../prisma/generated/client";

let prisma = new PrismaClient();

export default prisma;
```

The object is [cached](https://nodejs.org/api/modules.html#modules_caching) the first time the module is imported. Subsequent requests return the cached object rather than creating a new `PrismaClient`:

```ts title="app.ts"
import prisma from "./client";

async function main() {
  const allUsers = await prisma.user.findMany();
}

main();
```

You do not have to replicate the example above exactly - the goal is to make sure `PrismaClient` is cached. For example, you can [instantiate `PrismaClient` in the `context` object](https://github.com/prisma/prisma-examples/blob/9f1a6b9e7c25b9e1851bd59b273046158d748995/typescript/graphql-express/src/context.ts#L9) that you [pass into an Express app](https://github.com/prisma/prisma-examples/blob/9f1a6b9e7c25b9e1851bd59b273046158d748995/typescript/graphql-express/src/server.ts#L12).

Do not explicitly $disconnect() [#do-not-explicitly-disconnect]

You [do not need to explicitly `$disconnect()`](/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#calling-disconnect-explicitly) in the context of a long-running application that is continuously serving requests. Opening a new connection takes time and can slow down your application if you disconnect after each query.

Prevent hot reloading from creating new instances of PrismaClient [#prevent-hot-reloading-from-creating-new-instances-of-prismaclient]

Frameworks like [Next.js](https://nextjs.org/) support hot reloading of changed files, which enables you to see changes to your application without restarting. However, if the framework refreshes the module responsible for exporting `PrismaClient`, this can result in **additional, unwanted instances of `PrismaClient` in a development environment**.

As a workaround, you can store `PrismaClient` as a global variable in development environments only, as global variables are not reloaded:

```ts title="client.ts"
import { PrismaClient } from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

The way that you import and use Prisma Client does not change:

```ts title="app.ts"
import { prisma } from "./client";

async function main() {
  const allUsers = await prisma.user.findMany();
}

main();
```

Connections Created per CLI Command [#connections-created-per-cli-command]

In local tests with Postgres, MySQL, and SQLite, each Prisma CLI command typically uses a single connection. The table below shows the ranges observed in these tests. Your environment *may* produce slightly different results.

| Command                                                                | Connections | Description                                      |
| ---------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| [`migrate status`](/orm/reference/prisma-cli-reference#migrate-status) | 1           | Checks the status of migrations                  |
| [`migrate dev`](/orm/reference/prisma-cli-reference#migrate-dev)       | 1–4         | Applies pending migrations in development        |
| [`migrate diff`](/orm/reference/prisma-cli-reference#migrate-diff)     | 1–2         | Compares database schema with migration history  |
| [`migrate reset`](/orm/reference/prisma-cli-reference#migrate-reset)   | 1–2         | Resets the database and reapplies migrations     |
| [`migrate deploy`](/orm/reference/prisma-cli-reference#migrate-deploy) | 1–2         | Applies pending migrations in production         |
| [`db pull`](/orm/reference/prisma-cli-reference#db-pull)               | 1           | Pulls the database schema into the Prisma schema |
| [`db push`](/orm/reference/prisma-cli-reference#db-push)               | 1–2         | Pushes the Prisma schema to the database         |
| [`db execute`](/orm/reference/prisma-cli-reference#db-execute)         | 1           | Executes raw SQL commands                        |
| [`db seed`](/orm/reference/prisma-cli-reference#db-seed)               | 1           | Seeds the database with initial data             |

Serverless environments (FaaS) [#serverless-environments-faas]

Examples of serverless environments include Node.js functions hosted on AWS Lambda, Vercel or Netlify Functions. Use the following checklist as a guide to connection management in serverless environments:

* Familiarize yourself with the [serverless connection management challenge](#the-serverless-challenge)
* Configure [pool size and timeouts](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) for your driver adapter (defaults and options are adapter-specific)
* [Instantiate `PrismaClient` outside the handler](#instantiate-prismaclient-outside-the-handler) and do not explicitly `$disconnect()`
* Configure [function concurrency](#concurrency-limits) and handle [idle connections](#zombie-connections)

The serverless challenge [#the-serverless-challenge]

In a serverless environment, each function creates **its own instance** of `PrismaClient`, and each client instance has its own connection pool.

Consider the following example, where a single AWS Lambda function uses `PrismaClient` to connect to a database. The `connection_limit` is **3**:

<img alt="An AWS Lambda function connecting to a database." src="/img/orm/prisma-client/setup-and-configuration/databases-connections/serverless-connections.png" width="1148" height="332" />

A traffic spike causes AWS Lambda to spawn two additional lambdas to handle the increased load. Each lambda creates an instance of `PrismaClient`, each with a `connection_limit` of **3**, which results in a maximum of **9** connections to the database:

<img alt="Three AWS Lambda function connecting to a database." src="/img/orm/prisma-client/setup-and-configuration/databases-connections/serverless-connections-2.png" width="1138" height="804" />

Many *concurrent functions* responding to a traffic spike 📈 can exhaust the database connection limit very quickly. Furthermore, any functions that are **paused** keep their connections open by default and block them from being used by another function.

1. Configure a small pool size for your [driver adapter](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) (adapter-specific; start small when not using a pooler)
2. If you need more connections per function, consider using an [external connection pooler like PgBouncer](#external-connection-poolers)

PrismaClient in serverless environments [#prismaclient-in-serverless-environments]

Instantiate PrismaClient outside the handler [#instantiate-prismaclient-outside-the-handler]

Instantiate `PrismaClient` [outside the scope of the function handler](https://github.com/prisma/e2e-tests/blob/5d1041d3f19245d3d237d959eca94d1d796e3a52/platforms/serverless-lambda/index.ts#L3) to increase the chances of reuse. As long as the handler remains 'warm' (in use), the connection is potentially reusable:

```ts highlight=3;normal
import { PrismaClient } from "../prisma/generated/client";

const client = new PrismaClient();

export async function handler() {
  /* ... */
}
```

Do not explicitly $disconnect() [#do-not-explicitly-disconnect-1]

You [do not need to explicitly `$disconnect()`](/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#calling-disconnect-explicitly) at the end of a function, as there is a possibility that the container might be reused. Opening a new connection takes time and slows down your function's ability to process requests. In some cases (e.g. [Cloudflare Workers](/orm/prisma-client/deployment/edge/deploy-to-cloudflare)), calling `$disconnect()` when releasing a temporary client is recommended—see the [connection management caveat](/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#calling-disconnect-explicitly).

Other serverless considerations [#other-serverless-considerations]

Container reuse [#container-reuse]

There is no guarantee that subsequent nearby invocations of a function will hit the same container - for example, AWS can choose to create a new container at any time.

Code should assume the container to be stateless and create a connection only if it does not exist - Prisma Client JS already implements this logic.

Zombie connections [#zombie-connections]

Containers that are marked "to be removed" and are not being reused still **keep a connection open** and can stay in that state for some time (unknown and not documented from AWS). This can lead to sub-optimal utilization of the database connections.

A potential solution is to **clean up idle connections** ([`serverless-mysql`](https://github.com/jeremydaly/serverless-mysql) implements this idea, but cannot be used with Prisma ORM).

Concurrency limits [#concurrency-limits]

Depending on your serverless concurrency limit (the number of serverless functions running in parallel), you might still exhaust your database's connection limit. This can happen when too many functions are invoked concurrently, each with its own connection pool, which eventually exhausts the database connection limit. To prevent this, you can [set your serverless concurrency limit](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html) to a number lower than the maximum connection limit of your database divided by the number of connections used by each function invocation (as you might want to be able to connect from another client for other purposes).

Optimizing the connection pool [#optimizing-the-connection-pool]

If Prisma Client cannot obtain a connection from the pool before the adapter's acquire timeout, you will see connection pool timeout exceptions in your log. A connection pool timeout can occur if:

* Many users are accessing your app simultaneously
* You send a large number of queries in parallel (for example, using `await Promise.all()`)

Pool size, acquire timeout, and other pool behavior are **configured per driver adapter**—there are no connection URL parameters for these in Prisma ORM v7. See the [connection pool reference](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) for each adapter's pool settings (e.g. `max`, `connectionTimeoutMillis` for `pg`) and the underlying driver documentation. Tune the pool so that:

* Your database can support the total number of concurrent connections (pool size × number of instances)
* Timeouts and queue behavior match your workload (e.g. avoid exhausting system resources if the queue grows unbounded)

External connection poolers [#external-connection-poolers]

Connection poolers like PgBouncer prevent your application from exhausting the database's connection limit.

To keep Prisma Client on the pooled connection while allowing Prisma CLI commands (for example, migrations or introspection) to connect directly, define two environment variables:

```bash title=".env"
# Connection URL to your database using PgBouncer.
DATABASE_URL="postgres://root:password@127.0.0.1:54321/postgres?pgbouncer=true"

# Direct connection URL to the database used for Prisma CLI commands. # [!code ++]
DIRECT_URL="postgres://root:password@127.0.0.1:5432/postgres" # [!code ++]
```

Configure `prisma.config.ts` to point to the direct connection string. Prisma CLI commands always read from this configuration.

```ts title="prisma.config.ts" showLineNumbers
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

At runtime, instantiate Prisma Client with a driver adapter (for example, `@prisma/adapter-pg`) that uses the pooled connection string:

```ts title="src/db/client.ts" showLineNumbers
import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

PgBouncer [#pgbouncer]

PostgreSQL only supports a certain amount of concurrent connections, and this limit can be reached quite fast when the service usage goes up – especially in [serverless environments](#serverless-environments-faas).

[PgBouncer](https://www.pgbouncer.org/) holds a connection pool to the database and proxies incoming client connections by sitting between Prisma Client and the database. This reduces the number of processes a database has to handle at any given time. PgBouncer passes on a limited number of connections to the database and queues additional connections for delivery when connections become available. To use PgBouncer, see [Configure Prisma Client with PgBouncer](/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer).

AWS RDS Proxy [#aws-rds-proxy]

Due to the way AWS RDS Proxy pins connections, [it does not provide any connection pooling benefits](/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms#aws-rds-proxy) when used together with Prisma Client.
# Connection pool (/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool)



<CalloutContainer type="info">
  <CalloutTitle>
    Quick summary
  </CalloutTitle>

  <CalloutDescription>
    This page explains how Prisma ORM manages database connections using a connection pool, and how you can configure limits and timeouts for optimal performance.
  </CalloutDescription>
</CalloutContainer>

Prisma Client uses a **connection pool** of database connections (managed by the database driver when using [driver adapters](/orm/core-concepts/supported-databases/database-drivers)). The pool is created when Prisma Client opens the *first* connection to the database, which can happen in one of two ways:

* By [explicitly calling `$connect()`](/orm/prisma-client/setup-and-configuration/databases-connections/connection-management#connect) *or*
* By running the first query, which calls `$connect()` under the hood

Relational database connectors use Prisma ORM's own connection pool, and the MongoDB connectors uses the [MongoDB driver connection pool](https://github.com/mongodb/specifications/blob/master/source/connection-monitoring-and-pooling/connection-monitoring-and-pooling.rst).

<details>
  <summary>
    Questions answered in this page
  </summary>

  * How do I size Prisma's connection pool?
  * How do I set pool timeouts and limits?
  * When should I use PgBouncer with Prisma?
</details>

Relational databases [#relational-databases]

Starting with Prisma ORM v7, relational datasources instantiate Prisma Client with [driver adapters](/orm/core-concepts/supported-databases/database-drivers) by default. Driver adapters rely on the Node.js driver you supply, so connection pooling defaults (and configuration) now come from the driver itself.

Use the tables below to translate Prisma ORM v6 connection URL parameters to the Prisma ORM v7 driver adapter fields alongside their defaults.

Prisma ORM v7 driver adapter defaults [#prisma-orm-v7-driver-adapter-defaults]

The following tables document the default connection pool settings for each driver adapter.

<CalloutContainer type="info">
  <CalloutTitle>
    Prisma timeouts
  </CalloutTitle>

  <CalloutDescription>
    Prisma ORM also has its own configurable timeouts that are separate from the database driver timeouts. If you see a timeout error and are unsure whether it comes from the driver or from Prisma Client, see the [Prisma Client timeouts and transaction options documentation](/orm/prisma-client/queries/transactions#transaction-isolation-level).
  </CalloutDescription>
</CalloutContainer>

PostgreSQL (using the pg driver adapter) [#postgresql-using-the-pg-driver-adapter]

Here are the default connection pool settings for the `pg` driver adapter:

| Behavior            | v6 URL parameter               | v6 default                         | v7 `pg` config field      | v7 default       |
| ------------------- | ------------------------------ | ---------------------------------- | ------------------------- | ---------------- |
| Pool size           | `connection_limit`             | `num_cpus::get_physical() * 2 + 1` | `max`                     | `10`             |
| Acquire timeout     | `pool_timeout`                 | `10s`                              | `connectionTimeoutMillis` | `0` (no timeout) |
| Connection timeout  | `connect_timeout`              | `5s`                               | `connectionTimeoutMillis` | `0` (no timeout) |
| Idle timeout        | `max_idle_connection_lifetime` | `300s`                             | `idleTimeoutMillis`       | `10s`            |
| Connection lifetime | `max_connection_lifetime`      | `0` (no timeout)                   | `maxLifetimeSeconds`      | `0` (no timeout) |

<details>
  <summary>
    Example: Matching Prisma ORM v6 defaults with the 

    `pg`

     driver adapter
  </summary>

  If you want to preserve the same timeout behavior you had in Prisma ORM v6, pass the following configuration when instantiating the driver adapter:

  ```ts
  import { PrismaPg } from "@prisma/adapter-pg";

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Match Prisma ORM v6 defaults:
    connectionTimeoutMillis: 5_000, // v6 connect_timeout was 5s
    idleTimeoutMillis: 300_000, // v6 max_idle_connection_lifetime was 300s
  });
  ```
</details>

<CalloutContainer type="info">
  <CalloutDescription>
    See the [node-postgres pool documentation](https://node-postgres.com/apis/pool) for details on every available option.
  </CalloutDescription>
</CalloutContainer>

MySQL or MariaDB (using the mariadb driver) [#mysql-or-mariadb-using-the-mariadb-driver]

Here are the default connection pool settings for the `mariadb` driver adapter:

| Behavior           | v6 URL parameter               | v6 default                         | v7 `mariadb` config field | v7 default |
| ------------------ | ------------------------------ | ---------------------------------- | ------------------------- | ---------- |
| Pool size          | `connection_limit`             | `num_cpus::get_physical() * 2 + 1` | `connectionLimit`         | `10`       |
| Acquire timeout    | `pool_timeout`                 | `10s`                              | `acquireTimeout`          | `10s`      |
| Connection timeout | `connect_timeout`              | `5s`                               | `connectTimeout`          | `1s`       |
| Idle timeout       | `max_idle_connection_lifetime` | `300s`                             | `idleTimeout`             | `1800s`    |

<details>
  <summary>
    Example: Matching Prisma ORM v6 defaults with the 

    `mariadb`

     driver adapter
  </summary>

  If you want to preserve the same timeout behavior you had in Prisma ORM v6, pass the following configuration when instantiating the driver adapter:

  ```ts
  import { PrismaMariaDb } from "@prisma/adapter-mariadb";

  const adapter = new PrismaMariaDb({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Match Prisma ORM v6 defaults:
    connectTimeout: 5_000, // v6 connect_timeout was 5s
    idleTimeout: 300, // v6 max_idle_connection_lifetime was 300s (note: in seconds, not ms)
  });
  ```
</details>

<CalloutContainer type="info">
  <CalloutDescription>
    Refer to the [MariaDB Connector/Node.js pool options](https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api#pool-options) for configuration and tuning guidance.
  </CalloutDescription>
</CalloutContainer>

SQL Server (using the mssql driver) [#sql-server-using-the-mssql-driver]

Here are the default connection pool settings for the `mssql` driver adapter:

| Behavior           | v6 URL parameter               | v6 default                         | v7 `mssql` config field  | v7 default |
| ------------------ | ------------------------------ | ---------------------------------- | ------------------------ | ---------- |
| Pool size          | `connection_limit`             | `num_cpus::get_physical() * 2 + 1` | `pool.max`               | `10`       |
| Connection timeout | `connect_timeout`              | `5s`                               | `connectionTimeout`      | `15s`      |
| Idle timeout       | `max_idle_connection_lifetime` | `300s`                             | `pool.idleTimeoutMillis` | `30s`      |

<details>
  <summary>
    Example: Matching Prisma ORM v6 defaults with the 

    `mssql`

     driver adapter
  </summary>

  If you want to preserve the same timeout behavior you had in Prisma ORM v6, pass the following configuration when instantiating the driver adapter:

  ```ts
  import { PrismaMssql } from "@prisma/adapter-mssql";

  const adapter = new PrismaMssql({
    server: "localhost",
    port: 1433,
    database: "mydb",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Match Prisma ORM v6 defaults:
    connectionTimeout: 5_000, // v6 connect_timeout was 5s
    pool: {
      idleTimeoutMillis: 300_000, // v6 max_idle_connection_lifetime was 300s
    },
  });
  ```
</details>

<CalloutContainer type="info">
  <CalloutDescription>
    See the [`node-mssql` pool docs](https://tediousjs.github.io/node-mssql/#general-same-for-all-drivers) for details on these fields.
  </CalloutDescription>
</CalloutContainer>

MongoDB [#mongodb]

The MongoDB connector does not use the Prisma ORM connection pool. The connection pool is managed internally by the MongoDB driver and [configured via connection string parameters](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-pool-options).

External connection poolers [#external-connection-poolers]

The pool size cannot exceed what the underlying database can support. Configure pool size and timeouts via your [driver adapter](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) (see the tables above). This is a particular challenge in serverless environments, where each function manages an instance of `PrismaClient` and its own connection pool.

Consider introducing [an external connection pooler like PgBouncer](/orm/prisma-client/setup-and-configuration/databases-connections#pgbouncer) to prevent your application or functions from exhausting the database connection limit.

Manual database connection handling [#manual-database-connection-handling]

When using Prisma Client with a driver adapter, database connections are managed by the driver and its pool. They are not exposed to the developer and it is not possible to manually access individual connections.
# Connection management (/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management)



<CalloutContainer type="info">
  <CalloutTitle>
    Quick summary
  </CalloutTitle>

  <CalloutDescription>
    This page explains how Prisma Client manages database connections, including how and when to use the `$connect()` and `$disconnect()` methods, connection pooling behavior, and best practices for both long-running and serverless environments.
  </CalloutDescription>
</CalloutContainer>

`PrismaClient` connects and disconnects from your data source using the following two methods:

* [`$connect()`](/orm/reference/prisma-client-reference)
* [`$disconnect()`](/orm/reference/prisma-client-reference)

In most cases, you **do not need to explicitly call these methods**. `PrismaClient` automatically connects when you run your first query, creates a [connection pool](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool), and disconnects when the Node.js process ends.

See the [connection management guide](/orm/prisma-client/setup-and-configuration/databases-connections) for information about managing connections for different deployment paradigms (long-running processes and serverless functions).

<details>
  <summary>
    Questions answered in this page
  </summary>

  * When should I call $connect and $disconnect?
  * How does Prisma manage connection pools?
  * How to handle connections in serverless?
</details>

$connect() [#connect]

It is not necessary to call [`$connect()`](/orm/reference/prisma-client-reference) thanks to the *lazy connect* behavior: The `PrismaClient` instance connects lazily when the first request is made to the API (`$connect()` is called for you under the hood).

Calling $connect() explicitly [#calling-connect-explicitly]

If you need the first request to respond instantly and cannot wait for a lazy connection to be established, you can explicitly call `prisma.$connect()` to establish a connection to the data source:

```ts
const prisma = new PrismaClient();

// run inside `async` function
await prisma.$connect();
```

$disconnect() [#disconnect]

When you call [`$disconnect()`](/orm/reference/prisma-client-reference) , Prisma Client:

1. Runs the [`beforeExit` hook](#exit-hooks)
2. Closes all connections in the pool

In a long-running application such as a GraphQL API, which constantly serves requests, it does not make sense to `$disconnect()` after each request - it takes time to establish a connection, and doing so as part of each request will slow down your application.

<CalloutContainer type="info">
  <CalloutDescription>
    To avoid too *many* connections in a long-running application, we recommend that you [use a single instance of `PrismaClient` across your application](/orm/prisma-client/setup-and-configuration/introduction#use-prisma-client-to-send-queries-to-your-database).
  </CalloutDescription>
</CalloutContainer>

Calling $disconnect() explicitly [#calling-disconnect-explicitly]

In most long-running or serverless apps you should **not** call `$disconnect()` after each request, so connections can be reused. In some situations it **does** make sense to call it explicitly—for example, when creating a temporary `PrismaClient` and then immediately releasing its resources (e.g. in [Cloudflare Workers](/orm/prisma-client/deployment/edge/deploy-to-cloudflare), where `ctx.waitUntil(prisma.$disconnect())` is recommended).

Another scenario is a script that:

1. Runs **infrequently** (for example, a scheduled job to send emails each night), which means it does not benefit from a long-running connection to the database *and*
2. Exists in the context of a **long-running application**, such as a background service. If the application never shuts down, Prisma Client never disconnects.

The following script creates a new instance of `PrismaClient`, performs a task, and then disconnects - which closes the connection pool:

```ts
import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();
const emailService = new EmailService();

async function main() {
  const allUsers = await prisma.user.findMany();
  const emails = allUsers.map((x) => x.email);

  await emailService.send(emails, "Hello!");
}

main()
  .then(async () => {
    await prisma.$disconnect();  //[!code highlight]
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect(); //[!code highlight]
    process.exit(1);
  });
```

If the above script runs multiple times in the context of a long-running application *without* calling `$disconnect()`, a new connection pool is created with each new instance of `PrismaClient`.

Exit hooks [#exit-hooks]

The `beforeExit` hook runs when Prisma ORM is triggered externally (e.g. via a `SIGINT` signal) to shut down, and allows you to run code *before* Prisma Client disconnects - for example, to issue queries as part of a graceful shutdown of a service:

```ts
const prisma = new PrismaClient();

prisma.$on("beforeExit", async () => {
  console.log("beforeExit hook");
  // PrismaClient still available
  await prisma.message.create({
    data: {
      message: "Shutting down server",
    },
  });
});
```
# Configure Prisma Client with PgBouncer (/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)



An external connection pooler like PgBouncer holds a connection pool to the database, and proxies incoming client connections by sitting between Prisma Client and the database. This reduces the number of processes a database has to handle at any given time.

Usually, this works transparently, but some connection poolers only support a limited set of functionality. One common feature that external connection poolers do not support are named prepared statements, which Prisma ORM uses. For these cases, Prisma ORM can be configured to behave differently.

<details>
  <summary>
    Questions answered in this page
  </summary>

  * How do I configure Prisma with PgBouncer?
  * Do I need `pgbouncer=true`, and if so, when?
  * How does Prisma Migrate work with PgBouncer?
</details>

<CalloutContainer type="info">
  <CalloutDescription>
    Looking for an easy, infrastructure-free solution? Try [Prisma Accelerate](https://www.prisma.io/accelerate?utm_source=docs\&utm_campaign=pgbouncer-help)! It requires little to no setup and works seamlessly with all databases supported by Prisma ORM.

    Ready to begin? Get started with Prisma Accelerate by clicking [here](https://console.prisma.io?utm_source=docs\&utm_campaign=pgbouncer-help).
  </CalloutDescription>
</CalloutContainer>

PgBouncer [#pgbouncer]

Set PgBouncer to transaction mode [#set-pgbouncer-to-transaction-mode]

For Prisma Client to work reliably, PgBouncer must run in [**Transaction mode**](https://www.pgbouncer.org/features.html).

Transaction mode offers a connection for every transaction – a requirement for the Prisma Client to work with PgBouncer.

Add pgbouncer=true for PgBouncer versions below 1.21.0 [#add-pgbouncertrue-for-pgbouncer-versions-below-1210]

<CalloutContainer type="warning">
  <CalloutDescription>
    We recommend **not** setting `pgbouncer=true` in the database connection string if you're using [PgBouncer `1.21.0`](https://github.com/prisma/prisma/issues/21531#issuecomment-1919059472) or later.
  </CalloutDescription>
</CalloutContainer>

To use Prisma Client with PgBouncer, add the `?pgbouncer=true` flag to the PostgreSQL connection URL:

```shell
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true
```

<CalloutContainer type="info">
  <CalloutDescription>
    `PORT` specified for PgBouncer pooling is sometimes different from the default `5432` port. Check your database provider docs for the correct port number.
  </CalloutDescription>
</CalloutContainer>

Configure max_prepared_statements in PgBouncer to be greater than zero [#configure-max_prepared_statements-in-pgbouncer-to-be-greater-than-zero]

Prisma uses prepared statements, and setting [`max_prepared_statements`](https://www.pgbouncer.org/config.html) to a value greater than `0` enables PgBouncer to use those prepared statements.

<CalloutContainer type="info">
  <CalloutDescription>
    `PORT` specified for PgBouncer pooling is sometimes different from the default `5432` port. Check your database provider docs for the correct port number.
  </CalloutDescription>
</CalloutContainer>

Prisma Migrate and PgBouncer workaround [#prisma-migrate-and-pgbouncer-workaround]

Prisma Migrate uses **database transactions** to check out the current state of the database and the migrations table. However, the Schema Engine is designed to use a **single connection to the database**, and does not support connection pooling with PgBouncer. If you attempt to run Prisma Migrate commands in any environment that uses PgBouncer for connection pooling, you might see the following error:

```bash
Error: undefined: Database error
Error querying the database: db error: ERROR: prepared statement "s0" already exists
```

To work around this issue, configure a **direct** connection for Prisma CLI commands in `prisma.config.ts`, while Prisma Client continues to use the PgBouncer URL via a driver adapter.

```bash title=".env"
# PgBouncer (pooled) connection string used by Prisma Client.
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"

# Direct database connection string used by Prisma CLI. # [!code ++]
DIRECT_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE" # [!code ++]
```

```ts title="prisma.config.ts" showLineNumbers
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

```ts title="src/db/client.ts" showLineNumbers
import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

With this setup, PgBouncer stays in the path for runtime traffic, while Prisma CLI commands (`prisma migrate dev`, `prisma db push`, `prisma db pull`, and so on) always use the direct connection string defined in `prisma.config.ts`.

PgBouncer with different database providers [#pgbouncer-with-different-database-providers]

There are sometimes minor differences in how to connect directly to a Postgres database that depend on the provider hosting the database.

Below are links to information on how to set up these connections with providers who have setup steps not covered here in our documentation:

* [Connecting directly to a PostgreSQL database hosted on Digital Ocean](https://github.com/prisma/prisma/issues/6157)
* [Connecting directly to a PostgreSQL database hosted on ScaleGrid](https://github.com/prisma/prisma/issues/6701#issuecomment-824387959)

Supabase Supavisor [#supabase-supavisor]

Supabase's Supavisor behaves similarly to [PgBouncer](#pgbouncer). You can add `?pgbouncer=true` to your connection pooled connection string available via your [Supabase database settings](https://supabase.com/dashboard/project/_/settings/database).

Other external connection poolers [#other-external-connection-poolers]

Although Prisma ORM does not have explicit support for other connection poolers, if the limitations are similar to the ones of [PgBouncer](#pgbouncer) you can usually also use `pgbouncer=true` in your connection string to put Prisma ORM in a mode that works with them as well.
# CRUD (/docs/orm/prisma-client/queries/crud)



This page describes how to perform CRUD operations with Prisma Client:

* [Create](#create) - Insert records
* [Read](#read) - Query records
* [Update](#update) - Modify records
* [Delete](#delete) - Remove records

See the [Prisma Client API reference](/orm/reference/prisma-client-reference) for detailed method documentation.

Create [#create]

Create a single record [#create-a-single-record]

```ts
const user = await prisma.user.create({
  data: {
    email: "elsa@prisma.io",
    name: "Elsa Prisma",
  },
});
```

The `id` is auto-generated. Your schema determines which fields are mandatory.

Create multiple records [#create-multiple-records]

```ts
const createMany = await prisma.user.createMany({
  data: [
    { name: "Bob", email: "bob@prisma.io" },
    { name: "Yewande", email: "yewande@prisma.io" },
  ],
  skipDuplicates: true, // Skip records with duplicate unique fields
});
// Returns: { count: 2 }
```

<CalloutContainer type="info">
  <CalloutDescription>
    `skipDuplicates` is not supported on MongoDB, SQLServer, or SQLite.
  </CalloutDescription>
</CalloutContainer>

Create and return multiple records [#create-and-return-multiple-records]

Supported by PostgreSQL, CockroachDB, and SQLite.

```ts
const users = await prisma.user.createManyAndReturn({
  data: [
    { name: "Alice", email: "alice@prisma.io" },
    { name: "Bob", email: "bob@prisma.io" },
  ],
});
```

See [Nested writes](/orm/prisma-client/queries/relation-queries#nested-writes) for creating records with relations.

Read [#read]

Get record by ID or unique field [#get-record-by-id-or-unique-field]

```ts
// By unique field
const user = await prisma.user.findUnique({
  where: { email: "elsa@prisma.io" },
});

// By ID
const user = await prisma.user.findUnique({
  where: { id: 99 },
});
```

Get all records [#get-all-records]

```ts
const users = await prisma.user.findMany();
```

Get first matching record [#get-first-matching-record]

```ts
const user = await prisma.user.findFirst({
  where: { posts: { some: { likes: { gt: 100 } } } },
  orderBy: { id: "desc" },
});
```

Filter records [#filter-records]

```ts
// Single field filter
const users = await prisma.user.findMany({
  where: { email: { endsWith: "prisma.io" } },
});

// Multiple conditions with OR/AND
const users = await prisma.user.findMany({
  where: {
    OR: [{ name: { startsWith: "E" } }, { AND: { profileViews: { gt: 0 }, role: "ADMIN" } }],
  },
});

// Filter by related records
const users = await prisma.user.findMany({
  where: {
    email: { endsWith: "prisma.io" },
    posts: { some: { published: false } },
  },
});
```

See [Filtering and sorting](/v6/orm/prisma-client/queries/filtering-and-sorting) for more examples.

Select fields [#select-fields]

```ts
const user = await prisma.user.findUnique({
  where: { email: "emma@prisma.io" },
  select: { email: true, name: true },
});
// Returns: { email: 'emma@prisma.io', name: "Emma" }
```

Include related records [#include-related-records]

```ts
const users = await prisma.user.findMany({
  where: { role: "ADMIN" },
  include: { posts: true },
});
```

See [Select fields](/v6/orm/prisma-client/queries/select-fields) and [Relation queries](/orm/prisma-client/queries/relation-queries) for more.

Update [#update]

Update a single record [#update-a-single-record]

```ts
const updateUser = await prisma.user.update({
  where: { email: "viola@prisma.io" },
  data: { name: "Viola the Magnificent" },
});
```

Update multiple records [#update-multiple-records]

```ts
const updateUsers = await prisma.user.updateMany({
  where: { email: { contains: "prisma.io" } },
  data: { role: "ADMIN" },
});
// Returns: { count: 19 }
```

Update and return multiple records [#update-and-return-multiple-records]

Supported by PostgreSQL, CockroachDB, and SQLite.

```ts
const users = await prisma.user.updateManyAndReturn({
  where: { email: { contains: "prisma.io" } },
  data: { role: "ADMIN" },
});
```

Upsert (update or create) [#upsert-update-or-create]

```ts
const upsertUser = await prisma.user.upsert({
  where: { email: "viola@prisma.io" },
  update: { name: "Viola the Magnificent" },
  create: { email: "viola@prisma.io", name: "Viola the Magnificent" },
});
```

<CalloutContainer type="info">
  <CalloutDescription>
    To emulate `findOrCreate()`, use `upsert()` with an empty `update` parameter.
  </CalloutDescription>
</CalloutContainer>

Atomic number operations [#atomic-number-operations]

```ts
await prisma.post.updateMany({
  data: {
    views: { increment: 1 },
    likes: { increment: 1 },
  },
});
```

See [Relation queries](/orm/prisma-client/queries/relation-queries) for connecting and disconnecting related records.

Delete\n [#deleten]

Delete a single record [#delete-a-single-record]

The following query uses [`delete()`](/orm/reference/prisma-client-reference#delete) to delete a single `User` record:

```ts
const deleteUser = await prisma.user.delete({
  where: {
    email: "bert@prisma.io",
  },
});
```

Attempting to delete a user with one or more posts result in an error, as every `Post` requires an author - see [cascading deletes](#cascading-deletes-deleting-related-records).

Delete multiple records [#delete-multiple-records]

The following query uses [`deleteMany()`](/orm/reference/prisma-client-reference#deletemany) to delete all `User` records where `email` contains `prisma.io`:

```ts
const deleteUsers = await prisma.user.deleteMany({
  where: {
    email: {
      contains: "prisma.io",
    },
  },
});
```

Attempting to delete a user with one or more posts result in an error, as every `Post` requires an author - see [cascading deletes](#cascading-deletes-deleting-related-records).

Delete all records [#delete-all-records]

The following query uses [`deleteMany()`](/orm/reference/prisma-client-reference#deletemany) to delete all `User` records:

```ts
const deleteUsers = await prisma.user.deleteMany({});
```

Be aware that this query will fail if the user has any related records (such as posts). In this case, you need to [delete the related records first](#cascading-deletes-deleting-related-records).

Cascading deletes (deleting related records) [#cascading-deletes-deleting-related-records]

<CalloutContainer type="info">
  <CalloutDescription>
    You can configure cascading deletes using [referential actions](/orm/prisma-schema/data-model/relations/referential-actions).
  </CalloutDescription>
</CalloutContainer>

The following query uses [`delete()`](/orm/reference/prisma-client-reference#delete) to delete a single `User` record:

```ts
const deleteUser = await prisma.user.delete({
  where: {
    email: "bert@prisma.io",
  },
});
```

However, the example schema includes a **required relation** between `Post` and `User`, which means that you cannot delete a user with posts:

```
The change you are trying to make would violate the required relation 'PostToUser' between the `Post` and `User` models.
```

To resolve this error, you can:

* Make the relation optional:

  ```prisma highlight=3,4;add|5,6;delete
  model Post {
    id       Int   @id @default(autoincrement())
    author   User? @relation(fields: [authorId], references: [id]) // [!code ++]
    authorId Int? // [!code ++]
    author   User  @relation(fields: [authorId], references: [id]) // [!code --]
    authorId Int // [!code --]
  }
  ```

* Change the author of the posts to another user before deleting the user.

* Delete a user and all their posts with two separate queries in a transaction (all queries must succeed):

  ```ts
  const deletePosts = prisma.post.deleteMany({
    where: {
      authorId: 7,
    },
  });

  const deleteUser = prisma.user.delete({
    where: {
      id: 7,
    },
  });

  const transaction = await prisma.$transaction([deletePosts, deleteUser]);
  ```

Delete all records from all tables [#delete-all-records-from-all-tables]

Sometimes you want to remove all data from all tables but keep the actual tables. This can be particularly useful in a development environment and whilst testing.

The following shows how to delete all records from all tables with Prisma Client and with Prisma Migrate.

Deleting all data with deleteMany() [#deleting-all-data-with-deletemany]

When you know the order in which your tables should be deleted, you can use the [`deleteMany`](/orm/reference/prisma-client-reference#deletemany) function. This is executed synchronously in a [`$transaction`](/orm/prisma-client/queries/transactions) and can be used with all types of databases.

```ts
const deletePosts = prisma.post.deleteMany();
const deleteProfile = prisma.profile.deleteMany();
const deleteUsers = prisma.user.deleteMany();

// The transaction runs synchronously so deleteUsers must run last.
await prisma.$transaction([deleteProfile, deletePosts, deleteUsers]);
```

✅ **Pros**:

* Works well when you know the structure of your schema ahead of time
* Synchronously deletes each tables data

❌ **Cons**:

* When working with relational databases, this function doesn't scale as well as having a more generic solution which looks up and `TRUNCATE`s your tables regardless of their relational constraints. Note that this scaling issue does not apply when using the MongoDB connector.

> **Note**: The `$transaction` performs a cascading delete on each models table so they have to be called in order.

Deleting all data with raw SQL / TRUNCATE [#deleting-all-data-with-raw-sql--truncate]

If you are comfortable working with raw SQL, you can perform a `TRUNCATE` query on a table using [`$executeRawUnsafe`](/orm/prisma-client/using-raw-sql/raw-queries#executerawunsafe).

In the following examples, the first tab shows how to perform a `TRUNCATE` on a Postgres database by using a `$queryRaw` look up that maps over the table and `TRUNCATES` all tables in a single query.

The second tab shows performing the same function but with a MySQL database. In this instance the constraints must be removed before the `TRUNCATE` can be executed, before being reinstated once finished. The whole process is run as a `$transaction`

<CodeBlockTabs defaultValue="PostgreSQL">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="PostgreSQL">
      PostgreSQL
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MySQL">
      MySQL
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="PostgreSQL">
    ```ts
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== "_prisma_migrations")
      .map((name) => `"public"."${name}"`)
      .join(", ");

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MySQL">
    ```ts
    const transactions: PrismaPromise<any>[] = [];
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

    const tablenames = await prisma.$queryRaw<
      Array<{ TABLE_NAME: string }>
    >`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'tests';`;

    for (const { TABLE_NAME } of tablenames) {
      if (TABLE_NAME !== "_prisma_migrations") {
        try {
          transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`));
        } catch (error) {
          console.log({ error });
        }
      }
    }

    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

    try {
      await prisma.$transaction(transactions);
    } catch (error) {
      console.log({ error });
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

✅ **Pros**:

* Scalable
* Very fast

❌ **Cons**:

* Can't undo the operation
* Using reserved SQL key words as tables names can cause issues when trying to run a raw query

Deleting all records with Prisma Migrate [#deleting-all-records-with-prisma-migrate]

If you use Prisma Migrate, you can use `migrate reset`, this will:

1. Drop the database
2. Create a new database
3. Apply migrations
4. Seed the database with data

Advanced query examples [#advanced-query-examples]

Create a deeply nested tree of records [#create-a-deeply-nested-tree-of-records]

* A single `User`
* Two new, related `Post` records
* Connect or create `Category` per post

```ts
const u = await prisma.user.create({
  include: {
    posts: {
      include: {
        categories: true,
      },
    },
  },
  data: {
    email: "emma@prisma.io",
    posts: {
      create: [
        {
          title: "My first post",
          categories: {
            connectOrCreate: [
              {
                create: { name: "Introductions" },
                where: {
                  name: "Introductions",
                },
              },
              {
                create: { name: "Social" },
                where: {
                  name: "Social",
                },
              },
            ],
          },
        },
        {
          title: "How to make cookies",
          categories: {
            connectOrCreate: [
              {
                create: { name: "Social" },
                where: {
                  name: "Social",
                },
              },
              {
                create: { name: "Cooking" },
                where: {
                  name: "Cooking",
                },
              },
            ],
          },
        },
      ],
    },
  },
});
```
# Relation queries (/docs/orm/prisma-client/queries/relation-queries)



A key feature of Prisma Client is the ability to query [relations](/orm/prisma-schema/data-model/relations) between two or more models. Relation queries include:

* [Nested reads](#nested-reads) (sometimes referred to as *eager loading*) via [`select`](/orm/reference/prisma-client-reference#select) and [`include`](/orm/reference/prisma-client-reference#include)
* [Nested writes](#nested-writes) with [transactional](/orm/prisma-client/queries/transactions) guarantees
* [Filtering on related records](#relation-filters)

Prisma Client also has a [fluent API for traversing relations](#fluent-api).

Nested reads [#nested-reads]

Nested reads allow you to read related data from multiple tables in your database - such as a user and that user's posts. You can:

* Use [`include`](/orm/reference/prisma-client-reference#include) to include related records, such as a user's posts or profile, in the query response.
* Use a nested [`select`](/orm/reference/prisma-client-reference#select) to include specific fields from a related record. You can also nest `select` inside an `include`.

Relation load strategies (Preview) [#relation-load-strategies-preview]

You can decide on a per-query-level *how* you want Prisma Client to execute a relation query (i.e. what *load strategy* should be applied) via the `relationLoadStrategy` option for PostgreSQL databases.

Because the `relationLoadStrategy` option is currently in Preview, you need to enable it via the `relationJoins` preview feature flag in your Prisma schema file:

```prisma title="schema.prisma" showLineNumbers
generator client {
  provider        = "prisma-client"
  output          = "./generated"
  previewFeatures = ["relationJoins"]
}
```

After adding this flag, you need to run `prisma generate` again to re-generate Prisma Client. The `relationJoins` feature is currently available on PostgreSQL, CockroachDB and MySQL.

Prisma Client supports two load strategies for relations:

* `join` (default): Uses a database-level `LATERAL JOIN` (PostgreSQL) or correlated subqueries (MySQL) and fetches all data with a single query to the database.
* `query`: Sends multiple queries to the database (one per table) and joins them on the application level.

Another important difference between these two options is that the `join` strategy uses JSON aggregation on the database level. That means that it creates the JSON structures returned by Prisma Client already in the database which saves computation resources on the application level.

Examples [#examples]

You can use the `relationLoadStrategy` option on the top-level in any query that supports `include` or `select`.

Here is an example with `include`:

```ts
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // or 'query'
  include: {
    posts: true,
  },
});
```

And here is another example with `select`:

```ts
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // or 'query'
  select: {
    posts: true,
  },
});
```

When to use which load strategy? [#when-to-use-which-load-strategy]

* The `join` strategy (default) will be more effective in most scenarios. On PostgreSQL, it uses a combination of `LATERAL JOINs` and JSON aggregation to reduce redundancy in result sets and delegate the work of transforming the query results into the expected JSON structures on the database server. On MySQL, it uses correlated subqueries to fetch the results with a single query.
* There may be edge cases where `query` could be more performant depending on the characteristics of the dataset and query. We recommend that you profile your database queries to identify these situations.
* Use `query` if you want to save resources on the database server and do heavy-lifting of merging and transforming data in the application server which might be easier to scale.

Include a relation [#include-a-relation]

The following example returns a single user and that user's posts:

```ts
const user = await prisma.user.findFirst({
  include: {
    posts: true,
  },
});
```

```json
{
  id: 19,
  name: null,
  email: 'emma@prisma.io',
  profileViews: 0,
  role: 'USER',
  coinflips: [],
  posts: [
    {
      id: 20,
      title: 'My first post',
      published: true,
      authorId: 19,
      comments: null,
      views: 0,
      likes: 0
    },
    {
      id: 21,
      title: 'How to make cookies',
      published: true,
      authorId: 19,
      comments: null,
      views: 0,
      likes: 0
    }
  ]
}
```

Include all fields for a specific relation [#include-all-fields-for-a-specific-relation]

The following example returns a post and its author:

```ts
const post = await prisma.post.findFirst({
  include: {
    author: true,
  },
});
```

```json
{
  id: 17,
  title: 'How to make cookies',
  published: true,
  authorId: 16,
  comments: null,
  views: 0,
  likes: 0,
  author: {
    id: 16,
    name: null,
    email: 'orla@prisma.io',
    profileViews: 0,
    role: 'USER',
    coinflips: [],
  },
}
```

Include deeply nested relations [#include-deeply-nested-relations]

You can nest `include` options to include relations of relations. The following example returns a user's posts, and each post's categories:

```ts
const user = await prisma.user.findFirst({
  include: {
    posts: {
      include: {
        categories: true,
      },
    },
  },
});
```

```json
{
    "id": 40,
    "name": "Yvette",
    "email": "yvette@prisma.io",
    "profileViews": 0,
    "role": "USER",
    "coinflips": [],
    "testing": [],
    "city": null,
    "country": "Sweden",
    "posts": [
        {
            "id": 66,
            "title": "How to make an omelette",
            "published": true,
            "authorId": 40,
            "comments": null,
            "views": 0,
            "likes": 0,
            "categories": [
                {
                    "id": 3,
                    "name": "Easy cooking"
                }
            ]
        },
        {
            "id": 67,
            "title": "How to eat an omelette",
            "published": true,
            "authorId": 40,
            "comments": null,
            "views": 0,
            "likes": 0,
            "categories": []
        }
    ]
}
```

Select specific fields of included relations [#select-specific-fields-of-included-relations]

You can use a nested `select` to choose a subset of fields of relations to return. For example, the following query returns the user's `name` and the `title` of each related post:

```ts
const user = await prisma.user.findFirst({
  select: {
    name: true,
    posts: {
      select: {
        title: true,
      },
    },
  },
});
```

```json
{
  name: "Elsa",
  posts: [ { title: 'My first post' }, { title: 'How to make cookies' } ]
}
```

You can also nest a `select` inside an `include` - the following example returns *all* `User` fields and the `title` field of each post:

```ts
const user = await prisma.user.findFirst({
  include: {
    posts: {
      select: {
        title: true,
      },
    },
  },
});
```

```json
{
  "id": 1,
  "name": null,
  "email": "martina@prisma.io",
  "profileViews": 0,
  "role": "USER",
  "coinflips": [],
  "posts": [
    { "title": "How to grow salad" },
    { "title": "How to ride a horse" }
  ]
}
```

Note that you **cannot** use `select` and `include` *on the same level*. This means that if you choose to `include` a user's post and `select` each post's title, you cannot `select` only the users' `email`:

```ts
// The following query returns an exception
const user = await prisma.user.findFirst({
  select: { // This won't work! // [!code --]
    email:  true
  }
  include: { // This won't work! // [!code --]
    posts: {
      select: {
        title: true
      }
    }
  },
})
```

```text no-copy
Invalid `prisma.user.findUnique()` invocation:

{
  where: {
    id: 19
  },
  select: {
  ~~~~~~
    email: true
  },
  include: {
  ~~~~~~~
    posts: {
      select: {
        title: true
      }
    }
  }
}


Please either use `include` or `select`, but not both at the same time.
```

Instead, use nested `select` options:

```ts
const user = await prisma.user.findFirst({
  select: {
    // This will work!
    email: true,
    posts: {
      select: {
        title: true,
      },
    },
  },
});
```

Relation count [#relation-count]

In [3.0.1](https://github.com/prisma/prisma/releases/3.0.1) and later, you can [`include` or `select` a count of relations](/orm/prisma-client/queries/aggregation-grouping-summarizing#count-relations) alongside fields - for example, a user's post count.

```ts
const relationCount = await prisma.user.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
});
```

```text no-copy
{ id: 1, _count: { posts: 3 } },
{ id: 2, _count: { posts: 2 } },
{ id: 3, _count: { posts: 2 } },
{ id: 4, _count: { posts: 0 } },
{ id: 5, _count: { posts: 0 } }
```

Filter a list of relations [#filter-a-list-of-relations]

When you use `select` or `include` to return a subset of the related data, you can **filter and sort the list of relations** inside the `select` or `include`.

For example, the following query returns list of titles of the unpublished posts associated with the user:

```ts
const result = await prisma.user.findFirst({
  select: {
    posts: {
      where: {
        published: false,
      },
      orderBy: {
        title: "asc",
      },
      select: {
        title: true,
      },
    },
  },
});
```

You can also write the same query using `include` as follows:

```ts
const result = await prisma.user.findFirst({
  include: {
    posts: {
      where: {
        published: false,
      },
      orderBy: {
        title: "asc",
      },
    },
  },
});
```

Nested writes [#nested-writes]

A nested write allows you to write **relational data** to your database in **a single transaction**.

Nested writes:

* Provide **transactional guarantees** for creating, updating or deleting data across multiple tables in a single Prisma Client query. If any part of the query fails (for example, creating a user succeeds but creating posts fails), Prisma Client rolls back all changes.
* Support any level of nesting supported by the data model.
* Are available for [relation fields](/orm/prisma-schema/data-model/relations#relation-fields) when using the model's create or update query. The following section shows the nested write options that are available per query.

Create a related record [#create-a-related-record]

You can create a record and one or more related records at the same time. The following query creates a `User` record and two related `Post` records:

```ts
const result = await prisma.user.create({
  data: {
    email: "elsa@prisma.io",
    name: "Elsa Prisma",
    posts: {
      // [!code highlight]
      create: [{ title: "How to make an omelette" }, { title: "How to eat an omelette" }], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true, // Include all posts in the returned object
  },
});
```

```json
{
  id: 29,
  name: 'Elsa',
  email: 'elsa@prisma.io',
  profileViews: 0,
  role: 'USER',
  coinflips: [],
  posts: [
    {
      id: 22,
      title: 'How to make an omelette',
      published: true,
      authorId: 29,
      comments: null,
      views: 0,
      likes: 0
    },
    {
      id: 23,
      title: 'How to eat an omelette',
      published: true,
      authorId: 29,
      comments: null,
      views: 0,
      likes: 0
    }
  ]
}
```

Create a single record and multiple related records [#create-a-single-record-and-multiple-related-records]

There are two ways to create or update a single record and multiple related records - for example, a user with multiple posts:

* Use a nested [`create`](/orm/reference/prisma-client-reference#create) query
* Use a nested [`createMany`](/orm/reference/prisma-client-reference#nested-createmany-options) query

In most cases, a nested `create` will be preferable unless the [`skipDuplicates` query option](/orm/reference/prisma-client-reference#nested-createmany-options) is required. Here's a quick table describing the differences between the two options:

| Feature                               | `create` | `createMany` | Notes                                                                                                                                                                                           |
| :------------------------------------ | :------- | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supports nesting additional relations | ✔        | ✘ \*         | For example, you can create a user, several posts, and several comments per post in one query.<br />\* You can manually set a foreign key in a has-one relation - for example: `{ authorId: 9}` |
| Supports 1-n relations                | ✔        | ✔            | For example, you can create a user and multiple posts (one user has many posts)                                                                                                                 |
| Supports m-n relations                | ✔        | ✘            | For example, you can create a post and several categories (one post can have many categories, and one category can have many posts)                                                             |
| Supports skipping duplicate records   | ✘        | ✔            | Use `skipDuplicates` query option.                                                                                                                                                              |

Using nested create [#using-nested-create]

The following query uses nested [`create`](/orm/reference/prisma-client-reference#create) to create:

* One user
* Two posts
* One post category

The example also uses a nested `include` to include all posts and post categories in the returned data.

```ts
const result = await prisma.user.create({
  data: {
    email: "yvette@prisma.io",
    name: "Yvette",
    posts: {
      // [!code highlight]
      create: [
        // [!code highlight]
        {
          // [!code highlight]
          title: "How to make an omelette", // [!code highlight]
          categories: {
            // [!code highlight]
            create: {
              // [!code highlight]
              name: "Easy cooking", // [!code highlight]
            }, // [!code highlight]
          }, // [!code highlight]
        }, // [!code highlight]
        { title: "How to eat an omelette" }, // [!code highlight]
      ], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    // Include posts
    posts: {
      include: {
        categories: true, // Include post categories
      },
    },
  },
});
```

```json
{
    "id": 40,
    "name": "Yvette",
    "email": "yvette@prisma.io",
    "profileViews": 0,
    "role": "USER",
    "coinflips": [],
    "testing": [],
    "city": null,
    "country": "Sweden",
    "posts": [
        {
            "id": 66,
            "title": "How to make an omelette",
            "published": true,
            "authorId": 40,
            "comments": null,
            "views": 0,
            "likes": 0,
            "categories": [
                {
                    "id": 3,
                    "name": "Easy cooking"
                }
            ]
        },
        {
            "id": 67,
            "title": "How to eat an omelette",
            "published": true,
            "authorId": 40,
            "comments": null,
            "views": 0,
            "likes": 0,
            "categories": []
        }
    ]
}
```

Here's a visual representation of how a nested create operation can write to several tables in the database as once:

<img alt="Diagram showing how a nested create operation writes to multiple database tables (User, Post, Category) in a single transaction." src="/img/orm/nested-create.png" width="2000" height="1019" />

Using nested createMany [#using-nested-createmany]

The following query uses a nested [`createMany`](/orm/reference/prisma-client-reference#createmany) to create:

* One user
* Two posts

The example also uses a nested `include` to include all posts in the returned data.

```ts
const result = await prisma.user.create({
  data: {
    email: "saanvi@prisma.io",
    posts: {
      // [!code highlight]
      createMany: {
        // [!code highlight]
        data: [{ title: "My first post" }, { title: "My second post" }], // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

```json
{
    "id": 43,
    "name": null,
    "email": "saanvi@prisma.io",
    "profileViews": 0,
    "role": "USER",
    "coinflips": [],
    "testing": [],
    "city": null,
    "country": "India",
    "posts": [
        {
            "id": 70,
            "title": "My first post",
            "published": true,
            "authorId": 43,
            "comments": null,
            "views": 0,
            "likes": 0
        },
        {
            "id": 71,
            "title": "My second post",
            "published": true,
            "authorId": 43,
            "comments": null,
            "views": 0,
            "likes": 0
        }
    ]
}
```

Note that it is **not possible** to nest an additional `create` or `createMany` inside the highlighted query, which means that you cannot create a user, posts, and post categories at the same time.

As a workaround, you can send a query to create the records that will be connected first, and then create the actual records. For example:

```ts
const categories = await prisma.category.createManyAndReturn({
  data: [{ name: "Fun" }, { name: "Technology" }, { name: "Sports" }],
  select: {
    id: true,
  },
});

const posts = await prisma.post.createManyAndReturn({
  data: [
    {
      title: "Funniest moments in 2024",
      categoryId: categories.find((category) => category.name === "Fun")!.id,
    },
    {
      title: "Linux or macOS — what's better?",
      categoryId: categories.find((category) => category.name === "Technology")!.id,
    },
    {
      title: "Who will win the next soccer championship?",
      categoryId: categories.find((category) => category.name === "Sports")!.id,
    },
  ],
});
```

If you want to create *all* records in a single database query, consider using a [`$transaction`](/orm/prisma-client/queries/transactions#the-transaction-api) or [type-safe, raw SQL](/orm/prisma-client/using-raw-sql/typedsql).

Create multiple records and multiple related records [#create-multiple-records-and-multiple-related-records]

You cannot access relations in a `createMany()` or `createManyAndReturn()` query, which means that you cannot create multiple users and multiple posts in a single nested write. The following is **not** possible:

```ts
const createMany = await prisma.user.createMany({
  data: [
    {
      name: "Yewande",
      email: "yewande@prisma.io",
      posts: {
        // [!code --]
        // Not possible to create posts! // [!code --]
      }, // [!code --]
    },
    {
      name: "Noor",
      email: "noor@prisma.io",
      posts: {
        // [!code --]
        // Not possible to create posts! // [!code --]
      }, // [!code --]
    },
  ],
});
```

Connect multiple records [#connect-multiple-records]

The following query creates ([`create`](/orm/reference/prisma-client-reference#create) ) a new `User` record and connects that record ([`connect`](/orm/reference/prisma-client-reference#connect) ) to three existing posts:

```ts
const result = await prisma.user.create({
  data: {
    email: "vlad@prisma.io",
    posts: {
      // [!code highlight]
      connect: [{ id: 8 }, { id: 9 }, { id: 10 }], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true, // Include all posts in the returned object
  },
});
```

```json
{
  id: 27,
  name: null,
  email: 'vlad@prisma.io',
  profileViews: 0,
  role: 'USER',
  coinflips: [],
  posts: [
    {
      id: 10,
      title: 'An existing post',
      published: true,
      authorId: 27,
      comments: {},
      views: 0,
      likes: 0
    }
  ]
}
```

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    Prisma Client throws an exception if any of the post records cannot be found: `connect: [{ id: 8 }, { id: 9 }, { id: 10 }]`
  </CalloutDescription>
</CalloutContainer>

Connect a single record [#connect-a-single-record]

You can [`connect`](/orm/reference/prisma-client-reference#connect) an existing record to a new or existing user. The following query connects an existing post (`id: 11`) to an existing user (`id: 9`)

```ts
const result = await prisma.user.update({
  where: {
    id: 9,
  },
  data: {
    posts: {
      // [!code highlight]
      connect: {
        // [!code highlight]
        id: 11, // [!code highlight]
      }, // [!code highlight]
    },
  },
  include: {
    posts: true,
  },
});
```

Connect or create a record [#connect-or-create-a-record]

If a related record may or may not already exist, use [`connectOrCreate`](/orm/reference/prisma-client-reference#connectorcreate) to connect the related record:

* Connect a `User` with the email address `viola@prisma.io` *or*
* Create a new `User` with the email address `viola@prisma.io` if the user does not already exist

```ts
const result = await prisma.post.create({
  data: {
    title: "How to make croissants",
    author: {
      // [!code highlight]
      connectOrCreate: {
        // [!code highlight]
        where: {
          // [!code highlight]
          email: "viola@prisma.io", // [!code highlight]
        }, // [!code highlight]
        create: {
          // [!code highlight]
          email: "viola@prisma.io", // [!code highlight]
          name: "Viola", // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    author: true,
  },
});
```

```json
{
  id: 26,
  title: 'How to make croissants',
  published: true,
  authorId: 43,
  views: 0,
  likes: 0,
  author: {
    id: 43,
    name: 'Viola',
    email: 'viola@prisma.io',
    profileViews: 0,
    role: 'USER',
    coinflips: []
  }
}
```

Disconnect a related record [#disconnect-a-related-record]

To `disconnect` one out of a list of records (for example, a specific blog post) provide the ID or unique identifier of the record(s) to disconnect:

```ts
const result = await prisma.user.update({
  where: {
    id: 16,
  },
  data: {
    posts: {
      // [!code highlight]
      disconnect: [{ id: 12 }, { id: 19 }], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

```json
{
  id: 16,
  name: null,
  email: 'orla@prisma.io',
  profileViews: 0,
  role: 'USER',
  coinflips: [],
  posts: []
}
```

To `disconnect` *one* record (for example, a post's author), use `disconnect: true`:

```ts
const result = await prisma.post.update({
  where: {
    id: 23,
  },
  data: {
    author: {
      // [!code highlight]
      disconnect: true, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    author: true,
  },
});
```

```json
{
  id: 23,
  title: 'How to eat an omelette',
  published: true,
  authorId: null,
  comments: null,
  views: 0,
  likes: 0,
  author: null
}
```

Disconnect all related records [#disconnect-all-related-records]

To [`disconnect`](/orm/reference/prisma-client-reference#disconnect) *all* related records in a one-to-many relation (a user has many posts), `set` the relation to an empty list as shown:

```ts
const result = await prisma.user.update({
  where: {
    id: 16,
  },
  data: {
    posts: {
      // [!code highlight]
      set: [], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

```json
{
  id: 16,
  name: null,
  email: 'orla@prisma.io',
  profileViews: 0,
  role: 'USER',
  coinflips: [],
  posts: []
}
```

Delete all related records [#delete-all-related-records]

Delete all related `Post` records:

```ts
const result = await prisma.user.update({
  where: {
    id: 11,
  },
  data: {
    posts: {
      // [!code highlight]
      deleteMany: {}, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Delete specific related records [#delete-specific-related-records]

Update a user by deleting all unpublished posts:

```ts
const result = await prisma.user.update({
  where: {
    id: 11,
  },
  data: {
    posts: {
      // [!code highlight]
      deleteMany: {
        // [!code highlight]
        published: false, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Update a user by deleting specific posts:

```ts
const result = await prisma.user.update({
  where: {
    id: 6,
  },
  data: {
    posts: {
      // [!code highlight]
      deleteMany: [{ id: 7 }], // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Update all related records (or filter) [#update-all-related-records-or-filter]

You can use a nested `updateMany` to update *all* related records for a particular user. The following query unpublishes all posts for a specific user:

```ts
const result = await prisma.user.update({
  where: {
    id: 6,
  },
  data: {
    posts: {
      // [!code highlight]
      updateMany: {
        // [!code highlight]
        where: {
          // [!code highlight]
          published: true, // [!code highlight]
        }, // [!code highlight]
        data: {
          // [!code highlight]
          published: false, // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Update a specific related record [#update-a-specific-related-record]

```ts
const result = await prisma.user.update({
  where: {
    id: 6,
  },
  data: {
    posts: {
      // [!code highlight]
      update: {
        // [!code highlight]
        where: {
          // [!code highlight]
          id: 9, // [!code highlight]
        }, // [!code highlight]
        data: {
          // [!code highlight]
          title: "My updated title", // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Update or create a related record [#update-or-create-a-related-record]

The following query uses a nested `upsert` to update `"bob@prisma.io"` if that user exists, or create the user if they do not exist:

```ts
const result = await prisma.post.update({
  where: {
    id: 6,
  },
  data: {
    author: {
      // [!code highlight]
      upsert: {
        // [!code highlight]
        create: {
          // [!code highlight]
          email: "bob@prisma.io", // [!code highlight]
          name: "Bob the New User", // [!code highlight]
        }, // [!code highlight]
        update: {
          // [!code highlight]
          email: "bob@prisma.io", // [!code highlight]
          name: "Bob the existing user", // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    author: true,
  },
});
```

Add new related records to an existing record [#add-new-related-records-to-an-existing-record]

You can nest `create` or `createMany` inside an `update` to add new related records to an existing record. The following query adds two posts to a user with an `id` of 9:

```ts
const result = await prisma.user.update({
  where: {
    id: 9,
  },
  data: {
    posts: {
      // [!code highlight]
      createMany: {
        // [!code highlight]
        data: [{ title: "My first post" }, { title: "My second post" }], // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Relation filters [#relation-filters]

Filter on "-to-many" relations [#filter-on--to-many-relations]

Prisma Client provides the [`some`](/orm/reference/prisma-client-reference#some), [`every`](/orm/reference/prisma-client-reference#every), and [`none`](/orm/reference/prisma-client-reference#none) options to filter records by the properties of related records on the "-to-many" side of the relation. For example, filtering users based on properties of their posts.

For example:

| Requirement                                                                       | Query option to use                 |
| --------------------------------------------------------------------------------- | ----------------------------------- |
| "I want a list of every `User` that has *at least one* unpublished `Post` record" | `some` posts are unpublished        |
| "I want a list of every `User` that has *no* unpublished `Post` records"          | `none` of the posts are unpublished |
| "I want a list of every `User` that has *only* unpublished `Post` records"        | `every` post is unpublished         |

For example, the following query returns `User` that meet the following criteria:

* No posts with more than 100 views
* All posts have less than, or equal to 50 likes

```ts
const users = await prisma.user.findMany({
  where: {
    posts: {
      // [!code highlight]
      none: {
        // [!code highlight]
        views: {
          // [!code highlight]
          gt: 100, // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
      every: {
        // [!code highlight]
        likes: {
          // [!code highlight]
          lte: 50, // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Filter on "-to-one" relations [#filter-on--to-one-relations]

Prisma Client provides the [`is`](/orm/reference/prisma-client-reference#is) and [`isNot`](/orm/reference/prisma-client-reference#isnot) options to filter records by the properties of related records on the "-to-one" side of the relation. For example, filtering posts based on properties of their author.

For example, the following query returns `Post` records that meet the following criteria:

* Author's name is not Bob
* Author is older than 40

```ts
const users = await prisma.post.findMany({
  where: {
    author: {
      // [!code highlight]
      isNot: {
        // [!code highlight]
        name: "Bob", // [!code highlight]
      }, // [!code highlight]
      is: {
        // [!code highlight]
        age: {
          // [!code highlight]
          gt: 40, // [!code highlight]
        }, // [!code highlight]
      }, // [!code highlight]
    }, // [!code highlight]
  }, // [!code highlight]
  include: {
    author: true,
  },
});
```

Filter on absence of "-to-many" records [#filter-on-absence-of--to-many-records]

For example, the following query uses `none` to return all users that have zero posts:

```ts
const usersWithZeroPosts = await prisma.user.findMany({
  where: {
    posts: {
      // [!code highlight]
      none: {}, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Filter on absence of "-to-one" relations [#filter-on-absence-of--to-one-relations]

The following query returns all posts that don't have an author relation:

```js
const postsWithNoAuthor = await prisma.post.findMany({
  where: {
    author: null, // or author: { } // [!code highlight]
  },
  include: {
    author: true,
  },
});
```

Filter on presence of related records [#filter-on-presence-of-related-records]

The following query returns all users with at least one post:

```ts
const usersWithSomePosts = await prisma.user.findMany({
  where: {
    posts: {
      // [!code highlight]
      some: {}, // [!code highlight]
    }, // [!code highlight]
  },
  include: {
    posts: true,
  },
});
```

Fluent API [#fluent-api]

The fluent API lets you *fluently* traverse the [relations](/orm/prisma-schema/data-model/relations) of your models via function calls. Note that the *last* function call determines the return type of the entire query (the respective type annotations are added in the code snippets below to make that explicit).

This query returns all `Post` records by a specific `User`:

```ts
const postsByUser: Post[] = await prisma.user
  .findUnique({ where: { email: "alice@prisma.io" } })
  .posts();
```

This is equivalent to the following `findMany` query:

```ts
const postsByUser = await prisma.post.findMany({
  where: {
    author: {
      email: "alice@prisma.io",
    },
  },
});
```

The main difference between the queries is that the fluent API call is translated into two separate database queries while the other one only generates a single query (see this [GitHub issue](https://github.com/prisma/prisma/issues/1984))

This request returns all categories by a specific post:

```ts
const categoriesOfPost: Category[] = await prisma.post
  .findUnique({ where: { id: 1 } })
  .categories();
```

Note that you can chain as many queries as you like. In this example, the chaining starts at `Profile` and goes over `User` to `Post`:

```ts
const posts: Post[] = await prisma.profile
  .findUnique({ where: { id: 1 } })
  .user()
  .posts();
```

The only requirement for chaining is that the previous function call must return only a *single object* (e.g. as returned by a `findUnique` query or a "to-one relation" like `profile.user()`).

The following query is **not possible** because `findMany` does not return a single object but a *list*:

```ts
// This query is illegal
const posts = await prisma.user.findMany().posts();
```
# Transactions and batch queries (/docs/orm/prisma-client/queries/transactions)



A database transaction is a sequence of read/write operations guaranteed to succeed or fail as a whole (ACID properties: Atomic, Consistent, Isolated, Durable).

Prisma Client supports transactions in several ways:

| Scenario            | Technique                                |
| :------------------ | :--------------------------------------- |
| Dependent writes    | Nested writes                            |
| Independent writes  | `$transaction([])` API, Batch operations |
| Read, modify, write | Interactive transactions                 |

Nested writes [#nested-writes]

A [nested write](/orm/prisma-client/queries/relation-queries#nested-writes) performs multiple operations on related records in a single transaction:

```ts
// Create user with posts in a single transaction
const user = await prisma.user.create({
  data: {
    email: "alice@prisma.io",
    posts: {
      create: [{ title: "Post 1" }, { title: "Post 2" }],
    },
  },
});
```

Batch operations [#batch-operations]

These bulk operations run as transactions:

* `createMany()` / `createManyAndReturn()`
* `updateMany()` / `updateManyAndReturn()`
* `deleteMany()`

The $transaction API [#the-transaction-api]

Sequential operations [#sequential-operations]

Pass an array of queries to execute sequentially in a transaction:

```ts
const [posts, totalPosts] = await prisma.$transaction([
  prisma.post.findMany({ where: { title: { contains: "prisma" } } }),
  prisma.post.count(),
]);
```

With options:

```ts
await prisma.$transaction(
  [prisma.resource.deleteMany({ where: { name: "name" } }), prisma.resource.createMany({ data })],
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
);
```

Interactive transactions [#interactive-transactions]

For complex logic between queries, use interactive transactions:

```ts
const result = await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    data: { balance: { decrement: 100 } },
    where: { email: "alice@prisma.io" },
  });

  if (sender.balance < 0) {
    throw new Error("Insufficient funds");
  }

  return await tx.account.update({
    data: { balance: { increment: 100 } },
    where: { email: "bob@prisma.io" },
  });
});
```

<CalloutContainer type="warning">
  <CalloutDescription>
    Keep transactions short. Long-running transactions hurt performance and can cause deadlocks.
  </CalloutDescription>
</CalloutContainer>

**Options:**

```ts
await prisma.$transaction(
  async (tx) => {
    /* ... */
  },
  {
    maxWait: 5000, // Max wait to acquire transaction (default: 2000ms)
    timeout: 10000, // Max transaction run time (default: 5000ms)
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
);
```

Transaction isolation level [#transaction-isolation-level]

<CalloutContainer type="info">
  <CalloutDescription>
    This feature is not available on MongoDB, because MongoDB does not support isolation levels.
  </CalloutDescription>
</CalloutContainer>

You can set the transaction [isolation level](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels) for transactions.

Set the isolation level [#set-the-isolation-level]

To set the transaction isolation level, use the `isolationLevel` option in the second parameter of the API.

For sequential operations:

```ts
await prisma.$transaction(
  [
    // Prisma Client operations running in a transaction...
  ],
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
  },
);
```

For an interactive transaction:

```jsx
await prisma.$transaction(
  async (prisma) => {
    // Code running in a transaction...
  },
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
  },
);
```

Supported isolation levels [#supported-isolation-levels]

Prisma Client supports the following isolation levels if they are available in the underlying database:

* `ReadUncommitted`
* `ReadCommitted`
* `RepeatableRead`
* `Snapshot`
* `Serializable`

The isolation levels available for each database connector are as follows:

| Database    | `ReadUncommitted` | `ReadCommitted` | `RepeatableRead` | `Snapshot` | `Serializable` |
| ----------- | ----------------- | --------------- | ---------------- | ---------- | -------------- |
| PostgreSQL  | ✔️                | ✔️              | ✔️               | No         | ✔️             |
| MySQL       | ✔️                | ✔️              | ✔️               | No         | ✔️             |
| SQL Server  | ✔️                | ✔️              | ✔️               | ✔️         | ✔️             |
| CockroachDB | No                | No              | No               | No         | ✔️             |
| SQLite      | No                | No              | No               | No         | ✔️             |

By default, Prisma Client sets the isolation level to the value currently configured in your database.

The isolation levels configured by default in each database are as follows:

| Database    | Default          |
| ----------- | ---------------- |
| PostgreSQL  | `ReadCommitted`  |
| MySQL       | `RepeatableRead` |
| SQL Server  | `ReadCommitted`  |
| CockroachDB | `Serializable`   |
| SQLite      | `Serializable`   |

Database-specific information on isolation levels [#database-specific-information-on-isolation-levels]

See the following resources:

* [Transaction isolation levels in PostgreSQL](https://www.postgresql.org/docs/9.3/runtime-config-client.html#GUC-DEFAULT-TRANSACTION-ISOLATION)
* [Transaction isolation levels in Microsoft SQL Server](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver15)
* [Transaction isolation levels in MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)

CockroachDB and SQLite only support the `Serializable` isolation level.

Transaction timing issues [#transaction-timing-issues]

<CalloutContainer type="info">
  <CalloutDescription>
    * The solution in this section does not apply to MongoDB, because MongoDB does not support [isolation levels](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels).
    * The timing issues discussed in this section do not apply to CockroachDB and SQLite, because these databases only support the highest `Serializable` isolation level.
  </CalloutDescription>
</CalloutContainer>

When two or more transactions run concurrently in certain [isolation levels](https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels), timing issues can cause write conflicts or deadlocks, such as the violation of unique constraints. For example, consider the following sequence of events where Transaction A and Transaction B both attempt to execute a `deleteMany` and a `createMany` operation:

1. Transaction B: `createMany` operation creates a new set of rows.
2. Transaction B: The application commits transaction B.
3. Transaction A: `createMany` operation.
4. Transaction A: The application commits transaction A. The new rows conflict with the rows that transaction B added at step 2.

This conflict can occur at the isolation level `ReadCommitted`, which is the default isolation level in PostgreSQL and Microsoft SQL Server. To avoid this problem, you can set a higher isolation level (`RepeatableRead` or `Serializable`). You can set the isolation level on a transaction. This overrides your database isolation level for that transaction.

To avoid transaction write conflicts and deadlocks on a transaction:

1. On your transaction, use the `isolationLevel` parameter to `Prisma.TransactionIsolationLevel.Serializable`.

   This ensures that your application commits multiple concurrent or parallel transactions as if they were run serially. When a transaction fails due to a write conflict or deadlock, Prisma Client returns a [P2034 error](/orm/reference/error-reference#p2034).

2. In your application code, add a retry around your transaction to handle any P2034 errors, as shown in this example:

   ```ts
   import { Prisma, PrismaClient } from "../prisma/generated/client";

   const prisma = new PrismaClient();
   async function main() {
     const MAX_RETRIES = 5;
     let retries = 0;

     let result;
     while (retries < MAX_RETRIES) {
       try {
         result = await prisma.$transaction(
           [
             prisma.user.deleteMany({
               where: {
                 /** args */
               },
             }),
             prisma.post.createMany({
               data: {
                 /** args */
               },
             }),
           ],
           {
             isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
           },
         );
         break;
       } catch (error) {
         if (error.code === "P2034") {
           retries++;
           continue;
         }
         throw error;
       }
     }
   }
   ```

Using $transaction within Promise.all() [#using-transaction-within-promiseall]

If you wrap a `$transaction` inside a call to `Promise.all()`, the queries inside the transaction will be executed *serially* (i.e. one after another):

```ts
await prisma.$transaction(async (prisma) => {
  await Promise.all([
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
    prisma.user.findMany(),
  ]);
});
```

This may be counterintuitive because `Promise.all()` usually *parallelizes* the calls passed into it.

The reason for this behaviour is that:

* One transaction means that all queries inside it have to be run on the same connection.
* A database connection can only ever execute one query at a time.
* As one query blocks the connection while it is doing its work, putting a transaction into `Promise.all` effectively means that queries should be ran one after another.

Dependent writes [#dependent-writes]

Writes are **dependent** when operations rely on the result of a preceding operation (e.g., using a database-generated ID).

Nested writes for dependent operations [#nested-writes-for-dependent-operations]

Use nested writes when you need to create related records atomically:

```ts
const team = await prisma.team.create({
  data: {
    name: "Aurora Adventures",
    members: {
      create: { email: "alice@prisma.io" },
    },
  },
});
```

If any operation fails, Prisma Client rolls back the entire transaction.

<CalloutContainer type="info">
  <CalloutDescription>
    The `$transaction([])` API cannot pass IDs between operations - use nested writes when you need the generated ID from one record to create another.
  </CalloutDescription>
</CalloutContainer>

Independent writes [#independent-writes]

Writes are **independent** if they don't rely on the result of a previous operation. Use these for:

* Updating the status of multiple orders to "Dispatched"
* Marking a list of emails as "Read"

Bulk operations [#bulk-operations]

```ts
const updateUsers = await prisma.user.updateMany({
  where: { email: { contains: "prisma.io" } },
  data: { role: "ADMIN" },
});
```

Using $transaction([]) for independent writes [#using-transaction-for-independent-writes]

```ts
const [deleteResult, createResult] = await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 7 } }),
  prisma.user.delete({ where: { id: 7 } }),
]);
```

Scenario: Pre-computed IDs and the $transaction([]) API [#scenario-pre-computed-ids-and-the-transaction-api]

If you pre-compute IDs (e.g., using UUIDs), you can use either nested writes or `$transaction([])` since both operations know the ID upfront.

When to use bulk operations [#when-to-use-bulk-operations]

Consider bulk operations as a solution if:

* ✔ You want to update a batch of the *same type* of record, like a batch of emails

Scenario: Marking emails as read [#scenario-marking-emails-as-read]

You are building a service like gmail.com, and your customer wants a **"Mark as read"** feature that allows users to mark all emails as read. Each update to the status of an email is an independent write because the emails do not depend on one another - for example, the "Happy Birthday! 🍰" email from your aunt is unrelated to the promotional email from IKEA.

In the following schema, a `User` can have many received emails (a one-to-many relationship):

```ts
model User {
  id    Int       @id @default(autoincrement())
  email           String @unique
  receivedEmails  Email[] // Many emails
}

model Email {
  id      Int     @id @default(autoincrement())
  user    User    @relation(fields: [userId], references: [id])
  userId  Int
  subject String
  body    String
  unread  Boolean
}
```

Based on this schema, you can use `updateMany` to mark all unread emails as read:

```ts
await prisma.email.updateMany({
  where: {
    user: {
      id: 10,
    },
    unread: true,
  },
  data: {
    unread: false,
  },
});
```

Can I use nested writes with bulk operations? [#can-i-use-nested-writes-with-bulk-operations]

No - neither `updateMany` nor `deleteMany` currently supports nested writes. For example, you cannot delete multiple teams and all of their members (a cascading delete):

```ts highlight=8;delete
await prisma.team.deleteMany({
  where: {
    id: {
      in: [2, 99, 2, 11],
    },
  },
  data: {
    members: {}, // Cannot access members here // [!code --]
  },
});
```

Can I use bulk operations with the $transaction([]) API? [#can-i-use-bulk-operations-with-the-transaction-api]

Yes — for example, you can include multiple `deleteMany` operations inside a `$transaction([])`.

$transaction([]) API [#transaction-api]

The `$transaction([])` API is generic solution to independent writes that allows you to run multiple operations as a single, atomic operation - if any operation fails, Prisma Client rolls back the entire transaction.

Its also worth noting that operations are executed according to the order they are placed in the transaction.

```ts
await prisma.$transaction([iRunFirst, iRunSecond, iRunThird]);
```

> **Note**: Using a query in a transaction does not influence the order of operations in the query itself.

As Prisma Client evolves, use cases for the `$transaction([])` API will increasingly be replaced by more specialized bulk operations (such as `createMany`) and nested writes.

When to use the $transaction([]) API [#when-to-use-the-transaction-api]

Consider the `$transaction([])` API if:

* ✔ You want to update a batch that includes different types of records, such as emails and users. The records do not need to be related in any way.
* ✔ You want to batch raw SQL queries (`$executeRaw`) - for example, for features that Prisma Client does not yet support.

Scenario: Privacy legislation [#scenario-privacy-legislation]

GDPR and other privacy legislation give users the right to request that an organization deletes all of their personal data. In the following example schema, a `User` can have many posts and private messages:

```prisma
model User {
  id              Int              @id @default(autoincrement())
  posts           Post[]
  privateMessages PrivateMessage[]
}

model Post {
  id      Int    @id @default(autoincrement())
  user    User   @relation(fields: [userId], references: [id])
  userId  Int
  title   String
  content String
}

model PrivateMessage {
  id      Int    @id @default(autoincrement())
  user    User   @relation(fields: [userId], references: [id])
  userId  Int
  message String
}
```

If a user invokes the right to be forgotten, we must delete three records: the user record, private messages, and posts. It is critical that *all* delete operations succeed together or not at all, which makes this a use case for a transaction. However, using a single bulk operation like `deleteMany` is not possible in this scenario because we need to delete across three models. Instead, we can use the `$transaction([])` API to run three operations together - two `deleteMany` and one `delete`:

```ts
const id = 9; // User to be deleted

const deletePosts = prisma.post.deleteMany({
  where: {
    userId: id,
  },
});

const deleteMessages = prisma.privateMessage.deleteMany({
  where: {
    userId: id,
  },
});

const deleteUser = prisma.user.delete({
  where: {
    id: id,
  },
});

await prisma.$transaction([deletePosts, deleteMessages, deleteUser]); // Operations succeed or fail together
```

Scenario: Pre-computed IDs and the $transaction([]) API [#scenario-pre-computed-ids-and-the-transaction-api-1]

Dependent writes are not supported by the `$transaction([])` API - if operation A relies on the ID generated by operation B, use [nested writes](#nested-writes). However, if you *pre-computed* IDs (for example, by generating GUIDs), your writes become independent. Consider the sign-up flow from the nested writes example:

```ts
await prisma.team.create({
  data: {
    name: "Aurora Adventures",
    members: {
      create: {
        email: "alice@prisma.io",
      },
    },
  },
});
```

Instead of auto-generating IDs, change the `id` fields of `Team` and `User` to a `String` (if you do not provide a value, a UUID is generated automatically). This example uses UUIDs:

```prisma highlight=2,9;delete|3,10;add
model Team {
  id      Int    @id @default(autoincrement()) // [!code --]
  id      String @id @default(uuid()) // [!code ++]
  name    String
  members User[]
}

model User {
  id    Int    @id @default(autoincrement()) // [!code --]
  id    String @id @default(uuid()) // [!code ++]
  email String @unique
  teams Team[]
}
```

Refactor the sign-up flow example to use the `$transaction([])` API instead of nested writes:

```ts
import { v4 } from "uuid";

const teamID = v4();
const userID = v4();

await prisma.$transaction([
  prisma.user.create({
    data: {
      id: userID,
      email: "alice@prisma.io",
      team: {
        id: teamID,
      },
    },
  }),
  prisma.team.create({
    data: {
      id: teamID,
      name: "Aurora Adventures",
    },
  }),
]);
```

Technically you can still use nested writes with pre-computed APIs if you prefer that syntax:

```ts
import { v4 } from "uuid";

const teamID = v4();
const userID = v4();

await prisma.team.create({
  data: {
    id: teamID,
    name: "Aurora Adventures",
    members: {
      create: {
        id: userID,
        email: "alice@prisma.io",
        team: {
          id: teamID,
        },
      },
    },
  },
});
```

There's no compelling reason to switch to manually generated IDs and the `$transaction([])` API if you are already using auto-generated IDs and nested writes.

Read, modify, write [#read-modify-write]

In some cases you may need to perform custom logic as part of an atomic operation - also known as the [read-modify-write pattern](https://en.wikipedia.org/wiki/Read%E2%80%93modify%E2%80%93write). The following is an example of the read-modify-write pattern:

* Read a value from the database
* Run some logic to manipulate that value (for example, contacting an external API)
* Write the value back to the database

All operations should **succeed or fail together** without making unwanted changes to the database, but you do not necessarily need to use an actual database transaction. This section of the guide describes two ways to work with Prisma Client and the read-modify-write pattern:

* Designing idempotent APIs
* Optimistic concurrency control

Idempotent APIs [#idempotent-apis]

Idempotency is the ability to run the same logic with the same parameters multiple times with the same result: the **effect on the database** is the same whether you run the logic once or one thousand times. For example:

* **NOT IDEMPOTENT**: Upsert (update-or-insert) a user in the database with email address `"letoya@prisma.io"`. The `User` table **does not** enforce unique email addresses. The effect on the database is different if you run the logic once (one user created) or ten times (ten users created).
* **IDEMPOTENT**: Upsert (update-or-insert) a user in the database with the email address `"letoya@prisma.io"`. The `User` table **does** enforce unique email addresses. The effect on the database is the same if you run the logic once (one user created) or ten times (existing user is updated with the same input).

Idempotency is something you can and should actively design into your application wherever possible.

When to design an idempotent API [#when-to-design-an-idempotent-api]

* ✔ You need to be able to retry the same logic without creating unwanted side-effects in the databases

Scenario: Upgrading a Slack team [#scenario-upgrading-a-slack-team]

You are creating an upgrade flow for Slack that allows teams to unlock paid features. Teams can choose between different plans and pay per user, per month. You use Stripe as your payment gateway, and extend your `Team` model to store a `stripeCustomerId`. Subscriptions are managed in Stripe.

```prisma highlight=5;normal
model Team {
  id               Int     @id @default(autoincrement())
  name             String
  User             User[]
  stripeCustomerId String? // [!code highlight]
}
```

The upgrade flow looks like this:

1. Count the number of users
2. Create a subscription in Stripe that includes the number of users
3. Associate the team with the Stripe customer ID to unlock paid features

```ts
const teamId = 9;
const planId = "plan_id";

// Count team members
const numTeammates = await prisma.user.count({
  where: {
    teams: {
      some: {
        id: teamId,
      },
    },
  },
});

// Create a customer in Stripe for plan-9454549
const customer = await stripe.customers.create({
  externalId: teamId,
  plan: planId,
  quantity: numTeammates,
});

// Update the team with the customer id to indicate that they are a customer
// and support querying this customer in Stripe from our application code.
await prisma.team.update({
  data: {
    customerId: customer.id,
  },
  where: {
    id: teamId,
  },
});
```

This example has a problem: you can only run the logic *once*. Consider the following scenario:

1. Stripe creates a new customer and subscription, and returns a customer ID
2. Updating the team **fails** - the team is not marked as a customer in the Slack database
3. The customer is charged by Stripe, but paid features are not unlocked in Slack because the team lacks a valid `customerId`
4. Running the same code again either:
   * Results in an error because the team (defined by `externalId`) already exists - Stripe never returns a customer ID
   * If `externalId` is not subject to a unique constraint, Stripe creates yet another subscription (**not idempotent**)

You cannot re-run this code in case of an error and you cannot change to another plan without being charged twice.

The following refactor (highlighted) introduces a mechanism that checks if a subscription already exists, and either creates the description or updates the existing subscription (which will remain unchanged if the input is identical):

```ts highlight=12-27;normal
// Calculate the number of users times the cost per user
const numTeammates = await prisma.user.count({
  where: {
    teams: {
      some: {
        id: teamId,
      },
    },
  },
});

// Find customer in Stripe // [!code highlight]
let customer = await stripe.customers.get({ externalId: teamID }); // [!code highlight]

if (customer) {
  // [!code highlight]
  // If team already exists, update // [!code highlight]
  customer = await stripe.customers.update({
    // [!code highlight]
    externalId: teamId, // [!code highlight]
    plan: "plan_id", // [!code highlight]
    quantity: numTeammates, // [!code highlight]
  });
} else {
  customer = await stripe.customers.create({
    // If team does not exist, create customer
    externalId: teamId,
    plan: "plan_id",
    quantity: numTeammates,
  });
}

// Update the team with the customer id to indicate that they are a customer
// and support querying this customer in Stripe from our application code.
await prisma.team.update({
  data: {
    customerId: customer.id,
  },
  where: {
    id: teamId,
  },
});
```

You can now retry the same logic multiple times with the same input without adverse effect. To further enhance this example, you can introduce a mechanism whereby the subscription is cancelled or temporarily deactivated if the update does not succeed after a set number of attempts.

Optimistic concurrency control [#optimistic-concurrency-control]

Optimistic concurrency control (OCC) is a model for handling concurrent operations on a single entity that does not rely on 🔒 locking. Instead, we **optimistically** assume that a record will remain unchanged in between reading and writing, and use a concurrency token (a timestamp or version field) to detect changes to a record.

If a ❌ conflict occurs (someone else has changed the record since you read it), you cancel the transaction. Depending on your scenario, you can then:

* Re-try the transaction (book another cinema seat)
* Throw an error (alert the user that they are about to overwrite changes made by someone else)

This section describes how to build your own optimistic concurrency control. See also: Plans for [application-level optimistic concurrency control on GitHub](https://github.com/prisma/prisma/issues/4988)

When to use optimistic concurrency control [#when-to-use-optimistic-concurrency-control]

* ✔ You anticipate a high number of concurrent requests (multiple people booking cinema seats)
* ✔ You anticipate that conflicts between those concurrent requests will be rare

Avoiding locks in an application with a high number of concurrent requests makes the application more resilient to load and more scalable overall. Although locking is not inherently bad, locking in a high concurrency environment can lead to unintended consequences - even if you are locking individual rows, and only for a short amount of time. For more information, see:

* [Why ROWLOCK Hints Can Make Queries Slower and Blocking Worse in SQL Server](https://kendralittle.com/2016/02/04/why-rowlock-hints-can-make-queries-slower-and-blocking-worse-in-sql-server/)

Scenario: Reserving a seat at the cinema [#scenario-reserving-a-seat-at-the-cinema]

You are creating a booking system for a cinema. Each movie has a set number of seats. The following schema models movies and seats:

```ts
model Seat {
  id        Int   @id @default(autoincrement())
  userId    Int?
  claimedBy User? @relation(fields: [userId], references: [id])
  movieId   Int
  movie     Movie @relation(fields: [movieId], references: [id])
}

model Movie {
  id    Int    @id     @default(autoincrement())
  name  String @unique
  seats Seat[]
}
```

The following sample code finds the first available seat and assigns that seat to a user:

```ts
const movieName = "Hidden Figures";

// Find first available seat
const availableSeat = await prisma.seat.findFirst({
  where: {
    movie: {
      name: movieName,
    },
    claimedBy: null,
  },
});

// Throw an error if no seats are available
if (!availableSeat) {
  throw new Error(`Oh no! ${movieName} is all booked.`);
}

// Claim the seat
await prisma.seat.update({
  data: {
    claimedBy: userId,
  },
  where: {
    id: availableSeat.id,
  },
});
```

However, this code suffers from the "double-booking problem" - it is possible for two people to book the same seats:

1. Seat 3A returned to Sorcha (`findFirst`)
2. Seat 3A returned to Ellen (`findFirst`)
3. Seat 3A claimed by Sorcha (`update`)
4. Seat 3A claimed by Ellen (`update` - overwrites Sorcha's claim)

Even though Sorcha has successfully booked the seat, the system ultimately stores Ellen's claim. To solve this problem with optimistic concurrency control, add a `version` field to the seat:

```prisma highlight=7;normal
model Seat {
  id        Int   @id @default(autoincrement())
  userId    Int?
  claimedBy User? @relation(fields: [userId], references: [id])
  movieId   Int
  movie     Movie @relation(fields: [movieId], references: [id])
  version   Int // [!code highlight]
}
```

Next, adjust the code to check the `version` field before updating:

```ts highlight=19-38;normal
const userEmail = "alice@prisma.io";
const movieName = "Hidden Figures";

// Find the first available seat
// availableSeat.version might be 0
const availableSeat = await client.seat.findFirst({
  where: {
    Movie: {
      name: movieName,
    },
    claimedBy: null,
  },
});

if (!availableSeat) {
  throw new Error(`Oh no! ${movieName} is all booked.`);
}

// Only mark the seat as claimed if the availableSeat.version // [!code highlight]
// matches the version we're updating. Additionally, increment the // [!code highlight]
// version when we perform this update so all other clients trying // [!code highlight]
// to book this same seat will have an outdated version. // [!code highlight]
const seats = await client.seat.updateMany({
  // [!code highlight]
  data: {
    // [!code highlight]
    claimedBy: userEmail, // [!code highlight]
    version: {
      // [!code highlight]
      increment: 1, // [!code highlight]
    }, // [!code highlight]
  }, // [!code highlight]
  where: {
    // [!code highlight]
    id: availableSeat.id, // [!code highlight]
    version: availableSeat.version, // This version field is the key; only claim seat if in-memory version matches database version, indicating that the field has not been updated // [!code highlight]
  }, // [!code highlight]
}); // [!code highlight]

if (seats.count === 0) {
  // [!code highlight]
  throw new Error(`That seat is already booked! Please try again.`); // [!code highlight]
} // [!code highlight]
```

It is now impossible for two people to book the same seat:

1. Seat 3A returned to Sorcha (`version` is 0)
2. Seat 3A returned to Ellen (`version` is 0)
3. Seat 3A claimed by Sorcha (`version` is incremented to 1, booking succeeds)
4. Seat 3A claimed by Ellen (in-memory `version` (0) does not match database `version` (1) - booking does not succeed)

Interactive transactions [#interactive-transactions-1]

If you have an existing application, it can be a significant undertaking to refactor your application to use optimistic concurrency control. Interactive Transactions offers a useful escape hatch for cases like this.

To create an interactive transaction, pass an async function into [$transaction](#transaction-api).

The first argument passed into this async function is an instance of the Prisma Client. Below, we will call this instance `tx`. Any Prisma Client call invoked on this `tx` instance is encapsulated into the transaction.

In the example below, Alice and Bob each have $100 in their account. If they try to send more money than they have, the transfer is rejected.

The expected outcome would be for Alice to make 1 transfer for $100 and the other transfer would be rejected. This would result in Alice having $0 and Bob having $200.

```ts
import { PrismaClient } from "../prisma/generated/client";
const prisma = new PrismaClient();

async function transfer(from: string, to: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Decrement amount from the sender.
    const sender = await tx.account.update({
      data: {
        balance: {
          decrement: amount,
        },
      },
      where: {
        email: from,
      },
    });

    // 2. Verify that the sender's balance didn't go below zero.
    if (sender.balance < 0) {
      throw new Error(`${from} doesn't have enough to send ${amount}`);
    }

    // 3. Increment the recipient's balance by amount
    const recipient = tx.account.update({
      data: {
        balance: {
          increment: amount,
        },
      },
      where: {
        email: to,
      },
    });

    return recipient;
  });
}

async function main() {
  // This transfer is successful
  await transfer("alice@prisma.io", "bob@prisma.io", 100);
  // This transfer fails because Alice doesn't have enough funds in her account
  await transfer("alice@prisma.io", "bob@prisma.io", 100);
}

main();
```

In the example above, both `update` queries run within a database transaction. When the application reaches the end of the function, the transaction is **committed** to the database.

If the application encounters an error along the way, the async function will throw an exception and automatically **rollback** the transaction.

You can learn more about interactive transactions in this [section](#interactive-transactions).

<CalloutContainer type="warning">
  <CalloutDescription>
    **Use interactive transactions with caution**. Keeping transactions
    open for a long time hurts database performance and can even cause deadlocks.
    Try to avoid performing network requests and executing slow queries inside your
    transaction functions. We recommend you get in and out as quick as possible!
  </CalloutDescription>
</CalloutContainer>

Conclusion [#conclusion]

Prisma Client supports multiple ways of handling transactions, either directly through the API or by supporting your ability to introduce optimistic concurrency control and idempotency into your application. If you feel like you have use cases in your application that are not covered by any of the suggested options, please open a [GitHub issue](https://github.com/prisma/prisma/issues/new/choose) to start a discussion.
# Query optimization (/docs/orm/prisma-client/queries/advanced/query-optimization-performance)



This page covers identifying and optimizing query performance with Prisma ORM.

Query Insights [#query-insights]

[Query Insights](/query-insights) is built into Prisma Postgres and shows you which queries are slow, how expensive they are, and what to fix. It works out of the box for raw SQL, but to see Prisma ORM operations (model name, action, query shape) you need one extra step.

Enabling Prisma ORM attribution [#enabling-prisma-orm-attribution]

Install `@prisma/sqlcommenter-query-insights`:

```bash
npm install @prisma/sqlcommenter-query-insights
```

Then pass it to the `comments` option in your `PrismaClient` constructor:

```ts
import { prismaQueryInsights } from "@prisma/sqlcommenter-query-insights";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: myAdapter, // driver adapter or Accelerate URL required
  comments: [prismaQueryInsights()],
});
```

This adds a SQL comment to every query containing the model, action, and parameterized query shape. Query Insights uses these annotations to trace SQL back to the exact Prisma call that generated it — even when a single Prisma call produces multiple SQL statements.

Let your AI agent handle setup [#let-your-ai-agent-handle-setup]

Copy this prompt into your AI coding assistant:

```
Install and configure @prisma/sqlcommenter-query-insights in my project so I can
see Prisma ORM queries in Query Insights. Docs: https://www.prisma.io/docs/query-insights
```

Debugging performance issues [#debugging-performance-issues]

Common causes of slow queries:

* Over-fetching data
* Missing indexes
* Not caching repeated queries
* Full table scans

Use [Query Insights](/query-insights) to identify which queries are affected and what to change.

Using bulk queries [#using-bulk-queries]

It is generally more performant to read and write large amounts of data in bulk - for example, inserting `50,000` records in batches of `1000` rather than as `50,000` separate inserts. `PrismaClient` supports the following bulk queries:

* [`createMany()`](/orm/reference/prisma-client-reference#createmany)
* [`createManyAndReturn()`](/orm/reference/prisma-client-reference#createmanyandreturn)
* [`deleteMany()`](/orm/reference/prisma-client-reference#deletemany)
* [`updateMany()`](/orm/reference/prisma-client-reference#updatemany)
* [`updateManyAndReturn()`](/orm/reference/prisma-client-reference#updatemanyandreturn)
* [`findMany()`](/orm/reference/prisma-client-reference#findmany)

Reuse PrismaClient or use connection pooling to avoid database connection pool exhaustion [#reuse-prismaclient-or-use-connection-pooling-to-avoid-database-connection-pool-exhaustion]

Creating multiple instances of `PrismaClient` can exhaust your database connection pool, especially in serverless or edge environments, potentially slowing down other queries. Learn more in the [serverless challenge](/orm/prisma-client/setup-and-configuration/databases-connections#the-serverless-challenge).

For applications with a traditional server, instantiate `PrismaClient` once and reuse it throughout your app instead of creating multiple instances. For example, instead of:

```ts title="query.ts"
async function getPosts() {
  const prisma = new PrismaClient();
  await prisma.post.findMany();
}

async function getUsers() {
  const prisma = new PrismaClient();
  await prisma.user.findMany();
}
```

Define a single `PrismaClient` instance in a dedicated file and re-export it for reuse:

```ts title="db.ts"
export const prisma = new PrismaClient();
```

Then import the shared instance:

```ts title="query.ts"
import { prisma } from "db.ts";

async function getPosts() {
  await prisma.post.findMany();
}

async function getUsers() {
  await prisma.user.findMany();
}
```

For serverless development environments with frameworks that use HMR (Hot Module Replacement), ensure you properly handle a [single instance of Prisma in development](/orm/more/troubleshooting/nextjs#best-practices-for-using-prisma-client-in-development).

Solving the n+1 problem [#solving-the-n1-problem]

The n+1 problem occurs when looping through query results and performing one additional query **per result**.

Using findUnique() with the fluent API [#using-findunique-with-the-fluent-api]

Prisma's dataloader automatically batches `findUnique()` queries in the same tick. Use the fluent API to return related data:

```ts
// Instead of findMany per user, use:
return context.prisma.user
  .findUnique({ where: { id: parent.id } })
  .posts();
```

Using JOINs with relationLoadStrategy [#using-joins-with-relationloadstrategy]

```ts
const posts = await prisma.post.findMany({
  relationLoadStrategy: "join",
  where: { authorId: parent.id },
});
```

* All criteria of the `where` filter are on scalar fields (unique or non-unique) of the same model you're querying.
* All criteria use the `equal` filter, whether that's via the shorthand or explicit syntax `(where: { field: <val>, field1: { equals: <val> } })`.
* No boolean operators or relation filters are present.

Automatic batching of `findUnique()` is particularly useful in a **GraphQL context**. GraphQL runs a separate resolver function for every field, which can make it difficult to optimize a nested query.

For example - the following GraphQL runs the `allUsers` resolver to get all users, and the `posts` resolver **once per user** to get each user's posts (n+1):

```js
query {
  allUsers {
    id,
    posts {
      id
    }
  }
}
```

The `allUsers` query uses `user.findMany(..)` to return all users:

```ts highlight=7;normal
const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("allUsers", {
      type: "User",
      resolve: (_parent, _args, context) => {
        return context.prisma.user.findMany();
      },
    });
  },
});
```

This results in a single SQL query:

```js
{
  timestamp: 2021-02-19T09:43:06.332Z,
  query: 'SELECT `dev`.`User`.`id`, `dev`.`User`.`email`, `dev`.`User`.`name` FROM `dev`.`User` WHERE 1=1 LIMIT ? OFFSET ?',
  params: '[-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
```

However, the resolver function for `posts` is then invoked **once per user**. This results in a `findMany()` query **✘ per user** rather than a single `findMany()` to return all posts by all users (expand CLI output to see queries).

```ts highlight=10-13;normal;
const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.nonNull.string("email");
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve: (parent, _, context) => {
        return context.prisma.post.findMany({
          where: { authorId: parent.id || undefined },
        });
      },
    });
  },
});
```

```json
{
  timestamp: 2021-02-19T09:43:06.343Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` = ? LIMIT ? OFFSET ?',
  params: '[1,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:43:06.347Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` = ? LIMIT ? OFFSET ?',
  params: '[3,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:43:06.348Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` = ? LIMIT ? OFFSET ?',
  params: '[2,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:43:06.348Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` = ? LIMIT ? OFFSET ?',
  params: '[4,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:43:06.348Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` = ? LIMIT ? OFFSET ?',
  params: '[5,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
// And so on
```

Solution 1: Batching queries with the fluent API [#solution-1-batching-queries-with-the-fluent-api]

Use `findUnique()` in combination with [the fluent API](/orm/prisma-client/queries/relation-queries#fluent-api) (`.posts()`) as shown to return a user's posts. Even though the resolver is called once per user, the Prisma dataloader in Prisma Client **✔ batches the `findUnique()` queries**.

<CalloutContainer type="info">
  <CalloutDescription>
    It may seem counterintuitive to use a `prisma.user.findUnique(...).posts()` query to return posts instead of `prisma.posts.findMany()` - particularly as the former results in two queries rather than one.

    The **only** reason you need to use the fluent API (`user.findUnique(...).posts()`) to return posts is that the dataloader in Prisma Client batches `findUnique()` queries and does not currently [batch `findMany()` queries](https://github.com/prisma/prisma/issues/1477).

    When the dataloader batches `findMany()` queries or your query has the `relationStrategy` set to `join`, you no longer need to use `findUnique()` with the fluent API in this way.
  </CalloutDescription>
</CalloutContainer>

```ts highlight=13-18;add|10-12;delete
const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.nonNull.string("email");
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve: (parent, _, context) => {
        return context.prisma.post.findMany({
          // [!code --]
          where: { authorId: parent.id || undefined }, // [!code --]
        }); // [!code --]
        return context.prisma.user // [!code ++]
          .findUnique({
            // [!code ++]
            where: { id: parent.id || undefined }, // [!code ++]
          }) // [!code ++]
          .posts(); // [!code ++]
      }, // [!code ++]
    });
  },
});
```

```json
{
  timestamp: 2021-02-19T09:59:46.340Z,
  query: 'SELECT `dev`.`User`.`id`, `dev`.`User`.`email`, `dev`.`User`.`name` FROM `dev`.`User` WHERE 1=1 LIMIT ? OFFSET ?',
  params: '[-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:59:46.350Z,
  query: 'SELECT `dev`.`User`.`id` FROM `dev`.`User` WHERE `dev`.`User`.`id` IN (?,?,?) LIMIT ? OFFSET ?',
  params: '[1,2,3,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
{
  timestamp: 2021-02-19T09:59:46.350Z,
  query: 'SELECT `dev`.`Post`.`id`, `dev`.`Post`.`createdAt`, `dev`.`Post`.`updatedAt`, `dev`.`Post`.`title`, `dev`.`Post`.`content`, `dev`.`Post`.`published`, `dev`.`Post`.`viewCount`, `dev`.`Post`.`authorId` FROM `dev`.`Post` WHERE `dev`.`Post`.`authorId` IN (?,?,?) LIMIT ? OFFSET ?',
  params: '[1,2,3,-1,0]',
  duration: 0,
  target: 'quaint::connector::metrics'
}
```

If the `posts` resolver is invoked once per user, the dataloader in Prisma Client groups `findUnique()` queries with the same parameters and selection set. Each group is optimized into a single `findMany()`.

Solution 2: Using JOINs to perform queries [#solution-2-using-joins-to-perform-queries]

You can perform the query with a [database join](/orm/prisma-client/queries/relation-queries#relation-load-strategies-preview) by setting `relationLoadStrategy` to `"join"`, ensuring that only **one** query is executed against the database.

```ts
const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.nonNull.string("email");
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve: (parent, _, context) => {
        return context.prisma.post.findMany({
          relationLoadStrategy: "join",
          where: { authorId: parent.id || undefined },
        });
      },
    });
  },
});
```

Avoiding n+1 in loops [#avoiding-n1-in-loops]

Don't loop with separate queries:

```ts
// BAD: n+1 queries
const users = await prisma.user.findMany({});
users.forEach(async (usr) => {
  const posts = await prisma.post.findMany({ where: { authorId: usr.id } });
});
```

Use `include` or `in` filter instead:

```ts
// GOOD: 2 queries with include
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true },
});

// GOOD: 2 queries with in filter
const users = await prisma.user.findMany({});
const posts = await prisma.post.findMany({
  where: { authorId: { in: users.map(u => u.id) } },
});

// BEST: 1 query with join
const posts = await prisma.post.findMany({
  relationLoadStrategy: "join",
  where: { authorId: { in: users.map(u => u.id) } },
});
```

This is not an efficient way to query. Instead, you can:

* Use nested reads ([`include`](/orm/reference/prisma-client-reference#include) ) to return users and related posts
* Use the [`in`](/orm/reference/prisma-client-reference#in) filter
* Set the [`relationLoadStrategy`](/orm/prisma-client/queries/relation-queries#relation-load-strategies-preview) to `"join"`

Solving n+1 with include [#solving-n1-with-include]

You can use `include` to return each user's posts. This only results in **two** SQL queries - one to get users, and one to get posts. This is known as a [nested read](/orm/prisma-client/queries/relation-queries#nested-reads).

```ts
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: true,
  },
});
```

```sql
SELECT "public"."User"."id", "public"."User"."email", "public"."User"."name" FROM "public"."User" WHERE 1=1 OFFSET $1
SELECT "public"."Post"."id", "public"."Post"."title", "public"."Post"."authorId" FROM "public"."Post" WHERE "public"."Post"."authorId" IN ($1,$2,$3,$4) OFFSET $5
```

Solving n+1 with in [#solving-n1-with-in]

If you have a list of user IDs, you can use the `in` filter to return all posts where the `authorId` is `in` that list of IDs:

```ts
const users = await prisma.user.findMany({});

const userIds = users.map((x) => x.id);

const posts = await prisma.post.findMany({
  where: {
    authorId: {
      in: userIds,
    },
  },
});
```

```sql
SELECT "public"."User"."id", "public"."User"."email", "public"."User"."name" FROM "public"."User" WHERE 1=1 OFFSET $1
SELECT "public"."Post"."id", "public"."Post"."createdAt", "public"."Post"."updatedAt", "public"."Post"."title", "public"."Post"."content", "public"."Post"."published", "public"."Post"."authorId" FROM "public"."Post" WHERE "public"."Post"."authorId" IN ($1,$2,$3,$4) OFFSET $5
```

Solving n+1 with relationLoadStrategy: "join" [#solving-n1-with-relationloadstrategy-join]

You can perform the query with a [database join](/orm/prisma-client/queries/relation-queries#relation-load-strategies-preview) by setting `relationLoadStrategy` to `"join"`, ensuring that only **one** query is executed against the database.

```ts
const users = await prisma.user.findMany({});

const userIds = users.map((x) => x.id);

const posts = await prisma.post.findMany({
  relationLoadStrategy: "join",
  where: {
    authorId: {
      in: userIds,
    },
  },
});
```
# Configuring error formatting (/docs/orm/prisma-client/setup-and-configuration/error-formatting)



By default, Prisma Client uses [ANSI escape characters](https://en.wikipedia.org/wiki/ANSI_escape_code) to pretty print the error stack and give recommendations on how to fix a problem. While this is very useful when using Prisma Client from the terminal, in contexts like a GraphQL API, you only want the minimal error without any additional formatting.

This page explains how error formatting can be configured with Prisma Client.

Formatting levels [#formatting-levels]

There are 3 error formatting levels:

1. **Pretty Error** (default): Includes a full stack trace with colors, syntax highlighting of the code and extended error message with a possible solution for the problem.
2. **Colorless Error**: Same as pretty errors, just without colors.
3. **Minimal Error**: The raw error message.

In order to configure these different error formatting levels, there are two options:

* Setting the config options via environment variables
* Providing the config options to the `PrismaClient` constructor

Formatting via environment variables [#formatting-via-environment-variables]

* [`NO_COLOR`](/orm/reference/environment-variables-reference#no_color): If this env var is provided, colors are stripped from the error messages. Therefore you end up with a **colorless error**. The `NO_COLOR` environment variable is a standard described [here](https://no-color.org/).
* `NODE_ENV=production`: If the env var `NODE_ENV` is set to `production`, only the **minimal error** will be printed. This allows for easier digestion of logs in production environments.

Formatting via the PrismaClient constructor [#formatting-via-the-prismaclient-constructor]

Alternatively, use the `PrismaClient` [`errorFormat`](/orm/reference/prisma-client-reference#errorformat) parameter to set the error format:

```ts
const prisma = new PrismaClient({
  errorFormat: "pretty",
});
```
# Null and undefined (/docs/orm/prisma-client/special-fields-and-types/null-and-undefined)



<CalloutContainer type="warning">
  <CalloutDescription>
    In Prisma ORM, if `undefined` is passed as a value, it is not included in the generated query. This behavior can lead to unexpected results and data loss. We strongly recommend enabling the `strictUndefinedChecks` preview feature described below.

    For documentation on the current behavior (without the `strictUndefinedChecks` Preview feature) see [current behavior](#current-behavior).
  </CalloutDescription>
</CalloutContainer>

Strict undefined checks (Preview feature) [#strict-undefined-checks-preview-feature]

The `strictUndefinedChecks` preview feature changes how Prisma Client handles `undefined` values, offering better protection against accidental data loss or unintended query behavior.

Enabling strict undefined checks [#enabling-strict-undefined-checks]

To enable this feature, add the following to your Prisma schema:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "./generated"
  previewFeatures = ["strictUndefinedChecks"]
}
```

Using strict undefined checks [#using-strict-undefined-checks]

When this feature is enabled:

1. Explicitly setting a field to `undefined` in a query will cause a runtime error.
2. To skip a field in a query, use the new `Prisma.skip` symbol instead of `undefined`.

Example usage:

```typescript
// This will throw an error
prisma.user.create({
  data: {
    name: "Alice",
    email: undefined, // Error: Cannot explicitly use undefined here
  },
});

// Use `Prisma.skip` (a symbol provided by Prisma) to omit a field
prisma.user.create({
  data: {
    name: "Alice",
    email: Prisma.skip, // This field will be omitted from the query
  },
});
```

This change helps prevent accidental deletions or updates, such as:

```typescript
// Before: This would delete all users
prisma.user.deleteMany({
  where: {
    id: undefined
  }
})

// After: This will throw an error
Invalid \`prisma.user.deleteMany()\` invocation in
/client/tests/functional/strictUndefinedChecks/test.ts:0:0
  XX })
  XX
  XX test('throws on undefined input field', async () => {
→ XX   const result = prisma.user.deleteMany({
         where: {
           id: undefined
               ~~~~~~~~~
         }
       })
Invalid value for argument \`where\`: explicitly \`undefined\` values are not allowed."
```

Migration path [#migration-path]

To migrate existing code:

```typescript
// Before
let optionalEmail: string | undefined;

prisma.user.create({
  data: {
    name: "Alice",
    email: optionalEmail,
  },
});

// After
prisma.user.create({
  data: {
    name: "Alice",
    email: optionalEmail ?? Prisma.skip, // [!code highlight]
  },
});
```

exactOptionalPropertyTypes [#exactoptionalpropertytypes]

In addition to `strictUndefinedChecks`, we also recommend enabling the TypeScript compiler option `exactOptionalPropertyTypes`. This option enforces that optional properties must match exactly, which can help catch potential issues with `undefined` values in your code. While `strictUndefinedChecks` will raise runtime errors for invalid `undefined` usage, `exactOptionalPropertyTypes` will catch these issues during the build process.

Learn more about `exactOptionalPropertyTypes` in the [TypeScript documentation](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes).

Feedback [#feedback]

As always, we welcome your feedback on this feature. Please share your thoughts and suggestions in the [GitHub discussion for this Preview feature](https://github.com/prisma/prisma/discussions/25271).

current behavior [#current-behavior]

Prisma Client differentiates between `null` and `undefined`:

* `null` is a **value**
* `undefined` means **do nothing**

<CalloutContainer type="info">
  <CalloutDescription>
    This is particularly important to account for in [a **Prisma ORM with GraphQL context**, where `null` and `undefined` are interchangeable](#null-and-undefined-in-a-graphql-resolver).
  </CalloutDescription>
</CalloutContainer>

The data below represents a `User` table. This set of data will be used in all of the examples below:

| id | name    | email                                          |
| -- | ------- | ---------------------------------------------- |
| 1  | Nikolas | [nikolas@gmail.com](mailto\:nikolas@gmail.com) |
| 2  | Martin  | [martin@gmail.com](mailto\:martin@gmail.com)   |
| 3  | *empty* | [sabin@gmail.com](mailto\:sabin@gmail.com)     |
| 4  | Tyler   | [tyler@gmail.com](mailto\:tyler@gmail.com)     |

null and undefined in queries that affect many records [#null-and-undefined-in-queries-that-affect-many-records]

This section will cover how `undefined` and `null` values affect the behavior of queries that interact with or create multiple records in a database.

Null [#null]

Consider the following Prisma Client query which searches for all users whose `name` value matches the provided `null` value:

```ts
const users = await prisma.user.findMany({
  where: {
    name: null,
  },
});
```

```json
[
  {
    "id": 3,
    "name": null,
    "email": "sabin@gmail.com"
  }
]
```

Because `null` was provided as the filter for the `name` column, Prisma Client will generate a query that searches for all records in the `User` table whose `name` column is *empty*.

Undefined [#undefined]

Now consider the scenario where you run the same query with `undefined` as the filter value on the `name` column:

```ts
const users = await prisma.user.findMany({
  where: {
    name: undefined,
  },
});
```

```json
[
  {
    "id": 1,
    "name": "Nikolas",
    "email": "nikolas@gmail.com"
  },
  {
    "id": 2,
    "name": "Martin",
    "email": "martin@gmail.com"
  },
  {
    "id": 3,
    "name": null,
    "email": "sabin@gmail.com"
  },
  {
    "id": 4,
    "name": "Tyler",
    "email": "tyler@gmail.com"
  }
]
```

Using `undefined` as a value in a filter essentially tells Prisma Client you have decided *not to define a filter* for that column.

An equivalent way to write the above query would be:

```ts
const users = await prisma.user.findMany();
```

This query will select every row from the `User` table.

<CalloutContainer type="info">
  <CalloutDescription>
    Using `undefined` as the value of any key in a Prisma Client query's parameter object will cause Prisma ORM to act as if that key was not provided at all.
  </CalloutDescription>
</CalloutContainer>

Although this section's examples focused on the `findMany` function, the same concepts apply to any function that can affect multiple records, such as `updateMany` and `deleteMany`.

null and undefined in queries that affect one record [#null-and-undefined-in-queries-that-affect-one-record]

This section will cover how `undefined` and `null` values affect the behavior of queries that interact with or create a single record in a database.

<CalloutContainer type="warning">
  <CalloutDescription>
    `null` is not a valid filter value in a `findUnique()` query.
  </CalloutDescription>
</CalloutContainer>

The query behavior when using `null` and `undefined` in the filter criteria of a query that affects a single record is very similar to the behaviors described in the previous section.

Null [#null-1]

Consider the following query where `null` is used to filter the `name` column:

```ts
const user = await prisma.user.findFirst({
  where: {
    name: null,
  },
});
```

```json
[
  {
    "id": 3,
    "name": null,
    "email": "sabin@gmail.com"
  }
]
```

Because `null` was used as the filter on the `name` column, Prisma Client will generate a query that searches for the first record in the `User` table whose `name` value is *empty*.

Undefined [#undefined-1]

If `undefined` is used as the filter value on the `name` column instead, *the query will act as if no filter criteria was passed to that column at all*.

Consider the query below:

```ts
const user = await prisma.user.findFirst({
  where: {
    name: undefined,
  },
});
```

```json
[
  {
    "id": 1,
    "name": "Nikolas",
    "email": "nikolas@gmail.com"
  }
]
```

In this scenario, the query will return the very first record in the database.

Another way to represent the above query is:

```ts
const user = await prisma.user.findFirst();
```

Although this section's examples focused on the `findFirst` function, the same concepts apply to any function that affects a single record.

null and undefined in a GraphQL resolver [#null-and-undefined-in-a-graphql-resolver]

For this example, consider a database based on the following Prisma schema:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

In the following GraphQL mutation that updates a user, both `authorEmail` and `name` accept `null`. From a GraphQL perspective, this means that fields are **optional**:

```ts
type Mutation {
  // Update author's email or name, or both - or neither!
  updateUser(id: Int!, authorEmail: String, authorName: String): User!
}
```

However, if you pass `null` values for `authorEmail` or `authorName` on to Prisma Client, the following will happen:

* If `args.authorEmail` is `null`, the query will **fail**. `email` does not accept `null`.
* If `args.authorName` is `null`, Prisma Client changes the value of `name` to `null`. This is probably not how you want an update to work.

```ts
updateUser: (parent, args, ctx: Context) => {
  return ctx.prisma.user.update({
    where: { id: Number(args.id) },
    data: {
      email: args.authorEmail, // email cannot be null // [!code highlight]
      name: args.authorName // name set to null - potentially unwanted behavior // [!code highlight]
    },
  })
},
```

Instead, set the value of `email` and `name` to `undefined` if the input value is `null`. Doing this is the same as not updating the field at all:

```ts
updateUser: (parent, args, ctx: Context) => {
  return ctx.prisma.user.update({
    where: { id: Number(args.id) },
    data: {
      email: args.authorEmail != null ? args.authorEmail : undefined, // If null, do nothing // [!code highlight]
      name: args.authorName != null ? args.authorName : undefined // If null, do nothing // [!code highlight]
    },
  })
},
```

The effect of null and undefined on conditionals [#the-effect-of-null-and-undefined-on-conditionals]

There are some caveats to filtering with conditionals which might produce unexpected results. When filtering with conditionals you might expect one result but receive another given how Prisma Client treats nullable values.

The following table provides a high-level overview of how the different operators handle 0, 1 and `n` filters.

| Operator | 0 filters         | 1 filter               | n filters            |
| -------- | ----------------- | ---------------------- | -------------------- |
| `OR`     | return empty list | validate single filter | validate all filters |
| `AND`    | return all items  | validate single filter | validate all filters |
| `NOT`    | return all items  | validate single filter | validate all filters |

This example shows how an `undefined` parameter impacts the results returned by a query that uses the [`OR`](/orm/reference/prisma-client-reference#or) operator.

```ts
interface FormData {
  name: string;
  email?: string;
}

const formData: FormData = {
  name: "Emelie",
};

const users = await prisma.user.findMany({
  where: {
    OR: [
      {
        email: {
          contains: formData.email,
        },
      },
    ],
  },
});

// returns: []
```

The query receives filters from a formData object, which includes an optional email property. In this instance, the value of the email property is `undefined`. When this query is run no data is returned.

This is in contrast to the [`AND`](/orm/reference/prisma-client-reference#and) and [`NOT`](/orm/reference/prisma-client-reference) operators, which will both return all the users
if you pass in an `undefined` value.

> This is because passing an `undefined` value to an `AND` or `NOT` operator is the same
> as passing nothing at all, meaning the `findMany` query in the example will run without any filters and return all the users.

```ts
interface FormData {
  name: string;
  email?: string;
}

const formData: FormData = {
  name: "Emelie",
};

const users = await prisma.user.findMany({
  where: {
    AND: [
      {
        email: {
          contains: formData.email,
        },
      },
    ],
  },
});

// returns: { id: 1, email: 'ems@boop.com', name: 'Emelie' }

const users = await prisma.user.findMany({
  where: {
    NOT: [
      {
        email: {
          contains: formData.email,
        },
      },
    ],
  },
});

// returns: { id: 1, email: 'ems@boop.com', name: 'Emelie' }
```
# Working with compound IDs and unique constraints (/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints)



Composite IDs and compound unique constraints can be defined in your Prisma schema using the [`@@id`](/orm/reference/prisma-schema-reference) and [`@@unique`](/orm/reference/prisma-schema-reference) attributes.

<CalloutContainer type="warning">
  <CalloutDescription>
    **MongoDB does not support `@@id`**<br />
    MongoDB does not support composite IDs, which means you cannot identify a model with a `@@id` attribute.
  </CalloutDescription>
</CalloutContainer>

A composite ID or compound unique constraint uses the combined values of two fields as a primary key or identifier in your database table. In the following example, the `postId` field and `userId` field are used as a composite ID for a `Like` table:

```prisma highlight=22;normal
model User {
  id    Int    @id @default(autoincrement())
  name  String
  post  Post[]
  likes Like[]
}

model Post {
  id      Int    @id @default(autoincrement())
  content String
  User    User?  @relation(fields: [userId], references: [id])
  userId  Int?
  likes   Like[]
}

model Like {
  postId Int
  userId Int
  User   User @relation(fields: [userId], references: [id])
  Post   Post @relation(fields: [postId], references: [id])

  @@id([postId, userId]) // [!code highlight]
}
```

Querying for records from the `Like` table (e.g. using `prisma.like.findMany()`) would return objects that look as follows:

```json
{
  "postId": 1,
  "userId": 1
}
```

Although there are only two fields in the response, those two fields make up a compound ID named `postId_userId`.

You can also create a named compound ID or compound unique constraint by using the `@@id` or `@@unique` attributes' `name` field. For example:

```prisma highlight=7;normal
model Like {
  postId Int
  userId Int
  User   User @relation(fields: [userId], references: [id])
  Post   Post @relation(fields: [postId], references: [id])

  @@id(name: "likeId", [postId, userId]) // [!code highlight]
}
```

Where you can use compound IDs and unique constraints [#where-you-can-use-compound-ids-and-unique-constraints]

Compound IDs and compound unique constraints can be used when working with *unique* data.

Below is a list of Prisma Client functions that accept a compound ID or compound unique constraint in the `where` filter of the query:

* `findUnique()`
* `findUniqueOrThrow`
* `delete`
* `update`
* `upsert`

A composite ID and a composite unique constraint is also usable when creating relational data with `connect` and `connectOrCreate`.

Filtering records by a compound ID or unique constraint [#filtering-records-by-a-compound-id-or-unique-constraint]

Although your query results will not display a compound ID or unique constraint as a field, you can use these compound values to filter your queries for unique records:

```ts highlight=3-6;normal
const like = await prisma.like.findUnique({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
});
```

<CalloutContainer type="info">
  <CalloutDescription>
    Note composite ID and compound unique constraint keys are only available as filter options for *unique* queries such as `findUnique()` and `findUniqueOrThrow`. See the [section](/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints#where-you-can-use-compound-ids-and-unique-constraints) above for a list of places these fields may be used.
  </CalloutDescription>
</CalloutContainer>

Deleting records by a compound ID or unique constraint [#deleting-records-by-a-compound-id-or-unique-constraint]

A compound ID or compound unique constraint may be used in the `where` filter of a `delete` query:

```ts highlight=3-6;normal
const like = await prisma.like.delete({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
});
```

Updating and upserting records by a compound ID or unique constraint [#updating-and-upserting-records-by-a-compound-id-or-unique-constraint]

A compound ID or compound unique constraint may be used in the `where` filter of an `update` query:

```ts highlight=3-6;normal
const like = await prisma.like.update({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
  data: {
    postId: 2,
  },
});
```

They may also be used in the `where` filter of an `upsert` query:

```ts highlight=3-6;normal
await prisma.like.upsert({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
  update: {
    userId: 2,
  },
  create: {
    userId: 2,
    postId: 1,
  },
});
```

Filtering relation queries by a compound ID or unique constraint [#filtering-relation-queries-by-a-compound-id-or-unique-constraint]

Compound IDs and compound unique constraint can also be used in the `connect` and `connectOrCreate` keys used when connecting records to create a relationship.

For example, consider this query:

```ts highlight=6-9;normal
await prisma.user.create({
  data: {
    name: "Alice",
    likes: {
      connect: {
        likeId: {
          postId: 1,
          userId: 2,
        },
      },
    },
  },
});
```

The `likeId` compound ID is used as the identifier in the `connect` object that is used to locate the `Like` table's record that will be linked to the new user: `"Alice"`.

Similarly, the `likeId` can be used in `connectOrCreate`'s `where` filter to attempt to locate an existing record in the `Like` table:

```ts highlight=10-13;normal
await prisma.user.create({
  data: {
    name: "Alice",
    likes: {
      connectOrCreate: {
        create: {
          postId: 1,
        },
        where: {
          likeId: {
            postId: 1,
            userId: 1,
          },
        },
      },
    },
  },
});
```
# Overview of Prisma Migrate (/docs/orm/prisma-migrate)



Prisma Migrate enables you to:

* Keep your database schema in sync with your [Prisma schema](/orm/prisma-schema/overview) as it evolves
* Maintain existing data in your database

Prisma Migrate generates [a history of `.sql` migration files](/orm/prisma-migrate/understanding-prisma-migrate/migration-histories), and plays a role in both [development and production](/orm/prisma-migrate/workflows/development-and-production).

Prisma Migrate can be considered a *hybrid* database schema migration tool, meaning it has both of *declarative* and *imperative* elements:

* Declarative: The data model is described in a declarative way in the [Prisma schema](/orm/prisma-schema/overview). Prisma Migrate generates SQL migration files from that data model.
* Imperative: All generated SQL migration files are fully customizable. Prisma Migrate hence provides the flexibility of an imperative migration tool by enabling you to modify what and how migrations are executed (and allows you to run custom SQL to e.g. make use of native database feature, perform data migrations, ...).

If you are prototyping, consider using the [`db push`](/orm/reference/prisma-cli-reference#db-push) command - see [Schema prototyping with `db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) for examples.

See the [Prisma Migrate reference](/orm/reference/prisma-cli-reference#prisma-migrate) for detailed information about the Prisma Migrate CLI commands.

<CalloutContainer type="info">
  <CalloutTitle>
    Does not apply for MongoDB
  </CalloutTitle>

  <CalloutDescription>
    Instead of `migrate dev` and related commands, use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) for [MongoDB](/orm/core-concepts/supported-databases/mongodb).
  </CalloutDescription>
</CalloutContainer>
# Understanding Migrations (/docs/orm/prisma-migrate/understanding-prisma-migrate/mental-model)



What are database migrations? [#what-are-database-migrations]

Database migrations are a controlled set of changes that modify and evolve the structure of your database schema. Migrations help you transition your database schema from one state to another. For example, within a migration you can create or remove tables and columns, split fields in a table, or add types and constraints to your database.

Patterns for evolving database schemas [#patterns-for-evolving-database-schemas]

For migrations, there are two main types of migrations that can be made:

* **Model/Entity-first migration:** with this pattern, you define the structure of the database schema with code and then use a migration tool to generate the SQL, for example, for syncing your application and database schema.

<img alt="Model-first migration flow" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/entity-first-migration-flow.png" width="1782" height="494" />

* **Database-first migration:** with this pattern, you define the structure of your database and apply it to your database using SQL. You then *introspect* the database to generate the code that describes the structure of your database to sync your application and database schema.

<img alt="Database-first migration flow" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/database-first-migration-flow.png" width="1667" height="620" />

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    For simplicity, we chose the terminology above to describe the different patterns for evolving database schemas. Other tools and libraries may use different terminology to describe the different patterns.
  </CalloutDescription>
</CalloutContainer>

The migration files (SQL) should ideally be stored together with your application code. They should also be tracked in version control and shared with the rest of the team working on the application. Migrations provide *state management* which helps you to track the state of the database.

Migrations also allow you to replicate the state of a database at a specific point in time which is useful when collaborating with other members of the team, e.g. switching between different branches. For further information on database migrations, see the [Prisma Data Guide](https://www.prisma.io/dataguide/types/relational/what-are-database-migrations).

What is Prisma Migrate? [#what-is-prisma-migrate]

Prisma Migrate is a database migration tool that supports the *model/ entity-first* migration pattern to manage database schemas in your local environment and in production.

The workflow when using Prisma Migrate in your project would be iterative and look like this:

Local development environment (Feature branch) [#local-development-environment-feature-branch]

* Evolve your Prisma schema
* Use either [`prisma migrate dev`](#track-your-migration-history-with-prisma-migrate-dev) or [`prisma db push`](#prototype-your-schema) to sync your Prisma schema with the database schema of your local development database

Preview/ staging environment(Feature pull request) [#preview-staging-environmentfeature-pull-request]

1. Push your changes to the feature pull request
2. Use a CI system (e.g. GitHub Actions) to sync your Prisma schema and migration history with your preview database using `prisma migrate deploy`

Production (main branch) [#production-main-branch]

* Merge your application code from the feature branch to your main branch.
* Use a CI system (e.g. GitHub Actions) to sync your Prisma schema and migration history with your production database using `prisma migrate deploy`

<img alt="Prisma Migrate workflow" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/prisma-migrate-lifecycle.png" width="2253" height="3230" />

How Prisma Migrate tracks the migration state [#how-prisma-migrate-tracks-the-migration-state]

Prisma Migrate uses the following pieces of state to track the state of your database schema:

* **Prisma schema**: your source of truth that defines the structure of the database schema.
* **Migrations history**: SQL files in your `prisma/migrations` folder representing the history of changes made to your database schema.
* **Migrations table**: `prisma_migrations` table in the database that stores metadata for migrations that have been applied to the database.
* **Database schema**: the state of the database.

<img alt="Prisma Migrate &#x22;state management&#x22;" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/prisma-migrate-state-mgt.png" width="2247" height="817" />

Requirements when working with Prisma Migrate [#requirements-when-working-with-prisma-migrate]

* Ideally, you should use one database per environment. For example, you might have a separate database for development, preview, and production environments.
* The databases you use in development environments are disposable — you can easily create, use, and delete databases on demand.
* The database configuration used in each environments should be consistent. This is important to ensure a certain migration that moves across the workflow yields the same changes to the database.
* The Prisma schema serves as the source of truth — describing the shape of your [database schema](https://www.prisma.io/dataguide/intro/database-glossary#schema).

Evolve your database schema with Prisma Migrate [#evolve-your-database-schema-with-prisma-migrate]

This section describes how you can evolve your database schema in different environments: development, staging, and production, using Prisma Migrate.

Prisma Migrate in a development environment (local) [#prisma-migrate-in-a-development-environment-local]

Track your migration history with prisma migrate dev [#track-your-migration-history-with-prisma-migrate-dev]

The [`prisma migrate dev`](/orm/reference/prisma-cli-reference#migrate-dev) command allows you to track the changes you make to your database. The `prisma migrate dev` command automatically generates SQL migration files (saved in `/prisma/migrations`) and applies them to the database. When a migration is applied to the database, the migrations table (`_prisma_migrations`) in your database is also updated.

<img alt="Prisma Migrate dev flow" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/prisma-migrate-dev-flow.png" width="2975" height="1055" />

The `prisma migrate dev` command tracks the state of the database using the following pieces of state:

* the Prisma schema
* the migrations history
* the migrations table
* the database schema

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    The pieces of state used to track the state of a migration are the same as the ones described in [how Prisma Migrate tracks the migration state](#how-prisma-migrate-tracks-the-migration-state) section.
  </CalloutDescription>
</CalloutContainer>

You can customize migrations before you apply them to the database using the `--create-only` flag. For example, you might want to edit a migration if you want to rename columns without incurring any data loss or load database extensions (in PostgreSQL) and database views (currently not supported).

Under the hood, Prisma Migrate uses a [shadow database](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) to detect a [schema drift](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database#detecting-schema-drift) and generate new migrations.

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    `prisma migrate dev` is intended to be used only in development with a disposable database.
  </CalloutDescription>
</CalloutContainer>

If `prisma migrate dev` detects a schema drift or a migration history conflict, you will be prompted to reset (drop and recreate your database) your database to sync the migration history and the database schema.

<details>
  <summary>
     Expand to see the shadow database explained using a cartoon
  </summary>

    <img alt="A cartoon that shows how the shadow database works." src="/img/orm/prisma-migrate/understanding-prisma-migrate/shadow-database.png" width="2737" height="4895" />
</details>

Resolve schema drifts [#resolve-schema-drifts]

A schema drift occurs when the expected database schema is different from what is in the migration history. For example, this can occur when you manually update the database schema without also updating the Prisma schema and `prisma/migrations` accordingly.

For such instances, you can use the [`prisma migrate diff`](/orm/reference/prisma-cli-reference#migrate-diff) command to compare your migration history and revert changes made to your database schema.

<img alt="Revert database schema with migrate diff" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/prisma-migrate-diff-flow.png" width="2220" height="752" />

You can use `migrate diff` to generate the SQL that either:

* Reverts the changes made in the database schema to synchronize it with the current Prisma schema
* Moves your database schema forward to apply missing changes from the Prisma schema and `/migrations`

You can then apply the changes to your database using [`prisma db execute`](/orm/reference/prisma-cli-reference#db-execute) command.

Prototype your schema [#prototype-your-schema]

The [`prisma db push`](/orm/reference/prisma-cli-reference#db-push) command allows you to sync your Prisma schema and database schema without persisting a migration (`/prisma/migrations`). The `prisma db push` command tracks the state of the database using the following pieces of state:

* the Prisma schema
* the database schema

<img alt="prisma db push development flow" src="/img/orm/prisma-migrate/understanding-prisma-migrate/mental-model-illustrations/db-push-flow.png" width="1682" height="455" />

The `prisma db push` command is useful when:

* You want to **quickly prototype and iterate** on schema design locally without the need to deploy these changes to other environments such as other developers, or staging and production environments.
* You are prioritizing reaching a **desired end-state** and not the changes or steps executed to reach that end-state (there is no way to preview changes made by `prisma db push`)
* You do not need to control how schema changes impact data. There is no way to orchestrate schema and data migrations - if `prisma db push` anticipates that changes will result in data loss, you can either accept data loss with the `--accept-data-loss` option or stop the process - there is no way to customize the changes.

If the `prisma db push` command detects destructive change to your database schema, it will prompt you to reset your database. For example, this will happen when you add a required field to a table with existing content without providing a default value.

<CalloutContainer type="info">
  <CalloutTitle>
    Schema Drift
  </CalloutTitle>

  <CalloutDescription>
    A [schema drift](/orm/prisma-migrate/workflows/troubleshooting#schema-drift) occurs when your database schema is out of sync with your migrations history and migrations table.
  </CalloutDescription>
</CalloutContainer>

Prisma Migrate in a staging and production environment [#prisma-migrate-in-a-staging-and-production-environment]

Sync your migration histories [#sync-your-migration-histories]

The [`prisma migrate deploy`](/orm/reference/prisma-cli-reference#migrate-deploy) command allows you to sync your migration history from your development environment with your database in your **staging or production environment**.

Under the hood, the `migrate deploy` command:

1. Compares already applied migrations (captured `_prisma_migrations`) and the migration history (`/prisma/migrations`)
2. Applies pending migrations
3. Updates `_prisma_migrations` table with the new migrations

<img alt="Workflow of Prisma Migrate" src="/img/orm/prisma-migrate/workflows/deploy-db.png" width="1320" height="1072" />

The command should be run in an automated CI/ CD environment, for example GitHub Actions.

If you don't have a migration history (`/migrations`), i.e using `prisma db push`, you will have to continue using `prisma db push` in your staging and production environments. Beware of the changes being applied to the database schema as some of them might be destructive. For example, `prisma db push` can't tell when you're performing a column rename. It will prompt a database reset (drop and re-creation).
# Migration histories (/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories)



Your migration history is the story of the changes to your data model, and is represented by:

* A `prisma/migrations` folder with a sub-folder and `migration.sql` file for each migration:

```
migrations/
  └─ 20210313140442_init/
    └─ migration.sql
  └─ 20210313140442_added_job_title/
    └─ migration.sql
```

The `migrations` folder is the **source of truth** for the history of your data model.

* A `_prisma_migrations` table in the database, which is used to check:
  * If a migration was run against the database
  * If an applied migration was deleted
  * If an applied migration was changed

If you change or delete a migration (**not** recommended), the next steps depend on whether you are in a [development environment](/orm/prisma-migrate/workflows/development-and-production#production-and-testing-environments) (and therefore using `migrate dev`) or a [production / testing environment](/orm/prisma-migrate/workflows/development-and-production#production-and-testing-environments) (and therefore using `migrate deploy`).

Do not edit or delete migrations that have been applied [#do-not-edit-or-delete-migrations-that-have-been-applied]

In general, you **should not edit or delete** a migration that has already been applied. Doing so can lead to inconsistencies between development and production environment migration histories, which may have unforeseen consequences, even if the change does not *appear* to break anything at first.

The following scenario simulates a change that creates a seemingly harmless inconsistency:

* Modify an **existing migration** that has **already been applied** in a development environment by changing the value of `VARCHAR(550)` to `VARCHAR(560)`:

  ```sql title="migrations.sql"
    -- AlterTable
   ALTER TABLE "Post" ALTER COLUMN "content" SET DATA TYPE VARCHAR(560);
  ```

  After making this change, the end state of the migration history no longer matches the Prisma schema, which still has `@db.VarChar(550)`.
* Running `prisma migrate dev` results in an error because a migration has been changed and suggests resetting the database.
* Run `prisma migrate reset` - Prisma Migrate resets the database and replays all migrations, including the migration you edited.
* After applying all existing migrations, Prisma Migrate compares the end state of the migration history to the Prisma schema and detects a discrepancy:
  * Prisma schema has `@db.VarChar(550)`
  * Database schema has `VARCHAR(560)`
* Prisma Migrate generates a new migration to change the value back to `550`, because the end state of the migration history should match the Prisma schema.
* From now on, when you use `prisma migrate deploy` to deploy migrations to production and test environments, Prisma Migrate will always **warn you** that migration histories do not match (and continue to warn you each time you run the command ) - even though the schema end states match:

  ```
  6 migrations found in prisma/migrations
  WARNING The following migrations have been modified since they were applied:
  20210310143435_change_type
  ```

A change that does not appear to break anything after a `migrate reset` can hide problems - you may end up with a bug in production that you cannot replicate in development, or the other way around - particularly if the change concerns a highly customized migration.

If Prisma Migrate reports a missing or edited migration that has already been applied, we recommend fixing the **root cause** (restoring the file or reverting the change) rather than resetting.

Committing the migration history to source control [#committing-the-migration-history-to-source-control]

You must commit the entire `prisma/migrations` folder to source control. This includes the `prisma/migrations/migration_lock.toml` file, which is used to detect if you have [attempted to change providers](/orm/prisma-migrate/understanding-prisma-migrate/limitations-and-known-issues#you-cannot-automatically-switch-database-providers).

Source-controlling the `schema.prisma` file is not enough - you must include your migration history. This is because:

* As you start to [customize migrations](/orm/prisma-migrate/workflows/development-and-production#customizing-migrations), your migration history contains **information that cannot be represented in the Prisma schema**. For example, you can customize a migration to mitigate data loss that would be caused by a breaking change.
* The `prisma migrate deploy` command, which is used to deploy changes to staging, testing, and production environments, *only* runs migration files. It does not use the Prisma schema to fetch the models.
# About the shadow database (/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database)



The shadow database is a second, *temporary* database that is **created and deleted automatically**\* each time you run `prisma migrate dev` and is primarily used to **detect problems** such as schema drift or potential data loss of the generated migration.

[`migrate diff` command](/orm/reference/prisma-cli-reference#migrate-diff) also requires a shadow database when diffing against a local `migrations` directory with `--from-migrations` or `--to-migrations`.

* If your database does not allow creation and deleting of databases (e.g. in a cloud-hosted environment), you need to [create and configure the shadow database manually](#cloud-hosted-shadow-databases-must-be-created-manually).

<CalloutContainer type="warning">
  <CalloutDescription>
    The shadow database is **not** required in production, and is not used by production-focused commands such as `prisma migrate resolve` and `prisma migrate deploy`.
  </CalloutDescription>
</CalloutContainer>

How the shadow database works [#how-the-shadow-database-works]

When you run `prisma migrate dev` to create a new migration, Prisma Migrate uses the shadow database to:

* [Detect schema drift](#detecting-schema-drift), which means checking that no **unexpected changes** have been made to the development database
* [Generate new migrations](#generating-new-migrations) and evaluate if those could lead to **data loss** when applied

Detecting schema drift [#detecting-schema-drift]

To detect drift in development, Prisma Migrate:

* Creates a fresh copy of the shadow database (or performs a soft reset if the shadow database is configured via [`shadowDatabaseUrl`](/orm/reference/prisma-schema-reference#datasource))
* Reruns the **current**, existing migration history in the shadow database.
* **Introspects** the shadow database to generate the 'current state' of your Prisma schema.
* Compares the end state of the current migration history to the development database.
* Reports **schema drift** if the end state of the current migration history (via the shadow database) does not match the development database (for example, due to a manual change)

If Prisma Migrate does not detect schema drift, it moves on to [generating new migrations](#generating-new-migrations).

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    The shadow database is not responsible for checking if a migration file has been **edited or deleted**. This is done using the `checksum` field in the `_prisma_migrations` table.
  </CalloutDescription>
</CalloutContainer>

If Prisma Migrate detects schema drift, it outputs detailed information about which parts of the database have drifted. The following example output could be shown when the development database has been modified manually: The `Color` enum is missing the expected variant `RED` and includes the unexpected variant `TRANSPARENT`:

```
[*] Changed the `Color` enum
  [+] Added variant `TRANSPARENT`
  [-] Removed variant `RED`
```

Generating new migrations [#generating-new-migrations]

Assuming Prisma Migrate did not [detect schema drift](#detecting-schema-drift), it moves on to generating new migrations from Prisma schema changes. To generate new migrations, Prisma Migrate:

1. Calculates the target database schema as a function of the current Prisma schema.
2. Compares the end state of the existing migration history and the target schema, and generates steps to get from one to the other.
3. Renders these steps to a SQL string and saves it in the new migration file.
4. Evaluate data loss caused by the SQL and warns about that.
5. Applies the generated migration to the development database (assuming you have not specified the `--create-only` flag)
6. Drops the shadow database (shadow databases configured via [`shadowDatabaseUrl`](/orm/reference/prisma-schema-reference#datasource) are not dropped, but are reset at the start of the `migrate dev` command)

Manually configuring the shadow database [#manually-configuring-the-shadow-database]

In some cases it might make sense (e.g. when [creating and dropping databases is not allowed on cloud-hosted databases](#cloud-hosted-shadow-databases-must-be-created-manually)) to manually define the connection string and name of the database that should be used as the shadow database for `migrate dev`. In such a case you can:

1. Create a dedicated database that should be used as the shadow database
2. Add the connection string of that database your environment variable `SHADOW_DATABASE_URL` (or `.env` file)
3. Configure the `shadowDatabaseUrl` field in `prisma.config.ts` under the `datasource` object. In Prisma 6 and below, add the `shadowDatabaseUrl` field to the `datasource` block in your `schema.prisma` file.

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"), // [!code highlight]
  },
});
```

<CalloutContainer type="warning">
  <CalloutTitle>
    Important
  </CalloutTitle>

  <CalloutDescription>
    Do not use the exact same values for `url` and `shadowDatabaseUrl` as that might delete all the data in your database.
  </CalloutDescription>
</CalloutContainer>

Cloud-hosted shadow databases must be created manually [#cloud-hosted-shadow-databases-must-be-created-manually]

Some cloud providers do not allow you to drop and create databases with SQL. Some require to create or drop the database via an online interface, and some really limit you to 1 database. If you **develop** in such a cloud-hosted environment, you must:

1. Create a dedicated cloud-hosted shadow database
2. Add the URL to your environment variable `SHADOW_DATABASE_URL`
3. Configure the `shadowDatabaseUrl` field in `prisma.config.ts` under the `datasource` object. In Prisma 6 and below, add the `shadowDatabaseUrl` field to the `datasource` block in your `schema.prisma` file.

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"), // [!code highlight]
  },
});
```

<CalloutContainer type="warning">
  <CalloutTitle>
    Important
  </CalloutTitle>

  <CalloutDescription>
    Do not use the exact same values for `url` and `shadowDatabaseUrl` as that might delete all the data in your database.
  </CalloutDescription>
</CalloutContainer>

Shadow database user permissions [#shadow-database-user-permissions]

In order to create and delete the shadow database when using `migrate dev`, Prisma Migrate currently requires that the database user defined in your `datasource` has permission to **create databases**.

| Database             | Database user requirements                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SQLite               | No special requirements.                                                                                                                                                                                               |
| MySQL/MariaDB        | Database user must have `CREATE, ALTER, DROP, REFERENCES ON *.*` privileges                                                                                                                                            |
| PostgreSQL           | The user must be a super user or have `CREATEDB` privilege. See `CREATE ROLE` ([PostgreSQL official documentation](https://www.postgresql.org/docs/12/sql-createrole.html))                                            |
| Microsoft SQL Server | The user must be a site admin or have the `SERVER` securable. See the [official documentation](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver15). |

Prisma Migrate throws the following error if it cannot create the shadow database with the credentials your connection URL supplied:

```
Error: A migration failed when applied to the shadow database
Database error: Error querying the database: db error: ERROR: permission denied to create database
```

To resolve this error:

* If you are working locally, we recommend that you update the database user's privileges.
* If you are developing against a database that does not allow creating and dropping databases (for any reason) see [Manually configuring the shadow database](#manually-configuring-the-shadow-database)
* If you are developing against a cloud-based database (for example, on Heroku, Digital Ocean, or Vercel Postgres) see: [Cloud-hosted shadow databases](#cloud-hosted-shadow-databases-must-be-created-manually).
* If you are developing against a cloud-based database (for example, on Heroku, Digital Ocean, or Vercel Postgres) and are currently **prototyping** such that you don't care about generated migration files and only need to apply your Prisma schema to the database schema, you can run [`prisma db push`](/orm/reference/prisma-cli-reference#db) instead of the `prisma migrate dev` command.

<CalloutContainer type="info">
  <CalloutTitle>
    Important
  </CalloutTitle>

  <CalloutDescription>
    The shadow database is *only* required in a development environment (specifically for the `prisma migrate dev` command) - you **do not** need to make any changes to your production environment.
  </CalloutDescription>
</CalloutContainer>

# Development and production (/docs/orm/prisma-migrate/workflows/development-and-production)



In a development environment, use the `migrate dev` command to generate and apply migrations:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Create and apply migrations [#create-and-apply-migrations]

<CalloutContainer type="error">
  <CalloutDescription>
    `migrate dev` is a development command and should never be used in a production environment.
  </CalloutDescription>
</CalloutContainer>

This command:

* Reruns the existing migration history in the [shadow database](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) in order to detect schema drift (edited or deleted migration file, or a manual changes to the database schema)
* Applies pending migrations to the shadow database (for example, new migrations created by colleagues)
* If it detects changes to the Prisma schema, it generates a new migration from these changes
* Applies all unapplied migrations to the development database and updates the `_prisma_migrations` table
* Triggers the generation of artifacts (for example, Prisma Client)

The `migrate dev` command will prompt you to reset the database in the following scenarios:

* Migration history conflicts caused by [modified or missing migrations](/orm/prisma-migrate/understanding-prisma-migrate/migration-histories#do-not-edit-or-delete-migrations-that-have-been-applied)
* The database schema has drifted away from the end-state of the migration history

Reset the development database [#reset-the-development-database]

You can also `reset` the database yourself to undo manual changes or `db push` experiments by running:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate reset
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="warning">
  <CalloutDescription>
    `migrate reset` is a development command and should never be used in a production environment.
  </CalloutDescription>
</CalloutContainer>

This command:

* Drops the database/schema¹ if possible, or performs a soft reset if the environment does not allow deleting databases/schemas\*
* Creates a new database/schema¹ with the same name if the database/schema¹ was dropped
* Applies all migrations
* Runs seed scripts

<CalloutContainer type="info">
  <CalloutDescription>
    For MySQL and MongoDB this refers to the database, for PostgreSQL and SQL Server to the schema, and for SQLite to the database file.
  </CalloutDescription>
</CalloutContainer>

For a simple and integrated way to re-create data in your development database as often as needed, check out our [seeding guide](/orm/prisma-migrate/workflows/seeding).

Customizing migrations [#customizing-migrations]

Sometimes, you need to modify a migration **before applying it**. For example:

* You want to introduce a significant refactor, such as changing blog post tags from a `String[]` to a `Tag[]`
* You want to [rename a field](/orm/prisma-migrate/workflows/customizing-migrations#example-rename-a-field) (by default, Prisma Migrate will drop the existing field)
* You want to [change the direction of a 1-1 relationship](/orm/prisma-migrate/workflows/customizing-migrations#example-change-the-direction-of-a-1-1-relation)
* You want to add features that cannot be represented in Prisma Schema Language - such as a stored procedure or a trigger.

The `--create-only` command allows you to create a migration without applying it:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --create-only
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To apply the edited migration, run `prisma migrate dev` again.

Refer to [Customizing migrations](/orm/prisma-migrate/workflows/customizing-migrations) for examples.

Team development [#team-development]

See: [Team development with Prisma Migrate](/orm/prisma-migrate/workflows/development-and-production) .

Production and testing environments [#production-and-testing-environments]

In production and testing environments, use the `migrate deploy` command to apply migrations:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate deploy
    ```
  </CodeBlockTab>
</CodeBlockTabs>

`migrate deploy` should generally be part of an automated CI/CD pipeline, and we do not recommend running this command locally to deploy changes to a production database.

This command:

* Compares applied migrations against the migration history and **warns** if any migrations have been modified:

  ```bash
  WARNING The following migrations have been modified since they were applied:
  20210313140442_favorite_colors
  ```
* Applies pending migrations

The `migrate deploy` command:

* **Does not** issue a warning if an already applied migration is *missing* from migration history
* **Does not** detect drift (production database schema differs from migration history end state - for example, due to a hotfix)
* **Does not** reset the database or generate artifacts (such as Prisma Client)
* **Does not** rely on a shadow database

See also:

* [Prisma Migrate in deployment](/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
* [Production troubleshooting](/orm/prisma-migrate/workflows/patching-and-hotfixing)

Advisory locking [#advisory-locking]

Prisma Migrate makes use of advisory locking when you run production commands such as:

* `prisma migrate deploy`
* `prisma migrate dev`
* `prisma migrate resolve`

This safeguard ensures that multiple commands cannot run at the same time - for example, if you merge two pull requests in quick succession.

Advisory locking has a **10 second timeout** (not configurable), and uses the default advisory locking mechanism available in the underlying provider:

* [PostgreSQL](https://www.postgresql.org/docs/9.4/explicit-locking.html#ADVISORY-LOCKS)
* [MySQL](https://dev.mysql.com/doc/refman/5.7/en/locking-functions.html)
* [Microsoft SQL server](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver15)

Prisma Migrate's implementation of advisory locking is purely to avoid catastrophic errors - if your command times out, you will need to run it again.

Since `5.3.0`, the advisory locking can be disabled using the [`PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK` environment variable](/orm/reference/environment-variables-reference#prisma_schema_disable_advisory_lock)
# Customizing migrations (/docs/orm/prisma-migrate/workflows/customizing-migrations)



In some scenarios, you need to edit a migration file before you apply it. For example, to [change the direction of a 1-1 relation](#example-change-the-direction-of-a-1-1-relation) (moving the foreign key from one side to another) without data loss, you need to move data as part of the migration - this SQL is not part of the default migration, and must be written by hand.

This guide explains how to edit migration files and gives some examples of use cases where you may want to do this.

How to edit a migration file [#how-to-edit-a-migration-file]

To edit a migration file before applying it, the general procedure is the following:

* Make a schema change that requires custom SQL (for example, to preserve existing data)
* Create a draft migration using:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --create-only
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Modify the generated SQL file.
* Apply the modified SQL by running:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Example: Rename a field [#example-rename-a-field]

By default, renaming a field in the schema results in a migration that will:

* `CREATE` a new column (for example, `fullname`)
* `DROP` the existing column (for example, `name`) and the data in that column

To actually **rename** a field and avoid data loss when you run the migration in production, you need to modify the generated migration SQL before applying it to the database. Consider the following schema fragment - the `biograpy` field is spelled wrong.

```prisma highlight=3;normal; title="schema.prisma"
model Profile {
  id       Int    @id @default(autoincrement())
  biograpy String // [!code highlight]
  userId   Int    @unique
  user     User   @relation(fields: [userId], references: [id])
}
```

To rename the `biograpy` field to `biography`:

Rename the field in the schema:

```prisma highlight=3;delete|4;add; title="schema.prisma
model Profile {
  id        Int    @id @default(autoincrement())
  biograpy  String // [!code --]
  biography String // [!code ++]
  userId    Int    @unique
  user      User   @relation(fields: [userId], references: [id])
}
```

* Run the following command to create a **draft migration** that you can edit before applying to the database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Edit the draft migration as shown, changing `DROP` / `DELETE` to a single `RENAME COLUMN`:

<CodeBlockTabs defaultValue="Before">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Before">
      Before
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="After">
      After
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Before">
    ```sql title="migration.sql" 
    ALTER TABLE "Profile" DROP COLUMN "biograpy",
    ADD COLUMN  "biography" TEXT NOT NULL;
    ```
  </CodeBlockTab>

  <CodeBlockTab value="After">
    ```sql title="migration.sql" 
    ALTER TABLE "Profile"
    RENAME COLUMN "biograpy" TO "biography"
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Save and apply the migration:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

You can use the same technique to rename a `model` - edit the generated SQL to *rename* the table rather than drop and re-create it.

Example: Use the expand and contract pattern to evolve the schema without downtime [#example-use-the-expand-and-contract-pattern-to-evolve-the-schema-without-downtime]

Making schema changes to existing fields, e.g., renaming a field can lead to downtime. It happens in the time frame between applying a migration that modifies an existing field, and deploying a new version of the application code which uses the modified field.

You can prevent downtime by breaking down the steps required to alter a field into a series of discrete steps designed to introduce the change gradually. This pattern is known as the *expand and contract pattern*.

The pattern involves two components: your application code accessing the database and the database schema you intend to alter.

With the *expand and contract* pattern, renaming the field `bio` to `biography` would look as follows with Prisma:

* Add the new `biography` field to your Prisma schema and create a migration

```prisma highlight=4;add; title="schema.prisma"
model Profile {
 id        Int    @id @default(autoincrement())
 bio       String
 biography String // [!code ++]
 userId    Int    @unique
 user      User   @relation(fields: [userId], references: [id])
}
```

* *Expand*: update the application code and write to both the `bio` and `biography` fields, but continue reading from the `bio` field, and deploy the code
* Create an empty migration and copy existing data from the `bio` to the `biography` field

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name copy_biography --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name copy_biography --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name copy_biography --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name copy_biography --create-only
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```sql title="migration.sql"
UPDATE "Profile" SET biography = bio;
```

4. Verify the integrity of the `biography` field in the database
5. Update application code to **read** from the new `biography` field
6. Update application code to **stop writing** to the `bio` field
7. *Contract*: remove the `bio` from the Prisma schema, and create a migration to remove the `bio` field

```prisma highlight=3;delete; title="schema.prisma"
model Profile {
 id        Int    @id @default(autoincrement())
 bio       String // [!code --]
 biography String
 userId    Int    @unique
 user      User   @relation(fields: [userId], references: [id])
}
```

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name remove_bio
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name remove_bio
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name remove_bio
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name remove_bio
    ```
  </CodeBlockTab>
</CodeBlockTabs>

By using this approach, you avoid potential downtime that altering existing fields that are used in the application code are prone to, and reduce the amount of coordination required between applying the migration and deploying the updated application code.

Note that this pattern is applicable in any situation involving a change to a column that has data and is in use by the application code. Examples include combining two fields into one, or transforming a `1:n` relation to a `m:n` relation.

To learn more, check out the Data Guide article on [the expand and contract pattern](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)

Example: Change the direction of a 1-1 relation [#example-change-the-direction-of-a-1-1-relation]

To change the direction of a 1-1 relation:

* Make the change in the schema:

```prisma title="schema.prisma"
model User {
 id        Int      @id @default(autoincrement())
 name      String
 posts     Post[]
 profile   Profile? @relation(fields: [profileId], references: [id])
 profileId Int      @unique
}

model Profile {
 id        Int    @id @default(autoincrement())
 biography String
 user      User
}
```

* Run the following command to create a **draft migration** that you can edit before applying to the database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name rename-migration --create-only
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```text
⚠️  There will be data loss when applying the migration:

• The migration will add a unique constraint covering the columns `[profileId]` on the table `User`. If there are existing duplicate values, the migration will fail.
```

* Edit the draft migration as shown:

<CodeBlockTabs defaultValue="Before">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Before">
      Before
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="After">
      After
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Before">
    ```sql title="migration" 
    -- DropForeignKey
    ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

    -- DropIndex
    DROP INDEX "Profile_userId_unique";

    -- AlterTable
    ALTER TABLE "Profile" DROP COLUMN "userId";

    -- AlterTable
    ALTER TABLE "User" ADD COLUMN     "profileId" INTEGER NOT NULL;

    -- CreateIndex
    CREATE UNIQUE INDEX "User_profileId_unique" ON "User"("profileId");

    -- AddForeignKey
    ALTER TABLE "User" ADD FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ```
  </CodeBlockTab>

  <CodeBlockTab value="After">
    ```sql title="migration" 
    -- DropForeignKey
    ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

    -- DropIndex
    DROP INDEX "Profile_userId_unique";

    -- AlterTable
    ALTER TABLE "User" ADD COLUMN "profileId" INTEGER;

    UPDATE "User"
    SET "profileId" = "Profile".id
    FROM "Profile"
    WHERE "User".id = "Profile"."userId";

    ALTER TABLE "User" ALTER COLUMN "profileId" SET NOT NULL;

    -- AlterTable
    ALTER TABLE "Profile" DROP COLUMN "userId";

    -- CreateIndex
    CREATE UNIQUE INDEX "User_profileId_unique" ON "User"("profileId");

    -- AddForeignKey
    ALTER TABLE "User" ADD FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Save and apply the migration:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>
# Generating down migrations (/docs/orm/prisma-migrate/workflows/generating-down-migrations)



When generating a migration SQL file, you may wish to also create a "down migration" SQL file that reverses the schema changes in the corresponding "up migration" file. Note that "down migrations" are also sometimes called "migration rollbacks".

This guide explains how to use Prisma Migrate's [`migrate diff` command](/orm/reference/prisma-cli-reference#migrate-diff) to create a down migration, and how to apply it to your production database with the [`db execute`](/orm/reference/prisma-cli-reference#db-execute) command in the case of a failed up migration.

<CalloutContainer type="warning">
  <CalloutDescription>
    This guide applies to generating SQL down migrations for relational databases only. It does not apply to MongoDB.
  </CalloutDescription>
</CalloutContainer>

Considerations when generating down migrations [#considerations-when-generating-down-migrations]

When generating a down migration file, there are some considerations to be aware of:

* The down migration can be used to revert your database schema after a failed migration using the steps in [How to apply your down migration to a failed migration](#how-to-apply-your-down-migration-to-a-failed-migration). This requires the use of the `migrate resolve` command, which can only be used on failed migrations. If your up migration was successful and you want to revert it, you will instead need to revert your `schema.prisma` file to its state before the up migration, and generate a new migration with the `migrate dev` command.
* The down migration will revert your database schema, but other changes to data and application code that are carried out as part of the up migration will not be reverted. For example, if you have a script that changes data during the migration, this data will not be changed back when you run the down migration.
* You will not be able to use `migrate diff` to revert manually changed or added SQL in your migration files. If you have any custom additions, such as a view or trigger, you will need to:
  * Create the down migration following [the instructions below](#how-to-generate-and-run-down-migrations)
  * Create the up migration using [`migrate dev --create-only`](/orm/reference/prisma-cli-reference), so that it can be edited before it is applied to the database
  * Manually add your custom SQL to the up migration (e.g. adding a view)
  * Manually add the inverted custom SQL to the down migration (e.g. dropping the view)

How to generate and run down migrations [#how-to-generate-and-run-down-migrations]

This section describes how to generate a down migration SQL file along with the corresponding up migration, and then run it to revert your database schema after a failed up migration on production.

As an example, take the following Prisma schema with a `User` and `Post` model as a starting point:

```prisma title="schema.prisma"
model Post {
  id       Int     @id @default(autoincrement())
  title    String  @db.VarChar(255)
  content  String?
  author   User    @relation(fields: [authorId], references: [id])
  authorId Int
}

model User {
  id    Int     @id @default(autoincrement())
  name  String?
  posts Post[]
}
```

You will need to create the down migration first, before creating the corresponding up migration.

Generating the migrations [#generating-the-migrations]

* Edit your Prisma schema to make the changes you require for your up migration. In this example, you will add a new `Profile` model:

  ```prisma title="schema.prisma" highlight=8-14;add|20;add
  model Post {
    id       Int     @id @default(autoincrement())
    title    String  @db.VarChar(255)
    content  String?
    author   User    @relation(fields: [authorId], references: [id])
    authorId Int
  }

  model Profile { // [!code ++]
    id     Int     @id @default(autoincrement()) // [!code ++]
    bio    String? // [!code ++]
    user   User    @relation(fields: [userId], references: [id]) // [!code ++]
    userId Int     @unique // [!code ++]
  } // [!code ++]

  model User {
    id      Int      @id @default(autoincrement())
    name    String?
    posts   Post[]
    profile Profile? // [!code ++]
  }
  ```

* Generate the SQL file for the down migration. To do this, you will use `migrate diff` to make a comparison:

  * from the newly edited schema
  * to the state of the schema after the last migration

  and output this to a SQL script, `down.sql`.

  There are two potential options for specifying the 'to' state:

  * Using `--to-migrations`: this makes a comparison to the state of the migrations given in the migrations directory. This is the preferred option, as it is more robust. To use this option, run:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-migrations prisma/migrations \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-migrations prisma/migrations \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-migrations prisma/migrations \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-migrations prisma/migrations \
      --script > down.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Using `--to-config-datasource` (Prisma v7) or `--to-schema-datasource` (Prisma 6): this makes a comparison to the state of the database. This does not require a shadow database, but it does rely on the database having an up-to-date schema. To use this option, run:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-config-datasource \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-config-datasource \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-config-datasource \
      --script > down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate diff \
      --from-schema prisma/schema.prisma \
      --to-config-datasource \
      --script > down.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Generate and apply the up migration with a name of `add_profile`:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name add_profile
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will create a new `<timestamp>_add_profile` directory inside the `prisma/migrations` directory, with your new `migration.sql` up migration file inside.

* Copy your `down.sql` file into the new directory along with the up migration file.

How to apply your down migration to a failed migration [#how-to-apply-your-down-migration-to-a-failed-migration]

If your previous up migration failed, you can apply your down migration on your production database with the following steps:

To apply the down migration on your production database after a failed up migration:

* Use `db execute` to run your `down.sql` file on the database server (using the database URL configured in `prisma.config.ts`):

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db execute --file ./down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db execute --file ./down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db execute --file ./down.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db execute --file ./down.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Use `migrate resolve` to record that you rolled back the up migration named `add_profile`:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --rolled-back add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --rolled-back add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --rolled-back add_profile
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --rolled-back add_profile
    ```
  </CodeBlockTab>
</CodeBlockTabs>
# Patching & hotfixing (/docs/orm/prisma-migrate/workflows/patching-and-hotfixing)



Patching or hotfixing a database involves making an often time critical change directly in production. For example, you might add an index directly to a production database to resolve an issue with a slow-running query.

Patching the production database directly results in **schema drift**: your database schema has 'drifted away' from the source of truth, and is out of sync with your migration history. You can use the `prisma migrate resolve` command to reconcile your migration history *without* having to remove and re-apply the hotfix with `prisma migrate deploy`.

<CalloutContainer type="warning">
  <CalloutDescription>
    This guide **does not apply for MongoDB**.<br />
    Instead of `migrate dev`, [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) is used for [MongoDB](/orm/core-concepts/supported-databases/mongodb).
  </CalloutDescription>
</CalloutContainer>

Reconciling your migration history with a patch or hotfix [#reconciling-your-migration-history-with-a-patch-or-hotfix]

The following scenario assumes that you made a manual change in production and want to propagate that change to your migration history and other databases.

To reconcile your migration history and database schema in production:

* Replicate the change you made in production in the schema - for example, add an `@@index` to a particular model.
* Generate a new migration and take note of the full migration name, including a timestamp, which is written to the CLI:(`20210316150542_retroactively_add_index`):

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name retroactively-add-index
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name retroactively-add-index
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name retroactively-add-index
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name retroactively-add-index
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```bash no-copy
migrations/
└─ 20210316150542_retroactively_add_index/
└─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (2.19.0-dev.29) to .\node_modules\@prisma\client in 190ms
```

* Push the migration to production **without running `migrate deploy`**. Instead, mark the migration created in the previous step as 'already applied' so that Prisma Migrate does not attempt to apply your hotfix a second time:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --applied "20201127134938-retroactively-add-index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --applied "20201127134938-retroactively-add-index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --applied "20201127134938-retroactively-add-index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --applied "20201127134938-retroactively-add-index"
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command adds the migration to the migration history table without running the actual SQL.

* Repeat the previous step for other databases that were patched - for example, if you applied the patch to a staging database.
* Propagate the migration to other databases that were not patched - for example, by committing the migration to source control and allowing your CI/CD pipeline to apply it to all databases. The migration will not be applied to databases where it has been marked as already applied by the `prisma migrate resolve` command.

Failed migration [#failed-migration]

A migration might fail if:

* You [modify a migration before running it](/orm/prisma-migrate/workflows/customizing-migrations) and introduce a syntax error
* You add a mandatory (`NOT NULL`) column to a table that already has data
* The migration process stopped unexpectedly
* The database shut down in the middle of the migration process

Each migration in the `_prisma_migrations` table has a `logs` column that stores the error.

There are two ways to deal with failed migrations in a production environment:

* Roll back, optionally fix issues, and re-deploy
* Manually complete the migration steps and resolve the migration

Option 1: Mark the migration as rolled back and re-deploy [#option-1-mark-the-migration-as-rolled-back-and-re-deploy]

The following example demonstrates how to roll back a migration, optionally make changes to fix the issue, and re-deploy:

* Mark the migration as rolled back - this updates the migration record in the `_prisma_migrations` table to register it as rolled back, allowing it to be applied again:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --rolled-back "20201127134938_added_bio_index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --rolled-back "20201127134938_added_bio_index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --rolled-back "20201127134938_added_bio_index"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --rolled-back "20201127134938_added_bio_index"
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* If the migration was partially run, you can either:
  * Modify the migration to check if a step was already completed (for example: `CREATE TABLE ... IF NOT EXISTS`) *OR*
  * Manually revert the steps that were completed (for example, delete created tables)

If you modify the migration, make sure you copy it back to source control to ensure that state of your production database is reflected exactly in development.

* Fix the root cause of the failed migration, if relevant - for example, if the migration failed due to an issue with the SQL script itself. Make sure that you copy any changed migrations back to source control.

* Re-deploy the migration:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate deploy
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate deploy
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Option 2: Manually complete migration and resolve as applied [#option-2-manually-complete-migration-and-resolve-as-applied]

The following example demonstrates how to manually complete the steps of a migration and mark that migration as applied.

* Manually complete the migration steps on the production database. Make sure that any manual steps exactly match the steps in the migration file, and copy any changes back to source control.

* Resolve the migration as applied - this tells Prisma Migrate to consider the migration successfully applied:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --applied "20201127134938_my_migration"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --applied "20201127134938_my_migration"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --applied "20201127134938_my_migration"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --applied "20201127134938_my_migration"
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Fixing failed migrations with migrate diff and db execute [#fixing-failed-migrations-with-migrate-diff-and-db-execute]

<CalloutContainer type="info">
  <CalloutDescription>
    **Prisma v7 note**: The `--url` flag has been removed from `prisma db execute`. To run these commands against a production database, you'll need to configure the production database URL in your `prisma.config.ts` file before running `db execute`. You can create a separate config file for production (e.g., `prisma.config.prod.ts`) and use `--config prisma.config.prod.ts` to specify it.
  </CalloutDescription>
</CalloutContainer>

To help with fixing a failed migration, Prisma ORM provides the following commands for creating and executing a migration file:

* [`prisma migrate diff`](/orm/reference/prisma-cli-reference#migrate-diff) which diffs two database schema sources to create a migration taking one to the state of the second. You can output either a summary of the difference or a sql script. The script can be output into a file via `> file_name.sql` or be piped to the `db execute --stdin` command.
* [`prisma db execute`](/orm/reference/prisma-cli-reference#db-execute) which applies a SQL script to the database without interacting with the Prisma migrations table.

This section gives an example scenario of a failed migration, and explains how to use `migrate diff` and `db execute` to fix it.

Example of a failed migration [#example-of-a-failed-migration]

Imagine that you have the following `User` model in your schema, in both your local development environment and your production environment:

```prisma title="schema.prisma" showLineNumbers
model User {
  id   Int    @id
  name String
}
```

At this point, your schemas are in sync, but the data in the two environments is different.

You then decide to make changes to your data model, adding another `Post` model and making the `name` field on `User` unique:

```prisma title="schema.prisma" showLineNumbers
model User {
  id    Int     @id
  name  String  @unique
  email String?
}

model Post {
  id    Int    @id
  title String
}
```

You create a migration called 'Unique' with the command `npx prisma migrate dev -n Unique` which is saved in your local migrations history. Applying the migration succeeds in your dev environment and now it is time to release to production.

Unfortunately this migration can only be partially executed. Creating the `Post` model and adding the `email` column succeeds, but making the `name` field unique fails with the following error:

```bash
ERROR 1062 (23000): Duplicate entry 'paul' for key 'User_name_key'
```

This is because there is non-unique data in your production database (e.g. two users with the same name).

You now need to recover manually from the partially executed migration. Until you recover from the failed state, further migrations using `prisma migrate deploy` are impossible.

At this point there are two options, depending on what you decide to do with the non-unique data:

* You realize that non-unique data is valid and you cannot move forward with your current development work. You want to roll back the complete migration. To do this, see [Moving backwards and reverting all changes](#moving-backwards-and-reverting-all-changes)
* The existence of non-unique data in your database is unintentional and you want to fix that. After fixing, you want to go ahead with the rest of the migration. To do this, see [Moving forwards and applying missing changes](#moving-forwards-and-applying-missing-changes)

Moving backwards and reverting all changes [#moving-backwards-and-reverting-all-changes]

In this case, you need to create a migration that takes your production database to the state of your data model before the last migration.

* First you need your migration history at the time before the failed migration. You can either get this from your git history, or locally delete the folder of the last failed migration in your migration history.
* You now want to take your production environment from its current failed state back to the state specified in your local migrations history:
  * Run the following `prisma migrate diff` command:

    ```bash wrap
    # Prisma 6
    npx prisma migrate diff \
      --from-url "$DATABASE_URL_PROD" \
      --to-migrations ./prisma/migrations \
      --shadow-database-url $SHADOW_DATABASE_URL \
      --script > backward.sql

    # Prisma v7 (with production config)
    npx prisma migrate diff \
      --from-config-datasource \
      --to-migrations ./prisma/migrations \
      --config prisma.config.prod.ts \
      --script > backward.sql
    ```

    This will create a SQL script file containing all changes necessary to take your production environment from its current failed state to the target state defined by your migrations history.

  * Run the following `prisma db execute` command:

    ```bash
    # Prisma 6
    npx prisma db execute --url "$DATABASE_URL_PROD" --file backward.sql

    # Prisma v7 (with production config)
    npx prisma db execute --config prisma.config.prod.ts --file backward.sql
    ```

    This applies the changes in the SQL script against the target database without interacting with the migrations table.

  * Run the following `prisma migrate resolve` command:

    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx prisma migrate resolve --rolled-back Unique
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx prisma migrate resolve --rolled-back Unique
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx prisma migrate resolve --rolled-back Unique
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bunx --bun prisma migrate resolve --rolled-back Unique
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    This will mark the failed migration called 'Unique' in the migrations table on your production environment as rolled back.

Your local migration history now yields the same result as the state your production database is in. You can now modify the datamodel again to create a migration that suits your new understanding of the feature you're working on (with non-unique names).

Moving forwards and applying missing changes [#moving-forwards-and-applying-missing-changes]

In this case, you need to fix the non-unique data and then go ahead with the rest of the migration as planned:

* The error message from trying to deploy the migration to production already told you there was duplicate data in the column `name`. You need to either alter or delete the offending rows.
* Continue applying the rest of the failed migration to get to the data model defined in your `schema.prisma` file
* Run the following `prisma migrate diff` command

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate diff --from-config-datasource --to-schema schema.prisma --config prisma.config.prod.ts --script > forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate diff --from-config-datasource --to-schema schema.prisma --config prisma.config.prod.ts --script > forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate diff --from-config-datasource --to-schema schema.prisma --config prisma.config.prod.ts --script > forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate diff --from-config-datasource --to-schema schema.prisma --config prisma.config.prod.ts --script > forward.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will create a SQL script file containing all changes necessary to take your production environment from its current failed state to the target state defined in your `schema.prisma` file.

* Run the following `prisma db execute` command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db execute --config prisma.config.prod.ts --file forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db execute --config prisma.config.prod.ts --file forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db execute --config prisma.config.prod.ts --file forward.sql
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db execute --config prisma.config.prod.ts --file forward.sql
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This applies the changes in the SQL script against the target database without interacting with the migrations table.

* Run the following `prisma migrate resolve` command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate resolve --applied Unique
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate resolve --applied Unique
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate resolve --applied Unique
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate resolve --applied Unique
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This will mark the failed migration called 'Unique' in the migrations table on your production environment as applied.

Your local migration history now yields the same result as the state your production environment is in. You can now continue using the already known `migrate dev` /`migrate deploy` workflow.

Prisma Migrate and PgBouncer [#prisma-migrate-and-pgbouncer]

You might see the following error if you attempt to run Prisma Migrate commands in an environment that uses PgBouncer for connection pooling:

```bash
Error: undefined: Database error
Error querying the database: db error: ERROR: prepared statement "s0" already exists
```

See [Prisma Migrate and PgBouncer workaround](/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer) for further information and a workaround. Follow [GitHub issue #6485](https://github.com/prisma/prisma/issues/6485) for updates.
# Seeding (/docs/orm/prisma-migrate/workflows/seeding)



Seeding allows you to consistently re-create the same data in your database and can be used to:

* Populate your database with data that is required for your application to start, such as a default language or currency.
* Provide basic data for validating and using your application in a development environment. This is particularly useful if you are using Prisma Migrate, which sometimes requires resetting your development database.

<Accordions>
  <Accordion title="Watch video: Seeding your database">
    <Youtube videoId="mulzjQ4pZaA" title="How to seed your database with Prisma ORM" />
  </Accordion>
</Accordions>

How to seed your database in Prisma ORM [#how-to-seed-your-database-in-prisma-orm]

Prisma ORM's integrated seeding functionality expects a command in the `"seed"` key in the `migrations` object of your `prisma.config.ts`. This can be any command, `prisma db seed` will just execute it. In this guide and as a default, we recommend writing a seed script inside your project's `prisma/` folder and starting it with the command.

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Integrated seeding with Prisma Migrate [#integrated-seeding-with-prisma-migrate]

Database seeding happens when you run `prisma db seed`. With `prisma db seed`, *you* decide when to invoke the seed command. It can be useful for a test setup or to prepare a new development environment, for example.

<CalloutContainer type="info">
  <CalloutTitle>
    Prisma ORM v7 changes
  </CalloutTitle>

  <CalloutDescription>
    In Prisma ORM v7, seeding is **only triggered explicitly** by running `npx prisma db seed`. Automatic seeding during `prisma migrate dev` or `prisma migrate reset` has been removed.
  </CalloutDescription>
</CalloutContainer>

Example seed scripts [#example-seed-scripts]

Here we suggest some specific seed scripts for different situations. You are free to customize these in any way, but can also use them as presented here:

Seeding your database [#seeding-your-database]

* Create a new file named `seed.ts`. This can be placed anywhere within your project's folder structure. The example below places it in the `/prisma` folder.

* In the `seed.ts` file, import Prisma Client, initialize it and create some records. As an example, take the following Prisma schema with a `User` and `Post` model:

```prisma title="schema.prisma"
model User {
 id    Int    @id @default(autoincrement())
 email String @unique
 name  String
 posts Post[]
}

model Post {
 id        Int     @id @default(autoincrement())
 title     String
 content   String
 published Boolean
 user      User    @relation(fields: [userId], references: [id])
 userId    Int
}
```

Create some new users and posts in your `prisma/seed.ts` file:

<CalloutContainer type="info">
  <CalloutTitle>
    Prisma ORM v7 requirement
  </CalloutTitle>

  <CalloutDescription>
    In Prisma ORM v7, `PrismaClient` must be initialized with a driver adapter. The example below uses `@prisma/adapter-pg` with a PostgreSQL connection pool.
  </CalloutDescription>
</CalloutContainer>

```js title="seed.ts"
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      email: "alice@prisma.io",
      name: "Alice",
      posts: {
        create: {
          title: "Check out Prisma with Next.js",
          content: "https://www.prisma.io/nextjs",
          published: true,
        },
      },
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      email: "bob@prisma.io",
      name: "Bob",
      posts: {
        create: [
          {
            title: "Follow Prisma on Twitter",
            content: "https://twitter.com/prisma",
            published: true,
          },
          {
            title: "Follow Nexus on Twitter",
            content: "https://twitter.com/nexusgql",
            published: true,
          },
        ],
      },
    },
  });
  console.log({ alice, bob });
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
```

* Add `typescript`, `tsx`, `@types/node`, `@prisma/adapter-pg`, `pg`, `@types/pg` and `dotenv` development dependencies:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install -D typescript tsx @types/node @prisma/adapter-pg pg @types/pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add -D typescript tsx @types/node @prisma/adapter-pg pg @types/pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add --dev typescript tsx @types/node @prisma/adapter-pg pg @types/pg dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add --dev typescript tsx @types/node @prisma/adapter-pg pg @types/pg dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Add the `seed` field to your `prisma.config.ts` file:

```ts title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // [!code ++]
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

* To seed the database, run the `db seed` CLI command:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db seed
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db seed
    ```
  </CodeBlockTab>
</CodeBlockTabs>

We're using TypeScript here, but it's possible to do the same thing in vanilla JavaScript. The same steps would be followed, expect with a `prisma/seed.js` file (without types), and calling `node prisma/seed.js` instead of `tsx`.

Seeding your database via raw SQL queries [#seeding-your-database-via-raw-sql-queries]

You can also make use of raw SQL queries in order to seed the database with data.

While you can use a plain-text `.sql` file (such as a data dump) for that, it is often easier to place those raw queries, if they're of short size, into the `seed.js` file because it saves you the hassle of working out database connection strings and creating a dependency on a binary like `psql`.

To seed additional data to the `schema.prisma` above, add the following to the `seed.js` (or `seed.ts`) file:

```js title="seed.js"
async function rawSql() {
  const result =
    await prisma.$executeRaw`INSERT INTO "User" ("id", "email", "name") VALUES (3, 'foo@example.com', 'Foo') ON CONFLICT DO NOTHING;`;
  console.log({ result });
}
```

and chain this function to the promise calls, such as the following change towards the end of the file:

```js title="seed.js"
main()
  .then(rawSql)
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
```

Seeding your database via any language (with a Bash script) [#seeding-your-database-via-any-language-with-a-bash-script]

In addition to TypeScript and JavaScript, you can also use a Bash script (`seed.sh`) to seed your database in another language such as Go, or plain SQL.

The following example runs a Go script in the same folder as `seed.sh`:

```bash title="seed.sh"
#!/bin/sh
# -e Exit immediately when a command returns a non-zero status.
# -x Print commands before they are executed
set -ex
# Seeding command go
run ./seed/
```

The following example uses [psql](https://www.postgresql.org/docs/13/app-psql.html) to run a SQL script in the same folder as `seed.sh`:

```bash title="seed.sh"
#!/bin/sh
# -e Exit immediately when a command returns a non-zero status.
# -x Print commands before they are executed
set -ex
# Seeding command
psql file.sql
```

User-defined arguments [#user-defined-arguments]

`prisma db seed` allows you to define custom arguments in your seed file that you can pass to the `prisma db seed` command. For example, you could define your own arguments to seed different data for different environments or partially seeding data in some tables.

Here is an example seed file that defines a custom argument to seed different data in different environments:

```js title="seed.js"
import { parseArgs } from "node:util";

const options = {
  environment: { type: "string" },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case "development":
      /** data for your development */
      break;
    case "test":
      /** data for your test environment */
      break;
    default:
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

You can then provide the `environment` argument when using `prisma db seed` by adding a [delimiter](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html#tag_12_02) — `--` —, followed by your custom arguments:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db seed -- --environment development
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db seed -- --environment development
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db seed -- --environment development
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db seed -- --environment development
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Going further [#going-further]

Here's a non-exhaustive list of other tools you can integrate with Prisma ORM in your development workflow to seed your database:

* [Supabase community project](https://github.com/supabase-community/seed)
* [Replibyte](https://www.replibyte.com/docs/introduction/)
# Troubleshooting (/docs/orm/prisma-migrate/workflows/troubleshooting)



This guide describes how to resolve issues with Prisma Migrate in a development environment, which often involves resetting your database. For production-focused troubleshooting, see:

* [Production troubleshooting](/orm/prisma-migrate/workflows/patching-and-hotfixing)
* [Patching / hotfixing production databases](/orm/prisma-migrate/workflows/patching-and-hotfixing)

<CalloutContainer type="warning">
  <CalloutDescription>
    This guide **does not apply for MongoDB**.<br />
    Instead of `migrate dev`, [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) is used for [MongoDB](/orm/core-concepts/supported-databases/mongodb).
  </CalloutDescription>
</CalloutContainer>

Handling migration history conflicts [#handling-migration-history-conflicts]

A migration history conflict occurs when there are discrepancies between the **migrations folder in the file system** and the **`_prisma_migrations` table in the database**.

Causes of migration history conflict in a development environment [#causes-of-migration-history-conflict-in-a-development-environment]

* A migration that has already been applied is later modified
* A migration that has already been applied is missing from the file system

In a development environment, switching between feature branches can result in a history conflict because the `_prisma_migrations` table contains migrations from `branch-1`, and switching to `branch-2` might cause some of those migrations to disappear.

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    You should [never purposefully delete or edit a migration](/orm/prisma-migrate/understanding-prisma-migrate/migration-histories#do-not-edit-or-delete-migrations-that-have-been-applied), as this might result in discrepancies between development and production.
  </CalloutDescription>
</CalloutContainer>

Fixing a migration history conflict in a development environment [#fixing-a-migration-history-conflict-in-a-development-environment]

If Prisma Migrate detects a migration history conflict when you run `prisma migrate dev`, the CLI will ask to reset the database and reapply the migration history.

Schema drift [#schema-drift]

Database schema drift occurs when your database schema is out of sync with your migration history - the database schema has 'drifted away' from the source of truth.

Causes of schema drift in a development environment [#causes-of-schema-drift-in-a-development-environment]

Schema drift can occur if:

* The database schema was changed *without* using migrations - for example, by using [`prisma db push`](/orm/reference/prisma-cli-reference#db-push) or manually changing the database schema.

<CalloutContainer type="info">
  <CalloutTitle>
    Note
  </CalloutTitle>

  <CalloutDescription>
    The [shadow database](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) is required to detect schema drift, and can therefore only be done in a development environment.
  </CalloutDescription>
</CalloutContainer>

Fixing schema drift in a development environment [#fixing-schema-drift-in-a-development-environment]

If you made manual changes to the database that you do not want to keep, or can easily replicate in the Prisma schema:

* Reset your database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate reset
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* Replicate the changes in the Prisma schema and generate a new migration:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

If you made manual changes to the database that you want to keep, you can:

* Introspect the database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma db pull
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma db pull
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Prisma will update your schema with the changes made directly in the database.

* Generate a new migration to include the introspected changes in your migration history:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate dev --name introspected_change
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate dev --name introspected_change
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate dev --name introspected_change
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate dev --name introspected_change
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Prisma Migrate will prompt you to reset, then applies all existing migrations and a new migration based on the introspected changes. Your database and migration history are now in sync, including your manual changes.

Failed migrations [#failed-migrations]

Causes of failed migrations in a development environment [#causes-of-failed-migrations-in-a-development-environment]

A migration might fail if:

* You [modify a migration before running it](/orm/prisma-migrate/workflows/customizing-migrations) and introduce a syntax error
* You add a mandatory (`NOT NULL`) column to a table that already has data
* The migration process stopped unexpectedly
* The database shut down in the middle of the migration process

Each migration in the `_prisma_migrations` table has a `logs` column that stores the error.

Fixing failed migrations in a development environment [#fixing-failed-migrations-in-a-development-environment]

The easiest way to handle a failed migration in a developer environment is to address the root cause and reset the database. For example:

* If you introduced a SQL syntax error by manually editing the database, update the `migration.sql` file that failed and reset the database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate reset
    ```
  </CodeBlockTab>
</CodeBlockTabs>

* If you introduced a change in the Prisma schema that cannot be applied to a database with data (for example, a mandatory column in a table with data):
  * Delete the `migration.sql` file.
  * Modify the schema - for example, add a default value to the mandatory field.
  * Migrate:
    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx prisma migrate dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx prisma migrate dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx prisma migrate dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bunx --bun prisma migrate dev
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

Prisma Migrate will prompt you to reset the database and re-apply all migrations.

* If something interrupted the migration process, reset the database:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma migrate reset
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma migrate reset
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Prisma Migrate and PgBouncer [#prisma-migrate-and-pgbouncer]

You might see the following error if you attempt to run Prisma Migrate commands in an environment that uses PgBouncer for connection pooling:

```bash
Error: undefined: Database error
Error querying the database: db error: ERROR: prepared statement "s0" already exists
```

See [Prisma Migrate and PgBouncer workaround](/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer) for further information and a workaround.
# Prisma CLI reference (/docs/orm/reference/prisma-cli-reference)



This document describes the Prisma CLI commands, arguments, and options.

Commands [#commands]

version (-v) [#version--v]

The `version` command outputs information about your current `prisma` version, platform, and engine binaries.

Options [#options]

The `version` command recognizes the following options to modify its behavior:

| Option   | Required | Description                                 |
| -------- | -------- | ------------------------------------------- |
| `--json` | No       | Outputs version information in JSON format. |

Examples [#examples]

Output version information [#output-version-information]

```bash
prisma version
```

```text no-copy
Environment variables loaded from .env
prisma               : 2.21.0-dev.4
@prisma/client       : 2.21.0-dev.4
Current platform     : windows
Query Engine         : query-engine 2fb8f444d9cdf7c0beee7b041194b42d7a9ce1e6 (at C:\Users\veroh\AppData\Roaming\npm\node_modules\@prisma\cli\query-engine-windows.exe)
Migration Engine     : migration-engine-cli 2fb8f444d9cdf7c0beee7b041194b42d7a9ce1e6 (at C:\Users\veroh\AppData\Roaming\npm\node_modules\@prisma\cli\migration-engine-windows.exe)
Format Binary        : prisma-fmt 60ba6551f29b17d7d6ce479e5733c70d9c00860e (at node_modules\@prisma\engines\prisma-fmt-windows.exe)
Default Engines Hash : 60ba6551f29b17d7d6ce479e5733c70d9c00860e
Studio               : 0.365.0
```

Output version information (-v) [#output-version-information--v]

```bash
prisma -v
```

```text no-copy
Environment variables loaded from .env
prisma               : 2.21.0-dev.4
@prisma/client       : 2.21.0-dev.4
Current platform     : windows
Query Engine         : query-engine 2fb8f444d9cdf7c0beee7b041194b42d7a9ce1e6 (at C:\Users\veroh\AppData\Roaming\npm\node_modules\@prisma\cli\query-engine-windows.exe)
Migration Engine     : migration-engine-cli 2fb8f444d9cdf7c0beee7b041194b42d7a9ce1e6 (at C:\Users\veroh\AppData\Roaming\npm\node_modules\@prisma\cli\migration-engine-windows.exe)
Format Binary        : prisma-fmt 60ba6551f29b17d7d6ce479e5733c70d9c00860e (at node_modules\@prisma\engines\prisma-fmt-windows.exe)
Default Engines Hash : 60ba6551f29b17d7d6ce479e5733c70d9c00860e
Studio               : 0.365.0
```

Output version information as JSON [#output-version-information-as-json]

```bash
prisma version --json
```

```text no-copy
Environment variables loaded from .env
{
  "prisma": "2.21.0-dev.4",
  "@prisma/client": "2.21.0-dev.4",
  "current-platform": "windows",
  "query-engine": "query-engine 60ba6551f29b17d7d6ce479e5733c70d9c00860e (at node_modules\\@prisma\\engines\\query-engine-windows.exe)",
  "migration-engine": "migration-engine-cli 60ba6551f29b17d7d6ce479e5733c70d9c00860e (at node_modules\\@prisma\\engines\\migration-engine-windows.exe)",
  "format-binary": "prisma-fmt 60ba6551f29b17d7d6ce479e5733c70d9c00860e (at node_modules\\@prisma\\engines\\prisma-fmt-windows.exe)",
  "default-engines-hash": "60ba6551f29b17d7d6ce479e5733c70d9c00860e",
  "studio": "0.365.0"
}
```

init [#init]

Bootstraps a fresh Prisma ORM project within the current directory.

The `init` command does not interpret any existing files. Instead, it creates a `prisma` directory containing a bare-bones `schema.prisma` file within your current directory.

By default, the project sets up a [local Prisma Postgres](/postgres/database/local-development) instance but you can choose a different database using the `--datasource-provider` option.

Arguments [#arguments]

| Argument                 | Required | Description                                                                                                                                                                                                          | Default               |
| ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `--datasource-provider`  | No       | Specifies the value for the `provider` field in the `datasource` block. Options are `prisma+postgres`, `sqlite`, `postgresql`, `mysql`, `sqlserver`, `mongodb` and `cockroachdb`.                                    | `postgresql`          |
| `--db`                   | No       | Shorthand syntax for `--datasource-provider prisma+postgres`; creates a new [Prisma Postgres](/postgres) instance. Requires authentication in the [PDP Console](https://console.prisma.io).                          |                       |
| `--prompt` (or `--vibe`) | No       | Scaffolds a Prisma schema based on the prompt and deploys it to a fresh Prisma Postgres instance. Requires authentication in the [PDP Console](https://console.prisma.io).                                           |                       |
| `--url`                  | No       | Define a custom `datasource` url.                                                                                                                                                                                    |                       |
| `--generator-provider`   | No       | Define the generator provider to use.                                                                                                                                                                                | `prisma-client`       |
| `--preview-feature`      | No       | Define the [Preview features](/orm/reference/preview-features/cli-preview-features) to use. To define multiple Preview features, you have to provide the flag multiple times for each Preview feature. See examples. |                       |
| `--output`               | No       | Specifies the [output location for the generated client](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider).                                                                                  | `../generated/prisma` |
| `--with-model`           | No       | Adds a simple `User` model to the initial Prisma schema. Available since version `5.14.0`.                                                                                                                           |                       |

Examples [#examples-1]

**Run `prisma init`**

```bash
prisma init
```

```text no-copy wrap
npx prisma init

Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma.config.ts

Next, choose how you want to set up your database:

CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in `prisma.config.ts`
  2. Run `npx prisma db pull` to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

  Then, define your models in `prisma/schema.prisma` and run `npx prisma migrate dev` to apply your schema.

Learn more: https://pris.ly/getting-started
```

Next, run the `prisma dev` command to interact with your local Prisma Postgres instance (e.g. to run migrations or execute queries).

**Run `prisma init --datasource-provider sqlite`**

```bash
prisma init --datasource-provider sqlite
```

The command output contains helpful information on how to use the generated files and begin using Prisma ORM with your project.

**Run `prisma init --db`**

```bash
prisma init --db
```

```text no-copy wrap
✓ Select an authentication method Google
Authenticating to Prisma Platform via browser.

Visit the following URL in your browser to authenticate:
https://console.prisma.io/auth/cli?state=eyJjb6ll...

Successfully authenticated as amanyoyoyo@gmail.com.
Let's set up your Prisma Postgres database!
✓ Select your region: ap-southeast-1 - Asia Pacific (Singapore)
✓ Enter a project name: My Prisma Project
✓ Success! Your Prisma Postgres database is ready ✅

We found an existing schema.prisma file in your current project directory.

--- Database URL ---

Connect Prisma ORM to your Prisma Postgres database with this URL:

--- Next steps ---

Go to https://pris.ly/ppg-init for detailed instructions.

1. Install the Postgres adapter
npm install @prisma/adapter-pg

...and add it to your Prisma Client instance:

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

2. Apply migrations
Run the following command to create and apply a migration:
npx prisma migrate dev

3. Manage your data
View and edit your data locally by running this command:
npx prisma studio

...or online in Console:
https://console.prisma.io/cmhyn0uwl0q6903foel16ff31/cmhyn143t074tyLfoezs684ag/cmhyn143t074uylfon8hfre5z/studio

4. Send queries from your app
If you already have an existing app with Prisma ORM, you can now run it and it will send queries against your newly created Prisma Postgres instance.

5. Learn more
For more info, visit the Prisma Postgres docs: https://pris.ly/ppg-docs
```

The command creates a new [Prisma Postgres](https://www.prisma.io/postgres) instance. Note that it requires you to be authenticated with the [PDP Console](https://console.prisma.io), If you run it for the first time without being authenticated, the command will open the browser for you to log into Console.

**Run `prisma init --prompt "Simple habit tracker application"`**

```bash
prisma init --prompt "Simple habit tracker application"
```

The command scaffolds a Prisma schema and deploys it to a fresh [Prisma Postgres](https://www.prisma.io/postgres) instance. Note that it requires you to be authenticated with the [PDP Console](https://console.prisma.io), If you run it for the first time without being authenticated, the command will open the browser for you to log into Console.

**Run `prisma init --preview-feature`**

```bash
prisma init --preview-feature metrics
```

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider        = "prisma-client"
  previewFeatures = ["metrics"]
}
```

```bash
prisma init --preview-feature view --preview-feature metrics
```

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider        = "prisma-client"
  previewFeatures = ["views", "metrics"]
}
```

Generated Assets [#generated-assets]

**`prisma/schema.prisma`**

An initial `schema.prisma` file to define your schema in:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

**`prisma.config.ts`**

A TypeScript configuration file for Prisma that defines your datasource URL and other settings:

```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

See the [Prisma Config reference](/orm/reference/prisma-config-reference) for more details.

**`.env`**

A file to define environment variables for your project:

```bash
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#using-environment-variables

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

**`.gitignore`**

A file to specify what folders/files git should ignore in your project.

```bash
node_modules
# Keep environment variables out of version control
.env

/generated/prisma
```

**Run `prisma init --url mysql://user:password@localhost:3306/mydb`**

The `init` command with the `--url` argument allows you to specify a custom datasource URL during Prisma initialization, instead of relying on a placeholder database URL:

```bash
prisma init --url mysql://user:password@localhost:3306/mydb
```

Generated Assets [#generated-assets-1]

**`prisma/schema.prisma`**

A minimal `schema.prisma` file to define your schema in:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

**`prisma.config.ts`**

A TypeScript configuration file for Prisma with the custom URL:

```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**`.env`**

A file to define environment variables for your project:

```
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#using-environment-variables

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="mysql://user:password@localhost:3306/mydb"
```

generate [#generate]

The `generate` command generates assets like Prisma Client based on the [`generator`](/orm/prisma-schema/overview/generators) and [`data model`](/orm/prisma-schema/data-model/models) blocks defined in your `prisma/schema.prisma` file.

The `generate` command is most often used to generate Prisma Client with the `prisma-client` generator. This does the following:

1. Inspects the current directory to find a Prisma Schema to process.
2. Generates a customized Prisma Client based on your schema into the output directory specified in the generator block.

Prerequisites [#prerequisites]

To use the `generate` command, you must add a generator definition in your `schema.prisma` file. The `prisma-client` generator, used to generate Prisma Client, can be added by including the following in your `schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated"
}
```

Options [#options-1]

| Option              | Required | Description                                                                                                                                                                                                                         | Default |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `--data-proxy`      | No       | The `generate` command will generate Prisma Client for use with [Prisma Accelerate](/accelerate) prior to Prisma 5.0.0. Mutually exclusive with `--accelerate` and `--no-engine`.                                                   |         |
| `--accelerate`      | No       | The `generate` command will generate Prisma Client for use with [Prisma Accelerate](/accelerate). Mutually exclusive with `--data-proxy` and `--no-engine`. Available in Prisma 5.1.0 and later.                                    |         |
| `--no-engine`       | No       | The `generate` command will generate Prisma Client without an accompanied engine for use with [Prisma Accelerate](/accelerate). Mutually exclusive with `--data-proxy` and `--accelerate`. Available in Prisma ORM 5.2.0 and later. |         |
| `--no-hints`        | No       | The `generate` command will generate Prisma Client without usage hints, surveys or info banners being printed to the terminal. Available in Prisma ORM 5.16.0 and later.                                                            |         |
| `--allow-no-models` | No       | The `generate` command will generate Prisma Client without generating any models.                                                                                                                                                   |         |
| `--watch`           | No       | The `generate` command will continue to watch the `schema.prisma` file and re-generate Prisma Client on file changes.                                                                                                               |         |

<CalloutContainer type="warning">
  <CalloutDescription>
    **Deprecation Warning**

    As of Prisma 5.2.0, `--data-proxy` and `--accelerate` are deprecated in favor of `--no-engine` as Prisma Client no longer requires an option to work with Prisma Accelerate. All options are available and work similarly, but we recommend `--no-engine` as it prevents an engine from being downloaded which will greatly impact the size of apps deployed to serverless and edge functions.
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-1]

| Argument      | Required | Description                                                                                                                                                                                  | Default                                     |   |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | - |
| `--schema`    | No       | Specifies the path to the desired `schema.prisma` file to be processed instead of the default path. Both absolute and relative paths are supported.                                          | `./schema.prisma`, `./prisma/schema.prisma` |   |
| `--generator` | No       | Specifies which generator to use to generate assets. This option may be provided multiple times to include multiple generators. By default, all generators in the target schema will be run. |                                             |   |

Examples [#examples-2]

Generate Prisma Client using the default schema.prisma path [#generate-prisma-client-using-the-default-schemaprisma-path]

```bash
prisma generate
```

```text no-copy
✔ Generated Prisma Client to ./node_modules/.prisma/client in 61ms

You can now start using Prisma Client in your code:

import { PrismaClient } from '../prisma/generated/client'
// or const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

Explore the full API: https://pris.ly/d/client
```

Generate Prisma Client using a non-default schema.prisma path [#generate-prisma-client-using-a-non-default-schemaprisma-path]

```bash
prisma generate --schema=./alternative/schema.prisma
```

Continue watching the schema.prisma file for changes to automatically re-generate Prisma Client [#continue-watching-the-schemaprisma-file-for-changes-to-automatically-re-generate-prisma-client]

```bash
prisma generate --watch
```

```text no-copy
Watching... /home/prismauser/prisma/prisma-play/prisma/schema.prisma

✔ Generated Prisma Client to ./node_modules/.prisma/client in 45ms
```

Run the generate command with only a specific generator [#run-the-generate-command-with-only-a-specific-generator]

```bash
prisma generate --generator client
```

Run the generate command with multiple specific generators [#run-the-generate-command-with-multiple-specific-generators]

```bash
prisma generate --generator client --generator zod_schemas
```

Generated Assets [#generated-assets-2]

The `prisma-client` generator creates a customized client for working with your database in a custom output directory specified by the `output` field - you can [customize the output folder](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider).

validate [#validate]

Validates the [Prisma Schema Language](/orm/prisma-schema/overview) of the Prisma schema file.

Arguments [#arguments-2]

| Argument   | Required | Description                                                                                                                                         | Default                                     |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired `schema.prisma` file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`, `./prisma/schema.prisma` |

Examples [#examples-3]

Validate a schema without errors [#validate-a-schema-without-errors]

```bash
prisma validate
```

```text no-copy
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
The schema at /absolute/path/prisma/schema.prisma is valid 🚀
```

Validate a schema with validation errors [#validate-a-schema-with-validation-errors]

```bash
prisma validate
```

```text no-copy
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Error: Schema validation error - Error (query-engine-node-api library)
Error code: P1012
error: The preview feature "unknownFeatureFlag" is not known. Expected one of: [...]
  */}  schema.prisma:3
   |
 2 |     provider        = "prisma-client"
 3 |     previewFeatures = ["unknownFeatureFlag"]
   |

Validation Error Count: 1
[Context: getDmmf]

Prisma CLI Version : 4.5.0
```

format [#format]

Formats the Prisma schema file, which includes validating, formatting, and persisting the schema.

Arguments [#arguments-3]

| Argument   | Required | Description                                                                                                                                         | Default                                     |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired `schema.prisma` file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`, `./prisma/schema.prisma` |
| `--check`  | No       | Fails if any files are unformatted. This can be used in CI to detect if the schema is formatted correctly                                           |                                             |

Examples [#examples-4]

Validate a schema without errors [#validate-a-schema-without-errors-1]

```bash
prisma format
```

```text no-copy
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Formatted prisma/schema.prisma in 116ms �
```

Formatting a schema with validation errors [#formatting-a-schema-with-validation-errors]

```bash
prisma format
```

```text no-copy
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Error: Schema validation error - Error (query-engine-node-api library)
Error code: P1012
error: The preview feature "unknownFeatureFlag" is not known. Expected one of: [...]
  */}  schema.prisma:3
   |
 2 |     provider        = "prisma-client"
 3 |     previewFeatures = ["unknownFeatureFlag"]
   |

Validation Error Count: 1
[Context: getDmmf]

Prisma CLI Version : 4.5.0
```

debug [#debug]

Prints information for debugging and bug reports.

<CalloutContainer type="info">
  <CalloutDescription>
    This is available from version 5.6.0 and newer.
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-4]

| Argument         | Required | Description                                                                                                                                         | Default                                     |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--schema`       | No       | Specifies the path to the desired `schema.prisma` file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`, `./prisma/schema.prisma` |
| `--help` / `--h` | No       | Displays the help message                                                                                                                           |                                             |

Example [#example]

```bash
prisma debug
```

```text no-copy
-- Prisma schema --
Path: /prisma/schema.prisma

-- Local cache directory for engines files --
Path: /.cache/prisma

-- Environment variables --
When not set, the line is dimmed and no value is displayed.
When set, the line is bold and the value is inside the `` backticks.

For general debugging
 - CI:
 - DEBUG:
 - NODE_ENV:
 - RUST_LOG:
 - RUST_BACKTRACE:
 - NO_COLOR:
 - TERM: `xterm-256color`
 - NODE_TLS_REJECT_UNAUTHORIZED:
 - NO_PROXY:
 - http_proxy:
 - HTTP_PROXY:
 - https_proxy:
 - HTTPS_PROXY:

For more information see our [environment variable documentation](/orm/reference/environment-variables-reference)

For hiding messages
 - PRISMA_DISABLE_WARNINGS:
 - PRISMA_HIDE_PREVIEW_FLAG_WARNINGS:
 - PRISMA_HIDE_UPDATE_MESSAGE:

For downloading engines
 - PRISMA_ENGINES_MIRROR:
 - PRISMA_BINARIES_MIRROR (deprecated):
 - PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING:
 - BINARY_DOWNLOAD_VERSION:

For configuring the Query Engine Type
 - PRISMA_CLI_QUERY_ENGINE_TYPE: (Not supported in Prisma ORM v7)
 - PRISMA_CLIENT_ENGINE_TYPE: (Not supported in Prisma ORM v7)

For custom engines
 - PRISMA_QUERY_ENGINE_BINARY: (Not supported in Prisma ORM v7)
 - PRISMA_QUERY_ENGINE_LIBRARY: (Not supported in Prisma ORM v7)
 - PRISMA_SCHEMA_ENGINE_BINARY:
 - PRISMA_MIGRATION_ENGINE_BINARY:

For the "postinstall" npm hook
 - PRISMA_GENERATE_SKIP_AUTOINSTALL: (Not supported in Prisma ORM v7)
 - PRISMA_SKIP_POSTINSTALL_GENERATE: (Not supported in Prisma ORM v7)
 - PRISMA_GENERATE_IN_POSTINSTALL: (Not supported in Prisma ORM v7)

For "prisma generate"
 - PRISMA_GENERATE_DATAPROXY: (Not supported in Prisma ORM v7)
 - PRISMA_GENERATE_NO_ENGINE: (Not supported in Prisma ORM v7)

For Prisma Client
 - PRISMA_SHOW_ALL_TRACES:
 - PRISMA_CLIENT_NO_RETRY (Binary engine only): (Not supported in Prisma ORM v7)

For Prisma Migrate
 - PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK:
 - PRISMA_MIGRATE_SKIP_GENERATE: (Not supported in Prisma ORM v7)
 - PRISMA_MIGRATE_SKIP_SEED: (Not supported in Prisma ORM v7)

For Prisma Studio
 - BROWSER:

-- Terminal is interactive? --
true

-- CI detected? --
false
```

If you're using an older version of Prisma, you can use this command by running:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma@latest debug
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma@latest debug
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma@latest debug
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma@latest debug
    ```
  </CodeBlockTab>
</CodeBlockTabs>

dev [#dev]

The `dev` command starts a [local Prisma Postgres](/postgres/database/local-development) database that you can run Prisma ORM commands against. It is useful for development and testing purposes and also allows you to switch to [Prisma Postgres](/postgres) in production easily.

Arguments [#arguments-5]

| Argument              | Required | Description                                                                                                                                         | Default   |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `--name` (or `-n`)    | No       | Enables targeting a specific database instance. [Learn more](/postgres/database/local-development#using-different-local-prisma-postgres-instances). | `default` |
| `--port` (or `-p`)    | No       | Main port number the local Prisma Postgres HTTP server will listen on.                                                                              | `51213`   |
| `--db-port` (or `-P`) | No       | Port number the local Prisma Postgres database server will listen on.                                                                               | `51214`   |
| `--shadow-db-port`    | No       | Port number the shadow database server will listen on.                                                                                              | `51215`   |
| `--detach` (or `-d`)  | No       | Run the server in the background.                                                                                                                   | `false`   |
| `--debug`             | No       | Enable debug logging.                                                                                                                               | `false`   |

Examples [#examples-5]

**Run `prisma dev`**

```bash
prisma dev
```

```bash no-copy wrap
$ npx prisma dev
Fetching latest updates for this subcommand...
✔  Great Success! 😉👍

   Your  prisma dev  server default is ready and listening on ports 63567-63569.

╭──────────────────────────────╮
│[q]uit  [h]ttp url  [t]cp urls│
╰──────────────────────────────╯
```

**Run `prisma dev` with a specific name**

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev --name="mydbname"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev --name="mydbname"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev --name="mydbname"
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev --name="mydbname"
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This creates a named instance called `mydbname` that you can later start, stop, or manage using the instance management commands.

**Run `prisma dev` in detached mode**

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev --detach
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev --detach
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev --detach
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev --detach
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This runs the server in the background, freeing up your terminal for other commands. Use `prisma dev ls` to see running servers and `prisma dev stop` to stop them.

dev start [#dev-start]

Starts existing [local Prisma Postgres](/postgres/database/local-development) instances in the background.

<CalloutContainer type="info">
  <CalloutDescription>
    This command only works with instances that already exist.
  </CalloutDescription>
</CalloutContainer>

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev start <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev start <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev start <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev start <glob>
    ```
  </CodeBlockTab>
</CodeBlockTabs>

`<glob>` is a placeholder for a glob pattern to specify which local Prisma Postgres instances should be started, for example:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev start mydb # starts a DB called `mydb` in the background (only if it already exists)
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev start mydb # starts a DB called `mydb` in the background (only if it already exists)
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev start mydb # starts a DB called `mydb` in the background (only if it already exists)
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev start mydb # starts a DB called `mydb` in the background (only if it already exists)
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To start all databases that begin with `mydb` (e.g. `mydb-dev` and `mydb-prod`), you can use a glob:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev start mydb* # starts all existing DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev start mydb* # starts all existing DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev start mydb* # starts all existing DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev start mydb* # starts all existing DBs starting with `mydb`
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This enables background instance management outside of the VS Code extension.

dev ls [#dev-ls]

Lists all available [local Prisma Postgres](/postgres/database/local-development) instances:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev ls
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev ls
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev ls
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev ls
    ```
  </CodeBlockTab>
</CodeBlockTabs>

This command shows all instances on your system with their current status and configuration.

dev stop [#dev-stop]

Stops one or more [local Prisma Postgres](/postgres/database/local-development) databases:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev stop <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev stop <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev stop <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev stop <glob>
    ```
  </CodeBlockTab>
</CodeBlockTabs>

`<glob>` is a placeholder for a glob pattern to specify which local Prisma Postgres instances should be stopped, for example:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev stop mydb # stops a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev stop mydb # stops a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev stop mydb # stops a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev stop mydb # stops a DB called `mydb`
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To stop all databases that begin with `mydb` (e.g. `mydb-dev` and `mydb-prod`), you can use a glob:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev stop mydb* # stops all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev stop mydb* # stops all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev stop mydb* # stops all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev stop mydb* # stops all DBs starting with `mydb`
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    The `stop` command is interactive and includes safety prompts to prevent accidental operations.
  </CalloutDescription>
</CalloutContainer>

dev rm [#dev-rm]

Removes the data of one or more [local Prisma Postgres](/postgres/database/local-development) databases from your file system:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev rm <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev rm <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev rm <glob>
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev rm <glob>
    ```
  </CodeBlockTab>
</CodeBlockTabs>

`<glob>` is a placeholder for a glob pattern to specify which local Prisma Postgres instances should be removed, for example:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev rm mydb # removes a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev rm mydb # removes a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev rm mydb # removes a DB called `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev rm mydb # removes a DB called `mydb`
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To remove all databases that begin with `mydb` (e.g. `mydb-dev` and `mydb-prod`), you can use a glob:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma dev rm mydb* # removes all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma dev rm mydb* # removes all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma dev rm mydb* # removes all DBs starting with `mydb`
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma dev rm mydb* # removes all DBs starting with `mydb`
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Arguments [#arguments-6]

| Argument  | Required | Description                                                                                                        | Default |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `--force` | No       | Stops any running servers before removing them. Without this flag, the command will fail if any server is running. | `false` |

<CalloutContainer type="info">
  <CalloutDescription>
    The `rm` command is interactive and includes safety prompts to prevent accidental data loss.
  </CalloutDescription>
</CalloutContainer>

db [#db]

db pull [#db-pull]

The `db pull` command connects to your database and adds Prisma models to your Prisma schema that reflect the current database schema.

<CalloutContainer type="warning">
  <CalloutDescription>
    **Warning**: The command will overwrite the current `schema.prisma` file with the new schema. Some manual changes or customization can be lost. Be sure to back up your current `schema.prisma` file (or commit your current state to version control to be able to revert any changes) before running `db pull` if it contains important modifications.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    Introspection with the `db pull` command on the [MongoDB connector](/orm/core-concepts/supported-databases/mongodb) samples the data instead of reading a schema.
  </CalloutDescription>
</CalloutContainer>

Prerequisites [#prerequisites-1]

Before using the `db pull` command, you must configure your database connection in your `prisma.config.ts` file.

For example:

```prisma title="schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

```typescript title="prisma.config.ts"
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Options [#options-2]

| Option    | Required | Description                                                                                                           | Default |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| `--force` | No       | Force overwrite of manual changes made to schema. The generated schema will be based on the introspected schema only. |         |
| `--print` | No       | Prints the created `schema.prisma` to the screen instead of writing it to the filesystem.                             |         |

Arguments [#arguments-7]

| Argument   | Required | Description                                                                                                                                         | Default                                     |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired `schema.prisma` file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`, `./prisma/schema.prisma` |

Examples [#examples-6]

Analyze the database and write its schema to the schema.prisma file [#analyze-the-database-and-write-its-schema-to-the-schemaprisma-file]

```bash
prisma db pull
```

```text no-copy
Introspecting based on datasource defined in schema.prisma …

✔ Introspected 2 models and wrote them into schema.prisma in 38ms

Run prisma generate to generate Prisma Client.
```

Specify an alternative schema.prisma file to read and write to [#specify-an-alternative-schemaprisma-file-to-read-and-write-to]

```bash
prisma db pull --schema=./alternative/schema.prisma
```

```text no-copy
Introspecting based on datasource defined in alternative/schema.prisma …

✔ Introspected 2 models and wrote them into alternative/schema.prisma in 60ms

Run prisma generate to generate Prisma Client.
```

Display the generated schema.prisma file instead of writing it to the filesystem [#display-the-generated-schemaprisma-file-instead-of-writing-it-to-the-filesystem]

```bash
prisma db pull --print
```

```prisma no-copy
generator client {
  provider = "prisma-client"
  output   = "./generated"
}

datasource db {
  provider = "sqlite"
  url      = "file:./hello-prisma.db"
}

model User {
  email   String    @unique
  name    String?
  user_id Int       @id @default(autoincrement())
  post    Post[]
  profile Profile[]
}

model Post {
  content   String?
  post_id   Int     @id @default(autoincrement())
  title     String
  author    User?   @relation(fields: [author_id], references: [user_id])
  author_id Int?
}

model Profile {
  bio        String?
  profile_id Int     @id @default(autoincrement())
  user       User    @relation(fields: [user_id], references: [user_id])
  user_id    Int     @unique
}
```

db push [#db-push]

The `db push` command pushes the state of your Prisma schema to the database without using migrations. It creates the database if the database does not exist.

This command is a good choice when you do not need to version schema changes, such as during prototyping and local development.

See also:

* [Conceptual overview of `db push` and when to use it over Prisma Migrate](/orm/prisma-migrate/workflows/prototyping-your-schema)
* [Schema prototyping with `db push`](/orm/prisma-migrate/workflows/prototyping-your-schema)

Prerequisites [#prerequisites-2]

Before using the `db push` command, you must configure your database connection in your `prisma.config.ts` file.

For example:

```prisma title="schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

```typescript title="prisma.config.ts"
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Options [#options-3]

| Options              | Required | Description                                                                                                                |
| :------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------- |
| `--force-reset`      | No       | Resets the database and then updates the schema - useful if you need to start from scratch due to unexecutable migrations. |
| `--accept-data-loss` | No       | Ignore data loss warnings. This option is required if as a result of making the schema changes, data may be lost.          |
| `--help` / `--h`     | No       | Displays the help message                                                                                                  |

<CalloutContainer type="warning">
  <CalloutDescription>
    The `--skip-generate` flag was removed in Prisma v7. `db push` no longer runs `prisma generate` automatically. Run it explicitly if needed.
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-8]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-7]

Push the schema:

```bash
prisma db push
```

Push the schema, accepting data loss:

```bash
prisma db push --accept-data-loss
```

Push the schema with a custom schema location:

```bash
prisma db push --schema=/tmp/schema.prisma
```

db seed [#db-seed]

`db seed` changed from Preview to Generally Available (GA) in 3.0.1.

See [Seeding your database](/orm/prisma-migrate/workflows/seeding)

Options [#options-4]

| Options          | Required | Description                                               |
| :--------------- | :------- | :-------------------------------------------------------- |
| `--help` / `--h` | No       | Displays the help message                                 |
| `--`             | No       | Allows the use of custom arguments defined in a seed file |

The `--` argument/ [delimiter](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html#tag_12_02)/ double-dash is available from version 4.15.0 or later.

Examples [#examples-8]

```bash
prisma db seed
```

db execute [#db-execute]

<CalloutContainer type="info">
  <CalloutDescription>
    The `db execute` command is Generally Available in versions 3.13.0 and later. If you're using a version between 3.9.0 and 3.13.0, it is available behind a `--preview-feature` CLI flag.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is currently not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb).
  </CalloutDescription>
</CalloutContainer>

This command applies a SQL script to the database without interacting with the Prisma migrations table. The datasource URL configuration is read from the Prisma config file (e.g., `prisma.config.ts`).

The output of the command is connector-specific, and is not meant for returning data, but only to report success or failure.

See also:

* [Migration troubleshooting in production](/orm/prisma-migrate/workflows/patching-and-hotfixing#fixing-failed-migrations-with-migrate-diff-and-db-execute)

Prerequisites [#prerequisites-3]

Before using the `db execute` command, you must configure your database connection in your `prisma.config.ts` file.

For example:

```prisma title="schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

This how your `prisma.config.ts` file should look like:

```typescript title="prisma.config.ts"
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Options [#options-5]

| Options    | Required | Description                                                           |
| :--------- | :------- | :-------------------------------------------------------------------- |
| `--file`   | Yes\*    | Path to a file. The content will be sent as the script to be executed |
| `--stdin`  | No       | Use the terminal standard input as the script to be executed          |
| `--config` | No       | Custom path to your Prisma config file                                |
| `--help`   | No       | Displays the help message                                             |

\* Either `--file` or `--stdin` is required to provide the script input.

<CalloutContainer type="info">
  <CalloutDescription>
    **Prisma v7 breaking change**: The `--schema` and `--url` options have been removed. Configure your database connection in `prisma.config.ts` instead.
  </CalloutDescription>
</CalloutContainer>

Examples [#examples-9]

* Execute the content of a SQL script file using the datasource configured in `prisma.config.ts`:

  ```bash
  prisma db execute --file ./script.sql
  ```

* Execute the SQL script from stdin using the configured datasource:

  ```bash wrap
  echo 'TRUNCATE TABLE dev;' | prisma db execute --stdin
  ```

Prisma Migrate [#prisma-migrate]

Prisma Migrate changed from Preview to Generally Available (GA) in 2.19.0.

<CalloutContainer type="info">
  <CalloutDescription>
    **Does not apply for MongoDB** <br />
    Instead of `migrate dev` and related commands, [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) is used for [MongoDB](/orm/core-concepts/supported-databases/mongodb).
  </CalloutDescription>
</CalloutContainer>

migrate dev [#migrate-dev]

**For use in development environments only, requires shadow database**

The `migrate dev` command:

1. Reruns the existing migration history in the [shadow database](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) in order to detect schema drift (edited or deleted migration file, or a manual changes to the database schema)
2. Applies pending migrations to the shadow database (for example, new migrations created by colleagues)
3. Generates a new migration from any changes you made to the Prisma schema before running `migrate dev`
4. Applies all unapplied migrations to the development database and updates the `_prisma_migrations` table

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb). Use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) instead.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    **Prisma v7**: `migrate dev` no longer automatically triggers `prisma generate` or seed scripts. Run `prisma generate` explicitly if needed.
  </CalloutDescription>
</CalloutContainer>

See also:

* [Conceptual overview of Prisma Migrate](/orm/prisma-migrate)
* [Developing with Prisma Migrate](/orm/prisma-migrate)

Options [#options-6]

| Option          | Required | Description                                                                                                                                                                                        | Default |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `--create-only` | No       | Creates a new migration but does not apply it. This also works if you haven't made any changes to your schema (in that case, an empty migration is created). Run `migrate dev` to apply migration. |         |
| `--name` / `-n` | No       | Name the migration (e.g. `prisma migrate dev --name added_job_title`)                                                                                                                              |         |
| `--help` / `-h` | No       | Displays the help message                                                                                                                                                                          |         |

<CalloutContainer type="warning">
  <CalloutDescription>
    The `--skip-generate` and `--skip-seed` flags were removed in Prisma v7. `migrate dev` no longer runs `prisma generate` or seeds automatically. Run them explicitly if needed.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    If a [schema drift](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database#detecting-schema-drift) is detected while running `prisma migrate dev` using `--create-only`, you will be prompted to reset your database.
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-9]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--name`   | No       | The name of the migration. If no name is provided, the CLI will prompt you.                                                                       |                                                  |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-10]

Apply all migrations, then create and apply any new migrations:

```bash
prisma migrate dev
```

Apply all migrations and create a new migration if there are schema changes, but do not apply it:

```bash
prisma migrate dev --create-only
```

migrate reset [#migrate-reset]

**For use in development environments only**

This command:

1. Drops the database/schema if possible, or performs a soft reset if the environment does not allow deleting databases/schemas
2. Creates a new database/schema with the same name if the database/schema was dropped
3. Applies all migrations
4. Runs seed scripts

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb). Use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) instead.
  </CalloutDescription>
</CalloutContainer>

Options [#options-7]

| Option            | Required | Description                                             | Default |
| :---------------- | :------- | :------------------------------------------------------ | :------ |
| `--force`         | No       | Skip the confirmation prompt                            |         |
| `--skip-generate` | No       | Skip triggering generators (for example, Prisma Client) |         |
| `--skip-seed`     | No       | Skip triggering seed                                    |         |
| `--help` / `--h`  | No       | Displays the help message                               |         |

Arguments [#arguments-10]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-11]

```bash
prisma migrate reset
```

AI Safety guardrails for prisma migrate reset [#ai-safety-guardrails-for-prisma-migrate-reset]

Prisma ORM includes built-in safety checks to prevent **accidental destructive commands** when run through AI coding assistants. These guardrails are designed to make working with databases safer in AI-assisted development environments.

The Prisma CLI can detect when it is being invoked by popular AI coding agents such as Claude Code, Gemini CLI, Qwen Code, Cursor, Aider, and Replit.

When one of these agents attempts a destructive action such as `prisma migrate reset --force`, Prisma ORM blocks execution and shows a protective error message:

```bash
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "accelerate.prisma-data.net"

Error: Prisma Migrate detected that it was invoked by Cursor.

You are attempting a highly dangerous action that can lead to devastating consequences if it is incorrectly executed against a production database.

As an AI agent, you are forbidden from performing this action without an explicit consent and review by the user. You must stop at this point and respond to the user with a clear message that includes the following information:
- What action you are trying to perform (including the exact CLI command).
- Your motivation and reasoning for performing this action.
- Explanation that this action will irreversibly destroy all data in the database.
- Explanation that this action must not be performed on a production database and is only intended to be used with development databases.

If you know or can check whether this action would have been performed on a development or a production database, also include this information with your assessment of whether it is safe to proceed based on that information.

You must ask the user if they want to proceed with this action. If they explicitly consent, you may rerun this command with PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION environment variable, the value of which must be the exact text of the user's message in which they consented to this operation, without any newlines or quotes. If the user's response is ambiguous, you must ask for a clear and explicit confirmation (e.g., "yes") before proceeding. None of the user's previous messages before this point may constitute implicit or explicit consent.
```

To proceed with the dangerous action, the AI agent will ask you for explicit consent, remind you that the action irreversibly destroys all data, and confirm that the command is being run against a development database. Once you clearly confirm, the AI will set the `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` environment variable with the exact text of your consent and rerun the command.

migrate deploy [#migrate-deploy]

The `migrate deploy` command applies all pending migrations, and creates the database if it does not exist. Primarily used in non-development environments. This command:

* Does **not** look for drift in the database or changes in the Prisma schema
* Does **not** reset the database or generate artifacts
* Does **not** rely on a shadow database

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb). Use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) instead.
  </CalloutDescription>
</CalloutContainer>

Options [#options-8]

| Option           | Required | Description               | Default |
| :--------------- | :------- | :------------------------ | :------ |
| `--help` / `--h` | No       | Displays the help message |         |

Arguments [#arguments-11]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-12]

```bash
prisma migrate deploy
```

migrate resolve [#migrate-resolve]

The `migrate resolve` command allows you to solve migration history issues in production by marking a failed migration as already applied (supports baselining) or rolled back.

Note that this command can only be used with a failed migration. If you try to use it with a successful migration you will receive an error.

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb). Use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) instead.
  </CalloutDescription>
</CalloutContainer>

Options [#options-9]

| Option           | Required | Description               | Default |
| :--------------- | :------- | :------------------------ | :------ |
| `--help` / `--h` | No       | Displays the help message |         |

Arguments [#arguments-12]

| Argument        | Required | Description                                                                                                                                       | Default                                          |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--applied`     | No\*     | Record a specific migration as applied - for example `--applied "20201231000000_add_users_table"`                                                 |                                                  |
| `--rolled-back` | No\*     | Record a specific migration as rolled back - for example `--rolled-back "20201231000000_add_users_table"`                                         | `./schema.prisma`<br /> `./prisma/schema.prisma` |
| `--schema`      | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

You must specify either `--rolled-back` *or* `--applied`.

Examples [#examples-13]

```bash
prisma migrate resolve --applied 20201231000000_add_users_table
```

```bash
prisma migrate resolve --rolled-back 20201231000000_add_users_table
```

migrate status [#migrate-status]

The `prisma migrate status` command looks up the migrations in `./prisma/migrations/*` folder and the entries in the `_prisma_migrations` table and compiles information about the state of the migrations in your database.

<CalloutContainer type="warning">
  <CalloutDescription>
    This command is not supported on [MongoDB](/orm/core-concepts/supported-databases/mongodb). Use [`db push`](/orm/prisma-migrate/workflows/prototyping-your-schema) instead.
  </CalloutDescription>
</CalloutContainer>

For example:

```
Status
3 migrations found in prisma/migrations

Your local migration history and the migrations table from your database are different:

The last common migration is: 20201127134938_new_migration

The migration have not yet been applied:
20201208100950_test_migration

The migrations from the database are not found locally in prisma/migrations:
20201208100950_new_migration
```

In versions 4.3.0 and later, `prisma migrate status` exits with exit code 1 in the following cases:

* a database connection error occurs
* there are migration files in the `migrations` directory that have not been applied to the database
* the migration history in the `migrations` directory has diverged from the state of the database
* no migration table is found
* failed migrations are found

Options [#options-10]

| Option           | Required | Description               | Default |
| :--------------- | :------- | :------------------------ | :------ |
| `--help` / `--h` | No       | Displays the help message |         |

Arguments [#arguments-13]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-14]

```bash
prisma migrate status
```

migrate diff [#migrate-diff]

<CalloutContainer type="info">
  <CalloutDescription>
    This command is only partially supported for [MongoDB](/orm/core-concepts/supported-databases/mongodb). See the command options below for details.
  </CalloutDescription>
</CalloutContainer>

This command compares two database schema sources and outputs a description of a migration taking the first to the state of the second.

The output can be given either as a human-readable summary (the default) or an executable script.

<CalloutContainer type="warning">
  <CalloutDescription>
    The `migrate diff` command can only compare database features that are [supported by Prisma](/orm/reference/database-features). If two databases differ only in unsupported features, such as views or triggers, then `migrate diff` will not show any difference between them.
  </CalloutDescription>
</CalloutContainer>

The format of the command is:

```bash
prisma migrate diff --from-... <source1> --to-... <source2>
```

where the `--from-...` and `--to-...` options are selected based on the type of database schema source. The supported types of sources are:

* live databases
* migration histories
* Prisma schema data models
* an empty schema

Both schema sources must use the same database provider. For example, a diff comparing a PostgreSQL data source with a SQLite data source is not supported.

See also:

* [Migration troubleshooting in production](/orm/prisma-migrate/workflows/patching-and-hotfixing#fixing-failed-migrations-with-migrate-diff-and-db-execute)

Prerequisites [#prerequisites-4]

Before using the `migrate diff` command, if you are using `--from-config-datasource` or `--to-config-datasource`, you must configure your database connection in your `prisma.config.ts` file.

For example:

```prisma title="schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

```typescript title="prisma.config.ts"
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Options [#options-11]

<CalloutContainer type="info">
  <CalloutDescription>
    **Prisma v7 breaking change**: The `--from-url`, `--to-url`, `--from-schema-datasource`, `--to-schema-datasource`, and `--shadow-database-url` options have been removed. Use `--from-config-datasource` and `--to-config-datasource` instead, which read the database URL from `prisma.config.ts`.
  </CalloutDescription>
</CalloutContainer>

One of the following `--from-...` options is required:

| Options                    | Description                                                    | Notes                    |
| :------------------------- | :------------------------------------------------------------- | :----------------------- |
| `--from-empty`             | Assume that the data model you are migrating from is empty     |                          |
| `--from-schema`            | Path to a Prisma schema file, uses the data model for the diff |                          |
| `--from-migrations`        | Path to the Prisma Migrate migrations directory                | Not supported in MongoDB |
| `--from-config-datasource` | Use the datasource from the Prisma config file                 | Prisma v7+               |

One of the following `--to-...` options is required:

| Options                  | Description                                                    | Notes                    |
| :----------------------- | :------------------------------------------------------------- | :----------------------- |
| `--to-empty`             | Assume that the data model you are migrating to is empty       |                          |
| `--to-schema`            | Path to a Prisma schema file, uses the data model for the diff |                          |
| `--to-migrations`        | Path to the Prisma Migrate migrations directory                | Not supported in MongoDB |
| `--to-config-datasource` | Use the datasource from the Prisma config file                 | Prisma v7+               |

Other options:

| Options          | Required | Description                                                                                                                                       | Notes                                                                          |
| :--------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| `--script`       | No       | Outputs a SQL script instead of the default human-readable summary                                                                                | Not supported in MongoDB                                                       |
| `-o`, `--output` | No       | Writes to a file instead of stdout                                                                                                                | Available since [5.12.1](https://github.com/prisma/prisma/releases/tag/5.12.1) |
| `--exit-code`    | No       | Change the exit code behavior to signal if the diff is empty or not (Empty: 0, Error: 1, Not empty: 2). Default behavior is Success: 0, Error: 1. |                                                                                |
| `--config`       | No       | Custom path to your Prisma config file                                                                                                            |                                                                                |
| `--help`         | No       | Displays the help message                                                                                                                         |                                                                                |

Examples [#examples-15]

* Compare the configured database to a Prisma schema (e.g., to roll forward after a migration failed):

  ```bash
  prisma migrate diff \
    --from-config-datasource \
    --to-schema=next_datamodel.prisma \
    --script
  ```

* Compare a Prisma schema to the configured database:

  ```bash
  prisma migrate diff \
    --from-schema=schema.prisma \
    --to-config-datasource \
    --script
  ```

* Compare the migrations directory to the configured database (e.g., to generate a migration for a hotfix already applied on production):

  ```bash
  prisma migrate diff \
    --from-migrations ./migrations \
    --to-config-datasource \
    --script
  ```

* Pipe the output to `prisma db execute`:

  ```bash
  prisma migrate diff \
    --from-config-datasource \
    --to-schema=schema.prisma \
    --script | prisma db execute --stdin
  ```

* Detect if both sources are in sync (exits with code 2 if changes are detected):

  ```bash
  prisma migrate diff \
    --exit-code \
    --from-config-datasource \
    --to-schema=schema.prisma
  ```

Prisma Data Platform [#prisma-data-platform]

platform (Early Access) [#platform-early-access]

The `platform` command provides access to the Prisma Data Platform through the Prisma CLI starting in version `5.10.0` or later.

* **Authentication**:
  * `platform auth login`: Opens a browser window for login or account creation.
  * `platform auth logout`: Logs out of the platform.
  * `platform auth show`: Displays information about the currently authenticated user.
* **Workspace Management**:
  * `platform workspace show`: Lists all workspaces available to your account.
* **Project Management**:
  * `platform project show`: Lists all projects within the specified workspace.
  * `platform project create`: Creates a new project within the specified workspace.
  * `platform project delete`: Deletes the specified project.
* **Environment Management**:
  * `platform environment show`: Lists all environments for the specified project.
  * `platform environment create`: Creates a new environment within the specified project.
  * `platform environment delete`: Deletes the specified environment.
* **API Key Management**:
  * `platform apikey show`: Lists all API keys for the specified environment.
  * `platform apikey create`: Creates a new API key for the specified environment.
  * `platform apikey delete`: Deletes the specified API key.
* **Prisma Accelerate**:
  * `platform accelerate enable`: Enables Prisma Accelerate for the specified environment.
  * `platform accelerate disable`: Disables Prisma Accelerate for the specified environment.

You can find the complete list of available commands with the arguments [here](/cli/console).

mcp [#mcp]

Starts the [Prisma MCP server](/ai/tools/mcp-server).

Studio [#studio]

studio [#studio-1]

The `studio` command allows you to interact with and manage your data interactively. It does this by starting a local web server with a web app configured with your project's data schema and records.

Prisma ORM v7 introduces a more stable version of Prisma Studio with improved performance and a modernized architecture.

<CalloutContainer type="info">
  <CalloutTitle>
    Supported databases
  </CalloutTitle>

  <CalloutDescription>
    Prisma Studio currently supports PostgreSQL, MySQL, and SQLite. Support for CockroachDB and MongoDB is not available yet but may be added in future releases.

    For detailed database support information, including SQLite requirements, see [Databases supported by Prisma Studio](/studio#getting-started).
  </CalloutDescription>
</CalloutContainer>

Prerequisites [#prerequisites-5]

Before using the `studio` command, you must configure your database connection in your `prisma.config.ts` file.

For example:

```prisma title="schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

```typescript title="prisma.config.ts"
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Options [#options-12]

The `studio` command recognizes the following options:

| Option            | Required | Description                                                          | Default                  |
| ----------------- | -------- | -------------------------------------------------------------------- | ------------------------ |
| `-b`, `--browser` | No       | The browser to auto-open Studio in.                                  | `<your-default-browser>` |
| `-h`, `--help`    | No       | Show all available options and exit                                  |                          |
| `-p`, `--port`    | No       | The port number to start Studio on.                                  | 5555                     |
| `--config`        | No       | Custom path to your Prisma config file                               |                          |
| `--url`           | No       | Database connection string (overrides the one in your Prisma config) |                          |

Arguments [#arguments-14]

| Argument   | Required | Description                                                                                                                                       | Default                                          |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `--schema` | No       | Specifies the path to the desired schema.prisma file to be processed instead of the default path. Both absolute and relative paths are supported. | `./schema.prisma`<br /> `./prisma/schema.prisma` |

Examples [#examples-16]

Start Studio on the default port and open a new browser tab to it [#start-studio-on-the-default-port-and-open-a-new-browser-tab-to-it]

```bash
prisma studio
```

Start Studio on a different port and open a new browser tab to it [#start-studio-on-a-different-port-and-open-a-new-browser-tab-to-it]

```bash
prisma studio --port 7777
```

Start Studio and open a Firefox tab to it [#start-studio-and-open-a-firefox-tab-to-it]

```bash
prisma studio --browser firefox
```

Start Studio without opening a new browser tab to it [#start-studio-without-opening-a-new-browser-tab-to-it]

```bash
prisma studio --browser none
```

Start Studio with a custom Prisma config file [#start-studio-with-a-custom-prisma-config-file]

```bash
prisma studio --config=./prisma.config.ts
```

Start Studio with a direct database connection string [#start-studio-with-a-direct-database-connection-string]

```bash
prisma studio --url="postgresql://user:password@localhost:5432/dbname"
```

Using a HTTP proxy for the CLI [#using-a-http-proxy-for-the-cli]

Prisma CLI supports [custom HTTP proxies](https://github.com/prisma/prisma/issues/506). This is particularly relevant when being behind a corporate firewall.

To activate usage of the proxy, provide either of the following environment variables:

* [`HTTP_PROXY`](/orm/reference/environment-variables-reference#http_proxy) or `http_proxy`: Proxy URL for http traffic, for example `http://localhost:8080`
* [`HTTPS_PROXY`](/orm/reference/environment-variables-reference#https_proxy) or `https_proxy`: Proxy URL for https traffic, for example `https://localhost:8080`

npx create-db [#npx-create-db]

The [`create-db`](https://create-db.prisma.io/) command provisions a temporary [Prisma Postgres](/postgres) database with a single command. This is a standalone utility that can be invoked using `npx`. It's ideal for quickly testing, prototyping, or integrating with Prisma Postgres.

You can run the following variants:

| Command                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `npx create-db@latest`       | Creates a temporary Prisma Postgres database. |
| `npx create-pg@latest`       | Alias for `npx create-db`.                    |
| `npx create-postgres@latest` | Alias for `npx create-db`.                    |

Each database created with these commands:

* Is available for **24 hours** by default.
* Can be **claimed for free** to make it permanent using the URL displayed in the CLI output.

For full usage details, options (such as `--region` and `--interactive`), and examples, see the [documentation](/postgres/npx-create-db).
# Schema API (/docs/orm/reference/prisma-schema-reference)



datasource [#datasource]

Defines a [data source](/orm/prisma-schema/overview/data-sources) in the Prisma schema.

Fields [#fields]

A `datasource` block accepts the following fields:

| Name           | Required | Type                                                                            | Description                                                                                                                           |
| -------------- | -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`     | **Yes**  | String (`postgresql`, `mysql`, `sqlite`, `sqlserver`, `mongodb`, `cockroachdb`) | Specifies the database connector to use.                                                                                              |
| `relationMode` | No       | String (`foreignKeys`, `prisma`)                                                | Sets whether [referential integrity](/orm/prisma-schema/data-model/relations/relation-mode) is enforced by foreign keys or by Prisma. |
| `schemas`      | No       | Array of strings                                                                | List of database schemas to include ([multi-schema](/orm/prisma-schema/data-model/multi-schema) support, PostgreSQL and SQL Server).  |
| `extensions`   | No       | Array of extension names                                                        | [PostgreSQL extensions](/orm/prisma-schema/postgresql-extensions) to enable.                                                          |

Connection URLs (`url`, `directUrl`, `shadowDatabaseUrl`) are configured in [`prisma.config.ts`](/orm/reference/prisma-config-reference#datasourceurl), not in the schema file.

The following providers are available:

* [`sqlite`](/orm/core-concepts/supported-databases/sqlite)
* [`postgresql`](/orm/core-concepts/supported-databases/postgresql)
* [`mysql`](/orm/core-concepts/supported-databases/mysql)
* [`sqlserver`](/orm/core-concepts/supported-databases/sql-server)
* [`mongodb`](/orm/core-concepts/supported-databases/mongodb)
* [`cockroachdb`](/orm/core-concepts/supported-databases/postgresql#cockroachdb)

Remarks [#remarks]

* You can only have **one** `datasource` block in a schema.
* `datasource db` is convention - however, you can give your data source any name - for example, `datasource mysql` or `datasource data`.

Examples [#examples]

PostgreSQL datasource [#postgresql-datasource]

```prisma
datasource db {
  provider = "postgresql"
}
```

Configure the connection URL in `prisma.config.ts`:

```ts
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Learn more about PostgreSQL connection strings [here](/orm/core-concepts/supported-databases/postgresql).

Specify a PostgreSQL data source via an environment variable [#specify-a-postgresql-data-source-via-an-environment-variable]

In this example, the target database is available with the following credentials:

* User: `johndoe`
* Password: `mypassword`
* Host: `localhost`
* Port: `5432`
* Database name: `mydb`
* Schema name: `public`

```prisma
datasource db {
  provider = "postgresql"
}
```

When running a Prisma CLI command that needs the database connection URL (e.g. `prisma generate`), you need to make sure that the `DATABASE_URL` environment variable is set.

One way to do so is by creating a [`.env`](https://github.com/motdotla/dotenv) file with the following contents. Note that the file must be in the same directory as your `schema.prisma` file to automatically picked up the Prisma CLI.

```
DATABASE_URL=postgresql://johndoe:mypassword@localhost:5432/mydb?schema=public
```

MySQL datasource [#mysql-datasource]

```prisma
datasource db {
  provider = "mysql"
}
```

Learn more about [MySQL connection URLs](/orm/core-concepts/supported-databases/mysql).

MongoDB datasource [#mongodb-datasource]

```prisma
datasource db {
  provider = "mongodb"
}
```

Learn more about [MongoDB connection URLs](/orm/core-concepts/supported-databases/mongodb).

SQLite datasource [#sqlite-datasource]

```prisma
datasource db {
  provider = "sqlite"
}
```

Learn more about [SQLite connection URLs](/orm/core-concepts/supported-databases/sqlite).

CockroachDB datasource [#cockroachdb-datasource]

```prisma
datasource db {
  provider = "cockroachdb"
}
```

CockroachDB uses the same connection URL format as PostgreSQL. Learn more about [PostgreSQL connection URLs](/orm/core-concepts/supported-databases/postgresql).

Multi-schema datasource (PostgreSQL) [#multi-schema-datasource-postgresql]

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["public", "analytics"]
}
```

generator [#generator]

Defines a [generator](/orm/prisma-schema/overview/generators) in the Prisma schema.

Fields for prisma-client-js provider [#fields-for-prisma-client-js-provider]

This is the default generator for Prisma ORM 6.x and earlier versions. Learn more about [generators](/orm/prisma-schema/overview/generators#prisma-client-js-deprecated).

A `generator` block accepts the following fields:

| Name              | Required | Type                         | Description                                                                                                                                                                          |
| :---------------- | :------- | :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`        | **Yes**  | `prisma-client-js`           | Describes which [generator](/orm/prisma-schema/overview/generators) to use. This can point to a file that implements a generator or specify a built-in generator directly.           |
| `output`          | No       | String (file path)           | Determines the location for the generated client, [learn more](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider). **Default**: `node_modules/.prisma/client` |
| `previewFeatures` | No       | List of Enums                | Use intellisense to see list of currently available Preview features (`Ctrl+Space` in Visual Studio Code) **Default**: none                                                          |
| `engineType`      | No       | Enum (`library` or `binary`) | Defines the query engine type to download and use. **Default**: `library`                                                                                                            |
| `binaryTargets`   | No       | List of Enums (see below)    | Specify the OS on which the Prisma Client will run to ensure compatibility of the query engine. **Default**: `native`                                                                |
| `moduleFormat`    | No       | Enum (`cjs` or `esm`)        | Defines the module format of the generated Prisma Client. This field is available only with `prisma-client` generator.                                                               |

<CalloutContainer type="info">
  <CalloutTitle>
    important
  </CalloutTitle>

  <CalloutDescription>
    We recommend defining a custom output path, adding the path to `.gitignore`, and then making sure to run `prisma generate` via a custom build script or postinstall hook.
  </CalloutDescription>
</CalloutContainer>

Fields for prisma-client provider [#fields-for-prisma-client-provider]

The ESM-first client generator that offers greater control and flexibility across different JavaScript environments. It generates plain TypeScript code into a custom directory, providing full visibility over the generated code. Learn more about the new [`prisma-client`](/orm/prisma-schema/overview/generators#prisma-client) generator.

<CalloutContainer type="info">
  <CalloutDescription>
    The `prisma-client` generator is the default generator in Prisma ORM 7.
  </CalloutDescription>
</CalloutContainer>

A `generator` block accepts the following fields:

| Name                     | Required | Type                                                                                                               | Description                                                                                                                                                                                                                               |
| :----------------------- | :------- | :----------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`               | **Yes**  | `prisma-client`                                                                                                    | Describes which [generator](/orm/prisma-schema/overview/generators) to use. This can point to a file that implements a generator or specify a built-in generator directly.                                                                |
| `output`                 | **Yes**  | String (file path)                                                                                                 | Determines the location for the generated client, [learn more](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider).                                                                                                 |
| `previewFeatures`        | No       | List of Enums                                                                                                      | Use intellisense to see list of currently available Preview features (`Ctrl+Space` in Visual Studio Code) **Default**: none                                                                                                               |
| `runtime`                | No       | Enum (`nodejs`, `deno`, `bun`, `workerd` (alias `cloudflare`), `vercel-edge` (alias `edge-light`), `react-native`) | Target runtime environment. **Default**: `nodejs`                                                                                                                                                                                         |
| `moduleFormat`           | No       | Enum (`esm` or `cjs`)                                                                                              | Determines whether the generated code supports ESM (uses `import`) or CommonJS (uses `require(...)`) modules. We always recommend `esm` unless you have a good reason to use `cjs`. **Default**: Inferred from environment.               |
| `generatedFileExtension` | No       | Enum (`ts` or `mts` or `cts`)                                                                                      | File extension for generated TypeScript files. **Default**: `ts`                                                                                                                                                                          |
| `importFileExtension`    | No       | Enum (`ts`,`mts`,`cts`,`js`,`mjs`,`cjs`, empty (for bare imports))                                                 | File extension used in import statements **Default**: Inferred from environment.                                                                                                                                                          |
| `compilerBuild`          | No       | String (`fast`, `small`)                                                                                           | Defines what build of the query compiler to use for the generated client. `fast`, the default, gives you fast query compilation, but with an increase in size. `small` gives you the smallest size, but with a slightly slower execution. |

binaryTargets options [#binarytargets-options]

The following tables list all supported operating systems with the name of platform to specify in `binaryTargets`.

Unless specified otherwise, the default supported CPU architecture is x86\_64.

macOS [#macos]

| Build OS            | Prisma engine build name |
| :------------------ | :----------------------- |
| macOS Intel x86\_64 | `darwin`                 |
| macOS ARM64         | `darwin-arm64`           |

Windows [#windows]

| Build OS | Prisma engine build name |
| :------- | :----------------------- |
| Windows  | `windows`                |

Linux (Alpine on x86_64 architectures) [#linux-alpine-on-x86_64-architectures]

| Build OS                | Prisma engine build name   | OpenSSL |
| :---------------------- | :------------------------- | :-----: |
| Alpine (3.17 and newer) | `linux-musl-openssl-3.0.x` |  3.0.x  |
| Alpine (3.16 and older) | `linux-musl`               |  1.1.x  |

Linux (Alpine on ARM64 architectures) [#linux-alpine-on-arm64-architectures]

| Build OS                | Prisma engine build name         | OpenSSL |
| :---------------------- | :------------------------------- | :-----: |
| Alpine (3.17 and newer) | `linux-musl-arm64-openssl-3.0.x` |  3.0.x  |
| Alpine (3.16 and older) | `linux-musl-arm64-openssl-1.1.x` |  1.1.x  |

Linux (Debian), x86_64 [#linux-debian-x86_64]

| Build OS             | Prisma engine build name | OpenSSL |
| :------------------- | :----------------------- | :-----: |
| Debian 8 (Jessie)    | `debian-openssl-1.0.x`   |  1.0.x  |
| Debian 9 (Stretch)   | `debian-openssl-1.1.x`   |  1.1.x  |
| Debian 10 (Buster)   | `debian-openssl-1.1.x`   |  1.1.x  |
| Debian 11 (Bullseye) | `debian-openssl-1.1.x`   |  1.1.x  |
| Debian 12 (Bookworm) | `debian-openssl-3.0.x`   |  3.0.x  |

Linux (Ubuntu), x86_64 [#linux-ubuntu-x86_64]

| Build OS               | Prisma engine build name | OpenSSL |
| :--------------------- | :----------------------- | :-----: |
| Ubuntu 14.04 (trusty)  | `debian-openssl-1.0.x`   |  1.0.x  |
| Ubuntu 16.04 (xenial)  | `debian-openssl-1.0.x`   |  1.0.x  |
| Ubuntu 18.04 (bionic)  | `debian-openssl-1.1.x`   |  1.1.x  |
| Ubuntu 19.04 (disco)   | `debian-openssl-1.1.x`   |  1.1.x  |
| Ubuntu 20.04 (focal)   | `debian-openssl-1.1.x`   |  1.1.x  |
| Ubuntu 21.04 (hirsute) | `debian-openssl-1.1.x`   |  1.1.x  |
| Ubuntu 22.04 (jammy)   | `debian-openssl-3.0.x`   |  3.0.x  |
| Ubuntu 23.04 (lunar)   | `debian-openssl-3.0.x`   |  3.0.x  |

Linux (CentOS), x86_64 [#linux-centos-x86_64]

| Build OS | Prisma engine build name | OpenSSL |
| :------- | :----------------------- | :-----: |
| CentOS 7 | `rhel-openssl-1.0.x`     |  1.0.x  |
| CentOS 8 | `rhel-openssl-1.1.x`     |  1.1.x  |

Linux (Fedora), x86_64 [#linux-fedora-x86_64]

| Build OS  | Prisma engine build name | OpenSSL |
| :-------- | :----------------------- | :-----: |
| Fedora 28 | `rhel-openssl-1.1.x`     |  1.1.x  |
| Fedora 29 | `rhel-openssl-1.1.x`     |  1.1.x  |
| Fedora 30 | `rhel-openssl-1.1.x`     |  1.1.x  |
| Fedora 36 | `rhel-openssl-3.0.x`     |  3.0.x  |
| Fedora 37 | `rhel-openssl-3.0.x`     |  3.0.x  |
| Fedora 38 | `rhel-openssl-3.0.x`     |  3.0.x  |

Linux (Linux Mint), x86_64 [#linux-linux-mint-x86_64]

| Build OS      | Prisma engine build name | OpenSSL |
| :------------ | :----------------------- | :-----: |
| Linux Mint 18 | `debian-openssl-1.0.x`   |  1.0.x  |
| Linux Mint 19 | `debian-openssl-1.1.x`   |  1.1.x  |
| Linux Mint 20 | `debian-openssl-1.1.x`   |  1.1.x  |
| Linux Mint 21 | `debian-openssl-3.0.x`   |  3.0.x  |

Linux (Arch Linux), x86_64 [#linux-arch-linux-x86_64]

| Build OS              | Prisma engine build name | OpenSSL |
| :-------------------- | :----------------------- | :-----: |
| Arch Linux 2019.09.01 | `debian-openssl-1.1.x`   |  1.1.x  |
| Arch Linux 2023.04.23 | `debian-openssl-3.0.x`   |  3.0.x  |

Linux ARM64 (all major distros but Alpine) [#linux-arm64-all-major-distros-but-alpine]

| Build OS                       | Prisma engine build name    | OpenSSL |
| :----------------------------- | :-------------------------- | :-----: |
| Linux ARM64 glibc-based distro | `linux-arm64-openssl-1.0.x` |  1.0.x  |
| Linux ARM64 glibc-based distro | `linux-arm64-openssl-1.1.x` |  1.1.x  |
| Linux ARM64 glibc-based distro | `linux-arm64-openssl-3.0.x` |  3.0.x  |

Examples [#examples-1]

Specify the prisma-client-js generator with the default output, previewFeatures, engineType and binaryTargets [#specify-the-prisma-client-js-generator-with-the-default-output-previewfeatures-enginetype-and-binarytargets]

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Note that the above `generator` definition is **equivalent** to the following because it uses the default values for `output`, `engineType` and `binaryTargets` (and implicitly `previewFeatures`):

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "node_modules/.prisma/client"
  engineType    = "library"
  binaryTargets = ["native"]
}
```

Specify a custom output location for Prisma Client [#specify-a-custom-output-location-for-prisma-client]

This example shows how to define a custom `output` location of the generated asset to override the default one.

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}
```

Specify custom binaryTargets to ensure compatibility with the OS [#specify-custom-binarytargets-to-ensure-compatibility-with-the-os]

This example shows how to configure Prisma Client to run on `Ubuntu 19.04 (disco)` based on the table [above](#linux-ubuntu-x86_64).

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["debian-openssl-1.1.x"]
}
```

Specify a provider pointing to some custom generator implementation [#specify-a-provider-pointing-to-some-custom-generator-implementation]

This example shows how to use a custom generator that's located in a directory called `my-generator`.

```prisma
generator client {
  provider = "./my-generator"
}
```

model [#model]

Defines a Prisma [model](/orm/prisma-schema/data-model/models#defining-models) .

Remarks [#remarks-1]

* Every record of a model must be *uniquely* identifiable. You must define *at least* one of the following attributes per model:
  * [`@unique`](#unique)
  * [`@@unique`](#unique-1)
  * [`@id`](#id)
  * [`@@id`](#id-1)

Naming conventions [#naming-conventions]

* Model names must adhere to the following regular expression: `[A-Za-z][A-Za-z0-9_]*`
* Model names must start with a letter and are typically spelled in [PascalCase](https://wiki.c2.com/?PascalCase)
* Model names should use the singular form (for example, `User` instead of `user`, `users` or `Users`)
* Prisma ORM has a number of **reserved words** that are being used by Prisma ORM internally and therefore cannot be used as a model name. You can find the reserved words [here](https://github.com/prisma/prisma/blob/6.5.0/packages/client/src/generation/generateClient.ts#L556-L605) and [here](https://github.com/prisma/prisma-engines/blob/main/psl/parser-database/src/names/reserved_model_names.rs#L44).

> **Note**: You can use the [`@@map` attribute](#map-1) to map a model (for example, `User`) to a table with a different name that does not match model naming conventions (for example, `users`).

Order of fields [#order-of-fields]

* Introspection lists model fields in the same order as the corresponding columns in the database. Relation fields are listed after scalar fields.

Examples [#examples-2]

A model named User with two scalar fields [#a-model-named-user-with-two-scalar-fields]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email String  @unique // `email` can not be optional because it's the only unique field on the model
      name  String?
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id    String  @default(auto()) @map("_id") @db.ObjectId
      email String  @unique
      name  String?
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

model fields [#model-fields]

[Fields](/orm/prisma-schema/data-model/models#defining-fields) are properties of models.

Remarks [#remarks-2]

Naming conventions [#naming-conventions-1]

* Must start with a letter
* Typically spelled in camelCase
* Must adhere to the following regular expression: `[A-Za-z][A-Za-z0-9_]*`

> **Note**: You can use the [`@map` attribute](#map) to [map a field name to a column](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) with a different name that does not match field naming conventions: e.g. `myField @map("my_field")`.

model field scalar types [#model-field-scalar-types]

The *data source connector* determines what *native database type* each of Prisma ORM scalar type maps to. Similarly, the *generator* determines what *type in the target programming language* each of these types map to.

Prisma models also have [model field types](/orm/prisma-schema/data-model/relations) that define relations between models.

String [#string]

Variable length text.

Default type mappings [#default-type-mappings]

| Connector   | Default mapping  |
| ----------- | ---------------- |
| PostgreSQL  | `text`           |
| SQL Server  | `nvarchar(1000)` |
| MySQL       | `varchar(191)`   |
| MongoDB     | `String`         |
| SQLite      | `TEXT`           |
| CockroachDB | `STRING`         |

PostgreSQL [#postgresql]

| Native database type | Native database type attribute | Notes                                                                                                                                                                    |
| :------------------- | :----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`               | `@db.Text`                     |                                                                                                                                                                          |
| `char(x)`            | `@db.Char(x)`                  |                                                                                                                                                                          |
| `varchar(x)`         | `@db.VarChar(x)`               |                                                                                                                                                                          |
| `bit(x)`             | `@db.Bit(x)`                   |                                                                                                                                                                          |
| `varbit`             | `@db.VarBit`                   |                                                                                                                                                                          |
| `uuid`               | `@db.Uuid`                     |                                                                                                                                                                          |
| `xml`                | `@db.Xml`                      |                                                                                                                                                                          |
| `inet`               | `@db.Inet`                     |                                                                                                                                                                          |
| `citext`             | `@db.Citext`                   | Only available if [Citext extension is enabled](/orm/prisma-schema/data-model/unsupported-database-features#enable-postgresql-extensions-for-native-database-functions). |

MySQL [#mysql]

| Native database type | Native database type attribute |
| :------------------- | :----------------------------- |
| `VARCHAR(x)`         | `@db.VarChar(x)`               |
| `TEXT`               | `@db.Text`                     |
| `CHAR(x)`            | `@db.Char(x)`                  |
| `TINYTEXT`           | `@db.TinyText`                 |
| `MEDIUMTEXT`         | `@db.MediumText`               |
| `LONGTEXT`           | `@db.LongText`                 |

You can use Prisma Migrate to map `@db.Bit(1)` to `String`:

```prisma
model Model {
  /* ... */
  myField String @db.Bit(1)
}
```

MongoDB [#mongodb]

`String`

| Native database type attribute | Notes                                                                             |
| :----------------------------- | :-------------------------------------------------------------------------------- |
| `@db.String`                   |                                                                                   |
| `@db.ObjectId`                 | Required if the underlying BSON type is `OBJECT_ID` (ID fields, relation scalars) |

Microsoft SQL Server [#microsoft-sql-server]

| Native database type | Native database type attribute |
| :------------------- | :----------------------------- |
| `char(x)`            | `@db.Char(x)`                  |
| `nchar(x)`           | `@db.NChar(x)`                 |
| `varchar(x)`         | `@db.VarChar(x)`               |
| `nvarchar(x)`        | `@db.NVarChar(x)`              |
| `text`               | `@db.Text`                     |
| `ntext`              | `@db.NText`                    |
| `xml`                | `@db.Xml`                      |
| `uniqueidentifier`   | `@db.UniqueIdentifier`         |

SQLite [#sqlite]

`TEXT`

CockroachDB [#cockroachdb]

| Native database type                     | Native database type attribute | Notes |
| :--------------------------------------- | :----------------------------- | ----- |
| `STRING(x)` \| `TEXT(x)` \| `VARCHAR(x)` | `@db.String(x)`                |       |
| `CHAR(x)`                                | `@db.Char(x)`                  |       |
| `"char"`                                 | `@db.CatalogSingleChar`        |       |
| `BIT(x)`                                 | `@db.Bit(x)`                   |       |
| `VARBIT`                                 | `@db.VarBit`                   |       |
| `UUID`                                   | `@db.Uuid`                     |       |
| `INET`                                   | `@db.Inet`                     |       |

Note that the `xml` and `citext` types supported in PostgreSQL are not currently supported in CockroachDB.

Clients [#clients]

| Prisma Client JS |
| ---------------- |
| `string`         |

Boolean [#boolean]

True or false value.

Default type mappings [#default-type-mappings-1]

| Connector   | Default mapping |
| ----------- | --------------- |
| PostgreSQL  | `boolean`       |
| SQL Server  | `bit`           |
| MySQL       | `TINYINT(1)`    |
| MongoDB     | `Bool`          |
| SQLite      | `INTEGER`       |
| CockroachDB | `BOOL`          |

PostgreSQL [#postgresql-1]

| Native database types | Native database type attribute | Notes |
| :-------------------- | :----------------------------- | ----- |
| `boolean`             | `@db.Boolean`                  |       |

MySQL [#mysql-1]

| Native database types | Native database type attribute | Notes                                                                                                                                                     |
| --------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TINYINT(1)`          | `@db.TinyInt(1)`               | `TINYINT` maps to `Int` if the max length is greater than 1 (for example, `TINYINT(2)`) *or* the default value is anything other than `1`, `0`, or `NULL` |
| `BIT(1)`              | `@db.Bit`                      |                                                                                                                                                           |

MongoDB [#mongodb-1]

`Bool`

Microsoft SQL Server [#microsoft-sql-server-1]

| Native database types | Native database type attribute | Notes |
| :-------------------- | :----------------------------- | ----- |
| `bit`                 | `@db.Bit`                      |       |

SQLite [#sqlite-1]

`INTEGER`

CockroachDB [#cockroachdb-1]

| Native database types | Native database type attribute | Notes |
| :-------------------- | :----------------------------- | ----- |
| `BOOL`                | `@db.Bool`                     |       |

Clients [#clients-1]

| Prisma Client JS |
| ---------------- |
| `boolean`        |

Int [#int]

Default type mappings [#default-type-mappings-2]

| Connector   | Default mapping |
| ----------- | --------------- |
| PostgreSQL  | `integer`       |
| SQL Server  | `int`           |
| MySQL       | `INT`           |
| MongoDB     | `Int`           |
| SQLite      | `INTEGER`       |
| CockroachDB | `INT`           |

PostgreSQL [#postgresql-2]

| Native database types      | Native database type attribute           | Notes |
| -------------------------- | ---------------------------------------- | ----- |
| `integer` \| `int`, `int4` | `@db.Integer`                            |       |
| `smallint` \| `int2`       | `@db.SmallInt`                           |       |
| `smallserial` \| `serial2` | `@db.SmallInt @default(autoincrement())` |       |
| `serial` \| `serial4`      | `@db.Int @default(autoincrement())`      |       |
| `oid`                      | `@db.Oid`                                |       |

MySQL [#mysql-2]

| Native database types | Native database type attribute | Notes                                                                                                                                                                                      |
| :-------------------- | :----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `INT`                 | `@db.Int`                      |                                                                                                                                                                                            |
| `INT UNSIGNED`        | `@db.UnsignedInt`              |                                                                                                                                                                                            |
| `SMALLINT`            | `@db.SmallInt`                 |                                                                                                                                                                                            |
| `SMALLINT UNSIGNED`   | `@db.UnsignedSmallInt`         |                                                                                                                                                                                            |
| `MEDIUMINT`           | `@db.MediumInt`                |                                                                                                                                                                                            |
| `MEDIUMINT UNSIGNED`  | `@db.UnsignedMediumInt`        |                                                                                                                                                                                            |
| `TINYINT`             | `@db.TinyInt`                  | `TINYINT` maps to `Int` if the max length is greater than 1 (for example, `TINYINT(2)`) *or* the default value is anything other than `1`, `0`, or `NULL`. `TINYINT(1)` maps to `Boolean`. |
| `TINYINT UNSIGNED`    | `@db.UnsignedTinyInt`          | `TINYINT(1) UNSIGNED` maps to `Int`, not `Boolean`                                                                                                                                         |
| `YEAR`                | `@db.Year`                     |                                                                                                                                                                                            |

MongoDB [#mongodb-2]

`Int`

| Native database type attribute | Notes |
| :----------------------------- | :---- |
| `@db.Int`                      |       |
| `@db.Long`                     |       |

Microsoft SQL Server [#microsoft-sql-server-2]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `int`                 | `@db.Int`                      |       |
| `smallint`            | `@db.SmallInt`                 |       |
| `tinyint`             | `@db.TinyInt`                  |       |
| `bit`                 | `@db.Bit`                      |       |

SQLite [#sqlite-2]

`INTEGER`

CockroachDB [#cockroachdb-2]

| Native database types        | Native database type attribute       | Notes                                                                                                             |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `INTEGER` \| `INT` \| `INT8` | `@db.Int8`                           | Note that this differs from PostgreSQL, where `integer` and `int` are aliases for `int4` and map to `@db.Integer` |
| `INT4`                       | `@db.Int4`                           |                                                                                                                   |
| `INT2` \| `SMALLINT`         | `@db.Int2`                           |                                                                                                                   |
| `SMALLSERIAL` \| `SERIAL2`   | `@db.Int2 @default(autoincrement())` |                                                                                                                   |
| `SERIAL` \| `SERIAL4`        | `@db.Int4 @default(autoincrement())` |                                                                                                                   |
| `SERIAL8` \| `BIGSERIAL`     | `@db.Int8 @default(autoincrement())` |                                                                                                                   |

Clients [#clients-2]

| Prisma Client JS |
| ---------------- |
| `number`         |

BigInt [#bigint]

Default type mappings [#default-type-mappings-3]

| Connector   | Default mapping |
| ----------- | --------------- |
| PostgreSQL  | `bigint`        |
| SQL Server  | `int`           |
| MySQL       | `BIGINT`        |
| MongoDB     | `Long`          |
| SQLite      | `INTEGER`       |
| CockroachDB | `INTEGER`       |

PostgreSQL [#postgresql-3]

| Native database types    | Native database type attribute         | Notes |
| ------------------------ | -------------------------------------- | ----- |
| `bigint` \| `int8`       | `@db.BigInt`                           |       |
| `bigserial` \| `serial8` | `@db.BigInt @default(autoincrement())` |       |

MySQL [#mysql-3]

| Native database types | Native database type attribute                 | Notes |
| --------------------- | ---------------------------------------------- | ----- |
| `BIGINT`              | `@db.BigInt`                                   |       |
| `SERIAL`              | `@db.UnsignedBigInt @default(autoincrement())` |       |

MongoDB [#mongodb-3]

`Long`

Microsoft SQL Server [#microsoft-sql-server-3]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `bigint`              | `@db.BigInt`                   |       |

SQLite [#sqlite-3]

`INTEGER`

CockroachDB [#cockroachdb-3]

| Native database types       | Native database type attribute       | Notes                                                                      |
| --------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `BIGINT` \| `INT` \| `INT8` | `@db.Int8`                           | Note that this differs from PostgreSQL, where `int` is an alias for `int4` |
| `bigserial` \| `serial8`    | `@db.Int8 @default(autoincrement())` |                                                                            |

Clients [#clients-3]

| Client           | Type                                                                                                | Description                                                                                              |
| :--------------- | :-------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Prisma Client JS | [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | See [examples of working with `BigInt`](/orm/prisma-client/special-fields-and-types#working-with-bigint) |

Float [#float]

Floating point number.

Default type mappings [#default-type-mappings-4]

| Connector   | Default mapping    |
| ----------- | ------------------ |
| PostgreSQL  | `double precision` |
| SQL Server  | `float(53)`        |
| MySQL       | `DOUBLE`           |
| MongoDB     | `Double`           |
| SQLite      | `REAL`             |
| CockroachDB | `DOUBLE PRECISION` |

PostgreSQL [#postgresql-4]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `double precision`    | `@db.DoublePrecision`          |       |
| `real`                | `@db.Real`                     |       |

MySQL [#mysql-4]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `FLOAT`               | `@db.Float`                    |       |
| `DOUBLE`              | `@db.Double`                   |       |

MongoDB [#mongodb-4]

`Double`

Microsoft SQL Server [#microsoft-sql-server-4]

| Native database types | Native database type attribute |
| --------------------- | ------------------------------ |
| `float`               | `@db.Float`                    |
| `money`               | `@db.Money`                    |
| `smallmoney`          | `@db.SmallMoney`               |
| `real`                | `@db.Real`                     |

SQLite connector [#sqlite-connector]

`REAL`

CockroachDB [#cockroachdb-4]

| Native database types          | Native database type attribute | Notes |
| ------------------------------ | ------------------------------ | ----- |
| `DOUBLE PRECISION` \| `FLOAT8` | `@db.Float8`                   |       |
| `REAL` \| `FLOAT4` \| `FLOAT`  | `@db.Float4`                   |       |

Clients [#clients-4]

| Prisma Client JS |
| ---------------- |
| `number`         |

Decimal [#decimal]

Default type mappings [#default-type-mappings-5]

| Connector   | Default mapping                                                |
| ----------- | -------------------------------------------------------------- |
| PostgreSQL  | `decimal(65,30)`                                               |
| SQL Server  | `decimal(32,16)`                                               |
| MySQL       | `DECIMAL(65,30)`                                               |
| MongoDB     | [Not supported](https://github.com/prisma/prisma/issues/12637) |
| SQLite      | `DECIMAL`                                                      |
| CockroachDB | `DECIMAL`                                                      |

PostgreSQL [#postgresql-5]

| Native database types  | Native database type attribute | Notes |
| ---------------------- | ------------------------------ | ----- |
| `decimal` \| `numeric` | `@db.Decimal(p, s)`†           |       |
| `money`                | `@db.Money`                    |       |

* † `p` (precision), the maximum total number of decimal digits to be stored. `s` (scale), the number of decimal digits that are stored to the right of the decimal point.

MySQL [#mysql-5]

| Native database types  | Native database type attribute | Notes |
| ---------------------- | ------------------------------ | ----- |
| `DECIMAL` \| `NUMERIC` | `@db.Decimal(p, s)`†           |       |

* † `p` (precision), the maximum total number of decimal digits to be stored. `s` (scale), the number of decimal digits that are stored to the right of the decimal point.

MongoDB [#mongodb-5]

[Not supported](https://github.com/prisma/prisma/issues/12637).

Microsoft SQL Server [#microsoft-sql-server-5]

| Native database types  | Native database type attribute | Notes |
| ---------------------- | ------------------------------ | ----- |
| `decimal` \| `numeric` | `@db.Decimal(p, s)`†           |       |

* † `p` (precision), the maximum total number of decimal digits to be stored. `s` (scale), the number of decimal digits that are stored to the right of the decimal point.

SQLite [#sqlite-4]

`DECIMAL` (changed from `REAL` in 2.17.0)

CockroachDB [#cockroachdb-5]

| Native database types           | Native database type attribute | Notes                                                         |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| `DECIMAL` \| `DEC` \| `NUMERIC` | `@db.Decimal(p, s)`†           |                                                               |
| `money`                         | Not yet                        | PostgreSQL's `money` type is not yet supported by CockroachDB |

* † `p` (precision), the maximum total number of decimal digits to be stored. `s` (scale), the number of decimal digits that are stored to the right of the decimal point.

Clients [#clients-5]

| Client           | Type                                               | Description                                                                                                |
| :--------------- | :------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Prisma Client JS | [`Decimal`](https://mikemcl.github.io/decimal.js/) | See [examples of working with `Decimal`](/orm/prisma-client/special-fields-and-types#working-with-decimal) |

DateTime [#datetime]

Remarks [#remarks-3]

* Prisma Client returns all `DateTime` as native [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) objects.
* Currently, Prisma ORM [does not support](https://github.com/prisma/prisma/issues/5006) [zero dates](https://dev.mysql.com/doc/refman/8.3/en/date-and-time-types.html#:~\:text=The%20following%20table%20shows%20the%20format%20of%20the%20%E2%80%9Czero%E2%80%9D%20value%20for%20each%20type) (`0000-00-00 00:00:00`, `0000-00-00`, `00:00:00`) in MySQL.
* There currently is a [bug](https://github.com/prisma/prisma/issues/9516) that doesn't allow you to pass in `DateTime` values as strings and produces a runtime error when you do. `DateTime` values need to be passed as [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) objects (i.e. `new Date('2024-12-04')` instead of `'2024-12-04'`).

You can find more info and examples in this section: [Working with `DateTime`](/orm/prisma-client/special-fields-and-types#working-with-datetime).

Default type mappings [#default-type-mappings-6]

| Connector   | Default mapping |
| ----------- | --------------- |
| PostgreSQL  | `timestamp(3)`  |
| SQL Server  | `datetime2`     |
| MySQL       | `DATETIME(3)`   |
| MongoDB     | `Timestamp`     |
| SQLite      | `NUMERIC`       |
| CockroachDB | `TIMESTAMP`     |

PostgreSQL [#postgresql-6]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `timestamp(x)`        | `@db.Timestamp(x)`             |       |
| `timestamptz(x)`      | `@db.Timestamptz(x)`           |       |
| `date`                | `@db.Date`                     |       |
| `time(x)`             | `@db.Time(x)`                  |       |
| `timetz(x)`           | `@db.Timetz(x)`                |       |

MySQL [#mysql-6]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `DATETIME(x)`         | `@db.DateTime(x)`              |       |
| `DATE(x)`             | `@db.Date(x)`                  |       |
| `TIME(x)`             | `@db.Time(x)`                  |       |
| `TIMESTAMP(x)`        | `@db.Timestamp(x)`             |       |

You can also use MySQL's `YEAR` type with `Int`:

```prisma
yearField     Int    @db.Year
```

MongoDB [#mongodb-6]

`Timestamp`

Microsoft SQL Server [#microsoft-sql-server-6]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `date`                | `@db.Date`                     |       |
| `time`                | `@db.Time`                     |       |
| `datetime`            | `@db.DateTime`                 |       |
| `datetime2`           | `@db.DateTime2`                |       |
| `smalldatetime`       | `@db.SmallDateTime`            |       |
| `datetimeoffset`      | `@db.DateTimeOffset`           |       |

SQLite [#sqlite-5]

`NUMERIC` or `STRING`. If the underlying data type is `STRING`, you must use one of the following formats:

* [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) (`1996-12-19T16:39:57-08:00`)
* [RFC 2822](https://datatracker.ietf.org/doc/html/rfc2822#section-3.3) (`Tue, 1 Jul 2003 10:52:37 +0200`)

CockroachDB [#cockroachdb-6]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `TIMESTAMP(x)`        | `@db.Timestamp(x)`             |       |
| `TIMESTAMPTZ(x)`      | `@db.Timestamptz(x)`           |       |
| `DATE`                | `@db.Date`                     |       |
| `TIME(x)`             | `@db.Time(x)`                  |       |
| `TIMETZ(x)`           | `@db.Timetz(x)`                |       |

Clients [#clients-6]

| Prisma Client JS |
| ---------------- |
| `Date`           |

Json [#json]

A JSON object.

Default type mappings [#default-type-mappings-7]

| Connector   | Default mapping                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| PostgreSQL  | `jsonb`                                                                                                      |
| SQL Server  | [Not supported](https://github.com/prisma/prisma/issues/7417)                                                |
| MySQL       | `JSON`                                                                                                       |
| MongoDB     | [A valid `BSON` object (Relaxed mode)](https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/) |
| SQLite      | `JSONB`                                                                                                      |
| CockroachDB | `JSONB`                                                                                                      |

PostgreSQL [#postgresql-7]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `json`                | `@db.Json`                     |       |
| `jsonb`               | `@db.JsonB`                    |       |

MySQL [#mysql-7]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `JSON`                | `@db.Json`                     |       |

MongoDB [#mongodb-7]

[A valid `BSON` object (Relaxed mode)](https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/)

Microsoft SQL Server [#microsoft-sql-server-7]

Microsoft SQL Server does not have a specific data type for JSON. However, there are a number of [built-in functions for reading and modifying JSON](https://learn.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-ver15#extract-values-from-json-text-and-use-them-in-queries).

SQLite [#sqlite-6]

Not supported

CockroachDB [#cockroachdb-7]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `JSON` \| `JSONB`     | `@db.JsonB`                    |       |

Clients [#clients-7]

| Prisma Client JS |
| ---------------- |
| `object`         |

Bytes [#bytes]

Default type mappings [#default-type-mappings-8]

| Connector   | Default mapping |
| ----------- | --------------- |
| PostgreSQL  | `bytea`         |
| SQL Server  | `varbinary`     |
| MySQL       | `LONGBLOB`      |
| MongoDB     | `BinData`       |
| SQLite      | `BLOB`          |
| CockroachDB | `BYTES`         |

PostgreSQL [#postgresql-8]

| Native database types | Native database type attribute |
| --------------------- | ------------------------------ |
| `bytea`               | `@db.ByteA`                    |

MySQL [#mysql-8]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `LONGBLOB`            | `@db.LongBlob`                 |       |
| `BINARY`              | `@db.Binary`                   |       |
| `VARBINARY`           | `@db.VarBinary`                |       |
| `TINYBLOB`            | `@db.TinyBlob`                 |       |
| `BLOB`                | `@db.Blob`                     |       |
| `MEDIUMBLOB`          | `@db.MediumBlob`               |       |
| `BIT`                 | `@db.Bit`                      |       |

MongoDB [#mongodb-8]

`BinData`

| Native database type attribute | Notes                                                                             |
| :----------------------------- | :-------------------------------------------------------------------------------- |
| `@db.ObjectId`                 | Required if the underlying BSON type is `OBJECT_ID` (ID fields, relation scalars) |
| `@db.BinData`                  |                                                                                   |

Microsoft SQL Server [#microsoft-sql-server-8]

| Native database types | Native database type attribute | Notes |
| --------------------- | ------------------------------ | ----- |
| `binary`              | `@db.Binary`                   |       |
| `varbinary`           | `@db.VarBinary`                |       |
| `image`               | `@db.Image`                    |       |

SQLite [#sqlite-7]

`BLOB`

CockroachDB [#cockroachdb-8]

| Native database types        | Native database type attribute |
| ---------------------------- | ------------------------------ |
| `BYTES` \| `BYTEA` \| `BLOB` | `@db.Bytes`                    |

Clients [#clients-8]

| Client                                                        | Type                                                                                                        | Description                                                                                            |
| :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| Prisma Client JS                                              | [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | See [examples of working with `Bytes`](/orm/prisma-client/special-fields-and-types#working-with-bytes) |
| Prisma Client JS ([before v6](/guides/upgrade-prisma-orm/v6)) | [`Buffer`](https://nodejs.org/api/buffer.html)                                                              | See [examples of working with `Bytes`](/orm/prisma-client/special-fields-and-types#working-with-bytes) |

Unsupported [#unsupported]

<CalloutContainer type="warning">
  <CalloutDescription>
    **Not supported by MongoDB** <br />
    The [MongoDB connector](/orm/core-concepts/supported-databases/mongodb) does not support the `Unsupported` type.
  </CalloutDescription>
</CalloutContainer>

The `Unsupported` type was introduced in [2.17.0](https://github.com/prisma/prisma/releases/tag/2.17.0) and allows you to represent data types in the Prisma schema that are not supported by Prisma Client. Fields of type `Unsupported` can be created during Introspection with `prisma db pull` or written by hand, and created in the database with Prisma Migrate or `db push`.

Remarks [#remarks-4]

* Fields with `Unsupported` types are not available in the generated client.
* If a model contains a **required** `Unsupported` type, `prisma.model.create(..)`, `prisma.model.update(...)` and `prisma.model.upsert(...)` are not available in Prisma Client.
* When you introspect a database that contains unsupported types, Prisma ORM will provide the following warning:

  ```
  *** WARNING ***

  These fields are not supported by Prisma Client, because Prisma does not currently support their types.
  * Model "Post", field: "circle", original data type: "circle"
  ```

Examples [#examples-3]

```prisma
model Star {
  id       Int                    @id @default(autoincrement())
  position Unsupported("circle")?
  example1 Unsupported("circle")
  circle   Unsupported("circle")? @default(dbgenerated("'<(10,4),11>'::circle"))
}
```

model field type modifiers [#model-field-type-modifiers]

[] modifier [#-modifier]

Makes a field a list.

Remarks [#remarks-5]

* Cannot be optional (for example `Post[]?`).

Relational databases [#relational-databases]

* Scalar lists (arrays) are only supported in the data model if your database natively supports them. Currently, scalar lists are therefore only supported when using PostgreSQL or CockroachDB (since MySQL and SQLite don't natively support scalar lists).

MongoDB [#mongodb-9]

* Scalar lists are supported

Examples [#examples-4]

Define a scalar list [#define-a-scalar-list]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=3;normal 
    model User {
      id             Int      @id @default(autoincrement())
      favoriteColors String[] // [!code highlight]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=3;normal 
    model User {
      id             String   @id @default(auto()) @map("_id") @db.ObjectId
      favoriteColors String[] // [!code highlight]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Define a scalar list with a default value [#define-a-scalar-list-with-a-default-value]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=3;normal 
    model User {
      id             Int      @id @default(autoincrement())
      favoriteColors String[] @default(["red", "blue", "green"]) // [!code highlight]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=3;normal 
    model User {
      id             String   @id @default(auto()) @map("_id") @db.ObjectId
      favoriteColors String[] @default(["red", "blue", "green"]) // [!code highlight]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

? modifier [#-modifier-1]

Makes a field optional.

Remarks [#remarks-6]

* Cannot be used with a list field (for example, `Posts[]`)

Examples [#examples-5]

Optional name field [#optional-name-field]

```prisma highlight=3;normal
model User {
  id   Int     @id @default(autoincrement())
  name String? // [!code highlight]
}
```

Attributes [#attributes]

Attributes modify the behavior of a [field](#model-fields) or block (e.g. [models](#model)). There are two ways to add attributes to your data model:

* *Field* attributes are prefixed with `@`
* *Block* attributes are prefixed with `@@`

Some attributes take arguments. Arguments in attributes are always named, but in most cases the argument *name* can be omitted.

> **Note**: The leading underscore in a signature means the *argument name* can be omitted.

@id [#id]

Defines a single-field ID on the model.

Remarks [#remarks-7]

General [#general]

* Cannot be defined on a relation field
* Cannot be optional

Relational databases [#relational-databases-1]

* Corresponding database construct: `PRIMARY KEY`

* Can be annotated with a [`@default`](#default) attribute that uses [functions](#attribute-functions) to auto-generate an ID:
  * [`autoincrement()`](#autoincrement)
  * [`cuid()`](#cuid)
  * [`uuid()`](#uuid)
  * [`ulid()`](#ulid)

* Can be defined on any scalar field (`String`, `Int`, `enum`)

MongoDB [#mongodb-10]

* Corresponding database construct: [Any valid BSON type, except arrays](https://www.mongodb.com/docs/manual/core/document/#the-_id-field)

* Every model must define an `@id` field

* The [underlying ID field name is always `_id`](https://www.mongodb.com/docs/manual/core/document/#the-_id-field), and must be mapped with `@map("_id")`

* Can be defined on any scalar field (`String`, `Int`, `enum`) unless you want to use `ObjectId` in your database

* To use an [`ObjectId`](https://www.mongodb.com/docs/manual/reference/method/ObjectId/) as your ID, you must:
  * Use the `String` or `Bytes` field type

  * Annotate your field with `@db.ObjectId`:

    ```prisma
    id   String  @db.ObjectId  @map("_id")
    ```

  * Optionally, annotate your field with a [`@default`](#default) attribute that uses [the `auto()` function](#auto) to auto-generate an `ObjectId`

    ```prisma
    id   String  @db.ObjectId  @map("_id") @default(auto())
    ```

* [`cuid()`](#cuid), [`uuid()`](#uuid) and [`ulid()`](#ulid) are supported but do not generate a valid `ObjectId` - use `auto()` instead for `@id`

* `autoincrement()` is **not supported**

Arguments [#arguments]

| Name        | Required | Type      | Description                                                                                                                                                   |
| ----------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map`       | **No**   | `String`  | The name of the underlying primary key constraint in the database.<br /><br /> Not supported for MySQL or MongoDB.                                            |
| `length`    | **No**   | `number`  | Allows you to specify a maximum length for the subpart of the value to be indexed.<br /><br />MySQL only.                                                     |
| `sort`      | **No**   | `String`  | Allows you to specify in what order the entries of the ID are stored in the database. The available options are `Asc` and `Desc`.<br /><br />SQL Server only. |
| `clustered` | **No**   | `Boolean` | Defines whether the ID is clustered or non-clustered. Defaults to `true`. <br /><br />SQL Server only.                                                        |

Signature [#signature]

```prisma no-lines
@id(map: String?, length: number?, sort: String?, clustered: Boolean?)
```

Examples [#examples-6]

In most cases, you want your database to create the ID. To do this, annotate the ID field with the `@default` attribute and initialize the field with a [function](#attribute-functions).

Generate autoincrementing integers as IDs (Relational databases only) [#generate-autoincrementing-integers-as-ids-relational-databases-only]

```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String
}
```

Generate ObjectId as IDs (MongoDB only) [#generate-objectid-as-ids-mongodb-only]

```prisma
model User {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  name String
}
```

Generate cuid() values as IDs [#generate-cuid-values-as-ids]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(cuid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(cuid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="warning">
  <CalloutDescription>
    You cannot use `cuid()` to generate a default value if your `id` field is of type `ObjectId`. Use the following syntax to generate a valid `ObjectId`:

    ```prisma
    id    String  @id @default(auto()) @db.ObjectId @map("_id")
    ```
  </CalloutDescription>
</CalloutContainer>

Generate uuid() values as IDs [#generate-uuid-values-as-ids]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(uuid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(uuid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="warning">
  <CalloutDescription>
    You cannot use `uuid()` to generate a default value if your `id` field is of type `ObjectId`. Use the following syntax to generate a valid `ObjectId`:

    ```prisma
    id    String  @id @default(auto()) @db.ObjectId @map("_id")
    ```
  </CalloutDescription>
</CalloutContainer>

Generate ulid() values as IDs [#generate-ulid-values-as-ids]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(ulid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(ulid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="warning">
  <CalloutDescription>
    You cannot use `ulid()` to generate a default value if your `id` field is of type `ObjectId`. Use the following syntax to generate a valid `ObjectId`:

    ```prisma
    id    String  @id @default(auto()) @db.ObjectId @map("_id")
    ```
  </CalloutDescription>
</CalloutContainer>

Single-field IDs without default values [#single-field-ids-without-default-values]

In the following example, `id` does not have a default value:

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
    id    String   @id  @map("_id") @db.ObjectId
    name  String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```prisma
model User {
id    String   @id  @map("_id")
name  String
}
```

Note that in the above case, you *must* provide your own ID values when creating new records for the `User` model using Prisma Client, e.g.:

```ts
const newUser = await prisma.user.create({
  data: {
    id: 1,
    name: "Alice",
  },
});
```

Specify an ID on relation scalar field without a default value [#specify-an-id-on-relation-scalar-field-without-a-default-value]

In the following example, `authorId` is a both a relation scalar and the ID of `Profile`:

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model Profile {
      authorId Int    @id
      author   User   @relation(fields: [authorId], references: [id])
      bio      String
    }

    model User {
      id      Int      @id
      email   String   @unique
      name    String?
      profile Profile?
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model Profile {
      authorId String @id @map("_id") @db.ObjectId
      author   User   @relation(fields: [authorId], references: [id])
      bio      String
    }

    model User {
      id      String   @id @map("_id") @db.ObjectId
      email   String   @unique
      name    String?
      profile Profile?
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

In this scenario, you cannot create a `Profile` only - you must use Prisma Client's [nested writes](/orm/prisma-client/queries/relation-queries#nested-writes) create a `User` **or** connect the profile to an existing user.

The following example creates a user and a profile:

```ts
const userWithProfile = await prisma.user.create({
  data: {
    id: 3,
    email: "bob@prisma.io",
    name: "Bob Prismo",
    profile: {
      create: {
        bio: "Hello, I'm Bob Prismo and I love apples, blue nail varnish, and the sound of buzzing mosquitoes.",
      },
    },
  },
});
```

The following example connects a new profile to a user:

```ts
const profileWithUser = await prisma.profile.create({
  data: {
    bio: "Hello, I'm Bob and I like nothing at all. Just nothing.",
    author: {
      connect: {
        id: 22,
      },
    },
  },
});
```

@@id [#id-1]

<CalloutContainer type="warning">
  <CalloutDescription>
    **Not supported by MongoDB** <br />
    The [MongoDB connector](/orm/core-concepts/supported-databases/mongodb) does not support composite IDs.
  </CalloutDescription>
</CalloutContainer>

Defines a multi-field ID (composite ID) on the model.

Remarks [#remarks-8]

* Corresponding database type: `PRIMARY KEY`
* Can be annotated with a [`@default`](#default) attribute that uses [functions](#attribute-functions) to auto-generate an ID
* Cannot be optional
* Can be defined on any scalar field (`String`, `Int`, `enum`)
* Cannot be defined on a relation field
* The name of the composite ID field in Prisma Client has the following pattern: `field1_field2_field3`

Arguments [#arguments-1]

| Name        | Required | Type               | Description                                                                                                                                                   |
| ----------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`    | **Yes**  | `FieldReference[]` | A list of field names - for example, `["firstname", "lastname"]`                                                                                              |
| `name`      | **No**   | `String`           | The name that Prisma Client will expose for the argument covering all fields, e.g. `fullName` in `fullName: { firstName: "First", lastName: "Last"}`          |
| `map`       | **No**   | `String`           | The name of the underlying primary key constraint in the database.<br /><br />Not supported for MySQL.                                                        |
| `length`    | **No**   | `number`           | Allows you to specify a maximum length for the subpart of the value to be indexed.<br /><br />MySQL only.                                                     |
| `sort`      | **No**   | `String`           | Allows you to specify in what order the entries of the ID are stored in the database. The available options are `Asc` and `Desc`.<br /><br />SQL Server only. |
| `clustered` | **No**   | `Boolean`          | Defines whether the ID is clustered or non-clustered. Defaults to `true`.<br /><br />SQL Server only.                                                         |

The name of the `fields` argument on the `@@id` attribute can be omitted:

```prisma no-lines
@@id(fields: [title, author])
@@id([title, author])
```

Signature [#signature-1]

```prisma no-lines
@@id(_ fields: FieldReference[], name: String?, map: String?)
```

Examples [#examples-7]

Specify a multi-field ID on two String fields (Relational databases only) [#specify-a-multi-field-id-on-two-string-fields-relational-databases-only]

```prisma
model User {
  firstName String
  lastName  String
  email     String  @unique
  isAdmin   Boolean @default(false)

  @@id([firstName, lastName])
}
```

When you create a user, you must provide a unique combination of `firstName` and `lastName`:

```ts
const user = await prisma.user.create({
  data: {
    firstName: "Alice",
    lastName: "Smith",
  },
});
```

To retrieve a user, use the generated composite ID field (`firstName_lastName`):

```ts
const user = await prisma.user.findUnique({
  where: {
    firstName_lastName: {
      firstName: "Alice",
      lastName: "Smith",
    },
  },
});
```

Specify a multi-field ID on two String fields and one Boolean field (Relational databases only) [#specify-a-multi-field-id-on-two-string-fields-and-one-boolean-field-relational-databases-only]

```prisma
model User {
  firstName String
  lastName  String
  email     String  @unique
  isAdmin   Boolean @default(false)

  @@id([firstName, lastName, isAdmin])
}
```

When creating new `User` records, you now must provide a unique combination of values for `firstName`, `lastName` and `isAdmin`:

```ts
const user = await prisma.user.create({
  data: {
    firstName: "Alice",
    lastName: "Smith",
    isAdmin: true,
  },
});
```

Specify a multi-field ID that includes a relation field (Relational databases only) [#specify-a-multi-field-id-that-includes-a-relation-field-relational-databases-only]

```prisma
model Post {
  title     String
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int

  @@id([authorId, title])
}

model User {
  id    Int     @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

When creating new `Post` records, you now must provide a unique combination of values for `authorId` (foreign key) and `title`:

```ts
const post = await prisma.post.create({
  data: {
    title: "Hello World",
    author: {
      connect: {
        email: "alice@prisma.io",
      },
    },
  },
});
```

@default [#default]

Defines a [default value for a field](/orm/prisma-schema/data-model/models#defining-a-default-value).

Remarks [#remarks-9]

* Default values that cannot yet be represented in the Prisma schema are represented by the [`dbgenerated()` function](#dbgenerated) when you use [introspection](/orm/prisma-schema/introspection).
* Default values are not allowed on relation fields in the Prisma schema. Note however that you can still define default values on the fields backing a relation (the ones listed in the `fields` argument in the `@relation` attribute). A default value on the field backing a relation will mean that relation is populated automatically for you.
* Default values can be used with [scalar lists](/orm/prisma-client/special-fields-and-types/working-with-scalar-lists-arrays) in databases that natively support them.

Relational databases [#relational-databases-2]

* Corresponding database construct: `DEFAULT`
* Default values can be a static value (`4`, `"hello"`) or one of the following [functions](#attribute-functions):
  * [`autoincrement()`](#autoincrement)
  * [`sequence()`](#sequence) (CockroachDB only)
  * [`dbgenerated(...)`](#dbgenerated)
  * [`cuid()`](#cuid)
  * [`cuid(2)`](#cuid)
  * [`uuid()`](#uuid)
  * [`uuid(4)`](#uuid)
  * [`uuid(7)`](#uuid)
  * [`ulid()`](#ulid)
  * [`nanoid()`](#nanoid)
  * [`now()`](#now)
* Default values that cannot yet be represented in the Prisma schema are represented by the [`dbgenerated(...)` function](#dbgenerated) when you use [introspection](/orm/prisma-schema/introspection).
* Default values are not allowed on relation fields in the Prisma schema. Note however that you can still define default values on the fields backing a relation (the ones listed in the `fields` argument in the `@relation` attribute). A default value on the field backing a relation will mean that relation is populated automatically for you.
* Default values can be used with [scalar lists](/orm/prisma-client/special-fields-and-types/working-with-scalar-lists-arrays) in databases that natively support them.
* JSON data. Note that JSON needs to be enclosed with double-quotes inside the `@default` attribute, e.g.: `@default("[]")`. If you want to provide a JSON object, you need to enclose it with double-quotes and then escape any internal double quotes using a backslash, e.g.: `@default("{ \"hello\": \"world\" }")`.

MongoDB [#mongodb-11]

* Default values can be a static value (`4`, `"hello"`) or one of the following [functions](#attribute-functions):
  * [`auto()`](#auto) (can only be used with `@db.ObjectId` to generate an `ObjectId` in MongoDB)
  * [`cuid()`](#cuid)
  * [`uuid()`](#uuid)
  * [`ulid()`](#ulid)
  * [`now()`](#now)

Arguments [#arguments-2]

| Name    | Required | Type                                      | Description          |
| ------- | -------- | ----------------------------------------- | -------------------- |
| `value` | **Yes**  | An expression (e.g. `5`, `true`, `now()`) |                      |
| `map`   | **No**   | String                                    | **SQL Server only.** |

The name of the `value` argument on the `@default` attribute can be omitted:

```prisma no-lines
id Int @id @default(value: autoincrement())
id Int @id @default(autoincrement())
```

Signature [#signature-2]

```prisma no-lines
@default(_ value: Expression, map: String?)
```

Examples [#examples-8]

Default value for an Int [#default-value-for-an-int]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email        String @unique
      profileViews Int    @default(0)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id           String @default(auto()) @map("_id") @db.ObjectId
      profileViews Int    @default(0)
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for a Float [#default-value-for-a-float]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email  String @unique
      number Float  @default(1.1)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id     String @default(auto()) @map("_id") @db.ObjectId
      number Float  @default(1.1)
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for Decimal [#default-value-for-decimal]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email  String  @unique
      number Decimal @default(22.99)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```text
    [Not supported](https://github.com/prisma/prisma/issues/12637).
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for BigInt [#default-value-for-bigint]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email  String @unique
      number BigInt @default(34534535435353)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id     String @default(auto()) @map("_id") @db.ObjectId
      number BigInt @default(34534535435353)
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for a String [#default-value-for-a-string]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email String @unique
      name  String @default("")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @default(auto()) @map("_id") @db.ObjectId
      name String @default("")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for a Boolean [#default-value-for-a-boolean]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email   String  @unique
      isAdmin Boolean @default(false)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id      String  @default(auto()) @map("_id") @db.ObjectId
      isAdmin Boolean @default(false)
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for a DateTime [#default-value-for-a-datetime]

Note that static default values for `DateTime` are based on the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) standard.

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email String   @unique
      data  DateTime @default("2020-03-19T14:21:00+02:00")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String   @default(auto()) @map("_id") @db.ObjectId
      data DateTime @default("2020-03-19T14:21:00+02:00")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for a Bytes [#default-value-for-a-bytes]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email  String @unique
      secret Bytes  @default("SGVsbG8gd29ybGQ=")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id     String @default(auto()) @map("_id") @db.ObjectId
      secret Bytes  @default("SGVsbG8gd29ybGQ=")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Default value for an enum [#default-value-for-an-enum]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    enum Role {
      USER
      ADMIN
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```prisma highlight=5;normal
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  role    Role     @default(USER) // [!code highlight]
  posts   Post[]
  profile Profile?
}
```

<CodeBlockTabs defaultValue="MongoDB">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="MongoDB">
    ```prisma
    enum Role {
      USER
      ADMIN
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```prisma highlight=5;normal
model User {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  email   String   @unique
  name    String?
  role    Role     @default(USER) // [!code highlight]
  posts   Post[]
  profile Profile?
}
```

Default values for scalar lists [#default-values-for-scalar-lists]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma highlight=4;normal 
    model User {
      id             Int      @id @default(autoincrement())
      posts          Post[]
      favoriteColors String[] @default(["red", "yellow", "purple"]) // [!code highlight]
      roles          Role[]   @default([USER, DEVELOPER])
    }

    enum Role {
      USER
      DEVELOPER
      ADMIN
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma highlight=4;normal 
    model User {
      id             String   @id @default(auto()) @map("_id") @db.ObjectId
      posts          Post[]
      favoriteColors String[] @default(["red", "yellow", "purple"]) // [!code highlight]
      roles          Role[]   @default([USER, DEVELOPER])
    }

    enum Role {
      USER
      DEVELOPER
      ADMIN
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

@unique [#unique]

Defines a unique constraint for this field.

Remarks [#remarks-10]

General [#general-1]

* A field annotated with `@unique` can be optional or required
* A field annotated with `@unique` *must* be required if it represents the only unique constraint on a model without an `@id` / `@@id`
* A model can have any number of unique constraints
* Can be defined on any scalar field
* **Cannot** be defined on a relation field

Relational databases [#relational-databases-3]

* Corresponding database construct: `UNIQUE`
* `NULL` values are considered to be distinct (multiple rows with `NULL` values in the same column are allowed)
* Adding a unique constraint automatically adds a corresponding *unique index* to the specified column(s).

MongoDB [#mongodb-12]

* Enforced by a [unique index in MongoDB](https://www.mongodb.com/docs/manual/core/index-unique/)

Arguments [#arguments-3]

| Name        | Required | Type                   | Description                                                                                                                                                                                                                                                                                                                                                |
| ----------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map`       | **No**   | `String`               |                                                                                                                                                                                                                                                                                                                                                            |
| `length`    | **No**   | `number`               | Allows you to specify a maximum length for the subpart of the value to be indexed.<br /><br />MySQL only.                                                                                                                                                                                                                                                  |
| `sort`      | **No**   | `String`               | Allows you to specify in what order the entries of the constraint are stored in the database. The available options are `Asc` and `Desc`.                                                                                                                                                                                                                  |
| `clustered` | **No**   | `Boolean`              | Defines whether the constraint is clustered or non-clustered. Defaults to `false`.<br /><br />SQL Server only.                                                                                                                                                                                                                                             |
| `where`     | **No**   | `function` or `object` | Defines a [partial index](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) that only includes rows matching the specified condition. Accepts `raw("SQL expression")` or an object literal like `{ field: value }`.<br /><br />PostgreSQL, SQLite, SQL Server, and CockroachDB. Requires the `partialIndexes` Preview feature. |

* ¹ Can be required by some of the index and field types.

Signature [#signature-3]

```prisma no-lines
@unique(map: String?, length: number?, sort: String?, clustered: Boolean?, where: raw(String) | { field: value }?)
```

> **Note**: The `where` argument accepts either `raw("SQL expression")` for raw SQL predicates or an object literal like `{ field: value }` for type-safe conditions. See [Configuring partial indexes](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) for details.

> **Note**: Before the `partialIndexes` Preview feature, the signature was:
>
> ```prisma no-lines
> @unique(map: String?, length: number?, sort: String?, clustered: Boolean?)
> ```

Examples [#examples-9]

Specify a unique attribute on a required String field [#specify-a-unique-attribute-on-a-required-string-field]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      email String @unique
      name  String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @default(auto()) @map("_id") @db.ObjectId
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify a unique attribute on an optional String field [#specify-a-unique-attribute-on-an-optional-string-field]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id    Int     @id @default(autoincrement())
      email String? @unique
      name  String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id    String  @id @default(auto()) @map("_id") @db.ObjectId
      email String? @unique
      name  String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify a unique attribute on relation scalar field authorId [#specify-a-unique-attribute-on-relation-scalar-field-authorid]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model Post {
      author    User    @relation(fields: [authorId], references: [id])
      authorId  Int     @unique
      title     String
      published Boolean @default(false)
    }

    model User {
      id    Int     @id @default(autoincrement())
      email String? @unique
      name  String
      Post  Post[]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model Post {
      author    User    @relation(fields: [authorId], references: [id])
      authorId  String  @unique @db.ObjectId
      title     String
      published Boolean @default(false)
    }

    model User {
      id    String  @id @default(auto()) @map("_id") @db.ObjectId
      email String? @unique
      name  String
      Post  Post[]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify a unique attribute with cuid() values as default values [#specify-a-unique-attribute-with-cuid-values-as-default-values]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      token String @unique @default(cuid())
      name  String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id    String @id @default(auto()) @map("_id") @db.ObjectId
      token String @unique @default(cuid())
      name  String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

@@unique [#unique-1]

Defines a compound [unique constraint](/orm/prisma-schema/data-model/models#defining-a-unique-field) for the specified fields.

Remarks [#remarks-11]

General [#general-2]

* All fields that make up the unique constraint **must** be mandatory fields. The following model is **not** valid because `id` could be `null`:

  ```prisma
  model User {
    firstname Int
    lastname  Int
    id        Int?

    @@unique([firstname, lastname, id])
  }
  ```

  The reason for this behavior is that all connectors consider `null` values to be distinct, which means that two rows that *look* identical are considered unique:

  ```
   firstname  | lastname | id
   -----------+----------+------
   John       | Smith    | null
   John       | Smith    | null
  ```

* A model can have any number of `@@unique` blocks

Relational databases [#relational-databases-4]

* Corresponding database construct: `UNIQUE`
* A `@@unique` block is required if it represents the only unique constraint on a model without an `@id` / `@@id`
* Adding a unique constraint automatically adds a corresponding *unique index* to the specified column(s)

MongoDB [#mongodb-13]

* Enforced by a [compound index in MongoDB](https://www.mongodb.com/docs/manual/core/index-compound/)
* A `@@unique` block cannot be used as the only unique identifier for a model - MongoDB requires an `@id` field

Arguments [#arguments-4]

| Name        | Required | Type                   | Description                                                                                                                                                                                                                                                                                                                                                |
| ----------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`    | **Yes**  | `FieldReference[]`     | A list of field names - for example, `["firstname", "lastname"]`. Fields must be mandatory - see remarks.                                                                                                                                                                                                                                                  |
| `name`      | **No**   | `String`               | The name of the unique combination of fields - defaults to `fieldName1_fieldName2_fieldName3`                                                                                                                                                                                                                                                              |
| `map`       | **No**   | `String`               |                                                                                                                                                                                                                                                                                                                                                            |
| `length`    | **No**   | `number`               | Allows you to specify a maximum length for the subpart of the value to be indexed.<br /><br />MySQL only.                                                                                                                                                                                                                                                  |
| `sort`      | **No**   | `String`               | Allows you to specify in what order the entries of the constraint are stored in the database. The available options are `Asc` and `Desc`.                                                                                                                                                                                                                  |
| `clustered` | **No**   | `Boolean`              | Defines whether the constraint is clustered or non-clustered. Defaults to `false`.<br /><br />SQL Server only.                                                                                                                                                                                                                                             |
| `where`     | **No**   | `function` or `object` | Defines a [partial index](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) that only includes rows matching the specified condition. Accepts `raw("SQL expression")` or an object literal like `{ field: value }`.<br /><br />PostgreSQL, SQLite, SQL Server, and CockroachDB. Requires the `partialIndexes` Preview feature. |

The name of the `fields` argument on the `@@unique` attribute can be omitted:

```prisma no-lines
@@unique(fields: [title, author])
@@unique([title, author])
@@unique(fields: [title, author], name: "titleAuthor")
```

The `length` and `sort` arguments are added to the relevant field names:

```prisma no-lines
@@unique(fields: [title(length:10), author])
@@unique([title(sort: Desc), author(sort: Asc)])
```

Signature [#signature-4]

> ```prisma no-lines
> @@unique(_ fields: FieldReference[], name: String?, map: String?, where: raw(String) | { field: value }?)
> ```

> **Note**: The `where` argument accepts either `raw("SQL expression")` for raw SQL predicates or an object literal like `{ field: value }` for type-safe conditions. See [Configuring partial indexes](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) for details.

> **Note**: Before the `partialIndexes` Preview feature (and before version 4.0.0 / 3.5.0 with the `extendedIndexes` Preview feature), the signature was:
>
> ```prisma no-lines
> @@unique(_ fields: FieldReference[], name: String?, map: String?)
> ```

Examples [#examples-10]

Specify a multi-field unique attribute on two String fields [#specify-a-multi-field-unique-attribute-on-two-string-fields]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        Int     @default(autoincrement())
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName])
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String  @id @default(auto()) @map("_id") @db.ObjectId
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName])
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To retrieve a user, use the generated field name (`firstname_lastname`):

```ts highlight=3;normal
const user = await prisma.user.findUnique({
  where: {
    firstName_lastName: {
      firstName: "Alice",
      lastName: "Smith",
      isAdmin: true,
    },
  },
});
```

Specify a multi-field unique attribute on two String fields and one Boolean field [#specify-a-multi-field-unique-attribute-on-two-string-fields-and-one-boolean-field]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        Int     @default(autoincrement())
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName, isAdmin])
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String  @id @default(auto()) @map("_id") @db.ObjectId
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique([firstName, lastName, isAdmin])
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify a multi-field unique attribute that includes a relation field [#specify-a-multi-field-unique-attribute-that-includes-a-relation-field]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model Post {
      id        Int     @default(autoincrement())
      author    User    @relation(fields: [authorId], references: [id])
      authorId  Int
      title     String
      published Boolean @default(false)

      @@unique([authorId, title])
    }

    model User {
      id    Int    @id @default(autoincrement())
      email String @unique
      posts Post[]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model Post {
      id        String  @id @default(auto()) @map("_id") @db.ObjectId
      author    User    @relation(fields: [authorId], references: [id])
      authorId  String  @db.ObjectId
      title     String
      published Boolean @default(false)

      @@unique([authorId, title])
    }

    model User {
      id    String @id @default(auto()) @map("_id") @db.ObjectId
      email String @unique
      posts Post[]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify a custom name for a multi-field unique attribute [#specify-a-custom-name-for-a-multi-field-unique-attribute]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        Int     @default(autoincrement())
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique(fields: [firstName, lastName, isAdmin], name: "admin_identifier")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String  @id @default(auto()) @map("_id") @db.ObjectId
      firstName String
      lastName  String
      isAdmin   Boolean @default(false)

      @@unique(fields: [firstName, lastName, isAdmin], name: "admin_identifier")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To retrieve a user, use the custom field name (`admin_identifier`):

```ts highlight=3;normal
const user = await prisma.user.findUnique({
  where: {
    admin_identifier: {
      firstName: "Alice",
      lastName: "Smith",
      isAdmin: true,
    },
  },
});
```

@@index [#index]

Defines an index in the database.

Remarks [#remarks-12]

Relational databases [#relational-databases-5]

* Corresponding database construct: `INDEX`
* There are some additional index configuration options that cannot be provided via the Prisma schema yet. These include:
  * PostgreSQL and CockroachDB:
    * Define index fields as expressions (e.g. `CREATE INDEX title ON public."Post"((lower(title)) text_ops);`)
    * Create indexes concurrently with `CONCURRENTLY`

<CalloutContainer type="info">
  <CalloutDescription>
    While you cannot configure these option in your Prisma schema, you can still configure them on the database-level directly.
  </CalloutDescription>
</CalloutContainer>

MongoDB [#mongodb-14]

Arguments [#arguments-5]

| Name        | Required | Type                         | Description                                                                                                                                                                                                                                                                                                                                                |
| ----------- | -------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`    | **Yes**  | `FieldReference[]`           | A list of field names - for example, `["firstname", "lastname"]`                                                                                                                                                                                                                                                                                           |
| `name`      | **No**   | `String`                     | The name that Prisma Client will expose for the argument covering all fields, e.g. `fullName` in `fullName: { firstName: "First", lastName: "Last"}`                                                                                                                                                                                                       |
| `map`       | **No**   | `map`                        | The name of the index in the underlying database (Prisma generates an index name that respects identifier length limits if you do not specify a name. Prisma uses the following naming convention: `tablename.field1_field2_field3_unique`)                                                                                                                |
| `length`    | **No**   | `number`                     | Allows you to specify a maximum length for the subpart of the value to be indexed.<br /><br />MySQL only.                                                                                                                                                                                                                                                  |
| `sort`      | **No**   | `String`                     | Allows you to specify in what order the entries of the index or constraint are stored in the database. The available options are `asc` and `desc`.                                                                                                                                                                                                         |
| `clustered` | **No**   | `Boolean`                    | Defines whether the index is clustered or non-clustered. Defaults to `false`.<br /><br />SQL Server only.                                                                                                                                                                                                                                                  |
| `type`      | **No**   | `identifier`                 | Allows you to specify an index access method. Defaults to `BTree`.<br /><br />PostgreSQL and CockroachDB only.                                                                                                                                                                                                                                             |
| `ops`       | **No**   | `identifier` or a `function` | Allows you to define the index operators for certain index types.<br /><br />PostgreSQL only.                                                                                                                                                                                                                                                              |
| `where`     | **No**   | `function` or `object`       | Defines a [partial index](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) that only includes rows matching the specified condition. Accepts `raw("SQL expression")` or an object literal like `{ field: value }`.<br /><br />PostgreSQL, SQLite, SQL Server, and CockroachDB. Requires the `partialIndexes` Preview feature. |

The *name* of the `fields` argument on the `@@index` attribute can be omitted:

```prisma no-lines
@@index(fields: [title, author])
@@index([title, author])
```

The `length` and `sort` arguments are added to the relevant field names:

```prisma no-lines
@@index(fields: [title(length:10), author])
@@index([title(sort: Asc), author(sort: Desc)])
```

Signature [#signature-5]

```prisma no-lines
@@index(_ fields: FieldReference[], map: String?, where: raw(String) | { field: value }?)
```

> **Note**: The `where` argument accepts either `raw("SQL expression")` for raw SQL predicates or an object literal like `{ field: value }` for type-safe conditions. See [Configuring partial indexes](/orm/prisma-schema/data-model/indexes#configuring-partial-indexes-with-where) for details.

> **Note**: With the `partialIndexes` Preview feature, the `where` argument is available. Before this Preview feature, the signature was:
>
> ```prisma no-lines
> @@index(_ fields: FieldReference[], map: String?)
> ```

Examples [#examples-11]

Assume you want to add an index for the `title` field of the `Post` model

Define a single-column index (Relational databases only) [#define-a-single-column-index-relational-databases-only]

```prisma
model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?

  @@index([title])
}
```

Define a multi-column index (Relational databases only) [#define-a-multi-column-index-relational-databases-only]

```prisma
model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?

  @@index([title, content])
}
```

Define an index with a name (Relational databases only) [#define-an-index-with-a-name-relational-databases-only]

```prisma
model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?

  @@index(fields: [title, content], name: "main_index")
}
```

Define an index on a composite type field (Relational databases only) [#define-an-index-on-a-composite-type-field-relational-databases-only]

```prisma
type Address {
  street String
  number Int
}

model User {
  id      Int     @id
  email   String
  address Address

  @@index([address.number])
}
```

@relation [#relation]

Defines meta information about the relation. [Learn more](/orm/prisma-schema/data-model/relations#the-relation-attribute).

Remarks [#remarks-13]

Relational databases [#relational-databases-6]

* Corresponding database constructs: `FOREIGN KEY` / `REFERENCES`

MongoDB [#mongodb-15]

* If your model's primary key is of type `ObjectId` in the underlying database, both the primary key *and* the foreign key must have the `@db.ObjectId` attribute

Arguments [#arguments-6]

| Name         | Type                                                                                                                                           | Required                                                                                | Description                                                                                                                                                                | Example                                               |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `name`       | `String`                                                                                                                                       | Sometimes (e.g. to disambiguate a relation)                                             | Defines the name of the relationship. In an m-n-relation, it also determines the name of the underlying relation table.                                                    | `"CategoryOnPost"`, `"MyRelation"`                    |
| `fields`     | `FieldReference[]`                                                                                                                             | On [annotated](/orm/prisma-schema/data-model/relations#relation-fields) relation fields | A list of [fields](/orm/prisma-schema/data-model/models#defining-fields) of the *current* model                                                                            | `["authorId"]`, `["authorFirstName, authorLastName"]` |
| `references` | `FieldReference[]`                                                                                                                             | On [annotated](/orm/prisma-schema/data-model/relations#relation-fields) relation fields | A list of [fields](/orm/prisma-schema/data-model/models#defining-fields) of the model on *the other side of the relation*                                                  | `["id"]`, `["firstName, lastName"]`                   |
| `map`        | `String`                                                                                                                                       | No                                                                                      | Defines a [custom name](/orm/prisma-schema/data-model/database-mapping#constraint-and-index-names) for the foreign key in the database.                                    | `["id"]`, `["firstName, lastName"]`                   |
| `onUpdate`   | Enum. See [Types of referential actions](/orm/prisma-schema/data-model/relations/referential-actions#types-of-referential-actions) for values. | No                                                                                      | Defines the [referential action](/orm/prisma-schema/data-model/relations/referential-actions) to perform when a referenced entry in the referenced model is being updated. | `Cascade`, `NoAction`                                 |
| `onDelete`   | Enum. See [Types of referential actions](/orm/prisma-schema/data-model/relations/referential-actions#types-of-referential-actions) for values. | No                                                                                      | Defines the [referential action](/orm/prisma-schema/data-model/relations/referential-actions) to perform when a referenced entry in the referenced model is being deleted. | `Cascade`, `NoAction`                                 |

The name of the `name` argument on the `@relation` attribute can be omitted (`references` is required):

```prisma
@relation(name: "UserOnPost", references: [id])
@relation("UserOnPost", references: [id])

// or

@relation(name: "UserOnPost")
@relation("UserOnPost")
```

Signature [#signature-6]

```prisma no-lines
@relation(_ name: String?, fields: FieldReference[]?, references: FieldReference[]?, onDelete: ReferentialAction?, onUpdate: ReferentialAction?, map: String?)
```

With SQLite, the signature changes to:

```prisma no-lines
@relation(_ name: String?, fields: FieldReference[]?, references: FieldReference[]?, onDelete: ReferentialAction?, onUpdate: ReferentialAction?)
```

Examples [#examples-12]

See: [The `@relation` attribute](/orm/prisma-schema/data-model/relations#the-relation-attribute).

@map [#map]

Maps a field name or enum value from the Prisma schema to a column or document field with a different name in the database. If you do not use `@map`, the Prisma field name matches the column name or document field name exactly.

> See [Using custom model and field names](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) to see how `@map` and `@@map` changes the generated Prisma Client.

Remarks [#remarks-14]

General [#general-3]

* `@map` **does not** rename the columns / fields in the database
* `@map` **does** [change the field names in the generated client](#map-the-firstname-field-to-a-column-called-first_name)

MongoDB [#mongodb-16]

Your `@id` field must include `@map("_id")`. For example:

```prisma
model User {
  id String @default(auto()) @map("_id") @db.ObjectId
}
```

Arguments [#arguments-7]

| Name   | Type     | Required | Description                                                                  | Example                         |
| :----- | :------- | :------- | :--------------------------------------------------------------------------- | :------------------------------ |
| `name` | `String` | **Yes**  | The database column (relational databases) or document field (MongoDB) name. | `"comments"`, `"someFieldName"` |

The name of the `name` argument on the `@map` attribute can be omitted:

```prisma
@map(name: "is_admin")
@map("users")
```

Signature [#signature-7]

```prisma no-lines
@map(_ name: String)
```

Examples [#examples-13]

Map the firstName field to a column called first_name [#map-the-firstname-field-to-a-column-called-first_name]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        Int    @id @default(autoincrement())
      firstName String @map("first_name")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String @id @default(auto()) @map("_id") @db.ObjectId
      firstName String @map("first_name")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

The generated client:

```ts highlight=3;normal
await prisma.user.create({
  data: {
    firstName: "Yewande", // first_name */} firstName
  },
});
```

Map an enum named ADMIN to a database enum named admin [#map-an-enum-named-admin-to-a-database-enum-named-admin]

```prisma
enum Role {
  ADMIN    @map("admin")
  CUSTOMER
}
```

In Prisma ORM v7 and later, the generated TypeScript enum uses the mapped values:

```ts
export const Role = {
  ADMIN: "admin",
  CUSTOMER: "CUSTOMER",
} as const;
```

This means `Role.ADMIN` evaluates to `"admin"`, not `"ADMIN"`.

@@map [#map-1]

Maps the Prisma schema model name to a table (relational databases) or collection (MongoDB) with a different name, or an enum name to a different underlying enum in the database. If you do not use `@@map`, the model name matches the table (relational databases) or collection (MongoDB) name exactly.

> See [Using custom model and field names](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) to see how `@map` and `@@map` changes the generated Prisma Client.

Arguments [#arguments-8]

| Name   | Type     | Required | Description                                                             | Example                                     |
| :----- | :------- | :------- | :---------------------------------------------------------------------- | :------------------------------------------ |
| `name` | `String` | **Yes**  | The database table (relational databases) or collection (MongoDB) name. | `"comments"`, `"someTableOrCollectionName"` |

The name of the `name` argument on the `@@map` attribute can be omitted

```prisma
@@map(name: "users")
@@map("users")
```

Signature [#signature-8]

```prisma no-lines
@@map(_ name: String)
```

Examples [#examples-14]

Map the User model to a database table/collection named users [#map-the-user-model-to-a-database-tablecollection-named-users]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   Int    @id @default(autoincrement())
      name String

      @@map("users")
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(auto()) @map("_id") @db.ObjectId
      name String

      @@map("users")
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

The generated client:

```ts highlight=1;normal
await prisma.user.create({
  // users */} user
  data: {
    name: "Yewande",
  },
});
```

Map the Role enum to a native enum in the database named _Role its values to lowercase values in the database [#map-the-role-enum-to-a-native-enum-in-the-database-named-_role-its-values-to-lowercase-values-in-the-database]

```prisma
enum Role {
  ADMIN    @map("admin")
  CUSTOMER @map("customer")

  @@map("_Role")
}
```

@updatedAt [#updatedat]

Automatically stores the time when a record was last updated. If you do not supply a time yourself, Prisma Client will automatically set the value for fields with this attribute.

Remarks [#remarks-15]

* Compatible with [`DateTime`](#datetime) fields
* Implemented at Prisma ORM level

<CalloutContainer type="warning">
  <CalloutDescription>
    In versions before [4.4.0](https://github.com/prisma/prisma/releases/tag/4.4.0), if you're also using [`now()`](/orm/reference/prisma-schema-reference#now), the time might differ from the `@updatedAt` values if your database and app have different time zones. This happens because `@updatedAt` operates at the Prisma ORM level, while `now()` operates at the database level.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    If you pass an empty update clause, the @updatedAt value will remain unchanged. For example:

    ```ts
    await prisma.user.update({
      where: {
        id: 1,
      },
      data: {}, //<- Empty update clause
    });
    ```
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-9]

N/A

Signature [#signature-9]

```prisma no-lines
@updatedAt
```

Examples [#examples-15]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma line-number 
    model Post {
      id        String   @id
      updatedAt DateTime @updatedAt
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma line-number 
    model Post {
      id        String   @id @map("_id") @db.ObjectId
      updatedAt DateTime @updatedAt
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

@ignore [#ignore]

Add `@ignore` to a field that you want to exclude from Prisma Client (for example, a field that you do not want Prisma Client users to update). Ignored fields are excluded from the generated Prisma Client. The model's `create` method is disabled when doing this for *required* fields with no `@default` (because the database cannot create an entry without that data).

Remarks [#remarks-16]

* Prisma ORM automatically adds `@ignore` to fields that *refer to* invalid models when you introspect.

Examples [#examples-16]

The following example demonstrates manually adding `@ignore` to exclude the `email` field from Prisma Client:

```prisma title="schema.prisma" highlight=4;normal
model User {
  id    Int    @id
  name  String
  email String @ignore // this field will be excluded // [!code highlight]
}
```

@@ignore [#ignore-1]

Add `@@ignore` to a model that you want to exclude from Prisma Client (for example, a model that you do not want Prisma users to update). Ignored models are excluded from the generated Prisma Client.

Remarks [#remarks-17]

* Prisma ORM adds `@@ignore` to an invalid model during introspection. (It also adds [`@ignore`](#ignore) to relations pointing to such a model)

Examples [#examples-17]

In the following example, the `Post` model is invalid because it does not have a unique identifier. Use `@@ignore` to exclude it from the generated Prisma Client API:

```prisma title="schema.prisma" highlight=7;normal
/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
model Post {
  id       Int  @default(autoincrement()) // no unique identifier
  author   User @relation(fields: [authorId], references: [id])
  authorId Int

  @@ignore // [!code highlight]
}
```

In the following example, the `Post` model is invalid because it does not have a unique identifier, and the `posts` relation field on `User` is invalid because it refers to the invalid `Post` model. Use `@@ignore` on the `Post` model and `@ignore` on the `posts` relation field in `User` to exclude both the model and the relation field from the generated Prisma Client API:

```prisma title="schema.prisma" highlight=7,13;normal
/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
model Post {
  id       Int  @default(autoincrement()) // no unique identifier
  author   User @relation(fields: [authorId], references: [id])
  authorId Int

  @@ignore // [!code highlight]
}

model User {
  id    Int     @id @default(autoincrement())
  name  String?
  posts Post[]  @ignore // [!code highlight]
}
```

@@schema [#schema]

Add `@@schema` to a model to specify which schema in your database should contain the table associated with that model. Learn more about [adding multiple schema's here](/orm/prisma-schema/data-model/multi-schema).

<CalloutContainer type="info">
  <CalloutDescription>
    [Multiple database schema](/orm/prisma-schema/data-model/multi-schema) support is only available with the PostgreSQL, CockroachDB, and SQL Server connectors.
  </CalloutDescription>
</CalloutContainer>

Arguments [#arguments-10]

| Name   | Type     | Required | Description                      | Example            |
| :----- | :------- | :------- | :------------------------------- | :----------------- |
| `name` | `String` | **Yes**  | The name of the database schema. | `"base"`, `"auth"` |

The name of the `name` argument on the `@@schema` attribute can be omitted

```prisma
@@schema(name: "auth")
@@schema("auth")
```

Signature [#signature-10]

```prisma no-lines
@@schema(_ name: String)
```

Examples [#examples-18]

Map the User model to a database schema named auth [#map-the-user-model-to-a-database-schema-named-auth]

```prisma highlight=3,9,16;normal
generator client {
  provider        = "prisma-client"
  output          = "./generated"
}

datasource db {
  provider = "postgresql"
  schemas  = ["auth"] // [!code highlight]
}

model User {
  id   Int    @id @default(autoincrement())
  name String

  @@schema("auth") // [!code highlight]
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    For more information about using the `multiSchema` feature, refer to [this guide](/orm/prisma-schema/data-model/multi-schema).
  </CalloutDescription>
</CalloutContainer>

@shardKey [#shardkey]

<CalloutContainer type="info">
  <CalloutDescription>
    This feature requires the `shardKeys` Preview feature flag on your `generator`:

    ```prisma
    generator client {
      provider = "prisma-client"
      output = "../generated/prisma"
      previewFeatures = ["shardKeys"]
    }
    ```
  </CalloutDescription>
</CalloutContainer>

The `@shardKey` attribute is only compatible with [PlanetScale](http://planetscale.com/) databases. It enables you define a [shard key](https://planetscale.com/docs/vitess/sharding) on a field of your model:

```prisma
model User {
  id     String @default(uuid())
  region String @shardKey
}
```

@@shardKey [#shardkey-1]

<CalloutContainer type="info">
  <CalloutDescription>
    This feature requires the `shardKeys` Preview feature flag on your `generator`:

    ```prisma
    generator client {
      provider = "prisma-client"
      output = "../generated/prisma"
      previewFeatures = ["shardKeys"]
    }
    ```
  </CalloutDescription>
</CalloutContainer>

The `@@shardKey` attribute is only compatible with [PlanetScale](http://planetscale.com/) databases. It enables you define a [shard key](https://planetscale.com/docs/vitess/sharding) on multiple fields of your model:

```prisma
model User {
  id         String @default(uuid())
  country    String
  customerId String
  @@shardKey([country, customerId])
}
```

Attribute functions [#attribute-functions]

auto() [#auto]

<CalloutContainer type="warning">
  <CalloutDescription>
    This function is available on MongoDB only.
  </CalloutDescription>
</CalloutContainer>

Represents **default values** that are automatically generated by the database.

Remarks [#remarks-18]

MongoDB [#mongodb-17]

Used to generate an `ObjectId` for `@id` fields:

```prisma
id  String  @map("_id") @db.ObjectId @default(auto())
```

Relational databases [#relational-databases-7]

The `auto()` function is not available on relational databases.

Example [#example]

Generate ObjectId (MongoDB only) [#generate-objectid-mongodb-only]

```prisma
model User {
  id   String  @id @default(auto()) @map("_id") @db.ObjectId
  name String?
}
```

autoincrement() [#autoincrement]

<CalloutContainer type="warning">
  <CalloutDescription>
    **Not supported by MongoDB** <br />
    The [MongoDB connector](/orm/core-concepts/supported-databases/mongodb) does not support the `autoincrement()` function.
  </CalloutDescription>
</CalloutContainer>

Create a sequence of integers in the underlying database and assign the incremented values to the ID values of the created records based on the sequence.

Remarks [#remarks-19]

* Compatible with `Int` on most databases (`BigInt` on CockroachDB)
* Implemented on the database-level, meaning that it manifests in the database schema and can be recognized through introspection. Database implementations:

  | Database    | Implementation                                                                                    |
  | ----------- | ------------------------------------------------------------------------------------------------- |
  | PostgreSQL  | [`SERIAL`](https://www.postgresql.org/docs/9.1/datatype-numeric.html#DATATYPE-SERIAL) type        |
  | MySQL       | [`AUTO_INCREMENT`](https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html) attribute |
  | SQLite      | [`AUTOINCREMENT`](https://www.sqlite.org/autoinc.html) keyword                                    |
  | CockroachDB | [`SERIAL`](https://www.postgresql.org/docs/9.1/datatype-numeric.html#DATATYPE-SERIAL) type        |

Examples [#examples-19]

Generate autoincrementing integers as IDs (Relational databases only) [#generate-autoincrementing-integers-as-ids-relational-databases-only-1]

```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String
}
```

sequence() [#sequence]

<CalloutContainer type="info">
  <CalloutDescription>
    **Only supported by CockroachDB** <br />
    The sequence function is only supported by [CockroachDB connector](/orm/core-concepts/supported-databases/postgresql#cockroachdb).
  </CalloutDescription>
</CalloutContainer>

Create a sequence of integers in the underlying database and assign the incremented values to the values of the created records based on the sequence.

Optional arguments [#optional-arguments]

| Argument    | Example                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `virtual`   | `@default(sequence(virtual))`<br />Virtual sequences are sequences that do not generate monotonically increasing values and instead produce values like those generated by the built-in function `unique_rowid()`. |
| `cache`     | `@default(sequence(cache: 20))`<br />The number of sequence values to cache in memory for reuse in the session. A cache size of `1` means that there is no cache, and cache sizes of less than `1` are not valid.  |
| `increment` | `@default(sequence(increment: 4))`<br />The new value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.                      |
| `minValue`  | `@default(sequence(minValue: 10))`<br />The new minimum value of the sequence.                                                                                                                                     |
| `maxValue`  | `@default(sequence(maxValue: 3030303))`<br />The new maximum value of the sequence.                                                                                                                                |
| `start`     | `@default(sequence(start: 2))`<br />The value the sequence starts at, if it's restarted or if the sequence hits the `maxValue`.                                                                                    |

Examples [#examples-20]

Generate sequencing integers as IDs [#generate-sequencing-integers-as-ids]

```prisma
model User {
  id   Int    @id @default(sequence(maxValue: 4294967295))
  name String
}
```

cuid() [#cuid]

Generate a globally unique identifier based on the [`cuid`](https://github.com/ericelliott/cuid) spec.

If you'd like to use [`cuid2`](https://github.com/paralleldrive/cuid2) values, you can pass `2` as an argument to the `cuid` function: `cuid(2)`.

Remarks [#remarks-20]

* Compatible with `String`.
* Implemented by Prisma ORM and therefore not "visible" in the underlying database schema. You can still use `cuid()` when using [introspection](/orm/prisma-schema/introspection) by [manually changing your Prisma schema](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) and generating Prisma Client, in that case the values will be generated by Prisma ORM.
* Since the length of `cuid()` output is undefined per the cuid creator, a safe field size is 30 characters, in order to allow for enough characters for very large values. If you set the field size as less than 30, and then a larger value is generated by `cuid()`, you might see Prisma Client errors such as `Error: The provided value for the column is too long for the column's type.`
* For **MongoDB**: `cuid()` does not generate a valid `ObjectId`. You can use [`@db.ObjectId` syntax](#generate-objectid-as-ids-mongodb-only) if you want to use `ObjectId` in the underlying database. However, you can still use `cuid()` if your `_id` field is not of type `ObjectId`.

Examples [#examples-21]

Generate cuid() values as IDs [#generate-cuid-values-as-ids-1]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(cuid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(cuid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Generate cuid(2) values as IDs based on the cuid2 spec [#generate-cuid2-values-as-ids-based-on-the-cuid2-spec]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(cuid(2))
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(cuid(2)) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

uuid() [#uuid]

Generate a globally unique identifier based on the [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) spec. Prisma ORM supports versions 4 (default) and 7.

Remarks [#remarks-21]

* Compatible with `String`.
* Implemented by Prisma ORM and therefore not "visible" in the underlying database schema. You can still use `uuid()` when using [introspection](/orm/prisma-schema/introspection) by [manually changing your Prisma schema](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) and generating Prisma Client, in that case the values will be generated by Prisma ORM.
* For **relational databases**: If you do not want to use Prisma ORM's `uuid()` function, you can use [the native database function with `dbgenerated`](#override-default-value-behavior-for-supported-types).
* For **MongoDB**: `uuid()` does not generate a valid `ObjectId`. You can use [`@db.ObjectId` syntax](#generate-objectid-as-ids-mongodb-only) if you want to use `ObjectId` in the underlying database. However, you can still use `uuid()` if your `_id` field is not of type `ObjectId`.

Examples [#examples-22]

Generate uuid() values as IDs using UUID v4 [#generate-uuid-values-as-ids-using-uuid-v4]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(uuid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(uuid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Generate uuid(7) values as IDs using UUID v7 [#generate-uuid7-values-as-ids-using-uuid-v7]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(uuid(7))
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(uuid(7)) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

ulid() [#ulid]

Generate a universally unique lexicographically sortable identifier based on the [ULID](https://github.com/ulid/spec) spec.

Remarks [#remarks-22]

* `ulid()` will produce 128-bit random identifier represented as a 26-character long alphanumeric string, e.g.: `01ARZ3NDEKTSV4RRFFQ69G5FAV`

Examples [#examples-23]

Generate ulid() values as IDs [#generate-ulid-values-as-ids-1]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(ulid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(ulid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

nanoid() [#nanoid]

Generated values based on the [Nano ID](https://github.com/ai/nanoid) spec. `nanoid()` accepts an integer value between 2 and 255 that specifies the *length* of the generate ID value, e.g. `nanoid(16)` will generated ID with 16 characters. If you don't provide a value to the nanoid() function, the default value is 21.

<CalloutContainer type="info">
  <CalloutDescription>
    Nano ID is quite comparable to UUID v4 (random-based). It has a similar number of random bits in the ID (126 in Nano ID and 122 in UUID), so it has a similar collision probability:

    For there to be a one in a billion chance of duplication, 103 trillion version 4 IDs must be generated.

    There are two main differences between Nano ID and UUID v4:

    * Nano ID uses a bigger alphabet, so a similar number of random bits are packed in just 21 symbols instead of 36.
    * Nano ID code is 4 times smaller than uuid/v4 package: 130 bytes instead of 423.
  </CalloutDescription>
</CalloutContainer>

Remarks [#remarks-23]

* Compatible with `String`.
* Implemented by Prisma ORM and therefore not "visible" in the underlying database schema. You can still use `uuid()` when using [introspection](/orm/prisma-schema/introspection) by [manually changing your Prisma schema](/orm/prisma-client/setup-and-configuration/custom-model-and-field-names) and [generating Prisma Client](/orm/reference/prisma-schema-reference#fields-for-prisma-client-provider), in that case the values will be generated by Prisma ORM.
* For **MongoDB**: `nanoid()` does not generate a valid `ObjectId`. You can use [`@db.ObjectId` syntax](#generate-objectid-as-ids-mongodb-only) if you want to use `ObjectId` in the underlying database. However, you can still use `nanoid()` if your `_id` field is not of type `ObjectId`.

Examples [#examples-24]

Generate nanoid() values with 21 characters as IDs [#generate-nanoid-values-with-21-characters-as-ids]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(nanoid())
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(nanoid()) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Generate nanoid() values with 16 characters as IDs [#generate-nanoid-values-with-16-characters-as-ids]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id   String @id @default(nanoid(16))
      name String
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id   String @id @default(nanoid(16)) @map("_id")
      name String
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

now() [#now]

Set a timestamp of the time when a record is created.

Remarks [#remarks-24]

General [#general-4]

* Compatible with [`DateTime`](#datetime)

<CalloutContainer type="warning">
  <CalloutDescription>
    In versions before [4.4.0](https://github.com/prisma/prisma/releases/tag/4.4.0), if you're also using [`@updatedAt`](/orm/reference/prisma-schema-reference#updatedat), the time might differ from the `now()` values if your database and app have different time zones. This happens because `@updatedAt` operates at the Prisma ORM level, while `now()` operates at the database level.
  </CalloutDescription>
</CalloutContainer>

Relational databases [#relational-databases-8]

* Implemented on the database-level, meaning that it manifests in the database schema and can be recognized through introspection. Database implementations:

  | Database    | Implementation                                                                                                                                  |
  | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
  | PostgreSQL  | [`CURRENT_TIMESTAMP`](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT) and aliases like `now()`      |
  | MySQL       | [`CURRENT_TIMESTAMP`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_current-timestamp) and aliases like `now()` |
  | SQLite      | `CURRENT_TIMESTAMP` and aliases like `date('now')`                                                                                              |
  | CockroachDB | [`CURRENT_TIMESTAMP`](https://www.cockroachlabs.com/docs/stable/functions-and-operators#special-syntax-forms) and aliases like `now()`          |

MongoDB [#mongodb-18]

* Implemented at Prisma ORM level

Examples [#examples-25]

Set current timestamp value when a record is created [#set-current-timestamp-value-when-a-record-is-created]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    model User {
      id        String   @id
      createdAt DateTime @default(now())
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    model User {
      id        String   @id @default(auto()) @map("_id") @db.ObjectId
      createdAt DateTime @default(now())
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

dbgenerated(...) [#dbgenerated]

Represents **default values** that cannot be expressed in the Prisma schema (such as `random()`).

Remarks [#remarks-25]

Relational databases [#relational-databases-9]

* Compatible with any scalar type

* Can not be an empty string `dbgenerated("")`

* Accepts a `String` value, which allows you to:
  * [Set default values for `Unsupported` types](#set-default-value-for-unsupported-type)
  * [Override default value behavior for supported types](#override-default-value-behavior-for-supported-types)

* String values in `dbgenerated(...)` might not match what the DB returns as the default value, because values such as strings may be explicitly cast (e.g. `'hello'::STRING`). When a mismatch is present, Prisma Migrate indicates a migration is still needed. You can use `prisma db pull` to infer the correct value to resolve the discrepancy. ([Related issue](https://github.com/prisma/prisma/issues/14917))

Examples [#examples-26]

Set default value for Unsupported type [#set-default-value-for-unsupported-type]

```prisma
circle     Unsupported("circle")?   @default(dbgenerated("'<(10,4),11>'::circle"))
```

Override default value behavior for supported types [#override-default-value-behavior-for-supported-types]

You can also use `dbgenerated(...)` to set the default value for supported types. For example, in PostgreSQL you can generate UUIDs at the database level rather than rely on Prisma ORM's `uuid()`:

```prisma highlight=2;add|3;delete
model User {
  id   String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid // [!code ++]
  id   String  @id @default(uuid()) @db.Uuid // [!code --]
  test String?
}
```

<CalloutContainer type="info">
  <CalloutDescription>
    [`gen_random_uuid()` is a PostgreSQL function](https://www.postgresql.org/docs/13/functions-uuid.html). To use it in PostgreSQL versions 12.13 and earlier, you must enable the `pgcrypto` extension. See [PostgreSQL extensions](/orm/prisma-schema/postgresql-extensions) for how to install extensions.
  </CalloutDescription>
</CalloutContainer>

Attribute argument types [#attribute-argument-types]

FieldReference[] [#fieldreference]

An array of [field](#model-fields) names: `[id]`, `[firstName, lastName]`

String [#string-1]

A variable length text in double quotes: `""`, `"Hello World"`, `"Alice"`

Expression [#expression]

An expression that can be evaluated by Prisma ORM: `42.0`, `""`, `Bob`, `now()`, `cuid()`

enum [#enum]

<CalloutContainer type="warning">
  <CalloutDescription>
    **Not supported Microsoft SQL Server** <br />
    The [Microsoft SQL Server connector](/orm/core-concepts/supported-databases/sql-server) does not support the `enum` type.
  </CalloutDescription>
</CalloutContainer>

Defines an [enum](/orm/prisma-schema/data-model/models#defining-enums) .

Remarks [#remarks-26]

* Enums are natively supported by [PostgreSQL](https://www.postgresql.org/docs/current/datatype-enum.html) and [MySQL](https://dev.mysql.com/doc/refman/8.0/en/enum.html)
* Enums are implemented and enforced at Prisma ORM level in SQLite and MongoDB

Naming conventions [#naming-conventions-2]

* Enum names must start with a letter (they are typically spelled in [PascalCase](http://wiki.c2.com/?PascalCase))
* Enums must use the singular form (e.g. `Role` instead of `role`, `roles` or `Roles`).
* Must adhere to the following regular expression: `[A-Za-z][A-Za-z0-9_]*`

Examples [#examples-27]

Specify an enum with two possible values [#specify-an-enum-with-two-possible-values]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    enum Role {
      USER
      ADMIN
    }

    model User {
      id   Int  @id @default(autoincrement())
      role Role
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    enum Role {
      USER
      ADMIN
    }

    model User {
      id   String @id @default(auto()) @map("_id") @db.ObjectId
      role Role
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Specify an enum with two possible values and set a default value [#specify-an-enum-with-two-possible-values-and-set-a-default-value]

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```prisma
    enum Role {
      USER
      ADMIN
    }

    model User {
      id   Int  @id @default(autoincrement())
      role Role @default(USER)
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MongoDB">
    ```prisma
    enum Role {
      USER
      ADMIN
    }

    model User {
      id   String @id @default(auto()) @map("_id") @db.ObjectId
      role Role   @default(USER)
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

type [#type]

<CalloutContainer type="warning">
  <CalloutDescription>
    Composite types are available **for MongoDB only**.
  </CalloutDescription>
</CalloutContainer>

Defines a [composite type](/orm/prisma-schema/data-model/models#defining-composite-types-mongodb).

Naming conventions [#naming-conventions-3]

Type names must:

* start with a letter (they are typically spelled in [PascalCase](http://wiki.c2.com/?PascalCase))
* adhere to the following regular expression: `[A-Za-z][A-Za-z0-9_]*`

Examples [#examples-28]

Define a Product model with a list of Photo composite types [#define-a-product-model-with-a-list-of-photo-composite-types]

```prisma
model Product {
  id     String  @id @default(auto()) @map("_id") @db.ObjectId
  name   String
  photos Photo[]
}

type Photo {
  height Int
  width  Int
  url    String
}
```
# Config API (/docs/orm/reference/prisma-config-reference)



The Prisma Config file (`prisma.config.ts`) configures the Prisma CLI using TypeScript. It's automatically created when you run `prisma init`.

You can define your config using either the `defineConfig` helper or TypeScript's `satisfies` operator:

* Using the `defineConfig` helper:

  ```ts
  import "dotenv/config";
  import { defineConfig, env } from "prisma/config";

  export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
      path: "prisma/migrations",
      seed: "tsx prisma/seed.ts",
    },
    datasource: {
      url: env("DATABASE_URL"),
    },
  });
  ```

* Using TypeScript's `satisfies` operator with the `PrismaConfig` type:

  ```ts
  import "dotenv/config";
  import type { PrismaConfig } from "prisma";
  import { env } from "prisma/config";

  export default {
    schema: "prisma/schema.prisma",
    migrations: {
      path: "prisma/migrations",
      seed: "tsx prisma/seed.ts",
    },
    datasource: {
      url: env("DATABASE_URL"),
    },
  } satisfies PrismaConfig;
  ```

Configuration interface [#configuration-interface]

Here is a simplified version of the `PrismaConfig` type:

```ts
export declare type PrismaConfig = {
  // Whether features with an unstable API are enabled.
  experimental: {
    externalTables: boolean;
  };

  // The path to the schema file, or path to a folder that shall be recursively searched for *.prisma files.
  schema?: string;

  // Configuration for Prisma migrations.
  migrations?: {
    path: string;
    seed: string;
    initShadowDb: string;
  };

  // Configuration for the database view entities.
  views?: {
    path: string;
  };

  // Configuration for the `typedSql` preview feature.
  typedSql?: {
    path: string;
  };

  // Database connection configuration
  datasource?: {
    url: string;
    shadowDatabaseUrl?: string;
  };
};
```

Supported file extensions [#supported-file-extensions]

Prisma Config files can be named as `prisma.config.*` or `.config/prisma.*` with the extensions `js`, `ts`, `mjs`, `cjs`, `mts`, or `cts`. Other extensions are supported to ensure compatibility with different TypeScript compiler settings.

<CalloutContainer type="info">
  <CalloutTitle>
    Recommendation
  </CalloutTitle>

  <CalloutDescription>
    * Use **`prisma.config.ts`** for small TypeScript projects.
    * Use **`.config/prisma.ts`** for larger TypeScript projects with multiple configuration files (following the [`.config` directory proposal](https://github.com/pi0/config-dir)).
  </CalloutDescription>
</CalloutContainer>

Options reference [#options-reference]

schema [#schema]

Configures how Prisma ORM locates and loads your schema file(s). Can be a file or folder path. Relative paths are resolved relative to the `prisma.config.ts` file location. See [here](/orm/prisma-schema/overview/location#multi-file-prisma-schema) for more info about schema location options.

| Property | Type     | Required | Default                                        |
| -------- | -------- | -------- | ---------------------------------------------- |
| `schema` | `string` | No       | `./prisma/schema.prisma` and `./schema.prisma` |

tables.external and enums.external [#tablesexternal-and-enumsexternal]

These options declare tables and enums in your database that are **managed externally** (not by Prisma Migrate). You can still query them with Prisma Client, but they will be ignored by migrations.

| Property          | Type       | Required | Default |
| ----------------- | ---------- | -------- | ------- |
| `tables.external` | `string[]` | No       | `[]`    |
| `enums.external`  | `string[]` | No       | `[]`    |

**Example:**

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: ["public.users"],
  },
  enums: {
    external: ["public.role"],
  },
});
```

Learn more about the [`externalTables` feature here](/orm/prisma-schema/data-model/externally-managed-tables).

migrations.path [#migrationspath]

The path to the directory where Prisma should store migration files, and look for them.

| Property          | Type     | Required | Default |
| ----------------- | -------- | -------- | ------- |
| `migrations.path` | `string` | No       | none    |

migrations.seed [#migrationsseed]

Defines the command to run when executing `npx prisma db seed`. Seeding is only triggered explicitly via this command.

| Property          | Type     | Required | Default |
| ----------------- | -------- | -------- | ------- |
| `migrations.seed` | `string` | No       | none    |

**Example:**

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx db/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

migrations.initShadowDb [#migrationsinitshadowdb]

This option allows you to define SQL statements that Prisma runs on the **shadow database** before creating migrations. It is useful when working with [external managed tables](/orm/prisma-schema/data-model/externally-managed-tables), as Prisma needs to know about the structure of these tables to correctly generate migrations.

| Property                  | Type     | Required | Default |
| ------------------------- | -------- | -------- | ------- |
| `migrations.initShadowDb` | `string` | No       | none    |

**Example:**

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    initShadowDb: `
      CREATE TABLE public.users (id SERIAL PRIMARY KEY);
    `,
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: ["public.users"],
  },
});
```

Learn more about the [`externalTables` feature here](/orm/prisma-schema/data-model/externally-managed-tables).

views.path [#viewspath]

The path to the directory where Prisma should look for the SQL view definitions.

| Property     | Type     | Required | Default |
| ------------ | -------- | -------- | ------- |
| `views.path` | `string` | No       | none    |

typedSql.path [#typedsqlpath]

The path to the directory where Prisma should look for the SQL files used for generating typings via [`typedSql`](/orm/prisma-client/using-raw-sql/typedsql).

| Property        | Type     | Required | Default |
| --------------- | -------- | -------- | ------- |
| `typedSql.path` | `string` | No       | none    |

experimental [#experimental]

Enables specific experimental features in the Prisma CLI.

| Property         | Type      | Required | Default |
| ---------------- | --------- | -------- | ------- |
| `externalTables` | `boolean` | No       | `false` |

Example:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  experimental: {
    externalTables: true,
  },
});
```

<CalloutContainer type="info">
  <CalloutDescription>
    If you use the `externalTables` feature without enabling the experimental flag, Prisma will throw an error:

    ```bash
    Failed to load config file "~" as a TypeScript/JavaScript module. Error: Error: The `externalTables` configuration requires `experimental.externalTables` to be set to `true`.
    ```
  </CalloutDescription>
</CalloutContainer>

datasource.url [#datasourceurl]

Connection URL including authentication info. Uses [the syntax provided by the database](/orm/reference/connection-urls#format).

| Property         | Type     | Required | Default |
| ---------------- | -------- | -------- | ------- |
| `datasource.url` | `string` | Yes      | `''`    |

**Example:**

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

datasource.shadowDatabaseUrl [#datasourceshadowdatabaseurl]

Connection URL to the shadow database used by Prisma Migrate. Allows you to use a cloud-hosted database as the shadow database.

| Property                       | Type     | Required | Default |
| ------------------------------ | -------- | -------- | ------- |
| `datasource.shadowDatabaseUrl` | `string` | No       | `''`    |

datasource.directUrl (Removed) [#datasourcedirecturl-removed]

<CalloutContainer type="warning">
  <CalloutTitle>
    Removed in Prisma ORM v7
  </CalloutTitle>

  <CalloutDescription>
    The `datasource.directUrl` property has been removed in Prisma ORM v7 in favor of the [`url` property](#datasourceurl).
  </CalloutDescription>
</CalloutContainer>

<details>
  <summary>
    For Prisma ORM v6.19 and earlier
  </summary>

  Connection URL for direct connection to the database.

  If you use a connection pooler URL in the `url` argument (for example, pgBouncer), Prisma CLI commands that require a direct connection to the database use the URL in the `directUrl` argument.

  The `directUrl` property is supported by Prisma Studio from version 5.1.0 upwards. The `directUrl` property is not needed when using [Prisma Postgres](/postgres) database.

  | Property               | Type     | Required | Default |
  | ---------------------- | -------- | -------- | ------- |
  | `datasource.directUrl` | `string` | No       | `''`    |
</details>

adapter (Removed) [#adapter-removed]

<CalloutContainer type="warning">
  <CalloutTitle>
    Removed in Prisma ORM v7
  </CalloutTitle>

  <CalloutDescription>
    The `adapter` property has been removed in Prisma ORM v7. Migrations for driver adapters work automatically without additional configuration in `prisma.config.ts` as of Prisma ORM v7.
  </CalloutDescription>
</CalloutContainer>

<details>
  <summary>
    For Prisma ORM v6.19 and earlier
  </summary>

  A function that returns a Prisma driver adapter instance which is used by the Prisma CLI to run migrations. The function should return a `Promise` that resolves to a valid Prisma driver adapter.

  | Property  | Type                                                   | Required | Default |
  | --------- | ------------------------------------------------------ | -------- | ------- |
  | `adapter` | `() => Promise<SqlMigrationAwareDriverAdapterFactory>` | No       | none    |

  Example using the Prisma ORM D1 driver adapter:

  ```ts
  import path from "node:path";
  import type { PrismaConfig } from "prisma";
  import { PrismaD1 } from "@prisma/adapter-d1";

  export default {
    experimental: {
      adapter: true,
    },
    engine: "js",
    schema: path.join("prisma", "schema.prisma"),
    async adapter() {
      return new PrismaD1({
        CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID,
      });
    },
  } satisfies PrismaConfig;
  ```

  <CalloutContainer type="info">
    <CalloutDescription>
      As of [Prisma ORM v6.11.0](https://github.com/prisma/prisma/releases/tag/6.11.0), the D1 adapter has been renamed from `PrismaD1HTTP` to `PrismaD1`.
    </CalloutDescription>
  </CalloutContainer>
</details>

engine (Removed) [#engine-removed]

<CalloutContainer type="warning">
  <CalloutTitle>
    Removed in Prisma ORM v7
  </CalloutTitle>

  <CalloutDescription>
    The `engine` property has been removed in Prisma ORM v7.
  </CalloutDescription>
</CalloutContainer>

<details>
  <summary>
    For Prisma ORM v6.19 and earlier
  </summary>

  Configure the schema engine your project should use.

  | Property | Type              | Required | Default   |
  | -------- | ----------------- | -------- | --------- |
  | `engine` | `classic` or `js` | No       | `classic` |

  By default it is set to use the classic engine, which requires that `datasource` be set in your `prisma.config.ts`.

  ```ts
  import "dotenv/config";
  import path from "node:path";
  import { defineConfig, env } from "prisma/config";
  export default defineConfig({
    engine: "classic",
    datasource: {
      url: env("DATABASE_URL"),
    },
    schema: path.join("prisma", "schema.prisma"),
  });
  ```
</details>

studio (Removed) [#studio-removed]

<CalloutContainer type="warning">
  <CalloutTitle>
    Removed in Prisma ORM v7
  </CalloutTitle>

  <CalloutDescription>
    The `studio` property has been removed in Prisma ORM v7. To run Prisma Studio, use:

    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx prisma studio --config ./prisma.config.ts
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx prisma studio --config ./prisma.config.ts
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx prisma studio --config ./prisma.config.ts
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bunx --bun prisma studio --config ./prisma.config.ts
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    Prisma Studio now uses the connection configuration from the `datasource` property automatically. See the [Prisma Studio documentation](/orm/reference/prisma-cli-reference#studio) for more details.
  </CalloutDescription>
</CalloutContainer>

<details>
  <summary>
    For Prisma ORM v6.19 and earlier
  </summary>

  Configures how Prisma Studio connects to your database. See sub-options below for details.

  | Property | Type     | Required | Default |
  | -------- | -------- | -------- | ------- |
  | `studio` | `object` | No       | none    |

  studio.adapter (Removed) [#studioadapter-removed]

  A function that returns a Prisma driver adapter instance. The function receives an `env` parameter containing environment variables and should return a `Promise` that resolves to a valid Prisma driver adapter.

  | Property          | Type                                                           | Required | Default |
  | ----------------- | -------------------------------------------------------------- | -------- | ------- |
  | `studio.adapter ` | `(env: Env) => Promise<SqlMigrationAwareDriverAdapterFactory>` | No       | none    |

  Example using the Prisma ORM LibSQL driver adapter:

  ```ts
  import type { PrismaConfig } from "prisma";

  export default {
    experimental: {
      studio: true,
    },
    engine: "js",
    studio: {
      adapter: async (env: Env) => {
        const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
        const { createClient } = await import("@libsql/client");

        const libsql = createClient({
          url: env.DOTENV_PRISMA_STUDIO_LIBSQL_DATABASE_URL,
        });
        return new PrismaLibSQL(libsql);
      },
    },
  } satisfies PrismaConfig;
  ```
</details>

Common patterns [#common-patterns]

Setting up your project [#setting-up-your-project]

To get started with Prisma Config, create a `prisma.config.ts` file in your project root. You can use either of these approaches:

Using `defineConfig`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Using TypeScript types:

```ts
import "dotenv/config";
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig;
```

Using environment variables [#using-environment-variables]

Environment variables from `.env` files need to be loaded explicitly. The `prisma init` command generates a config that includes `import 'dotenv/config'` by default.

Using dotenv (Recommended for Prisma ORM v7) [#using-dotenv-recommended-for-prisma-orm-v7]

1. Install the `dotenv` package:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add dotenv
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add dotenv
    ```
  </CodeBlockTab>
</CodeBlockTabs>

2. Import `dotenv/config` at the top of your `prisma.config.ts` file:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Using Node.js v20+ or tsx with --env-file flag [#using-nodejs-v20-or-tsx-with---env-file-flag]

If using Node.js v20+ or `tsx`, you can pass a `--env-file` flag to automatically load environment variables:

```bash
tsx --env-title=".env" src/index.ts
tsx watch --env-title=".env" --env-title=".local.env" src/index.ts
tsx --env-title=".env" ./prisma/seed.ts
```

Using Bun [#using-bun]

For Bun, `.env` files are automatically loaded without additional configuration. The `import 'dotenv/config'` line that `prisma init` generates is not needed when using Bun and can be safely removed from your `prisma.config.ts` file.

<CalloutContainer type="info">
  <CalloutDescription>
    When running Prisma CLI commands with Bun, use the `--bun` flag (e.g., `bunx --bun prisma init`) to ensure Prisma uses the Bun runtime instead of falling back to Node.js.
  </CalloutDescription>
</CalloutContainer>

Type-safe environment variables [#type-safe-environment-variables]

Use the `env()` helper function to provide type-safe access to environment variables:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
```

Handling optional environment variables [#handling-optional-environment-variables]

The `env()` helper function from `prisma/config` **throws an error** if the specified environment variable is not defined. This is important to understand because:

* Every Prisma CLI command loads the `prisma.config.ts` file
* Only **some** commands actually need the `datasource.url` value (e.g., `prisma db *`, `prisma migrate *`, `prisma generate --sql`)
* Commands like `prisma generate` don't need a database URL, but will still fail if `env()` throws an error when loading the config file

For example, if you run `prisma generate` without `DATABASE_URL` set, and your config uses `env('DATABASE_URL')`, you'll see:

```bash
Error: PrismaConfigEnvError: Missing required environment variable: DATABASE_URL
```

**Solution:** If your environment variable isn't guaranteed to exist (e.g., in CI/CD pipelines where you only run `prisma generate` for type-checking), don't use the `env()` helper. Instead, access the environment variable directly:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!, // Or use: process.env.DATABASE_URL ?? '' to provide a fallback value
  },
});
```

<CalloutContainer type="info">
  <CalloutDescription>
    Use the `env()` helper when you want to **enforce** that an environment variable exists. Use `process.env` directly when the variable may be optional depending on the command being run.
  </CalloutDescription>
</CalloutContainer>

Using multi-file schemas [#using-multi-file-schemas]

If you want to split your Prisma schema into multiple files, you need to specify the path to your Prisma schema folder via the `schema` property:

```ts
import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("prisma", "schema"),
} satisfies PrismaConfig;
```

In that case, your `migrations` directory must be located next to the `.prisma` file that defines the `datasource` block.

For example, assuming `schema.prisma` defines the `datasource`, here's how how need to place the migrations folder:

```
# `migrations` and `schema.prisma` are on the same level
.
├── migrations
├── models
│   ├── posts.prisma
│   └── users.prisma
└── schema.prisma
```

Path resolution [#path-resolution]

Prisma CLI commands such as `prisma validate` or `prisma migrate` use `prisma.config.ts` (or `.config/prisma.ts`) to locate your Prisma schema and other resources.

**Key rules:**

* Paths defined in the config file (e.g., `schema`, `migrations`) are always resolved **relative to the location of the config file**, not where you run the CLI command from.
* The CLI must first **find the config file** itself, which depends on how Prisma is installed and the package manager used.

Behavior with pnpm prisma [#behavior-with-pnpm-prisma]

When Prisma is installed locally and run via `pnpm prisma`, the config file is detected automatically whether you run the command from the project root or a subdirectory.

Example project tree:

```
.
├── node_modules
├── package.json
├── prisma-custom
│   └── schema.prisma
├── prisma.config.ts
└── src
```

Example run from the project root:

```bash
pnpm prisma validate
# → Loaded Prisma config from ./prisma.config.ts
# → Prisma schema loaded from prisma-custom/schema.prisma
```

Example run from a subdirectory:

```bash
cd src
pnpm prisma validate
# → Still finds prisma.config.ts and resolves schema correctly
```

Behavior with npx prisma or bunx --bun prisma [#behavior-with-npx-prisma-or-bunx---bun-prisma]

When running via `npx prisma` or `bunx --bun prisma`, the CLI only detects the config file if the command is run from the **project root** (where `package.json` declares Prisma).

<CalloutContainer type="info">
  <CalloutDescription>
    The `--bun` flag is required when using Bun to ensure Prisma runs with the Bun runtime. Without it, Prisma falls back to Node.js due to the `#!/usr/bin/env node` shebang in the CLI.
  </CalloutDescription>
</CalloutContainer>

Example run from the project root:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma validate
    # → Works as expected
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma validate
    # → Works as expected
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma validate
    # → Works as expected
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma validate
    # → Works as expected
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Run from a subdirectory (fails):

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    cd src
    npx prisma validate
    # → Error: Could not find Prisma Schema...
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    cd src
    pnpm dlx prisma validate
    # → Error: Could not find Prisma Schema...
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    cd src
    yarn dlx prisma validate
    # → Error: Could not find Prisma Schema...
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    cd src
    bun x prisma validate
    # → Error: Could not find Prisma Schema...
    ```
  </CodeBlockTab>
</CodeBlockTabs>

To fix this, you can use the `--config` flag:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npx prisma validate --config ../prisma.config.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm dlx prisma validate --config ../prisma.config.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn dlx prisma validate --config ../prisma.config.ts
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bunx --bun prisma validate --config ../prisma.config.ts
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Global Prisma installations [#global-prisma-installations]

If Prisma is installed globally (`npm i -g prisma`), it may not find your `prisma.config.ts` or `prisma/config` module by default.
To avoid issues:

* Prefer local Prisma installations in your project.
* Or use `prisma/config` locally and pass `--config` to point to your config file.

Monorepos [#monorepos]

* If Prisma is installed in the **workspace root**, `pnpm prisma` will detect the config file from subdirectories.
* If Prisma is installed in a **subpackage** (e.g., `./packages/db`), run commands from that package directory or deeper.

Custom config location [#custom-config-location]

You can specify a custom location for your config file when running Prisma CLI commands:

```bash
prisma validate --config ./path/to/myconfig.ts
```

Loading environment variables [#loading-environment-variables]

To load environment variables, install the `dotenv` package and add `import 'dotenv/config'` at the top of your `prisma.config.ts` file.

To load environment variables in your Prisma application, you can use the `prisma.config.ts` file along with the `env` helper from `prisma/config`. This approach provides better type safety and configuration management.

1. Install the `dotenv` package:

   <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
     <CodeBlockTabsList>
       <CodeBlockTabsTrigger value="npm">
         npm
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="pnpm">
         pnpm
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="yarn">
         yarn
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="bun">
         bun
       </CodeBlockTabsTrigger>
     </CodeBlockTabsList>

     <CodeBlockTab value="npm">
       ```bash
       npm install dotenv
       ```
     </CodeBlockTab>

     <CodeBlockTab value="pnpm">
       ```bash
       pnpm add dotenv
       ```
     </CodeBlockTab>

     <CodeBlockTab value="yarn">
       ```bash
       yarn add dotenv
       ```
     </CodeBlockTab>

     <CodeBlockTab value="bun">
       ```bash
       bun add dotenv
       ```
     </CodeBlockTab>
   </CodeBlockTabs>

2. Create a `.env` file in your project root (if it doesn't exist) and add your database connection string:

   ```bash
   DATABASE_URL="your_database_connection_string_here"
   ```

3. Ensure your `prisma.config.ts` file imports `dotenv/config` at the top:

   ```ts title="prisma.config.ts"
   import "dotenv/config"; // [!code ++]
   import { defineConfig, env } from "prisma/config";

   export default defineConfig({
     schema: "prisma/schema.prisma",
     migrations: {
       path: "prisma/migrations",
       seed: "tsx prisma/seed.ts",
     },
     datasource: {
       url: env("DATABASE_URL"),
     },
   });
   ```
# Connection URLs (/docs/orm/reference/connection-urls)



Prisma ORM needs a connection URL to be able to connect to your database, e.g. when sending queries with [Prisma Client](/orm/prisma-client/setup-and-configuration/introduction) or when changing the database schema with [Prisma Migrate](/orm/prisma-migrate).

The connection URL is provided via the `url` field of a `datasource` block in your Prisma config (or Prisma schema if on version 6). It usually consists of the following components (except for SQLite and [Prisma Postgres](/postgres)):

* **User**: The name of your database user
* **Password**: The password for your database user
* **Host**: The IP or domain name of the machine where your database server is running
* **Port**: The port on which your database server is running
* **Database name**: The name of the database you want to use

Make sure you have this information at hand when getting started with Prisma ORM. If you don't have a database server running yet, you can either use a local SQLite database file (see the [Quickstart](/prisma-orm/quickstart/sqlite)) or [setup a free PostgreSQL database with Prisma Postgres](/postgres).

Format [#format]

The format of the connection URL depends on the *database connector* you're using. Prisma ORM generally supports the standard formats for each database. You can find out more about the connection URL of your database on the dedicated docs page:

* [PostgreSQL](/orm/core-concepts/supported-databases/postgresql)
* [MySQL](/orm/core-concepts/supported-databases/mysql)
* [SQLite](/orm/core-concepts/supported-databases/sqlite)
* [MongoDB](/orm/core-concepts/supported-databases/mongodb)
* [Microsoft SQL Server](/orm/core-concepts/supported-databases/sql-server)
* [CockroachDB](/orm/core-concepts/supported-databases/postgresql#cockroachdb)

Special characters [#special-characters]

For MySQL, PostgreSQL and CockroachDB you must [percentage-encode special characters](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) in any part of your connection URL - including passwords. For example, `p@$$w0rd` becomes `p%40%24%24w0rd`.

For Microsoft SQL Server, you must [escape special characters](/orm/core-concepts/supported-databases/sql-server#connection-details) in any part of your connection string.

Examples [#examples]

Here are examples for the connection URLs of the databases Prisma ORM supports:

Prisma Postgres [#prisma-postgres]

[Prisma Postgres](/postgres) is a managed PostgreSQL service running on unikernels. There are several ways to connect to Prisma Postgres:

* via direct TCP connections (lets you connect via any ORM or database tool)
* via pooled TCP connections (recommended for serverless and high-concurrency workloads)
* via [Prisma Accelerate](/accelerate) (only supported with Prisma ORM)
* locally

The connection string formats of these are covered below.

Direct TCP [#direct-tcp]

When you connect to Prisma Postgres via direct TCP, your connection string looks as follows:

```bash
DATABASE_URL="postgres://USER:PASSWORD@db.prisma.io:5432/?sslmode=require"
```

The `USER` and `PASSWORD` values are provided when you generate credentials for your Prisma Postgres instance in the [Prisma Console](https://console.prisma.io). Here is an example with sample values:

```bash
DATABASE_URL="postgres://2f9881cc7eef46f094ac913df34c1fb441502fe66cbe28cc48998d4e6b20336b:sk_QZ3u8fMPFfBzOID4ol-mV@db.prisma.io:5432/?sslmode=require"
```

Pooled TCP [#pooled-tcp]

When you connect to Prisma Postgres via pooled TCP, your connection string looks as follows:

```bash
DATABASE_URL="postgres://USER:PASSWORD@pooled.db.prisma.io:5432/?sslmode=require"
```

Use a pooled TCP connection string for serverless, bursty, or high-concurrency workloads. Learn more in [Connection pooling](/postgres/database/connection-pooling).

Via Prisma Accelerate (HTTP) [#via-prisma-accelerate-http]

When connecting via Prisma Accelerate, the connection string doesn't require a user/password like a conventional connection string does. Instead, authentication works via an API key:

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=API_KEY"
  },
});
```

In this snippet, `API_KEY` is a placeholder for the API key you are receiving when setting up a new Prismas Postgres instance via the [Prisma Console](https://console.prisma.io). Here is an example for what a real connection URL to Prisma Postgres may look like:

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMGNkZTFlMjQtNzhiYi00NTY4LTkyM2EtNWUwOTEzZWUyNjU1IiwidGVuYW50X2lkIjoiNzEyZWRlZTc1Y2U2MDk2ZjI4NDg3YjE4NWMyYzA2OTNhNGMxNzJkMjhhOWFlNGUwZTYxNWE4NWIxZWY1YjBkMCIsImludGVybmFsX3NlY3JldCI6IjA4MzQ2Y2RlLWI5ZjktNDQ4Yy04NThmLTMxNjg4ODEzNmEzZCJ9.N1Za6q6NfInzHvRkud6Ojt_-RFg18a0601vdYWGKOrk"
  },
});
```

Local Prisma Postgres [#local-prisma-postgres]

The connection string for connecting to a [local Prisma Postgres](/postgres/database/local-development) instance mirrors the structure of a remote instance via Accelerate:

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=API_KEY"
  },
});
```

However, in this case the `API_KEY` doesn't provide authentication details. Instead, it encodes information about the local Prisma Postgres instance. You can obtain a local connection string via the [`prisma dev`](/orm/reference/prisma-cli-reference#dev) command.

PostgreSQL [#postgresql]

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "postgresql://janedoe:mypassword@localhost:5432/mydb?schema=sample"
  },
});
```

MySQL [#mysql]

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "mysql://janedoe:mypassword@localhost:3306/mydb"
  },
});
```

Microsoft SQL Server [#microsoft-sql-server]

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "sqlserver://localhost:1433;initial catalog=sample;user=sa;password=mypassword;"
  },
});
```

SQLite [#sqlite]

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "file:./dev.db"
  },
});
```

CockroachDB [#cockroachdb]

```ts title="prisma.config.ts"
export default defineConfig({
  datasource: {
    url: "postgresql://janedoe:mypassword@localhost:26257/mydb?schema=public"
  },
});
```

MongoDB [#mongodb]

*Support for MongoDB is limited to [Prisma 6](/v6/orm/reference/connection-urls#mongodb) as of now. We're working on support for MongoDB in Prisma v7*

.env [#env]

You can also provide the connection URL as an environment variable:

```prisma title="schema.prisma"
datasource db {
  provider = "postgresql"
}
```

You can then either set the environment variable in your terminal or by providing a [dotenv](https://github.com/motdotla/dotenv) file named `.env`. This will automatically be picked up by the Prisma CLI.

Prisma ORM reads the connection URL from the dotenv file in the following situations:

* When it updates the schema during build time
* When it connects to the database during run time

```
DATABASE_URL=postgresql://janedoe:mypassword@localhost:5432/mydb
```
# Environment Variables (/docs/orm/reference/environment-variables-reference)



This document describes different environment variables and their use cases.

Prisma Client [#prisma-client]

DEBUG [#debug]

`DEBUG` is used to enable debugging output in Prisma Client.

Example setting Prisma Client level debugging output:

```bash
# enable only `prisma:client`-level debugging output
export DEBUG="prisma:client"
```

See [Debugging](/orm/prisma-client/debugging-and-troubleshooting/debugging) for more information.

NO_COLOR [#no_color]

`NO_COLOR` if [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) will activate the `colorless` setting for error formatting and strip colors from error messages.

See [Formatting via environment variables](/orm/prisma-client/setup-and-configuration/error-formatting#formatting-via-environment-variables) for more information.

Prisma Studio [#prisma-studio]

BROWSER [#browser]

`BROWSER` is for Prisma Studio to force which browser it should be open in, if not set it will open in the default browser.

```bash
BROWSER=firefox prisma studio --port 5555
```

Alternatively you can set this when starting Studio from the CLI as well:

```bash
prisma studio --browser firefox
```

See [Studio](/orm/reference/prisma-cli-reference#studio) documentation for more information.

Prisma CLI [#prisma-cli]

PRISMA_HIDE_PREVIEW_FLAG_WARNINGS [#prisma_hide_preview_flag_warnings]

`PRISMA_HIDE_PREVIEW_FLAG_WARNINGS` hides the warning message that states that a preview feature flag can be removed. It is a truthy value.

PRISMA_HIDE_UPDATE_MESSAGE [#prisma_hide_update_message]

`PRISMA_HIDE_UPDATE_MESSAGE` is used to hide the update notification message that is shown when a newer Prisma CLI version is available. It's a truthy value.

PRISMA_DISABLE_WARNINGS [#prisma_disable_warnings]

Disables all CLI warnings generated by `logger.warn`.

PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK [#prisma_schema_disable_advisory_lock]

Disables the [advisory locking](/orm/prisma-migrate/workflows/development-and-production#advisory-locking) used by Prisma Migrate. Useful for certain database configurations like Percona-XtraDB-Cluster or MariaDB Galera Cluster.

Proxy environment variables [#proxy-environment-variables]

The Prisma CLI supports custom HTTP(S) proxies to download the Prisma engines. These can be helpful to use when working behind a corporate firewall. See [Using a HTTP proxy for the CLI](/orm/reference/prisma-cli-reference#using-a-http-proxy-for-the-cli) for more information.

NO_PROXY [#no_proxy]

`NO_PROXY` is a comma-separated list of hostnames or IP addresses that do not require a proxy.

```bash
NO_PROXY=myhostname.com,10.11.12.0/16,172.30.0.0/16
```

HTTP_PROXY [#http_proxy]

`HTTP_PROXY` is set with the hostname or IP address of a proxy server.

```bash
HTTP_PROXY=http://proxy.example.com
```

HTTPS_PROXY [#https_proxy]

`HTTPS_PROXY` is set with the hostname or IP address of a proxy server.

```bash
HTTPS_PROXY=https://proxy.example.com
```
# Prisma Error Reference (/docs/orm/reference/errors)



This section provides information about common errors you might encounter when using Prisma ORM and how to resolve them.

Error Categories [#error-categories]

Prisma Client Errors [#prisma-client-errors]

* [**Connection Pool Issues**](/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) - Troubleshoot connection pooling problems

Prisma Migrate Errors [#prisma-migrate-errors]

* [**Migration Overview**](/orm/prisma-migrate/understanding-prisma-migrate/mental-model) - Understanding migration concepts
* [**Shadow Database Issues**](/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) - Troubleshoot shadow database problems
* [**Baselining Issues**](/orm/prisma-migrate/workflows/baselining) - Issues with baseline migrations

MongoDB Errors [#mongodb-errors]

* [**Replica Set Configuration**](/orm/core-concepts/supported-databases/mongodb) - MongoDB replica set requirements

Full Error Reference [#full-error-reference]

For a complete list of error codes and their meanings, see the [Error Reference](/orm/reference/error-reference).
# Logging (/docs/orm/prisma-client/observability-and-logging/logging)



Use the `PrismaClient` [`log`](/orm/reference/prisma-client-reference#log) parameter to configure [log levels](/orm/reference/prisma-client-reference#log-levels) , including warnings, errors, and information about the queries sent to the database.

Prisma Client supports two types of logging:

* Logging to [stdout](https://en.wikipedia.org/wiki/Standard_streams) (default)
* Event-based logging (use [`$on()`](/orm/reference/prisma-client-reference#on) method to [subscribe to events](#event-based-logging))

<CalloutContainer type="info">
  <CalloutDescription>
    You can also use the `DEBUG` environment variable to enable debugging output in Prisma Client. See [Debugging](/orm/prisma-client/debugging-and-troubleshooting/debugging) for more information.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutDescription>
    If you want a detailed insight into your Prisma Client's performance at the level of individual operations, see [Tracing](/orm/prisma-client/observability-and-logging/opentelemetry-tracing).
  </CalloutDescription>
</CalloutContainer>

Log to stdout [#log-to-stdout]

The simplest way to print *all* log levels to stdout is to pass in an array `LogLevel` objects:

```ts
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

This is the short form of passing in an array of `LogDefinition` objects where the value of `emit` is always `stdout`:

```ts
const prisma = new PrismaClient({
  log: [
    {
      emit: "stdout",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});
```

Event-based logging [#event-based-logging]

To use event-based logging:

1. Set `emit` to `event` for a specific log level, such as query
2. Use the `$on()` method to subscribe to the event

The following example subscribes to all `query` events and write the `duration` and `query` to console:

<CodeBlockTabs defaultValue="Relational databases">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Relational databases">
      Relational databases
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Relational databases">
    ```ts highlight=4,5,22-26;normal 
    const prisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "stdout",
          level: "error",
        },
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "warn",
        },
      ],
    });

    prisma.$on("query", (e) => {
      console.log("Query: " + e.query);
      console.log("Params: " + e.params);
      console.log("Duration: " + e.duration + "ms");
    });
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```sql
Query: SELECT "public"."User"."id", "public"."User"."email", "public"."User"."name" FROM "public"."User" WHERE 1=1 OFFSET $1
Params: [0]
Duration: 3ms
Query: SELECT "public"."Post"."id", "public"."Post"."title", "public"."Post"."authorId" FROM "public"."Post" WHERE "public"."Post"."authorId" IN ($1,$2,$3,$4) OFFSET $5
Params: [2, 7, 18, 29]
Duration: 2ms
```

<CodeBlockTabs defaultValue="MongoDB">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="MongoDB">
      MongoDB
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="MongoDB">
    ```ts highlight=4,5,22-25;normal 
    const prisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "stdout",
          level: "error",
        },
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "warn",
        },
      ],
    });

    prisma.$on("query", (e) => {
      console.log("Query: " + e.query);
    });
    ```
  </CodeBlockTab>
</CodeBlockTabs>

```bash
Query: db.User.aggregate([ { $project: { _id: 1, email: 1, name: 1, }, }, ])
Query: db.Post.aggregate([ { $match: { userId: { $in: [ "622f0bbbdf635a42016ee325", ], }, }, }, { $project: { _id: 1, slug: 1, title: 1, body: 1, userId: 1, }, }, ])
```

The exact [event (`e`) type and the properties available](/orm/reference/prisma-client-reference#event-types) depends on the log level.
# OpenTelemetry tracing (/docs/orm/prisma-client/observability-and-logging/opentelemetry-tracing)



Tracing provides a detailed log of the activity that Prisma Client carries out, at an operation level, including the time taken to execute each query. It helps you analyze your application's performance and identify bottlenecks. Tracing is fully compliant with [OpenTelemetry](https://opentelemetry.io/), so you can use it as part of your end-to-end application tracing system.

<CalloutContainer type="info">
  <CalloutDescription>
    Tracing gives you a highly detailed, operation-level insight into your Prisma ORM project.
  </CalloutDescription>
</CalloutContainer>

<CalloutContainer type="info">
  <CalloutTitle>
    Correlate database queries with traces
  </CalloutTitle>

  <CalloutDescription>
    You can add the `traceparent` header to your SQL queries as comments using the [`@prisma/sqlcommenter-trace-context`](/orm/prisma-client/observability-and-logging/sql-comments#trace-context) plugin. This enables correlation between distributed traces and database queries in your monitoring tools.
  </CalloutDescription>
</CalloutContainer>

About tracing [#about-tracing]

When you enable tracing, Prisma Client outputs the following:

* One trace for each operation (e.g. findMany) that Prisma Client makes.
* In each trace, one or more [spans](https://opentelemetry.io/docs/specs/otel/trace/api/#span). Each span represents the length of time that one stage of the operation takes, such as serialization, or a database query. Spans are represented in a tree structure, where child spans indicate that execution is happening within a larger parent span.

The number and type of spans in a trace depends on the type of operation the trace covers, but an example is as follows:

<img alt="Example Prisma Client trace structure showing parent and child spans for a database operation (serialization, query engine, database query)." src="/img/orm/prisma-client/observability-and-logging/trace-diagram.png" width="1736" height="464" />

You can [send tracing output to the console](#send-tracing-output-to-the-console), or analyze it in any OpenTelemetry-compatible tracing system, such as [Jaeger](https://www.jaegertracing.io/), [Honeycomb](https://www.honeycomb.io/distributed-tracing) and [Datadog](https://www.datadoghq.com/). On this page, we give an example of how to send tracing output to Jaeger, which you can [run locally](#visualize-traces-with-jaeger).

Trace output [#trace-output]

For each trace, Prisma Client outputs a series of spans. The number and type of these spans depends on the Prisma Client operation. A typical Prisma trace has the following spans:

* `prisma:client:operation`: Represents the entire Prisma Client operation, from Prisma Client to the database and back. It contains details such as the model and method called by Prisma Client. Depending on the Prisma operation, it contains one or more of the following spans:
  * `prisma:client:connect`: Represents how long it takes for Prisma Client to connect to the database.
  * `prisma:client:serialize`: Represents how long it takes to validate and transform a Prisma Client operation into a query for the query engine.
  * `prisma:engine:query`: Represents how long a query takes in the query engine.
    * `prisma:engine:connection`: Represents how long it takes for Prisma Client to get a database connection.
    * `prisma:engine:db_query`: Represents the database query that was executed against the database. It includes the query in the tags, and how long the query took to run.
    * `prisma:engine:serialize`: Represents how long it takes to transform a raw response from the database into a typed result.
    * `prisma:engine:response_json_serialization`: Represents how long it takes to serialize the database query result into a JSON response to the Prisma Client.

For example, given the following Prisma Client code:

```ts
prisma.user.findMany({
  where: {
    email: email,
  },
  include: {
    posts: true,
  },
});
```

The trace is structured as follows:

* `prisma:client:operation`
  * `prisma:client:serialize`
  * `prisma:engine:query`
    * `prisma:engine:connection`
    * `prisma:engine:db_query`: details of the first SQL query or command...
    * `prisma:engine:db_query`: ...details of the next SQL query or command...
    * `prisma:engine:serialize`
    * `prisma:engine:response_json_serialization`

Considerations and prerequisites [#considerations-and-prerequisites]

If your application sends a large number of spans to a [collector](https://opentelemetry.io/docs/collector/), this can have a significant performance impact. For information on how to minimize this impact, see [Reducing performance impact](#reduce-performance-impact).

To use tracing, you must do the following:

1. [Install the appropriate dependencies](#step-1-install-up-to-date-prisma-orm-dependencies).
2. [Install OpenTelemetry packages](#step-2-install-opentelemetry-packages).
3. [Register tracing in your application](#step-3-register-tracing-in-your-application).

Get started with tracing in Prisma ORM [#get-started-with-tracing-in-prisma-orm]

This section explains how to install and register tracing in your application.

Step 1. Install Prisma ORM dependencies [#step-1-install-prisma-orm-dependencies]

Install the `prisma`, `@prisma/client`, and `@prisma/instrumentation` npm packages. You will also need to install the `@opentelemetry/api` package as it's a peer dependency.

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install prisma@latest --save-dev
    npm install @prisma/client@latest --save
    npm install @prisma/instrumentation@latest --save
    npm install @opentelemetry/api@latest --save
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add prisma@latest --save-dev
    pnpm add @prisma/client@latest
    pnpm add @prisma/instrumentation@latest
    pnpm add @opentelemetry/api@latest
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add prisma@latest --dev
    yarn add @prisma/client@latest
    yarn add @prisma/instrumentation@latest
    yarn add @opentelemetry/api@latest
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add prisma@latest --dev
    bun add @prisma/client@latest
    bun add @prisma/instrumentation@latest
    bun add @opentelemetry/api@latest
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<details>
  <summary>
    Tracing on previous versions of Prisma ORM
  </summary>

  Tracing was added in version `4.2.0` of Prisma ORM as a Preview feature. For versions of Prisma ORM between `4.2.0` and `6.1.0`, you need to enable the `tracing` Preview feature in your Prisma schema file.

  ```prisma
  generator client {
    provider        = "prisma-client"
    output          = "./generated"
    previewFeatures = ["tracing"]
  }
  ```
</details>

Step 2: Install OpenTelemetry packages [#step-2-install-opentelemetry-packages]

Now install the appropriate OpenTelemetry packages, as follows:

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install @opentelemetry/semantic-conventions \
      @opentelemetry/exporter-trace-otlp-http \
      @opentelemetry/sdk-trace-base \
      @opentelemetry/sdk-trace-node \
      @opentelemetry/resources
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add @opentelemetry/semantic-conventions \
      @opentelemetry/exporter-trace-otlp-http \
      @opentelemetry/sdk-trace-base \
      @opentelemetry/sdk-trace-node \
      @opentelemetry/resources
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add @opentelemetry/semantic-conventions \
      @opentelemetry/exporter-trace-otlp-http \
      @opentelemetry/sdk-trace-base \
      @opentelemetry/sdk-trace-node \
      @opentelemetry/resources
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add @opentelemetry/semantic-conventions \
      @opentelemetry/exporter-trace-otlp-http \
      @opentelemetry/sdk-trace-base \
      @opentelemetry/sdk-trace-node \
      @opentelemetry/resources
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Step 3: Register tracing in your application [#step-3-register-tracing-in-your-application]

The following code provides two examples of configuring OpenTelemetry tracing in Prisma:

1. Using `@opentelemetry/sdk-trace-node` (existing example), which gives fine-grained control over tracing setup.
2. Using `@opentelemetry/sdk-node`, which offers a simpler configuration and aligns with OpenTelemetry's JavaScript getting started guide.

***

Option 1: Using @opentelemetry/sdk-trace-node [#option-1-using-opentelemetrysdk-trace-node]

This setup gives you fine-grained control over instrumentation and tracing. You need to customize this configuration for your specific application. This approach is concise and easier for users who need a quick setup for sending traces to OTLP-compatible backends, such as Honeycomb, Jaeger, or Datadog.

```ts
// Imports
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { PrismaInstrumentation, registerInstrumentations } from "@prisma/instrumentation";
import { resourceFromAttributes } from "@opentelemetry/resources";

// Configure the trace provider
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "example application", // Replace with your service name
    [ATTR_SERVICE_VERSION]: "0.0.1", // Replace with your service version
  }),
  spanProcessors: [
    // Configure how spans are processed and exported. In this case, we're sending spans
    // as we receive them to an OTLP-compatible collector (e.g., Jaeger).
    new SimpleSpanProcessor(new OTLPTraceExporter()),
  ],
});

// Register your auto-instrumentors
registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [new PrismaInstrumentation()],
});

// Register the provider globally
provider.register();
```

This approach provides maximum flexibility but may involve additional configuration steps.

Option 2: Using @opentelemetry/sdk-node [#option-2-using-opentelemetrysdk-node]

For many users, especially beginners, the `NodeSDK` class simplifies OpenTelemetry setup by bundling common defaults into a single, unified configuration.

```ts
// Imports
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";

// Configure the OTLP trace exporter
const traceExporter = new OTLPTraceExporter({
  url: "https://api.honeycomb.io/v1/traces", // Replace with your collector's endpoint
  headers: {
    "x-honeycomb-team": "HONEYCOMB_API_KEY", // Replace with your Honeycomb API key or collector auth header
  },
});

// Initialize the NodeSDK
const sdk = new NodeSDK({
  serviceName: "my-service-name", // Replace with your service name
  traceExporter,
  instrumentations: [new PrismaInstrumentation()],
});

// Start the SDK
sdk.start();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  try {
    await sdk.shutdown();
    console.log("Tracing shut down successfully");
  } catch (err) {
    console.error("Error shutting down tracing", err);
  } finally {
    process.exit(0);
  }
});
```

Choose the `NodeSDK` approach if:

* You are starting with OpenTelemetry and want a simplified setup.
* You need to quickly integrate tracing with minimal boilerplate.
* You are using an OTLP-compatible tracing backend like Honeycomb, Jaeger, or Datadog.

Choose the `NodeTracerProvider` approach if:

* You need detailed control over how spans are created, processed, and exported.
* You are using custom span processors or exporters.
* Your application requires specific instrumentation or sampling strategies.

OpenTelemetry is highly configurable. You can customize the resource attributes, what components gets instrumented, how spans are processed, and where spans are sent.

You can find a complete example that includes metrics in [this sample application](https://github.com/garrensmith/prisma-metrics-sample).

Tracing how-tos [#tracing-how-tos]

Visualize traces with Jaeger [#visualize-traces-with-jaeger]

[Jaeger](https://www.jaegertracing.io/) is a free and open source OpenTelemetry collector and dashboard that you can use to visualize your traces.

The following screenshot shows an example trace visualization:

<img alt="Jaeger UI" src="/img/orm/prisma-client/observability-and-logging/jaeger.png" width="2096" height="1010" />

To run Jaeger locally, use the following [Docker](https://www.docker.com/) command:

```console
docker run --rm --name jaeger -d -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest
```

You'll now find the tracing dashboard available at `http://localhost:16686/`. When you use your application with tracing enabled, you'll start to see traces in this dashboard.

Send tracing output to the console [#send-tracing-output-to-the-console]

The following example sends output tracing to the console with `ConsoleSpanExporter` from `@opentelemetry/sdk-trace-base`.

```ts
// Imports
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import * as api from "@opentelemetry/api";
import { PrismaInstrumentation, registerInstrumentations } from "@prisma/instrumentation";
import { resourceFromAttributes } from "@opentelemetry/resources";

// Export the tracing
export function otelSetup() {
  const contextManager = new AsyncHooksContextManager().enable();

  api.context.setGlobalContextManager(contextManager);

  //Configure the console exporter
  const consoleExporter = new ConsoleSpanExporter();

  // Configure the trace provider
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "example application", // Replace with your service name
      [ATTR_SERVICE_VERSION]: "0.0.1", // Replace with your service version
    }),
    spanProcessors: [
      // Configure how spans are processed and exported. In this case, we're sending spans
      // as we receive them to the console
      new SimpleSpanProcessor(consoleExporter),
    ],
  });

  // Register your auto-instrumentors
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new PrismaInstrumentation()],
  });

  // Register the provider
  provider.register();
}
```

Trace interactive transactions [#trace-interactive-transactions]

When you perform an interactive transaction, you'll see the following span in addition to the [standard spans](#trace-output):

* `prisma:client:transaction`: A [root span](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) that wraps the `prisma` span.

As an example, take the following Prisma schema:

```prisma title="schema.prisma" showLineNumbers
generator client {
  provider        = "prisma-client"
  output          = "./generated"
}

datasource db {
  provider = "postgresql"
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

model Audit {
  id     Int    @id
  table  String
  action String
}
```

Given the following interactive transaction:

```ts
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email: email,
    },
  });

  await tx.audit.create({
    data: {
      table: "user",
      action: "create",
      id: user.id,
    },
  });

  return user;
});
```

The trace is structured as follows:

* `prisma:client:transaction`
* `prisma:client:connect`
* `prisma:engine:itx_runner`
  * `prisma:engine:connection`
  * `prisma:engine:db_query`
  * `prisma:engine:itx_query_builder`
    * `prisma:engine:db_query`
    * `prisma:engine:db_query`
    * `prisma:engine:serialize`
  * `prisma:engine:itx_query_builder`
    * `prisma:engine:db_query`
    * `prisma:engine:db_query`
    * `prisma:engine:serialize`
* `prisma:client:operation`
  * `prisma:client:serialize`
* `prisma:client:operation`
  * `prisma:client:serialize`

Add more instrumentation [#add-more-instrumentation]

A nice benefit of OpenTelemetry is the ability to add more instrumentation with only minimal changes to your application code.

For example, to add HTTP and [ExpressJS](https://expressjs.com/) tracing, add the following instrumentations to your OpenTelemetry configuration. These instrumentations add spans for the full request-response lifecycle. These spans show you how long your HTTP requests take.

```js
// Imports
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

// Register your auto-instrumentors
registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PrismaInstrumentation(),
  ],
});
```

For a full list of available instrumentation, take a look at the [OpenTelemetry Registry](https://opentelemetry.io/ecosystem/registry/?language=js\&component=instrumentation).

Customize resource attributes [#customize-resource-attributes]

You can adjust how your application's traces are grouped by changing the resource attributes to be more specific to your application:

```js
const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "weblog",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
});
```

There is an ongoing effort to standardize common resource attributes. Whenever possible, it's a good idea to follow the [standard attribute names](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/trace.md).

Reduce performance impact [#reduce-performance-impact]

If your application sends a large number of spans to a collector, this can have a significant performance impact. You can use the following approaches to reduce this impact:

* [Use the BatchSpanProcessor](#send-traces-in-batches-using-the-batchspanprocessor)
* [Send fewer spans to the collector](#send-fewer-spans-to-the-collector-with-sampling)

Send traces in batches using the BatchSpanProcessor [#send-traces-in-batches-using-the-batchspanprocessor]

In a production environment, you can use OpenTelemetry's `BatchSpanProcessor` to send the spans to a collector in batches rather than one at a time. However, during development and testing, you might not want to send spans in batches. In this situation, you might prefer to use the `SimpleSpanProcessor`.

You can configure your tracing configuration to use the appropriate span processor, depending on the environment, as follows:

```ts
import { SimpleSpanProcessor, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

const spanProcessors = [];
if (process.env.NODE_ENV === "production") {
  spanProcessors.push(new BatchSpanProcessor(otlpTraceExporter));
} else {
  spanProcessors.push(new SimpleSpanProcessor(otlpTraceExporter));
}

const provider = new NodeTracerProvider({
  spanProcessors,
  // ...other configurations
});
```

Send fewer spans to the collector with sampling [#send-fewer-spans-to-the-collector-with-sampling]

Another way to reduce the performance impact is to [use probability sampling](https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/) to send fewer spans to the collector. This reduces the collection cost of tracing but still gives a good representation of what is happening in your application.

An example implementation looks like this:

```ts highlight=3,7;add
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { TraceIdRatioBasedSampler } from "@opentelemetry/core";
import { resourceFromAttributes } from "@opentelemetry/resources";

const provider = new NodeTracerProvider({
  sampler: new TraceIdRatioBasedSampler(0.1), // [!code ++]
  resource: resourceFromAttributes({
    // we can define some metadata about the trace resource
    [ATTR_SERVICE_NAME]: "test-tracing-service",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
});
```

Troubleshoot tracing [#troubleshoot-tracing]

My traces aren't showing up [#my-traces-arent-showing-up]

The order in which you set up tracing matters. In your application, ensure that you register tracing and instrumentation before you import any instrumented dependencies. For example:

```ts
import { registerTracing } from "./tracing";

registerTracing({
  name: "tracing-example",
  version: "0.0.1",
});

// You must import any dependencies after you register tracing.
import { PrismaClient } from "../prisma/generated/client";
import async from "express-async-handler";
import express from "express";
```
# Raw queries (/docs/orm/prisma-client/using-raw-sql/raw-queries)



<CalloutContainer type="warning">
  <CalloutDescription>
    We recommend using [TypedSQL](/orm/prisma-client/using-raw-sql) for type-safe SQL queries instead of the raw queries described below.
  </CalloutDescription>
</CalloutContainer>

Prisma Client supports sending raw queries to your database. You may wish to use raw queries if:

* you want to run a heavily optimized query
* you require a feature that Prisma Client does not yet support (please [consider raising an issue](https://github.com/prisma/prisma/issues/new/choose))

Raw queries are available for all relational databases Prisma ORM supports, as well as MongoDB. For more details, see the relevant sections:

* [Raw queries with relational databases](#raw-queries-with-relational-databases)
* [Raw queries with MongoDB](#raw-queries-with-mongodb)

Raw queries with relational databases [#raw-queries-with-relational-databases]

For relational databases, Prisma Client exposes four methods that allow you to send raw queries. You can use:

* `$queryRaw` to return actual records (for example, using `SELECT`).
* `$executeRaw` to return a count of affected rows (for example, after an `UPDATE` or `DELETE`).
* `$queryRawUnsafe` to return actual records (for example, using `SELECT`) using a raw string.
* `$executeRawUnsafe` to return a count of affected rows (for example, after an `UPDATE` or `DELETE`) using a raw string.

The methods with "Unsafe" in the name are a lot more flexible but are at **significant risk of making your code vulnerable to SQL injection**.

The other two methods are safe to use with a simple template tag, no string building, and no concatenation. **However**, caution is required for more complex use cases as it is still possible to introduce SQL injection if these methods are used in certain ways. For more details, see the [SQL injection prevention](#sql-injection-prevention) section below.

> **Note**: All methods in the above list can only run **one** query at a time. You cannot append a second query - for example, calling any of them with `select 1; select 2;` will not work.

$queryRaw [#queryraw]

`$queryRaw` returns actual database records. For example, the following `SELECT` query returns all fields for each record in the `User` table:

```ts no-lines
const result = await prisma.$queryRaw`SELECT * FROM User`;
```

The method is implemented as a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates), which allows you to pass a template literal where you can easily insert your [variables](#using-variables). In turn, Prisma Client creates prepared statements that are safe from SQL injections:

```ts no-lines
const email = "emelie@prisma.io";
const result = await prisma.$queryRaw`SELECT * FROM User WHERE email = ${email}`;
```

You can also use the [`Prisma.sql`](#tagged-template-helpers) helper, in fact, the `$queryRaw` method will **only accept** a template string or the `Prisma.sql` helper:

```ts no-lines
const email = "emelie@prisma.io";
const result = await prisma.$queryRaw(Prisma.sql`SELECT * FROM User WHERE email = ${email}`);
```

<CalloutContainer type="warning">
  <CalloutDescription>
    If you use string building to incorporate untrusted input into queries passed to this method, then you open up the possibility for SQL injection attacks. SQL injection attacks can expose your data to modification or deletion. The preferred mechanism would be to include the text of the query at the point that you run this method. For more information on this risk and also examples of how to prevent it, see the [SQL injection prevention](#sql-injection-prevention) section below.
  </CalloutDescription>
</CalloutContainer>

Considerations [#considerations]

Be aware that:

* Template variables cannot be used inside SQL string literals. For example, the following query would **not** work:

  ```ts no-lines
  const name = "Bob";
  await prisma.$queryRaw`SELECT 'My name is ${name}';`;
  ```

  Instead, you can either pass the whole string as a variable, or use string concatenation:

  ```ts no-lines
  const name = "My name is Bob";
  await prisma.$queryRaw`SELECT ${name};`;
  ```

  ```ts no-lines
  const name = "Bob";
  await prisma.$queryRaw`SELECT 'My name is ' || ${name};`;
  ```

* Template variables can only be used for data values (such as `email` in the example above). Variables cannot be used for identifiers such as column names, table names or database names, or for SQL keywords. For example, the following two queries would **not** work:

  ```ts no-lines
  const myTable = "user";
  await prisma.$queryRaw`SELECT * FROM ${myTable};`;
  ```

  ```ts no-lines
  const ordering = "desc";
  await prisma.$queryRaw`SELECT * FROM Table ORDER BY ${ordering};`;
  ```

* Prisma maps any database values returned by `$queryRaw` and `$queryRawUnsafe` to their corresponding JavaScript types. [Learn more](#raw-query-type-mapping).

* `$queryRaw` does not support dynamic table names in PostgreSQL databases. [Learn more](#dynamic-table-names-in-postgresql)

Return type [#return-type]

`$queryRaw` returns an array. Each object corresponds to a database record:

```json5
[
  { id: 1, email: "emelie@prisma.io", name: "Emelie" },
  { id: 2, email: "yin@prisma.io", name: "Yin" },
]
```

You can also [type the results of `$queryRaw`](#typing-queryraw-results).

Signature [#signature]

```ts no-lines
$queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<T>;
```

Typing $queryRaw results [#typing-queryraw-results]

`PrismaPromise<T>` uses a [generic type parameter `T`](https://www.typescriptlang.org/docs/handbook/generics.html). You can determine the type of `T` when you invoke the `$queryRaw` method. In the following example, `$queryRaw` returns `User[]`:

```ts
// import the generated `User` type from the `@prisma/client` module
import { User } from "@prisma/client";

const result = await prisma.$queryRaw<User[]>`SELECT * FROM User`;
// result is of type: `User[]`
```

> **Note**: If you do not provide a type, `$queryRaw` defaults to `unknown`.

If you are selecting **specific fields** of the model or want to include relations, refer to the documentation about [leveraging Prisma Client's generated types](/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types#problem-using-variations-of-the-generated-model-type) if you want to make sure that the results are properly typed.

Type caveats when using raw SQL [#type-caveats-when-using-raw-sql]

When you type the results of `$queryRaw`, the raw data might not always match the suggested TypeScript type. For example, the following Prisma model includes a `Boolean` field named `published`:

```prisma highlight=3;normal
model Post {
  id        Int     @id @default(autoincrement())
  published Boolean @default(false) // [!code highlight]
  title     String
  content   String?
}
```

The following query returns all posts. It then prints out the value of the `published` field for each `Post`:

```ts
const result = await prisma.$queryRaw<Post[]>`SELECT * FROM Post`;

result.forEach((x) => {
  console.log(x.published);
});
```

For regular CRUD queries, the Prisma Client query engine standardizes the return type for all databases. **Using the raw queries does not**. If the database provider is MySQL, the returned values are `1` or `0`. However, if the database provider is PostgreSQL, the values are `true` or `false`.

> **Note**: Prisma sends JavaScript integers to PostgreSQL as `INT8`. This might conflict with your user-defined functions that accept only `INT4` as input. If you use `$queryRaw` in conjunction with a PostgreSQL database, update the input types to `INT8`, or cast your query parameters to `INT4`.

Dynamic table names in PostgreSQL [#dynamic-table-names-in-postgresql]

[It is not possible to interpolate table names](#considerations). This means that you cannot use dynamic table names with `$queryRaw`. Instead, you must use [`$queryRawUnsafe`](#queryrawunsafe), as follows:

```ts
let userTable = "User";
let result = await prisma.$queryRawUnsafe(`SELECT * FROM ${userTable}`);
```

Note that if you use `$queryRawUnsafe` in conjunction with user inputs, you risk SQL injection attacks. [Learn more](#queryrawunsafe).

$queryRawUnsafe() [#queryrawunsafe]

The `$queryRawUnsafe()` method allows you to pass a raw string (or template string) to the database.

<CalloutContainer type="warning">
  <CalloutDescription>
    If you use this method with user inputs (in other words, `SELECT * FROM table WHERE columnName = ${userInput}`), then you open up the possibility for SQL injection attacks. SQL injection attacks can expose your data to modification or deletion.<br /><br />

    Wherever possible you should use the `$queryRaw` method instead. When used correctly `$queryRaw` method is significantly safer but note that the `$queryRaw` method can also be made vulnerable in certain circumstances. For more information, see the [SQL injection prevention](#sql-injection-prevention) section below.
  </CalloutDescription>
</CalloutContainer>

The following query returns all fields for each record in the `User` table:

```ts
// import the generated `User` type from the `@prisma/client` module
import { User } from "@prisma/client";

const result = await prisma.$queryRawUnsafe("SELECT * FROM User");
```

You can also run a parameterized query. The following example returns all users whose email contains the string `emelie@prisma.io`:

```ts
prisma.$queryRawUnsafe("SELECT * FROM users WHERE email = $1", "emelie@prisma.io");
```

> **Note**: Prisma sends JavaScript integers to PostgreSQL as `INT8`. This might conflict with your user-defined functions that accept only `INT4` as input. If you use a parameterized `$queryRawUnsafe` query in conjunction with a PostgreSQL database, update the input types to `INT8`, or cast your query parameters to `INT4`.

For more details on using parameterized queries, see the [parameterized queries](#parameterized-queries) section below.

Signature [#signature-1]

```ts no-lines
$queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>;
```

$executeRaw [#executeraw]

`$executeRaw` returns the *number of rows affected by a database operation*, such as `UPDATE` or `DELETE`. This function does **not** return database records. The following query updates records in the database and returns a count of the number of records that were updated:

```ts
const result: number =
  await prisma.$executeRaw`UPDATE User SET active = true WHERE emailValidated = true`;
```

The method is implemented as a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates), which allows you to pass a template literal where you can easily insert your [variables](#using-variables). In turn, Prisma Client creates prepared statements that are safe from SQL injections:

```ts
const emailValidated = true;
const active = true;

const result: number =
  await prisma.$executeRaw`UPDATE User SET active = ${active} WHERE emailValidated = ${emailValidated};`;
```

<CalloutContainer type="warning">
  <CalloutDescription>
    If you use string building to incorporate untrusted input into queries passed to this method, then you open up the possibility for SQL injection attacks. SQL injection attacks can expose your data to modification or deletion. The preferred mechanism would be to include the text of the query at the point that you run this method. For more information on this risk and also examples of how to prevent it, see the [SQL injection prevention](#sql-injection-prevention) section below.
  </CalloutDescription>
</CalloutContainer>

Considerations [#considerations-1]

Be aware that:

* `$executeRaw` does not support multiple queries in a single string (for example, `ALTER TABLE` and `CREATE TABLE` together).

* Prisma Client submits prepared statements, and prepared statements only allow a subset of SQL statements. For example, `START TRANSACTION` is not permitted. You can learn more about [the syntax that MySQL allows in Prepared Statements here](https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html).

* [`PREPARE` does not support `ALTER`](https://www.postgresql.org/docs/current/sql-prepare.html) - see the [workaround](#alter-limitation-postgresql).

* Template variables cannot be used inside SQL string literals. For example, the following query would **not** work:

  ```ts no-lines
  const name = "Bob";
  await prisma.$executeRaw`UPDATE user SET greeting = 'My name is ${name}';`;
  ```

  Instead, you can either pass the whole string as a variable, or use string concatenation:

  ```ts no-lines
  const name = "My name is Bob";
  await prisma.$executeRaw`UPDATE user SET greeting = ${name};`;
  ```

  ```ts no-lines
  const name = "Bob";
  await prisma.$executeRaw`UPDATE user SET greeting = 'My name is ' || ${name};`;
  ```

* Template variables can only be used for data values (such as `email` in the example above). Variables cannot be used for identifiers such as column names, table names or database names, or for SQL keywords. For example, the following two queries would **not** work:

  ```ts no-lines
  const myTable = "user";
  await prisma.$executeRaw`UPDATE ${myTable} SET active = true;`;
  ```

  ```ts no-lines
  const ordering = "desc";
  await prisma.$executeRaw`UPDATE User SET active = true ORDER BY ${desc};`;
  ```

Return type [#return-type-1]

`$executeRaw` returns a `number`.

Signature [#signature-2]

```ts
$executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<number>;
```

$executeRawUnsafe() [#executerawunsafe]

The `$executeRawUnsafe()` method allows you to pass a raw string (or template string) to the database. Like `$executeRaw`, it does **not** return database records, but returns the number of rows affected.

<CalloutContainer type="warning">
  <CalloutDescription>
    If you use this method with user inputs (in other words, `SELECT * FROM table WHERE columnName = ${userInput}`), then you open up the possibility for SQL injection attacks. SQL injection attacks can expose your data to modification or deletion.<br /><br />

    Wherever possible you should use the `$executeRaw` method instead. When used correctly `$executeRaw` method is significantly safer but note that the `$executeRaw` method can also be made vulnerable in certain circumstances. For more information, see the [SQL injection prevention](#sql-injection-prevention) section below.
  </CalloutDescription>
</CalloutContainer>

The following example uses a template string to update records in the database. It then returns a count of the number of records that were updated:

```ts
const emailValidated = true;
const active = true;

const result = await prisma.$executeRawUnsafe(
  `UPDATE User SET active = ${active} WHERE emailValidated = ${emailValidated}`,
);
```

The same can be written as a parameterized query:

```ts
const result = prisma.$executeRawUnsafe(
  "UPDATE User SET active = $1 WHERE emailValidated = $2",
  "yin@prisma.io",
  true,
);
```

For more details on using parameterized queries, see the [parameterized queries](#parameterized-queries) section below.

Signature [#signature-3]

```ts no-lines
$executeRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<number>;
```

Raw query type mapping [#raw-query-type-mapping]

Prisma maps any database values returned by `$queryRaw` and `$queryRawUnsafe`to their corresponding [JavaScript types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures). This behavior is the same as for regular Prisma query methods like `findMany()`.

As an example, take a raw query that selects columns with `BigInt`, `Bytes`, `Decimal` and `Date` types from a table:

```ts
const result = await prisma.$queryRaw`SELECT bigint, bytes, decimal, date FROM "Table";`;

console.log(result);
```

```bash
{ bigint: BigInt("123"), bytes: <Buffer 01 02>), decimal: Decimal("12.34"), date: Date("<some_date>") }
```

In the `result` object, the database values have been mapped to the corresponding JavaScript types.

The following table shows the conversion between types used in the database and the JavaScript type returned by the raw query:

| Database type           | JavaScript type |
| ----------------------- | --------------- |
| Text                    | `String`        |
| 32-bit integer          | `Number`        |
| 32-bit unsigned integer | `BigInt`        |
| Floating point number   | `Number`        |
| Double precision number | `Number`        |
| 64-bit integer          | `BigInt`        |
| Decimal / numeric       | `Decimal`       |
| Bytes                   | `Uint8Array`    |
| Json                    | `Object`        |
| DateTime                | `Date`          |
| Date                    | `Date`          |
| Time                    | `Date`          |
| Uuid                    | `String`        |
| Xml                     | `String`        |

Note that the exact name for each database type will vary between databases – for example, the boolean type is known as `boolean` in PostgreSQL and `STRING` in CockroachDB. See the [Scalar types reference](/orm/reference/prisma-schema-reference#model-field-scalar-types) for full details of type names for each database.

Raw query typecasting behavior [#raw-query-typecasting-behavior]

Raw queries with Prisma Client might require parameters to be in the expected types of the SQL function or query. Prisma Client does not do subtle, implicit casts.

As an example, take the following query using PostgreSQL's `LENGTH` function, which only accepts the `text` type as an input:

```ts
await prisma.$queryRaw`SELECT LENGTH(${42});`;
```

This query returns an error:

```bash wrap
// ERROR: function length(integer) does not exist
// HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

The solution in this case is to explicitly cast `42` to the `text` type:

```ts
await prisma.$queryRaw`SELECT LENGTH(${42}::text);`;
```

Transactions [#transactions]

You can use `.$executeRaw()` and `.$queryRaw()` inside a [transaction](/orm/prisma-client/queries/transactions).

Using variables [#using-variables]

`$executeRaw` and `$queryRaw` are implemented as [**tagged templates**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). Tagged templates are the recommended way to use variables with raw SQL in the Prisma Client.

The following example includes a placeholder named `${userId}`:

```ts
const userId = 42;
const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${userId};`;
```

✔ Benefits of using the tagged template versions of `$queryRaw` and `$executeRaw` include:

* Prisma Client escapes all variables.
* Tagged templates are database-agnostic - you do not need to remember if variables should be written as `$1` (PostgreSQL) or `?` (MySQL).
* [SQL Template Tag](https://github.com/blakeembrey/sql-template-tag) give you access to [useful helpers](#tagged-template-helpers).
* Embedded, named variables are easier to read.

> **Note**: You cannot pass a table or column name into a tagged template placeholder. For example, you cannot `SELECT ?` and pass in `*` or `id, name` based on some condition.

Tagged template helpers [#tagged-template-helpers]

Prisma Client specifically uses [SQL Template Tag](https://github.com/blakeembrey/sql-template-tag), which exposes a number of helpers. For example, the following query uses `join()` to pass in a list of IDs:

```ts
import { Prisma } from "@prisma/client";

const ids = [1, 3, 5, 10, 20];
const result = await prisma.$queryRaw`SELECT * FROM User WHERE id IN (${Prisma.join(ids)})`;
```

The following example uses the `empty` and `sql` helpers to change the query depending on whether `userName` is empty:

```ts
import { Prisma } from "@prisma/client";

const userName = "";
const result = await prisma.$queryRaw`SELECT * FROM User ${
  userName ? Prisma.sql`WHERE name = ${userName}` : Prisma.empty // Cannot use "" or NULL here!
}`;
```

ALTER limitation (PostgreSQL) [#alter-limitation-postgresql]

PostgreSQL [does not support using `ALTER` in a prepared statement](https://www.postgresql.org/docs/current/sql-prepare.html), which means that the following queries **will not work**:

```ts
await prisma.$executeRaw`ALTER USER prisma WITH PASSWORD "${password}"`;
await prisma.$executeRaw(Prisma.sql`ALTER USER prisma WITH PASSWORD "${password}"`);
```

You can use the following query, but be aware that this is potentially **unsafe** as `${password}` is not escaped:

```ts
await prisma.$executeRawUnsafe('ALTER USER prisma WITH PASSWORD "$1"', password})
```

Unsupported types [#unsupported-types]

[`Unsupported` types](/orm/reference/prisma-schema-reference#unsupported) need to be cast to Prisma Client supported types before using them in `$queryRaw` or `$queryRawUnsafe`. For example, take the following model, which has a `location` field with an `Unsupported` type:

```tsx
model Country {
  location  Unsupported("point")?
}
```

The following query on the unsupported field will **not** work:

```tsx
await prisma.$queryRaw`SELECT location FROM Country;`;
```

Instead, cast `Unsupported` fields to any supported Prisma Client type, **if your `Unsupported` column supports the cast**.

The most common type you may want to cast your `Unsupported` column to is `String`. For example, on PostgreSQL, this would map to the `text` type:

```tsx
await prisma.$queryRaw`SELECT location::text FROM Country;`;
```

The database will thus provide a `String` representation of your data which Prisma Client supports.

For details of supported Prisma types, see the [Prisma connector overview](/orm/core-concepts/supported-databases) for the relevant database.

SQL injection prevention [#sql-injection-prevention]

The ideal way to avoid SQL injection in Prisma Client is to use the ORM models to perform queries wherever possible.

Where this is not possible and raw queries are required, Prisma Client provides various raw methods, but it is important to use these methods safely.

This section will provide various examples of using these methods safely and unsafely. You can test these examples in the [Prisma Playground](https://playground.prisma.io/examples).

In $queryRaw and $executeRaw [#in-queryraw-and-executeraw]

Simple, safe use of $queryRaw and $executeRaw [#simple-safe-use-of-queryraw-and-executeraw]

These methods can mitigate the risk of SQL injection by escaping all variables when you use tagged templates and sends all queries as prepared statements.

```ts
$queryRaw`...`; // Tagged template
$executeRaw`...`; // Tagged template
```

The following example is safe ✅ from SQL Injection:

```ts
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
const result = await prisma.$queryRaw`SELECT id, name FROM "User" WHERE name = ${inputString}`;

console.log(result);
```

Unsafe use of $queryRaw and $executeRaw [#unsafe-use-of-queryraw-and-executeraw]

However, it is also possible to use these methods in unsafe ways.

One way is by artificially generating a tagged template that unsafely concatenates user input.

The following example is vulnerable ❌ to SQL Injection:

```ts
// Unsafely generate query text
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`; // SQL Injection
const query = `SELECT id, name FROM "User" WHERE name = ${inputString}`;

// Version for Typescript
const stringsArray: any = [...[query]];

// Version for Javascript
const stringsArray = [...[query]];

// Use the `raw` property to impersonate a tagged template
stringsArray.raw = [query];

// Use queryRaw
const result = await prisma.$queryRaw(stringsArray);
console.log(result);
```

Another way to make these methods vulnerable is misuse of the `Prisma.raw` function.

The following examples are all vulnerable ❌ to SQL Injection:

```ts
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
const result = await prisma.$queryRaw`SELECT id, name FROM "User" WHERE name = ${Prisma.raw(
  inputString,
)}`;
console.log(result);
```

```ts
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
const result = await prisma.$queryRaw(
  Prisma.raw(`SELECT id, name FROM "User" WHERE name = ${inputString}`),
);
console.log(result);
```

```ts
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
const query = Prisma.raw(`SELECT id, name FROM "User" WHERE name = ${inputString}`);
const result = await prisma.$queryRaw(query);
console.log(result);
```

Safely using $queryRaw and $executeRaw in more complex scenarios [#safely-using-queryraw-and-executeraw-in-more-complex-scenarios]

Building raw queries separate to query execution [#building-raw-queries-separate-to-query-execution]

If you want to build your raw queries elsewhere or separate to your parameters you will need to use one of the following methods.

In this example, the `sql` helper method is used to build the query text by safely including the variable. It is safe ✅ from SQL Injection:

```ts
// inputString can be untrusted input
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;

// Safe if the text query below is completely trusted content
const query = Prisma.sql`SELECT id, name FROM "User" WHERE name = ${inputString}`;

const result = await prisma.$queryRaw(query);
console.log(result);
```

In this example which is safe ✅ from SQL Injection, the `sql` helper method is used to build the query text including a parameter marker for the input value. Each variable is represented by a marker symbol (`?` for MySQL, `$1`, `$2`, and so on for PostgreSQL). Note that the examples just show PostgreSQL queries.

```ts
// Version for Typescript
const query: any;

// Version for Javascript
const query;

// Safe if the text query below is completely trusted content
query = Prisma.sql`SELECT id, name FROM "User" WHERE name = $1`;

// inputString can be untrusted input
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
query.values = [inputString];

const result = await prisma.$queryRaw(query);
console.log(result);
```

> **Note**: PostgreSQL variables are represented by `$1`, etc

Building raw queries elsewhere or in stages [#building-raw-queries-elsewhere-or-in-stages]

If you want to build your raw queries somewhere other than where the query is executed, the ideal way to do this is to create an `Sql` object from the segments of your query and pass it the parameter value.

In the following example we have two variables to parameterize. The example is safe ✅ from SQL Injection as long as the query strings being passed to `Prisma.sql` only contain trusted content:

```ts
// Example is safe if the text query below is completely trusted content
const query1 = `SELECT id, name FROM "User" WHERE name = `; // The first parameter would be inserted after this string
const query2 = ` OR name = `; // The second parameter would be inserted after this string

const inputString1 = "Fred";
const inputString2 = `'Sarah' UNION SELECT id, title FROM "Post"`;

const query = Prisma.sql([query1, query2, ""], inputString1, inputString2);
const result = await prisma.$queryRaw(query);
console.log(result);
```

> Note: Notice that the string array being passed as the first parameter `Prisma.sql` needs to have an empty string at the end as the `sql` function expects one more query segment than the number of parameters.

If you want to build your raw queries into one large string, this is still possible but requires some care as it is uses the potentially dangerous `Prisma.raw` method. You also need to build your query using the correct parameter markers for your database as Prisma won't be able to provide markers for the relevant database as it usually is.

The following example is safe ✅ from SQL Injection as long as the query strings being passed to `Prisma.raw` only contain trusted content:

```ts
// Version for Typescript
const query: any;

// Version for Javascript
const query;

// Example is safe if the text query below is completely trusted content
const query1 = `SELECT id, name FROM "User" `;
const query2 = `WHERE name = $1 `;

query = Prisma.raw(`${query1}${query2}`);

// inputString can be untrusted input
const inputString = `'Sarah' UNION SELECT id, title FROM "Post"`;
query.values = [inputString];

const result = await prisma.$queryRaw(query);
console.log(result);
```

In $queryRawUnsafe and $executeRawUnsafe [#in-queryrawunsafe-and-executerawunsafe]

Using $queryRawUnsafe and $executeRawUnsafe unsafely [#using-queryrawunsafe-and-executerawunsafe-unsafely]

If you cannot use tagged templates, you can instead use [`$queryRawUnsafe`](/orm/prisma-client/using-raw-sql/raw-queries#queryrawunsafe) or [`$executeRawUnsafe`](/orm/prisma-client/using-raw-sql/raw-queries#executerawunsafe). However, **be aware that these functions significantly increase the risk of SQL injection vulnerabilities in your code**.

The following example concatenates `query` and `inputString`. Prisma Client ❌ **cannot** escape `inputString` in this example, which makes it vulnerable to SQL injection:

```ts
const inputString = '"Sarah" UNION SELECT id, title, content FROM Post'; // SQL Injection
const query = "SELECT id, name, email FROM User WHERE name = " + inputString;
const result = await prisma.$queryRawUnsafe(query);

console.log(result);
```

Parameterized queries [#parameterized-queries]

As an alternative to tagged templates, `$queryRawUnsafe` supports standard parameterized queries where each variable is represented by a symbol (`?` for MySQL, `$1`, `$2`, and so on for PostgreSQL). Note that the examples just show PostgreSQL queries.

The following example is safe ✅ from SQL Injection:

```ts
const userName = "Sarah";
const email = "sarah@prisma.io";
const result = await prisma.$queryRawUnsafe(
  "SELECT * FROM User WHERE (name = $1 OR email = $2)",
  userName,
  email,
);
```

> **Note**: PostgreSQL variables are represented by `$1` and `$2`

As with tagged templates, Prisma Client escapes all variables when they are provided in this way.

> **Note**: You cannot pass a table or column name as a variable into a parameterized query. For example, you cannot `SELECT ?` and pass in `*` or `id, name` based on some condition.

Parameterized PostgreSQL ILIKE query [#parameterized-postgresql-ilike-query]

When you use `ILIKE`, the `%` wildcard character(s) should be included in the variable itself, not the query (`string`). This example is safe ✅ from SQL Injection.

```ts
const userName = "Sarah";
const emailFragment = "prisma.io";
const result = await prisma.$queryRawUnsafe(
  'SELECT * FROM "User" WHERE (name = $1 OR email ILIKE $2)',
  userName,
  `%${emailFragment}`,
);
```

> **Note**: Using `%$2` as an argument would not work

Raw queries with MongoDB [#raw-queries-with-mongodb]

For MongoDB, Prisma Client exposes three methods that allow you to send raw queries. You can use:

* `$runCommandRaw` to run a command against the database
* `<model>.findRaw` to find zero or more documents that match the filter.
* `<model>.aggregateRaw` to perform aggregation operations on a collection.

$runCommandRaw() [#runcommandraw]

`$runCommandRaw()` runs a raw MongoDB command against the database. As input, it accepts all [MongoDB database commands](https://www.mongodb.com/docs/manual/reference/command/), with the following exceptions:

* `find` (use [`findRaw()`](#findraw) instead)
* `aggregate` (use [`aggregateRaw()`](#aggregateraw) instead)

When you use `$runCommandRaw()` to run a MongoDB database command, note the following:

* The object that you pass when you invoke `$runCommandRaw()` must follow the syntax of the MongoDB database command.
* You must connect to the database with an appropriate role for the MongoDB database command.

In the following example, a query inserts two records with the same `_id`. This bypasses normal document validation.

```ts no-lines
prisma.$runCommandRaw({
  insert: "Pets",
  bypassDocumentValidation: true,
  documents: [
    {
      _id: 1,
      name: "Felinecitas",
      type: "Cat",
      breed: "Russian Blue",
      age: 12,
    },
    {
      _id: 1,
      name: "Nao Nao",
      type: "Dog",
      breed: "Chow Chow",
      age: 2,
    },
  ],
});
```

<CalloutContainer type="warning">
  <CalloutDescription>
    Do not use `$runCommandRaw()` for queries which contain the `"find"` or `"aggregate"` commands, because you might be unable to fetch all data. This is because MongoDB returns a [cursor](https://www.mongodb.com/docs/manual/tutorial/iterate-a-cursor/) that is attached to your MongoDB session, and you might not hit the same MongoDB session every time. For these queries, you should use the specialised [`findRaw()`](#findraw) and [`aggregateRaw()`](#aggregateraw) methods instead.
  </CalloutDescription>
</CalloutContainer>

Return type [#return-type-2]

`$runCommandRaw()` returns a `JSON` object whose shape depends on the inputs.

Signature [#signature-4]

```ts no-lines
$runCommandRaw(command: InputJsonObject): PrismaPromise<JsonObject>;
```

findRaw() [#findraw]

`<model>.findRaw()` returns actual database records. It will find zero or more documents that match the filter on the `User` collection:

```ts no-lines
const result = await prisma.user.findRaw({
  filter: { age: { $gt: 25 } },
  options: { projection: { _id: false } },
});
```

Return type [#return-type-3]

`<model>.findRaw()` returns a `JSON` object whose shape depends on the inputs.

Signature [#signature-5]

```ts no-lines
<model>.findRaw(args?: {filter?: InputJsonObject, options?: InputJsonObject}): PrismaPromise<JsonObject>;
```

* `filter`: The query predicate filter. If unspecified, then all documents in the collection will match the [predicate](https://www.mongodb.com/docs/manual/reference/mql/query-predicates/).
* `options`: Additional options to pass to the [`find` command](https://www.mongodb.com/docs/manual/reference/command/find/#command-fields).

aggregateRaw() [#aggregateraw]

`<model>.aggregateRaw()` returns aggregated database records. It will perform aggregation operations on the `User` collection:

```ts no-lines
const result = await prisma.user.aggregateRaw({
  pipeline: [
    { $match: { status: "registered" } },
    { $group: { _id: "$country", total: { $sum: 1 } } },
  ],
});
```

Return type [#return-type-4]

`<model>.aggregateRaw()` returns a `JSON` object whose shape depends on the inputs.

Signature [#signature-6]

```ts no-lines
<model>.aggregateRaw(args?: {pipeline?: InputJsonObject[], options?: InputJsonObject}): PrismaPromise<JsonObject>;
```

* `pipeline`: An array of aggregation stages to process and transform the document stream via the [aggregation pipeline](https://www.mongodb.com/docs/atlas/data-federation/supported-unsupported/supported-aggregation/).
* `options`: Additional options to pass to the [`aggregate` command](https://www.mongodb.com/docs/manual/reference/command/aggregate/#command-fields).

Caveats [#caveats]

When working with custom objects like `ObjectId` or `Date,` you will have to pass them according to the [MongoDB extended JSON Spec](https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/#type-representations).
Example:

```ts no-lines
const result = await prisma.user.aggregateRaw({
  pipeline: [
    { $match: { _id: { $oid: id } } },
    //                     ^ notice the $oid convention here
  ],
});
```
# TypedSQL (/docs/orm/prisma-client/using-raw-sql/typedsql)



Getting started with TypedSQL [#getting-started-with-typedsql]

To start using TypedSQL in your Prisma project, follow these steps:

1. Ensure you have `@prisma/client` and `prisma` installed:

   <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
     <CodeBlockTabsList>
       <CodeBlockTabsTrigger value="npm">
         npm
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="pnpm">
         pnpm
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="yarn">
         yarn
       </CodeBlockTabsTrigger>

       <CodeBlockTabsTrigger value="bun">
         bun
       </CodeBlockTabsTrigger>
     </CodeBlockTabsList>

     <CodeBlockTab value="npm">
       ```bash
       npm install @prisma/client@latest
       npm install -D prisma@latest
       ```
     </CodeBlockTab>

     <CodeBlockTab value="pnpm">
       ```bash
       pnpm add @prisma/client@latest
       pnpm add -D prisma@latest
       ```
     </CodeBlockTab>

     <CodeBlockTab value="yarn">
       ```bash
       yarn add @prisma/client@latest
       yarn add --dev prisma@latest
       ```
     </CodeBlockTab>

     <CodeBlockTab value="bun">
       ```bash
       bun add @prisma/client@latest
       bun add --dev prisma@latest
       ```
     </CodeBlockTab>
   </CodeBlockTabs>

2. Add the `typedSql` preview feature flag to your `schema.prisma` file:

   ```prisma
   generator client {
    provider = "prisma-client"
    previewFeatures = ["typedSql"]
    output = "../src/generated/prisma"
   }
   ```

   <CalloutContainer type="info">
     <CalloutTitle>
       Using driver adapters with TypedSQL
     </CalloutTitle>

     <CalloutDescription>
       If you are deploying Prisma in serverless or edge environments, you can use [driver adapters](/orm/core-concepts/supported-databases/database-drivers#driver-adapters) to connect through JavaScript database drivers. Driver adapters are compatible with TypedSQL, with the exception of `@prisma/adapter-better-sqlite3`. For SQLite support, use [`@prisma/adapter-libsql`](https://www.npmjs.com/package/@prisma/adapter-libsql) instead. All other driver adapters are supported.
     </CalloutDescription>
   </CalloutContainer>

3. Create a `sql` directory inside your `prisma` directory. This is where you'll write your SQL queries.

   ```bash
   mkdir -p prisma/sql
   ```

   <CalloutContainer type="info">
     <CalloutTitle>
       Custom SQL folder location
     </CalloutTitle>

     <CalloutDescription>
       Starting with Prisma 6.12.0, you can configure a custom location for your SQL files using the Prisma config file. Create a `prisma.config.ts` file in your project root and specify the `typedSql.path` option:

       ```typescript title="prisma.config.ts"
       import "dotenv/config";
       import { defineConfig } from "prisma/config";

       export default defineConfig({
         schema: "./prisma/schema.prisma",
         typedSql: {
           path: "./prisma/sql",
         },
       });
       ```
     </CalloutDescription>
   </CalloutContainer>

4. Create a new `.sql` file in your `prisma/sql` directory. For example, `getUsersWithPosts.sql`. Note that the file name must be a valid JS identifier and cannot start with a `$`.

5. Write your SQL queries in your new `.sql` file. For example:

   ```sql title="prisma/sql/getUsersWithPosts.sql"
   SELECT u.id, u.name, COUNT(p.id) as "postCount"
   FROM "User" u
   LEFT JOIN "Post" p ON u.id = p."authorId"
   GROUP BY u.id, u.name
   ```

6. Generate Prisma Client with the `sql` flag to ensure TypeScript functions and types for your SQL queries are created:

   <CalloutContainer type="warning">
     <CalloutDescription>
       Make sure that any pending migrations are applied before generating the client with the `sql` flag.
     </CalloutDescription>
   </CalloutContainer>

   ```bash
   prisma generate --sql
   ```

   If you don't want to regenerate the client after every change, this command also works with the existing `--watch` flag:

   ```bash
   prisma generate --sql --watch
   ```

7. Now you can import and use your SQL queries in your TypeScript code:

```typescript title="/src/index.ts"
import { PrismaClient } from "./generated/prisma/client";
import { getUsersWithPosts } from "./generated/prisma/sql";

const prisma = new PrismaClient();

const usersWithPostCounts = await prisma.$queryRawTyped(getUsersWithPosts());
console.log(usersWithPostCounts);
```

<CalloutContainer type="info">
  <CalloutDescription>
    If you do not customize the generator `output`, you can import from `@prisma/client` and `@prisma/client/sql` instead.
  </CalloutDescription>
</CalloutContainer>

Passing Arguments to TypedSQL Queries [#passing-arguments-to-typedsql-queries]

To pass arguments to your TypedSQL queries, you can use parameterized queries. This allows you to write flexible and reusable SQL statements while maintaining type safety. Here's how to do it:

1. In your SQL file, use placeholders for the parameters you want to pass. The syntax for placeholders depends on your database engine:

For PostgreSQL, use the positional placeholders `$1`, `$2`, etc. For MySQL, use `?`. In SQLite, you can use positional (`$1`, `$2`), general (`?`), or named placeholders (`:minAge`, `:maxAge`):

<CodeBlockTabs defaultValue="PostgreSQL">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="PostgreSQL">
      PostgreSQL
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="MySQL">
      MySQL
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="SQLite">
      SQLite
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="PostgreSQL">
    ```sql title="prisma/sql/getUsersByAge.sql" 
    SELECT id, name, age
    FROM users
    WHERE age > $1 AND age < $2
    ```
  </CodeBlockTab>

  <CodeBlockTab value="MySQL">
    ```sql title="prisma/sql/getUsersByAge.sql" 
    SELECT id, name, age
    FROM users
    WHERE age > ? AND age < ?
    ```
  </CodeBlockTab>

  <CodeBlockTab value="SQLite">
    ```sql title="prisma/sql/getUsersByAge.sql" 
    SELECT id, name, age
    FROM users
    WHERE age > :minAge AND age < :maxAge
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="info">
  <CalloutDescription>
    See below for information on how to [define argument types in your SQL files](#defining-argument-types-in-your-sql-files).
  </CalloutDescription>
</CalloutContainer>

1. When using the generated function in your TypeScript code, pass the arguments as additional parameters to `$queryRawTyped`:

```typescript title="/src/index.ts"
import { PrismaClient } from "./generated/prisma/client";
import { getUsersByAge } from "./generated/prisma/sql";

const prisma = new PrismaClient();

const minAge = 18;
const maxAge = 30;
const users = await prisma.$queryRawTyped(getUsersByAge(minAge, maxAge));
console.log(users);
```

By using parameterized queries, you ensure type safety and protect against SQL injection vulnerabilities. The TypedSQL generator will create the appropriate TypeScript types for the parameters based on your SQL query, providing full type checking for both the query results and the input parameters.

Passing array arguments to TypedSQL [#passing-array-arguments-to-typedsql]

TypedSQL supports passing arrays as arguments for PostgreSQL. Use PostgreSQL's `ANY` operator with an array parameter.

```sql title="prisma/sql/getUsersByIds.sql"
SELECT id, name, email
FROM users
WHERE id = ANY($1)
```

```typescript title="/src/index.ts"
import { PrismaClient } from "./generated/prisma/client";
import { getUsersByIds } from "./generated/prisma/sql";

const prisma = new PrismaClient();

const userIds = [1, 2, 3];
const users = await prisma.$queryRawTyped(getUsersByIds(userIds));
console.log(users);
```

TypedSQL will generate the appropriate TypeScript types for the array parameter, ensuring type safety for both the input and the query results.

<CalloutContainer type="info">
  <CalloutDescription>
    When passing array arguments, be mindful of the maximum number of placeholders your database supports in a single query. For very large arrays, you may need to split the query into multiple smaller queries.
  </CalloutDescription>
</CalloutContainer>

Defining argument types in your SQL files [#defining-argument-types-in-your-sql-files]

Argument typing in TypedSQL is accomplished via specific comments in your SQL files. These comments are of the form:

```sql
-- @param {Type} $N:alias optional description
```

Where `Type` is a valid database type, `N` is the position of the argument in the query, and `alias` is an optional alias for the argument that is used in the TypeScript type.

As an example, if you needed to type a single string argument with the alias `name` and the description "The name of the user", you would add the following comment to your SQL file:

```sql
-- @param {String} $1:name The name of the user
```

To indicate that a parameter is nullable, add a question mark after the alias:

```sql
-- @param {String} $1:name? The name of the user (optional)
```

Currently accepted types are `Int`, `BigInt`, `Float`, `Boolean`, `String`, `DateTime`, `Json`, `Bytes`, `null`, and `Decimal`.

Taking the [example from above](#passing-arguments-to-typedsql-queries), the SQL file would look like this:

```sql
-- @param {Int} $1:minAge
-- @param {Int} $2:maxAge
SELECT id, name, age
FROM users
WHERE age > $1 AND age < $2
```

The format of argument type definitions is the same regardless of the database engine.

<CalloutContainer type="info">
  <CalloutDescription>
    Manual argument type definitions are not supported for array arguments. For these arguments, you will need to rely on the type inference provided by TypedSQL.
  </CalloutDescription>
</CalloutContainer>

Examples [#examples]

For practical examples of how to use TypedSQL, please refer to the [TypedSQL example in the Prisma Examples repo](https://github.com/prisma/prisma-examples/tree/latest/generator-prisma-client/basic-typedsql).

Limitations of TypedSQL [#limitations-of-typedsql]

Supported Databases [#supported-databases]

TypedSQL supports modern versions of MySQL and PostgreSQL without any further configuration. For MySQL versions older than 8.0 and all SQLite versions, you will need to manually [describe argument types](#defining-argument-types-in-your-sql-files) in your SQL files. The types of inputs are inferred in all supported versions of PostgreSQL and MySQL 8.0 and later.

TypedSQL does not work with MongoDB, as it is specifically designed for SQL databases.

Active Database Connection Required [#active-database-connection-required]

TypedSQL requires an active database connection to function properly. This means you need to have a running database instance that Prisma can connect to when generating the client with the `--sql` flag. TypedSQL uses the connection string defined in `prisma.config.ts` (`datasource.url`) to establish this connection.

Dynamic SQL Queries with Dynamic Columns [#dynamic-sql-queries-with-dynamic-columns]

TypedSQL does not natively support constructing SQL queries with dynamically added columns. When you need to create a query where the columns are determined at runtime, you must use the `$queryRaw` and `$executeRaw` methods. These methods allow for the execution of raw SQL, which can include dynamic column selections.

**Example of a query using dynamic column selection:**

```typescript
const columns = "name, email, age"; // Columns determined at runtime
const result = await prisma.$queryRawUnsafe(`SELECT ${columns} FROM Users WHERE active = true`);
```

In this example, the columns to be selected are defined dynamically and included in the SQL query. While this approach provides flexibility, it requires careful attention to security, particularly to [avoid SQL injection vulnerabilities](/orm/prisma-client/using-raw-sql/raw-queries#sql-injection-prevention). Additionally, using raw SQL queries means foregoing the type-safety and DX of TypedSQL.

Acknowledgements [#acknowledgements]

This feature was heavily inspired by [PgTyped](https://github.com/adelsz/pgtyped) and [SQLx](https://github.com/launchbadge/sqlx). Additionally, SQLite parsing is handled by SQLx.
# Unit testing (/docs/orm/prisma-client/testing/unit-testing)



Unit testing aims to isolate a small portion (unit) of code and test it for logically predictable behaviors. It generally involves mocking objects or server responses to simulate real world behaviors. Some benefits to unit testing include:

* Quickly find and isolate bugs in code.
* Provides documentation for each module of code by way of indicating what certain code blocks should be doing.
* A helpful gauge that a refactor has gone well. The tests should still pass after code has been refactored.

In the context of Prisma ORM, this generally means testing a function which makes database calls using Prisma Client.

A single test should focus on how your function logic handles different inputs (such as a null value or an empty list).

This means that you should aim to remove as many dependencies as possible, such as external services and databases, to keep the tests and their environments as lightweight as possible.

> **Note**: This [blog post](https://www.prisma.io/blog/testing-series-2-xPhjjmIEsM) provides a comprehensive guide to implementing unit testing in your Express project with Prisma ORM. If you're looking to delve into this topic, be sure to give it a read!

Prerequisites [#prerequisites]

This guide assumes you have the JavaScript testing library [`Jest`](https://jestjs.io/) and [`ts-jest`](https://github.com/kulshekhar/ts-jest) already setup in your project.

Mocking Prisma Client [#mocking-prisma-client]

To ensure your unit tests are isolated from external factors you can mock Prisma Client, this means you get the benefits of being able to use your schema (***type-safety***), without having to make actual calls to your database when your tests are run.

This guide will cover two approaches to mocking Prisma Client, a singleton instance and dependency injection. Both have their merits depending on your use cases. To help with mocking Prisma Client the [`jest-mock-extended`](https://github.com/marchaos/jest-mock-extended) package will be used.

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm install jest-mock-extended@2.0.4 --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add jest-mock-extended@2.0.4 --save-dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add jest-mock-extended@2.0.4 --dev
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add jest-mock-extended@2.0.4 --dev
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<CalloutContainer type="error">
  <CalloutDescription>
    At the time of writing, this guide uses `jest-mock-extended` version `^2.0.4`.
  </CalloutDescription>
</CalloutContainer>

Singleton [#singleton]

The following steps guide you through mocking Prisma Client using a singleton pattern.

1. Create a file at your projects root called `client.ts` and add the following code. This will instantiate a Prisma Client instance.

   ```ts title="client.ts"
   import "dotenv/config";
   import { PrismaPg } from "@prisma/adapter-pg";
   import { PrismaClient } from "../generated/prisma/client";

   const connectionString = `${process.env.DATABASE_URL}`;

   const adapter = new PrismaPg({ connectionString });
   const prisma = new PrismaClient({ adapter });

   export { prisma };
   ```

2. Next create a file named `singleton.ts` at your projects root and add the following:

   ```ts title="singleton.ts"
   import { PrismaClient } from "../generated/prisma/client";
   import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

   import prisma from "./client";

   jest.mock("./client", () => ({
     __esModule: true,
     default: mockDeep<PrismaClient>(),
   }));

   beforeEach(() => {
     mockReset(prismaMock);
   });

   export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
   ```

The singleton file tells Jest to mock a default export (the Prisma Client instance in `./client.ts`), and uses the `mockDeep` method from `jest-mock-extended` to enable access to the objects and methods available on Prisma Client. It then resets the mocked instance before each test is run.

Next, add the `setupFilesAfterEnv` property to your `jest.config.js` file with the path to your `singleton.ts` file.

```js title="jest.config.js" highlight=5;add showLineNumbers
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/singleton.ts"], {/* [!code ++] */}
};
```

Dependency injection [#dependency-injection]

Another popular pattern that can be used is dependency injection.

1. Create a `context.ts` file and add the following:

   ```ts title="context.ts"
   import { PrismaClient } from "../generated/prisma/client";
   import { mockDeep, DeepMockProxy } from "jest-mock-extended";

   export type Context = {
     prisma: PrismaClient;
   };

   export type MockContext = {
     prisma: DeepMockProxy<PrismaClient>;
   };

   export const createMockContext = (): MockContext => {
     return {
       prisma: mockDeep<PrismaClient>(),
     };
   };
   ```

<CalloutContainer type="info">
  <CalloutDescription>
    If you find that you're seeing a circular dependency error highlighted through mocking Prisma Client, try adding `"strictNullChecks": true`
    to your `tsconfig.json`.
  </CalloutDescription>
</CalloutContainer>

2. To use the context, you would do the following in your test file:

   ```ts
   import { MockContext, Context, createMockContext } from "../context";

   let mockCtx: MockContext;
   let ctx: Context;

   beforeEach(() => {
     mockCtx = createMockContext();
     ctx = mockCtx as unknown as Context;
   });
   ```

This will create a new context before each test is run via the `createMockContext` function. This (`mockCtx`) context will be used to make a mock call to Prisma Client and run a query to test. The `ctx` context will be used to run a scenario query that is tested against.

Example unit tests [#example-unit-tests]

A real world use case for unit testing Prisma ORM might be a signup form. Your user fills in a form which calls a function, which in turn uses Prisma Client to make a call to your database.

All of the examples that follow use the following schema model:

```prisma title="schema.prisma" showLineNumbers
model User {
  id                       Int     @id @default(autoincrement())
  email                    String  @unique
  name                     String?
  acceptTermsAndConditions Boolean
}
```

The following unit tests will mock the process of

* Creating a new user
* Updating a users name
* Failing to create a user if terms are not accepted

The functions that use the dependency injection pattern will have the context injected (passed in as a parameter) into them, whereas the functions that use the singleton pattern will use the singleton instance of Prisma Client.

```ts title="functions-with-context.ts"
import { Context } from "./context";

interface CreateUser {
  name: string;
  email: string;
  acceptTermsAndConditions: boolean;
}

export async function createUser(user: CreateUser, ctx: Context) {
  if (user.acceptTermsAndConditions) {
    return await ctx.prisma.user.create({
      data: user,
    });
  } else {
    return new Error("User must accept terms!");
  }
}

interface UpdateUser {
  id: number;
  name: string;
  email: string;
}

export async function updateUsername(user: UpdateUser, ctx: Context) {
  return await ctx.prisma.user.update({
    where: { id: user.id },
    data: user,
  });
}
```

```ts title="functions-without-context.ts"
import prisma from "./client";

interface CreateUser {
  name: string;
  email: string;
  acceptTermsAndConditions: boolean;
}

export async function createUser(user: CreateUser) {
  if (user.acceptTermsAndConditions) {
    return await prisma.user.create({
      data: user,
    });
  } else {
    return new Error("User must accept terms!");
  }
}

interface UpdateUser {
  id: number;
  name: string;
  email: string;
}

export async function updateUsername(user: UpdateUser) {
  return await prisma.user.update({
    where: { id: user.id },
    data: user,
  });
}
```

The tests for each methodology are fairly similar, the difference is how the mocked Prisma Client is used.

The ***dependency injection*** example passes the context through to the function that is being tested as well as using it to call the mock implementation.

The ***singleton*** example uses the singleton client instance to call the mock implementation.

```ts title="__tests__/with-singleton.ts"
import { createUser, updateUsername } from "../functions-without-context";
import { prismaMock } from "../singleton";

test("should create new user ", async () => {
  const user = {
    id: 1,
    name: "Rich",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  };

  prismaMock.user.create.mockResolvedValue(user);

  await expect(createUser(user)).resolves.toEqual({
    id: 1,
    name: "Rich",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  });
});

test("should update a users name ", async () => {
  const user = {
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  };

  prismaMock.user.update.mockResolvedValue(user);

  await expect(updateUsername(user)).resolves.toEqual({
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  });
});

test("should fail if user does not accept terms", async () => {
  const user = {
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: false,
  };

  prismaMock.user.create.mockImplementation();

  await expect(createUser(user)).resolves.toEqual(new Error("User must accept terms!"));
});
```

```ts title="__tests__/with-dependency-injection.ts"
import { MockContext, Context, createMockContext } from "../context";
import { createUser, updateUsername } from "../functions-with-context";

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

test("should create new user ", async () => {
  const user = {
    id: 1,
    name: "Rich",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  };
  mockCtx.prisma.user.create.mockResolvedValue(user);

  await expect(createUser(user, ctx)).resolves.toEqual({
    id: 1,
    name: "Rich",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  });
});

test("should update a users name ", async () => {
  const user = {
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  };
  mockCtx.prisma.user.update.mockResolvedValue(user);

  await expect(updateUsername(user, ctx)).resolves.toEqual({
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: true,
  });
});

test("should fail if user does not accept terms", async () => {
  const user = {
    id: 1,
    name: "Rich Haines",
    email: "hello@prisma.io",
    acceptTermsAndConditions: false,
  };

  mockCtx.prisma.user.create.mockImplementation();

  await expect(createUser(user, ctx)).resolves.toEqual(new Error("User must accept terms!"));
});
```
# Integration testing (/docs/orm/prisma-client/testing/integration-testing)



Integration tests focus on testing how separate parts of the program work together. In the context of applications using a database, integration tests usually require a database to be available and contain data that is convenient to the scenarios intended to be tested.

One way to simulate a real world environment is to use [Docker](https://www.docker.com/get-started/) to encapsulate a database and some test data. This can be spun up and torn down with the tests and so operate as an isolated environment away from your production databases.

> **Note:** This [blog post](https://www.prisma.io/blog/testing-series-2-xPhjjmIEsM) offers a comprehensive guide on setting up an integration testing environment and writing integration tests against a real database, providing valuable insights for those looking to explore this topic.

Prerequisites [#prerequisites]

This guide assumes you have [Docker](https://docs.docker.com/get-started/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine as well as `Jest` setup in your project.

See our [system requirements](/orm/reference/system-requirements) for all minimum version requirements.

The following e-commerce schema will be used throughout the guide. This varies from the traditional `User` and `Post` models used in other parts of the docs, mainly because it is unlikely you will be running integration tests against your blog.

<details>
  <summary>
    Ecommerce schema
  </summary>

  ```prisma title="schema.prisma"
  // Can have 1 customer
  // Can have many order details
  model CustomerOrder {
    id           Int            @id @default(autoincrement())
    createdAt    DateTime       @default(now())
    customer     Customer       @relation(fields: [customerId], references: [id])
    customerId   Int
    orderDetails OrderDetails[]
  }

  // Can have 1 order
  // Can have many products
  model OrderDetails {
    id        Int           @id @default(autoincrement())
    products  Product       @relation(fields: [productId], references: [id])
    productId Int
    order     CustomerOrder @relation(fields: [orderId], references: [id])
    orderId   Int
    total     Decimal
    quantity  Int
  }

  // Can have many order details
  // Can have 1 category
  model Product {
    id           Int            @id @default(autoincrement())
    name         String
    description  String
    price        Decimal
    sku          Int
    orderDetails OrderDetails[]
    category     Category       @relation(fields: [categoryId], references: [id])
    categoryId   Int
  }

  // Can have many products
  model Category {
    id       Int       @id @default(autoincrement())
    name     String
    products Product[]
  }

  // Can have many orders
  model Customer {
    id      Int             @id @default(autoincrement())
    email   String          @unique
    address String?
    name    String?
    orders  CustomerOrder[]
  }
  ```
</details>

The guide uses a singleton pattern for Prisma Client setup. Refer to the [singleton](/orm/prisma-client/testing/unit-testing#singleton) docs for a walk through of how to set that up.

Add Docker to your project [#add-docker-to-your-project]

<img alt="Docker compose code pointing towards image of container holding a Postgres database" src="/img/orm/prisma-client/testing/Docker_Diagram_V1.png" width="1000" height="457" />

With Docker and Docker compose both installed on your machine you can use them in your project.

1. Begin by creating a `docker-compose.yml` file at your projects root. Here you will add a Postgres image and specify the environments credentials.

```yml title="docker-compose.yml"
# Set the version of docker compose to use
version: "3.9"

# The containers that compose the project
services:
  db:
    image: postgres:13
    restart: always
    container_name: integration-tests-prisma
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
      POSTGRES_DB: tests
```

> **Note**: The compose version used here (`3.9`) is the latest at the time of writing, if you are following along be sure to use the same version for consistency.

The `docker-compose.yml` file defines the following:

* The Postgres image (`postgres`) and version tag (`:13`). This will be downloaded if you do not have it locally available.
* The port `5433` is mapped to the internal (Postgres default) port `5432`. This will be the port number the database is exposed on externally.
* The database user credentials are set and the database given a name.

2. To connect to the database in the container, create a new connection string with the credentials defined in the `docker-compose.yml` file. For example:

```bash title=".env.test"
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"
```

<CalloutContainer type="info">
  <CalloutDescription>
    The above `.env.test` file is used as part of a multiple `.env` file setup. Checkout the [using multiple .env files.](/orm/more/dev-environment/environment-variables) section to learn more about setting up your project with multiple `.env` files
  </CalloutDescription>
</CalloutContainer>

3. To create the container in a detached state so that you can continue to use the terminal tab, run the following command:

```bash
docker compose up -d
```

4. Next you can check that the database has been created by executing a `psql` command inside the container. Make a note of the container id.

   ```
   docker ps
   ```

   ```bash
   CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS        PORTS                    NAMES
   1322e42d833f   postgres:13       "docker-entrypoint.s…"   2 seconds ago   Up 1 second   0.0.0.0:5433->5432/tcp   integration-tests-prisma
   ```

> **Note**: The container id is unique to each container, you will see a different id displayed.

5. Using the container id from the previous step, run `psql` in the container, login with the created user and check the database is created:

   ```
   docker exec -it 1322e42d833f psql -U prisma tests
   ```

   ```bash
   tests=# \l
                                 List of databases
      Name    | Owner  | Encoding |  Collate   |   Ctype    | Access privileges

    postgres  | prisma | UTF8     | en_US.utf8 | en_US.utf8 |
    template0 | prisma | UTF8     | en_US.utf8 | en_US.utf8 | =c/prisma        +
              |        |          |            |            | prisma=CTc/prisma
    template1 | prisma | UTF8     | en_US.utf8 | en_US.utf8 | =c/prisma        +
              |        |          |            |            | prisma=CTc/prisma
    tests     | prisma | UTF8     | en_US.utf8 | en_US.utf8 |
   (4 rows)
   ```

Integration testing [#integration-testing]

Integration tests will be run against a database in a **dedicated test environment** instead of the production or development environments.

The flow of operations [#the-flow-of-operations]

The flow for running said tests goes as follows:

1. Start the container and create the database
2. Migrate the schema
3. Run the tests
4. Destroy the container

Each test suite will seed the database before all the test are run. After all the tests in the suite have finished, the data from all the tables will be dropped and the connection terminated.

The function to test [#the-function-to-test]

The ecommerce application you are testing has a function which creates an order. This function does the following:

* Accepts input about the customer making the order
* Accepts input about the product being ordered
* Checks if the customer has an existing account
* Checks if the product is in stock
* Returns an "Out of stock" message if the product doesn't exist
* Creates an account if the customer doesn't exist in the database
* Create the order

An example of how such a function might look can be seen below:

```ts title="create-order.ts"
import prisma from "../client";

export interface Customer {
  id?: number;
  name?: string;
  email: string;
  address?: string;
}

export interface OrderInput {
  customer: Customer;
  productId: number;
  quantity: number;
}

/**
 * Creates an order with customer.
 * @param input The order parameters
 */
export async function createOrder(input: OrderInput) {
  const { productId, quantity, customer } = input;
  const { name, email, address } = customer;

  // Get the product
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  // If the product is null its out of stock, return error.
  if (!product) return new Error("Out of stock");

  // If the customer is new then create the record, otherwise connect via their unique email
  await prisma.customerOrder.create({
    data: {
      customer: {
        connectOrCreate: {
          create: {
            name,
            email,
            address,
          },
          where: {
            email,
          },
        },
      },
      orderDetails: {
        create: {
          total: product.price,
          quantity,
          products: {
            connect: {
              id: product.id,
            },
          },
        },
      },
    },
  });
}
```

The test suite [#the-test-suite]

The following tests will check if the `createOrder` function works as it should do. They will test:

* Creating a new order with a new customer
* Creating an order with an existing customer
* Show an "Out of stock" error message if a product doesn't exist

Before the test suite is run the database is seeded with data. After the test suite has finished a [`deleteMany`](/orm/reference/prisma-client-reference#deletemany) is used to clear the database of its data.

<CalloutContainer type="info">
  <CalloutDescription>
    Using `deleteMany` may suffice in situations where you know ahead of time how your schema is structured. This is because the operations need to be executed in the correct order according to how the model relations are setup.

    However, this doesn't scale as well as having a more generic solution that maps over your models and performs a truncate on them. For those scenarios and examples of using raw SQL queries see [Deleting all data with raw SQL / `TRUNCATE`](/orm/prisma-client/queries/crud#deleting-all-data-with-raw-sql--truncate)
  </CalloutDescription>
</CalloutContainer>

```ts title="__tests__/create-order.ts"
import prisma from "../src/client";
import { createOrder, Customer, OrderInput } from "../src/functions/index";

beforeAll(async () => {
  // create product categories
  await prisma.category.createMany({
    data: [{ name: "Wand" }, { name: "Broomstick" }],
  });

  console.log("✨ 2 categories successfully created!");

  // create products
  await prisma.product.createMany({
    data: [
      {
        name: 'Holly, 11", phoenix feather',
        description: "Harry Potters wand",
        price: 100,
        sku: 1,
        categoryId: 1,
      },
      {
        name: "Nimbus 2000",
        description: "Harry Potters broom",
        price: 500,
        sku: 2,
        categoryId: 2,
      },
    ],
  });

  console.log("✨ 2 products successfully created!");

  // create the customer
  await prisma.customer.create({
    data: {
      name: "Harry Potter",
      email: "harry@hogwarts.io",
      address: "4 Privet Drive",
    },
  });

  console.log("✨ 1 customer successfully created!");
});

afterAll(async () => {
  const deleteOrderDetails = prisma.orderDetails.deleteMany();
  const deleteProduct = prisma.product.deleteMany();
  const deleteCategory = prisma.category.deleteMany();
  const deleteCustomerOrder = prisma.customerOrder.deleteMany();
  const deleteCustomer = prisma.customer.deleteMany();

  await prisma.$transaction([
    deleteOrderDetails,
    deleteProduct,
    deleteCategory,
    deleteCustomerOrder,
    deleteCustomer,
  ]);

  await prisma.$disconnect();
});

it("should create 1 new customer with 1 order", async () => {
  // The new customers details
  const customer: Customer = {
    id: 2,
    name: "Hermione Granger",
    email: "hermione@hogwarts.io",
    address: "2 Hampstead Heath",
  };
  // The new orders details
  const order: OrderInput = {
    customer,
    productId: 1,
    quantity: 1,
  };

  // Create the order and customer
  await createOrder(order);

  // Check if the new customer was created by filtering on unique email field
  const newCustomer = await prisma.customer.findUnique({
    where: {
      email: customer.email,
    },
  });

  // Check if the new order was created by filtering on unique email field of the customer
  const newOrder = await prisma.customerOrder.findFirst({
    where: {
      customer: {
        email: customer.email,
      },
    },
  });

  // Expect the new customer to have been created and match the input
  expect(newCustomer).toEqual(customer);
  // Expect the new order to have been created and contain the new customer
  expect(newOrder).toHaveProperty("customerId", 2);
});

it("should create 1 order with an existing customer", async () => {
  // The existing customers email
  const customer: Customer = {
    email: "harry@hogwarts.io",
  };
  // The new orders details
  const order: OrderInput = {
    customer,
    productId: 1,
    quantity: 1,
  };

  // Create the order and connect the existing customer
  await createOrder(order);

  // Check if the new order was created by filtering on unique email field of the customer
  const newOrder = await prisma.customerOrder.findFirst({
    where: {
      customer: {
        email: customer.email,
      },
    },
  });

  // Expect the new order to have been created and contain the existing customer with an id of 1 (Harry Potter from the seed script)
  expect(newOrder).toHaveProperty("customerId", 1);
});

it("should show 'Out of stock' message if productId doesn't exit", async () => {
  // The existing customers email
  const customer: Customer = {
    email: "harry@hogwarts.io",
  };
  // The new orders details
  const order: OrderInput = {
    customer,
    productId: 3,
    quantity: 1,
  };

  // The productId supplied doesn't exit so the function should return an "Out of stock" message
  await expect(createOrder(order)).resolves.toEqual(new Error("Out of stock"));
});
```

Running the tests [#running-the-tests]

This setup isolates a real world scenario so that you can test your applications functionality against real data in a controlled environment.

You can add some scripts to your projects `package.json` file which will setup the database and run the tests, then afterwards manually destroy the container.

<CalloutContainer type="warning">
  <CalloutDescription>
    If the test doesn't work for you, you'll need to ensure the test database is properly set up and ready, as explained in this [blog](https://www.prisma.io/blog/testing-series-3-aBUyF8nxAn#make-the-script-wait-until-the-database-server-is-ready).
  </CalloutDescription>
</CalloutContainer>

```json title="package.json"
  "scripts": {
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "test": "yarn docker:up && yarn prisma migrate deploy && jest -i"
  },
```

The `test` script does the following:

1. Runs `docker compose up -d` to create the container with the Postgres image and database.
2. Applies the migrations found in `./prisma/migrations/` directory to the database, this creates the tables in the container's database.
3. Executes the tests.

Once you are satisfied you can run `yarn docker:down` to destroy the container, its database and any test data.
