# PMTL_VN: Domain Map (Bản Đồ Hệ Thống)

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# ☸️ Pháp Môn Tâm Linh (PMTL_VN)

## 👥 Personas & Roles (Đối tượng & Vai trò)
- **Guest (Khách)**: Chưa đăng ký, chỉ có thể xem nội dung Public.
- **Member (Thành viên)**: Đăng ký tài khoản, có thể Bookmarks, Bình luận, và tham gia Social Community.
- **Editor (Biên tập viên)**: Sáng tạo và biên tập Content (Kinh điển, Bài viết).
- **Moderator (Người điều phối)**: Duyệt bài (Approval), phản hồi báo cáo, xử lý vi phạm.
- **Admin (Quản trị viên)**: Toàn quyền quản trị hệ thống, cấu hình System Settings.

## 01. Content Domain (Kho Tàng Nội Dung) - CORE
### 01.1 📂 Canonical Texts (Kinh Điển Chính)
- **Sutras**: Các bản kinh văn Phật giáo chính thống.
- **SutraVolumes**: Phân loại theo quyển/bộ kinh.
- **SutraChapters**: Các chương mục chi tiết trong kinh văn.
- **SutraGlossary**: Thụât ngữ chuyên môn và giải nghĩa các từ khó.
- **BeginnerGuides**: Các hướng dẫn (How-to) dành cho người mới.
- **SutraLinks**: Liên kết trích dẫn chéo (Cross-references) giữa các bản kinh.

**Use cases**: Đọc kinh, Tìm kiếm, Bookmark, Comment, Progress Tracking.

### 01.2 📰 Insights & Articles (Bài Viết & Khai Thị)
- **Posts**: Tin tức, bài viết khai thị ngắn, các bài bạch thoại.
- **HubPages**: Trang tổng hợp hoặc Landing Pages chuyên sâu.
- **ScriptureCommentary**: Các bài giảng giải và bình chú chi tiết.
- **TeachingNotes**: Ghi chú tóm tắt từ các buổi Pháp thoại.
- **PaperArticles**: Các bài báo cáo nghiên cứu học thuật.
- **Categories & Tags**: Hệ thống phân loại nội dung (Taxonomy).
- **Series**: Chuỗi bài viết hoặc Course bài giảng theo chủ đề.

**Use cases**: CMS Operations (Tạo, Sửa, Duyệt, Xuất bản), Taxonomy Management.

### 01.3 🎞️ Assets & Media Resources
- **MediaAssets**: Kho lưu trữ ảnh, audio, video, PDF.
- **AudioTracks**: Các bản ghi âm Pháp âm hoặc âm nhạc thiền định.
- **PdfDocuments**: Các tài liệu E-book hoặc văn bản PDF để tải về.
- **Galleries**: Bộ sưu tập hình ảnh sự kiện, khóa tu.
- **TranscriptDocuments**: Bản chép lời (Transcripts) từ video/audio.
- **FileDownloads**: Quản lý quyền truy cập và lượt tải về.

**Use cases**: Media Upload, RBAC cho Downloads, Tracking số lượt xem/tải.

---

## 02. Individual Practice & Engagement (Tu Tập Cá Nhân)
### 02.1 🧘 Practice Plans (Lộ trình Tu tập)
- **ChantPlans**: Kế hoạch tụng kinh hàng ngày.
- **ChantItems**: Các bài kinh lẻ hoặc Nghi quỹ cụ thể.
- **ChantSchedules**: Lập lịch: Frequency, Time Slots, Weekday rules.
- **PracticePresets**: Các bản cài đặt sẵn (Vd: Khóa lễ sáng/tối).
- **PracticeNotifications**: Nhắc nhở qua Push-notification hoặc Email.

**Use cases**: Thiết lập lộ trình, Bật/Tắt lịch nhắc, Ghi chép Practice Log.

### 02.2 📅 Buddhist Calendar & Events (Lịch & Sự kiện)
- **LunarCalendar**: Lịch âm dương tích hợp (Default là âm lịch).
- **LunarEvents**: Các ngày đại lễ Phật giáo quan trọng.
- **LunarEventOverrides**: Tùy chỉnh cá nhân (Ngày giỗ, ngày phát nguyện).
- **Events**: Thông báo về các buổi Offline, Khóa tu, Webinar.
- **EventRegistrations**: Quản lý việc User đăng ký tham gia.

**Use cases**: Tra cứu lịch âm, Đăng ký sự kiện, Nhận Reminder.

