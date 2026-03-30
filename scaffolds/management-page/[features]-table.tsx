/**
 * SCAFFOLD — [features]-table.tsx
 *
 * Table component with toolbar filters + WorkspaceDataTable.
 * Never use raw <Table> — always WorkspaceDataTable.
 * Column definitions live here; row actions delegate to data-table-row-actions.tsx.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  WorkspaceDataTable,
  WorkspaceStatusFilterBar,
  contentStatusLabel,
  contentStatusBadgeClass,
  timeAgo,
  CONTENT_STATUS_OPTIONS,
} from "@/components/workspace";
import { [Feature]sRowActions } from "@/features/[features]/data-table-row-actions";
import { [feature]ListOptions, type [Feature]Item } from "@/features/[features]/queries";

// ── Column definitions ────────────────────────────────────────────────

const columns: ColumnDef<[Feature]Item>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant="outline" className={contentStatusBadgeClass(row.original.status)}>
        {contentStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{timeAgo(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <[Feature]sRowActions row={row.original} />,
  },
];

// ── Table component ───────────────────────────────────────────────────

export function [Feature]sTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery(
    [feature]ListOptions({ search: search || undefined, status: status || undefined }),
  );

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64"
        />
        <WorkspaceStatusFilterBar
          options={CONTENT_STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
      </div>

      {/* ── Data table ──────────────────────────────────────────── */}
      <WorkspaceDataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        total={data?.total}
      />
    </div>
  );
}
