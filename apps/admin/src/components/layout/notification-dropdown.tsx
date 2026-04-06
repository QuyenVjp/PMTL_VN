/**
 * Notification bell dropdown for the admin header.
 *
 * Pattern: Popover (not DropdownMenu) for richer content layout.
 * Adapted from Shadboard notification-dropdown.tsx:
 * - Removed "use client", next/link → TanStack Router Link
 * - Replaced DynamicIcon with direct Lucide imports
 * - Vietnamese text, PMTL design tokens
 * - Mock data for now — replace with real API when notification system is built
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  FileText,
  MessageSquare,
  ShieldAlert,
  UserPlus,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


// ── Notification types ───────────────────────────────────────────────

interface Notification {
  id: string;
  icon: LucideIcon;
  content: string;
  url: string;
  date: string;
  isRead: boolean;
}

// ── Mock data (replace with real API) ────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: ShieldAlert,
    content: "Có 3 báo cáo kiểm duyệt mới cần xử lý",
    url: "/kiem-duyet/bao-cao",
    date: new Date(Date.now() - 10 * 60_000).toISOString(),
    isRead: false,
  },
  {
    id: "2",
    icon: FileText,
    content: "Bài viết 'Lịch sử chùa Vĩnh Nghiêm' đã được xuất bản",
    url: "/noi-dung/bai-viet",
    date: new Date(Date.now() - 2 * 3600_000).toISOString(),
    isRead: false,
  },
  {
    id: "3",
    icon: UserPlus,
    content: "5 thành viên mới đăng ký trong 24 giờ qua",
    url: "/nguoi-dung",
    date: new Date(Date.now() - 12 * 3600_000).toISOString(),
    isRead: true,
  },
  {
    id: "4",
    icon: MessageSquare,
    content: "Bình luận mới trên bài 'Ý nghĩa lễ Phật đản'",
    url: "/kiem-duyet/binh-luan",
    date: new Date(Date.now() - 24 * 3600_000).toISOString(),
    isRead: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

function formatDistance(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function formatUnreadCount(count: number): string {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

// ── Component ────────────────────────────────────────────────────────

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const formattedCount = formatUnreadCount(unreadCount);

  const handleDismissAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full text-muted-foreground"
        >
          <Bell className="size-4" />
          <span className="sr-only">Thông báo</span>
          {!!formattedCount && (
            <Badge
              className="absolute -top-1 -end-1 h-4 min-w-4 max-w-8 flex justify-center px-1 text-[10px]"
              aria-live="polite"
              aria-atomic="true"
              role="status"
              aria-label={`${formattedCount} chưa đọc`}
            >
              {formattedCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0 flex flex-col bg-popover overflow-hidden shadow-lg border-muted" align="end" sideOffset={8}>
        <div className="flex-none flex items-center justify-between border-b border-border bg-popover px-4 py-3 z-10 relative">
          <h3 className="text-sm font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleDismissAll}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        
        {/* Using native overflow div to prevent ScrollArea flex overlaps */}
        <div className="flex-1 overflow-y-auto max-h-[360px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link
                    key={notification.id}
                    to={notification.url}
                    className={cn(
                      "flex items-start gap-4 border-b border-muted last:border-b-0 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-hidden focus-visible:bg-muted/50",
                      !notification.isRead && "bg-muted/20"
                    )}
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50">
                      <Icon className="size-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={cn(
                        "text-sm line-clamp-2 leading-relaxed tracking-tight", 
                        notification.isRead ? "text-muted-foreground" : "text-foreground font-medium"
                      )}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground/80 flex items-center">
                        {formatDistance(notification.date)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2.5 size-2 shrink-0 rounded-full bg-primary shadow-sm" />
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Không có thông báo mới</p>
              <p className="mt-1 text-xs text-muted-foreground">Bạn đã xem hết tất cả thông báo.</p>
            </div>
          )}
        </div>

        <div className="flex-none border-t border-border bg-popover p-2 z-10 relative">
          <Link
            to="/he-thong/thong-bao"
            className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
