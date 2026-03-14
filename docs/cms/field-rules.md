# Field Rules

## Posts

- `slug` sinh từ `title` nếu chưa nhập.
- `publishedAt` bắt buộc khi status là `published`.
- `excerpt` ngắn gọn để dùng cho listing và SEO.

## Comments

- `authorEmail` dùng cho moderation/notification, không public ra web.
- `status` mặc định `pending`.
- `approvedAt` chỉ set khi chuyển sang `approved`.

## Events

- `endAt` phải lớn hơn hoặc bằng `startAt`.
- `timezone` cần cố định ở app layer nếu dự án hỗ trợ nhiều locale sau này.

