import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Categories } from "./collections/Categories";
import { Comments } from "./collections/Comments";
import { Events } from "./collections/Events";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";
import { Homepage } from "./globals/Homepage";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001",
  secret: process.env.PAYLOAD_SECRET ?? "replace-me",
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    process.env.CMS_PUBLIC_URL ?? "http://localhost:3001",
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    process.env.CMS_PUBLIC_URL ?? "http://localhost:3001",
  ],
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Posts, Comments, Events],
  globals: [SiteSettings, Navigation, Homepage],
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ?? "postgresql://pmtl:pmtl@localhost:5432/pmtl",
    },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
