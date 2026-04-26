import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
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
import { BookMarkedIcon, BookOpenCheckIcon, EyeIcon } from "lucide-react";

import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableToolbar,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceDataTable, WorkspaceDetailSheet, WorkspaceDetailStandardSections, WorkspaceRowActions } from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import {
  getChantEnvironmentRulesQueryOptions,
} from "@/features/chant-admin/queries";
import { useUpdateEnvironmentRule } from "@/features/chant-admin/mutations";
import type { ChantEnvironmentRuleRow, ChantEnvironmentRulesResponse } from "@/features/chant-admin/types";

const severityLabels: Record<string, string> = {
  advisory: "Khuyến cáo",
  caution: "Lưu ý",
  strong_guardrail: "Quan trọng",
  quality_guidance: "Hướng dẫn",
  reference_only: "Tham khảo",
};

const productizationLabels: Record<string, string> = {
  do_not_automate: "Không tự động hoá",
  warning_card: "Warning card",
  checklist_item: "Checklist",
  safe_lane_suggestion: "Safe lane",
  drawer_note: "Ghi chú",
  reference_only_note: "Chỉ tham khảo",
};

const severityOptions = [
  { label: "Khuyến cáo", value: "advisory" },
  { label: "Lưu ý", value: "caution" },
  { label: "Quan trọng", value: "strong_guardrail" },
  { label: "Hướng dẫn", value: "quality_guidance" },
  { label: "Tham khảo", value: "reference_only" },
];

const productizationOptions = [
  { label: "Không tự động hoá", value: "do_not_automate" },
  { label: "Warning card", value: "warning_card" },
  { label: "Checklist", value: "checklist_item" },
  { label: "Safe lane", value: "safe_lane_suggestion" },
  { label: "Ghi chú", value: "drawer_note" },
  { label: "Chỉ tham khảo", value: "reference_only_note" },
];

function flattenEnvironmentRules(
  response: ChantEnvironmentRulesResponse,
): ChantEnvironmentRuleRow[] {
  return response.groups.flatMap((group) =>
    group.rules.map((rule) => ({
      groupKey: group.groupKey,
      groupTitle: group.title,
      ruleKey: rule.ruleKey,
      title: rule.title,
      canonicalWording: rule.canonicalWording,
      severity: rule.severity,
      productizationMode: rule.productizationMode,
      referenceOnly: rule.referenceOnly,
    })),
  );
}

function EnvironmentRuleRowActions({
  row,
  onEdit,
  onToggleReferenceOnly,
}: {
  row: ChantEnvironmentRuleRow;
  onEdit: (row: ChantEnvironmentRuleRow) => void;
  onToggleReferenceOnly: (row: ChantEnvironmentRuleRow) => void;
}) {
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          icon: EyeIcon,
          onClick: () => onEdit(row),
        },
        {
          label: row.referenceOnly ? "Bỏ tham khảo" : "Đặt tham khảo",
          icon: row.referenceOnly ? BookOpenCheckIcon : BookMarkedIcon,
          onClick: () => onToggleReferenceOnly(row),
        },
      ]}
    />
  );
}

type EnvironmentRuleEditDialogProps = {
  open: boolean;
  row: ChantEnvironmentRuleRow | null;
  onOpenChange: (open: boolean) => void;
};

