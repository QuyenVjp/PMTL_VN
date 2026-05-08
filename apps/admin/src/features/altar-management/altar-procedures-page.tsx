import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceDataTable,
  WorkspaceDetailField,
  WorkspaceDetailSection,
  WorkspaceDetailSheet,
  WorkspaceDetailStandardSections,
} from "@/components/workspace";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { protocolTemplatesOptions, type ProtocolTemplate } from "./queries.js";

function protocolTypeLabel(type: string) {
  const labels: Record<string, string> = {
    DAILY_WATER_CHANGE: "Thay nước hằng ngày",
    WEEKLY_CLEANING: "Vệ sinh định kỳ",
    OFFERING_CHECK: "Kiểm tra lễ phẩm",
  };
  return labels[type] ?? type;
}

function activeLabel(isActive: boolean | undefined) {
  return isActive === false ? "Ngưng dùng" : "Đang dùng";
}

function activeBadgeClass(isActive: boolean | undefined) {
  return isActive === false
    ? "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
}

export function AltarProceduresPage() {
  const { data, isLoading, isError } = useQuery(protocolTemplatesOptions());
  const templates = data ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | null>(null);

  const columns = useMemo<ColumnDef<ProtocolTemplate>[]>(
    () => [
      {
        accessorKey: "titleVi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên quy trình" />,
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <div className="font-medium">{row.original.titleVi}</div>
            {row.original.descriptionVi ? (
              <div className="mt-1 line-clamp-2 max-w-[360px] text-sm text-muted-foreground">
                {row.original.descriptionVi}
              </div>
            ) : null}
          </div>
        ),
        meta: { label: "Tên quy trình" },
        enableHiding: false,
      },
      {
        accessorKey: "protocolType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => <div className="text-nowrap">{protocolTypeLabel(row.original.protocolType)}</div>,
        meta: { label: "Loại" },
      },
      {
        id: "steps",
        accessorFn: (row) => row.steps?.length ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số bước" />,
        cell: ({ row }) => <div className="tabular-nums">{row.original.steps?.length ?? 0}</div>,
        meta: { label: "Số bước" },
      },
      {
        id: "firstStep",
        accessorFn: (row) => row.steps?.[0]?.title ?? "",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bước đầu" />,
        cell: ({ row }) => (
          <div className="max-w-[280px] truncate text-sm text-muted-foreground">
            {row.original.steps?.[0]?.title ?? "Chưa có bước"}
          </div>
        ),
        meta: { label: "Bước đầu" },
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={activeBadgeClass(row.original.isActive)}>
            {activeLabel(row.original.isActive)}
          </Badge>
        ),
        meta: { label: "Trạng thái" },
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: templates,
    columns,
    state: { sorting, columnVisibility },
    getRowId: (row) => row.publicId ?? row.id ?? row.protocolType,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình bàn thờ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rà soát template quy trình, trạng thái hiệu lực và số bước đang được backend công bố.
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-destructive">
          Không tải được danh sách quy trình bàn thờ.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            table={table}
            searchPlaceholder="Lọc theo tên quy trình..."
            searchKey="titleVi"
            viewButtonLabel="Xem"
          />
          <WorkspaceDataTable
            table={table}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Chưa có quy trình bàn thờ nào."
            onRowClick={setSelectedTemplate}
          />
        </div>
      )}
      <WorkspaceDetailSheet
        open={Boolean(selectedTemplate)}
        onOpenChange={(open) => {
          if (!open) setSelectedTemplate(null);
        }}
        title={selectedTemplate?.titleVi ?? "Chi tiết quy trình"}
        subtitle={selectedTemplate ? protocolTypeLabel(selectedTemplate.protocolType) : undefined}
        status={
          selectedTemplate ? (
            <Badge variant="outline" className={activeBadgeClass(selectedTemplate.isActive)}>
              {activeLabel(selectedTemplate.isActive)}
            </Badge>
          ) : undefined
        }
      >
        {selectedTemplate ? (
          <>
            <WorkspaceDetailSection title="Thông tin">
              <WorkspaceDetailField label="Loại" value={protocolTypeLabel(selectedTemplate.protocolType)} />
              <WorkspaceDetailField label="Trạng thái" value={activeLabel(selectedTemplate.isActive)} />
              <WorkspaceDetailField label="Số bước" value={selectedTemplate.steps?.length ?? 0} />
              <WorkspaceDetailField label="Mô tả" value={selectedTemplate.descriptionVi} stacked />
            </WorkspaceDetailSection>
            <WorkspaceDetailSection title="Các bước">
              <div className="space-y-3">
                {selectedTemplate.steps?.length ? (
                  selectedTemplate.steps.map((step, index) => (
                    <div key={`${selectedTemplate.protocolType}-${index}`} className="rounded-md border bg-muted/30 p-3">
                      <div className="text-sm font-medium">
                        {index + 1}. {step.title}
                      </div>
                      {step.description ? (
                        <div className="mt-1 text-sm text-muted-foreground">{step.description}</div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có bước cấu hình.</p>
                )}
              </div>
            </WorkspaceDetailSection>
            <WorkspaceDetailStandardSections
              editNote="Quy trình bàn thờ là dữ liệu backend công bố; trang này chỉ rà soát trạng thái và nội dung đang hiệu lực."
              auditNote="Audit thao tác quy trình sẽ hiển thị tại đây khi API trả lịch sử thay đổi template."
            />
          </>
        ) : null}
      </WorkspaceDetailSheet>
    </div>
  );
}
