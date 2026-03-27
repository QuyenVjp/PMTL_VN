/**
 * Route Tree — TanStack Router programmatic routing
 *
 * Constitution: design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md
 * - _authenticated layout: auth-protected routes with AdminShell
 * - Auth pages (sign-in, forgot-password) are public, outside _authenticated
 * - Route structure mirrors canon:
 *     routes/
 *     ├── _authenticated/  → dashboard, noi-dung, cong-dong, kiem-duyet, nguoi-dung, he-thong
 *     └── auth/            → sign-in, forgot-password
 */
import { Suspense, lazy, type ComponentType } from "react";
import { createRootRoute, createRoute, Outlet, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser } from "@/lib/auth";
import { niemKinhRoutes } from "@/routes/noi-dung/niem-kinh/index.js";

// ── Lazy page imports ────────────────────────────────────────────────

const SignInPage = lazy(() => import("@/features/auth/sign-in").then((mod) => ({ default: mod.SignInPage })));
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/forgot-password").then((mod) => ({ default: mod.ForgotPasswordPage })),
);
const DashboardOverview = lazy(() =>
  import("@/features/dashboard").then((mod) => ({ default: mod.DashboardOverview })),
);
const FeatureFlagsPage = lazy(() =>
  import("@/features/system/feature-flags-page").then((mod) => ({ default: mod.FeatureFlagsPage })),
);
const AuditLogsPage = lazy(() =>
  import("@/features/system/audit-logs-page").then((mod) => ({ default: mod.AuditLogsPage })),
);
const HealthPage = lazy(() =>
  import("@/features/system/health-page").then((mod) => ({ default: mod.HealthPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings").then((mod) => ({ default: mod.SettingsPage })),
);
const PostsPage = lazy(() => import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.PostsPage })));
const GuidesPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.GuidesPage })),
);
const DailyPracticePage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.DailyPracticePage })),
);
const LittleHousePage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.LittleHousePage })),
);
const LifeReleasePage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.LifeReleasePage })),
);
const MediaLibraryPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.MediaLibraryPage })),
);
const DownloadsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.DownloadsPage })),
);
const SutrasPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SutrasPage })),
);
const MediaAssetsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.MediaAssetsPage })),
);
const CommunityPostsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.CommunityPostsPage })),
);
const GuestbookPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.GuestbookPage })),
);
const ModerationReportsPage = lazy(() =>
  import("@/features/moderation-reports").then((mod) => ({ default: mod.ModerationReportsPage })),
);
const ModerationCommentsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.ModerationCommentsPage })),
);
const UsersPage = lazy(() => import("@/features/users").then((mod) => ({ default: mod.UsersPage })));
const SessionsPage = lazy(() =>
  import("@/features/sessions").then((mod) => ({ default: mod.SessionsPage })),
);
const CalendarEventsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.CalendarEventsPage })),
);
const SearchOpsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SearchOpsPage })),
);
const NotificationsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.NotificationsPage })),
);
const VolunteersPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.VolunteersPage })),
);
const AssistedEntryPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.AssistedEntryPage })),
);

// ── Helpers ──────────────────────────────────────────────────────────

function withSuspense(Component: ComponentType) {
  return function SuspendedRouteComponent() {
    return (
      <Suspense
        fallback={
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Đang tải workspace...
          </div>
        }
      >
        <Component />
      </Suspense>
    );
  };
}

// ── Root Route ───────────────────────────────────────────────────────

export const rootRoute = createRootRoute({
  component: Outlet,
});

// ── _authenticated Layout Route ──────────────────────────────────────
// Canon: routes/_authenticated/ — auth guard + AdminShell wrapper
// All protected routes are children of this layout route.

export const authenticatedRoute = createRoute({
  id: "_authenticated",
  getParentRoute: () => rootRoute,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
      throw redirect({ to: "/auth/dang-nhap" });
    }
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});

// ── Auth Routes (public — outside _authenticated) ────────────────────

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/dang-nhap",
  component: withSuspense(SignInPage),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/quen-mat-khau",
  component: withSuspense(ForgotPasswordPage),
});

// ── Protected Routes (children of _authenticated) ────────────────────

// Dashboard
const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  component: withSuspense(DashboardOverview),
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/dashboard",
  component: withSuspense(DashboardOverview),
});

// Nội dung (Content)
const postsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bai-viet",
  component: withSuspense(PostsPage),
});

const guidesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/huong-dan",
  component: withSuspense(GuidesPage),
});

const dailyPracticeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap",
  component: withSuspense(DailyPracticePage),
});

const littleHouseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/ngoi-nha-nho",
  component: withSuspense(LittleHousePage),
});

const lifeReleaseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh",
  component: withSuspense(LifeReleasePage),
});

const mediaLibraryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/thu-vien-phap-mon",
  component: withSuspense(MediaLibraryPage),
});

const downloadsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/tai-lieu",
  component: withSuspense(DownloadsPage),
});

const sutrasRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-sach",
  component: withSuspense(SutrasPage),
});

const mediaRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/media",
  component: withSuspense(MediaAssetsPage),
});

// Cộng đồng (Community)
const communityPostsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/cong-dong/bai-dang",
  component: withSuspense(CommunityPostsPage),
});

const guestbookRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/cong-dong/so-luu-niem",
  component: withSuspense(GuestbookPage),
});

// Kiểm duyệt (Moderation)
const moderationReportsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/bao-cao",
  component: withSuspense(ModerationReportsPage),
});

const moderationCommentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/binh-luan",
  component: withSuspense(ModerationCommentsPage),
});

// Người dùng (Users)
const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung",
  component: withSuspense(UsersPage),
});

const sessionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung/phien",
  component: withSuspense(SessionsPage),
});

// Hệ thống (System)
const featureFlagsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/feature-flags",
  component: withSuspense(FeatureFlagsPage),
});

const auditLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/audit-logs",
  component: withSuspense(AuditLogsPage),
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/cai-dat",
  component: withSuspense(SettingsPage),
});

const calendarRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/lich",
  component: withSuspense(CalendarEventsPage),
});

const searchRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/tim-kiem",
  component: withSuspense(SearchOpsPage),
});

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/thong-bao",
  component: withSuspense(NotificationsPage),
});

const volunteersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/phung-su-vien",
  component: withSuspense(VolunteersPage),
});

const healthRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/health",
  component: withSuspense(HealthPage),
});

// Hỗ trợ (Support)
const assistedEntryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/ho-tro/phat-nguyen/nhap-ho",
  component: withSuspense(AssistedEntryPage),
});

// ── Route Tree Assembly ──────────────────────────────────────────────

export const routeTree = rootRoute.addChildren([
  // Public auth routes
  signInRoute,
  forgotPasswordRoute,

  // Protected routes — all under _authenticated layout
  authenticatedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    // Nội dung
    postsRoute,
    guidesRoute,
    dailyPracticeRoute,
    littleHouseRoute,
    lifeReleaseRoute,
    mediaLibraryRoute,
    downloadsRoute,
    sutrasRoute,
    mediaRoute,
    niemKinhRoutes,
    // Cộng đồng
    communityPostsRoute,
    guestbookRoute,
    // Kiểm duyệt
    moderationReportsRoute,
    moderationCommentsRoute,
    // Người dùng
    usersRoute,
    sessionsRoute,
    // Hệ thống
    featureFlagsRoute,
    auditLogsRoute,
    settingsRoute,
    calendarRoute,
    searchRoute,
    notificationsRoute,
    volunteersRoute,
    healthRoute,
    // Hỗ trợ
    assistedEntryRoute,
  ]),
]);
