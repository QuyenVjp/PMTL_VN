# Search QA Answer

## Purpose
- Cho user tra cứu nhanh một vấn đề thực tế và nhận lại bài hoặc đoạn `Huyền học vấn đáp` hoặc `Phật học vấn đáp` chính thống đã được index.

## Owner module
- `wisdom-qa`

## Actors
- `guest`
- `member`

## Trigger
- User nhập từ khóa như:
  - mơ thấy gì
  - bệnh tật
  - nhà cửa
  - niệm kinh
  - phát nguyện
  - phóng sanh

## Preconditions
- keyword có ý nghĩa và được normalize.
- index hoặc fallback read path đang khả dụng.

## Input contract
- `query`
- optional:
  - `qaType`
  - `language`
  - `limit`
  - `tags`

## Read set
- `qaEntries`
- search index của module
- alias, keyword aliases, và taxonomy chuẩn hóa
- source provenance filters nếu policy yêu cầu

## Write path
- Đây là read-only flow.
- Không có canonical write-path.

## Async side-effects
- optional metrics hoặc analytics
- optional query suggestion cache nếu sau này feature bật

## Success result
- Trả danh sách bài hoặc đoạn phù hợp từ nguồn chính thống.
- Mỗi hit nên đủ để user biết:
  - bài này thuộc loại gì
  - source code hoặc timestamp nếu có
  - đây là bản gốc, bản dịch, hay entry đã duyệt

## Errors
- `400`: query rỗng hoặc quá mơ hồ.
- `500`: lỗi search engine và fallback cũng lỗi.

## Audit
- không bắt buộc audit nặng cho query công khai
- chỉ log metrics hoặc incident nếu fallback bị dùng quá nhiều

## Idempotency / anti-spam
- read-only, không cần idempotency
- abuse control nên nằm ở request guard layer, không ở business logic file này

## Performance target
- search healthy path nên `< 300ms`
- fallback path nên `< 1200ms`

## Notes
- Không generate "lời giải" mới.
- Retrieval phải ưu tiên nguồn chính thức, official mirror, và bản dịch đã duyệt.
- `community_translation` chỉ được hiện như lớp phụ nếu record đã được policy cho phép.
