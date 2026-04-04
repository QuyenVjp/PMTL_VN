# Tự Động Gắn Lời Bảo Vệ Nghiệp Quả Vào Bài Chia Sẻ — Testimonial Karmic Disclaimer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi đồng tu đăng bài chia sẻ **linh nghiệm / khỏi bệnh / chứng nghiệm** trong cộng đồng, nếu họ nói dối hoặc phóng đại, **Sư Phụ (Master Lu) sẽ bị gánh nghiệp thay**. Để bảo vệ Sư Phụ và khuyến khích sự trung thực, hệ thống tự động **append** một đoạn văn bảo vệ vào cuối mọi bài `TESTIMONIAL` trước khi lưu vào DB.

---

## Owner module

`community` — PostsService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đăng bài chia sẻ linh nghiệm
- `system` — intercept, append disclaimer, lưu canonical record

---

## Trigger

`POST /api/community/posts` với `postType = "TESTIMONIAL"` hoặc `tags` chứa `["linh-nghiem", "chia-se", "khoi-benh", "chung-nghiem"]`.

---

## Business Rule

### Disclaimer Text (Bất Biến)

```
---
Nếu có điều gì không như lý như pháp trong bài chia sẻ này, con xin Quán Thế Âm Bồ Tát tha thứ.
Con sẽ tự gánh vác nghiệp chướng của mình, không để Sư Phụ phải gánh vác thay.
```

**Quy tắc cứng:**
- Disclaimer phải là **phần nội dung cuối cùng** của bài, sau tất cả text user nhập.
- **Không thể bị user xóa, sửa, hay ẩn** — được lưu vào `content` field trực tiếp.
- Ngay cả khi user edit bài sau đó, disclaimer phải được tái-append nếu bị xóa.
- Admin cũng không được tắt feature này — chỉ có thể cập nhật wording qua CMS config.

### Testimonial Detection

Post được coi là TESTIMONIAL nếu thỏa MỘT trong các điều kiện:
1. `postType === "TESTIMONIAL"` (explicit)
2. `category === "CHIA_SE_LINH_NGHIEM"`
3. `tags` chứa bất kỳ: `linh-nghiem`, `khoi-benh`, `chua-lanh`, `chung-nghiem`, `cam-nhan`

---

## Write Path

```
POST /api/community/posts (PostsService.create)
─────────────────────────────────────────────────
1. Parse và validate communityPostSubmitSchema.
2. Kiểm tra isTestimonial(body):
   - postType === "TESTIMONIAL" OR
   - category in TESTIMONIAL_CATEGORIES OR
   - tags ∩ TESTIMONIAL_TAGS không rỗng
3. Nếu isTestimonial:
   a. Lấy disclaimerText từ SystemConfig:
      key = "community.testimonial_karmic_disclaimer"
      fallback = DEFAULT_KARMIC_DISCLAIMER_VI
   b. Append vào content:
      body.content = body.content.trimEnd() + "\n\n---\n" + disclaimerText
   c. Set metadata flag: { karmic_disclaimer_appended: true, disclaimer_version: configVersion }
4. Tiếp tục write path chuẩn (tạo record, audit, moderation signal).
5. Audit: community.post.karmic-disclaimer.appended.
```

### Edit Path (Tái-enforce)

```
PUT /api/community/posts/:id (PostsService.update)
──────────────────────────────────────────────────
1. Nếu post.metadata.karmic_disclaimer_appended === true:
   a. Kiểm tra content mới có chứa disclaimerText không.
   b. Nếu bị xóa → tái-append lại trước khi lưu.
   c. Audit: community.post.karmic-disclaimer.re-appended.
```

---

## SystemConfig Entry

```
Key:     community.testimonial_karmic_disclaimer
Type:    MARKDOWN_TEXT
Default: "Nếu có điều gì không như lý như pháp trong bài chia sẻ này, con xin Quán Thế Âm Bồ Tát tha thứ.\nCon sẽ tự gánh vác nghiệp chướng của mình, không để Sư Phụ phải gánh vác thay."
Editable by: super-admin only
Version tracking: required (disclaimer_version in metadata)
```

Admin CMS cho phép cập nhật wording — nhưng:
- Thay đổi chỉ áp dụng cho bài mới, không retroactive.
- Mỗi bài lưu `disclaimer_version` để biết wording nào đã được dùng.

---

## Schema Notes

```prisma
model Post {
  // ... existing fields ...
  postType     PostType    @default(GENERAL)
  metadata     Json?       // { karmic_disclaimer_appended: bool, disclaimer_version: string }
}

enum PostType {
  GENERAL
  TESTIMONIAL
  QUESTION
  ANNOUNCEMENT
  EVENT_SHARE
}
```

---

## FE Behavior

- Khi user chọn `postType = TESTIMONIAL` hoặc nhập tag linh nghiệm: hiện **info banner** trước submit:
  ```
  ℹ️ Bài chia sẻ linh nghiệm sẽ được tự động gắn thêm lời bảo vệ nghiệp quả ở cuối.
     Đây là quy tắc bảo vệ Sư Phụ và bản thân bạn theo lời khai thị Pháp Môn.
  ```
- Sau khi đăng, disclaimer hiển thị dưới dạng blockquote/separator có styling riêng (không lẫn vào nội dung user).
- User thấy disclaimer trong preview trước khi submit — không bị bất ngờ.

---

## Audit

| Action | Trigger |
|---|---|
| `community.post.karmic-disclaimer.appended` | Disclaimer được gắn vào bài mới |
| `community.post.karmic-disclaimer.re-appended` | Disclaimer bị xóa và đã tái-gắn khi edit |
| `community.post.karmic-disclaimer.config-updated` | Super-admin cập nhật wording |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| SystemConfig key missing (fallback failed) | `config_unavailable` | 500 |
| Content quá dài sau khi append (> max_length) | `content_too_long` | 400 |

---

## Notes for AI/codegen

- Append logic nên là `TestimonialDisclaimerInterceptor` (NestJS Interceptor) applied chỉ trên `PostsController.create` và `PostsController.update` — không phải global.
- `TESTIMONIAL_TAGS` và `TESTIMONIAL_CATEGORIES` nên là constants trong `community.constants.ts`, không hardcode trong interceptor.
- Disclaimer là protected text — nếu dùng rich text editor (Tiptap/Quill), disclaimer được inject như một non-editable `locked-block` node.
- Không dùng DB trigger hoặc Prisma middleware cho feature này — phải ở service layer để có traceability.

---

## Related

- [submit-community-post.md](./submit-community-post.md) — Core post submission flow
- [report-community-target.md](./report-community-target.md) — Nếu user report bài có disclaimer bị xóa
