import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";

import { volunteerListOptions, volunteerKeys, type VolunteerItem } from "./queries.js";
import {
  useCreateVolunteer,
  useUpdateVolunteer,
  useDeleteVolunteer,
  type CreateVolunteerInput,
} from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export function VolunteersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const qc = useQueryClient();
  const deleteVolunteer = useDeleteVolunteer();

  const { data, isLoading, isError } = useQuery(volunteerListOptions());
  const volunteers = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? 0;

  const editingVolunteer = editTarget
    ? volunteers.find((v) => v.publicId === editTarget)
    : null;
  const deletingVolunteer = deleteTarget
    ? volunteers.find((v) => v.publicId === deleteTarget)
    : null;

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteVolunteer.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Phụng sự viên</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách phụng sự viên, vai trò và thông tin liên hệ.
            {total > 0 && ` (${total} người)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void qc.invalidateQueries({ queryKey: volunteerKeys.lists() })}
          >
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Thêm phụng sự viên
          </Button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được danh sách phụng sự viên.
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton />
          ) : volunteers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Zalo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead className="w-[150px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((vol) => (
                  <TableRow key={vol.publicId}>
                    <TableCell className="font-medium">{vol.displayName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{vol.role}</TableCell>
                    <TableCell className="text-nowrap text-sm text-muted-foreground">
                      {vol.phone ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {vol.zaloLink ? (
                        <a
                          href={vol.zaloLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                        >
                          Liên kết
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          vol.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                        }
                      >
                        {vol.isActive ? "Hoạt động" : "Ngưng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{vol.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditTarget(vol.publicId)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(vol.publicId)}
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
              Chưa có phụng sự viên nào.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <VolunteerFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {/* Edit Dialog */}
      {editingVolunteer && (
        <VolunteerFormDialog
          mode="edit"
          volunteer={editingVolunteer}
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xoá phụng sự viên{" "}
              <strong>{deletingVolunteer?.displayName}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              disabled={deleteVolunteer.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteVolunteer.isPending ? "Đang xoá..." : "Xoá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Create/Edit Form Dialog ─────────────────────────────────────────

function VolunteerFormDialog({
  mode,
  volunteer,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  volunteer?: VolunteerItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createVolunteer = useCreateVolunteer();
  const updateVolunteer = useUpdateVolunteer();

  const [form, setForm] = useState<CreateVolunteerInput>({
    displayName: volunteer?.displayName ?? "",
    role: volunteer?.role ?? "",
    phone: volunteer?.phone ?? "",
    zaloLink: volunteer?.zaloLink ?? "",
    bio: volunteer?.bio ?? "",
    sortOrder: volunteer?.sortOrder ?? 0,
    isActive: volunteer?.isActive ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = {
      displayName: form.displayName,
      role: form.role,
      phone: form.phone || undefined,
      zaloLink: form.zaloLink || undefined,
      bio: form.bio || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    if (mode === "create") {
      createVolunteer.mutate(input, {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ displayName: "", role: "", phone: "", zaloLink: "", bio: "", sortOrder: 0, isActive: true });
        },
      });
    } else if (volunteer) {
      updateVolunteer.mutate(
        { publicId: volunteer.publicId, input },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  const isPending = mode === "create" ? createVolunteer.isPending : updateVolunteer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm phụng sự viên" : "Chỉnh sửa phụng sự viên"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Điền thông tin phụng sự viên mới."
              : "Cập nhật thông tin phụng sự viên."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên hiển thị *</label>
            <Input
              required
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Họ và tên"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò *</label>
            <Input
              required
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="Ví dụ: Trưởng ban, Thư ký..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Điện thoại</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0xxx xxx xxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zalo</label>
              <Input
                value={form.zaloLink}
                onChange={(e) => setForm((f) => ({ ...f, zaloLink: e.target.value }))}
                placeholder="https://zalo.me/..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Giới thiệu</label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Vài dòng giới thiệu..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thứ tự hiển thị</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Checkbox
                id="volunteer-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isActive: checked === true }))
                }
              />
              <label htmlFor="volunteer-active" className="text-sm font-medium">
                Đang hoạt động
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Đang thêm..."
                  : "Đang lưu..."
                : mode === "create"
                  ? "Thêm phụng sự viên"
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
