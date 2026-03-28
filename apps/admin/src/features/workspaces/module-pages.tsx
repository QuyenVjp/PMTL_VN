import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { PlaceholderPage } from "@/features/workspace/placeholder-page.js";

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

// ── Posts (REAL API) ─────────────────────────────────────────────────

export function PostsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishPost = usePublishPost();

  const filters: PostListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(postListOptions(filters));
  const posts = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

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
                  <TableRow key={post.publicId}>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(post.status)}>
                        {statusLabel(post.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">
                      {timeAgo(post.updatedAt)}
                    </TableCell>
                    <TableCell>
                      {post.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={publishPost.isPending}
                          onClick={() => publishPost.mutate(post.publicId)}
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

// ── Placeholder workspaces (awaiting backend) ────────────────────────
// These pages display workspace context and await backend API controllers.
// No fake data — clean placeholders per canon.

export function GuidesPage() {
  return (
    <PlaceholderPage
      title="Hướng dẫn"
      description="Quản trị nội dung nhập môn, onboarding và giải thích thực hành cho thành viên mới. Backend: /api/content/beginner-guides"
      sections={[
        { title: "Danh sách guide", detail: "DataTable với filter theo type, status", state: "Chờ API admin" },
        { title: "Tạo / Chỉnh sửa", detail: "Form biên tập guide content + media", state: "Chờ API admin" },
      ]}
    />
  );
}

export function DailyPracticePage() {
  return (
    <PlaceholderPage
      title="Kinh Bài Tập"
      description="Workspace điều phối preset, FAQ, download và guide cho hành trì hằng ngày. Backend: /api/admin/content/daily-practice/*"
      sections={[
        { title: "Tổng quan", detail: "Publish status, last updated, preview link" },
        { title: "Nhóm & Bước", detail: "Quản lý guide groups và steps" },
        { title: "Scenario presets", detail: "Cấu hình preset cho onboarding" },
        { title: "FAQ & Downloads", detail: "Nội dung hỗ trợ đính kèm" },
      ]}
    />
  );
}

export function LittleHousePage() {
  return (
    <PlaceholderPage
      title="Ngôi Nhà Nhỏ"
      description="Quản lý guide, biến thể nội dung và FAQ cho chương trình Ngôi Nhà Nhỏ. Backend: /api/admin/content/little-house/*"
      sections={[
        { title: "Guides", detail: "Nội dung hướng dẫn theo đối tượng" },
        { title: "Case variants", detail: "Biến thể nghi thức theo không gian" },
        { title: "FAQ & Downloads", detail: "Nội dung hỗ trợ đính kèm" },
      ]}
    />
  );
}

export function LifeReleasePage() {
  return (
    <PlaceholderPage
      title="Phóng Sanh"
      description="Quản lý guide, biến thể và gói hỗ trợ cho luồng phóng sanh. Backend: /api/admin/content/life-release/*"
      sections={[
        { title: "Guides", detail: "Hướng dẫn phát nguyện phóng sanh" },
        { title: "Ritual variants", detail: "Biến thể nghi thức theo mùa/trường hợp" },
        { title: "FAQ & Downloads", detail: "Nội dung hỗ trợ đính kèm" },
      ]}
    />
  );
}

export function MediaLibraryPage() {
  return (
    <PlaceholderPage
      title="Thư viện pháp môn"
      description="Điều phối collection media, tag nổi bật và item phục vụ các surface public. Backend: /api/admin/content/media-library/*"
      sections={[
        { title: "Collections", detail: "Quản lý bộ sưu tập media" },
        { title: "Featured", detail: "Nội dung nổi bật trên trang chủ" },
        { title: "Tags", detail: "Phân loại và tổ chức media" },
      ]}
    />
  );
}

export function DownloadsPage() {
  return (
    <PlaceholderPage
      title="Tài liệu"
      description="Quản lý tài liệu tải về, taxonomy và publish state. Backend: /api/admin/content/downloads*"
      sections={[
        { title: "Danh sách tài liệu", detail: "DataTable với filter theo loại, status" },
        { title: "Upload & publish", detail: "Quy trình upload và xuất bản tài liệu" },
      ]}
    />
  );
}

export function SutrasPage() {
  return (
    <PlaceholderPage
      title="Kinh sách"
      description="Quản trị sutra list, volume/chapter hierarchy và liên kết Baihua. Backend: /api/admin/content/sutras*"
      sections={[
        { title: "Danh sách kinh", detail: "DataTable với nested volumes" },
        { title: "Chapters", detail: "Quản lý chương trong từng volume" },
        { title: "Baihua links", detail: "Liên kết bản dịch bạch thoại" },
      ]}
    />
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export function CommunityPostsPage() {
  return (
    <PlaceholderPage
      title="Bài đăng cộng đồng"
      description="Theo dõi bài đăng thành viên, trạng thái kiểm duyệt và approve/reject. Backend: /api/admin/community/posts*"
      sections={[
        { title: "Danh sách bài đăng", detail: "DataTable với filter theo status, priority" },
        { title: "Approve/Reject", detail: "Hành động kiểm duyệt từng bài" },
      ]}
    />
  );
}

export function GuestbookPage() {
  return (
    <PlaceholderPage
      title="Sổ lưu niệm"
      description="Rà soát nội dung guestbook, quyết định duyệt và gắn theo ngữ cảnh sự kiện. Backend: /api/admin/community/guestbook*"
      sections={[
        { title: "Danh sách", detail: "DataTable với filter theo sự kiện, status" },
        { title: "Approve/Reject", detail: "Hành động duyệt từng entry" },
      ]}
    />
  );
}

export function ModerationCommentsPage() {
  return (
    <PlaceholderPage
      title="Bình luận"
      description="Theo dõi comment đã bị cờ, điều phối ẩn/khôi phục. Backend: /api/admin/moderation/comments*"
      sections={[
        { title: "Danh sách comment", detail: "DataTable với filter theo target, status" },
        { title: "Hide/Restore", detail: "Hành động ẩn hoặc khôi phục comment" },
      ]}
    />
  );
}

export function CalendarEventsPage() {
  return (
    <PlaceholderPage
      title="Lịch & Sự kiện"
      description="Điều phối sự kiện, lịch âm, advisory preview và personal practice. Backend: /api/admin/calendar/*"
      primaryAction="Tạo sự kiện"
      sections={[
        { title: "Events", detail: "CRUD sự kiện với agenda/speakers/CTAs" },
        { title: "Lunar overrides", detail: "Chỉnh sửa lịch âm lệch" },
        { title: "Advisory preview", detail: "Xem trước advisory daily cho member" },
        { title: "Personal practice", detail: "Inspect và refresh practice calendar" },
      ]}
    />
  );
}

export function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Thông báo"
      description="Theo dõi push status, push jobs và subscription stats. Backend: /api/admin/notifications/push/*"
      primaryAction="Tạo đợt gửi"
      sections={[
        { title: "Push jobs", detail: "Danh sách job gửi thông báo" },
        { title: "Status & stats", detail: "Tổng quan subscription và delivery" },
        { title: "Redrive", detail: "Gửi lại job thất bại" },
      ]}
    />
  );
}

export function VolunteersPage() {
  return (
    <PlaceholderPage
      title="Phụng sự viên"
      description="Quản lý danh sách volunteer, vai trò và thông tin liên hệ. Backend: /api/admin/volunteers*"
      primaryAction="Thêm phụng sự viên"
      sections={[
        { title: "Danh sách", detail: "DataTable CRUD cho volunteers" },
        { title: "Sort & reorder", detail: "Sắp xếp thứ tự hiển thị" },
      ]}
    />
  );
}

export function SearchOpsPage() {
  return (
    <PlaceholderPage
      title="Tìm kiếm"
      description="Theo dõi trạng thái index, hiệu năng, fallback event và điều phối reindex. Backend: /api/admin/search/*"
      primaryAction="Reindex ngay"
      sections={[
        { title: "Tổng quan", detail: "Status và operational-status của search" },
        { title: "Hiệu năng", detail: "Performance metrics theo source" },
        { title: "Jobs", detail: "Indexing jobs history và status" },
        { title: "Fallback events", detail: "Sự kiện fallback cần điều tra" },
        { title: "Cài đặt index", detail: "Index settings configuration" },
      ]}
    />
  );
}

export function AssistedEntryPage() {
  return (
    <PlaceholderPage
      title="Nhập hộ phát nguyện"
      description="Surface hỗ trợ nhập hộ lời nguyện, tra cứu thành viên và kiểm tra lịch sử. Backend: /api/admin/vows/assisted-entry/*"
      sections={[
        { title: "Tạo phiếu", detail: "Form nhập hộ phát nguyện cho thành viên" },
        { title: "Tìm thành viên", detail: "Tra cứu member để gắn hồ sơ" },
        { title: "Lịch sử", detail: "Các phiếu nhập hộ đã xử lý" },
      ]}
    />
  );
}
