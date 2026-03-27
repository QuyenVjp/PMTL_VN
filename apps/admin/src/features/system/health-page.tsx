import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const initialChecks = [
  { name: "API", status: "Khỏe", latency: "42 ms", note: "live + ready đều xanh" },
  { name: "Postgres", status: "Khỏe", latency: "15 ms", note: "migration và seed ổn định" },
  { name: "Redis", status: "Khỏe", latency: "6 ms", note: "cache nóng hoạt động" },
  { name: "Search", status: "Cảnh báo", latency: "168 ms", note: "có fallback events cần xử lý" },
];

export function HealthPage() {
  const [checks, setChecks] = useState(initialChecks);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Health</h1>
          <p className="text-sm text-muted-foreground">
            Màn hình kiểm tra runtime cho API, DB, cache và search theo extended health của admin.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setChecks((prev) =>
              prev.map((check) =>
                check.name === "Search"
                  ? {
                      ...check,
                      status: check.status === "Khỏe" ? "Cảnh báo" : "Khỏe",
                      note:
                        check.status === "Khỏe"
                          ? "có fallback events cần xử lý"
                          : "fallback events đã hạ nhiệt",
                    }
                  : check,
              ),
            )
          }
        >
          Làm mới probe
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardHeader>
              <CardDescription>{check.name}</CardDescription>
              <CardTitle className="text-3xl">{check.latency}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={check.status === "Khỏe" ? "secondary" : "outline"}>{check.status}</Badge>
              <p className="text-sm text-muted-foreground">{check.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết check</CardTitle>
          <CardDescription>Snapshot read-mostly để operator nhìn nhanh thành phần nào đang tạo áp lực runtime.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành phần</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Độ trễ</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((check) => (
                <TableRow key={check.name}>
                  <TableCell>{check.name}</TableCell>
                  <TableCell>
                    <Badge variant={check.status === "Khỏe" ? "secondary" : "outline"}>{check.status}</Badge>
                  </TableCell>
                  <TableCell>{check.latency}</TableCell>
                  <TableCell>{check.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
