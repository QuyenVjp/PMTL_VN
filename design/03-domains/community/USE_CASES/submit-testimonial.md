# Chia Sẻ Linh Nghiệm Sự Tích — Submit Testimonial

> **Nguồn:** Mô hình cộng đồng Pháp Môn Tâm Linh toàn cầu (Malaysia, Bắc Mỹ, Singapore)
> **Trạng thái:** Design reference — moderation policy cần human review
> **Cập nhật:** 2026-04-04

---

## Purpose

Cho phép `member` chia sẻ câu chuyện thực hành đã có kết quả (linh nghiệm) như khỏi bệnh,
gia đình hòa thuận, thi cử thành công. Bài viết bắt buộc qua moderation trước khi public.
Phân hệ này độc lập với `CommunityPost` — testimonial có workflow và trách nhiệm nghiêm ngặt hơn.

---

## Owner module

`community` — [xem CONTRACTS.md](../CONTRACTS.md)
Moderation pipeline dùng lại `moderation` module hiện có.

---

## Actors

- `member` — submit testimonial
- `admin` / `moderator` — review và publish/reject
- `super-admin` — override moderation decision

---

## Trigger

User bấm **[Chia sẻ câu chuyện của bạn]** từ trang cộng đồng hoặc từ trang kết quả thực hành.

---

## Preconditions

- Có session hợp lệ (member đã đăng nhập).
- User không bị ban khỏi tính năng community.
- Không có testimonial `PENDING` đang chờ review của cùng user (giới hạn 1 pending tại một thời điểm).

---

## Input contract

```
{
  title:          string   // tiêu đề ngắn, max 120 chars
  body:           string   // nội dung đầy đủ, max 5000 chars
  tags:           TestimonialTag[]  // bắt buộc chọn ít nhất 1
  practiceRef?: {
    practiceTypes: PracticeType[]  // loại thực hành liên quan
    durationMonths?: number        // thời gian thực hành trước khi có kết quả
  }
  disclaimerAccepted: boolean      // bắt buộc = true
}

TestimonialTag: "SUC_KHOE" | "GIA_DINH" | "SU_NGHIEP" | "HOC_TAP" | "KHAC"

PracticeType: "NIỆM_KINH" | "TIEU_PHUONG_TU" | "PHONG_SINH" | "BACH_THOAI" | "DAI_SAM_HOI" | "KHAC"
```

**Disclaimer bắt buộc (hardcoded — không thể sửa qua CMS):**
> *"Nếu có điều gì không như lý như pháp trong bài chia sẻ này, con xin Quán Thế Âm Bồ Tát
> và Hộ Pháp từ bi tha thứ."*

User phải tick checkbox xác nhận đã đọc và đồng ý disclaimer này trước khi submit.

---

## Read set

- session + actor role + ban status
- `Testimonial` records `PENDING` của user (để enforce 1-pending limit)
- Content rules: không được phép claim chữa bệnh trực tiếp, không phóng đại

---

## Write path

1. Validate input — Zod:
   - `title` không trống, ≤ 120 chars.
   - `body` không trống, ≤ 5000 chars.
   - `tags.length >= 1`.
   - `disclaimerAccepted = true`. Nếu `false` → `400` với message bắt buộc tick disclaimer.
2. Kiểm tra user ban status. Nếu bị ban → `403 community_banned`.
3. Kiểm tra 1-pending limit: nếu user đã có `Testimonial` với `status = PENDING` → `409 pending_exists`.
4. **Auto-screen body** (client-side advisory — không hard-block server):
   - Flag nếu body chứa các cụm từ y tế tuyệt đối ("chữa khỏi hoàn toàn", "đảm bảo", "cam kết").
   - Nếu flag → hiển thị advisory trước khi submit: *"Vui lòng diễn đạt theo kinh nghiệm cá nhân,
     tránh ngôn ngữ cam kết kết quả y tế."*
5. Tạo `Testimonial` với `status = PENDING`:
   ```
   {
     authorId, title, body, tags, practiceRef,
     disclaimerAccepted: true, disclaimerText: <hardcoded>,
     status: "PENDING", submittedAt: now()
   }
   ```
6. Tạo `ModerationTask` trong `moderation` module (tái dùng pipeline hiện có):
   ```
   {
     targetType: "TESTIMONIAL",
     targetId:   testimonial.publicId,
     priority:   "NORMAL",
     assignedQueue: "testimonial-review"
   }
   ```
7. Gửi in-app notification cho user: *"Câu chuyện của bạn đã được gửi đi và đang chờ xét duyệt."*
8. Audit `community.testimonial.submitted`.

