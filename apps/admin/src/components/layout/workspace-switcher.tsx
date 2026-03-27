import { Link, useLocation } from "@tanstack/react-router";
import { ChevronsUpDownIcon, CommandIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type WorkspaceItem = {
  label: string;
  subtitle: string;
  href: string;
};

const workspaceItems: WorkspaceItem[] = [
  {
    label: "Vận hành PMTL",
    subtitle: "Dashboard và điều phối tổng thể",
    href: "/dashboard",
  },
  {
    label: "Điều phối nội dung",
    subtitle: "Bài viết, hướng dẫn, niệm kinh",
    href: "/noi-dung/bai-viet",
  },
  {
    label: "Kiểm duyệt cộng đồng",
    subtitle: "Báo cáo, bình luận, sổ lưu niệm",
    href: "/kiem-duyet/bao-cao",
  },
];

function resolveWorkspace(pathname: string) {
  if (pathname.startsWith("/noi-dung")) {
    return workspaceItems[1];
  }

  if (pathname.startsWith("/kiem-duyet") || pathname.startsWith("/cong-dong")) {
    return workspaceItems[2];
  }

  return workspaceItems[0];
}

export function WorkspaceSwitcher() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeWorkspace = resolveWorkspace(pathname);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CommandIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">PMTL Admin</span>
                <span className="truncate text-xs">{activeWorkspace.label}</span>
              </div>
              <ChevronsUpDownIcon className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="min-w-64 rounded-lg">
            <DropdownMenuLabel>Chuyển workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaceItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link to={item.href} className="flex flex-col items-start gap-1 py-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
