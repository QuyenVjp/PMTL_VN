# Content Module (Kho Tàng Nội Dung)

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Content Module
## Goals (Mục tiêu)
- Lưu trữ các Sutras (Kinh điển), Bài viết, và Assets/Media.
- Phân phối nội dung theo quyền truy cập (Public/Private/Draft).
- Quản lý Taxonomy: Thẻ (Tags), Chuyên mục (Categories), và Chuỗi bài (Series).
- Theo dõi lịch sử thay đổi (Versioning) và trạng thái xuất bản.

## Key Stakeholders (Người dùng chính)
- **Admin**: Create, Edit, Moderate, and Publish.
- **Editor**: Create, Edit, and Submit for Review.
- **Member**: Read content, Bookmark, and Follow items.
- **Guest**: Read public content only.

## Content Types (Các loại nội dung)
- **Sutras**: Kinh văn Phật giáo chính thống.
- **Posts**: Articles, news, and insights.
- **HubPages**: Landing pages or collection views.
- **Media**: Audio tracks, images, and PDFs.
- **Documents**: Commentary and teaching materials.

## Logical Structure (Cấu trúc logic)
- **Content Core**: Posts, Sutras, HubPages.
- **Taxonomy**: Categories, Tags, Series.
- **Media System**: Assets, AudioTracks, PdfDocuments.
- **Versioning**: Revisions, PublishHistory.
- **Permissions**: Visibility control, AccessControl logic.

## Content Lifecycle (Vòng đời nội dung)
- **Draft** (Bản nháp)
- **SubmittedForReview** (Chờ duyệt)
- **Approved** (Đã duyệt)
- **Published** (Đã xuất bản trực tuyến)
- **Archived** (Lưu trữ/Ẩn đi)
- **Deleted** (Soft-delete để giữ Audit Log)

## Core Use Cases (Các trường hợp sử dụng chính)
- CMS Operations: Create & Edit nội dung mới.
- Moderation Workflow: Duyệt bài trước khi Go-live.
- Publish & Unpublish nội dung linh hoạt.
- Taxonomy Management: Gắn nhãn phân loại chuyên sâu.
- Create Series & Cross-linking giữa các nội dung.
- Media Management: Upload tài nguyên đính kèm.
- Version Control: Theo dõi và khôi phục các phiên bản cũ.
- Search & Discovery: Tìm kiếm và bộ lọc nâng cao.
- Engagement: Bookmark và Reading Progress.

## Technical Priorities (Ưu tiên kỹ thuật)
- **Source of Truth**: PostgreSQL 17.
- **Search & Filter Engine**: Meilisearch (High-speed faceted search).
- **Caching Layer**: Redis (Recent, Featured, and Trending content).
- **Async Jobs (Tác vụ ngầm)**: Reindex search, Notification, and Cleanup tasks.
- **Auditing System**: PublishHistory, RevisionHistory, and AuditLog.
