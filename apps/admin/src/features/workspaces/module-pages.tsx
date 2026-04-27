import { useQuery } from "@tanstack/react-query";
import { ActivityIcon, BookOpenIcon, CheckCircleIcon, AlertTriangleIcon, RefreshCwIcon, FileStackIcon, LinkIcon, LibraryBigIcon, Volume2Icon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tài liệu</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý kho tài liệu dùng chung cho nhiều bề mặt nội dung. Tài liệu là bản ghi gốc, các khu khác chỉ được gắn tham chiếu chứ không tự sao chép metadata riêng.
        </p>
      </div>

      <Tabs defaultValue="danh-sach" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="danh-sach">Danh sách tài liệu</TabsTrigger>
          <TabsTrigger value="phan-loai">Danh mục và loại</TabsTrigger>
          <TabsTrigger value="gan-surface">Gắn vào bề mặt dùng</TabsTrigger>
          <TabsTrigger value="xuat-ban">Xuất bản</TabsTrigger>
        </TabsList>

        <TabsContent value="danh-sach" className="space-y-4">
          <_DownloadsPage
            title="Danh sách tài liệu"
            description="Quản trị file PDF, audio, checklist và biểu mẫu đang dùng trên các bề mặt nội dung."
            createBasePath="/noi-dung/tai-lieu"
            detailBasePath="/noi-dung/tai-lieu"
            createLabel="Thêm tài liệu"
            entityLabel="tài liệu"
            emptyMessage="Chưa có tài liệu nào."
          />
        </TabsContent>

        <TabsContent value="phan-loai" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileStackIcon className="size-4 text-muted-foreground" />
                Nhóm tài liệu đang dùng
              </CardTitle>
              <CardDescription>Giữ cách gọi thuần Việt để operator lớn tuổi dễ hiểu.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Hướng dẫn: tài liệu giải thích cách làm từng bước.</div>
              <div className="rounded-lg border px-3 py-2">Biểu mẫu: mẫu điền, mẫu in, mẫu dùng trong nghi thức.</div>
              <div className="rounded-lg border px-3 py-2">Tham khảo: bản đọc thêm, bản chuẩn để đối chiếu.</div>
              <div className="rounded-lg border px-3 py-2">Hỏi đáp: tài liệu tra cứu câu hỏi ngắn gọn.</div>
              <div className="rounded-lg border px-3 py-2">Đơn từ tâm linh: đơn xin, mẫu phát nguyện và bản khai liên quan.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LibraryBigIcon className="size-4 text-muted-foreground" />
                Quy tắc phân loại
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Một file chỉ có một danh mục gốc để tránh trùng bản ghi.</div>
              <div className="rounded-lg border px-3 py-2">Khi một tài liệu dùng cho nhiều nơi, giữ một bản ghi và gắn vào nhiều bề mặt dùng.</div>
              <div className="rounded-lg border px-3 py-2">Nếu là kinh đọc trực tiếp hoặc cây chương hồi, chuyển sang khu Kinh sách.</div>
              <div className="rounded-lg border px-3 py-2">Nếu là video hoặc playlist, chuyển sang Bạch thoại Phật pháp hoặc Thư viện pháp môn.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gan-surface" className="grid gap-4 lg:grid-cols-2">
          {[
            { title: "Kinh bài tập", href: "/noi-dung/kinh-bai-tap", note: "Gắn PDF hướng dẫn, đơn từ tâm linh, bảng tóm tắt công khóa." },
            { title: "Kinh văn tự tu", href: "/noi-dung/kinh-van-tu-tu", note: "Gắn bản in, biểu mẫu tự tu và tài liệu bảo quản." },
            { title: "Ngôi Nhà Nhỏ", href: "/noi-dung/ngoi-nha-nho", note: "Gắn bản hướng dẫn, checklist đốt, tờ thực hành." },
            { title: "Phóng sanh", href: "/noi-dung/phong-sanh", note: "Gắn nghi thức, checklist chuẩn bị và tệp hiện trường." },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LinkIcon className="size-4 text-muted-foreground" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{item.note}</p>
                <Button asChild variant="outline" size="sm">
                  <Link to={item.href}>
                    Mở khu này
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="xuat-ban" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist trước khi xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Đã có file nội bộ hoặc đường dẫn file rõ ràng.</div>
              <div className="rounded-lg border px-3 py-2">Tên tài liệu, mô tả ngắn và dung lượng hiển thị đầy đủ.</div>
              <div className="rounded-lg border px-3 py-2">Đã chọn đúng danh mục để không rơi nhầm sang Kinh sách.</div>
              <div className="rounded-lg border px-3 py-2">Nếu dùng cho nhiều bề mặt dùng, ưu tiên kiểm tra bản ghi gốc thay vì tạo bản sao.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lưu ý vận hành</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Tài liệu là kho dùng chung, không phải chỗ viết lại nội dung hướng dẫn dài.</div>
              <div className="rounded-lg border px-3 py-2">Các khu nội dung chỉ kéo tài liệu này về để hiển thị, không đổi chủ sở hữu bản ghi.</div>
              <div className="rounded-lg border px-3 py-2">Nếu file sai nguồn hoặc sai phiên bản, sửa ngay bản ghi gốc ở đây.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SutrasPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kinh sách</h1>
        <p className="text-sm text-muted-foreground">
          Khu quản lý kinh sách dành cho bản kinh đọc và tải xuống. Không dùng nhầm kho này như một danh sách tài liệu chung.
        </p>
      </div>

      <Tabs defaultValue="sutras" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="sutras">Danh sách kinh</TabsTrigger>
          <TabsTrigger value="bai-thoai">Bạch thoại audiobook</TabsTrigger>
        </TabsList>

        <TabsContent value="sutras" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  Phạm vi khu này
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Quản lý bản kinh, bản đọc và file chuẩn để người dùng tra cứu hoặc tải về. Không để lẫn với biểu mẫu, checklist hay tài liệu hướng dẫn chung.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LibraryBigIcon className="size-4 text-muted-foreground" />
                  Quy tắc phân luồng
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Khi bản ghi là cây kinh nhiều quyển, nhiều chương hoặc có companion audio, đây mới là nơi quản lý đúng ngữ cảnh.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileStackIcon className="size-4 text-muted-foreground" />
                  Giai đoạn hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Luồng admin tạm thời vẫn dùng nguồn file hiện có, nhưng copy, route và thao tác đã tách riêng cho Kinh sách để không nhầm với Tài liệu.
              </CardContent>
            </Card>
          </div>

          <_DownloadsPage
            title="Danh sách kinh"
            description="Theo dõi các bản kinh đang phát hành ở admin. Chỉ hiện bản ghi thuộc khu Kinh sách."
            defaultCategory="REFERENCE"
            createBasePath="/noi-dung/kinh-sach"
            detailBasePath="/noi-dung/kinh-sach"
            createLabel="Thêm kinh sách"
            entityLabel="kinh sách"
            emptyMessage="Chưa có kinh sách nào."
            searchPlaceholder="Lọc kinh sách..."
          />
        </TabsContent>

        <TabsContent value="bai-thoai" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2Icon className="size-4 text-muted-foreground" />
                Audiobook Bạch thoại
              </CardTitle>
              <CardDescription>
                Khu này quản phần sách nói, dịch chương và companion audio của Bạch thoại Phật pháp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Không nhập lẫn audiobook vào danh sách tài liệu tải chung.</div>
              <div className="rounded-lg border px-3 py-2">Chương dịch, link audio và trạng thái rà soát phải theo khu Bạch thoại.</div>
              <Button asChild variant="outline" size="sm">
                <Link to="/noi-dung/bach-thoai">
                  Mở khu Bạch thoại Phật pháp
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lưu ý trước khi nhập mới</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-lg border px-3 py-2">Nếu là sách nói hoặc bản dịch chương, chuyển sang khu Bạch thoại để quản lý đúng bối cảnh.</div>
              <div className="rounded-lg border px-3 py-2">Nếu chỉ là bản PDF hướng dẫn hoặc file dùng chung, chuyển sang khu Tài liệu.</div>
              <div className="rounded-lg border px-3 py-2">Khi repo có API chủ quản `sutras` đầy đủ, khu này sẽ mở tiếp cây kinh → quyển → chương thay vì chỉ quản file.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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
