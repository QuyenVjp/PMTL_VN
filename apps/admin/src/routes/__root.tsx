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
import { WorkspaceRouteSkeleton } from "@/components/workspace";
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
const MediaLibraryCreatePage = lazy(() =>
  import("@/features/media-library").then((mod) => ({ default: mod.MediaLibraryCreatePage })),
);
const MediaLibraryDetailPage = lazy(() =>
  import("@/features/media-library").then((mod) => ({ default: mod.MediaLibraryDetailPage })),
);
const DownloadsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.DownloadsPage })),
);
const SutrasPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.SutrasPage })),
);
const ImageAssetsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.ImageAssetsPage })),
);
const VideoAssetsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.VideoAssetsPage })),
);
const DocumentAssetsPage = lazy(() =>
  import("@/features/workspaces/module-pages").then((mod) => ({ default: mod.DocumentAssetsPage })),
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
const SelfCultivationGuideCreatePage = lazy(() =>
  import("@/features/self-cultivation").then((mod) => ({ default: mod.SelfCultivationGuideCreatePage })),
);
const SelfCultivationGuideDetailPage = lazy(() =>
  import("@/features/self-cultivation").then((mod) => ({ default: mod.SelfCultivationGuideDetailPage })),
);
const SelfCultivationFaqCreatePage = lazy(() =>
  import("@/features/self-cultivation").then((mod) => ({ default: mod.SelfCultivationFaqCreatePage })),
);
const SelfCultivationFaqDetailPage = lazy(() =>
  import("@/features/self-cultivation").then((mod) => ({ default: mod.SelfCultivationFaqDetailPage })),
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
const WisdomDetailPage = lazy(() =>
  import("@/features/wisdom-baihoa/detail-page").then((mod) => ({ default: mod.WisdomDetailPage })),
);
const DesignSystemPage = lazy(() =>
  import("@/features/design-system").then((mod) => ({ default: mod.DesignSystemPage })),
);

// ── Thanh Tịnh Pháp — new domain pages ──────────────────────────────
const CharitiesPage = lazy(() =>
  import("@/features/dharma-compliance").then((mod) => ({ default: mod.CharitiesPage })),
);
const FraudAlertsPage = lazy(() =>
  import("@/features/dharma-compliance").then((mod) => ({ default: mod.FraudAlertsPage })),
);
const CharityCreatePage = lazy(() =>
  import("@/features/dharma-compliance").then((mod) => ({ default: mod.CharityCreatePage })),
);
const CharityDetailPage = lazy(() =>
  import("@/features/dharma-compliance").then((mod) => ({ default: mod.CharityDetailPage })),
);
const EventsListPage = lazy(() =>
  import("@/features/events").then((mod) => ({ default: mod.EventsListPage })),
);
const EventCreatePage = lazy(() =>
  import("@/features/events").then((mod) => ({ default: mod.EventCreatePage })),
);
const EventDetailPage = lazy(() =>
  import("@/features/events").then((mod) => ({ default: mod.EventDetailPage })),
);
const LifeReleaseListPage = lazy(() =>
  import("@/features/life-liberation").then((mod) => ({ default: mod.LifeReleaseListPage })),
);
const SpeciesSummaryPage = lazy(() =>
  import("@/features/life-liberation").then((mod) => ({ default: mod.SpeciesSummaryPage })),
);
const SacredFormTemplatesPage = lazy(() =>
  import("@/features/sacred-forms").then((mod) => ({ default: mod.SacredFormTemplatesPage })),
);
const SacredFormApplicantsPage = lazy(() =>
  import("@/features/sacred-forms").then((mod) => ({ default: mod.SacredFormApplicantsPage })),
);
const DisposalPolarityPage = lazy(() =>
  import("@/features/sacred-forms/disposal-polarity-page").then((mod) => ({ default: mod.DisposalPolarityPage })),
);
const LhRecordsPage = lazy(() =>
  import("@/features/little-house").then((mod) => ({ default: mod.LhRecordsPage })),
);
const LhFraudQueuePage = lazy(() =>
  import("@/features/little-house").then((mod) => ({ default: mod.LhFraudQueuePage })),
);
const AltarItemsPage = lazy(() =>
  import("@/features/altar-management").then((mod) => ({ default: mod.AltarItemsPage })),
);
const ValidationLogsPage = lazy(() =>
  import("@/features/altar-management").then((mod) => ({ default: mod.ValidationLogsPage })),
);
const AltarProceduresPage = lazy(() =>
  import("@/features/altar-management").then((mod) => ({ default: mod.AltarProceduresPage })),
);

// ── Detail / Create page imports ─────────────────────────────────────

const PostCreatePage = lazy(() =>
  import("@/features/content/post-create-page").then((mod) => ({ default: mod.PostCreatePage })),
);
const PostDetailPage = lazy(() =>
  import("@/features/content/post-detail-page").then((mod) => ({ default: mod.PostDetailPage })),
);
const DailyPracticeGuideCreatePage = lazy(() =>
  import("@/features/daily-recitation/guide-pages").then((mod) => ({ default: mod.DailyPracticeGuideCreatePage })),
);
const DailyPracticeGuideDetailPage = lazy(() =>
  import("@/features/daily-recitation/guide-pages").then((mod) => ({ default: mod.DailyPracticeGuideDetailPage })),
);
const DailyPracticePresetCreatePage = lazy(() =>
  import("@/features/daily-recitation/preset-pages").then((mod) => ({ default: mod.DailyPracticePresetCreatePage })),
);
const DailyPracticePresetDetailPage = lazy(() =>
  import("@/features/daily-recitation/preset-pages").then((mod) => ({ default: mod.DailyPracticePresetDetailPage })),
);
const DailyPracticeFaqCreatePage = lazy(() =>
  import("@/features/daily-recitation/faq-pages").then((mod) => ({ default: mod.DailyPracticeFaqCreatePage })),
);
const DailyPracticeFaqDetailPage = lazy(() =>
  import("@/features/daily-recitation/faq-pages").then((mod) => ({ default: mod.DailyPracticeFaqDetailPage })),
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

const SutraDownloadCreatePage = lazy(() =>
  import("@/features/downloads/download-create-page").then((mod) => ({
    default: () => (
      <mod.DownloadCreatePage
        backHref="/noi-dung/kinh-sach"
        backLabel="Kinh sách"
        defaultCategory="REFERENCE"
        pageTitle="Thêm kinh sách"
        sectionTitle="Thông tin kinh sách"
        descriptionPlaceholder="Mô tả ngắn về kinh sách..."
        categoryLabel="Loại nội dung"
        lockCategory
        lockedCategoryLabel="Kinh sách"
      />
    ),
  })),
);
const SutraDownloadDetailPage = lazy(() =>
  import("@/features/downloads/download-detail-page").then((mod) => ({
    default: () => (
      <mod.DownloadDetailPage
        backHref="/noi-dung/kinh-sach"
        backLabel="Kinh sách"
        emptyStateLabel="kinh sách"
        sectionTitle="Thông tin kinh sách"
        descriptionPlaceholder="Mô tả ngắn về kinh sách..."
        categoryLabel="Loại nội dung"
        lockCategory
        lockedCategoryLabel="Kinh sách"
      />
    ),
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
      <Suspense fallback={<WorkspaceRouteSkeleton />}>
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
const dailyPracticePresetCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/kich-ban/tao-moi",
  component: withSuspense(DailyPracticePresetCreatePage),
});
const dailyPracticePresetDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/kich-ban/$publicId",
  component: withSuspense(DailyPracticePresetDetailPage),
});
const dailyPracticeFaqCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/hoi-dap/tao-moi",
  component: withSuspense(DailyPracticeFaqCreatePage),
});
const dailyPracticeFaqDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-bai-tap/hoi-dap/$publicId",
  component: withSuspense(DailyPracticeFaqDetailPage),
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
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/noi-dung/ngoi-nha-nho" });
  },
});
const littleHouseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/ngoi-nha-nho/$publicId",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/noi-dung/ngoi-nha-nho" });
  },
});

const lifeReleaseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh",
  component: withSuspense(LifeReleasePage),
});
const lifeReleaseCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh/tao-moi",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/noi-dung/phong-sanh" });
  },
});
const lifeReleaseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/phong-sanh/$publicId",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/noi-dung/phong-sanh" });
  },
});

const mediaLibraryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/thu-vien-phap-mon",
  component: withSuspense(MediaLibraryPage),
});
const mediaLibraryCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/thu-vien-phap-mon/tao-moi",
  component: withSuspense(MediaLibraryCreatePage),
});
const mediaLibraryDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/thu-vien-phap-mon/$publicId",
  component: withSuspense(MediaLibraryDetailPage),
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
  component: withSuspense(ImageAssetsPage),
});
const imageAssetsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/anh",
  component: withSuspense(ImageAssetsPage),
});
const videoAssetsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/video",
  component: withSuspense(VideoAssetsPage),
});
const documentAssetsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/tep-tai-lieu",
  component: withSuspense(DocumentAssetsPage),
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
const selfCultivationGuideCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-van-tu-tu/huong-dan/tao-moi",
  component: withSuspense(SelfCultivationGuideCreatePage),
});
const selfCultivationGuideDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-van-tu-tu/huong-dan/$guidePublicId",
  component: withSuspense(SelfCultivationGuideDetailPage),
});
const selfCultivationFaqCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-van-tu-tu/hoi-dap/tao-moi",
  component: withSuspense(SelfCultivationFaqCreatePage),
});
const selfCultivationFaqDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/kinh-van-tu-tu/hoi-dap/$faqPublicId",
  component: withSuspense(SelfCultivationFaqDetailPage),
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
const wisdomDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/bach-thoai/$publicId",
  component: withSuspense(WisdomDetailPage),
});

// Legacy alias for old bookmarked route
const wisdomLegacyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/tri-tue",
  component: withSuspense(WisdomPage),
});

