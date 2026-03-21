# Outbox Event Taxonomy (Phân loại sự kiện Outbox)

Tài liệu này giải đáp: **sự kiện (event) nào đủ quan trọng để đi qua `outbox_events`**, và sự kiện (event) nào có thể đồng bộ (sync) hoặc gửi-và-quên (fire-and-forget).

Nếu không có tài liệu (document) này, lập trình viên (developer) sẽ không biết khi nào cần dùng outbox và khi nào không — dẫn đến:

- Dùng outbox dư thừa (tối ưu hóa quá mức - over-engineering trong giai đoạn 1)
- Hoặc bỏ qua outbox cho các sự kiện (event) quan trọng (mất tính tin cậy - reliability)

> **Nhắc lại từ DECISIONS.md**: `outbox_events` ở trạng thái trì hoãn (deferred), chỉ được kích hoạt khi tác dụng phụ (side effect) đủ chậm hoặc chi phí thất bại (failure cost) đủ cao.
> Tài liệu này chuẩn bị hệ thống phân loại (taxonomy) để khi kích hoạt, chúng ta không phải đoán lại.
> Cột `Mode` (Chế độ) bên dưới phải được hiểu là **chế độ mục tiêu (target mode) của giai đoạn 2 (phase 2+) trở đi**. Khi outbox chưa bật, bắt buộc áp dụng `Phase 1 fallback behavior` (Hành vi dự phòng giai đoạn 1) ở cuối tài liệu thay vì tự hiểu `"outbox required"` (yêu cầu outbox) là phải xây dựng outbox ngay lập tức.

---

## Selection criteria (Tiêu chí lựa chọn outbox)

Một sự kiện (event) **cần outbox** khi đáp ứng ít nhất 1 trong các điều kiện sau:

| Selection Criteria (Tiêu chí lựa chọn)                                                                  | Example (Ví dụ)                                                                         |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tác dụng phụ (side effect) chậm (>200ms) và không nên làm nghẽn (block) yêu cầu (request)               | Tái lập chỉ mục (reindex) Meilisearch sau khi đăng bài (publish)                        |
| Thất bại (failure) của tác dụng phụ (side effect) gây ra sai lệch trạng thái (state drift) nghiêm trọng | Thu hồi phiên làm việc (session revoke) khi người dùng (user) bị chặn (block)           |
| Lan tỏa (fan-out) tới nhiều đối tượng đăng ký (subscribers)                                             | Gửi thông báo (notification) cho nhiều người dùng                                       |
| Cần đảm bảo phân phối (delivery guarantee - ít nhất một lần / at-least-once)                            | Cảnh báo kiểm duyệt (moderation alert) gửi tới quản trị viên (admin)                    |
| Tác dụng phụ (side effect) xảy ra ở mô-đun (module) khác và không được kết nối chặt chẽ (couple)        | Thành viên gửi bài (community submit) → Đưa vào hệ thống kiểm duyệt (moderation intake) |

Sự kiện (event) **KHÔNG cần outbox** khi:

- Đây là thao tác đọc (read operation)
- Tác dụng phụ (side effect) chỉ là ghi nhật ký (logging) / đo lường (metrics) - có thể chấp nhận gửi-và-quên (fire-and-forget)
- Tác dụng phụ (side effect) xảy ra trong cùng một giao dịch (transaction) của lần ghi chuẩn (canonical write)
- Giai đoạn 1 (phase 1) và các tác dụng phụ vẫn có thể đồng bộ (sync) dễ dàng

---

## Canonical outbox events (Sự kiện outbox chuẩn)

### Identity module (Mô-đun Định danh)

| Event type (Loại sự kiện) | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)   | Mode (Chế độ mục tiêu Phase 2+)      |
| ------------------------- | ---------------------------- | ---------------------------------------------------- | ------------------------------------ |
| `identity.user.blocked`   | Quản trị viên chặn tài khoản | Sessions (Phiên làm việc) → thu hồi tất cả các phiên | **outbox required (yêu cầu outbox)** |
| `identity.user.unblocked` | Quản trị viên bỏ chặn        | (chỉ ghi log)                                        | sync acceptable (chấp nhận đồng bộ)  |
| `identity.role.changed`   | Thăng cấp/hạ cấp vai trò     | Nhật ký kiểm toán (Audit log)                        | sync acceptable (chấp nhận đồng bộ)  |

