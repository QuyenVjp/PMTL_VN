import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Settings2Icon } from "lucide-react";

import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function Header({
  className,
  fixed = true,
}: React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
}) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  const topNavLinks = [
    { title: "Tổng quan", href: "/dashboard", isActive: pathname === "/" || pathname === "/dashboard" },
    { title: "Nội dung", href: "/noi-dung/bai-viet", isActive: pathname.startsWith("/noi-dung") },
    { title: "Kiểm duyệt", href: "/kiem-duyet/bao-cao", isActive: pathname.startsWith("/kiem-duyet") },
    { title: "Người dùng", href: "/nguoi-dung", isActive: pathname.startsWith("/nguoi-dung") },
    { title: "Hệ thống", href: "/he-thong/feature-flags", isActive: pathname.startsWith("/he-thong") },
  ];

  return (
    <header
      className={cn(
        "z-40 h-16 border-b bg-background",
        fixed ? "sticky top-0" : undefined,
        offset > 10 ? "shadow-sm" : undefined,
        className,
      )}
    >
      <div className="flex h-full items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger variant="outline" className="max-md:scale-110" />
        <Separator orientation="vertical" className="h-6" />
        <TopNav links={topNavLinks} className="min-w-0 flex-1" />

        <Search className="hidden md:flex" />

        <div className="flex items-center gap-1">
          <ThemeSwitch />
          <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground" asChild>
            <Link to="/he-thong/tim-kiem" aria-label="Mở trung tâm hệ thống">
              <Settings2Icon className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full border bg-muted text-sm font-semibold text-foreground"
          >
            SN
          </Button>
        </div>
      </div>
    </header>
  );
}
