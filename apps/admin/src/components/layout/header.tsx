import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BellIcon, Settings2Icon, SparklesIcon, SearchIcon, HeartIcon, FlagIcon } from "lucide-react";

import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { UserMenu } from "@/components/layout/user-menu";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className,
      )}
    >
      <div 
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger variant="outline" className="max-md:scale-95" />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <TopNav links={topNavLinks} mode="desktop" className="min-w-0 flex-1" />
        </div>

        <Search className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-1">
          <TopNav links={topNavLinks} mode="mobile" />
          <ThemeSwitch />
          <NotificationDropdown />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground">
                <Settings2Icon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/he-thong/cai-dat">
                  <Settings2Icon className="size-4" />
                  Cài đặt admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/he-thong/tim-kiem">
                  <SearchIcon className="size-4" />
                  Tìm kiếm
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/he-thong/thong-bao">
                  <BellIcon className="size-4" />
                  Thông báo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/he-thong/health">
                  <HeartIcon className="size-4" />
                  Health
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/he-thong/feature-flags">
                  <FlagIcon className="size-4" />
                  Feature flags
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ho-tro/phat-nguyen/nhap-ho">
                  <SparklesIcon className="size-4" />
                  Nhập hộ
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
