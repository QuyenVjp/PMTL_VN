import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { volunteerListOptions, type VolunteerItem } from "@/features/volunteers/queries";
import {
  useCreateVolunteer,
  useUpdateVolunteer,
  useDeleteVolunteer,
  type CreateVolunteerInput,
  type UpdateVolunteerInput,
} from "@/features/volunteers/mutations";

// ── Context ──────────────────────────────────────────────────────────

type VolunteerDialogType = "create" | "edit" | "delete" | null;

type VolunteersContextValue = {
  open: VolunteerDialogType;
  currentRow: VolunteerItem | null;
  setOpen: (value: VolunteerDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<VolunteerItem | null>>;
};

const VolunteersContext = createContext<VolunteersContextValue | null>(null);

function VolunteersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<VolunteerDialogType>(null);
  const [currentRow, setCurrentRow] = useState<VolunteerItem | null>(null);
  return (
    <VolunteersContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </VolunteersContext.Provider>
  );
}

function useVolunteers() {
  const ctx = useContext(VolunteersContext);
  if (!ctx) throw new Error("useVolunteers must be used within VolunteersProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const activeOptions = [
  { label: "Đang hoạt động", value: "true" },
  { label: "Không hoạt động", value: "false" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Create/Edit form dialog ───────────────────────────────────────────

function VolunteerFormDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: VolunteerItem | null;
}) {
  const isEdit = !!currentRow;
  const createVolunteer = useCreateVolunteer();
  const updateVolunteer = useUpdateVolunteer();

  const [displayName, setDisplayName] = useState(currentRow?.displayName ?? "");
  const [role, setRole] = useState(currentRow?.role ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentRow?.avatarUrl ?? "");
  const [phone, setPhone] = useState(currentRow?.phone ?? "");
  const [zaloLink, setZaloLink] = useState(currentRow?.zaloLink ?? "");
  const [bio, setBio] = useState(currentRow?.bio ?? "");
  const [sortOrder, setSortOrder] = useState(String(currentRow?.sortOrder ?? "0"));
  const [isActive, setIsActive] = useState(currentRow?.isActive ?? true);

  useEffect(() => {
    setDisplayName(currentRow?.displayName ?? "");
    setRole(currentRow?.role ?? "");
    setAvatarUrl(currentRow?.avatarUrl ?? "");
    setPhone(currentRow?.phone ?? "");
    setZaloLink(currentRow?.zaloLink ?? "");
    setBio(currentRow?.bio ?? "");
    setSortOrder(String(currentRow?.sortOrder ?? "0"));
    setIsActive(currentRow?.isActive ?? true);
  }, [currentRow, open]);

  const isPending = createVolunteer.isPending || updateVolunteer.isPending;

  const handleSubmit = () => {
    if (!displayName.trim() || !role.trim()) {
      toast.error("Tên và vai trò không được để trống.");
      return;
    }

    const shared = {
      displayName: displayName.trim(),
      role: role.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      phone: phone.trim() || undefined,
      zaloLink: zaloLink.trim() || undefined,
      bio: bio.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    if (isEdit && currentRow) {
      updateVolunteer.mutate(
        { publicId: currentRow.publicId, input: shared as UpdateVolunteerInput },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createVolunteer.mutate(shared as CreateVolunteerInput, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Chỉnh sửa phụng sự viên" : "Thêm phụng sự viên"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin phụng sự viên." : "Thêm phụng sự viên mới vào danh sách."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tên hiển thị">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tên phụng sự viên..." />
          </Field>
          <Field label="Vai trò">
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ví dụ: Điều phối viên" />
          </Field>
          <Field label="Ảnh đại diện (URL)">
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Số điện thoại">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912..." />
          </Field>
          <Field label="Zalo">
            <Input value={zaloLink} onChange={(e) => setZaloLink(e.target.value)} placeholder="https://zalo.me/..." />
          </Field>
          <Field label="Giới thiệu">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Mô tả ngắn..." rows={2} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thứ tự hiển thị">
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </Field>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Trạng thái</span>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="volunteer-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <label htmlFor="volunteer-active" className="text-sm cursor-pointer">
                  Đang hoạt động
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isPending || !displayName.trim() || !role.trim()}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Row actions ───────────────────────────────────────────────────────

function VolunteerRowActions({ row }: { row: VolunteerItem }) {
  const { setOpen, setCurrentRow } = useVolunteers();

  const open = (dialog: "edit" | "delete") => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        { label: "Chỉnh sửa", icon: PencilIcon, onClick: () => open("edit") },
        { label: "Xoá", icon: Trash2Icon, onClick: () => open("delete"), variant: "destructive", separator: true },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function VolunteersTable() {
  const { data: envelope, isLoading } = useQuery(volunteerListOptions({ limit: 100 }));
  const volunteers = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "sortOrder", desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<VolunteerItem>[]>(
    () => [
      createSelectColumn<VolunteerItem>(),
      {
        accessorKey: "displayName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
        cell: ({ row }) => <div className="font-medium">{row.original.displayName}</div>,
        meta: { label: "Tên" },
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
        cell: ({ row }) => <div className="text-nowrap">{row.original.role}</div>,
        meta: { label: "Vai trò" },
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              Đang hoạt động
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              Không hoạt động
            </Badge>
          ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Điện thoại" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground">{row.original.phone ?? "—"}</div>
        ),
        meta: { label: "Điện thoại" },
        enableSorting: false,
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
        cell: ({ row }) => (
          <div className="tabular-nums text-muted-foreground">{row.original.sortOrder}</div>
        ),
        meta: { label: "Thứ tự" },
      },
      {
        id: "actions",
        cell: ({ row }) => <VolunteerRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: volunteers,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc phụng sự viên..."
        searchKey="displayName"
        viewButtonLabel="Xem"
        filters={[{ columnId: "isActive", title: "Trạng thái", options: activeOptions }]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có phụng sự viên nào."
      />
      <DataTableBulkActions table={table} entityName="phụng sự viên" />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function VolunteersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVolunteers();
  const deleteVolunteer = useDeleteVolunteer();

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <VolunteerFormDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
        currentRow={null}
      />
      {currentRow && (
        <>
          <VolunteerFormDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá phụng sự viên"
            description={
              <>
                Xoá <span className="font-semibold text-foreground">{currentRow.displayName}</span>?
                Thao tác này không thể hoàn tác.
              </>
            }
            confirmLabel="Xoá"
            variant="destructive"
            isPending={deleteVolunteer.isPending}
            onConfirm={() =>
              deleteVolunteer.mutate(currentRow.publicId, { onSuccess: handleClose })
            }
          />
        </>
      )}
    </>
  );
}

// ── Primary button ────────────────────────────────────────────────────

function VolunteersPrimaryButtons() {
  const { setOpen } = useVolunteers();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Thêm phụng sự viên
    </Button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function VolunteersPage() {
  return (
    <VolunteersProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Phụng sự viên</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản lý danh sách phụng sự viên và thông tin liên lạc.
            </p>
          </div>
          <VolunteersPrimaryButtons />
        </div>

        <VolunteersTable />
      </div>

      <VolunteersDialogs />
    </VolunteersProvider>
  );
}



