# Publish Wisdom Entry

## Purpose
- Xuất bản một entry chính thống thuộc `Bạch thoại Phật pháp`, `Khai thị`, `Phật ngôn Phật ngữ`, hoặc `Bài pháp hội` để surface tra cứu có nguồn rõ ràng.

## Owner module
- `wisdom-qa`

## Actors
- `admin`
- `super-admin`

## Trigger
- Admin publish một `wisdomEntries` record đã được biên dịch hoặc curate xong.

## Preconditions
- Entry có `sourceUrl` rõ ràng.
- Có `sourceProvenance` rõ.
- Có title gốc và metadata tối thiểu theo policy.
- Nếu có bản dịch Việt thì `reviewStatus` phải nhất quán với mức duyệt hiện tại.

## Input contract
- `publicId`
- `sourceUrl`
- `sourceSiteLabel`
- `sourceType`
- `sourceProvenance`
- `titleOriginal`
- `bodyOriginal` hoặc excerpt đủ dùng
- optional:
  - `titleVietnamese`
  - `bodyVietnamese`
  - `translationCredit`
  - `sourceImageRef`
  - `audioRef`
  - `videoRef`
  - `speaker`
  - `publishedAt`

## Read set
- `wisdomEntries`
- media/audio/video refs nếu có
- tag mapping nội bộ nếu có
- search alias rules cho tiếng Việt và tiếng Hoa

## Write path
1. Validate source mapping và metadata.
2. Kiểm tra `sourceProvenance` có hợp với loại source đang dùng không.
3. Chuẩn hóa alias tiếng Việt, tiếng Hoa, và tags phục vụ search.
4. Ghi canonical record vào `wisdomEntries`.
5. Chuyển trạng thái publish theo implementation hiện tại.
6. Append audit `wisdom.entry.publish`.
7. Enqueue search sync cho `Kho Trí Huệ`.
8. Nếu có audio/video liên quan, sync relation metadata.

## Async side-effects
- search sync
- optional offline bundle refresh

## Success result
- Entry xuất hiện ở surface đọc hoặc nghe đúng nhóm.
- Search và offline layer có thể đọc record đã publish mà không phải tự đoán nguồn.

## Errors
- `400`: thiếu `sourceUrl`, `sourceProvenance`, hoặc metadata chuẩn hóa.
- `401`: chưa đăng nhập.
- `403`: không đủ quyền.
- `404`: media/source ref không tồn tại.
- `409`: conflict alias hoặc `publicId`.
- `500`: lỗi service hoặc downstream sync.

## Audit
- bắt buộc append `wisdom.entry.publish`
- audit nên giữ:
  - source URL
  - source provenance
  - source type
  - review status
  - publishedAt

## Idempotency / anti-spam
- publish lại cùng `publicId` nên là update flow, không tạo record mới
- không cho import cùng một source nhiều lần dưới hai record publish trùng rõ ràng nếu policy không cho

## Performance target
- canonical publish path nên hoàn tất `< 800ms`
- search sync và offline bundle refresh phải ở downstream async path

## Notes
- Không publish entry nếu chưa rõ nguồn chính thức hoặc official mirror hợp lệ.
- Search alias phải phục vụ cả tiếng Việt và tiếng Hoa gốc.
