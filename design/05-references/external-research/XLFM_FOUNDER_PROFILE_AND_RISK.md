# XLFM_FOUNDER_PROFILE_AND_RISK

## Purpose
- Lưu hồ sơ bối cảnh về người sáng lập và các claim gây tranh cãi.
- Dùng cho moderation/compliance và research lane.
- Không dùng làm copy khẳng định trên product surface.

## Profile Snapshot (research context)
- Richard Jun Hong Lu (Lư Quân Hoành), sinh 1959, mất 2021.
- Sáng lập Guan Yin Citta Dharma Door (PMTL/XLFM) năm 2006.
- Vận hành hệ truyền thông và pháp hội quy mô lớn.
- Trong một số tài liệu đối ngoại, tên xuất hiện kèm danh xưng `JP` (Justice of the Peace).

## Sensitive Claim Buckets
- Spiritual authority claims:
  - “Phật sống”, “hóa thân Quan Âm”, “Totem reading”.
- Medical outcome claims:
  - chữa bệnh nan y, hồi phục bệnh nặng từ testimonial.
- Credential/status claims:
  - danh xưng `JP`
  - danh xưng `World Peace Ambassador`
  - danh xưng `Peace Education Ambassador`
  - danh xưng gắn với các diễn đàn liên chính phủ/quốc tế
  - các danh xưng học thuật/danh dự đi kèm khi diễn thuyết.
- Institutional/political controversy:
  - bị tổ chức Phật giáo chính thống phản biện
  - tranh cãi pháp lý/chính trị theo từng quốc gia.
  - tranh cãi riêng quanh nghi thức đốt `Little House` và cách diễn giải “trả nợ nghiệp” như mô hình giao dịch.
  - rủi ro hành vi: người dùng có thể quá lệ thuộc nghi thức và trì hoãn hỗ trợ y tế/chăm sóc gia đình.

## Product Safety Rules
- Các claim trên chỉ được gắn nhãn:
  - `research_only`
  - `contested`
  - `testimonial`
- Không hiển thị như fact tuyệt đối trên UI member/public.
- Không dùng để tạo automation phán định user đúng/sai tâm linh.
- Các câu liên quan chữa bệnh phải có medical disclaimer.
- Các câu về chức danh (`JP`, học hàm, giải thưởng) phải gắn nhãn `credential_claim` và route về `research_only` nếu chưa có xác minh độc lập.
- Với nội dung `Little House`:
  - chỉ dùng framing “ritual support/advisory”
  - cấm phrasing “bảo chứng chữa khỏi” hoặc “thay thế điều trị”.

## Moderation Rules
- Nếu community post chứa claim tuyệt đối về chữa bệnh/siêu năng lực:
  - chuyển `review-required`
  - yêu cầu gắn nguồn + nhãn testimonial
- Chặn phrasing kích động sùng bái cá nhân hoặc công kích tôn giáo khác.
- Với bài dùng chức danh để tăng tính thuyết phục (ví dụ “JP nên chắc chắn đúng”):
  - gắn `review-required`
  - yêu cầu tách bạch `credential` và `teaching claim`.

## Credential Verification Lane
- Khi gặp claim về `JP` hoặc vinh danh quốc tế:
- Khi gặp claim về `JP`, `World Peace Ambassador`, hoặc vinh danh quốc tế:
  - lưu dưới `credential_claim` (không auto promote ra product copy)
  - kiểm tra chéo ít nhất 2 nguồn trước khi dùng trong nội dung công khai
  - nếu không đủ bằng chứng: giữ trạng thái `contested` hoặc `unverified`.

## Recognition Timeline (Research Only)
- 2012 London:
  - claim về giải thưởng hòa bình và danh xưng đại sứ hòa bình.
- 2013 Berlin:
  - claim về giải thưởng đóng góp thúc đẩy hòa bình cộng đồng toàn cầu.
- 2014 New York/Washington:
  - claim về tham gia diễn đàn hòa bình và danh xưng liên quan giáo dục hòa bình.
- 2015:
  - claim về tham gia diễn đàn cấp cao liên quan văn hóa hòa bình.
- 2018:
  - claim về các danh xưng quốc tế liên quan hòa bình tôn giáo/từ thiện.

Lưu ý:
- Toàn bộ timeline trên là `research_only`.
- Không dùng làm nội dung khẳng định trên UI nếu chưa có bằng chứng xác minh độc lập đủ mạnh.

## References (raw, to be tier-reviewed)
- `https://lujunhong2or.com/`
- `https://www.orientalradio.com.sg/`
- `https://www.xinlingfamen.info/web/article/`

## Integration Targets
- `design/03-domains/community/REFERENCES/DHARMA_SHARING_MODERATION_NOTES.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
