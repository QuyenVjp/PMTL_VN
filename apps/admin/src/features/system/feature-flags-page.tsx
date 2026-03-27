import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FlagItem = {
  key: string;
  moTa: string;
  enabled: boolean;
  owner: string;
};

const initialFlags: FlagItem[] = [
  { key: "admin_moderation_reports", moTa: "Bật lane báo cáo kiểm duyệt theo design canon.", enabled: true, owner: "Kiểm duyệt" },
  { key: "admin_search_ops", moTa: "Mở dashboard tìm kiếm và reindex control trong admin.", enabled: true, owner: "Hệ thống" },
  { key: "chanting_editor_rich_text", moTa: "Cho phép editor dài trong workspace Niệm kinh.", enabled: true, owner: "Niệm kinh" },
  { key: "admin_push_redrive", moTa: "Cho phép redrive push jobs từ màn hình thông báo.", enabled: false, owner: "Thông báo" },
];

export function FeatureFlagsPage() {
  const [query, setQuery] = useState("");
  const [flags, setFlags] = useState(initialFlags);

  const filteredFlags = useMemo(
    () =>
      flags.filter((flag) =>
        `${flag.key} ${flag.moTa} ${flag.owner}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [flags, query],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Feature flags</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách cờ hệ thống đang ảnh hưởng trực tiếp đến các surface quản trị của PMTL.
        </p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm feature flag theo key hoặc phụ trách"
        className="max-w-xl"
      />

      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <Card key={flag.key}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle>{flag.key}</CardTitle>
                  <CardDescription>{flag.moTa}</CardDescription>
                </div>
                <Badge variant={flag.enabled ? "secondary" : "outline"}>
                  {flag.enabled ? "Đang bật" : "Đang tắt"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Phụ trách: {flag.owner}</p>
              <Button
                type="button"
                variant={flag.enabled ? "outline" : "default"}
                onClick={() =>
                  setFlags((prev) =>
                    prev.map((item) =>
                      item.key === flag.key ? { ...item, enabled: !item.enabled } : item,
                    ),
                  )
                }
              >
                {flag.enabled ? "Tắt cờ" : "Bật cờ"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
