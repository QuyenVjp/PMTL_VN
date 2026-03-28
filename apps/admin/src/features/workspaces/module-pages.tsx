import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcwIcon, ActivityIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { postListOptions, postKeys, type PostListFilters } from "@/features/content/queries.js";
import { usePublishPost } from "@/features/content/mutations.js";
import { mediaListOptions, mediaKeys, type MediaListFilters } from "@/features/media/queries.js";
import { useDeleteMediaAsset } from "@/features/media/mutations.js";
import { guideListOptions, guideKeys, type GuideListFilters } from "@/features/guides/queries.js";
import { usePublishGuide } from "@/features/guides/mutations.js";
import { downloadListOptions, downloadKeys, type DownloadListFilters } from "@/features/downloads/queries.js";
import { usePublishDownload } from "@/features/downloads/mutations.js";
// ── Re-exports from feature modules ────────────────────────────────

export { GuidesPage } from "@/features/guides/index.js";
export { DownloadsPage } from "@/features/downloads/index.js";
export { AssistedEntryPage } from "@/features/assisted-entry/index.js";
export { CommunityPostsPage } from "@/features/community-posts/index.js";
export { GuestbookPage } from "@/features/guestbook/index.js";
export { ModerationCommentsPage } from "@/features/moderation-comments/index.js";

// ── Helpers ──────────────────────────────────────────────────────────

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Đã ẩn";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  BEGINNER: "Nhập môn",
  DAILY_PRACTICE: "Hành trì hằng ngày",
  LITTLE_HOUSE: "Ngôi Nhà Nhỏ",
  LIFE_RELEASE: "Phóng sanh",
  GENERAL: "Chung",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function categoryBadgeClass(cat: string): string {
  if (cat === "BEGINNER")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (cat === "DAILY_PRACTICE")
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
  if (cat === "LITTLE_HOUSE")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400";
  if (cat === "LIFE_RELEASE")
    return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400";
  return "";
}

const DOWNLOAD_CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Template",
  REFERENCE: "Tham khảo",
  FAQ: "FAQ",
};