function EnvironmentRuleEditDialog({
  open,
  row,
  onOpenChange,
}: EnvironmentRuleEditDialogProps) {
  const updateRule = useUpdateEnvironmentRule();
  const [title, setTitle] = useState("");
  const [canonicalWording, setCanonicalWording] = useState("");
  const [severity, setSeverity] = useState("advisory");
  const [productizationMode, setProductizationMode] = useState("warning_card");
  const [referenceOnly, setReferenceOnly] = useState(false);

  useEffect(() => {
    if (!row || !open) {
      return;
    }
    setTitle(row.title);
    setCanonicalWording(row.canonicalWording);
    setSeverity(row.severity);
    setProductizationMode(row.productizationMode);
    setReferenceOnly(row.referenceOnly);
  }, [open, row]);

  if (!row) {
    return null;
  }

  const handleSave = () => {
    updateRule.mutate(
      {
        ruleKey: row.ruleKey,
        payload: {
          title: title.trim(),
          canonicalWording: canonicalWording.trim(),
          severity,
          productizationMode,
          referenceOnly,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={row.title}
      subtitle={`Rule ${row.ruleKey} · ${row.groupTitle}`}
    >

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung chuẩn</label>
            <Textarea
              value={canonicalWording}
              onChange={(event) => setCanonicalWording(event.target.value)}
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mức độ</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Productization</label>
              <Select value={productizationMode} onValueChange={setProductizationMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productizationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="reference-only"
              checked={referenceOnly}
              onCheckedChange={(checked) => setReferenceOnly(checked === true)}
            />
            <label htmlFor="reference-only" className="text-sm font-medium cursor-pointer">
              Chỉ tham khảo (reference-only)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateRule.isPending || !title.trim() || !canonicalWording.trim()}
          >
            {updateRule.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
    <WorkspaceDetailStandardSections />
    </WorkspaceDetailSheet>
  );
}

export function EnvironmentRulesTable() {
  const { data, isLoading } = useQuery(getChantEnvironmentRulesQueryOptions());
  const updateRule = useUpdateEnvironmentRule();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingRow, setEditingRow] = useState<ChantEnvironmentRuleRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const rows = useMemo(() => (data ? flattenEnvironmentRules(data) : []), [data]);

  const columns = useMemo<ColumnDef<ChantEnvironmentRuleRow>[]>(
    () => [
      createSelectColumn<ChantEnvironmentRuleRow>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Quy tắc" />,
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.title}</div>
            <div className="max-w-[48rem] truncate text-sm text-muted-foreground">
              {row.original.canonicalWording}
            </div>
          </div>
        ),
        meta: { label: "Quy tắc" },
      },
      {
        accessorKey: "groupTitle",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nhóm" />,
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium">{row.original.groupTitle}</div>
            <div className="text-xs text-muted-foreground">{row.original.groupKey}</div>
          </div>
        ),
        meta: { label: "Nhóm" },
        enableSorting: false,
      },
      {
        accessorKey: "severity",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mức độ" />,
        cell: ({ row }) => (
          <Badge variant="outline">
            {severityLabels[row.original.severity] ?? row.original.severity}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Mức độ" },
      },
      {
        accessorKey: "productizationMode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Productization" />,
        cell: ({ row }) => (
          <div className="text-sm">
            {productizationLabels[row.original.productizationMode] ??
              row.original.productizationMode}
          </div>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Productization" },
        enableSorting: false,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <EnvironmentRuleRowActions
            row={row.original}
            onEdit={(selectedRow) => {
              setEditingRow(selectedRow);
              setEditOpen(true);
            }}
            onToggleReferenceOnly={(selectedRow) => {
              void updateRule.mutateAsync({
                ruleKey: selectedRow.ruleKey,
                payload: { referenceOnly: !selectedRow.referenceOnly },
              });
            }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, columnFilters, rowSelection },
    getRowId: (row) => row.ruleKey,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const markSelectedAsReferenceOnly = async () => {
    if (!selectedRows.length) {
      return;
    }

    await Promise.all(
      selectedRows.map((row) =>
        updateRule.mutateAsync({
          ruleKey: row.ruleKey,
          payload: { referenceOnly: true },
        }),
      ),
    );
    table.resetRowSelection();
  };

  const unmarkSelectedReferenceOnly = async () => {
    if (!selectedRows.length) {
      return;
    }

    await Promise.all(
      selectedRows.map((row) =>
        updateRule.mutateAsync({
          ruleKey: row.ruleKey,
          payload: { referenceOnly: false },
        }),
      ),
    );
    table.resetRowSelection();
  };

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Tìm theo nhóm, rule key hoặc wording..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "severity", title: "Mức độ", options: severityOptions },
          {
            columnId: "productizationMode",
            title: "Productization",
            options: productizationOptions,
          },
        ]}
      />

      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Không có quy tắc nào."
        onRowClick={(row) => {
          setEditingRow(row);
          setEditOpen(true);
        }}
      />

      <DataTableBulkActions table={table} entityName="quy tắc">
        <Button
          size="sm"
          variant="outline"
          disabled={updateRule.isPending}
          onClick={() => void markSelectedAsReferenceOnly()}
        >
          Đặt tham khảo
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={updateRule.isPending}
          onClick={() => void unmarkSelectedReferenceOnly()}
        >
          Bỏ tham khảo
        </Button>
      </DataTableBulkActions>

      <EnvironmentRuleEditDialog
        open={editOpen}
        row={editingRow}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingRow(null);
          }
        }}
      />
    </div>
  );
}