---

### Content module (Mô-đun Nội dung)

| Event type (Loại sự kiện)      | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)                                           | Mode (Chế độ mục tiêu Phase 2+)                    |
| ------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `content.post.published`       | Admin đăng bài viết          | Search (Tìm kiếm) → tái lập chỉ mục (reindex)                                                | **outbox required** (giai đoạn 2+ với Meilisearch) |
| `content.post.unpublished`     | Admin hủy đăng bài           | Search → hủy chỉ mục (deindex); Calendar → xóa bộ nhớ đệm tư vấn (invalidate advisory cache) | **outbox required (yêu cầu outbox)**               |
| `content.post.deleted`         | Xóa mềm (Soft delete)        | Search → hủy chỉ mục (deindex)                                                               | **outbox required (yêu cầu outbox)**               |
| `content.chant_item.published` | Đăng mục tụng niệm           | Search → tái lập chỉ mục (reindex)                                                           | **outbox required** (giai đoạn 2+)                 |
| `content.media.uploaded`       | Tải lên hoàn tất             | Storage (Lưu trữ) → quét tập tin (scan) (giai đoạn 2+)                                       | planned (đã lên kế hoạch)                          |

---

### Community module (Mô-đun Cộng đồng)

| Event type (Loại sự kiện)       | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)          | Mode (Chế độ mục tiêu Phase 2+)                |
| ------------------------------- | ---------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `community.post.submitted`      | Thành viên gửi bài viết      | Moderation (Kiểm duyệt) → cảnh báo tiếp nhận (intake alert) | **outbox required (yêu cầu outbox)**           |
| `community.comment.submitted`   | Thành viên gửi bình luận     | Moderation → cảnh báo tiếp nhận (nếu bị gắn cờ)             | **outbox required** if flagged (nếu bị gắn cờ) |
| `community.guestbook.submitted` | Khách gửi lời nhắn           | Moderation → hàng đợi phê duyệt (approval queue)            | **outbox required (yêu cầu outbox)**           |

---

### Moderation module (Mô-đun Kiểm duyệt)

| Event type (Loại sự kiện)       | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)                        | Mode (Chế độ mục tiêu Phase 2+)      |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| `moderation.report.resolved`    | Admin xử lý báo cáo          | Community → đồng bộ tóm tắt; Notification → báo cho tác giả/người báo cáo | **outbox required (yêu cầu outbox)** |
| `moderation.content.hidden`     | Admin ẩn nội dung            | Community → đồng bộ trạng thái ẩn (isHidden)                              | **outbox required (yêu cầu outbox)** |
| `moderation.guestbook.approved` | Admin duyệt lời nhắn         | Community → đăng bài (publish)                                            | **outbox required (yêu cầu outbox)** |

---

### Calendar module (Mô-đun Lịch)

| Event type (Loại sự kiện)     | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)                           | Mode (Chế độ mục tiêu Phase 2+)      |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| `calendar.event.published`    | Admin đăng sự kiện           | Notification → lập lịch các ứng viên nhắc nhở                                | **outbox required (yêu cầu outbox)** |
| `calendar.event.updated`      | Admin cập nhật sự kiện       | personalPracticeCalendarReadModel → xây dựng lại cho người dùng bị ảnh hưởng | **outbox required (yêu cầu outbox)** |
| `calendar.advisory.refreshed` | Cron hàng ngày hoặc thủ công | (Các bên thụ hưởng hạ nguồn đọc theo yêu cầu)                                | sync acceptable (chấp nhận đồng bộ)  |

---

### Notification module (Mô-đun Thông báo)

| Event type (Loại sự kiện)          | Trigger (Tác nhân kích hoạt)  | Downstream subscriber (Đối tượng đăng ký hạ nguồn)   | Mode (Chế độ mục tiêu Phase 2+)      |
| ---------------------------------- | ----------------------------- | ---------------------------------------------------- | ------------------------------------ |
| `notification.push_job.dispatched` | Kích hoạt từ Lịch/Phát Nguyện | Worker (Tiến trình xử lý) → gửi thông báo (delivery) | **outbox required** (khi bật worker) |

