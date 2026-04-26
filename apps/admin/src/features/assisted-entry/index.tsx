import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ClipboardListIcon, HistoryIcon, RefreshCcwIcon, SearchIcon, UserCheckIcon } from "lucide-react";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceDataTable, WorkspaceScopeCards } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";

import {
  vowHistoryOptions,
  memberSearchOptions,
  memberVowsOptions,
  assistedEntryKeys,
  type VowHistoryFilters,
  type VowHistoryItem,
  type MemberSearchResult,
} from "./queries.js";
import { useCreateAssistedProgress, useCreateVow, useCreateLifeReleaseJournal } from "./mutations.js";

// ── Helpers ─────────────────────────────────────────────────────────

const VOW_TYPE_LABELS: Record<string, string> = {
  LIFE_RELEASE: "Phóng sanh",
  CHANTING: "Trì tụng",
  SUTRA_READING: "Đọc kinh",
  CUSTOM: "Tuỳ chỉnh",
};

function vowTypeLabel(t: string): string {
  return VOW_TYPE_LABELS[t] ?? t;
}

function statusLabel(s: string): string {
  if (s === "ACTIVE") return "Đang thực hiện";
  if (s === "COMPLETED") return "Hoàn thành";
  if (s === "CANCELLED") return "Đã huỷ";
  return s;
}

