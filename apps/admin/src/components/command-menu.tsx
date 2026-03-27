import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LaptopIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react";

import { sidebarNavGroups } from "@/components/layout/sidebar-data";
import { useSearch } from "@/context/search-provider";
import { useTheme } from "@/context/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type SearchItem = {
  label: string;
  subtitle: string;
  action: () => void;
};

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");

  const routeItems = useMemo<SearchItem[]>(() => {
    return sidebarNavGroups.flatMap((group) =>
      group.items.flatMap((item) => {
        if ("url" in item) {
          return [
            {
              label: item.title,
              subtitle: group.title,
              action: () => navigate({ to: item.url }),
            },
          ];
        }

        return item.items.map((subItem) => ({
          label: subItem.title,
          subtitle: `${group.title} / ${item.title}`,
          action: () => navigate({ to: subItem.url }),
        }));
      }),
    );
  }, [navigate]);

  const themeItems: SearchItem[] = [
    { label: "Giao diện sáng", subtitle: "Giao diện", action: () => setTheme("light") },
    { label: "Giao diện tối", subtitle: "Giao diện", action: () => setTheme("dark") },
    { label: "Theo hệ thống", subtitle: "Giao diện", action: () => setTheme("system") },
  ];

  const items = [...routeItems, ...themeItems].filter((item) =>
    `${item.label} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase()),
  );

  const run = (action: () => void) => {
    action();
    setOpen(false);
    setQuery("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="top" className="mx-auto mt-16 w-[min(720px,calc(100%-2rem))] rounded-2xl border bg-background p-0">
        <SheetHeader className="border-b px-4 py-4 text-start">
          <SheetTitle>Tìm nhanh và điều hướng</SheetTitle>
          <SheetDescription>Mở module, workspace và đổi giao diện từ một nơi.</SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Gõ tên route, module hoặc lệnh..."
              className="ps-9"
              autoFocus
            />
          </div>

          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Không tìm thấy kết quả phù hợp.
              </div>
            ) : (
              items.map((item) => (
                <Button
                  key={`${item.subtitle}-${item.label}`}
                  variant="ghost"
                  className="flex h-auto w-full items-center justify-between rounded-xl border px-4 py-3 text-start"
                  onClick={() => run(item.action)}
                >
                  <div>
                    <div className="font-medium text-foreground">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                  </div>
                  <Badge variant="outline">Mở</Badge>
                </Button>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <SunIcon className="size-3.5" />
            <MoonIcon className="size-3.5" />
            <LaptopIcon className="size-3.5" />
            <span>`Ctrl/Cmd + K` để mở lại nhanh.</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
