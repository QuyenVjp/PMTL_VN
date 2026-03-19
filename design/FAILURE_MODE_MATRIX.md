# FAILURE_MODE_MATRIX

Tài liệu này chốt cách hệ thống PMTL_VN phản ứng khi các dependency (phụ thuộc hạ tầng) gặp lỗi.
Mục tiêu:

- giúp design trả lời được câu hỏi "hỏng cái này thì module nào còn sống?"
- chốt rõ module nào:
  - `continue` (tiếp tục chạy)
  - `degrade` (chạy suy giảm)
  - `fail closed` (dừng an toàn)
  - `recover async (bất đồng bộ)` (phục hồi bất đồng bộ)
- giúp AI/codegen không tự bịa failure behavior

## Quy ước đọc nhanh

- `continue`: vẫn chạy bình thường hoặc gần bình thường
- `degrade`: vẫn phục vụ được một phần, nhưng giảm trải nghiệm/chức năng
- `fail closed`: dừng để giữ đúng dữ liệu hoặc bảo mật
- `recovery path`: đường phục hồi chính

## Failure modes cần xét

- `Postgres down` (PostgreSQL ngừng hoạt động)
- `Meilisearch down` (Search engine ngừng hoạt động)
- `Redis/worker (tiến trình xử lý nền) down` (Redis hoặc worker (tiến trình xử lý nền) queue (hàng đợi xử lý) ngừng hoạt động)
- `media storage down` (volume/CDN/media path lỗi)
- `object storage/scan fail` (object storage hoặc bước scan/quarantine lỗi)

## Matrix theo module

| Module | Postgres down | Meilisearch down | Redis/worker (tiến trình xử lý nền) down | media storage down | object storage / scan fail |
|---|---|---|---|---|---|
| Identity | `fail closed` | `continue` | `degrade` nếu email reset chậm | `degrade` avatar/media | `continue` nếu không có upload mới |
| Content | `fail closed` cho canonical read/write | `continue` với public read, `degrade` search | `degrade` vì reindex/revalidation/notification trễ | `degrade` hoặc `fail partial` với bài có media | `fail closed` cho publish file mới; public file cũ còn thì continue |
| Community | `fail closed` cho submit/read canonical | `continue` | `degrade` vì alert/report notify trễ | `continue` nếu text-only, `degrade` nếu có cover/media | `fail closed` cho upload mới |
| Engagement | `fail closed` | `continue` | `continue` hoặc `degrade nhẹ` | `continue` trừ khi sheet phụ thuộc ảnh/file | `continue` nếu không upload |
| Moderation | `fail closed` | `continue` | `degrade` vì notify/report fan-out trễ | `continue` | `continue` |
| Search | `fail closed` cho fallback (đường dự phòng) canonical nếu Postgres cũng chết | `degrade` sang payload-fallback (đường dự phòng) | `degrade` vì sync lag tăng | `continue` | `continue` |
| Calendar | `fail closed` cho canonical read model (mô hình dữ liệu đọc) source | `continue` | `degrade` nếu reminder rebuild trễ | `degrade` khi event cần media | `continue` nếu không upload |
| Notification | `degrade` nặng hoặc `fail closed` cho target resolution | `continue` | `fail closed` cho dispatch, `recover async (bất đồng bộ)` khi worker (tiến trình xử lý nền) quay lại | `continue` trừ message có media | `continue` cho job cũ, `fail closed` với asset mới chưa scan |
| Vows & Merit | `fail closed` | `continue` | `degrade` nếu reminder trễ | `continue` | `continue` |
| Wisdom & QA | `fail closed` cho canonical read nếu Postgres chết | `degrade` nếu search/retrieval index hỏng | `degrade` vì offline prep/reminder trễ | `degrade` mạnh với audio/video | `fail closed` cho bundle mới, `continue` cho bundle cũ đã publish |

## Chi tiết theo dependency

### 1. `Postgres down`

#### Nguyên tắc
- Postgres là `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)` nên current scope không hứa hẹn `read-only mode` giả từ Redis/Meilisearch
- các flow cần correctness phải `fail closed`

#### Ảnh hưởng
- auth/session canonical check hỏng
- content/community/self-state canonical reads hỏng
- search fallback (đường dự phòng) qua Payload cũng không cứu được nếu DB chết

#### Rule thiết kế
- không dùng Redis hoặc Meilisearch để giả làm canonical read thay Postgres
- public shell/UI có thể hiện maintenance mode (chế độ bảo trì), nhưng không được bịa dữ liệu hiện thời

#### Recovery path
- restart service (lớp xử lý nghiệp vụ)
- failover/restore backup
- khi Postgres hồi phục, downstream sync có thể reindex/rebuild lại

