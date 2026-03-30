import { useQuery } from "@tanstack/react-query";
import { ActivityIcon, CheckCircleIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { searchStatusOptions, useReindexMutation } from "@/features/system/search-queries.js";

// ── Re-exports from feature modules ─────────────────────────────────

export { GuidesPage, DailyPracticePage, LittleHousePage, LifeReleasePage } from "@/features/guides/index.js";
export { DownloadsPage } from "@/features/downloads/index.js";
export { PostsPage } from "@/features/content/posts-page.js";
export { MediaAssetsPage } from "@/features/media/index.js";
export { AssistedEntryPage } from "@/features/assisted-entry/index.js";
export { CommunityPostsPage } from "@/features/community-posts/index.js";
export { GuestbookPage } from "@/features/guestbook/index.js";
export { ModerationCommentsPage } from "@/features/moderation-comments/index.js";

// ── Category-scoped Download page exports ────────────────────────────

import { DownloadsPage as _DownloadsPage } from "@/features/downloads/index.js";

export { MediaLibraryPage } from "@/features/media-library/index.js";

export function SutrasPage() {
  return (
    <_DownloadsPage
      title="Kinh sách"
      description="Quản trị kinh sách và tài liệu tham khảo."
      defaultCategory="REFERENCE"
    />
  );
}

// ── Search Ops ───────────────────────────────────────────────────────

export function SearchOpsPage() {
  const { data: status, isLoading } = useQuery(searchStatusOptions());
  const reindex = useReindexMutation();

  const isOperational = !isLoading && status?.status === "operational";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Theo dõi trạng thái search index và hiệu năng tìm kiếm.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <CheckCircleIcon className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "…" : isOperational ? "Hoạt động" : "Có vấn đề"}
            </div>
            <p className="text-xs text-muted-foreground">
              {status?.engine ?? "Meilisearch"} primary engine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback</CardTitle>
            <ActivityIcon className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SQL sẵn sàng</div>
            <p className="text-xs text-muted-foreground">
              {status?.fallback ?? "PostgreSQL FTS"} fallback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexes</CardTitle>
            <AlertTriangleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.indexes.length ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Index đang theo dõi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>Trạng thái search engine và cấu hình index.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Engine</span>
              <span className="font-medium">{status?.engine ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Fallback</span>
              <span className="font-medium">{status?.fallback ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Lần kiểm tra cuối</span>
              <span className="font-medium">
                {status ? new Date(status.checkedAt).toLocaleString("vi-VN") : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái tổng quan</span>
              <Badge
                variant="outline"
                className={
                  isOperational
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                }
              >
                {isLoading ? "Đang kiểm tra…" : isOperational ? "Bình thường" : "Cần kiểm tra"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {status && status.indexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indexes</CardTitle>
            <CardDescription>Danh sách index và trạng thái. Reindex khi cần đồng bộ lại dữ liệu.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.indexes.map((idx) => (
                <div key={idx.name} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{idx.name}</span>
                    <Badge variant="outline" className="text-xs">{idx.status}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={reindex.isPending}
                    onClick={() => reindex.mutate(idx.name)}
                  >
                    <RefreshCwIcon className="mr-1.5 size-3.5" />
                    Reindex
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
