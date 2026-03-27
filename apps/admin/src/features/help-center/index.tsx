import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const resources = [
  ["Runbook dev", "Khởi động host mode, prepare DB, dọn port, smoke basics."],
  ["Moderation lane", "Quy trình review báo cáo và action narrowing."],
  ["Content editor", "Tiptap editor cho bản kinh, nghi thức, kế hoạch."],
  ["Search ops", "Sync index, fallback search, health routing."],
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
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quick operator guides and admin references.</p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search help topics..."
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
                <Badge variant="outline">Guide</Badge>
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
