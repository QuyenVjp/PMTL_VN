import { createRoute, Outlet, Link } from "@tanstack/react-router";
import { rootRoute } from "../../__root.js";
import { useQuery } from "@tanstack/react-query";

// Workspace route for /noi-dung/niem-kinh
export const niemKinhWorkspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noi-dung/niem-kinh",
  component: NiemKinhWorkspace,
});

// Tab routes
export const environmentRulesTabRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/moi-truong-thoi-gian",
  component: EnvironmentRulesTab,
});

// Default index redirects to first tab
export const niemKinhIndexRoute = createRoute({
  getParentRoute: () => niemKinhWorkspaceRoute,
  path: "/",
  component: () => {
    // Redirect to first tab
    return (
      <div className="text-gray-500">
        Chọn một tab để bắt đầu.
      </div>
    );
  },
});

const TABS = [
  {
    path: "/noi-dung/niem-kinh/moi-truong-thoi-gian",
    label: "Môi trường & thời gian",
    description: "Quy tắc về thời gian, địa điểm niệm kinh",
  },
  // Future tabs (not implemented in this slice)
  // { path: "/noi-dung/niem-kinh/bai-niem", label: "Bài niệm", disabled: true },
  // { path: "/noi-dung/niem-kinh/nghi-thuc", label: "Nghi thức", disabled: true },
  // { path: "/noi-dung/niem-kinh/ke-hoach", label: "Kế hoạch", disabled: true },
];

function NiemKinhWorkspace() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Niệm kinh</h1>
        <p className="text-gray-600 mt-1">
          Quản lý nội dung liên quan đến niệm kinh, nghi thức và hướng dẫn tu tập.
        </p>
      </header>

      {/* Tabs */}
      <nav className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <TabLink key={tab.path} tab={tab} />
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
}

function TabLink({ tab }: { tab: { path: string; label: string } }) {
  return (
    <Link
      to={tab.path}
      activeOptions={{ exact: true }}
      activeProps={{
        className: "pb-3 text-sm font-medium border-b-2 transition-colors border-blue-600 text-blue-600",
      }}
      inactiveProps={{
        className:
          "pb-3 text-sm font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
      }}
    >
      {tab.label}
    </Link>
  );
}

// Environment Rules Tab Component
function EnvironmentRulesTab() {
  return <EnvironmentRulesContent />;
}

interface RuleGroup {
  groupKey: string;
  title: string;
  summary: string;
  rules: Array<{
    ruleKey: string;
    title: string;
    canonicalWording: string;
    severity: string;
    productizationMode: string;
    referenceOnly: boolean;
  }>;
  lastReviewedAt: string;
}

interface EnvironmentRulesResponse {
  intro: {
    title: string;
    summary: string;
    updatedAt: string;
  };
  groupCards: Array<{
    groupKey: string;
    title: string;
    summary: string;
    ruleCount: number;
  }>;
  groups: RuleGroup[];
}

function resolveApiBaseUrl(rawBaseUrl: string | undefined): string {
  if (!rawBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required for admin content queries.");
  }

  const trimmed = rawBaseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

async function fetchEnvironmentRules(): Promise<EnvironmentRulesResponse> {
  const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
  const res = await fetch(`${apiBaseUrl}/content/chanting/environment-rules`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  
  const data = (await res.json()) as EnvironmentRulesResponse;
  return data;
}

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  advisory: "bg-blue-100 text-blue-800",
  caution: "bg-amber-100 text-amber-800",
  strong_guardrail: "bg-red-100 text-red-800",
  quality_guidance: "bg-green-100 text-green-800",
  reference_only: "bg-gray-100 text-gray-600",
};

const SEVERITY_LABELS: Record<string, string> = {
  advisory: "Khuyến cáo",
  caution: "Lưu ý",
  strong_guardrail: "Quan trọng",
  quality_guidance: "Hướng dẫn",
  reference_only: "Tham khảo",
};

function EnvironmentRulesContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-chant-environment-rules", "list"],
    queryFn: fetchEnvironmentRules,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Không thể tải dữ liệu</h3>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : "Đã xảy ra lỗi"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Chưa có dữ liệu quy tắc môi trường.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {data.groupCards.length}
          </div>
          <div className="text-sm text-gray-500">Nhóm quy tắc</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {data.groupCards.reduce((sum, g) => sum + g.ruleCount, 0)}
          </div>
          <div className="text-sm text-gray-500">Tổng số quy tắc</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">
            {new Date(data.intro.updatedAt).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800 text-sm">
          ℹ️ Chế độ chỉ xem. Chỉnh sửa quy tắc môi trường sẽ được hỗ trợ trong phiên bản sau.
        </p>
      </div>

      {/* Groups Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhóm
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Số quy tắc
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.groupCards.map((group) => (
              <tr key={group.groupKey} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{group.title}</div>
                  <div className="text-xs text-gray-400">{group.groupKey}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {group.summary}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {group.ruleCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Rules by Group */}
      {data.groups.map((group) => (
        <div key={group.groupKey} className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">{group.title}</h3>
            <p className="text-sm text-gray-500">{group.summary}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {group.rules.map((rule) => (
              <div key={rule.ruleKey} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{rule.title}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_BADGE_CLASSES[rule.severity] || SEVERITY_BADGE_CLASSES.advisory}`}>
                        {SEVERITY_LABELS[rule.severity] || rule.severity}
                      </span>
                      {rule.referenceOnly && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Không product hóa
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rule.canonicalWording}</p>
                    <p className="text-xs text-gray-400 mt-1">{rule.ruleKey}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Export all routes for this workspace
export const niemKinhRoutes = niemKinhWorkspaceRoute.addChildren([
  niemKinhIndexRoute,
  environmentRulesTabRoute,
]);
