import { useQuery } from "@tanstack/react-query";
import { ActivityIcon, CheckCircleIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { searchStatusOptions } from "@/features/system/search-queries.js";
import { useReindexMutation } from "@/features/system/mutations.js";

// ── Re-exports from feature modules ─────────────────────────────────

export { GuidesPage } from "@/features/guides/index.js";
export { DailyRecitationWorkspace as DailyPracticePage } from "@/features/daily-recitation/index.js";
export { LittleHouseContentWorkspace as LittleHousePage } from "@/features/little-house-content/index.js";
export { LifeReleaseContentWorkspace as LifeReleasePage } from "@/features/life-release-content/index.js";
export { PostsPage } from "@/features/content/posts-page.js";
export { MediaAssetsPage, ImageAssetsPage, VideoAssetsPage, DocumentAssetsPage } from "@/features/media/index.js";
export { AssistedEntryPage } from "@/features/assisted-entry/index.js";
export { CommunityPostsPage } from "@/features/community-posts/index.js";
export { GuestbookPage } from "@/features/guestbook/index.js";
export { ModerationCommentsPage } from "@/features/moderation-comments/index.js";

// ── Category-scoped Download page exports ────────────────────────────

import { DownloadsPage as _DownloadsPage } from "@/features/downloads/index.js";

export { MediaLibraryPage } from "@/features/media-library/index.js";

export function DownloadsPage() {
  return (
    <_DownloadsPage
      title="Tài liệu"
      description="Quản trị file PDF, audio, checklist và biểu mẫu đang dùng trên các bề mặt nội dung."
      createBasePath="/noi-dung/tai-lieu"
      detailBasePath="/noi-dung/tai-lieu"
      createLabel="Thêm tài liệu"
      entityLabel="tài liệu"
      emptyMessage="Chưa có tài liệu nào."
    />
  );
}

export function SutrasPage() {
  return (
    <_DownloadsPage
      title="Kinh sách"
      description="Theo dõi các bản kinh đang phát hành ở admin."
      defaultCategory="REFERENCE"
      createBasePath="/noi-dung/kinh-sach"
      detailBasePath="/noi-dung/kinh-sach"
      createLabel="Thêm kinh sách"
      entityLabel="kinh sách"
      emptyMessage="Chưa có kinh sách nào."
      searchPlaceholder="Lọc kinh sách..."
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Indexes</CardTitle>
                <CardDescription>Danh sách index và trạng thái. Reindex khi cần đồng bộ lại dữ liệu.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (status?.indexes) {
                    status.indexes.forEach(idx => {
                      reindex.mutate(idx.name);
                    });
                  }
                }}
                disabled={reindex.isPending}
                className={cn(
                  "transition-all duration-200",
                  reindex.isPending && "animate-pulse"
                )}
              >
                <RefreshCwIcon className={cn(
                  "mr-2 size-4 transition-transform duration-200",
                  reindex.isPending && "animate-spin"
                )} />
                Reindex tất cả
              </Button>
            </div>
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
                    className={cn(
                      "transition-all duration-200",
                      reindex.isPending && "animate-pulse"
                    )}
                  >
                    <RefreshCwIcon 
                      className={cn(
                        "mr-1.5 size-3.5 transition-transform duration-200",
                        reindex.isPending && "animate-spin"
                      )} 
                    />
                    {reindex.isPending ? "Đang xử lý..." : "Reindex"}
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
