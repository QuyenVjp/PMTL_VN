import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const resources = [
  ["Runbook phát triển", "Khởi động host mode, chuẩn bị DB, dọn port và smoke test cơ bản."],
  ["Luồng kiểm duyệt", "Quy trình xem báo cáo, ra quyết định và giới hạn quyền thao tác."],
  ["Biên tập nội dung", "Editor Tiptap cho bài viết, bản kinh, nghi thức và kế hoạch."],
  ["Vận hành tìm kiếm", "Đồng bộ chỉ mục, fallback search và điều hướng health check."],
];

export function HelpCenterPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => resources.filter((item) => item.join(" ").toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hỗ trợ vận hành</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tài liệu ngắn cho operator: runbook, kiểm duyệt, biên tập và vận hành hệ thống.
        </p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm chủ đề hỗ trợ..."
        className="max-w-xs"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="mt-2">{description}</CardDescription>
                </div>
                <Badge variant="outline">Hướng dẫn</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Surface này giờ có filter và resource cards thật, không còn route ảnh.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
