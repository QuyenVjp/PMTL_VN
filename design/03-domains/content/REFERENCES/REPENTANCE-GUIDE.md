# REPENTANCE-GUIDE

## Owner
- `content` (guidance copy)
- hỗ trợ read model ở `engagement` khi cần ghi nhận self-practice

## Purpose
- Sổ tay thiết kế cho trải nghiệm `Lễ Phật Đại Sám Hối Văn`.
- Chốt boundary: đây là flow hỗ trợ tu tập cá nhân, không phải cơ chế chấm điểm.

## Core Direction
- Ghi nhận hai lớp thực hành:
  - `sự sám`: nhận diện lỗi, tâm sửa đổi.
  - `lý sám`: quán chiếu sâu, buông chấp.
- App chỉ hỗ trợ nhắc và ghi nhận; không thay vai trò hướng dẫn trực tiếp của người có kinh nghiệm.
- Trục thanh lọc nên hiển thị rõ:
  - `than`: hành vi
  - `khau`: lời nói
  - `y`: ý niệm
- Copy gợi ý: sám hối để nhận diện lỗi, giảm tái phạm, ổn định tâm.

## External Nuance Notes (for design only)
- Có thể dùng band tham chiếu cho caution card: `1-7`, `18`, `21`, `27`, `49`, và các mức cao hơn theo bối cảnh.
- Khi user nhập mức cao bất thường, ưu tiên hiện cảnh báo mềm + link nguồn, không khóa cứng ngay trong UI.
- Có thể có recovery lane sau vi phạm nguyện (repentance + little-house + release-life support) ở mức advisory; không auto-generate “hinh phat” từ hệ thống.
- Có thể thêm note thực hành nền:
  - nhịp thường ngày: `1-7` (tham chiếu mềm)
  - nếu chọn cao hơn, buộc hiện card “tham khảo nguồn + tự theo dõi thể trạng”.
- Khung giờ nhạy cảm (ví dụ ban đêm muộn) chỉ hiển thị advisory, không khóa cứng.

## UX Rules
- Form ghi nhận phải riêng tư (`private by default`).
- Copy trung tính, tránh tạo áp lực hoặc mặc định “thực hành ít là sai”.
- Cho phép user lưu: ngày, số lần, ghi chú ngắn, trạng thái cảm nhận.
- Không mở `public streak` hoặc xếp hạng cho sám hối.
- Có trường tùy chọn `body_signal_after_practice` (đau mỏi, bất an, bình thường).
- Nếu user báo tín hiệu bất thường:
  - mở card “theo dõi sức khỏe + lane hỗ trợ thực hành”
  - không auto kết luận tâm linh tuyệt đối.

## Safety Wording
- Dùng ngôn ngữ khuyến nghị: “có thể”, “nên tham khảo”, “theo nguồn”.
- Không khẳng định nhân quả theo kiểu máy móc.
- Với ngày đặc biệt hoặc số lần cao hơn thường lệ: hiển thị caution card + link nguồn.
- Không diễn đạt “đảm bảo khỏi bệnh” hoặc “chắc chắn đổi vận”.

## Non-goals
- Không karaoke sync.
- Không audio-guided bắt buộc theo từng câu.
- Không biến thành checklist “đạt/chưa đạt công đức”.

## References
- `design/03-domains/wisdom-qa/REFERENCES/examples/q161-le-phat-dai-sam-hoi-van-special-days.md`
- `design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD`
- `design/03-domains/content/REFERENCES/SPIRIT-ACTIVATION-RESPONSE.md`
- `design/03-domains/engagement/CONTRACTS.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
