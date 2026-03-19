# Search QA Answer

## Purpose
- Cho user tra cứu nhanh một vấn đề thực tế và nhận lại bài/đoạn hỏi đáp chính thống đã được index.

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

## Read set
- `qaEntries`
- search index của module
- alias/taxonomy chuẩn hóa

## Success result
- Trả danh sách bài/đoạn phù hợp từ nguồn chính thống.

## Notes for AI/codegen
- Không generate "lời giải" mới.
- Retrieval phải ưu tiên nguồn chính thức và bản dịch đã duyệt.
