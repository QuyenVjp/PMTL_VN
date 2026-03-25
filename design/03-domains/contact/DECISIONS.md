# Contact Decisions

## Ownership

- `11-contact` sở hữu toàn bộ contact data và PSV data.
- Không phụ thuộc module khác ngoại trừ `Identity` cho admin actor refs.

## Why a separate module?

- Contact + PSV là surface riêng biệt, không thuộc Community (community là UGC), không thuộc Identity (identity là auth/profile).
- Tách module giữ boundary rõ, dễ disable/enable độc lập.

## Phase 1 scope

- CRUD volunteers — sync, không cần outbox/queue.
- Singleton contactInfo — upsert pattern.
- Liên hệ qua Zalo link trực tiếp — không có form liên hệ.
- Không có async side effects Phase 1.

## What Contact does NOT own

- Guestbook entries (thuộc Community)
- User profiles (thuộc Identity)
- Blog/post content (thuộc Content)
- Form liên hệ (dùng Zalo trực tiếp)

## Zalo link policy

- Chỉ chấp nhận URLs matching `^https?://(zalo\.me|chat\.zalo\.me)/`.
- Validate regex phía server, hiển thị dưới dạng nút CTA phía client.
- Không lưu trữ credentials hoặc tokens Zalo.
