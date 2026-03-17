import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { vi } from "@payloadcms/translations/languages/vi";
import { buildConfig } from "payload";
import sharp from "sharp";

import { t } from "./admin/i18n";
import { AuditLogs } from "./collections/AuditLogs";
import { BeginnerGuides } from "./collections/BeginnerGuides";
import { Categories } from "./collections/Categories";
import { ChantItems } from "./collections/ChantItems";
import { ChantPlans } from "./collections/ChantPlans";
import { ChantPreferences } from "./collections/ChantPreferences";
import { CommunityComments } from "./collections/CommunityComments";
import { CommunityPosts } from "./collections/CommunityPosts";
import { Downloads } from "./collections/Downloads";
import { Events } from "./collections/Events";
import { GuestbookEntries } from "./collections/GuestbookEntries";
import { HubPages } from "./collections/HubPages";
import { LunarEventOverrides } from "./collections/LunarEventOverrides";
import { LunarEvents } from "./collections/LunarEvents";
import { Media } from "./collections/Media";
import { ModerationReports } from "./collections/ModerationReports";
import { PostComments } from "./collections/PostComments";
import { Posts } from "./collections/Posts";
import { PracticeLogs } from "./collections/PracticeLogs";
import { PushJobs } from "./collections/PushJobs";
import { PushSubscriptions } from "./collections/PushSubscriptions";
import { RequestGuards } from "./collections/RequestGuards";
import { SutraBookmarks } from "./collections/SutraBookmarks";
import { SutraChapters } from "./collections/SutraChapters";
import { SutraGlossary } from "./collections/SutraGlossary";
import { SutraReadingProgress } from "./collections/SutraReadingProgress";
import { SutraVolumes } from "./collections/SutraVolumes";
import { Sutras } from "./collections/Sutras";
import { Tags } from "./collections/Tags";
import { Users } from "./collections/Users";
import { ChantingSettings } from "./globals/ChantingSettings";
import { Homepage } from "./globals/Homepage";
import { Navigation } from "./globals/Navigation";
import { SidebarConfig } from "./globals/SidebarConfig";
import { SiteSettings } from "./globals/SiteSettings";
import { cmsJobTasks } from "./jobs";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const postgresHostPort = process.env.POSTGRES_HOST_PORT ?? "55432";
const defaultDatabaseUrl = `postgresql://pmtl:pmtl@localhost:${postgresHostPort}/pmtl`;
const shouldPushDb = process.env.PAYLOAD_DB_PUSH === "true";
const isDevelopment = process.env.NODE_ENV !== "production";

function parseIntEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function adminComponent(relativePath: string, exportName: string) {
  return {
    exportName,
    path: `/${relativePath.replace(/\\/g, "/")}`,
  };
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001",
  routes: {
    admin: "/admin",
    api: "/api",
  },
  secret: process.env.PAYLOAD_SECRET ?? "replace-me",
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    process.env.CMS_PUBLIC_URL ?? "http://localhost:3001",
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    process.env.CMS_PUBLIC_URL ?? "http://localhost:3001",
  ],
  i18n: {
    fallbackLanguage: "vi",
    supportedLanguages: {
      en,
      vi,
    },
  },
  admin: {
    components: {
      graphics: {
        Icon: adminComponent("admin/components/BrandIcon.tsx", "BrandIcon"),
        Logo: adminComponent("admin/components/BrandLogo.tsx", "BrandLogo"),
      },
    },
    suppressHydrationWarning: true,
    theme: "dark",
    importMap: {
      baseDir: dirname,
    },
    meta: {
      icons: {
        icon: "/favicon.png",
      },
      titleSuffix: " | PMTL CMS",
    },
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Categories,
    Tags,
    Posts,
    PostComments,
    Events,
    BeginnerGuides,
    Downloads,
    HubPages,
    CommunityPosts,
    CommunityComments,
    GuestbookEntries,
    ChantItems,
    ChantPlans,
    LunarEvents,
    LunarEventOverrides,
    ChantPreferences,
    PracticeLogs,
    Sutras,
    SutraVolumes,
    SutraChapters,
    SutraGlossary,
    SutraBookmarks,
    SutraReadingProgress,
    PushSubscriptions,
    PushJobs,
    RequestGuards,
    ModerationReports,
    AuditLogs,
  ],
  globals: [SiteSettings, Navigation, Homepage, SidebarConfig, ChantingSettings],
  jobs: {
    access: {
      cancel: () => true,
      queue: () => true,
      run: () => true,
    },
    deleteJobOnComplete: false,
    enableConcurrencyControl: true,
    tasks: cmsJobTasks,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
      max: parseIntEnv("PAYLOAD_DB_POOL_MAX", isDevelopment ? 6 : 20),
      min: parseIntEnv("PAYLOAD_DB_POOL_MIN", 0),
      idleTimeoutMillis: parseIntEnv("PAYLOAD_DB_POOL_IDLE_TIMEOUT_MS", 30000),
      connectionTimeoutMillis: parseIntEnv("PAYLOAD_DB_POOL_CONN_TIMEOUT_MS", 10000),
    },
    push: shouldPushDb,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
