# DREAM-LOGIC

## Owner
- `content` (guidance wording)
- `vows-merit` (private journal handling)

## Mục đích
- Chuẩn hóa cách app xử lý ghi chú mộng/cảm ứng theo hướng `không chấp trước`.
- Tránh suy diễn tự động và tránh tạo tâm lý sợ hãi cho user, đặc biệt user lớn tuổi.

## Relationship
- File này là logic xử lý ở lane `content/engagement`.
- Với lane vow-specific, xem thêm:
  - `design/03-domains/vows-merit/REFERENCES/VOWS-DREAM-GUIDE.md`

## Core Principle
- Dream note là dữ liệu tham khảo cá nhân.
- Hệ thống không tự kết luận đúng/sai tâm linh.
- Wording ưu tiên: “không cần nghĩ quá nhiều, giữ đều thực hành là chính”.

## Suggested Flow
1. User ghi dream note trong private journal.
2. User chọn tag ngắn: `bóng/ánh sáng`, `số lượng`, `mất đồ`, `khác`.
3. Hệ thống chỉ gợi ý nhẹ:
   - “tiếp tục công khóa đều”
   - “xem lại vow đang mở”
   - “nếu liên quan số lượng, tách theo từng recipient”
4. Không auto-create vow, không auto-set deadline.

## Dream Tag Notes (Advisory)
- `bóng/ánh sáng`: mặc định hiện “không cần chấp trước”.
- `số lượng`: chỉ nhắc “nếu muốn làm theo, nên làm đủ và tách riêng từng đối tượng”.
- `mất đồ` (ví dụ mất Little House): gợi ý mở lane recovery mềm, không kết án user.

## UX Rules
- Chỉ private.
- Không gửi push gây hoảng.
- Không public ra community feed.
- Có nút “Tôi sẽ tiếp tục đều đặn” để đóng card nhanh.

## References
- `design/03-domains/vows-merit/REFERENCES/VOWS-DREAM-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/VOW-BREACH-RECOVERY-GUIDE.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
