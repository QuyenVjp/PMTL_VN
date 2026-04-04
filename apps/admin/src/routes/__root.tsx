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
import { Toaster } from "sonner";

import { CommandMenu } from "@/components/command-menu";
import { NavigationProgress } from "@/components/navigation-progress";
import { SkipToMain } from "@/components/skip-to-main";

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
const UserDetailPage = lazy(() =>
  import("@/features/users/user-detail-page").then((mod) => ({ default: mod.UserDetailPage })),
);
const SessionsPage = lazy(() =>
  import("@/features/sessions").then((mod) => ({ default: mod.SessionsPage })),
);
const SessionDetailPage = lazy(() =>
  import("@/features/sessions/session-detail-page").then((mod) => ({ default: mod.SessionDetailPage })),
);
const CalendarEventsPage = lazy(() =>
  import("@/features/calendar").then((mod) => ({ default: mod.CalendarEventsPage })),
);
const SearchOpsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SearchOpsPage })),
);
const NotificationsPage = lazy(() =>
  import("@/features/notifications").then((mod) => ({ default: mod.NotificationsPage })),
);
const VolunteersPage = lazy(() =>
  import("@/features/volunteers").then((mod) => ({ default: mod.VolunteersPage })),
);
const ContactInfoPage = lazy(() =>
  import("@/features/contact-info").then((mod) => ({ default: mod.ContactInfoPage })),
);
const AssistedEntryPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.AssistedEntryPage })),
);
const SelfCultivationWorkspacePage = lazy(() =>
  import("@/features/self-cultivation").then((mod) => ({ default: mod.SelfCultivationWorkspacePage })),
);
const PracticeHomePracticeGuidePage = lazy(() =>
  import("@/features/practice-support-home-guide").then((mod) => ({ default: mod.PracticeHomePracticeGuidePage })),
);
const WisdomPage = lazy(() =>
  import("@/features/wisdom-baihoa").then((mod) => ({ default: mod.WisdomPage })),
);
const WisdomCreatePage = lazy(() =>
  import("@/features/wisdom-baihoa/create-page").then((mod) => ({ default: mod.WisdomCreatePage })),
);
const DesignSystemPage = lazy(() =>
  import("@/features/design-system").then((mod) => ({ default: mod.DesignSystemPage })),
);

// ── Detail / Create page imports ─────────────────────────────────────

const PostCreatePage = lazy(() =>
  import("@/features/content/post-create-page").then((mod) => ({ default: mod.PostCreatePage })),
);
const PostDetailPage = lazy(() =>
  import("@/features/content/post-detail-page").then((mod) => ({ default: mod.PostDetailPage })),
);
const GuestbookDetailPage = lazy(() =>
  import("@/features/guestbook/guestbook-detail-page").then((mod) => ({ default: mod.GuestbookDetailPage })),
);
const CommunityPostDetailPage = lazy(() =>
  import("@/features/community-posts/community-post-detail-page").then((mod) => ({ default: mod.CommunityPostDetailPage })),
);
const ReportDetailPage = lazy(() =>
  import("@/features/moderation-reports/report-detail-page").then((mod) => ({ default: mod.ReportDetailPage })),
);
const CommentDetailPage = lazy(() =>
  import("@/features/moderation-comments/comment-detail-page").then((mod) => ({ default: mod.CommentDetailPage })),
);
const VolunteerCreatePage = lazy(() =>
  import("@/features/volunteers/volunteer-create-page").then((mod) => ({ default: mod.VolunteerCreatePage })),
);
const VolunteerDetailPage = lazy(() =>
  import("@/features/volunteers/volunteer-detail-page").then((mod) => ({ default: mod.VolunteerDetailPage })),
);