### 02.3 📈 Progress Tracking (Theo dõi Tiến độ)
- **ReadingProgress**: % hoàn thành khi đọc Kinh văn theo chương/phẩm.
- **ReadingHistory**: Lịch sử chi tiết các nội dung đã xem.
- **Bookmarks & Collections**: Lưu trữ các trích dẫn yêu thích theo chủ đề.
- **StreakData**: Thống kê chuỗi ngày tu tập liên tục.
- **UserStats**: Tổng hợp số liệu cá nhân để khích lệ tinh thần.

**Use cases**: Review Progress, Xuất báo cáo lịch sử (Export), Xem Leaderboard.

---

## 03. Sangha Connect (Cộng Đồng & Tương Tác)
### 03.1 💬 Social Exchange (Thảo luận & Trao đổi)
- **CommunityThreads**: Các chủ đề thảo luận chung trên Forum.
- **ThreadReplies**: Các câu trả lời cấp 1.
- **NestedReplies**: Các phản hồi theo dạng lồng nhau (Tree-structure).
- **PostComments**: Hệ thống bình luận trực tiếp dưới Content bài viết.
- **CommentLikes & Mentions**: Tương tác nhanh giữa các thành viên (@username).

### 03.2 👥 Social Graph (Mối Quan Hệ)
- **UserFollows**: Theo dõi hoạt động của thành viên khác.
- **Subscriptions**: Đăng ký nhận thông báo từ Thread hoặc Author cụ thể.
- **BlockedUsers**: Tính năng chặn tài khoản vi phạm.

### 03.3 🎖️ Reputation & Gamification
- **UserPoints**: Điểm Contributor dựa trên đóng góp nội dung.
- **UserBadges**: Huy hiệu danh dự dành cho các đóng góp nổi bật.
- **LeaderboardSnapshots**: Bảng xếp hạng hàng tuần/tháng (Cached).

---

## 04. Moderation & Compliance (Kiểm Duyệt & An Toàn)
### 04.1 🛡️ Reports & Workflow
- **ModerationReports**: Tiếp nhận báo cáo vi phạm từ User.
- **ReportCategories**: Phân loại lỗi (Spam, Offensive, Misinformation, v.v.).
- **ModerationQueue**: Hàng chờ xử lý dành cho Moderators.

### 04.2 ⚖️ Policies & Violation History
- **ContentPolicies**: Quy tắc cộng đồng (Auto-flag bằng từ khóa nhạy cảm).
- **ViolationHistory**: Hồ sơ vi phạm của User (Warning, Suspension, Ban).
- **EscalationQueue**: Chuyển các trường hợp khó lên Admin xử lý.

---

## 05. Search & Discovery (Tìm Kiếm & Khám Phá)
- **SearchIndex**: Đồng bộ dữ liệu sang Meilisearch Index.
- **SearchFilters & Facets**: Bộ lọc theo Category, Tag, Date, Author.
- **SearchSuggestions**: Gợi ý từ khóa tự động (Autocomplete).
- **Recommendations**: Đề xuất nội dung dựa trên Reading History & Bookmarks.

---

## 06. Communication Channels (Thông Báo & Liên Lạc)
- **NotificationPreferences**: Cài đặt kênh nhận (Push, Email, In-app).
- **EmailDigests**: Bản tin tổng hợp hàng ngày hoặc hàng tuần.
- **NotificationQueue**: Xử lý gửi thông báo hàng loạt qua Async Jobs.

---

## 07. Identity & Auth (Xác Thực & Quản Lý Danh Tính)
- **Users**: Dữ liệu cơ bản, Role, Trạng thái (Active/Inactive).
- **Profiles**: Các thông tin bổ trợ như avatar, pháp danh, bio.
- **Permissions Matrix**: Bảng phân quyền Role-to-Permission chi tiết.
- **ApiTokens**: Quản lý các Token truy cập cho tích hợp bên ngoài.

---

## 08. Platform Infrastructure (Hạ Tầng & Vận Hành)
- **AuditLogs**: Nhật ký ghi lại toàn bộ thay đổi dữ liệu hệ thống.
- **SystemHealth**: Monitor sức khỏe DB, Redis, Worker, Meilisearch.
- **ScheduledTasks**: Quản lý các công việc định kỳ (Dọn dẹp logs, Reindex).
- **BackupSnapshots**: Quản lý các bản sao lưu dữ liệu an toàn.

---

## 🔄 Future Enhancements (Mở rộng trong tương lai)
- **InternalNotes**: Ghi chú nội bộ cho ban biên tập.
- **ContentVersioning**: So sánh thay đổi giữa các phiên bản bài viết.
- **i18n Support**: Hỗ trợ hiển thị đa ngôn ngữ.
- **Real-time Feed**: Các thông báo tức thời qua WebSockets.
