import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

interface AuditLogItem {
  publicId: string;
  actorId: string | null;
  actorType: string | null;
  action: string;
  resourceType: string | null;
  resourcePublicId: string | null;
  occurredAt: string;
}

const auditKeys = {
  all: ["admin-audit-logs"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...auditKeys.lists(), filters] as const,
};

function auditListOptions(filters: { search?: string; limit?: number; offset?: number } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    action: filters.search || undefined,
  };

  return queryOptions({
    queryKey: auditKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<AuditLogItem>>("/admin/audit-logs", params),
  });
}

export function AuditLogsPage() {
  const [query, setQuery] = useState("");
  const qc = useQueryClient();
  const { data: envelope, isLoading } = useQuery(auditListOptions({ limit: 50 }));
  const logs = envelope?.data ?? [];

  const filtered = useMemo(
    () =>
      logs.filter((entry) =>
        `${entry.action} ${entry.actorId ?? ""} ${entry.resourceType ?? ""} ${entry.resourcePublicId ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [logs, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit logs</h1>
          <p className="text-sm text-muted-foreground">
            Event stream tra cứu thao tác quản trị, phục vụ đối soát hành vi và truy nguyên thay đổi.
          </p>
        </div>
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => void qc.invalidateQueries({ queryKey: auditKeys.lists() })}
        >
          <span>Làm mới</span>
          <RefreshCwIcon className="size-4" />
        </Button>
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
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : (
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
                {filtered.length > 0 ? (
                  filtered.map((log) => (
                    <TableRow key={log.publicId}>
                      <TableCell className="text-nowrap">
                        {new Date(log.occurredAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>{log.actorId ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.resourceType ?? "—"}</TableCell>
                      <TableCell>{log.resourcePublicId ?? "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Không có kết quả phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
