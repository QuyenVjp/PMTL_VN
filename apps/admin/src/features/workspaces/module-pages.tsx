import { useMemo, useState } from "react";
import { CalendarDaysIcon, RefreshCcwIcon, SearchIcon, SendHorizonalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkspaceTablePage } from "@/features/workspaces/workspace-table-page";

const contentColumns = [
  { key: "tieuDe", label: "Tiêu đề" },
  { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
  { key: "owner", label: "Phụ trách", className: "w-[160px]" },
  { key: "capNhat", label: "Cập nhật", className: "w-[160px]" },
];

export function PostsPage() {
  return (
    <WorkspaceTablePage
      title="Bài viết"
      description="Biên tập, xuất bản và rà soát chất lượng bài viết public của PMTL."
      searchPlaceholder="Tìm theo tiêu đề, owner hoặc trạng thái bài viết"
      primaryAction="Tạo bài viết"
      stats={[
        { label: "Đang xuất bản", value: "148", note: "12 bài được cập nhật trong 7 ngày gần nhất" },
        { label: "Chờ duyệt", value: "9", note: "Ưu tiên các bài thuộc chuyên đề đang chạy chiến dịch" },
        { label: "Nháp", value: "23", note: "Theo dõi owner để tránh tồn backlog kéo dài" },
        { label: "Lỗi liên kết", value: "4", note: "Cần rà soát media trước khi publish lại" },
      ]}
      filters={[
        { label: "Tất cả", value: "all", predicate: () => true },
        { label: "Đang xuất bản", value: "published", predicate: (row) => row.trangThai === "Đang xuất bản" },
        { label: "Chờ duyệt", value: "pending", predicate: (row) => row.trangThai === "Chờ duyệt" },
        { label: "Nháp", value: "draft", predicate: (row) => row.trangThai === "Nháp" },
      ]}
      columns={contentColumns}
      rows={[
        { id: "post-1", tieuDe: "Tổng hợp pháp thoại tháng ba", trangThai: "Đang xuất bản", owner: "Biên tập", capNhat: "27/03 14:20", actions: ["Mở", "Xuất bản lại"] },
        { id: "post-2", tieuDe: "Nhật ký tu học theo tuần", trangThai: "Chờ duyệt", owner: "Nội dung", capNhat: "27/03 11:45", actions: ["Duyệt", "Trả lại"] },
        { id: "post-3", tieuDe: "Lộ trình thực tập căn bản", trangThai: "Nháp", owner: "Huấn tu", capNhat: "26/03 18:10", actions: ["Tiếp tục sửa"] },
        { id: "post-4", tieuDe: "Góc hỏi đáp Phật pháp", trangThai: "Đang xuất bản", owner: "Cộng đồng", capNhat: "25/03 09:30", actions: ["Mở"] },
      ]}
    />
  );
}

export function GuidesPage() {
  return (
    <WorkspaceTablePage
      title="Hướng dẫn"
      description="Quản trị bộ nội dung nhập môn, onboarding và giải thích thực hành cho thành viên mới."
      searchPlaceholder="Tìm hướng dẫn theo chủ đề hoặc owner"
      primaryAction="Thêm hướng dẫn"
      stats={[
        { label: "Guide đang bật", value: "32", note: "Bao gồm cả landing guide và FAQ theo nhóm chủ đề" },
        { label: "Chờ cập nhật", value: "5", note: "Các guide có phản hồi usability trong 14 ngày gần nhất" },
        { label: "Bản nháp", value: "7", note: "Đang chờ duyệt nội dung và media đính kèm" },
        { label: "CTR nội bộ", value: "68%", note: "Tỷ lệ mở guide từ các entry point của web/app" },
      ]}
      filters={[
        { label: "Tất cả", value: "all", predicate: () => true },
        { label: "Đang bật", value: "live", predicate: (row) => row.trangThai === "Đang xuất bản" },
        { label: "Cần cập nhật", value: "review", predicate: (row) => row.trangThai === "Cần cập nhật" },
      ]}
      columns={contentColumns}
      rows={[
        { id: "guide-1", tieuDe: "Bắt đầu niệm Phật tại nhà", trangThai: "Đang xuất bản", owner: "Nội dung", capNhat: "27/03 08:40", actions: ["Mở", "Xem preview"] },
        { id: "guide-2", tieuDe: "Cách dùng lịch công quả", trangThai: "Cần cập nhật", owner: "Vận hành", capNhat: "26/03 20:05", actions: ["Mở", "Giao owner"] },
        { id: "guide-3", tieuDe: "Hướng dẫn tham gia lễ trực tuyến", trangThai: "Đang xuất bản", owner: "Sự kiện", capNhat: "24/03 16:15", actions: ["Mở"] },
      ]}
    />
  );
}

export function DailyPracticePage() {
  return (
    <WorkspaceTablePage
      title="Kinh bài tập"
      description="Workspace điều phối preset, FAQ, download và guide cho hành trì hằng ngày."
      searchPlaceholder="Tìm preset, gói bài tập hoặc FAQ"
      columns={[
        { key: "tenGoi", label: "Gói nội dung" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
        { key: "ghiChu", label: "Ghi chú" },
      ]}
      rows={[
        { id: "practice-1", tenGoi: "Lộ trình 7 ngày nhập môn", trangThai: "Đang xuất bản", owner: "Huấn tu", ghiChu: "Đang dùng cho onboarding web", actions: ["Mở"] },
        { id: "practice-2", tenGoi: "Bộ FAQ thực tập buổi sáng", trangThai: "Chờ duyệt", owner: "Biên tập", ghiChu: "Cần chốt media minh họa", actions: ["Duyệt", "Trả lại"] },
        { id: "practice-3", tenGoi: "Download card hành trì", trangThai: "Nháp", owner: "Thiết kế", ghiChu: "Chờ final asset", actions: ["Mở"] },
      ]}
    />
  );
}

export function LittleHousePage() {
  return (
    <WorkspaceTablePage
      title="Ngôi nhà nhỏ"
      description="Theo dõi guide, biến thể nội dung và FAQ cho chương trình Ngôi nhà nhỏ."
      searchPlaceholder="Tìm case, guide hoặc FAQ của Ngôi nhà nhỏ"
      columns={[
        { key: "tenMuc", label: "Mục nội dung" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "doiTuong", label: "Đối tượng", className: "w-[180px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
      ]}
      rows={[
        { id: "house-1", tenMuc: "Checklist chuẩn bị bàn thờ", trangThai: "Đang xuất bản", doiTuong: "Gia đình mới", owner: "Nội dung", actions: ["Mở"] },
        { id: "house-2", tenMuc: "Biến thể nghi thức theo không gian nhỏ", trangThai: "Chờ duyệt", doiTuong: "Thành viên nội thành", owner: "Niệm kinh", actions: ["Duyệt"] },
        { id: "house-3", tenMuc: "FAQ trang trí không gian tu tập", trangThai: "Đang xuất bản", doiTuong: "Tất cả", owner: "Hướng dẫn", actions: ["Mở"] },
      ]}
    />
  );
}

export function LifeReleasePage() {
  return (
    <WorkspaceTablePage
      title="Phóng sanh"
      description="Quản lý guide, biến thể nội dung và gói hỗ trợ cho luồng phóng sanh."
      searchPlaceholder="Tìm guide phóng sanh hoặc biến thể nghi thức"
      columns={[
        { key: "tenMuc", label: "Mục nội dung" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
        { key: "ghiChu", label: "Ghi chú" },
      ]}
      rows={[
        { id: "release-1", tenMuc: "Hướng dẫn phát nguyện phóng sanh", trangThai: "Đang xuất bản", owner: "Hỗ trợ", ghiChu: "Liên kết với assisted entry", actions: ["Mở"] },
        { id: "release-2", tenMuc: "Biến thể nội dung theo mùa", trangThai: "Nháp", owner: "Biên tập", ghiChu: "Đang đợi duyệt ngôn ngữ", actions: ["Mở"] },
        { id: "release-3", tenMuc: "Gói FAQ người mới", trangThai: "Đang xuất bản", owner: "Cộng đồng", ghiChu: "Tỷ lệ mở cao từ trang public", actions: ["Mở"] },
      ]}
    />
  );
}

export function MediaLibraryPage() {
  return (
    <WorkspaceTablePage
      title="Thư viện pháp môn"
      description="Điều phối collection media, tag nổi bật và item phục vụ các surface public."
      searchPlaceholder="Tìm collection, tag hoặc asset"
      columns={[
        { key: "boSuuTap", label: "Collection" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "soMuc", label: "Số mục", className: "w-[120px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
      ]}
      rows={[
        { id: "library-1", boSuuTap: "Pháp thoại căn bản", trangThai: "Đang xuất bản", soMuc: "128", owner: "Media", actions: ["Mở"] },
        { id: "library-2", boSuuTap: "Bộ hình niệm Phật", trangThai: "Chờ duyệt", soMuc: "36", owner: "Thiết kế", actions: ["Duyệt"] },
        { id: "library-3", boSuuTap: "Audio lễ sáng", trangThai: "Đang xuất bản", soMuc: "18", owner: "Niệm kinh", actions: ["Mở"] },
      ]}
    />
  );
}

export function DownloadsPage() {
  return (
    <WorkspaceTablePage
      title="Tài liệu"
      description="Quản lý tài liệu tải về, mapping sang các module public và kiểm tra freshness."
      searchPlaceholder="Tìm tài liệu theo tên hoặc loại"
      columns={[
        { key: "tenTaiLieu", label: "Tài liệu" },
        { key: "loai", label: "Loại", className: "w-[160px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "capNhat", label: "Cập nhật", className: "w-[160px]" },
      ]}
      rows={[
        { id: "download-1", tenTaiLieu: "Sổ tay thực tập tại gia", loai: "PDF", trangThai: "Đang xuất bản", capNhat: "26/03 21:10", actions: ["Mở"] },
        { id: "download-2", tenTaiLieu: "Checklist lễ trực tuyến", loai: "DOCX", trangThai: "Chờ duyệt", capNhat: "25/03 10:05", actions: ["Duyệt"] },
        { id: "download-3", tenTaiLieu: "Slide nhập môn", loai: "PPTX", trangThai: "Đang xuất bản", capNhat: "24/03 08:50", actions: ["Mở"] },
      ]}
    />
  );
}

export function SutrasPage() {
  return (
    <WorkspaceTablePage
      title="Kinh sách"
      description="Quản trị sutra list, chapter detail và các liên kết tới Baihua khi có."
      searchPlaceholder="Tìm bộ kinh, chương hoặc bản dịch"
      columns={[
        { key: "tenBoKinh", label: "Bộ kinh" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "chuong", label: "Chương", className: "w-[120px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
      ]}
      rows={[
        { id: "sutra-1", tenBoKinh: "Kinh A Di Đà", trangThai: "Đang xuất bản", chuong: "24", owner: "Kinh sách", actions: ["Mở"] },
        { id: "sutra-2", tenBoKinh: "Kinh Phổ Môn", trangThai: "Đang xử lý", chuong: "8", owner: "Biên tập", actions: ["Mở"] },
        { id: "sutra-3", tenBoKinh: "Kinh Địa Tạng", trangThai: "Chờ duyệt", chuong: "13", owner: "Kinh sách", actions: ["Duyệt"] },
      ]}
    />
  );
}

export function MediaAssetsPage() {
  return (
    <WorkspaceTablePage
      title="Media"
      description="Theo dõi asset upload, owner đang nhúng và tình trạng xử lý media trong admin."
      searchPlaceholder="Tìm asset theo tên file hoặc owner"
      columns={[
        { key: "tep", label: "Tệp" },
        { key: "loai", label: "Loại", className: "w-[140px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "thamChieu", label: "Đang dùng tại" },
      ]}
      rows={[
        { id: "media-1", tep: "banner-le-vu-lan.webp", loai: "Ảnh", trangThai: "Ổn định", thamChieu: "Bài viết / Sự kiện", actions: ["Xem", "Thay thế"] },
        { id: "media-2", tep: "audio-nghi-thuc-01.mp3", loai: "Audio", trangThai: "Đang xử lý", thamChieu: "Niệm kinh", actions: ["Mở"] },
        { id: "media-3", tep: "tai-lieu-nhap-mon.pdf", loai: "PDF", trangThai: "Ổn định", thamChieu: "Hướng dẫn / Tài liệu", actions: ["Xem"] },
      ]}
    />
  );
}

export function CommunityPostsPage() {
  return (
    <WorkspaceTablePage
      title="Bài đăng cộng đồng"
      description="Theo dõi bài đăng thành viên, trạng thái kiểm duyệt và mức độ ưu tiên xử lý."
      searchPlaceholder="Tìm bài đăng theo tiêu đề, tác giả hoặc trạng thái"
      columns={[
        { key: "tieuDe", label: "Bài đăng" },
        { key: "tacGia", label: "Tác giả", className: "w-[180px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "uuTien", label: "Ưu tiên", className: "w-[140px]" },
      ]}
      rows={[
        { id: "community-1", tieuDe: "Nhật ký 21 ngày hành trì", tacGia: "Liên Hoa", trangThai: "Đang xuất bản", uuTien: "Bình thường", actions: ["Mở"] },
        { id: "community-2", tieuDe: "Chia sẻ kinh nghiệm tụng chú", tacGia: "Thiện Minh", trangThai: "Chờ duyệt", uuTien: "Cao", actions: ["Duyệt", "Trả lại"] },
        { id: "community-3", tieuDe: "Ảnh bàn thờ tại gia", tacGia: "An Nhiên", trangThai: "Đang xử lý", uuTien: "Trung bình", actions: ["Mở"] },
      ]}
    />
  );
}

export function GuestbookPage() {
  return (
    <WorkspaceTablePage
      title="Sổ lưu niệm"
      description="Rà soát nội dung guestbook, quyết định duyệt và gắn theo ngữ cảnh sự kiện liên quan."
      searchPlaceholder="Tìm theo người gửi, nội dung hoặc sự kiện"
      columns={[
        { key: "nguoiGui", label: "Người gửi" },
        { key: "suKien", label: "Sự kiện", className: "w-[220px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "capNhat", label: "Cập nhật", className: "w-[160px]" },
      ]}
      rows={[
        { id: "guestbook-1", nguoiGui: "Gia đình Phúc An", suKien: "Khóa tu cuối tuần", trangThai: "Đang xuất bản", capNhat: "27/03 07:10", actions: ["Mở"] },
        { id: "guestbook-2", nguoiGui: "Thiện Hòa", suKien: "Lễ Vu Lan", trangThai: "Chờ duyệt", capNhat: "26/03 22:30", actions: ["Duyệt", "Ẩn"] },
      ]}
    />
  );
}

export function ModerationReportsPage() {
  return (
    <WorkspaceTablePage
      title="Báo cáo"
      description="Bàn điều phối kiểm duyệt báo cáo từ thành viên, ưu tiên theo mức độ và target ảnh hưởng."
      searchPlaceholder="Tìm báo cáo theo mã, target hoặc người gửi"
      primaryAction="Mở hàng chờ"
      stats={[
        { label: "Mở mới", value: "24", note: "6 báo cáo phát sinh trong 24 giờ gần nhất" },
        { label: "Đang xử lý", value: "11", note: "3 case cần phối hợp với community ops" },
        { label: "Khẩn", value: "4", note: "Ưu tiên liên quan trực tiếp đến nội dung public" },
        { label: "Tỷ lệ xử lý 24h", value: "83%", note: "Cần đưa lên 90% cho lane moderation chính" },
      ]}
      filters={[
        { label: "Tất cả", value: "all", predicate: () => true },
        { label: "Mở mới", value: "new", predicate: (row) => row.trangThai === "Mở mới" },
        { label: "Đang xử lý", value: "processing", predicate: (row) => row.trangThai === "Đang xử lý" },
        { label: "Khẩn", value: "urgent", predicate: (row) => row.uuTien === "Khẩn" },
      ]}
      columns={[
        { key: "maBaoCao", label: "Mã", className: "w-[140px]" },
        { key: "target", label: "Đối tượng" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "uuTien", label: "Ưu tiên", className: "w-[140px]" },
        { key: "nguoiGui", label: "Người gửi", className: "w-[180px]" },
      ]}
      rows={[
        { id: "report-1", maBaoCao: "RPT-24031", target: "Bài đăng cộng đồng #CP-991", trangThai: "Mở mới", uuTien: "Khẩn", nguoiGui: "Minh Quang", actions: ["Mở", "Nhận xử lý"] },
        { id: "report-2", maBaoCao: "RPT-24018", target: "Bình luận #CM-1182", trangThai: "Đang xử lý", uuTien: "Cao", nguoiGui: "Diệu Tâm", actions: ["Mở", "Ra quyết định"] },
        { id: "report-3", maBaoCao: "RPT-23994", target: "Bài viết hướng dẫn", trangThai: "Đang xử lý", uuTien: "Trung bình", nguoiGui: "Hồng Liên", actions: ["Mở"] },
      ]}
    />
  );
}

export function ModerationCommentsPage() {
  return (
    <WorkspaceTablePage
      title="Bình luận"
      description="Theo dõi comment đã bị cờ, điều phối ẩn/khôi phục và kiểm tra lịch sử thao tác."
      searchPlaceholder="Tìm bình luận theo tác giả, target hoặc trạng thái"
      columns={[
        { key: "noiDung", label: "Nội dung bình luận" },
        { key: "target", label: "Đối tượng", className: "w-[220px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "capNhat", label: "Cập nhật", className: "w-[160px]" },
      ]}
      rows={[
        { id: "comment-1", noiDung: "Xin hỏi lịch phát nguyện buổi tối?", target: "Bài viết / Phóng sanh", trangThai: "Đang hiển thị", capNhat: "27/03 13:55", actions: ["Ẩn", "Mở chi tiết"] },
        { id: "comment-2", noiDung: "Nội dung này cần chỉnh lại nguồn trích dẫn", target: "Bài viết / Kinh sách", trangThai: "Đã ẩn", capNhat: "26/03 19:20", actions: ["Khôi phục"] },
        { id: "comment-3", noiDung: "Tôi muốn được hỗ trợ nhập hộ", target: "Hỗ trợ / Phát nguyện", trangThai: "Chờ rà soát", capNhat: "26/03 08:45", actions: ["Mở"] },
      ]}
    />
  );
}

export function UsersAdminPage() {
  return (
    <WorkspaceTablePage
      title="Người dùng"
      description="Danh sách thành viên, vai trò vận hành và các thao tác khóa/mở theo đúng lane admin."
      searchPlaceholder="Tìm người dùng theo email, tên hoặc vai trò"
      primaryAction="Thêm quản trị viên"
      stats={[
        { label: "Tổng thành viên", value: "18.420", note: "Bao gồm cả tài khoản chưa xác minh và đã khóa" },
        { label: "Quản trị viên", value: "18", note: "Phân tách theo owner: nội dung, community, hệ thống" },
        { label: "Đang bị khóa", value: "23", note: "Chỉ 4 tài khoản cần rà soát lại trong hôm nay" },
        { label: "Hoạt động 7 ngày", value: "5.812", note: "Tăng 6,1% so với tuần trước" },
      ]}
      filters={[
        { label: "Tất cả", value: "all", predicate: () => true },
        { label: "Hoạt động", value: "active", predicate: (row) => row.trangThai === "Hoạt động" },
        { label: "Đang khóa", value: "blocked", predicate: (row) => row.trangThai === "Đang khóa" },
        { label: "Quản trị", value: "admin", predicate: (row) => String(row.vaiTro).includes("Admin") },
      ]}
      columns={[
        { key: "hoTen", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "vaiTro", label: "Vai trò", className: "w-[160px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "lanCuoi", label: "Lần cuối", className: "w-[160px]" },
      ]}
      rows={[
        { id: "user-1", hoTen: "Ngọc Minh", email: "ngoc.minh@pmtl.vn", vaiTro: "Admin nội dung", trangThai: "Hoạt động", lanCuoi: "27/03 14:08", actions: ["Mở hồ sơ"] },
        { id: "user-2", hoTen: "Diệu An", email: "dieu.an@pmtl.vn", vaiTro: "Moderator", trangThai: "Hoạt động", lanCuoi: "27/03 13:02", actions: ["Mở hồ sơ", "Đổi vai trò"] },
        { id: "user-3", hoTen: "Tâm Hòa", email: "tam.hoa@pmtl.vn", vaiTro: "Thành viên", trangThai: "Đang khóa", lanCuoi: "23/03 09:20", actions: ["Mở hồ sơ", "Mở khóa"] },
      ]}
    />
  );
}

export function SessionsPage() {
  return (
    <WorkspaceTablePage
      title="Phiên đăng nhập"
      description="Theo dõi session đang mở, thiết bị và khả năng revoke hàng loạt khi cần."
      searchPlaceholder="Tìm session theo email, IP hoặc thiết bị"
      columns={[
        { key: "nguoiDung", label: "Người dùng" },
        { key: "thietBi", label: "Thiết bị" },
        { key: "ip", label: "IP", className: "w-[140px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "lanCuoi", label: "Lần cuối", className: "w-[160px]" },
      ]}
      rows={[
        { id: "session-1", nguoiDung: "Ngọc Minh", thietBi: "Chrome / Windows", ip: "14.177.22.18", trangThai: "Hoạt động", lanCuoi: "27/03 14:10", actions: ["Thu hồi"] },
        { id: "session-2", nguoiDung: "Diệu An", thietBi: "Safari / iPhone", ip: "171.244.12.91", trangThai: "Hoạt động", lanCuoi: "27/03 13:54", actions: ["Thu hồi"] },
        { id: "session-3", nguoiDung: "Tâm Hòa", thietBi: "Firefox / Ubuntu", ip: "103.53.88.20", trangThai: "Cảnh báo", lanCuoi: "26/03 22:18", actions: ["Mở hồ sơ", "Thu hồi"] },
      ]}
    />
  );
}

export function CalendarEventsPage() {
  return (
    <WorkspaceTablePage
      title="Lịch & Sự kiện"
      description="Điều phối sự kiện, lịch âm lệch, advisory preview và các đợt refresh personal practice."
      searchPlaceholder="Tìm sự kiện theo tên, loại hoặc trạng thái"
      primaryAction="Tạo sự kiện"
      columns={[
        { key: "suKien", label: "Sự kiện" },
        { key: "lich", label: "Lịch", className: "w-[180px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "owner", label: "Phụ trách", className: "w-[160px]" },
      ]}
      rows={[
        { id: "event-1", suKien: "Lễ sám hối cuối tháng", lich: "29/03 19:30", trangThai: "Đang xuất bản", owner: "Sự kiện", actions: ["Mở", "Dời lịch"] },
        { id: "event-2", suKien: "Khóa tu cuối tuần", lich: "05/04 08:00", trangThai: "Chờ duyệt", owner: "Vận hành", actions: ["Mở", "Duyệt"] },
        { id: "event-3", suKien: "Nhắc lịch công quả", lich: "Theo advisory", trangThai: "Đang xử lý", owner: "Lịch", actions: ["Xem preview"] },
      ]}
    />
  );
}

export function NotificationsPage() {
  return (
    <WorkspaceTablePage
      title="Thông báo"
      description="Theo dõi push status, lịch sử push jobs và tỉ lệ subscription đang hoạt động."
      searchPlaceholder="Tìm job theo mã, nguồn kích hoạt hoặc trạng thái"
      primaryAction="Tạo đợt gửi"
      columns={[
        { key: "job", label: "Mã đợt gửi" },
        { key: "nguon", label: "Nguồn", className: "w-[180px]" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
        { key: "guiLuc", label: "Gửi lúc", className: "w-[160px]" },
      ]}
      rows={[
        { id: "push-1", job: "PUSH-2741", nguon: "Lịch / advisory", trangThai: "Chờ gửi", guiLuc: "27/03 18:00", actions: ["Mở", "Redrive"] },
        { id: "push-2", job: "PUSH-2738", nguon: "Niệm kinh / kế hoạch", trangThai: "Thành công", guiLuc: "27/03 07:00", actions: ["Mở"] },
        { id: "push-3", job: "PUSH-2731", nguon: "Bài viết / phát hành", trangThai: "Cảnh báo", guiLuc: "26/03 20:30", actions: ["Mở", "Gửi lại"] },
      ]}
    />
  );
}

export function VolunteersPage() {
  return (
    <WorkspaceTablePage
      title="Phụng sự viên"
      description="Quản lý danh sách volunteer, vai trò trực và thông tin liên hệ dùng trong các surface hỗ trợ."
      searchPlaceholder="Tìm phụng sự viên theo tên, vai trò hoặc số điện thoại"
      primaryAction="Thêm phụng sự viên"
      columns={[
        { key: "hoTen", label: "Họ tên" },
        { key: "vaiTro", label: "Vai trò", className: "w-[180px]" },
        { key: "lienHe", label: "Liên hệ" },
        { key: "trangThai", label: "Trạng thái", className: "w-[140px]" },
      ]}
      rows={[
        { id: "volunteer-1", hoTen: "Thanh Tịnh", vaiTro: "Hỗ trợ phóng sanh", lienHe: "0909 221 455", trangThai: "Hoạt động", actions: ["Mở"] },
        { id: "volunteer-2", hoTen: "Như Ý", vaiTro: "Chăm sóc thành viên", lienHe: "0912 477 281", trangThai: "Hoạt động", actions: ["Mở"] },
        { id: "volunteer-3", hoTen: "Pháp Bảo", vaiTro: "Điều phối lịch", lienHe: "0933 661 008", trangThai: "Tạm nghỉ", actions: ["Mở"] },
      ]}
    />
  );
}

export function SearchOpsPage() {
  const [query, setQuery] = useState("");

  const jobs = useMemo(
    () =>
      [
        ["JOB-9912", "posts", "Hoàn tất", "27/03 13:58"],
        ["JOB-9911", "guides", "Đang chạy", "27/03 13:41"],
        ["JOB-9908", "chant-items", "Cảnh báo", "27/03 12:15"],
      ].filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi trạng thái index, hiệu năng, fallback event và điều phối reindex theo đúng lane hệ thống.
          </p>
        </div>
        <Button>
          <RefreshCcwIcon />
          Reindex ngay
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-xl">
            <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm job lập chỉ mục, nguồn hoặc lỗi fallback"
              className="ps-9"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tong-quan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="hieu-nang">Hiệu năng</TabsTrigger>
          <TabsTrigger value="jobs">Job lập chỉ mục</TabsTrigger>
          <TabsTrigger value="fallback">Sự kiện fallback</TabsTrigger>
          <TabsTrigger value="cai-dat">Cài đặt index</TabsTrigger>
        </TabsList>

        <TabsContent value="tong-quan" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Chỉ mục khỏe", "9/10", "1 chỉ mục đang queue refresh"],
            ["Độ trễ truy vấn", "86 ms", "Giữ dưới ngưỡng 120 ms"],
            ["Fallback 24h", "14", "Chủ yếu ở media-library"],
            ["Job đang chạy", "1", "Nguồn hướng dẫn đang reindex"],
          ].map(([label, value, note]) => (
            <Card key={label}>
              <CardHeader className="pb-3">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{note}</CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hieu-nang">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu năng truy vấn</CardTitle>
              <CardDescription>So sánh cụm index chính, queue và tỷ lệ fallback trong 24 giờ gần nhất.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {[
                ["Bài viết", "74 ms", "Ổn định"],
                ["Hướng dẫn", "92 ms", "Ổn định"],
                ["Media", "168 ms", "Cảnh báo"],
              ].map(([label, value, state]) => (
                <div key={label} className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                  <Badge variant={state === "Ổn định" ? "secondary" : "outline"} className="mt-3">
                    {state}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job lập chỉ mục</CardTitle>
              <CardDescription>Job queue cho reindex thủ công và tự động.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã job</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Khởi chạy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map(([job, source, status, startedAt]) => (
                    <TableRow key={job}>
                      <TableCell>{job}</TableCell>
                      <TableCell>{source}</TableCell>
                      <TableCell><Badge variant={status === "Hoàn tất" ? "secondary" : "outline"}>{status}</Badge></TableCell>
                      <TableCell>{startedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fallback">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện fallback</CardTitle>
              <CardDescription>Sự kiện fallback cần điều tra để tránh trải nghiệm tìm kiếm lệch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Thư viện pháp môn", "Không có hit trực tiếp, đang rơi về suggestion list", "27/03 13:20"],
                ["Niệm kinh", "Truy vấn dấu/không dấu lệch tokenization", "27/03 10:44"],
                ["Kinh sách", "Bản dịch Baihua chưa đồng bộ freshness", "26/03 21:12"],
              ].map(([scope, note, time]) => (
                <div key={`${scope}-${time}`} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{scope}</p>
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cai-dat">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt index</CardTitle>
              <CardDescription>Các setting đang áp dụng cho sortable/filterable/searchable attributes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                ["searchableAttributes", "title, excerpt, aliases, tags"],
                ["filterableAttributes", "status, category, module, updatedAt"],
                ["sortableAttributes", "updatedAt, publishedAt, priority"],
                ["typoTolerance", "enabled, strict on sutra codes"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AssistedEntryPage() {
  const [memberQuery, setMemberQuery] = useState("");

  const members = useMemo(
    () =>
      [
        ["MBR-1021", "Nguyễn Minh Hòa", "3 lời nguyện đang mở"],
        ["MBR-0994", "Lê Tịnh Tâm", "1 lời nguyện cần nhập hộ"],
        ["MBR-0877", "Phạm Diệu An", "2 tiến trình đang theo dõi"],
      ].filter((item) => item.join(" ").toLowerCase().includes(memberQuery.toLowerCase())),
    [memberQuery],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Nhập hộ phát nguyện</h1>
        <p className="text-sm text-muted-foreground">
          Surface hỗ trợ nhập hộ lời nguyện, tra cứu thành viên và kiểm tra lịch sử nhập liệu.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tạo phiếu nhập hộ</CardTitle>
            <CardDescription>Form tối giản cho lane hỗ trợ, không mở public signup trong admin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="member-search" className="text-sm font-medium">Tìm thành viên</label>
              <Input id="member-search" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Nhập tên, email hoặc mã thành viên" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="vow-title" className="text-sm font-medium">Nội dung phát nguyện</label>
              <Input id="vow-title" defaultValue="Phóng sanh hồi hướng cho gia đình" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="operator-note" className="text-sm font-medium">Ghi chú vận hành</label>
              <Input id="operator-note" defaultValue="Yêu cầu xác nhận lại ngày thực hiện vào tối nay." />
            </div>
            <div className="flex justify-end">
              <Button>
                <SendHorizonalIcon />
                Lưu phiếu nhập hộ
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả thành viên</CardTitle>
            <CardDescription>Đề xuất nhanh để gắn đúng hồ sơ trước khi nhập hộ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map(([id, name, note]) => (
              <div key={id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{id}</p>
                  </div>
                  <Badge variant="outline">Khớp</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử gần đây</CardTitle>
          <CardDescription>Các phiếu nhập hộ mới nhất để đối soát và tiếp tục theo dõi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["AE-401", "Nguyễn Minh Hòa", "Phóng sanh cho gia đình", "Đang xử lý", "27/03 13:00"],
                ["AE-398", "Lê Tịnh Tâm", "Hồi hướng sức khỏe", "Hoàn tất", "26/03 19:15"],
                ["AE-392", "Phạm Diệu An", "Nhập lại lời nguyện cũ", "Chờ xác nhận", "26/03 09:20"],
              ].map(([id, member, title, status, time]) => (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
                  <TableCell>{member}</TableCell>
                  <TableCell>{title}</TableCell>
                  <TableCell><Badge variant={status === "Hoàn tất" ? "secondary" : "outline"}>{status}</Badge></TableCell>
                  <TableCell>{time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmptySectionCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDaysIcon className="size-4" />
        Nội dung được giữ theo slot PMTL tương ứng, không để route chết hoặc copy dev nội bộ.
      </CardContent>
    </Card>
  );
}
