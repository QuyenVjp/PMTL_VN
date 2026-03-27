import { createRoute, Link, Outlet } from "@tanstack/react-router";

import { EnvironmentRulesTable } from "@/features/chant-admin/environment-rules-table";
import { EditorPage } from "@/features/content/editor-page";
import { rootRoute } from "@/routes/__root.js";

type WorkspaceTab = {
  path: string;
  label: string;
  description: string;
  disabled?: boolean;
};

const TABS: WorkspaceTab[] = [
  {
    path: "/noi-dung/niem-kinh/moi-truong-thoi-gian",
    label: "Môi trường & thời gian",
    description: "Quản lý rule thời điểm, không gian, thể trạng và bối cảnh hành trì.",
  },
  {
    path: "/noi-dung/niem-kinh/ban-kinh",
    label: "Bản kinh",
    description: "Biên tập script niệm, bản tụng và trạng thái xuất bản.",
  },
  {
    path: "/noi-dung/niem-kinh/nghi-thuc",
    label: "Nghi thức",
    description: "Điều phối ritual template theo mục đích sử dụng.",
  },
  {
    path: "/noi-dung/niem-kinh/ke-hoach",
    label: "Kế hoạch",
    description: "Theo dõi chant plan, milestone và nhắc lịch liên quan.",
  },
];

export const niemKinhWorkspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
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
  component: () => (
    <EditorPage
      title="Bản kinh"
      description="Biên tập bản kinh và script niệm dài trong cùng workspace quản trị."
      initialContent="<h2>Bản kinh mẫu</h2><p>Nội dung bản kinh được biên tập tại đây.</p>"
    />
  ),
});

const nghiThucRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/nghi-thuc",
  component: () => (
    <EditorPage
      title="Nghi thức"
      description="Biên tập template nghi thức, giữ đúng lane nội dung của module Niệm kinh."
      initialContent="<h2>Nghi thức cơ bản</h2><ul><li>Chuẩn bị</li><li>Thực hành</li><li>Hồi hướng</li></ul>"
    />
  ),
});

const keHoachRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/ke-hoach",
  component: () => (
    <EditorPage
      title="Kế hoạch"
      description="Soạn kế hoạch hành trì dài và ghi chú điều phối trong cùng một màn hình."
      initialContent="<h2>Kế hoạch 49 ngày</h2><p>Thiết lập mục tiêu, nhắc nhở và milestone tại đây.</p>"
    />
  ),
});

export const niemKinhIndexRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/",
  component: () => (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Chọn tab để làm việc</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Chọn đúng tab để đi vào phần rule, bản kinh, nghi thức hoặc kế hoạch cần thao tác.
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
      <p className="text-sm font-semibold">{tab.label}</p>
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
              Workspace `Niệm kinh`
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Workspace này gom đúng 4 lane nghiệp vụ của Niệm kinh: rule môi trường,
              bản kinh, nghi thức và kế hoạch. Mỗi tab giữ đúng ngữ cảnh thao tác
              thay vì tách thành route demo rời rạc.
            </p>
          </div>

          <div className="rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Current slice</p>
            <p className="mt-1">Đi vào đúng tab để tiếp tục thao tác biên tập.</p>
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
]);
