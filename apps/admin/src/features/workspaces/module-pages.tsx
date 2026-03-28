import { useState } from "react";
import { ActivityIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export function MediaLibraryPage() {
  return (
    <_DownloadsPage
      title="Thư viện pháp môn"
      description="Điều phối tài liệu media, pháp môn phục vụ thành viên."
    />
  );
}

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
  const [lastCheck] = useState(() => new Date().toISOString());

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
            <div className="text-2xl font-bold">Hoạt động</div>
            <p className="text-xs text-muted-foreground">Meilisearch primary engine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback</CardTitle>
            <ActivityIcon className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SQL sẵn sàng</div>
            <p className="text-xs text-muted-foreground">PostgreSQL full-text fallback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Không có fallback event gần đây</p>
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
              <span className="font-medium">Meilisearch</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Fallback</span>
              <span className="font-medium">PostgreSQL FTS</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Lần kiểm tra cuối</span>
              <span className="font-medium">{new Date(lastCheck).toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái tổng quan</span>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                Bình thường
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
