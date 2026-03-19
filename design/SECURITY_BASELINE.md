# SECURITY_BASELINE

Tài liệu này chốt baseline bảo mật ở mức design cho PMTL_VN.
Mục tiêu:

- không đợi đến lúc code mới nghĩ về bảo mật
- giúp AI/codegen biết giới hạn tối thiểu phải giữ
- đặc biệt rõ với auth, upload file, media, và public surfaces

## Nguyên tắc gốc

- bảo mật ở repo này theo hướng `simple but explicit`
- không over-engineer, nhưng không để khoảng trống mơ hồ
- mọi public input phải validate
- mọi file upload/media phải đi qua pipeline kiểm tra rõ ràng

## Auth & access baseline

- Payload auth là auth authority duy nhất
- role gate phải rõ:
  - `super-admin`
  - `admin`
  - `member`
- `admin` không được tự nâng quyền thành `super-admin`
- `member` không được gọi editorial/moderation/admin routes
- session authority không nằm ở frontend local state

## Public input baseline

- mọi input public phải qua schema (lược đồ dữ liệu) validation
- comment, guestbook, search, report cần:
  - rate limit / request guard
  - anti-spam
  - structured logging
- không tin dữ liệu từ client là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)
- env/runtime config cũng phải qua env contract validation từ lúc boot
- queue payload, outbox payload, webhook payload không được tin chỉ vì "nội bộ hệ thống gọi nhau"

## Media / file baseline

### Allowed model
- file PDF, audio, image, video phải đi qua `content/media` owner flow
- metadata file phải tách khỏi file binary
- file public không được coi là trusted chỉ vì user upload thành công

### Security requirements
- file upload phải kiểm tra:
  - mime type
  - extension allowlist
  - size limit
  - scan malware/virus nếu pipeline upload cho phép file từ người hoặc nguồn chưa trusted
- không render hoặc execute file trực tiếp như code
- không cho upload tùy ý loại file chạy được

### Storage rule
- current phase được phép dùng local disk trên VPS nếu:
  - có storage abstraction rõ
  - metadata file nằm trong Postgres
  - business logic không phụ thuộc trực tiếp local filesystem path
- target phase nên chuyển sang object storage rõ ràng:
  - `S3`
  - `MinIO`
  - hoặc dịch vụ object storage tương đương
- object key phải an toàn, không dùng trực tiếp raw filename từ user upload
- local storage cũng phải tách thư mục rõ như:
  - `uploads/avatars/`
  - `uploads/posts/`
  - `uploads/attachments/`
- lý do:
  - dễ scan/quarantine
  - dễ backup
  - tách app runtime khỏi binary assets
  - tránh mất file khi rebuild container hoặc đổi chiến lược deploy

## Search & data exposure baseline

- search index không chứa field nhạy cảm không cần public
- DTO public không expose raw internal fields
- moderation internals không đi ra route public
- fallback (đường dự phòng) read không được phá visibility policy
- semantic retrieval hoặc recommendation không được bypass visibility hoặc publish policy chỉ vì query theo vector

## Failure-mode security rule

- khi service (lớp xử lý nghiệp vụ) phụ như Meilisearch hoặc Redis lỗi:
  - không được trả lộ dữ liệu nhạy cảm
  - không được bỏ qua access control
  - có thể degrade feature, nhưng không được degrade security
- khi outbox hoặc dispatcher lỗi:
  - canonical write có thể commit
  - nhưng event chưa được coi là delivered
  - recovery phải đi theo replay/retry chuẩn, không được bỏ qua audit trail

## PDF / official resources rule

- tài liệu chính thống nên ưu tiên:
  - nguồn official
  - checksum hoặc source mapping nếu có
  - metadata version rõ
- PDF tải từ nguồn ngoài hoặc được upload lại nên có:
  - scan step
  - quarantine/fail state nếu scan lỗi
  - không publish public ngay khi chưa qua pipeline

## Notes for AI/codegen

- Đừng giả định media upload là chuyện phụ.
- Đừng coi CDN hay object storage là chỉ chuyện infra; nó ảnh hưởng trực tiếp tới security boundary (ranh giới trách nhiệm).
- Nếu feature có upload file, phải ghi rõ:
  - ai được upload
  - upload vào đâu
  - scan ở bước nào
  - publish public ở bước nào
- Nếu feature có webhook hoặc worker payload, phải ghi rõ:
  - schema runtime nào validate
  - ai phát sự kiện
  - ai tiêu thụ
  - idempotency key là gì

