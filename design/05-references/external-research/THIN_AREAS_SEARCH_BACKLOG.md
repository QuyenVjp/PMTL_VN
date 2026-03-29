# THIN_AREAS_SEARCH_BACKLOG

## Purpose
- Danh sách điểm còn mỏng cần AI research lane xác thực thêm.
- Mỗi mục có query gợi ý ngắn để giảm lỗi ngữ nghĩa khi crawl.

## Thin Area 1 - Special-case burn thresholds
- Need:
  - exact quote + source date/code for `>21/day` exception logic
  - explicit boundary between normal lane vs emergency lane
- Query:
  - `site:xinlingfamen.info 小房子 49张 特殊情况`
  - `site:orientalradio.com.sg 小房子 每天 21张`

## Thin Area 2 - Pregnancy/fertility numbers
- Need:
  - exact ranges for prior-loss recovery references
  - wording tier: recommendation vs strict requirement
- Query:
  - `site:lujunhong2or.com 求子 小房子 流产`
  - `site:xinlingfamen.info 保胎 大悲咒`

## Thin Area 3 - Vow-breach remediation packages
- Need:
  - quote matrix for 108-package variants
  - conflict table across Wenda years
- Query:
  - `site:xinlingfamen.info 违愿 如何补救 108`
  - `site:lujunhong2or.com 违愿 小房子 礼佛`

## Thin Area 4 - Medical testimonial safety tiering
- Need:
  - separate “testimonial” vs “instructional guidance”
  - no-misleading copy patterns
- Query:
  - `site:lujunhong2or.com 癌症 小房子 案例`
  - `site:orientalradio.com.sg q161 精神`

## Thin Area 5 - Ten small mantras utility conflicts
- Need:
  - per-mantra purpose wording from primary sources
  - beginner-friendly simplification without distortion
- Query:
  - `site:orientalradio.com.sg 十小咒 功用`
  - `site:xinlingfamen.info 十小咒 开示`

## Thin Area 6 - Vow breach 24h remediation window
- Need:
  - exact quote cho logic `24h` và giới hạn sau 24h
  - tách rõ recommendation vs bắt buộc
- Query:
  - `site:xinlingfamen.info 违愿 24小时 礼佛大忏悔文`
  - `site:xinlingfamen.info 有关许愿不能做到的问题`

## Thin Area 7 - Altar maintenance daily vs setup rules
- Need:
  - phân biệt quy tắc `bảo dưỡng hằng ngày` và `thiết lập ban đầu`
  - câu chữ ngắn cho warning elderly-friendly
- Query:
  - `site:ebooks.xinlingfamen.info 设佛台 开示合集 保养`
  - `site:orientalradio.com.sg 设佛台 chap7`

## Thin Area 8 - Marriage/Career vow wording safety
- Need:
  - quote cấm `强求` trong cầu duyên
  - wording hợp pháp cho cầu sự nghiệp
- Query:
  - `site:orientalradio.com.sg 求姻缘 不要强求`
  - `site:lujunhong2or.com 准提神咒 求事业 合法`

## Thin Area 9 - Busy mode / heart incense fallback
- Need:
  - exact quote cho fallback `tâm hương` khi bận hoặc quên thượng hương
  - phân biệt “vô ý quên” và “vi phạm có chủ ý”
- Query:
  - `site:lujunhong2or.com 心香 忙 没有佛台`
  - `site:orientalradio.com.sg 忘记上香 礼佛大忏悔文`

## Thin Area 10 - Dream trivial patterns (no over-interpretation)
- Need:
  - quote lane cho các dream đời thường “không cần nghĩ quá nhiều”
  - tránh tự động kết luận từ dream phi cấu trúc
- Query:
  - `site:lujunhong2or.com 梦见 踢足球 不必多想`
  - `site:xinlingfamen.info 梦境 不执著`

## Thin Area 11 - Elderly assisted counting lane
- Need:
  - quote rõ về hỗ trợ người già nhớ số lần niệm
  - ranh giới giữa “hỗ trợ” và “làm thay toàn bộ”
- Query:
  - `site:xinlingfamen.info 老同修 记不住 念经 遍数`
  - `site:lujunhong2or.com 家人 帮助 点红点`

## Thin Area 12 - Family conflict near altar
- Need:
  - quote về xử lý không gian khi gia đình chưa đồng thuận
  - wording tránh đổ lỗi thành viên trong nhà
- Query:
  - `site:lujunhong2or.com 佛台 屏风 家人`
  - `site:lujunhong2or.com 房子 要经者 重新 恭请`

## Output Format Required From AI Lane
- `claim`
- `exact quote` (short)
- `source URL`
- `source tier` (`official_pdf`, `wenda`, `testimonial`)
- `confidence`
- `conflict_note` (if any)
