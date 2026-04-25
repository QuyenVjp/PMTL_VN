import { useMemo, useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable } from "@/components/workspace";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";

const dailyRecitationKeys = {
  all: ["admin-daily-recitation"] as const,
  schedules: () => [...dailyRecitationKeys.all, "schedules"] as const,
  guidelines: () => [...dailyRecitationKeys.all, "guidelines"] as const,
  routines: () => [...dailyRecitationKeys.all, "routines"] as const,
};

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type ScheduleRow = {
  publicId: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  dailyMinutes: number;
  minRecitations: number;
  maxRecitations: number | null;
  status: Status;
  createdAt: string;
  _count?: { guidelines?: number; routines?: number };
};

type GuidelineRow = {
  publicId: string;
  topic: string;
  guidance: string;
  importance: Importance;
  createdAt: string;
  schedule?: { publicId: string; name: string } | null;
};

type RoutineRow = {
  publicId: string;
  dayNumber: number;
  scriptureSequence: string[];
  timing: string;
  notes: string | null;
  createdAt: string;
  schedule?: { publicId: string; name: string } | null;
};

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã ẩn", value: "ARCHIVED" },
];

const difficultyOptions = [
  { label: "Cơ bản", value: "BEGINNER" },
  { label: "Trung cấp", value: "INTERMEDIATE" },
  { label: "Nâng cao", value: "ADVANCED" },
];

function listSchedulesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.schedules(),
    queryFn: () =>
      adminClient.get<ListEnvelope<ScheduleRow>>("/admin/daily-recitation/schedules", {
        page: 1,
        limit: 100,
      }),
  });
}

function listGuidelinesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.guidelines(),
    queryFn: () =>
      adminClient.get<ListEnvelope<GuidelineRow>>("/admin/daily-recitation/guidelines", {
        page: 1,
        limit: 100,
      }),
  });
}

function listRoutinesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.routines(),
    queryFn: () => adminClient.get<{ data: RoutineRow[] }>("/admin/daily-recitation/routines"),
  });
}

function statusLabel(status: Status) {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  return "Đã ẩn";
}

function difficultyLabel(difficulty: Difficulty) {
  if (difficulty === "BEGINNER") return "Cơ bản";
  if (difficulty === "INTERMEDIATE") return "Trung cấp";
  return "Nâng cao";
}

function importanceLabel(importance: Importance) {
  if (importance === "CRITICAL") return "Bắt buộc";
  if (importance === "HIGH") return "Cao";
  if (importance === "MEDIUM") return "Vừa";
  return "Thấp";
}

function statusBadgeClass(status: Status) {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function RecitationSchedulesTablePage() {
  const { data, isLoading } = useQuery(listSchedulesOptions());
  const rows = useMemo(() => data?.data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ScheduleRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kế hoạch" />,
        cell: ({ row }) => (
          <div className="max-w-[360px]">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.description ?? "Chưa có mô tả"}
            </p>
          </div>
        ),
        meta: { label: "Kế hoạch" },
      },
      {
        accessorKey: "difficulty",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cấp độ" />,
        cell: ({ row }) => <Badge variant="outline">{difficultyLabel(row.original.difficulty)}</Badge>,
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Cấp độ" },
      },
      {
        accessorKey: "dailyMinutes",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thời lượng" />,
        cell: ({ row }) => `${row.original.dailyMinutes} phút/ngày`,
        meta: { label: "Thời lượng" },
      },
      {
        accessorKey: "minRecitations",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số biến" />,
        cell: ({ row }) =>
          row.original.maxRecitations
            ? `${row.original.minRecitations}-${row.original.maxRecitations}`
            : `${row.original.minRecitations}+`,
        meta: { label: "Số biến" },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
      },
      {
        id: "coverage",
        header: "Nội dung",
        cell: ({ row }) =>
          `${row.original._count?.guidelines ?? 0} hướng dẫn / ${row.original._count?.routines ?? 0} ngày`,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nội dung / Niệm kinh"
        title="Kế hoạch"
        description="Danh sách kế hoạch tụng kinh lấy từ API quản trị, dùng để kiểm tra cấp độ, thời lượng, số biến và độ phủ hướng dẫn/ngày thực hành."
      />
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc kế hoạch..."
        searchKey="name"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "difficulty", title: "Cấp độ", options: difficultyOptions },
          { columnId: "status", title: "Trạng thái", options: statusOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có kế hoạch tụng kinh nào."
      />
    </div>
  );
}

export function RecitationGuidelinesTablePage() {
  const { data, isLoading } = useQuery(listGuidelinesOptions());
  const rows = useMemo(() => data?.data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<GuidelineRow>[]>(
    () => [
      {
        accessorKey: "topic",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chủ đề" />,
        cell: ({ row }) => (
          <div className="max-w-[420px]">
            <p className="truncate font-medium">{row.original.topic}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.guidance}</p>
          </div>
        ),
        meta: { label: "Chủ đề" },
      },
      {
        accessorKey: "schedule.name",
        header: "Kế hoạch",
        cell: ({ row }) => row.original.schedule?.name ?? "Chưa gắn kế hoạch",
      },
      {
        accessorKey: "importance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mức độ" />,
        cell: ({ row }) => (
          <Badge variant={row.original.importance === "CRITICAL" ? "destructive" : "outline"}>
            {importanceLabel(row.original.importance)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nội dung / Niệm kinh"
        title="Bản kinh"
        description="Màn hình này không dùng nội dung mẫu nữa; dữ liệu lấy từ guideline API của thời khóa tụng kinh để operator kiểm tra chủ đề, lời hướng dẫn và mức độ bắt buộc."
      />
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc chủ đề..."
        searchKey="topic"
        viewButtonLabel="Xem"
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có guideline bản kinh nào."
      />
    </div>
  );
}

export function RecitationRoutinesTablePage() {
  const { data, isLoading } = useQuery(listRoutinesOptions());
  const rows = useMemo(() => data?.data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<RoutineRow>[]>(
    () => [
      {
        accessorKey: "dayNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày" />,
        cell: ({ row }) => `Ngày ${row.original.dayNumber}`,
      },
      {
        accessorKey: "schedule.name",
        header: "Kế hoạch",
        cell: ({ row }) => row.original.schedule?.name ?? "Chưa gắn kế hoạch",
      },
      {
        accessorKey: "scriptureSequence",
        header: "Trình tự",
        cell: ({ row }) => (
          <div className="max-w-[460px] truncate">
            {row.original.scriptureSequence.join(" → ") || "Chưa có trình tự"}
          </div>
        ),
      },
      {
        accessorKey: "timing",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thời điểm" />,
        cell: ({ row }) => row.original.timing,
      },
      {
        accessorKey: "notes",
        header: "Ghi chú",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.notes ?? "—"}</span>
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nội dung / Niệm kinh"
        title="Nghi thức"
        description="Theo dõi routine từng ngày của thời khóa tụng kinh từ API, gồm trình tự bản kinh, thời điểm thực hành và ghi chú vận hành."
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có routine nghi thức nào."
      />
    </div>
  );
}
