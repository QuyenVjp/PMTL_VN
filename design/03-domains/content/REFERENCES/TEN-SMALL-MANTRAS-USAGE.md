# TEN-SMALL-MANTRAS-USAGE

## Owner
- `content`

## Purpose
- Handbook cho phần `thap tieu chu` trong flow daily practice.
- Giúp UI gợi ý “muc tieu hom nay -> tieu chu tham khao” theo cách dễ hiểu cho người mới.

## Positioning
- `Thap tieu chu` là lớp bổ sung sau core lane:
  - `dai bi`
  - `tam kinh`
  - `le phat dai sam hoi`
- Warning bắt buộc: không xem tiểu chú là thay thế hoàn toàn core lane.

## Operational Baseline
- Nấc tham chiếu thường dùng: `21`, `27`, `49` (advisory, không hard-block).
- Chỉ nên mở tối đa `1-3` mục tiêu trong một phiên để tránh quá tải.
- Nếu user chưa hoàn thành `core set`, UI phải nhắc quay về core trước khi mở rộng tiểu chú.

## Small Mantra Map (Product-Safe)
- `Chuẩn Đề`:
  - lane: sự nghiệp/học tập/định hướng hợp pháp
  - caution: tránh wording “bằng mọi giá”
- `Giải Kết`:
  - lane: hóa giải mâu thuẫn với đối tượng cụ thể
  - caution: hướng hòa giải, không thao túng người khác
- `Tiêu Tai Cát Tường`:
  - lane: rắc rối đột xuất, bất an, xung đột, kiện tụng
  - caution: chỉ là support lane, không thay tư vấn pháp lý/y tế
- `Vãng Sinh`:
  - lane: hồi hướng phù hợp theo ngữ cảnh
  - caution thời gian/thời tiết: ưu tiên ban ngày; tránh muộn tối và thời tiết cực đoan
- `Thất Phật Diệt Tội`:
  - lane: hỗ trợ thanh lọc lỗi nhỏ gần đây
  - caution: không thay thế lane sám hối nền
- `Công Đức Bảo Sơn`:
  - lane: quy đổi thiện hạnh thành công đức theo ngữ cảnh
- `Đại Cát Tường Thiên Nữ`:
  - lane: cầu thuận lợi/nhân duyên trong khung đạo đức
- `Thánh Vô Lượng Thọ...`:
  - lane: cầu thọ, hỗ trợ tinh thần cho người cao tuổi
  - caution: không diễn đạt như cam kết điều trị
- `Quan Âm Linh Cảm`:
  - lane: hỗ trợ tinh thần khi khẩn cấp
  - caution: không biến thành nút “đòi kết quả tức thì”
- `Như Ý Bảo Luân`:
  - lane: ổn định tâm, định hướng thuận duyên

## Suggested UX Pattern
1. User chọn nhu cầu trong ngày (ví dụ: bình an, hóa giải xung đột, cầu thọ, cầu trí tuệ, v.v.).
2. Hệ thống gợi ý 1-2 tiểu chú phù hợp để tham khảo.
3. Hiển thị số lần tham chiếu theo nấc thường dùng (`21/27/49`) ở dạng advisory.
4. Nhắc “không mở quá nhiều mục tiêu cùng lúc” để tránh quá tải.

## Caution Policy
- Chỉ dùng `source-backed caution`.
- Không hứa hẹn kết quả chắc chắn theo kiểu nhân quả cơ học.
- Không tạo mechanics “đạt chỉ tiêu = chắc chắn thành tựu”.

## References
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/content/REFERENCES/NIEM-KINH-CORE-RULES.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
