# Search Module (Mô-đun Tìm kiếm)

> Ghi chú cho sinh viên:
> Search không giữ dữ liệu gốc. Nó giữ search projection (bản chiếu tìm kiếm) để người dùng tìm nhanh hơn, còn dữ liệu đúng vẫn nằm ở `Postgres`.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Search Module (Mô-đun Tìm kiếm)

## Objectives (Mục tiêu)
- mô tả boundary (ranh giới trách nhiệm) của search
- chốt query path (đường truy vấn) công khai và đường fallback
- giữ rõ ràng ranh giới giữa canonical content (nội dung chuẩn gốc) và search projection

## Current scope (Phạm vi hiện tại)

### Search sources (Nguồn tìm kiếm)
- field có thể search nằm trên owner document (tài liệu do mô-đun gốc sở hữu)
- phase hiện tại ưu tiên `posts`

### Search runtime (Môi trường chạy)
- phase 1: `SQL/API fallback` là read path mặc định
- phase search projection: `outbox_events` + dispatcher + queue + worker + `Meilisearch`
- `pgvector` chỉ là optional capability (khả năng tùy chọn) cho giai đoạn sau

### Public contracts (Hợp đồng công khai)
- `GET /api/posts/search`
- `POST /api/posts/search/reindex` cho admin/rebuild
- `GET /api/search/status`

## Current responsibilities (Trách nhiệm hiện tại)

### Search document construction (Dựng search document)
- lấy `title`, `excerptComputed`, `contentPlainText`, `normalizedSearchText`
- gom taxonomy summary (tóm tắt phân loại) và các public signals cần thiết

### Index lifecycle management (Quản lý vòng đời chỉ mục)
- khi phase projection đã bật, signal quan trọng đi qua `outbox_events`
- hỗ trợ reindex batch và reindex theo từng item
- gỡ document khỏi chỉ mục khi nội dung không còn public

### Query management (Quản lý truy vấn)
- ưu tiên `SQL/API fallback` trong phase đầu
- khi engine riêng đã bật và đủ xứng đáng, ưu tiên `Meilisearch`
- luôn giữ metadata đủ để biết request đang dùng engine nào

## Boundaries & external references (Ranh giới và tham chiếu ngoài)

### Relationships (Quan hệ)
- **Search owns (Search sở hữu)**:
  - query contract
  - indexing pipeline
  - search status reporting
- **Search does NOT own (Search không sở hữu)**:
  - canonical content data
  - taxonomy authority
  - moderation authority
  - publish workflow gốc

## Current rules (Quy tắc hiện tại)
- `Meilisearch` chỉ là index (chỉ mục), không phải primary data store (kho dữ liệu gốc)
- chỉ nội dung `published` mới được phép xuất hiện trong public search
- event tìm kiếm quan trọng không được fire-and-forget nếu phase reliability đã bật
- fallback chỉ là đường dự phòng cho availability (khả năng sẵn sàng phục vụ), không phải nguồn dữ liệu mới của hệ thống
