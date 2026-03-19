# Wisdom & QA Contracts

## Owner data dự kiến

- `wisdomEntries`
- `qaEntries`
- `offlineBundles`
- `audioTalkEntries`
- `videoTalkEntries`

## Permission baseline

- `guest`
  - được đọc content public đã publish
- `member`
  - được tải offline bundle cá nhân nếu feature bật
- `admin`
  - được tạo/cập nhật/publish entry nội dung đã dịch hoặc curated
  - được quản lý source mapping, media refs
- `super-admin`
  - giữ quyền vận hành sâu và audit khi cần

## Contract rules

- mỗi entry cần có:
  - source URL chính thức
  - source type
  - title gốc
  - title dịch nếu có
  - tags chuẩn hóa
  - language
- `wisdomEntries` nên hỗ trợ nhóm:
  - `Bạch thoại Phật pháp`
  - `khai thị`
  - `Phật ngôn Phật ngữ`
  - `bài pháp hội`
- QA entry nên có:
  - vấn đề chính
  - từ khóa alias
  - đoạn trả lời index được
  - link bài gốc

## Notes for AI/codegen

- Không để AI tự sinh "câu trả lời Phật pháp".
- Retrieval phải luôn trỏ về nguồn bài gốc hoặc bản dịch được duyệt.
- Search nên xem module này và `01-content` như hai owner tách biệt nhưng một bề mặt đọc thống nhất `Kho Trí Huệ`.
