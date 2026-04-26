import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, BarChart3Icon, ShieldAlertIcon } from "lucide-react";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { speciesSummaryOptions } from "./queries.js";
import { SPECIES_LABELS, type SpeciesSummaryItem } from "./types.js";

export function SpeciesSummaryPage() {
  const { data: envelope, isLoading } = useQuery(speciesSummaryOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<SpeciesSummaryItem>[] = useMemo(
    () => [
      { accessorKey: "species", header: "Loài", cell: ({ row }) => SPECIES_LABELS[row.original.species] },
      { accessorKey: "totalReleased", header: "Tổng số đã phóng sinh" },
    ],
    []
  );

  const table = useSafeReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê theo loài</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tổng hợp operational từ journal phóng sinh, dùng để rà xu hướng và cảnh báo loài nhạy cảm.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3Icon className="size-4 text-muted-foreground" />
              Derived metric
            </CardTitle>
            <CardDescription>Không phải nơi nhập sửa ritual hoặc journal gốc.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dữ liệu được tổng hợp từ hồ sơ phóng sinh; muốn sửa record thì mở danh sách hồ sơ.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlertIcon className="size-4 text-muted-foreground" />
              Guardrails theo loài
            </CardTitle>
            <CardDescription>Loài săn mồi, môi trường sống và ngoại lệ cần review thủ công.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/phong-sinh/ho-so">
                Mở hồ sơ phóng sinh
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có dữ liệu thống kê." />
    </div>
  );
}
