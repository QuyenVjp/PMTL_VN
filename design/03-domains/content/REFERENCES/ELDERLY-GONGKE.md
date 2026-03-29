# ELDERLY-GONGKE

## Owner
- `content` (copy và guidance)
- `engagement` (state, toggle, trợ giúp người thân)

## Mục đích
- Chuẩn hóa `Elderly Practice Mode` cho người lớn tuổi hay quên số lần niệm.
- Hệ thống phải hỗ trợ nhẹ nhàng, không tạo cảm giác tội lỗi.

## Source-backed Notes (Design Use)
- Wenda có nhấn mạnh trường hợp người già không nhớ số lần:
  - người thân có thể hỗ trợ chấm điểm/đánh dấu thay.
  - giữ thực hành đều đặn quan trọng hơn áp lực nhớ chính xác từng lần.

## System Flow (đề xuất cho dev)
1. User bật `Elderly Mode` trong sheet `/tu-tap/bai-tap`.
2. UI chuyển sang:
   - chữ lớn
   - thao tác ít bước
   - nút `chấm điểm đỏ` rõ ràng
3. Nếu được ủy quyền, người thân có thể hỗ trợ đánh dấu tiến độ (private assist lane).
4. Nếu quên 1-2 lần:
   - không cắt streak ngay
   - hiển thị nhắc nhẹ “tiếp tục đều đặn”.

## UX Rules
- Không game hóa.
- Không phán định “sai công đức”.
- Có voice-read và touch target lớn cho user cao tuổi.

## References
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/vows-merit/REFERENCES/HEART-INCENSE-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
