import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { RefreshCcwIcon, SearchIcon } from "lucide-react";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";

import {
  vowHistoryOptions,
  memberSearchOptions,
  assistedEntryKeys,
  type VowHistoryFilters,
  type VowHistoryItem,
  type MemberSearchResult,
} from "./queries.js";
import { useCreateVow, useCreateLifeReleaseJournal } from "./mutations.js";

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
  const [vowType, setVowType] = useState("LIFE_RELEASE");
  const [description, setDescription] = useState("");
  const [assistReason, setAssistReason] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const createVow = useCreateVow();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !description.trim() || assistReason.trim().length < 10) return;
    createVow.mutate(
      {
        memberPublicId: member.publicId,
        vowType,
        description: description.trim(),
        targetCount: targetCount ? Number(targetCount) : undefined,
        startDate,
        assistReason: assistReason.trim(),
      },
      {
        onSuccess: () => {
          setMember(null);
          setDescription("");
          setAssistReason("");
          setTargetCount("");
          setStartDate(new Date().toISOString().slice(0, 10));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phát nguyện</CardTitle>
        <CardDescription>Tạo phiếu phát nguyện hộ cho thành viên.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành viên</label>
            <MemberSearchInput selectedMember={member} onSelect={setMember} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại nguyện</label>
            <Select value={vowType} onValueChange={setVowType}>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung lời nguyện..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do nhập hộ <span className="text-muted-foreground font-normal">(bắt buộc, tối thiểu 10 ký tự)</span>
            </label>
            <Textarea
              value={assistReason}
              onChange={(e) => setAssistReason(e.target.value)}
              placeholder="VD: Thành viên nhờ ban quản trị nhập hộ vì không có thiết bị..."
              rows={2}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mục tiêu (số lần)</label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="Không bắt buộc"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={createVow.isPending || !member || !description.trim() || assistReason.trim().length < 10}>
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
  const [animalType, setAnimalType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [assistReason, setAssistReason] = useState("");
  const [journalDate, setJournalDate] = useState(new Date().toISOString().slice(0, 10));
  const createJournal = useCreateLifeReleaseJournal();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !animalType.trim() || !quantity || !location.trim() || assistReason.trim().length < 10) return;
    createJournal.mutate(
      {
        memberPublicId: member.publicId,
        animalType: animalType.trim(),
        quantity: Number(quantity),
        location: location.trim(),
        note: note.trim() || undefined,
        journalDate,
        assistReason: assistReason.trim(),
      },
      {
        onSuccess: () => {
          setMember(null);
          setAnimalType("");
          setQuantity("");
          setLocation("");
          setNote("");
          setAssistReason("");
          setJournalDate(new Date().toISOString().slice(0, 10));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phóng sanh</CardTitle>
        <CardDescription>Tạo nhật ký phóng sanh hộ cho thành viên.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành viên</label>
            <MemberSearchInput selectedMember={member} onSelect={setMember} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại vật</label>
              <Input
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                placeholder="Cá, chim, rùa..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa điểm</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Sông, hồ, biển..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do nhập hộ <span className="text-muted-foreground font-normal">(bắt buộc, tối thiểu 10 ký tự)</span>
            </label>
            <Textarea
              value={assistReason}
              onChange={(e) => setAssistReason(e.target.value)}
              placeholder="VD: Thành viên nhờ ban quản trị nhập hộ vì không có thiết bị..."
              rows={2}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày phóng sanh</label>
            <Input
              type="date"
              value={journalDate}
              onChange={(e) => setJournalDate(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={createJournal.isPending || !member || !animalType.trim() || !quantity || !location.trim() || assistReason.trim().length < 10}
          >
            {createJournal.isPending ? "Đang tạo..." : "Tạo phiếu phóng sanh"}
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

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="create">Tạo phiếu</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
