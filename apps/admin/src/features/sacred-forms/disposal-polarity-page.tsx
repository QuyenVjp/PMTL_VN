import { useQuery, queryOptions } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminClient } from "@/lib/api/admin-client.js";

import { sacredFormKeys } from "./queries.js";

type DisposalPolarity = "BURN" | "KEEP" | "OTHER";

interface DisposalPolarityItem {
  publicId?: string;
  id?: string;
  formType: string;
  polarity: DisposalPolarity;
  rule?: string | null;
  note?: string | null;
  effectiveAt?: string | null;
}

const POLARITY_BADGE: Record<
  DisposalPolarity,
  { label: string; variant: "destructive" | "secondary" | "outline" }
> = {
  BURN: { label: "Đốt an toàn", variant: "destructive" },
  KEEP: { label: "Lưu trữ / Niêm phong", variant: "secondary" },
  OTHER: { label: "Theo hướng dẫn", variant: "outline" },
};

const disposalPolaritiesOptions = queryOptions({
  queryKey: [...sacredFormKeys.all, "disposal-polarities"] as const,
  queryFn: () =>
    adminClient.get<{ data: DisposalPolarityItem[] }>(
      "/admin/sacred-forms/disposal-polarities",
    ),
});

export function DisposalPolarityPage() {
  const { data, isLoading, isError } = useQuery(disposalPolaritiesOptions);
  const rules = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy tắc xử lý đơn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quy tắc phân cực xử lý đơn Pháp Bảo — đốt / không đốt. Dữ liệu lấy từ máy chủ.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Alert variant="destructive">
          <AlertTitle>Quy tắc 1 — Bắt buộc đốt an toàn</AlertTitle>
          <AlertDescription>
            Đơn <strong>đổi Pháp danh</strong> sau khi được duyệt phải tiến hành{" "}
            <strong>đốt an toàn</strong> theo nghi thức. Không được lưu trữ bản gốc.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTitle>Quy tắc 2 — Tuyệt đối cấm đốt</AlertTitle>
          <AlertDescription>
            Đơn <strong>Khuyến Đạo</strong> phải được <strong>lưu trữ và niêm phong</strong> vĩnh viễn.
            Tuyệt đối cấm đốt dưới bất kỳ hình thức nào.
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng phân cực xử lý đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại đơn</TableHead>
                <TableHead>Quy tắc xử lý</TableHead>
                <TableHead>Phân cực</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-destructive">
                    Không tải được quy tắc xử lý đơn.
                  </TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Chưa có quy tắc nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule, idx) => {
                  const badge = POLARITY_BADGE[rule.polarity] ?? POLARITY_BADGE.OTHER;
                  return (
                    <TableRow key={rule.publicId ?? rule.id ?? `${rule.formType}-${idx}`}>
                      <TableCell className="font-medium">{rule.formType}</TableCell>
                      <TableCell>{rule.rule ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rule.note ?? "—"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
