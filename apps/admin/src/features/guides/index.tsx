import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { guideListOptions, guideKeys, type GuideListFilters } from "./queries.js";
import { useCreateGuide, usePublishGuide } from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "", label: "Tat ca" },
  { value: "BEGINNER", label: "Nhap mon" },
  { value: "DAILY_PRACTICE", label: "Hanh tri hang ngay" },
  { value: "LITTLE_HOUSE", label: "Ngoi Nha Nho" },
  { value: "LIFE_RELEASE", label: "Phong sanh" },
  { value: "GENERAL", label: "Chung" },
] as const;

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

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Đã ẩn";
  return s;
}

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
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

// ── Create Dialog ───────────────────────────────────────────────────

function CreateGuideDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("BEGINNER");
  const [excerpt, setExcerpt] = useState("");
  const createGuide = useCreateGuide();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createGuide.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        excerpt: excerpt.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setSlug("");
          setCategory("BEGINNER");
          setExcerpt("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Tạo hướng dẫn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo hướng dẫn mới</DialogTitle>
            <DialogDescription>
              Điền thông tin cơ bản để tạo bài hướng dẫn mới.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tu-dong-tao-tu-tieu-de"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Nhập môn</SelectItem>
                  <SelectItem value="DAILY_PRACTICE">Hành trì hằng ngày</SelectItem>
                  <SelectItem value="LITTLE_HOUSE">Ngôi Nhà Nhỏ</SelectItem>
                  <SelectItem value="LIFE_RELEASE">Phóng sanh</SelectItem>
                  <SelectItem value="GENERAL">Chung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tóm tắt</label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Mô tả ngắn cho bài hướng dẫn..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={createGuide.isPending || !title.trim()}>
              {createGuide.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Guides Page ─────────────────────────────────────────────────────

export function GuidesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishGuide = usePublishGuide();

  const filters: GuideListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(guideListOptions(filters));
  const guides = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Hướng dẫn</h1>
          <p className="text-sm text-muted-foreground">
            Quản trị nội dung nhập môn và hướng dẫn thực hành cho thành viên.
            {total > 0 && ` (${total} bài)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void qc.invalidateQueries({ queryKey: guideKeys.lists() })}
          >
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
          <CreateGuideDialog />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.value}
              variant={categoryFilter === c.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(c.value)}
            >
              {c.value === "" ? "Tất cả" : categoryLabel(c.value)}
            </Button>
          ))}
        </div>
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
              Chưa có hướng dẫn nào.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
