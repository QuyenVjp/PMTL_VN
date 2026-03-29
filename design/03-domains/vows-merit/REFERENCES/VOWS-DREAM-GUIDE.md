# VOWS-DREAM-GUIDE

## Owner
- `vows-merit`

## Purpose
- Hướng dẫn thiết kế cho dữ liệu `mộng/cảm ứng` trong flow phát nguyện.
- Đảm bảo hệ thống chỉ xem đây là `tham chiếu cá nhân`, không tự động biến thành mệnh lệnh.

## Design Principles
- Dream note là private record.
- Không tự tạo vow, không tự đặt deadline, không tự gán chỉ tiêu.
- Nếu user muốn, chỉ gợi ý hành động nhẹ: “xem lại nguyện hiện có”, “tham khảo đồng tu có kinh nghiệm”.

## External Nuance Notes (for design only)
- Có thể có trường hợp source nhấn mạnh “dream number nên được hoàn thành đầy đủ theo từng recipient”.
- Ứng dụng chỉ ghi nhận và gợi ý; không auto-force thành nghĩa vụ hệ thống.
- Với các dream đời thường (ví dụ bóng, ánh sáng, hình ảnh rời rạc), mặc định hiện guidance “không cần nghĩ quá nhiều”.
- Có thể bổ sung cảnh báo vận hành:
  - không merge nhiều recipient vào một dream target nếu source nêu tách biệt
  - tránh tự diễn giải dream theo kiểu kết luận tuyệt đối
  - nếu có lane vi phạm nguyện, hiển thị recovery guidance mềm thay vì trigger trừng phạt tự động

## UX Rules
- Có trường ghi chú mộng/cảm ứng ngắn gọn.
- Có tag nhanh:
  - `khong-chap-truoc`
  - `dream-so-luong`
  - `can-xem-lai-vow`
- Có disclaimer cố định: “Nội dung này mang tính tham khảo, không thay thế hướng dẫn trực tiếp.”
- Không push notification gây sợ hãi kiểu “bạn bắt buộc phải làm ngay”.
- Nếu user bấm `tôi bận`, không bật luồng cảnh báo; chỉ gợi ý quay lại công khóa nền.

## Data/Contract Notes
- Thuộc lane `vows-merit` vì liên quan cam kết và tiến độ nguyện.
- Nếu route cần aggregate lên dashboard, chỉ show trạng thái “có ghi chú mới”, không show chi tiết nhạy cảm ở card công khai.

## Non-goals
- Không auto-vow từ dream.
- Không suy diễn tự động “đúng/sai”.
- Không gamification.

## References
- `design/03-domains/vows-merit/MODULE_MAP.md`
- `design/03-domains/vows-merit/CONTRACTS.md`
- `design/03-domains/vows-merit/USE_CASES/create-vow.md`
- `design/03-domains/content/REFERENCES/DREAM-LOGIC.md`
- `design/03-domains/vows-merit/REFERENCES/ALTAR_INCENSE_RESPECT_CHECKLIST.md`
- `design/03-domains/vows-merit/REFERENCES/VOW-BREACH-RECOVERY-GUIDE.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
