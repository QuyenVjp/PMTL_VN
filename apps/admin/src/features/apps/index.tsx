import { useMemo, useState } from "react";
import { BookOpenIcon, FlagIcon, HeartHandshakeIcon, SearchIcon, ShieldAlertIcon, WavesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const appModules = [
  {
    name: "Biên tập nội dung",
    description: "Bài viết, hướng dẫn, kinh sách và quy trình publish.",
    connected: true,
    icon: BookOpenIcon,
  },
  {
    name: "Niệm kinh",
    description: "Môi trường, thời gian, bản kinh, nghi thức và kế hoạch.",
    connected: true,
    icon: WavesIcon,
  },
  {
    name: "Kiểm duyệt",
    description: "Báo cáo, moderation queue và quyết định vận hành.",
    connected: false,
    icon: ShieldAlertIcon,
  },
  {
    name: "Cờ tính năng",
    description: "Chính sách projection, phạm vi rollout và audit write-path.",
    connected: false,
    icon: FlagIcon,
  },
  {
    name: "Tra cứu",
    description: "Search ops, index sync và visibility panel.",
    connected: false,
    icon: SearchIcon,
  },
  {
    name: "Hỗ trợ chuyên biệt",
    description: "Assisted-entry, volunteer lane và support workflows.",
    connected: false,
    icon: HeartHandshakeIcon,
  },
];

export function AppsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "not-connected">("all");

  const filteredModules = useMemo(() => {
    return appModules.filter((module) => {
      const matchesQuery = module.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ? true : filter === "connected" ? module.connected : !module.connected;

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tích hợp module</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Danh mục module PMTL trong slot integrations của starter, dùng để điều hướng nhanh theo nhóm vận hành.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          className="max-w-xs"
          placeholder="Lọc module..."
          aria-label="Lọc module"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "secondary" : "outline"} onClick={() => setFilter("all")}>
            Tất cả
          </Button>
          <Button
            variant={filter === "connected" ? "secondary" : "outline"}
            onClick={() => setFilter("connected")}
          >
            Đã nối
          </Button>
          <Button
            variant={filter === "not-connected" ? "secondary" : "outline"}
            onClick={() => setFilter("not-connected")}
          >
            Chưa nối
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((module) => {
          const Icon = module.icon;

          return (
            <Card key={module.name} className="gap-4">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={module.connected ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900" : ""}
                  >
                    {module.connected ? "Đã nối" : "Kết nối"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-lg">{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
                <Badge variant={module.connected ? "secondary" : "outline"}>
                  {module.connected ? "Đã graft" : "Chờ nghiệp vụ"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
