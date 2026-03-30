import * as React from 'react'
import { Link, useLocation } from "@tanstack/react-router"
import { ChevronsUpDown, LayoutDashboard, BookOpen, ShieldAlert } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

type WorkspaceItem = {
  name: string
  plan: string
  href: string
  icon: React.ElementType
}

const workspaceItems: WorkspaceItem[] = [
  {
    name: "Vận hành PMTL",
    plan: "Dashboard và điều phối tổng thể",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Điều phối nội dung",
    plan: "Bài viết, hướng dẫn, niệm kinh",
    href: "/noi-dung/bai-viet",
    icon: BookOpen,
  },
  {
    name: "Kiểm duyệt cộng đồng",
    plan: "Báo cáo, bình luận, sổ lưu niệm",
    href: "/kiem-duyet/bao-cao",
    icon: ShieldAlert,
  },
]

function resolveWorkspace(pathname: string) {
  if (pathname.startsWith("/noi-dung")) {
    return workspaceItems[1];
  }

  if (pathname.startsWith("/kiem-duyet") || pathname.startsWith("/cong-dong")) {
    return workspaceItems[2];
  }

  return workspaceItems[0];
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeWorkspace = resolveWorkspace(pathname);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <activeWorkspace.icon className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeWorkspace.name}
                </span>
                <span className='truncate text-xs'>{activeWorkspace.plan}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-76 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Chuyển workspace
            </DropdownMenuLabel>
            {workspaceItems.map((workspace, index) => (
              <DropdownMenuItem key={workspace.name} asChild>
                <Link 
                  to={workspace.href}
                  className='gap-2 p-2 cursor-pointer'
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <workspace.icon className='size-4 shrink-0' />
                  </div>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{workspace.name}</span>
                    <span className='truncate text-xs'>{workspace.plan}</span>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}