# Content Module: Design Decisions (Các Quyết định Thiết kế)

## Decision 1: Single Posts Table with post_type Discriminator

**Context (Ngữ cảnh)**: Hệ thống cần hỗ trợ đồng thời Bài viết (Posts), Kinh văn (Sutras), Trang Hub (HubPages), và Tài liệu (Documents) trong cùng một module.

**Options (Các phương án)**:
- A: Một bảng `posts` duy nhất sử dụng cột `post_type` để phân loại.
- B: Chia thành các bảng riêng biệt (PostsTable, SutrasTable, HubPagesTable).
- C: Sử dụng Inheritance Pattern (Mẫu kế thừa) với các bảng phụ chuyên biệt.

**Decision (Quyết định)**: A (Sử dụng Single Posts Table với bộ phân loại Discriminator).

**Rationale (Lý do)**:
- DB Schema đơn giản hơn, giảm thiểu gánh nặng quản trị dữ liệu.
- Các Common Queries xuyên suốt hệ thống (Search, List, Filter) luôn duy trì tốc độ tối ưu.
- Cột `post_type` sẽ đóng vai trò điều hướng UI Logic, thay vì làm phức tạp hóa Schema.
- Tránh được sự phức tạp của lệnh JOIN trong các thao tác dữ liệu thông thường.
- Các Payload Collections vẫn có thể sở hữu Admin Interfaces riêng biệt.

**Trade-off (Đánh đổi)**: Một số trường dữ liệu có thể không được sử dụng hết tùy theo phân loại (Vd: sutra-specific metadata). Giải pháp: Sử dụng Nullable Columns kết hợp với Documented Conventions.

---

## Decision 2: Revision History vs Content Versioning Strategy

**Context (Ngữ cảnh)**: Cần theo dõi xem Ai đã thay đổi Cái gì, Khi nào (Audit Trail), đồng thời cho phép khôi phục (Rollback).

**Options (Các phương án)**:
- A: Lưu trữ đầy đủ lịch sử phiên bản trong bảng riêng (`post_revisions`).
- B: Sử dụng Immutable Entries, mỗi lần cập nhật đều tạo bản ghi bài viết mới hoàn toàn.
- C: Sử dụng JSONB để theo dõi các thay đổi (Delta tracking) ngay tại bảng `posts`.

**Decision (Quyết định)**: A (Tách riêng bảng `post_revisions`).

**Rationale (Lý do)**:
- Duy trì được một Audit Trail minh bạch cho việc kiểm tra.
- Hỗ trợ tính năng Rollback mà không cần các logic xử lý phức tạp.
- Giữ bảng `posts` luôn gọn nhẹ (chỉ chứa trạng thái hiện hành - Current State).
- Tốc độ Query cho "nội dung hiện tại" luôn nhanh nhất.

**Technical notes (Ghi chú kỹ thuật)**:
- `post_revisions.revision_number` sẽ tự động tăng dần (Auto-increment) cho từng bài.
- Mỗi lần nhấn Publish = Tạo ra một bản ghi Revision mới.
- Admin có thể thực hiện xem lại hoặc Restore các phiên bản cũ dễ dàng.

---

## Decision 3: Post Status Workflow (Quy trình Trạng thái Bài viết)

**Context (Ngữ cảnh)**: Quản lý vòng đời nội dung (Content Lifecycle) từ khi khởi tạo đến khi lưu trữ hoặc xóa bỏ.

**Status Flow (Luồng trạng thái)**:
```
Draft (Nháp) → SubmittedForReview (Gửi duyệt) → Approved (Đã duyệt) → Published (Đã xuất bản)
                                        ↘ Rejected (Từ chối) ↙
```

Các bước tiếp theo:
```
Published → Archived (Đã lưu trữ - ẩn khỏi Public)
Published → Deleted (Đã xóa - thực hiện Soft-delete để phục vụ Audit)
```

**Rationale (Lý do)**:
- Draft: Trạng thái chưa xuất bản, chỉ dành cho Editor.
- SubmittedForReview: Chờ đợi sự phê duyệt từ Admin hoặc Moderator.
- Published: Đã hiển thị Online cho Public hoặc Members.
- Archived: Nội dung chủ động được ẩn đi (Vd: các nội dung cũ đã lỗi thời).
- Deleted: Xóa mềm để đảm bảo Audit Compliance.

**Technical (Kỹ thuật)**:
- Timestamp `published_at` chỉ được thiết lập khi status chuyển thành `Published`.
- Các câu Query cho Public Content: `WHERE status = 'published' AND published_at <= now()`.
- Meilisearch Reindex chỉ bao gồm những bài đang ở trạng thái `Published`.

---

## Decision 4: Caching Strategy for Content Module (Chiến lược Bộ nhớ đệm)

**Context (Ngữ cảnh)**: Tối ưu hóa việc truy cập các dữ liệu có tần suất cao (Recent posts, Featured content, Categories).

**Dữ liệu đẩy vào Redis**:
- Recent Published Posts (20 bài gần nhất, TTL 1 giờ).
- Featured Posts Collections (Nội dung nổi bật, TTL 4 giờ).
- Category List & Tag Cloud (Danh sách chuyên mục và thẻ, TTL 24 giờ).
- User's Reading Progress & Bookmarks (Tiến độ đọc và đánh dấu, TTL theo phiên làm việc).

**Dữ liệu chỉ giữ tại Source-of-Truth duy nhất (Postgres)**:
- Các nội dung Drafts & Unpublished (Không cache, để đảm bảo Privacy và Data Freshness).
- Trạng thái khóa chỉnh sửa (Edit lock status).
- Thống kê lượt Comment (Comment counts - chấp nhận độ trễ nhỏ).

**Vai trò của Meilisearch Search Engine**:
- Chỉ đánh chỉ mục các bài ở trạng thái `Published`.
- Hỗ trợ Search và các Faceted Filters (Lọc theo Category, Tag, Date).

**Cơ chế Xóa Cache (Invalidation)**:
- Khi Publish/Unpublish bài viết → Invalidate cache của phần Recent Posts.
- Khi thay đổi Category → Invalidate cache chuyên mục.
- Khi User thay đổi Bookmarks → Invalidate bộ nhớ đệm Bookmarks của User đó.

---

## Decision 5: Visibility & Access Control Model

**Context (Ngữ cảnh)**: Hệ thống cần hỗ trợ đồng thời nội dung Public, Members-only, và Private.

**Model (Mô hình)**: Sử dụng Visibility Enum cho từng Post kết hợp với Role-based Checks (RBAC).

```
visibility: "public" → Dành cho tất cả (Guest, Member, Admin)
visibility: "members_only" → Chỉ dành cho thành viên đã Login + Admin
visibility: "private" → Chỉ dành cho Owner (tác giả) + Admin
```

**Implementation (Triển khai)**:
- Thêm cột `visibility` trực tiếp vào bảng `posts`.
- Payload Access Control sẽ được cấu hình trong Collection Config:
  ```ts
  find: ({ req: { user } }) => {
    if (!user) return { visibility: { equals: "public" } }
    return { OR: [
      { visibility: { equals: "public" } },
      { visibility: { equals: "members_only" } }
    ]}
  }
  ```
- Tài khoản Admin luôn tự động Bypass (bỏ qua) tất cả các lớp kiểm soát này.

**Query Optimization (Tối ưu hóa truy vấn)**:
- Thiết lập Index cho bộ đôi `(visibility, published_at)` phục vụ việc liệt kê nội dung công khai.
- Chỉ mục Meilisearch sẽ tích hợp sẵn Visibility Facet để lọc nhanh theo quyền truy cập.