function statusBadgeClass(s: string): string {
  if (s === "ACTIVE")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (s === "COMPLETED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "CANCELLED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
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

function memberLabel(item: { member?: { displayName?: string }; user?: { displayName?: string } }) {
  return item.member?.displayName ?? item.user?.displayName ?? "Thành viên không xác định";
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const createVowSchema = z.object({
  vowType: z.enum(["LIFE_RELEASE", "CHANTING", "SUTRA_READING", "CUSTOM"]),
  description: z.string().trim().min(1, "Mô tả không được để trống."),
  assistReason: z.string().trim().min(10, "Lý do nhập hộ cần tối thiểu 10 ký tự."),
  targetCount: z.string().trim().optional(),
  startDate: z.string().trim().min(1, "Ngày bắt đầu không được để trống."),
});

type CreateVowFormValues = z.infer<typeof createVowSchema>;

const createLifeReleaseSchema = z.object({
  animalType: z.string().trim().min(1, "Loại vật không được để trống."),
  quantity: z.string().trim().min(1, "Số lượng không được để trống."),
  location: z.string().trim().min(1, "Địa điểm không được để trống."),
  note: z.string().trim().optional(),
  assistReason: z.string().trim().min(10, "Lý do nhập hộ cần tối thiểu 10 ký tự."),
  journalDate: z.string().trim().min(1, "Ngày phóng sanh không được để trống."),
});

const createProgressSchema = z.object({
  vowPublicId: z.string().trim().min(1, "Vui lòng chọn nguyện lực."),
  addCount: z.string().trim().min(1, "Số lượng tăng thêm không được để trống."),
  note: z.string().trim().optional(),
  assistReason: z.string().trim().min(10, "Lý do nhập hộ cần tối thiểu 10 ký tự."),
});

// ── Member Search Input ─────────────────────────────────────────────

function MemberSearchInput({
  selectedMember,
  onSelect,
}: {
  selectedMember: MemberSearchResult | null;
  onSelect: (m: MemberSearchResult | null) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const { data: results, isLoading } = useQuery(memberSearchOptions(searchText));

  if (selectedMember) {
    return (
      <div className="flex items-center gap-2 rounded-md border p-2">
        <span className="text-sm font-medium">{selectedMember.displayName}</span>
        <span className="text-xs text-muted-foreground">{selectedMember.email}</span>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="ml-auto h-6">
          Đổi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm thành viên (tên hoặc email)..."
          className="pl-9"
        />
      </div>
      {searchText.length >= 2 && (
        <div className="max-h-40 overflow-auto rounded-md border">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Đang tìm...</div>
          ) : results && results.length > 0 ? (
            results.map((m) => (
              <button
                key={m.publicId}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(m);
                  setSearchText("");
                }}
              >
                <span className="font-medium">{m.displayName}</span>
                <span className="text-xs text-muted-foreground">{m.email}</span>
              </button>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Không tìm thấy.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── History Tab ─────────────────────────────────────────────────────

function HistoryTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const qc = useQueryClient();

  const filters: VowHistoryFilters = {
    limit: 20,
    offset: 0,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError } = useQuery(vowHistoryOptions(filters));
  const items = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.pagination?.total ?? 0;

  const columns = useMemo<ColumnDef<VowHistoryItem>[]>(
    () => [
      {
        accessorKey: "member",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thành viên" />,
        cell: ({ row }) => <span className="font-medium">{memberLabel(row.original)}</span>,
        meta: { label: "Thành viên" },
      },
      {
        accessorKey: "vowType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại nguyện" />,
        cell: ({ row }) => <Badge variant="outline">{vowTypeLabel(row.original.vowType)}</Badge>,
        meta: { label: "Loại nguyện" },
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
        cell: ({ row }) => (
          <span className="block max-w-[260px] truncate">{row.original.description}</span>
        ),
        meta: { label: "Mô tả" },
      },
      {
        accessorKey: "targetCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mục tiêu" />,
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.targetCount ?? "—"}</span>
        ),
      },
      {
        accessorKey: "currentCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiến độ" />,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.currentCount}
            {row.original.targetCount ? ` / ${row.original.targetCount}` : ""}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
        meta: { label: "Trạng thái" },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
          <span className="text-nowrap text-muted-foreground">{timeAgo(row.original.createdAt)}</span>
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo thành viên..."
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {["", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => void qc.invalidateQueries({ queryKey: assistedEntryKeys.lists() })}
        >
          <RefreshCcwIcon className="size-4" />
        </Button>
      </div>

      {total > 0 && (
        <p className="text-sm text-muted-foreground">{total} phiếu</p>
      )}

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">
            Không tải được lịch sử nhập hộ.
          </CardContent>
        </Card>
      )}

      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc mô tả..."
        searchKey="description"
        viewButtonLabel="Xem"
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có phiếu nhập hộ nào."
      />
    </div>
  );
}

// ── Create Vow Form ─────────────────────────────────────────────────

function CreateVowForm() {
  const [member, setMember] = useState<MemberSearchResult | null>(null);
  const createVow = useCreateVow();
  const form = useAdminZodForm(createVowSchema, {
    defaultValues: {
      vowType: "LIFE_RELEASE",
      description: "",
      assistReason: "",
      targetCount: "",
      startDate: todayInputValue(),
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const handleSubmit = form.handleSubmit((formValues) => {
    if (!member) {
      form.setError("root.server", { type: "manual", message: "Vui lòng chọn thành viên." }, { shouldFocus: true });
      return;
    }
    createVow.mutate(
      {
        memberPublicId: member.publicId,
        vowType: formValues.vowType,
        description: formValues.description,
        targetCount: formValues.targetCount ? Number(formValues.targetCount) : undefined,
        startDate: formValues.startDate,
        assistReason: formValues.assistReason,
      },
      {
        onSuccess: () => {
          setMember(null);
          form.reset({
            vowType: "LIFE_RELEASE",
            description: "",
            assistReason: "",
            targetCount: "",
            startDate: todayInputValue(),
          });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phát nguyện</CardTitle>
        <CardDescription>Tạo phiếu phát nguyện hộ cho thành viên.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành viên</label>
            <MemberSearchInput selectedMember={member} onSelect={setMember} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại nguyện</label>
            <Select
              value={values.vowType}
              onValueChange={(next) => form.setValue("vowType", next as CreateVowFormValues["vowType"], { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIFE_RELEASE">Phóng sanh</SelectItem>
                <SelectItem value="CHANTING">Trì tụng</SelectItem>
                <SelectItem value="SUTRA_READING">Đọc kinh</SelectItem>
                <SelectItem value="CUSTOM">Tuỳ chỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              {...form.register("description")}
                aria-invalid={Boolean(errors.description)}
                className={invalidFieldClass(Boolean(errors.description))}
              placeholder="Nội dung lời nguyện..."
              rows={3}
            />
            <FieldError message={errors.description?.message} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do nhập hộ <span className="text-muted-foreground font-normal">(bắt buộc, tối thiểu 10 ký tự)</span>
            </label>
            <Textarea
              {...form.register("assistReason")}
              aria-invalid={Boolean(errors.assistReason)}
              className={invalidFieldClass(Boolean(errors.assistReason))}
              placeholder="VD: Thành viên nhờ ban quản trị nhập hộ vì không có thiết bị..."
              rows={2}
            />
            <FieldError message={errors.assistReason?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mục tiêu (số lần)</label>
              <Input
                type="number"
                {...form.register("targetCount")}
                aria-invalid={Boolean(errors.targetCount)}
                className={invalidFieldClass(Boolean(errors.targetCount))}
                placeholder="Không bắt buộc"
              />
              <FieldError message={errors.targetCount?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <AdminDatePicker
                value={values.startDate}
                onChange={(next) => form.setValue("startDate", next, { shouldDirty: true, shouldValidate: true })}
                placeholder="Chọn ngày bắt đầu"
                aria-invalid={Boolean(errors.startDate)}
                className={invalidFieldClass(Boolean(errors.startDate))}
              />
              <FieldError message={errors.startDate?.message} />
            </div>
          </div>
          <FieldError message={errors.root?.server?.message} />
          <Button type="submit" disabled={createVow.isPending || !member}>
            {createVow.isPending ? "Đang tạo..." : "Tạo phiếu phát nguyện"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Create Life Release Form ────────────────────────────────────────

function CreateLifeReleaseForm() {
  const [member, setMember] = useState<MemberSearchResult | null>(null);
  const createJournal = useCreateLifeReleaseJournal();
  const form = useAdminZodForm(createLifeReleaseSchema, {
    defaultValues: {
      animalType: "",
      quantity: "1",
      location: "",
      note: "",
      assistReason: "",
      journalDate: todayInputValue(),
    },
  });
  const { errors } = form.formState;

  const handleSubmit = form.handleSubmit((formValues) => {
    if (!member) {
      form.setError("root.server", { type: "manual", message: "Vui lòng chọn thành viên." }, { shouldFocus: true });
      return;
    }
    createJournal.mutate(
      {
        memberPublicId: member.publicId,
        animalType: formValues.animalType,
        quantity: Number(formValues.quantity),
        location: formValues.location,
        note: formValues.note || undefined,
        journalDate: formValues.journalDate,
        assistReason: formValues.assistReason,
      },
      {
        onSuccess: () => {
          setMember(null);
          form.reset({
            animalType: "",
            quantity: "1",
            location: "",
            note: "",
            assistReason: "",
            journalDate: todayInputValue(),
          });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phóng sanh</CardTitle>
        <CardDescription>Tạo nhật ký phóng sanh hộ cho thành viên.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành viên</label>
            <MemberSearchInput selectedMember={member} onSelect={setMember} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại vật</label>
              <Input
                {...form.register("animalType")}
                aria-invalid={Boolean(errors.animalType)}
                className={invalidFieldClass(Boolean(errors.animalType))}
                placeholder="Cá, chim, rùa..."
              />
              <FieldError message={errors.animalType?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng</label>
              <Input
                type="number"
                {...form.register("quantity")}
                aria-invalid={Boolean(errors.quantity)}
                className={invalidFieldClass(Boolean(errors.quantity))}
                placeholder="0"
              />
              <FieldError message={errors.quantity?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa điểm</label>
            <Input
              {...form.register("location")}
              aria-invalid={Boolean(errors.location)}
              className={invalidFieldClass(Boolean(errors.location))}
              placeholder="Sông, hồ, biển..."
            />
            <FieldError message={errors.location?.message} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea
              {...form.register("note")}
              aria-invalid={Boolean(errors.note)}
              className={invalidFieldClass(Boolean(errors.note))}
              placeholder="Ghi chú thêm..."
              rows={2}
            />
            <FieldError message={errors.note?.message} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do nhập hộ <span className="text-muted-foreground font-normal">(bắt buộc, tối thiểu 10 ký tự)</span>
            </label>
            <Textarea
              {...form.register("assistReason")}
              aria-invalid={Boolean(errors.assistReason)}
              className={invalidFieldClass(Boolean(errors.assistReason))}
              placeholder="VD: Thành viên nhờ ban quản trị nhập hộ vì không có thiết bị..."
              rows={2}
            />
            <FieldError message={errors.assistReason?.message} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày phóng sanh</label>
            <AdminDatePicker
              value={form.watch("journalDate")}
              onChange={(next) => form.setValue("journalDate", next, { shouldDirty: true, shouldValidate: true })}
              placeholder="Chọn ngày phóng sanh"
              aria-invalid={Boolean(errors.journalDate)}
              className={invalidFieldClass(Boolean(errors.journalDate))}
            />
            <FieldError message={errors.journalDate?.message} />
          </div>
          <FieldError message={errors.root?.server?.message} />
          <Button
            type="submit"
            disabled={createJournal.isPending || !member}
          >
            {createJournal.isPending ? "Đang tạo..." : "Tạo phiếu phóng sanh"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Create Progress Form ────────────────────────────────────────────

function CreateProgressForm() {
  const [member, setMember] = useState<MemberSearchResult | null>(null);
  const { data: memberVows, isLoading } = useQuery(memberVowsOptions(member?.publicId));
  const createProgress = useCreateAssistedProgress();
  const activeVows = (memberVows?.data ?? []).filter((vow) => vow.status === "ACTIVE");
  const form = useAdminZodForm(createProgressSchema, {
    defaultValues: {
      vowPublicId: "",
      addCount: "1",
      note: "",
      assistReason: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const handleSubmit = form.handleSubmit((formValues) => {
    if (!member) {
      form.setError("root.server", { type: "manual", message: "Vui lòng chọn thành viên." }, { shouldFocus: true });
      return;
    }
    createProgress.mutate(
      {
        memberPublicId: member.publicId,
        vowPublicId: formValues.vowPublicId,
        addCount: Number(formValues.addCount),
        note: formValues.note || undefined,
        assistReason: formValues.assistReason,
      },
      {
        onSuccess: () => {
          form.reset({
            vowPublicId: "",
            addCount: "1",
            note: "",
            assistReason: "",
          });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cập nhật tiến độ</CardTitle>
        <CardDescription>
          Nhập hộ tiến độ cho một nguyện lực đang thực hiện. Mọi thay đổi đều ghi audit owner/actor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành viên</label>
            <MemberSearchInput
              selectedMember={member}
              onSelect={(next) => {
                setMember(next);
                form.setValue("vowPublicId", "", { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nguyện lực</label>
            <Select
              value={values.vowPublicId}
              onValueChange={(next) => form.setValue("vowPublicId", next, { shouldDirty: true, shouldValidate: true })}
              disabled={!member || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Đang tải nguyện lực..." : "Chọn nguyện lực đang thực hiện"} />
              </SelectTrigger>
              <SelectContent>
                {activeVows.map((vow) => (
                  <SelectItem key={vow.publicId} value={vow.publicId}>
                    {vowTypeLabel(vow.vowType)} - {vow.currentCount}
                    {vow.targetCount ? `/${vow.targetCount}` : ""} - {vow.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {member && !isLoading && activeVows.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Thành viên này chưa có nguyện lực đang thực hiện.
              </p>
            ) : null}
            <FieldError message={errors.vowPublicId?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng tăng thêm</label>
              <Input
                type="number"
                min={1}
                {...form.register("addCount")}
                aria-invalid={Boolean(errors.addCount)}
                className={invalidFieldClass(Boolean(errors.addCount))}
                placeholder="1"
              />
              <FieldError message={errors.addCount?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Input
                {...form.register("note")}
                aria-invalid={Boolean(errors.note)}
                className={invalidFieldClass(Boolean(errors.note))}
                placeholder="Không bắt buộc"
              />
              <FieldError message={errors.note?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do nhập hộ <span className="text-muted-foreground font-normal">(bắt buộc, tối thiểu 10 ký tự)</span>
            </label>
            <Textarea
              {...form.register("assistReason")}
              aria-invalid={Boolean(errors.assistReason)}
              className={invalidFieldClass(Boolean(errors.assistReason))}
              placeholder="VD: Thành viên báo tiến độ qua điện thoại, ban quản trị nhập hộ..."
              rows={2}
            />
            <FieldError message={errors.assistReason?.message} />
          </div>
          <FieldError message={errors.root?.server?.message} />
          <Button
            type="submit"
            disabled={createProgress.isPending || !member}
          >
            {createProgress.isPending ? "Đang cập nhật..." : "Cập nhật tiến độ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Assisted Entry Page ─────────────────────────────────────────────

export function AssistedEntryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Nhập hộ phát nguyện</h1>
        <p className="text-sm text-muted-foreground">
          Hỗ trợ nhập hộ lời nguyện, tra cứu thành viên và kiểm tra lịch sử.
        </p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Actor / owner rõ ràng",
            description: "Admin là người nhập hộ, thành viên là chủ lời nguyện hoặc nhật ký. API phải giữ đủ actorUserId và ownerUserId.",
            badge: "Assisted entry",
            icon: UserCheckIcon,
          },
          {
            title: "Không thay content",
            description: "Trang này chỉ ghi state phát nguyện/phóng sanh, không sửa hướng dẫn Kinh bài tập hay Phóng Sanh.",
            badge: "Vows-merit",
            icon: ClipboardListIcon,
          },
          {
            title: "Lịch sử là audit surface",
            description: "Mọi phiếu nhập hộ phải quay lại được lịch sử để kiểm tra người nhập, thành viên và lý do.",
            badge: "Audit required",
            icon: HistoryIcon,
          },
        ]}
      />

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="create">Tạo phiếu</TabsTrigger>
          <TabsTrigger value="progress">Cập nhật tiến độ</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <HistoryTab />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <CreateVowForm />
            <CreateLifeReleaseForm />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <div className="max-w-3xl">
            <CreateProgressForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
