# LITTLE-HOUSE-SPECIAL-CASES

## Owner
- `content`
- tiêu thụ ở `engagement` tracker `/tu-tap/nha-nho`

## Purpose
- Ghi chú các tình huống đặc biệt khi burn Little House.
- Chỉ là lane `advisory`, không tự động override canonical safety rules nếu chưa owner phê duyệt.

## Special-case Patterns (advisory)
- Khẩu trang khi burn trong bối cảnh sức khỏe/khói:
  - có thể cho phép với wording tôn kính phù hợp.
- Mốc số lượng cao hơn bình thường:
  - chỉ trong bối cảnh khẩn/đặc biệt có nguồn tham chiếu rõ.
- Mưa/ban đêm:
  - mặc định cảnh báo tránh; nêu ngoại lệ ở mức tham khảo.
- Trẻ em bệnh nặng:
  - hỗ trợ card “special-case plan”, không auto-khẳng định.
- Dụng cụ đốt:
  - khuyến nghị dùng dụng cụ sạch/chuyên dụng (bát/đĩa phù hợp), không đốt trực tiếp trên nền.
- Trình tự đốt:
  - ưu tiên từng tờ, thao tác cẩn trọng, ghi nhận phiên đốt theo ngữ cảnh thực tế.

## UI Rules
- Khi user nhập số lượng vượt lane thường:
  - hiện popup caution + yêu cầu xác nhận “special case”.
- Phải có link nguồn và nhãn: `tham khao theo Wenda/guide`.
- Không chặn cứng nếu đây chỉ là advisory flow.

## References
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
