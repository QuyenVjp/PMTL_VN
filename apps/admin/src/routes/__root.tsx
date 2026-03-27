import { Suspense, lazy, type ComponentType } from "react";
import { createRootRoute, createRoute, Outlet, useLocation } from "@tanstack/react-router";

import { AdminShell } from "@/components/layout/admin-shell";
import { niemKinhRoutes } from "@/routes/noi-dung/niem-kinh/index.js";

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
const PostsPage = lazy(() => import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.PostsPage })));
const GuidesPage = lazy(() => import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.GuidesPage })));
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
const SutrasPage = lazy(() => import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SutrasPage })));
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
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.ModerationReportsPage })),
);
const ModerationCommentsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.ModerationCommentsPage })),
);
const UsersAdminPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.UsersAdminPage })),
);
const SessionsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SessionsPage })),
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

function RootLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const isAuthPage =
    pathname === "/auth/dang-nhap" || pathname === "/auth/quen-mat-khau";

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withSuspense(DashboardOverview),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: withSuspense(DashboardOverview),
});

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/bai-viet",
  component: withSuspense(PostsPage),
});

const guidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/huong-dan",
  component: withSuspense(GuidesPage),
});

const dailyPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/kinh-bai-tap",
  component: withSuspense(DailyPracticePage),
});

const littleHouseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/ngoi-nha-nho",
  component: withSuspense(LittleHousePage),
});

const lifeReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/phong-sanh",
  component: withSuspense(LifeReleasePage),
});

const mediaLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/thu-vien-phap-mon",
  component: withSuspense(MediaLibraryPage),
});

const downloadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/tai-lieu",
  component: withSuspense(DownloadsPage),
});

const sutrasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/kinh-sach",
  component: withSuspense(SutrasPage),
});

const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/media",
  component: withSuspense(MediaAssetsPage),
});

const communityPostsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cong-dong/bai-dang",
  component: withSuspense(CommunityPostsPage),
});

const guestbookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cong-dong/so-luu-niem",
  component: withSuspense(GuestbookPage),
});

const moderationReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kiem-duyet/bao-cao",
  component: withSuspense(ModerationReportsPage),
});

const moderationCommentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kiem-duyet/binh-luan",
  component: withSuspense(ModerationCommentsPage),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nguoi-dung",
  component: withSuspense(UsersAdminPage),
});

const sessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nguoi-dung/phien",
  component: withSuspense(SessionsPage),
});

const featureFlagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/feature-flags",
  component: withSuspense(FeatureFlagsPage),
});

const auditLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/audit-logs",
  component: withSuspense(AuditLogsPage),
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/lich",
  component: withSuspense(CalendarEventsPage),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/tim-kiem",
  component: withSuspense(SearchOpsPage),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/thong-bao",
  component: withSuspense(NotificationsPage),
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/phung-su-vien",
  component: withSuspense(VolunteersPage),
});

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/he-thong/health",
  component: withSuspense(HealthPage),
});

const assistedEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ho-tro/phat-nguyen/nhap-ho",
  component: withSuspense(AssistedEntryPage),
});

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

export const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  postsRoute,
  guidesRoute,
  dailyPracticeRoute,
  littleHouseRoute,
  lifeReleaseRoute,
  mediaLibraryRoute,
  downloadsRoute,
  sutrasRoute,
  mediaRoute,
  communityPostsRoute,
  guestbookRoute,
  moderationReportsRoute,
  moderationCommentsRoute,
  usersRoute,
  sessionsRoute,
  featureFlagsRoute,
  auditLogsRoute,
  calendarRoute,
  searchRoute,
  notificationsRoute,
  volunteersRoute,
  healthRoute,
  assistedEntryRoute,
  signInRoute,
  forgotPasswordRoute,
  niemKinhRoutes,
]);
