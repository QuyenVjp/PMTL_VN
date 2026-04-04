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
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <PopoverContent className="w-[380px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="text-sm font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={handleDismissAll}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-[320px]">
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <li key={notification.id}>
                      <Link
                        to={notification.url}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <Badge className="size-9 shrink-0">
                          <Icon className="size-4" />
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistance(notification.date)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Không có thông báo nào.
              </div>
            )}
          </ScrollArea>
          <CardFooter className="justify-center border-t border-border p-0">
            <Link
              to="/he-thong/thong-bao"
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-center",
              )}
            >
              Xem tất cả thông báo
            </Link>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
