# DHARMA_SHARING_MODERATION_NOTES

## Owner
- `community` + `moderation`

## Purpose
- Notes cho moderation policy khi user chia sẻ tu học/hoang phap trong community.
- Giữ đúng tinh thần: chia sẻ tích cực, source-backed, không tranh luận công kích.

## Moderation Direction
- Khuyến khích:
  - chia sẻ trải nghiệm cá nhân lành mạnh
  - gắn nguồn tham khảo khi nêu quy tắc nhạy cảm
- Hạn chế:
  - công kích pháp môn khác
  - dùng ngôn ngữ đe dọa, phán xét nặng
  - ép buộc người khác theo nghi thức bằng giọng tuyệt đối
  - claim tuyệt đối kiểu “chữa chắc chắn”, “siêu năng lực chắc chắn đúng”, “phán định số mệnh người khác”

## UI/Content Policy
- Prompt nhập bài có hint: “neu co trich dan, vui long kem nguon”.
- Với bài nhạy cảm ritual, ưu tiên `review-required` nếu thiếu nguồn.
- Không hiển thị “thành tích tu tập cá nhân” như điểm khoe.
- Với bài chứa claim về chữa bệnh/totem/địa vị tâm linh:
  - auto gắn `review-required`
  - yêu cầu nhãn `testimonial` hoặc `contested` trước khi public.
- Với bài viện dẫn chức danh thế tục/học thuật (ví dụ `JP`) để khẳng định giáo lý:
  - yêu cầu tách `credential claim` khỏi `teaching claim`
  - nếu thiếu nguồn kiểm chứng, giữ `review-required`.
- Với bài chứa cáo buộc chính trị/pháp lý/cult label:
  - không auto publish
  - chuyển moderation lane `research-only` + yêu cầu nguồn rõ và ngôn ngữ trung tính.

## References
- `design/03-domains/community/MODULE_MAP.md`
- `design/03-domains/moderation/CONTRACTS.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
- `design/05-references/external-research/XLFM_FOUNDER_PROFILE_AND_RISK.md`
