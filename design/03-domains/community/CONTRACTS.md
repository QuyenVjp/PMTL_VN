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

- `GET /api/community/posts`
- `GET /api/community/posts/:publicId`
- `POST /api/community/posts`
- `POST /api/community/posts/:publicId/heart`
- `DELETE /api/community/posts/:publicId/heart`
- `GET /api/community/posts/:publicId/comments`
- `POST /api/community/posts/:publicId/comments`
- `POST /api/community/posts/:publicId/report`
- `POST /api/community/comments/:publicId/heart`
- `DELETE /api/community/comments/:publicId/heart`
- `POST /api/community/comments/:publicId/report`
- `GET /api/guestbook`
- `POST /api/guestbook`
- `POST /api/guestbook/:publicId/report`

## Canonical write rules

- submit post/comment/guestbook phải ghi canonical record vào collection owner trước
- heart toggle phải là idempotent per actor + target; counter summary chỉ là read model
- moderation report đi vào `moderationReports`, không nhét lifecycle report vào entity community
- entity community chỉ giữ summary moderation/read model nếu flow cần
- guestbook approval vẫn là owner summary trên `guestbookEntries`, nhưng report source-of-truth vẫn nằm ở moderation module
- `Phase 2+`: notification hoặc moderation alert quan trọng nên đi qua `outbox_events`
- `Phase 1`: cho phép sync hoặc best-effort dispatch nếu heavy async lane chưa active, nhưng phải có log intent + log outcome + retry/manual-recovery path rõ
- request payload, abuse metadata, webhook/proxy metadata và downstream event payload phải có schema runtime rõ

## Visibility rules

- `communityPosts`
  - member submit mặc định `pending`
  - admin/editor submit có thể `published` ngay theo policy
- `communityComments` và `postComments`
  - fast-path visible sau guard/anti-spam nếu actor/payload không rủi ro
  - có thể bị ép `pending` theo risk policy
- `guestbookEntries`
  - luôn `pending approval` trước khi public
- target bị report dồn dập có thể `auto-hidden` tạm thời trước khi moderator resolve

## Public response rules

- không expose:
  - `spamScore`
  - `submittedByIpHash`
  - raw moderation internals
  - raw abuse heuristics
  - system-generated practice progress metrics
- author có thể là user thật hoặc snapshot display name tùy flow
- public DTO community đủ điều kiện có thể trả:
  - `heartCount`
  - `commentCount`
  - `viewerHasHearted?`
  - `shareUrl`
  - `visibilityStatus`

## Error expectations

- `400`
  - JSON không hợp lệ
  - schema fail
- `401`
  - flow yêu cầu đăng nhập nhưng không có session
- `403`
  - actor bị block hoặc không đủ quyền
- `404`
  - post/comment/guestbook target không tồn tại
- `409`
  - duplicate report, duplicate heart edge, hoặc state conflict
- `429`
  - request guard / anti-spam chặn
- `500`
  - lỗi proxy, API, append outbox, hoặc execution dispatch downstream work

## Privacy / safety rules

- community tuyệt đối không public:
  - số biến
  - số buổi
  - streak
  - tiến độ nguyện
- self-authored narrative kiểu "con trì chú 3 tháng thấy an hơn" được phép như text người dùng tự viết
- community share URLs phải trỏ tới public-safe surfaces, không lộ admin path hoặc private member state

## Notes for AI/codegen

- Community submit khác moderation report; đừng gộp chung canonical write-path.
- Report endpoint chỉ tạo record ở moderation module rồi sync summary ngược.
- Heart là appreciation signal nhẹ, không phải reputation engine.
- Public routes phải ưu tiên `publicId`, không phụ thuộc internal document id ở client.
- Không coi notification alert là bằng chứng canonical rằng submit đã thành công; canonical record luôn ở community collections trước.
