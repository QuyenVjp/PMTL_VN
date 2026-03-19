# SLA_SLO

Tài liệu này chốt mục tiêu vận hành tối thiểu cho PMTL_VN.
Vì đây là dự án cộng đồng phi lợi nhuận, mục tiêu không cần kiểu ngân hàng hay big tech.
Nhưng vẫn cần đủ rõ để:

- ưu tiên phần nào trước
- biết luồng nào chấp nhận eventual consistency
- để AI không thiết kế side-effect nặng trên request path

## Nguyên tắc chung

- Public read quan trọng hơn dashboard nội bộ hiếm dùng.
- Search, notification, revalidation là async (bất đồng bộ)-first.
- Nếu một mục tiêu chưa đo thật được, cứ coi đây là target thiết kế trước, rồi refine sau.

## Mục tiêu theo luồng

### Public content read
- Trang bài viết hoặc guide đã publish nên phản hồi trong `< 500ms` ở điều kiện dev/prod bình thường, chưa tính mạng người dùng cuối quá xa.
- TTFB public route không nên bị block bởi search sync hoặc notification.

### Search
- `GET /api/posts/search` nên trả kết quả trong `< 250ms` khi Meilisearch healthy.
- fallback (đường dự phòng) Payload search có thể chậm hơn, nhưng mục tiêu là `< 1200ms`.
- Sau khi publish content, index search nên được cập nhật trong `< 10 giây`.

### Community submit
- Submit comment / community post / guestbook nên phản hồi trong `< 800ms` cho nhánh canonical write + append outbox event.
- Moderation alert cho report mới nên được append vào `outbox_events` trong `< 2 giây`, còn dispatch downstream được phép trễ theo execution queue.

### Moderation
- Từ lúc report được tạo đến lúc admin thấy report trong queue (hàng đợi xử lý) nên là `< 10 giây`.
- Quyết định moderation không được chờ push/email gửi xong mới trả response.

### Notification
- Tạo `pushJobs` nên xong trong `< 500ms`.
- worker (tiến trình xử lý nền) dispatch có thể eventual consistency, mục tiêu bắt đầu xử lý trong `< 30 giây` khi queue (hàng đợi xử lý) khỏe.

### Auth
- Login/register/profile update nên trả kết quả trong `< 800ms` khi CMS healthy.
- Reset password email có thể async (bất đồng bộ), nhưng request nhận thành công trong `< 1000ms`.

### Engagement
- Upsert practice log, bookmark, reading progress nên trong `< 500ms`.
- Self-state không được đợi shared cache invalidation hay search sync.

### Calendar
- Query event công khai nên trong `< 500ms`.
- Lunar override resolution nên nằm trong read model (mô hình dữ liệu đọc) hoặc helper rõ ràng, không gây nổ latency quá `< 200ms` bổ sung.

## Error budget thực dụng

- Eventual consistency của search và notification là chấp nhận được nếu:
  - canonical write thành công
  - có khả năng retry
  - có status/health để quan sát
- Không chấp nhận eventual consistency với:
  - auth authority
  - canonical publish state
  - moderation report source record
  - self-owned practice log sau khi request trả thành công

## Khi nào cần nâng chuẩn

- khi community volume tăng mạnh
- khi bắt đầu có moderation pressure thật
- khi push/email trở thành luồng quan trọng cho nhắc tu tập
- khi cần cam kết rõ với cộng đồng về độ mới của search hoặc event schedule

## Notes for AI/codegen

- Không nhét gửi email, push dispatch, reindex đồng bộ vào request path chỉ để "chắc ăn".
- Nếu một flow có target latency thấp, hãy ưu tiên:
  - ghi canonical trước
  - append `outbox_events` cho side effect quan trọng
  - để dispatcher/execution queue xử lý phần downstream
  - trả response sớm

