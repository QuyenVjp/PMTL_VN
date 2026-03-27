import {
  BellRing,
  BookAudio,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  HeartPulse,
  Images,
  LayoutDashboard,
  Library,
  ListChecks,
  MessageSquare,
  Newspaper,
  NotebookTabs,
  ScanSearch,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  UserSquare2,
} from "lucide-react";

import type { NavGroup } from "@/components/layout/types";

export const sidebarNavGroups: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Nội dung",
    items: [
      { title: "Bài viết", url: "/noi-dung/bai-viet", icon: Newspaper },
      { title: "Hướng dẫn", url: "/noi-dung/huong-dan", icon: BookOpen },
      { title: "Kinh bài tập", url: "/noi-dung/kinh-bai-tap", icon: NotebookTabs },
      { title: "Ngôi nhà nhỏ", url: "/noi-dung/ngoi-nha-nho", icon: HeartHandshake },
      { title: "Phóng sanh", url: "/noi-dung/phong-sanh", icon: Sparkles },
      { title: "Thư viện pháp môn", url: "/noi-dung/thu-vien-phap-mon", icon: Library },
      { title: "Tài liệu", url: "/noi-dung/tai-lieu", icon: ScrollText },
      { title: "Kinh sách", url: "/noi-dung/kinh-sach", icon: BookAudio },
      { title: "Niệm kinh", url: "/noi-dung/niem-kinh/moi-truong-thoi-gian", icon: ListChecks },
      { title: "Media", url: "/noi-dung/media", icon: Images },
    ],
  },
  {
    title: "Cộng đồng",
    items: [
      { title: "Bài đăng", url: "/cong-dong/bai-dang", icon: MessageSquare },
      { title: "Sổ lưu niệm", url: "/cong-dong/so-luu-niem", icon: BookOpen },
    ],
  },
  {
    title: "Kiểm duyệt",
    items: [
      { title: "Báo cáo", url: "/kiem-duyet/bao-cao", icon: ShieldAlert },
      { title: "Bình luận", url: "/kiem-duyet/binh-luan", icon: MessageSquare },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { title: "Danh sách", url: "/nguoi-dung", icon: Users },
      { title: "Phiên đăng nhập", url: "/nguoi-dung/phien", icon: UserSquare2 },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { title: "Feature flags", url: "/he-thong/feature-flags", icon: ShieldCheck },
      { title: "Audit logs", url: "/he-thong/audit-logs", icon: ScrollText },
      { title: "Lịch & Sự kiện", url: "/he-thong/lich", icon: CalendarDays },
      { title: "Tìm kiếm", url: "/he-thong/tim-kiem", icon: ScanSearch },
      { title: "Thông báo", url: "/he-thong/thong-bao", icon: BellRing },
      { title: "Phụng sự viên", url: "/he-thong/phung-su-vien", icon: HeartHandshake },
      { title: "Health", url: "/he-thong/health", icon: HeartPulse },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { title: "Nhập hộ phát nguyện", url: "/ho-tro/phat-nguyen/nhap-ho", icon: Sparkles },
    ],
  },
];
