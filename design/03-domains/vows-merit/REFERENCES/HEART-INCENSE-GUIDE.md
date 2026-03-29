# HEART-INCENSE-GUIDE

## Owner
- `vows-merit`
- phối hợp `content` cho wording

## Mục đích
- Chuẩn hóa flow `tâm hương` khi user bận, đi xa, hoặc vô ý quên thượng hương.
- Tránh biến lỗi vô ý thành lane trừng phạt.

## Source-backed Notes (Design Use)
- Nguồn Wenda thường cho phép:
  - sáng/tối duy trì thượng hương hoặc tâm hương nếu điều kiện không cho phép.
  - quên 1-2 lần ngoài ý muốn có thể đi lane sám hối nhẹ.

## System Flow
1. User bấm `Tôi bận hôm nay`.
2. App chuyển sang `Busy / Heart Incense Mode`:
   - ghi log `tâm hương`
   - giữ core practice tối thiểu
3. Nếu user tự khai “quên thượng hương”:
   - gợi ý card sám hối nhẹ (1-2 lần)
   - tùy chọn thêm `Thất Phật Diệt Tội` lane tham khảo
4. Không auto gắn cờ vi phạm nguyện.

## UX Rules
- Một nút bấm, một hành động chính.
- Copy phải giảm guilt: “vô ý thì điều chỉnh nhẹ là đủ”.
- Không push cảnh báo dồn dập.

## References
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/vows-merit/REFERENCES/VOW-BREACH-RECOVERY-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
