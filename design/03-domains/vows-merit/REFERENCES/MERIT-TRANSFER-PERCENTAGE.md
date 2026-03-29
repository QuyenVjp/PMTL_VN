# MERIT-TRANSFER-PERCENTAGE

## Owner
- `vows-merit`

## Purpose
- Sổ tay thiết kế cho trải nghiệm hồi hướng theo tỷ lệ phần trăm trong các flow liên quan nguyện/công đức.
- Chốt cách hiển thị an toàn cho người lớn tuổi: rõ ràng, không gây áp lực.

## UX Direction
- Cho phép người dùng chọn mức phần trăm theo các nấc đơn giản (10%).
- Hiển thị bằng text lớn + mô tả ngắn; tránh chart phức tạp.
- Nếu chưa chọn, giao diện phải nói rõ “chưa thiết lập”, không tự suy đoán.

## External Nuance Notes (for design only)
- Có thể dùng mặc định 100% self nếu owner policy cho phép.
- Có thể dùng các mốc 10-100% cho elderly-safe UI.
- Nếu user chọn mức cao cho transfer-out, hiện cảnh báo mềm về tác động tạm thời theo nguồn tham chiếu.
- Không hiện copy dạng “ban con lai bao nhieu cong duc”; chỉ hiện `muc da chon` + caution note trung tính.

## Wording Policy
- Copy dùng giọng trung tính: “mức hồi hướng bạn chọn”.
- Không dùng giọng “đánh giá công đức còn lại”.
- Không hiển thị câu gây hiểu nhầm kiểu điểm số thi đua.

## Data Notes
- Nếu cần lưu dữ liệu, phải đi qua owner contract của `vows-merit`.
- Trước khi thêm field DB mới, cập nhật `SCHEMA_PLAN.dbml` và contract tương ứng; file này không tự xem là đã có schema production.

## Integration Notes
- Dashboard chỉ nên hiển thị summary nhẹ.
- Chi tiết sâu nằm trong trang riêng tư của member (`/phat-nguyen` hoặc lane journal liên quan).
- Không đưa thông tin này lên community/public.

## Non-goals
- Không leaderboard.
- Không xếp hạng “tu tốt”.
- Không dùng để so sánh giữa người dùng.

## References
- `design/03-domains/vows-merit/MODULE_MAP.md`
- `design/03-domains/vows-merit/CONTRACTS.md`
- `design/04-execution-overlay/web/PAGE_INVENTORY.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
