# LIFE-RELEASE-RITUAL-CHECKLIST

## Owner
- `content` (ritual guidance, caution copy)
- tiêu thụ ở `vows-merit` life-release journal flow

## Purpose
- Checklist thiết kế cho flow `phóng sanh` theo tinh thần source-backed.
- Tách rõ: app hỗ trợ chuẩn bị và ghi nhận, không thay vai trò hướng dẫn trực tiếp tại hiện trường.

## Product Positioning
- `Phóng sanh` là lane công đức thực hành trực tiếp trong 5 pháp bảo.
- App mô hình hóa theo 3 lớp:
  - `chuẩn bị`
  - `nghi thức tại hiện trường`
  - `hậu kiểm và journal`
- Nội dung hiển thị theo nguyên tắc 3 bố thí (tài, pháp, vô úy) ở mức giải thích, không biến thành điểm thi đua.

## Suggested Ritual Checklist
1. Trước khi đi:
   - chuẩn bị tâm và mục đích rõ ràng
   - có thể niệm trên đường theo nguồn tham chiếu
2. Đến nơi:
   - mở bằng lời cung thỉnh và bài niệm ngắn theo lane đã duyệt
3. Trong lúc thả:
   - thao tác nhẹ nhàng, giảm tối đa tổn thương sinh vật
   - ghi rõ đối tượng và quy mô trong journal nếu user muốn
4. Nếu có phát sinh con vật chết:
   - hiển thị emergency card “siêu độ ngay theo hướng dẫn tham chiếu”
5. Kết thúc:
   - lưu entry với context nguồn/variant đã dùng

## Core Runtime Rules (Advisory)
- Với buổi phóng sanh cho nhiều người:
  - tách `intent + dedication` theo từng người nhận
  - không gộp mơ hồ một entry cho nhiều đối tượng.
- Về thời điểm:
  - ưu tiên ban ngày và điều kiện thuận lợi
  - ban đêm/thời tiết xấu chỉ hiện cảnh báo mềm + đề xuất dời lịch.
- Về tài chính:
  - có field tùy chọn ghi `nguon_tai_chinh` (self / ho_tro_nguoi_khac) cho mục đích minh bạch cá nhân, không chấm đúng sai.
- Nếu có sinh vật chết trong quá trình thả:
  - bật `incident lane` với checklist siêu độ ngắn
  - bắt buộc lưu note sự cố trước khi đóng phiên.

## Combined Practice Notes
- App cần có card “kết hợp lane”:
  - `phong sanh + niem kinh` (đặc biệt Đại Bi support lane)
  - `phong sanh + vow plan` khi user đang ở nghịch cảnh kéo dài
- Đây là advisory orchestration, không tự ép user tạo vow lớn.

## Edge-case Notes (advisory)
- Một lần lớn vs nhiều lần nhỏ: có nguồn nghiêng về tích lũy nhiều lần nhỏ.
- Trường hợp thay mặt nhiều người: nên có lane ritual tách theo từng người.
- Thời điểm trời mưa hoặc điều kiện không thuận: hiển thị warning mềm, không hard-block mặc định.

## UX Rules
- Checklist offline-friendly, text ngắn, font lớn.
- Không “phán xét đạo đức” user từ form input.
- Không dùng gamification.

## References
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
- `design/03-domains/content/REFERENCES/LIFE-RELEASE-EXPERIENCE-ARCHITECTURE.MD`
- `design/03-domains/content/REFERENCES/NIEM-KINH-CORE-RULES.md`
- `design/03-domains/vows-merit/CONTRACTS.md`
