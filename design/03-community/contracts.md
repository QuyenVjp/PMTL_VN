# Community Contracts

## Owner data

- `communityPosts`
- `communityComments`
- `postComments`
- `guestbookEntries`

## Input schemas đang có

- `packages/shared/src/schemas/community.ts`
  - `communityPostSubmitSchema`
  - `communityCommentSubmitSchema`
- `packages/shared/src/schemas/comment.ts`
  - `legacyCommentSubmitSchema`
  - `commentReportSchema`
- `packages/shared/src/schemas/guestbook.ts`
  - `guestbookSubmitSchema`

## Public/BFF routes chính

- `POST /api/community/posts/submit`
- `POST /api/community/posts/:publicId/comments`
- `POST /api/community/posts/:publicId/report`
- `POST /api/comments/:publicId/report`
- `POST /api/community/comments/:publicId/report`
- `POST /api/guestbook/submit`

## Canonical write rules

- submit post/comment/guestbook phải ghi canonical record (bản ghi chuẩn gốc) vào collection owner trước
- moderation report đi vào `moderationReports`, không nhét lifecycle report vào entity community
- entity community chỉ giữ summary moderation/read model (mô hình dữ liệu đọc) nếu flow cần
- **Phase 2+**: notification hoặc moderation alert quan trọng nên đi qua `outbox_events`. **Phase 1**: dùng sync hoặc fire-and-forget có log.
- request payload, abuse metadata, webhook/proxy metadata và downstream event payload phải có schema runtime rõ

## Public response rules

- không expose:
  - `spamScore`
  - `submittedByIpHash`
  - raw moderation internals
- author có thể là user thật hoặc snapshot display name tùy flow

## Error expectations

- `400`
  - JSON không hợp lệ
  - schema (lược đồ dữ liệu) fail
- `401`
  - flow yêu cầu đăng nhập nhưng không có session
- `403`
  - actor bị block hoặc không đủ quyền
- `404`
  - post/comment target không tồn tại
- `409`
  - duplicate report hoặc state conflict
- `429`
  - request guard / anti-spam chặn
- `500`
  - lỗi proxy, API, append outbox, hoặc execution dispatch downstream work

## Notes for AI/codegen

- Community submit khác moderation report; đừng gộp chung canonical write-path.
- Report endpoint chỉ tạo record ở moderation module rồi sync summary ngược.
- Public routes phải ưu tiên `publicId`, không phụ thuộc internal document id ở client.
- Không coi notification alert là bằng chứng canonical rằng submit đã thành công; canonical record luôn ở community collections trước.
