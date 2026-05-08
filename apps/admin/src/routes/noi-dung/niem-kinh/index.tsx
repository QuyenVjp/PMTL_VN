import { createRoute, Link, Outlet } from "@tanstack/react-router";

import { EnvironmentRulesTable } from "@/features/chant-admin/environment-rules-table";
import {
  RecitationGuidelinesTablePage,
  RecitationRoutinesTablePage,
  RecitationSchedulesTablePage,
} from "@/features/daily-recitation/admin-tables";
import { DailyRecitationWorkspace } from "@/features/daily-recitation/index.js";
import { SpiritualApplicationsTab } from "@/features/daily-recitation/spiritual-applications-tab.js";
import { authenticatedRoute } from "@/routes/__root.js";

type WorkspaceTab = {
  path: string;
  label: string;
  description: string;
  disabled?: boolean;
};

const TABS: WorkspaceTab[] = [
  {
    path: "/noi-dung/niem-kinh/ban-kinh",
    label: "Bản kinh",
    description: "Bản tụng, audio companion, trạng thái xuất bản.",
  },
  {
    path: "/noi-dung/niem-kinh/nghi-thuc",
    label: "Nghi thức",
    description: "Ritual template, khấn nguyện, flow nhiều bước.",
  },
  {
    path: "/noi-dung/niem-kinh/ke-hoach",
    label: "Kế hoạch",
    description: "Chant plan, milestone, bối cảnh thực hành.",
  },
  {
    path: "/noi-dung/niem-kinh/moi-truong-thoi-gian",
    label: "Môi trường & thời gian",
    description: "Rule thời gian, địa điểm, trạng thái thân tâm.",
  },
  {
    path: "/noi-dung/niem-kinh/kinh-bai-tap-hang-ngay",
    label: "Kinh bài tập hàng ngày",
    description: "Bài kinh, bài chú, phác đồ tu học, luồng 7 bước.",
  },
  {
    path: "/noi-dung/niem-kinh/don-tu-tam-linh",
    label: "Đơn từ tâm linh",
    description: "Đơn giấy vàng, nghi thức sử dụng, burn rules.",
  },
];

export const niemKinhWorkspaceRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/noi-dung/niem-kinh",
  component: NiemKinhWorkspace,
});

export const environmentRulesTabRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/moi-truong-thoi-gian",
  component: EnvironmentRulesTable,
});

const banKinhRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/ban-kinh",
  component: RecitationGuidelinesTablePage,
});

const nghiThucRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/nghi-thuc",
  component: RecitationRoutinesTablePage,
});

const keHoachRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/ke-hoach",
  component: RecitationSchedulesTablePage,
});

const dailyRecitationRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/kinh-bai-tap-hang-ngay",
  component: DailyRecitationWorkspace,
});

const spiritualApplicationsRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/don-tu-tam-linh",
  component: SpiritualApplicationsTab,
});

export const niemKinhIndexRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/",
  component: () => (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">6 khu quản lý đang hoạt động</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Mở trực tiếp khu cần xử lý để cập nhật bản ghi, trạng thái xuất bản và rule vận hành.
      </p>
    </div>
  ),
});

function WorkspaceTabLink({ tab }: { tab: WorkspaceTab }) {
  return (
    <Link
      to={tab.path}
      activeOptions={{ exact: true }}
      activeProps={{
        className:
          "rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-primary shadow-sm",
      }}
      inactiveProps={{
        className:
          "rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors hover:border-primary/30 hover:bg-accent/60",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{tab.label}</p>
        <span className="text-xs font-medium text-primary">Mở</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tab.description}</p>
    </Link>
  );
}

function NiemKinhWorkspace() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Nội dung / Niệm kinh</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Quản lý Niệm kinh
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Điều phối bản kinh, nghi thức, kế hoạch, rule môi trường và đơn từ tâm linh trong cùng một cụm quản trị.
            </p>
          </div>

          <div className="rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{TABS.length} khu quản lý</p>
            <p className="mt-1">Mỗi khu có owner API, bảng dữ liệu và thao tác riêng.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        {TABS.map((tab) => (
          <WorkspaceTabLink key={tab.path} tab={tab} />
        ))}
      </section>

      <Outlet />
    </div>
  );
}

export const niemKinhRoutes = niemKinhWorkspaceRoute.addChildren([
  niemKinhIndexRoute,
  environmentRulesTabRoute,
  banKinhRoute,
  nghiThucRoute,
  keHoachRoute,
  dailyRecitationRoute,
  spiritualApplicationsRoute,
]);