// Guide detail/create wrappers — same component, different back-nav per category
const DailyPracticeGuideCreatePage = lazy(() =>
  import("@/features/guides/guide-create-page").then((mod) => ({
    default: () => <mod.GuideCreatePage backHref="/noi-dung/kinh-bai-tap" backLabel="Kinh Bài Tập" defaultCategory="DAILY_PRACTICE" />,
  })),
);
const DailyPracticeGuideDetailPage = lazy(() =>
  import("@/features/guides/guide-detail-page").then((mod) => ({
    default: () => <mod.GuideDetailPage backHref="/noi-dung/kinh-bai-tap" backLabel="Kinh Bài Tập" />,
  })),
);
const LittleHouseGuideCreatePage = lazy(() =>
  import("@/features/guides/guide-create-page").then((mod) => ({
    default: () => <mod.GuideCreatePage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" defaultCategory="LITTLE_HOUSE" />,
  })),
);
const LittleHouseGuideDetailPage = lazy(() =>
  import("@/features/guides/guide-detail-page").then((mod) => ({
    default: () => <mod.GuideDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" />,
  })),
);
const LifeReleaseGuideCreatePage = lazy(() =>
  import("@/features/guides/guide-create-page").then((mod) => ({
    default: () => <mod.GuideCreatePage backHref="/noi-dung/phong-sanh" backLabel="Phóng Sanh" defaultCategory="LIFE_RELEASE" />,
  })),
);
const LifeReleaseGuideDetailPage = lazy(() =>
  import("@/features/guides/guide-detail-page").then((mod) => ({
    default: () => <mod.GuideDetailPage backHref="/noi-dung/phong-sanh" backLabel="Phóng Sanh" />,
  })),
);
const SutraDownloadCreatePage = lazy(() =>
  import("@/features/downloads/download-create-page").then((mod) => ({
    default: () => <mod.DownloadCreatePage backHref="/noi-dung/kinh-sach" backLabel="Kinh sách" defaultCategory="REFERENCE" />,
  })),
);
const SutraDownloadDetailPage = lazy(() =>
  import("@/features/downloads/download-detail-page").then((mod) => ({
    default: () => <mod.DownloadDetailPage backHref="/noi-dung/kinh-sach" backLabel="Kinh sách" />,
  })),
);

// Base-route wrappers for Guides + Downloads (same component, different back-nav)
const HuongDanGuideCreatePage = lazy(() =>
  import("@/features/guides/guide-create-page").then((mod) => ({
    default: () => <mod.GuideCreatePage backHref="/noi-dung/huong-dan" backLabel="Hướng dẫn" />,
  })),
);
const HuongDanGuideDetailPage = lazy(() =>
  import("@/features/guides/guide-detail-page").then((mod) => ({
    default: () => <mod.GuideDetailPage backHref="/noi-dung/huong-dan" backLabel="Hướng dẫn" />,
  })),
);
const TaiLieuDownloadCreatePage = lazy(() =>
  import("@/features/downloads/download-create-page").then((mod) => ({
    default: () => <mod.DownloadCreatePage backHref="/noi-dung/tai-lieu" backLabel="Tài liệu" />,
  })),
);
const TaiLieuDownloadDetailPage = lazy(() =>
  import("@/features/downloads/download-detail-page").then((mod) => ({
    default: () => <mod.DownloadDetailPage backHref="/noi-dung/tai-lieu" backLabel="Tài liệu" />,
  })),
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
  component: () => (
    <>
      <SkipToMain />
      <NavigationProgress />
      <Outlet />
      <CommandMenu />
      <Toaster richColors position="top-center" />
    </>
  ),
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
const postsCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bai-viet/tao-moi",
  component: withSuspense(PostCreatePage),
});
const postsDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bai-viet/$publicId",
  component: withSuspense(PostDetailPage),
});

const guidesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/huong-dan",
  component: withSuspense(GuidesPage),
});
const guidesCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/huong-dan/tao-moi",
  component: withSuspense(HuongDanGuideCreatePage),
});
const guidesDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/huong-dan/$publicId",
  component: withSuspense(HuongDanGuideDetailPage),
});

const dailyPracticeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap",
  component: withSuspense(DailyPracticePage),
});
const dailyPracticeCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/tao-moi",
  component: withSuspense(DailyPracticeGuideCreatePage),
});
const dailyPracticeDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/$publicId",
  component: withSuspense(DailyPracticeGuideDetailPage),
});

const littleHouseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/ngoi-nha-nho",
  component: withSuspense(LittleHousePage),
});
const littleHouseCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/ngoi-nha-nho/tao-moi",
  component: withSuspense(LittleHouseGuideCreatePage),
});
const littleHouseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/ngoi-nha-nho/$publicId",
  component: withSuspense(LittleHouseGuideDetailPage),
});

const lifeReleaseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh",
  component: withSuspense(LifeReleasePage),
});
const lifeReleaseCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh/tao-moi",
  component: withSuspense(LifeReleaseGuideCreatePage),
});
const lifeReleaseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh/$publicId",
  component: withSuspense(LifeReleaseGuideDetailPage),
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
const downloadsCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/tai-lieu/tao-moi",
  component: withSuspense(TaiLieuDownloadCreatePage),
});
const downloadsDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/tai-lieu/$publicId",
  component: withSuspense(TaiLieuDownloadDetailPage),
});

const sutrasRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-sach",
  component: withSuspense(SutrasPage),
});
const sutrasCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-sach/tao-moi",
  component: withSuspense(SutraDownloadCreatePage),
});
const sutrasDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-sach/$publicId",
  component: withSuspense(SutraDownloadDetailPage),
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
const communityPostDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/cong-dong/bai-dang/$publicId",
  component: withSuspense(CommunityPostDetailPage),
});

const guestbookRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/cong-dong/so-luu-niem",
  component: withSuspense(GuestbookPage),
});
const guestbookDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/cong-dong/so-luu-niem/$publicId",
  component: withSuspense(GuestbookDetailPage),
});

// Kiểm duyệt (Moderation)
const moderationReportsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/bao-cao",
  component: withSuspense(ModerationReportsPage),
});
const moderationReportDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/bao-cao/$publicId",
  component: withSuspense(ReportDetailPage),
});

const moderationCommentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/binh-luan",
  component: withSuspense(ModerationCommentsPage),
});
const moderationCommentDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/kiem-duyet/binh-luan/$publicId",
  component: withSuspense(CommentDetailPage),
});

// Người dùng (Users)
const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung",
  component: withSuspense(UsersPage),
});

const userDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung/$publicId",
  component: withSuspense(UserDetailPage),
});

const sessionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung/phien",
  component: withSuspense(SessionsPage),
});

const sessionDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/nguoi-dung/phien/$sessionId",
  component: withSuspense(SessionDetailPage),
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
const volunteersCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/phung-su-vien/tao-moi",
  component: withSuspense(VolunteerCreatePage),
});
const volunteersDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/phung-su-vien/$publicId",
  component: withSuspense(VolunteerDetailPage),
});

const contactInfoRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/thong-tin-lien-he",
  component: withSuspense(ContactInfoPage),
});

const healthRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/health",
  component: withSuspense(HealthPage),
});

const designSystemRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/design-system",
  component: withSuspense(DesignSystemPage),
});

// System landing (canon)
const systemRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong",
  component: withSuspense(SettingsPage),
});

// Calendar detail workspace alias (canon compatibility)
const calendarDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/he-thong/lich/$eventId",
  component: withSuspense(CalendarEventsPage),
});

// Hỗ trợ (Support)
const assistedEntryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/ho-tro/phat-nguyen/nhap-ho",
  component: withSuspense(AssistedEntryPage),
});

const practiceHomeGuideRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-van-tu-tu",
  component: withSuspense(SelfCultivationWorkspacePage),
});

// Legacy alias for old tu-tai-gia guide page kept only for bookmarked draft review
const practiceHomeGuideLegacyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/tu-tu-tai-gia",
  component: withSuspense(PracticeHomePracticeGuidePage),
});

// Bạch thoại Phật pháp
const wisdomRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bach-thoai",
  component: withSuspense(WisdomPage),
});
const wisdomCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bach-thoai/tao-moi",
  component: withSuspense(WisdomCreatePage),
});

// Legacy alias for old bookmarked route
const wisdomLegacyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/tri-tue",
  component: withSuspense(WisdomPage),
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
    // Nội dung — static (tao-moi) before dynamic ($publicId)
    postsRoute,
    postsCreateRoute,
    postsDetailRoute,
    guidesRoute,
    guidesCreateRoute,
    guidesDetailRoute,
    dailyPracticeRoute,
    dailyPracticeCreateRoute,
    dailyPracticeDetailRoute,
    littleHouseRoute,
    littleHouseCreateRoute,
    littleHouseDetailRoute,
    lifeReleaseRoute,
    lifeReleaseCreateRoute,
    lifeReleaseDetailRoute,
    mediaLibraryRoute,
    downloadsRoute,
    downloadsCreateRoute,
    downloadsDetailRoute,
    sutrasRoute,
    sutrasCreateRoute,
    sutrasDetailRoute,
    mediaRoute,
    niemKinhRoutes,
    practiceHomeGuideRoute,
    practiceHomeGuideLegacyRoute,
    // Cộng đồng
    communityPostsRoute,
    communityPostDetailRoute,
    guestbookRoute,
    guestbookDetailRoute,
    // Kiểm duyệt
    moderationReportsRoute,
    moderationReportDetailRoute,
    moderationCommentsRoute,
    moderationCommentDetailRoute,
    // Người dùng
    usersRoute,
    userDetailRoute,
    sessionsRoute,
    sessionDetailRoute,
    // Hệ thống
    featureFlagsRoute,
    auditLogsRoute,
    settingsRoute,
    systemRoute,
    calendarRoute,
    calendarDetailRoute,
    searchRoute,
    notificationsRoute,
    volunteersRoute,
    volunteersCreateRoute,
    volunteersDetailRoute,
    contactInfoRoute,
    healthRoute,
    designSystemRoute,
    // Hỗ trợ
    assistedEntryRoute,
    // Bạch thoại Phật pháp
    wisdomRoute,
    wisdomCreateRoute,
    wisdomLegacyRoute,
  ]),
]);
