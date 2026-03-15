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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const postgresHostPort = process.env.POSTGRES_HOST_PORT ?? "55432";
const defaultDatabaseUrl = `postgresql://pmtl:pmtl@localhost:${postgresHostPort}/pmtl`;
const shouldPushDb =
  process.env.PAYLOAD_DB_PUSH === "true" ||
  (process.env.PAYLOAD_DB_PUSH == null && process.env.NODE_ENV !== "production");

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
      beforeDashboard: [adminComponent("admin/components/DashboardIntro.tsx", "DashboardIntro")],
      graphics: {
        Icon: adminComponent("admin/components/BrandIcon.tsx", "BrandIcon"),
        Logo: adminComponent("admin/components/BrandLogo.tsx", "BrandLogo"),
      },
    },
    dashboard: {
      defaultLayout: [
        {
          widgetSlug: "content-overview",
          width: "large",
        },
        {
          widgetSlug: "editor-shortcuts",
          width: "medium",
        },
        {
          widgetSlug: "search-status",
          width: "large",
        },
      ],
      widgets: [
        {
          Component: adminComponent("admin/widgets/ContentStatsWidget.tsx", "ContentStatsWidget"),
          label: t("Tổng quan nội dung", "Content overview"),
          slug: "content-overview",
        },
        {
          Component: adminComponent("admin/widgets/QuickLinksWidget.tsx", "QuickLinksWidget"),
          label: t("Đường dẫn nhanh", "Quick links"),
          slug: "editor-shortcuts",
        },
        {
          Component: adminComponent("admin/widgets/SearchStatusWidget.tsx", "SearchStatusWidget"),
          label: t("Trạng thái search", "Search status"),
          slug: "search-status",
        },
      ],
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    },
    push: shouldPushDb,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