// ── Thanh Tịnh Pháp — Tuân thủ Pháp luật ───────────────────────────
const charitiesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/to-chuc-tu-thien",
  component: withSuspense(CharitiesPage),
});
const charityCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/to-chuc-tu-thien/tao-moi",
  component: withSuspense(CharityCreatePage),
});
const charityDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/to-chuc-tu-thien/$charityId",
  component: withSuspense(CharityDetailPage),
});
const fraudAlertsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/canh-bao-gian-lan",
  component: withSuspense(FraudAlertsPage),
});
const purityVowsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/loi-nguyen-thanh-tu",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/phap-luat/canh-bao-gian-lan" });
  },
});
const guidanceQueueRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phap-luat/hang-doi-huong-dan",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/phap-luat/canh-bao-gian-lan" });
  },
});

// ── Thanh Tịnh Pháp — Sự kiện Phật pháp ────────────────────────────
const eventsListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/su-kien/danh-sach",
  component: withSuspense(EventsListPage),
});
const eventsCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/su-kien/danh-sach/tao-moi",
  component: withSuspense(EventCreatePage),
});
const eventsCreateLegacyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/su-kien/tao-moi",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect pattern
    throw redirect({ to: "/su-kien/danh-sach/tao-moi" });
  },
});
const eventsDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/su-kien/danh-sach/$publicId",
  component: withSuspense(EventDetailPage),
});

// ── Thanh Tịnh Pháp — Phóng sinh ────────────────────────────────────
const lifeReleaseListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phong-sinh/ho-so",
  component: withSuspense(LifeReleaseListPage),
});
const speciesSummaryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/phong-sinh/thong-ke",
  component: withSuspense(SpeciesSummaryPage),
});

// ── Thanh Tịnh Pháp — Đơn Pháp Bảo ─────────────────────────────────
const sacredFormTemplatesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/don-phap-bao/mau-don",
  component: withSuspense(SacredFormTemplatesPage),
});
const sacredFormApplicantsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/don-phap-bao/don-dang-ky",
  component: withSuspense(SacredFormApplicantsPage),
});
const disposalPolarityRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/don-phap-bao/quy-tac-xu-ly",
  component: withSuspense(DisposalPolarityPage),
});

// ── Thanh Tịnh Pháp — Sớ (Ngôi Nhà Nhỏ) ────────────────────────────
const lhRecordsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/so/danh-sach",
  component: withSuspense(LhRecordsPage),
});
const lhFraudQueueRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/so/gian-lan",
  component: withSuspense(LhFraudQueuePage),
});

// ── Thanh Tịnh Pháp — Bàn thờ ───────────────────────────────────────
const altarItemsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/ban-tho/vat-pham",
  component: withSuspense(AltarItemsPage),
});
const validationLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/ban-tho/nhat-ky",
  component: withSuspense(ValidationLogsPage),
});
const altarProceduresRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/ban-tho/quy-trinh",
  component: withSuspense(AltarProceduresPage),
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
    dailyPracticePresetCreateRoute,
    dailyPracticePresetDetailRoute,
    dailyPracticeFaqCreateRoute,
    dailyPracticeFaqDetailRoute,
    dailyPracticeDetailRoute,
    littleHouseRoute,
    littleHouseCreateRoute,
    littleHouseDetailRoute,
    lifeReleaseRoute,
    lifeReleaseCreateRoute,
    lifeReleaseDetailRoute,
    mediaLibraryRoute,
    mediaLibraryCreateRoute,
    mediaLibraryDetailRoute,
    downloadsRoute,
    downloadsCreateRoute,
    downloadsDetailRoute,
    sutrasRoute,
    sutrasCreateRoute,
    sutrasDetailRoute,
    mediaRoute,
    imageAssetsRoute,
    videoAssetsRoute,
    documentAssetsRoute,
    niemKinhRoutes,
    practiceHomeGuideRoute,
    selfCultivationGuideCreateRoute,
    selfCultivationGuideDetailRoute,
    selfCultivationFaqCreateRoute,
    selfCultivationFaqDetailRoute,
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
    wisdomDetailRoute,
    wisdomLegacyRoute,
    // Thanh Tịnh Pháp — Tuân thủ Pháp luật
    charitiesRoute,
    charityCreateRoute,
    charityDetailRoute,
    fraudAlertsRoute,
    purityVowsRoute,
    guidanceQueueRoute,
    // Thanh Tịnh Pháp — Sự kiện Phật pháp (static before dynamic)
    eventsListRoute,
    eventsCreateRoute,
    eventsCreateLegacyRoute,
    eventsDetailRoute,
    // Thanh Tịnh Pháp — Phóng sinh
    lifeReleaseListRoute,
    speciesSummaryRoute,
    // Thanh Tịnh Pháp — Đơn Pháp Bảo
    sacredFormTemplatesRoute,
    sacredFormApplicantsRoute,
    disposalPolarityRoute,
    // Thanh Tịnh Pháp — Sớ (Ngôi Nhà Nhỏ)
    lhRecordsRoute,
    lhFraudQueueRoute,
    // Thanh Tịnh Pháp — Bàn thờ
    altarItemsRoute,
    validationLogsRoute,
    altarProceduresRoute,
  ]),
]);
