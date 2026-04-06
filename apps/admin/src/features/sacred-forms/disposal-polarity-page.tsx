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

const DISPOSAL_RULES = [
  {
    loaiDon: "Đổi Pháp danh",
    quyTac: "Đốt an toàn",
    ghiChu: "Bắt buộc",
    polarity: "burn" as const,
  },
  {
    loaiDon: "Đơn Khuyến Đạo",
    quyTac: "Lưu trữ / Niêm phong",
    ghiChu: "Tuyệt đối cấm đốt",
    polarity: "keep" as const,
  },
  {
    loaiDon: "Các đơn khác",
    quyTac: "Theo hướng dẫn",
    ghiChu: "Xem từng mẫu",
    polarity: "other" as const,
  },
];

const POLARITY_BADGE: Record<"burn" | "keep" | "other", { label: string; variant: "destructive" | "secondary" | "outline" }> = {
  burn: { label: "Đốt an toàn", variant: "destructive" },
  keep: { label: "Lưu trữ", variant: "secondary" },
  other: { label: "Theo hướng dẫn", variant: "outline" },
};

export function DisposalPolarityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy tắc xử lý đơn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quy tắc phân cực xử lý đơn Pháp Bảo — đốt / không đốt
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Alert variant="destructive">
          <AlertTitle>Quy tắc 1 — Bắt buộc đốt an toàn</AlertTitle>
          <AlertDescription>
            Đơn <strong>đổi Pháp danh</strong> sau khi được duyệt phải tiến hành{" "}
            <strong>đốt an toàn</strong> (safe incineration) theo nghi thức. Không được lưu trữ
            bản gốc.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTitle>Quy tắc 2 — Tuyệt đối cấm đốt</AlertTitle>
          <AlertDescription>
            Đơn <strong>Khuyến Đạo</strong> phải được <strong>lưu trữ và niêm phong</strong> vĩnh
            viễn. Tuyệt đối cấm đốt dưới bất kỳ hình thức nào.
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
              {DISPOSAL_RULES.map((rule) => {
                const badge = POLARITY_BADGE[rule.polarity];
                return (
                  <TableRow key={rule.loaiDon}>
                    <TableCell className="font-medium">{rule.loaiDon}</TableCell>
                    <TableCell>{rule.quyTac}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{rule.ghiChu}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
