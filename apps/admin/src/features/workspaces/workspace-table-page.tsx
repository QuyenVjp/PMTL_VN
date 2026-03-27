import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type WorkspaceStat = {
  label: string;
  value: string;
  note: string;
};

export type WorkspaceColumn = {
  key: string;
  label: string;
  className?: string;
};

export type WorkspaceRow = {
  id: string;
  actions?: string[];
  [key: string]: string | string[] | undefined;
};

export type WorkspaceFilter = {
  label: string;
  value: string;
  predicate: (row: WorkspaceRow) => boolean;
};

type WorkspaceTablePageProps = {
  title: string;
  description: string;
  searchPlaceholder: string;
  stats?: WorkspaceStat[];
  filters?: WorkspaceFilter[];
  columns: WorkspaceColumn[];
  rows: WorkspaceRow[];
  primaryAction?: string;
  emptyMessage?: string;
};

function badgeVariant(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("khỏe") ||
    normalized.includes("đang bật") ||
    normalized.includes("đang xuất bản") ||
    normalized.includes("hoạt động") ||
    normalized.includes("ổn định") ||
    normalized.includes("thành công")
  ) {
    return "secondary" as const;
  }

  if (
    normalized.includes("cảnh báo") ||
    normalized.includes("chờ duyệt") ||
    normalized.includes("nháp") ||
    normalized.includes("đang xử lý") ||
    normalized.includes("chờ gửi")
  ) {
    return "outline" as const;
  }

  if (
    normalized.includes("tắt") ||
    normalized.includes("ẩn") ||
    normalized.includes("khóa") ||
    normalized.includes("sự cố")
  ) {
    return "default" as const;
  }

  return "outline" as const;
}

function renderCellValue(key: string, value: string | string[] | undefined) {
  if (!value) {
    return "—";
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <Badge key={`${key}-${item}`} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    );
  }

  if (
    key.includes("trangThai") ||
    key.includes("uuTien") ||
    key.includes("mucDo") ||
    key.includes("sucKhoe")
  ) {
    return <Badge variant={badgeVariant(value)}>{value}</Badge>;
  }

  return value;
}

export function WorkspaceTablePage({
  title,
  description,
  searchPlaceholder,
  stats,
  filters,
  columns,
  rows,
  primaryAction,
  emptyMessage = "Không có dữ liệu phù hợp với bộ lọc hiện tại.",
}: WorkspaceTablePageProps) {
  const [query, setQuery] = useState("");
  const activeFilters = filters?.length ? filters : [{ label: "Tất cả", value: "all", predicate: () => true }];
  const [activeFilter, setActiveFilter] = useState(activeFilters[0]?.value ?? "all");

  const filteredRows = useMemo(() => {
    const filter = activeFilters.find((item) => item.value === activeFilter) ?? activeFilters[0];

    return rows.filter((row) => {
      const matchesFilter = filter?.predicate(row) ?? true;
      const haystack = Object.values(row)
        .flatMap((value) => (Array.isArray(value) ? value : [value ?? ""]))
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, activeFilters, query, rows]);

  const showActions = rows.some((row) => Boolean(row.actions?.length));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {primaryAction ? <Button>{primaryAction}</Button> : null}
      </div>

      {stats?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{stat.note}</CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="max-w-xl"
              />
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={filter.value === activeFilter ? "secondary" : "outline"}
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredRows.length} mục hiển thị
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                {showActions ? <TableHead className="w-[220px] text-right">Thao tác</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showActions ? 1 : 0)}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.key}`} className={column.className}>
                        {renderCellValue(column.key, row[column.key])}
                      </TableCell>
                    ))}
                    {showActions ? (
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {row.actions?.map((action) => (
                            <Button key={`${row.id}-${action}`} type="button" size="sm" variant="outline">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