### 2. `Meilisearch down`

#### Nguyên tắc
- search là projection (bản chiếu), không phải canonical data
- vì vậy cho phép `degrade`

#### Hành vi mong muốn
- `GET /api/posts/search` fallback (đường dự phòng) sang Payload query
- kết quả có thể:
  - chậm hơn
  - ranking yếu hơn
  - typo tolerance kém hơn
- content/public read thông thường không được chết theo search

#### Recovery path
- restart Meilisearch
- replay search sync jobs
- nếu cần, chạy batch reindex

### 3. `Redis/worker (tiến trình xử lý nền) down`

#### Nguyên tắc
- canonical write không được phụ thuộc hoàn toàn vào queue (hàng đợi xử lý)
- async (bất đồng bộ) side effects được phép trễ, nhưng không được mất âm thầm

#### Hành vi mong muốn
- content/community/engagement write vẫn ưu tiên commit canonical record (bản ghi chuẩn gốc) trước
- business event quan trọng được giữ trong `outbox_events`
- search sync, push dispatch, email, reminder build sẽ:
  - pending trong outbox hoặc execution queue
  - retry khi dispatcher/worker (tiến trình xử lý nền) quay lại
  - replay được theo outbox nếu execution queue mất state

#### Rule thiết kế
- các job quan trọng phải idempotent
- status/health phải phản ánh queue (hàng đợi xử lý) lag và worker (tiến trình xử lý nền) health
- status/health phải phản ánh cả outbox lag và số event retry/fail

#### Recovery path
- restart Redis/worker (tiến trình xử lý nền)
- replay pending jobs nếu có
- reindex/manual dispatch nếu cần

### 4. `media storage down`

#### Nguyên tắc
- media là `supporting asset` (tài nguyên phụ trợ), không phải mọi lúc cũng là canonical text
- system nên `degrade` chứ không đổ sập toàn bộ nếu bài text vẫn còn

#### Hành vi mong muốn
- bài text vẫn mở được nếu media path lỗi
- audio/video/image có thể:
  - hiện placeholder
  - hiện lỗi rõ ràng
  - cho retry
- event/content/community không được nổ 500 toàn trang chỉ vì một asset mất

#### Recovery path
- phục hồi volume/CDN
- làm mới signed URL/link mapping nếu có
- rerender cache nếu cần

### 5. `object storage / scan fail`

#### Nguyên tắc
- upload mới phải `fail closed`
- file chưa scan xong không được public

#### Hành vi mong muốn
- publish PDF/audio/video mới bị chặn nếu:
  - upload fail
  - scan fail
  - quarantine chưa clear
- file cũ đã publish trước đó vẫn phục vụ bình thường nếu source còn sống

#### Recovery path
- retry upload
- rerun scan
- admin review/quarantine resolution

## Rule đặc biệt cho từng loại feature

### Search-heavy features
- `Kho Trí Huệ` phải có degraded mode rõ:
  - search engine tốt: dùng Meilisearch
  - search engine hỏng: dùng payload-fallback (đường dự phòng)
  - Postgres hỏng: fail closed

### Practice features
- `Ngôi Nhà Nhỏ`, `Practice Sheets`, `Phát nguyện`, `Phóng sanh` không được ghi giả khi canonical DB chết
- nếu cần offline-first ở client, dữ liệu đó chỉ là local pending state, không phải canonical commit

### File-centric features
- `Bạch thoại` text có thể sống nếu audio/video chết
- `downloads` và `offlineBundles` phải tách rõ:
  - metadata canonical
  - binary asset delivery

## Questions Senior hay hỏi và câu trả lời thiết kế

### "Postgres chết thì có read-only mode không?"
- Không trong current scope.
- Lý do: Redis và Meilisearch không phải source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).

### "worker (tiến trình xử lý nền) chết thì dữ liệu có lệch không?"
- Có thể trễ projection/job, nhưng canonical write không được mất.
- Recovery path là retry + replay outbox + reindex/manual replay.

### "Media chết có sập cả app không?"
- Không nên.
- Text-first surfaces phải degrade, không được đổ toàn trang.

### "Scan fail thì sao?"
- File mới không được public.
- Đây là `fail closed`, không thỏa hiệp.

## Notes for AI/codegen

- Khi viết use-case (kịch bản sử dụng) mới, phải ghi rõ failure behavior theo matrix này.
- Nếu một flow phụ thuộc asset/file/search/queue (hàng đợi xử lý), đừng chỉ mô tả happy path.
- Không được âm thầm đổi `fail closed` thành `best effort` nếu docs chưa chốt vậy.