---

### Vows & Merit module (Mô-đun Phát Nguyện & Công Đức)

| Event type (Loại sự kiện)  | Trigger (Tác nhân kích hoạt)         | Downstream subscriber (Đối tượng đăng ký hạ nguồn)          | Mode (Chế độ mục tiêu Phase 2+)      |
| -------------------------- | ------------------------------------ | ----------------------------------------------------------- | ------------------------------------ |
| `vow.created`              | Thành viên tạo nguyện ước            | Calendar (Lịch) → ứng viên lịch nhắc nhở                    | **outbox required (yêu cầu outbox)** |
| `vow.milestone.fulfilled`  | Thành viên ghi nhận cột mốc          | Notification (Thông báo) → xác nhận (tùy chọn)              | **outbox required (yêu cầu outbox)** |
| `vow.completed`            | Hoàn thành tất cả các mốc            | Kiểm toán (Audit); Notification → báo hoàn thành (tùy chọn) | **outbox required (yêu cầu outbox)** |
| `vow.life_release.created` | Thành viên/admin ghi nhận phóng sinh | (Nội bộ, không lan tỏa fan-out)                             | sync acceptable (chấp nhận đồng bộ)  |

---

### Wisdom-QA module (Mô-đun Trí Huệ - Hỏi Đáp)

| Event type (Loại sự kiện) | Trigger (Tác nhân kích hoạt) | Downstream subscriber (Đối tượng đăng ký hạ nguồn)      | Mode (Chế độ mục tiêu Phase 2+)    |
| ------------------------- | ---------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `wisdom.entry.published`  | Admin đăng nội dung          | Search → tái lập chỉ mục (giai đoạn 2+)                 | **outbox required** (giai đoạn 2+) |
| `wisdom.bundle.rebuilt`   | Hoàn tất xây dựng lại delta  | (Thông báo cho các khách hàng ngoại tuyến bị ảnh hưởng) | planned (đã lên kế hoạch)          |

---

## Event schema (Lược đồ sự kiện)

Tất cả các sự kiện outbox (outbox events) phải tuân theo lược đồ (schema) sau — đây là hợp đồng thời gian chạy (runtime contract), bắt buộc phải có lược đồ Zod (Zod schema):

```typescript
// packages/shared/src/outbox-event.schema.ts
const OutboxEventSchema = z.object({
  eventId: z.string().uuid(), // duy nhất cho mỗi phiên bản sự kiện
  schemaVersion: z.literal(1).default(1), // phiên bản của hợp đồng bao bì (envelope)
  eventType: z.string(), // ví dụ: 'content.post.published'
  aggregateId: z.string(), // publicId của thực thể (entity) nguồn
  aggregateType: z.string(), // ví dụ: 'post', 'vow', 'user'
  occurredAt: z.string().datetime(), // ISO8601, thời điểm sự kiện xảy ra
  actorUserId: z.string().uuid().optional(), // ai kích hoạt (null nếu là hệ thống - system)
  correlationId: z.string().uuid().optional(), // ID tương quan yêu cầu (request correlation ID)
  payload: z.record(z.unknown()), // dữ liệu đặc thù của mô-đun (module-specific data)
});
```

**Các quy tắc (Rules):**

- `eventId` phải là duy nhất (unique) — dùng để kiểm tra tính duy nhất (idempotency check) khi thực hiện lại (replay)
- `aggregateId` phải là `publicId` (không dùng ID nội bộ của cơ sở dữ liệu)
- `payload` phải có lược đồ Zod (Zod schema) riêng cho từng loại sự kiện (`eventType`) — bao bì (envelope) này chỉ là khung chung, việc xác thực (validation) thực sự của payload phải dựa theo `eventType`
- `occurredAt` là thời điểm sự kiện nghiệp vụ (business event) xảy ra, không phải thời điểm ghi vào bảng outbox
- Thứ tự sắp xếp/thực hiện lại (ordering/replay order) được lấy từ thứ tự chèn vào bảng outbox (insertion order) + chính sách điều phối (dispatcher policy), không mã hóa bằng trường phụ trong bao bì (envelope) nếu chưa có trường hợp sử dụng thực tế

