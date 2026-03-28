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

import { downloadListOptions, downloadKeys, type DownloadListFilters } from "./queries.js";
import { useCreateDownload, usePublishDownload, useDeleteDownload } from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

const DOWNLOAD_CATEGORIES = [
  { value: "", label: "Tất cả" },
  { value: "GUIDE", label: "Hướng dẫn" },
  { value: "TEMPLATE", label: "Template" },
  { value: "REFERENCE", label: "Tham khảo" },
  { value: "FAQ", label: "FAQ" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Template",
  REFERENCE: "Tham khảo",
  FAQ: "FAQ",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

function CreateDownloadDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GUIDE");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("");
  const createDownload = useCreateDownload();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;
    createDownload.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: Number(fileSize) || 0,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setCategory("GUIDE");
          setFileUrl("");
          setFileType("PDF");
          setFileSize("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Tạo tài liệu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo tài liệu mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để thêm tài liệu tải về.
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
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUIDE">Hướng dẫn</SelectItem>
                  <SelectItem value="TEMPLATE">Template</SelectItem>
                  <SelectItem value="REFERENCE">Tham khảo</SelectItem>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL file</label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại file</label>
                <Input
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  placeholder="PDF"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kích thước (bytes)</label>
                <Input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={createDownload.isPending || !title.trim() || !fileUrl.trim()}>
              {createDownload.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Downloads Page ──────────────────────────────────────────────────

export function DownloadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const qc = useQueryClient();
  const publishDownload = usePublishDownload();
  const deleteDownload = useDeleteDownload();

  const filters: DownloadListFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(downloadListOptions(filters));
  const downloads = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tài liệu</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài liệu tải về, phân loại và xuất bản.
            {total > 0 && ` (${total} tài liệu)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void qc.invalidateQueries({ queryKey: downloadKeys.lists() })}
          >
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
          <CreateDownloadDialog />
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
          {DOWNLOAD_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              variant={categoryFilter === c.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(c.value)}
            >
              {c.label}
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
                  <TableHead className="w-[160px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((dl) => (
                  <TableRow key={dl.publicId}>
                    <TableCell className="max-w-[250px] truncate font-medium">
                      {dl.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabel(dl.category)}</Badge>
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
                      <div className="flex gap-1">
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
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteDownload.isPending}
                          onClick={() => deleteDownload.mutate(dl.publicId)}
                        >
                          Xoá
                        </Button>
                      </div>
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