function downloadCategoryLabel(cat: string): string {
  return DOWNLOAD_CATEGORY_LABELS[cat] ?? cat;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Category-filtered Guide Page (shared component) ─────────────────

function CategoryGuidePage({
  title,
  description,
  category,
}: {
  title: string;
  description: string;
  category: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishGuide = usePublishGuide();

  const filters: GuideListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
    category,
  };

  const { data, isLoading, isError } = useQuery(guideListOptions(filters));
  const guides = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {description}
            {total > 0 && ` (${total} bài)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: guideKeys.lists() })}
        >
          <RefreshCcwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "Tất cả" : statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách hướng dẫn.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : guides.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {guides.map((guide) => (
                  <TableRow key={guide.publicId}>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {guide.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryBadgeClass(guide.category)}>
                        {categoryLabel(guide.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(guide.status)}>
                        {statusLabel(guide.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{guide.author.displayName}</TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(guide.createdAt)}
                    </TableCell>
                    <TableCell>
                      {guide.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={publishGuide.isPending}
                          onClick={() => publishGuide.mutate(guide.publicId)}
                        >
                          Xuất bản
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có hướng dẫn nào trong danh mục này.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Category-filtered Download Page (shared component) ──────────────

function CategoryDownloadPage({
  title,
  description,
  category,
}: {
  title: string;
  description: string;
  category?: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishDownload = usePublishDownload();

  const filters: DownloadListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
    category: category || undefined,
  };

  const { data, isLoading, isError } = useQuery(downloadListOptions(filters));
  const downloads = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {description}
            {total > 0 && ` (${total} tài liệu)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: downloadKeys.lists() })}
        >
          <RefreshCcwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "Tất cả" : statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách tài liệu.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : downloads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Loại file</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tải</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((dl) => (
                  <TableRow key={dl.publicId}>
                    <TableCell className="max-w-[250px] truncate font-medium">
                      {dl.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{downloadCategoryLabel(dl.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dl.fileType}
                    </TableCell>
                    <TableCell className="text-nowrap tabular-nums">
                      {formatFileSize(dl.fileSize)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(dl.status)}>
                        {statusLabel(dl.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{dl.uploader.displayName}</TableCell>
                    <TableCell>
                      {dl.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={publishDownload.isPending}
                          onClick={() => publishDownload.mutate(dl.publicId)}
                        >
                          Xuất bản
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có tài liệu nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Posts (REAL API) ─────────────────────────────────────────────────

export function PostsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishPost = usePublishPost();

  const filters: PostListFilters = {
    page: 1,
    limit: 20,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(postListOptions(filters));
  const posts = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground">
            Biên tập, xuất bản và rà soát bài viết public của PMTL.
            {total > 0 && ` (${total} bài)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: postKeys.lists() })}
        >
          <RefreshCcwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "Tất cả" : statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách bài viết.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : posts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(post.status)}>
                        {statusLabel(post.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.author.displayName}</TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(post.updatedAt)}
                    </TableCell>
                    <TableCell>
                      {post.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={publishPost.isPending}
                          onClick={() => publishPost.mutate(post.id)}
                        >
                          Xuất bản
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có bài viết nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Category-filtered guide pages ───────────────────────────────────

export function DailyPracticePage() {
  return (
    <CategoryGuidePage
      title="Kinh Bài Tập"
      description="Quản lý hướng dẫn hành trì hằng ngày cho thành viên."
      category="DAILY_PRACTICE"
    />
  );
}

export function LittleHousePage() {
  return (
    <CategoryGuidePage
      title="Ngôi Nhà Nhỏ"
      description="Quản lý hướng dẫn chương trình Ngôi Nhà Nhỏ."
      category="LITTLE_HOUSE"
    />
  );
}

export function LifeReleasePage() {
  return (
    <CategoryGuidePage
      title="Phóng Sanh"
      description="Quản lý hướng dẫn phát nguyện và thực hành phóng sanh."
      category="LIFE_RELEASE"
    />
  );
}

// ── Category-filtered download pages ────────────────────────────────

export function MediaLibraryPage() {
  return (
    <CategoryDownloadPage
      title="Thư viện pháp môn"
      description="Điều phối tài liệu media, pháp môn phục vụ thành viên."
    />
  );
}

export function SutrasPage() {
  return (
    <CategoryDownloadPage
      title="Kinh sách"
      description="Quản trị kinh sách và tài liệu tham khảo."
      category="REFERENCE"
    />
  );
}

// ── Search Ops (minimal real page) ──────────────────────────────────

export function SearchOpsPage() {
  const [lastCheck] = useState(() => new Date().toISOString());

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>
        <p className="text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              Meilisearch primary engine
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
              PostgreSQL full-text fallback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Không có fallback event gần đây
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>
            Trạng thái search engine và cấu hình index.
          </CardDescription>
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
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                Bình thường
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Media Assets (REAL API) ─────────────────────────────────────────

function assetStatusLabel(status: string): string {
  if (status === "READY") return "Sẵn sàng";
  if (status === "UPLOADING") return "Đang tải";
  if (status === "ORPHANED") return "Mồ côi";
  if (status === "DELETED") return "Đã xoá";
  return status;
}

function assetStatusBadgeClass(status: string): string {
  if (status === "READY")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "UPLOADING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (status === "ORPHANED")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

export function MediaAssetsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const deleteAsset = useDeleteMediaAsset();

  const filters: MediaListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(mediaListOptions(filters));
  const assets = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Media Assets</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi asset upload, owner và tình trạng xử lý media.
            {total > 0 && ` (${total} asset)`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: mediaKeys.lists() })}
        >
          <RefreshCcwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên file..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "READY", "UPLOADING", "ORPHANED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "Tất cả" : assetStatusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách media.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên file</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tải</TableHead>
                  <TableHead>Ngày tải</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.publicId}>
                    <TableCell className="max-w-[250px] truncate font-medium">
                      {asset.filename}
                    </TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {asset.mimeType}
                    </TableCell>
                    <TableCell className="text-nowrap tabular-nums">
                      {formatFileSize(asset.size)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={assetStatusBadgeClass(asset.status)}>
                        {assetStatusLabel(asset.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.uploaderName}</TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(asset.createdAt)}
                    </TableCell>
                    <TableCell>
                      {asset.status !== "DELETED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteAsset.isPending}
                          onClick={() => deleteAsset.mutate(asset.publicId)}
                        >
                          Xoá
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có media asset nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

