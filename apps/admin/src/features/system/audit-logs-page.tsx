import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const auditLogs = [
  ["27/03 15:10", "admin@pmtl.local", "CẬP NHẬT", "feature_flags", "admin_search_ops"],
  ["27/03 15:02", "qa@pmtl.local", "TẠO", "assisted_entry", "AE-401"],
  ["27/03 14:58", "ops@pmtl.local", "XEM", "health", "extended-checks"],
  ["27/03 14:47", "editor@pmtl.local", "CẬP NHẬT", "chant_scripts", "nghi-thuc-toi"],
];

export function AuditLogsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => auditLogs.filter((entry) => entry.join(" ").toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Audit logs</h1>
        <p className="text-sm text-muted-foreground">
          Event stream tra cứu thao tác quản trị, phục vụ đối soát hành vi và truy nguyên thay đổi.
        </p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm log theo actor, resource hoặc đối tượng"
        className="max-w-xl"
      />

      <Card>
        <CardHeader>
          <CardTitle>Luồng sự kiện</CardTitle>
          <CardDescription>Luồng audit là read-mostly, chỉ làm mới thủ công khi cần đối soát sâu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Đối tượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(([time, actor, action, resource, target]) => (
                <TableRow key={`${time}-${target}`}>
                  <TableCell>{time}</TableCell>
                  <TableCell>{actor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{action}</Badge>
                  </TableCell>
                  <TableCell>{resource}</TableCell>
                  <TableCell>{target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