---

## Phase 1 fallback behavior (Hành vi dự phòng giai đoạn 1)

Khi outbox chưa bật (giai đoạn 1 - phase 1), các sự kiện được đánh dấu "yêu cầu outbox" (outbox required) phải được xử lý theo một trong hai cách:

| Method (Cách thức)                                                         | Description (Mô tả)                                                                                                                                                          | Suitable When (Phù hợp khi)                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Inline sync** (Đồng bộ trực tiếp)                                        | Gọi dịch vụ đăng ký (subscriber service) trực tiếp trong cùng yêu cầu (request)                                                                                              | Tác dụng phụ (side effect) nhanh và ít lan tỏa (fan-out)                                       |
| **Fire-and-forget** (Gửi-và-quên với nhật ký + khả năng giám sát thất bại) | Gọi bất đồng bộ (async) không chờ đợi (await) nhưng phải ghi nhật ký mục tiêu (log intent), kết quả (log outcome), và có lộ trình thử lại/cảnh báo/phục hồi thủ công rõ ràng | Tác dụng phụ không làm nghẽn trải nghiệm người dùng (UX) và có thể chấp nhận thất bại tạm thời |

Tuyệt đối không được **im lặng bỏ qua (silently ignore)** tác dụng phụ mà không ghi nhật ký (log).
Không được **làm giả (fake)** outbox (tạo bảng outbox rỗng chỉ để "cho có") — trì hoãn (deferred) có nghĩa là chưa kích hoạt.

### Recovery path (Lộ trình phục hồi) tối thiểu cho Phase 1 fallback

Nếu chọn gửi-và-quên (fire-and-forget) ở giai đoạn 1, việc triển khai (implementation) tối thiểu phải có:

- Ghi nhật ký mục tiêu (log intent) tại lộ trình yêu cầu (request path) với `eventType`, đối tượng (target), ID tương quan (correlation id)
- Ghi nhật ký kết quả (log outcome) thành công/thất bại của tác dụng phụ (side effect) thực tế
- Có cơ chế thử lại (retry) nội bộ hữu hạn **hoặc** cảnh báo/hướng dẫn vận hành thủ công (manual-runbook) rõ ràng nếu việc thử lại không phù hợp
- Nếu tác dụng phụ thất bại vĩnh viễn, phải có nơi để người vận hành (operator) nhìn thấy và chạy lại (re-run) thủ công; việc ghi nhật ký mục tiêu không được coi là bằng chứng đã phân phối thành công (delivery proof)

Chủ quản cho ngữ nghĩa này là tài liệu hiện tại; các hợp đồng đặc thù của mô-đun (module-specific contract) chỉ được phép thắt chặt thêm, không được nới lỏng.

---

## Idempotency requirement (Yêu cầu về tính duy nhất)

Mọi đối tượng đăng ký (subscriber) xử lý sự kiện outbox (outbox event) **bắt buộc** phải triển khai tính duy nhất (idempotency):

- Kiểm tra `eventId` đã được xử lý chưa trước khi áp dụng
- Nếu đã xử lý → trả về thành công (success), không áp dụng lại
- Lưu danh sách `processedEventIds` hoặc sử dụng lệnh `ON CONFLICT DO NOTHING` khi chèn kết quả

---

## Notes for AI/codegen (Lưu ý cho AI/Tạo mã)

- Không tự ý thêm sự kiện (event) vào outbox nếu không có trong hệ thống phân loại (taxonomy) này
- Không được bỏ qua outbox cho các sự kiện được đánh dấu "yêu cầu outbox" (outbox required)
- Lược đồ nội dung (payload schema) phải có tệp Zod riêng, không lồng trực tiếp (inline) vào dịch vụ (service)
- Đối tượng đăng ký (subscriber) phải triển khai tính duy nhất (idempotency) — không được giả định "chỉ gọi một lần"
- Khi thêm sự kiện (event) mới, phải cập nhật tài liệu này và tệp `tracking/module-interactions.md`