---

## Moderation Flow (Admin)

```
PENDING → [Admin review] → PUBLISHED | REJECTED | REVISION_REQUESTED
```

### Tiêu chí Admin phải kiểm tra:
- [ ] Không có yếu tố mê tín dị đoan sai lệch so với giáo lý chính thống.
- [ ] Không phóng đại hoặc cam kết kết quả y tế.
- [ ] Không tiết lộ thông tin cá nhân người khác không có sự đồng ý.
- [ ] Ngôn ngữ phù hợp, tôn trọng pháp môn.
- [ ] Disclaimer mẫu đã được tích.

### Admin actions:
- **PUBLISH**: `PATCH /api/admin/testimonials/:id/publish` → status = `PUBLISHED`, `publishedAt = now()`.
- **REJECT**: Bắt buộc điền `rejectionReason` → gửi notification cho user.
- **REQUEST REVISION**: Gửi note cho user, status = `REVISION_REQUESTED`, user được phép edit 1 lần rồi resubmit.

---

## Read path — Public Listing

```
GET /api/testimonials?tag=<tag>&page=<n>&limit=20

Response:
{
  items: TestimonialSummaryDto[]  // chỉ PUBLISHED records
  total, page, limit
}

TestimonialSummaryDto {
  publicId, title, tags, practiceRef,
  authorDisplayName,   // không expose email hay userId
  publishedAt,
  excerpt              // first 200 chars của body
}
```

---

## Async side-effects

- Sau khi `PUBLISHED`: invalidate testimonial list cache theo từng tag.
- **Phase 2+:** Outbox event `community.testimonial.published` → `search` index mới.

---

## Success result

- `Testimonial` ở trạng thái `PENDING` với `ModerationTask` được tạo.
- User nhận in-app notification xác nhận.
- Sau khi admin approve: bài xuất hiện ở trang công cộng theo tag.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `disclaimerAccepted = false` | `disclaimer_required` | 400 | Tick checkbox trước khi submit |
| `tags` rỗng | `invalid_body` | 400 | Chọn ít nhất 1 tag |
| User đang có `PENDING` testimonial | `pending_exists` | 409 | Chờ review xong mới submit tiếp |
| User bị community ban | `community_banned` | 403 | — |
| Chưa đăng nhập | `unauthorized` | 401 | — |
| `title` > 120 chars hoặc `body` > 5000 chars | `invalid_body` | 400 | Rút gọn nội dung |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `community.testimonial.submitted` | actorUserId | User submit |
| `community.testimonial.published` | adminUserId | Admin approve |
| `community.testimonial.rejected` | adminUserId | Admin reject với lý do |
| `community.testimonial.revision-requested` | adminUserId | Admin yêu cầu sửa |
| `community.testimonial.revised` | actorUserId | User resubmit sau revision |

---

## Rate-limit requirement

- Submit: 1 pending per account tại một thời điểm (enforced ở business logic, không phải rate limiter)
- Browse public listing: 60 requests/minute per IP

---

## Outbox event

- Event type: `community.testimonial.published`
- Subscriber: `search` (index), `notification` (author notification)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu `ModerationTask` không được tạo sau khi `Testimonial` đã saved: replay từ `Testimonial` records
  có `status = PENDING` và không có `ModerationTask` tương ứng.
- Recovery query: `SELECT t.* FROM Testimonial t LEFT JOIN ModerationTask m ON m.targetId = t.publicId WHERE t.status = 'PENDING' AND m.id IS NULL`.

---

## Notes for AI/codegen

- `Testimonial` là entity **mới**, không phải `CommunityPost`. Schema riêng, workflow riêng.
- Disclaimer text (`disclaimerText`) phải được lưu vào DB tại thời điểm submit (không chỉ `disclaimerAccepted: true`) — vì text có thể thay đổi theo thời gian, cần giữ phiên bản user đã đồng ý.
- `ModerationTask` tái dùng model từ `moderation` module — chỉ thêm `targetType = "TESTIMONIAL"` và queue `"testimonial-review"`.
- Auto-screen flag ở step 4 là **advisory client-side** — không phải hard validation server-side. Server không reject vì ngôn ngữ, chỉ admin mới quyết định.
- `authorDisplayName` trong public listing: lấy từ `UserProfile.displayName`, không phải `email` hoặc `username`. Nếu user chưa set `displayName` → hiện "Đồng tu ẩn danh".
- Không có tính năng "like" hay "share" trên testimonial — tránh gamification tâm linh. Chỉ đọc và lưu bookmark cá nhân.
