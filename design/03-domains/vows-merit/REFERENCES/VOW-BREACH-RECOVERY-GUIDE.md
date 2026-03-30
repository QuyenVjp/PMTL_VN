# VOW-BREACH-RECOVERY-GUIDE

## Owner
- `vows-merit`

## Mục đích
- Hướng dẫn phản ứng khi user tự khai báo có khả năng `vi phạm nguyện`.
- Thiết kế recovery lane có cấu trúc, giữ giọng trung tính, không tạo hoảng loạn.

## Design Direction
- Recovery lane nên gồm:
  - repentance support
  - little-house support plan
  - life-release support plan
  - reminder/check-in riêng tư
- Các mốc số lượng (ví dụ `108`) chỉ hiển thị dạng `tham khảo theo nguồn`, không áp cứng như system rule.

## Vow Discipline Policy
- Một vow đã tạo được xem là cam kết có kỷ luật; hệ thống cần nhắc user theo dõi định kỳ.
- App không dùng mô hình trừng phạt tự động.
- Khi user báo “khó giữ nguyện”:
  - ưu tiên lane `chỉnh vow plan` (chia nhỏ milestone, kéo giãn tiến độ hợp lý)
  - sau đó mới mở lane recovery tham khảo.

## Recovery Window Note (source-backed caution)
- Với nội dung liên quan `24 giờ đầu sau khi vi phạm`, dùng wording:
  - “Theo một số Wenda, giai đoạn sớm có thể cần xử lý tập trung hơn; app chỉ ghi nhận và gợi ý tham khảo.”
- Không tự động kết luận:
  - user chắc chắn vi phạm
  - user phải theo một công thức duy nhất
- Nếu nguồn có nhiều phiên bản số lượng khác nhau theo năm, UI phải hiện `có khác biệt theo nguồn`.

## UX Rules
- Khi user chọn “có khả năng vi phạm nguyện”:
  - hiện recovery card theo bước
  - không auto-lock tài khoản
  - không auto-phán định “chắc chắn vi phạm”
- Cho phép user chọn nhịp thực hành theo chặng, tránh giao gánh nặng một lần.
- Cho phép bật cờ “cần người hướng dẫn hỗ trợ” nhưng không ép liên hệ.
- Nếu user đạt lại nhịp ổn định:
  - cho phép đóng recovery lane và quay về vow tracking bình thường
  - không giữ nhãn “vi phạm” như stigma vĩnh viễn.

## Warning Policy
- Không dùng ngôn từ trừng phạt.
- Không tự sinh nghĩa vụ cứng từ dream note.
- Nếu user cần hỗ trợ sâu, chỉ gợi ý lane tham khảo người hướng dẫn có kinh nghiệm.

## Source Tier Policy
- `official_pdf`: ưu tiên cao nhất cho workflow ổn định.
- `wenda`: dùng cho nuance, phải gắn mốc thời gian nếu có.
- `testimonial`: chỉ dùng làm động viên, không dùng làm rule.

## References
- `design/03-domains/vows-merit/REFERENCES/VOWS-DREAM-GUIDE.md`
- `design/03-domains/content/REFERENCES/REPENTANCE-GUIDE.md`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
