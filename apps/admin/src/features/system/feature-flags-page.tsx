import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminClient } from "@/lib/api/admin-client.js";

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

const flagKeys = {
  all: ["admin-feature-flags"] as const,
  list: () => [...flagKeys.all, "list"] as const,
};

function flagListOptions() {
  return queryOptions({
    queryKey: flagKeys.list(),
    queryFn: () => adminClient.get<{ data: FeatureFlag[] }>("/admin/feature-flags"),
  });
}

function useToggleFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      adminClient.patch(`/admin/feature-flags/${key}`, { enabled }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: flagKeys.list() });
    },
  });
}

export function FeatureFlagsPage() {
  const [query, setQuery] = useState("");
  const { data: envelope, isLoading } = useQuery(flagListOptions());
  const toggleFlag = useToggleFlag();
  const qc = useQueryClient();

  const flags = envelope?.data ?? [];

  const filteredFlags = useMemo(
    () =>
      flags.filter((flag) =>
        `${flag.key} ${flag.description ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [flags, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Feature flags</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách cờ hệ thống đang ảnh hưởng trực tiếp đến các surface quản trị của PMTL.
          </p>
        </div>
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => void qc.invalidateQueries({ queryKey: flagKeys.list() })}
        >
          <span>Làm mới</span>
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm feature flag theo key hoặc mô tả"
        className="max-w-xl"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="grid gap-4">
          {filteredFlags.map((flag) => (
            <Card key={flag.key}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle>{flag.key}</CardTitle>
                    <CardDescription>{flag.description ?? "Không có mô tả"}</CardDescription>
                  </div>
                  <Badge variant={flag.enabled ? "secondary" : "outline"}>
                    {flag.enabled ? "Đang bật" : "Đang tắt"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Cập nhật: {new Date(flag.updatedAt).toLocaleString("vi-VN")}
                </p>
                <Button
                  type="button"
                  variant={flag.enabled ? "outline" : "default"}
                  disabled={toggleFlag.isPending}
                  onClick={() => toggleFlag.mutate({ key: flag.key, enabled: !flag.enabled })}
                >
                  {flag.enabled ? "Tắt cờ" : "Bật cờ"}
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredFlags.length === 0 && (
            <p className="text-sm text-muted-foreground">Không tìm thấy flag nào phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
}
