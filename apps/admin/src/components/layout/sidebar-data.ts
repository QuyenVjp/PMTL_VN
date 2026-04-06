import {
  BellRing,
  BookAudio,
  BookOpen,
  CalendarDays,
  Contact,
  Flame,
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
  Settings2,
  Users,
  UserSquare2,
  Bird,
  CalendarCheck,
  FileText,
  Landmark,
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
      { title: "Bạch thoại Phật pháp", url: "/noi-dung/bach-thoai", icon: BookOpen },
      { title: "Hướng dẫn", url: "/noi-dung/huong-dan", icon: BookOpen },
      { title: "Kinh bài tập", url: "/noi-dung/kinh-bai-tap", icon: NotebookTabs },
      { title: "Kinh văn tự tu", url: "/noi-dung/kinh-van-tu-tu", icon: NotebookTabs },
      { title: "Ngôi nhà nhỏ", url: "/noi-dung/ngoi-nha-nho", icon: HeartHandshake },
      { title: "Phóng sanh", url: "/noi-dung/phong-sanh", icon: Sparkles },
      { title: "Thư viện pháp môn", url: "/noi-dung/thu-vien-phap-mon", icon: Library },
      { title: "Tài liệu", url: "/noi-dung/tai-lieu", icon: ScrollText },
      { title: "Kinh sách", url: "/noi-dung/kinh-sach", icon: BookAudio },
      { 
        title: "Niệm kinh", 
        icon: ListChecks,
        items: [
          { title: "Môi trường & thời gian", url: "/noi-dung/niem-kinh/moi-truong-thoi-gian" },
          { title: "Bản kinh", url: "/noi-dung/niem-kinh/ban-kinh" },
          { title: "Nghi thức", url: "/noi-dung/niem-kinh/nghi-thuc" },
          { title: "Kế hoạch", url: "/noi-dung/niem-kinh/ke-hoach" }
        ]
      },
      { title: "Ảnh", url: "/noi-dung/anh", icon: Images },
      { title: "Video", url: "/noi-dung/video", icon: Images },
      { title: "Tệp tài liệu", url: "/noi-dung/tep-tai-lieu", icon: Images },
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
      { title: "Tổng quan hệ thống", url: "/he-thong", icon: Settings2 },
      { title: "Cài đặt admin", url: "/he-thong/cai-dat", icon: Settings2 },
      { title: "Feature flags", url: "/he-thong/feature-flags", icon: ShieldCheck },
      { title: "Audit logs", url: "/he-thong/audit-logs", icon: ScrollText },
      { title: "Lịch & Sự kiện", url: "/he-thong/lich", icon: CalendarDays },
      { title: "Tìm kiếm", url: "/he-thong/tim-kiem", icon: ScanSearch },
      { title: "Thông báo", url: "/he-thong/thong-bao", icon: BellRing },
      { title: "Phụng sự viên", url: "/he-thong/phung-su-vien", icon: HeartHandshake },
      { title: "Thông tin liên hệ", url: "/he-thong/thong-tin-lien-he", icon: Contact },
      { title: "Health", url: "/he-thong/health", icon: HeartPulse },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { title: "Nhập hộ phát nguyện", url: "/ho-tro/phat-nguyen/nhap-ho", icon: Sparkles },
    ],
  },
  {
    title: "Thanh Tịnh Pháp",
    items: [
      {
        title: "Tuân thủ Pháp luật",
        icon: ShieldCheck,
        items: [
          { title: "Tổ chức từ thiện", url: "/phap-luat/to-chuc-tu-thien" },
          { title: "Cảnh báo gian lận", url: "/phap-luat/canh-bao-gian-lan" },
          { title: "Lời nguyện thanh tu", url: "/phap-luat/loi-nguyen-thanh-tu" },
          { title: "Hàng đợi hướng dẫn", url: "/phap-luat/hang-doi-huong-dan" },
        ],
      },
      {
        title: "Sự kiện Phật pháp",
        icon: CalendarCheck,
        items: [
          { title: "Danh sách sự kiện", url: "/su-kien/danh-sach" },
          { title: "Tạo sự kiện", url: "/su-kien/tao-moi" },
        ],
      },
      {
        title: "Phóng sinh",
        icon: Bird,
        items: [
          { title: "Hồ sơ phóng sinh", url: "/phong-sinh/ho-so" },
          { title: "Thống kê theo loài", url: "/phong-sinh/thong-ke" },
        ],
      },
      {
        title: "Đơn Pháp Bảo",
        icon: FileText,
        items: [
          { title: "Mẫu đơn", url: "/don-phap-bao/mau-don" },
          { title: "Đơn đăng ký", url: "/don-phap-bao/don-dang-ky" },
          { title: "Quy tắc xử lý", url: "/don-phap-bao/quy-tac-xu-ly" },
        ],
      },
      {
        title: "Sớ (Ngôi Nhà Nhỏ)",
        icon: Flame,
        items: [
          { title: "Danh sách sớ", url: "/so/danh-sach" },
          { title: "Hàng đợi gian lận", url: "/so/gian-lan" },
        ],
      },
      {
        title: "Bàn thờ",
        icon: Landmark,
        items: [
          { title: "Vật phẩm thờ cúng", url: "/ban-tho/vat-pham" },
          { title: "Nhật ký kiểm tra", url: "/ban-tho/nhat-ky" },
          { title: "Quy trình", url: "/ban-tho/quy-trinh" },
        ],
      },
    ],
  },
];
