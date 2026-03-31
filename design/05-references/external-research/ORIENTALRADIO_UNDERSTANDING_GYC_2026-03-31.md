# ORIENTALRADIO_UNDERSTANDING_GYC_2026-03-31

## Mục đích
- Lưu bản text nền tảng “Understanding Guan Yin Citta Dharma Door” do owner cung cấp để dùng cho lane thiết kế nội dung.
- Scope: `design-only`, không tác động code runtime.

## Nguồn
- Family: `Oriental Radio / About XLFM`
- Nội dung gốc owner cung cấp:
  - `Understanding Guan Yin Citta Dharma Door`
  - `Which Buddhism Theories Are Guan Yin Citta Based On?`
- Trích dẫn nội bộ được nêu trong bài:
  - “Using Ingenious Methods to Help Sentient Beings and Establish Kind Affinities with All – A Collection of Best Discourses by Master Jun Hong Lu”
  - Section 4, Topic 3 và Topic 6

## Extract chuẩn hóa (ý chính)

### 1) Định nghĩa Citta Dharma Door
- `Citta` được diễn giải như “tâm linh/tinh thần”, ví như ổ khóa.
- `Dharma Door` là “phương pháp”, ví như chìa khóa mở khóa.
- Cốt lõi diễn giải: mở tâm, sửa tâm, giải khó trong đời sống bằng thực hành Phật pháp.

### 2) Mục tiêu thực hành
- Trọng tâm mô tả:
  - giảm lo âu, khổ đau, bất ổn tinh thần
  - hướng người tu vào lòng từ bi, thanh tịnh, yêu thương, quan tâm
  - đi từ xử lý vấn đề đời sống đến tu tâm dưỡng tánh
- Bộ trụ cột thực hành được nhấn mạnh:
  - niệm kinh
  - phát nguyện
  - phóng sinh
  - học `Buddhism in Plain Terms`

### 3) Đích đến tâm linh (theo wording nguồn)
- Giảm nghiệp chướng, trả nghiệp, tháo gỡ phiền não.
- Hướng tới thoát khỏi Lục đạo, trở về Tây phương và Tứ Thánh đạo.

### 4) Nền tảng học thuyết được nêu
- Quy y theo Tam Thánh Tây phương.
- Nêu liên hệ cùng gốc với Thiền tông và Tịnh độ tông.
- Mục tiêu đạo đức: Từ, Bi, Hỷ, Xả.
- Diễn giải lane:
  - Thiền: xử lý vấn đề thế gian bằng trí tuệ.
  - Tịnh độ: hướng xuất ly, rời chấp trước thế gian.

## Guardrail cho product/design
- Các câu mang tính “assure no prayers unanswered”, “effective cure”, “future of Buddhism” phải gắn nhãn:
  - `belief_statement`
  - `doctrinal_claim`
  - `non-medical`
- Không chuyển thành medical claim, không render như bảo chứng kết quả.
- Khi đưa ra surface người dùng:
  - ưu tiên dạng “định hướng tu học”
  - tránh diễn đạt quyết định luận/tuyệt đối hóa outcome.

## Mapping đề xuất vào design canon
- `practice-support`:
  - dùng cho phần “ba thực hành vàng” ở mức hành trì.
- `wisdom-qa`:
  - dùng cho đoạn giải thích học thuyết (Thiền/Tịnh độ/Từ Bi Hỷ Xả) kèm source.
- `about`:
  - dùng cho intro triết lý pháp môn ở mức khái quát.

## Liên kết
- `design/05-references/external-research/ORIENTALRADIO_PMtl_SOURCE_DIGEST_2026-03-31.md`
- `design/05-references/external-research/XLFM_FOUNDER_PROFILE_AND_RISK.md`
