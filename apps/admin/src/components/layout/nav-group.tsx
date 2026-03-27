import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRightIcon, LockIcon } from "lucide-react";

import type { NavCollapsible, NavGroup as NavGroupProps, NavLink } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

function isNavCollapsible(item: NavLink | NavCollapsible): item is NavCollapsible {
  return Array.isArray((item as NavCollapsible).items);
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1.5 py-0 text-[10px]">{children}</Badge>;
}

function isActivePath(currentPath: string, target: string) {
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

function DisabledNavRow({
  title,
  icon: Icon,
  badge,
}: {
  title: string;
  icon?: React.ElementType;
  badge?: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        disabled
        className="cursor-not-allowed opacity-55 hover:bg-transparent hover:text-sidebar-foreground"
        tooltip={`${title} — chưa scaffold`}
      >
        {Icon ? <Icon /> : null}
        <span>{title}</span>
        {badge ? <NavBadge>{badge}</NavBadge> : null}
        <LockIcon className="ms-auto size-3.5 opacity-70" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
  const { setOpenMobile } = useSidebar();

  if (item.disabled) {
    return <DisabledNavRow title={item.title} icon={item.icon} badge={item.badge} />;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActivePath(href, String(item.url))} tooltip={item.title}>
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
          {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) {
  const { setOpenMobile } = useSidebar();
  const hasActiveChild = item.items.some((subItem) => isActivePath(href, String(subItem.url)));

  return (
    <Collapsible asChild defaultOpen={hasActiveChild} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
            <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) =>
              subItem.disabled ? (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    className="cursor-not-allowed opacity-55 hover:bg-transparent hover:text-sidebar-foreground"
                  >
                    <span>{subItem.title}</span>
                    <LockIcon className="ms-auto size-3.5 opacity-70" />
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActivePath(href, String(subItem.url))}
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon ? <subItem.icon /> : null}
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ),
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) {
  const hasActiveChild = item.items.some((subItem) => isActivePath(href, String(subItem.url)));

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={hasActiveChild}>
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
            <ChevronRightIcon className="ms-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((subItem) => (
            <DropdownMenuItem
              key={`${subItem.title}-${subItem.url}`}
              disabled={Boolean(subItem.disabled)}
              asChild={!subItem.disabled}
            >
              {subItem.disabled ? (
                <span className="flex w-full items-center gap-2 text-muted-foreground">
                  <span>{subItem.title}</span>
                  <LockIcon className="ms-auto size-3.5" />
                </span>
              ) : (
                <Link to={subItem.url}>
                  {subItem.icon ? <subItem.icon /> : null}
                  <span>{subItem.title}</span>
                </Link>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${"url" in item ? item.url : title}`;
          if (!isNavCollapsible(item)) {
            return <SidebarMenuLink key={key} item={item} href={href} />;
          }

          if (state === "collapsed" && !isMobile) {
            return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />;
          }

          return <SidebarMenuCollapsible key={key} item={item} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
