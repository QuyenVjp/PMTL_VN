# AI_SEARCH_REQUESTS_XLFM

## Purpose
- Bộ yêu cầu tìm kiếm chuẩn để giao cho AI crawler/research lane.
- Viết ngắn, rõ ngữ nghĩa, giảm nhầm lẫn truy vấn.

## Query Set A - Marriage/Career/Fertility
1. `site:orientalradio.com.sg 婚姻 情感 开示集锦 大吉祥天女咒 解结咒`
2. `site:xinlingfamen.info 求姻缘 不要强求 命中应有`
3. `site:lujunhong2or.com 求事业 准提神咒 大吉祥天女咒`
4. `site:orientalradio.com.sg 求子 大悲咒 心经 小房子`
5. `site:xinlingfamen.info 破胎 超度 小房子 求子`

## Query Set B - Altar Setup/Maintenance
1. `site:orientalradio.com.sg 设佛台 开示合集 chap7 保养`
2. `site:ebooks.xinlingfamen.info 设佛台 开示合集 pdf`
3. `site:xinlingfamen.info 设佛台 注意事项 空调 佛像`
4. `site:lujunhong2or.com 上香 注意事项 手脏 生气`

## Query Set C - Vow Breach / Recovery
1. `site:xinlingfamen.info 违愿 如何补救 108 小房子`
2. `site:lujunhong2or.com 违愿 礼佛大忏悔文 放生`
3. `site:xinlingfamen.info 梦见 小房子 丢了 违愿`

## Query Set D - Spirit Activation / Dream Response
1. `site:xinlingfamen.info 灵性激活 症状 小房子`
2. `site:lujunhong2or.com 2-4点 梦境 灵性`
3. `site:xinlingfamen.info 有则改之 无则加勉 梦境`

## Query Set E - Special Days Practice
1. `site:orientalradio.com.sg 清明 小房子 烧送`
2. `site:xinlingfamen.info 佛诞 礼佛大忏悔文 遍数`
3. `site:orientalradio.com.sg 盂兰盆 小房子 白天`
4. `site:xinlingfamen.info 忙碌 心香 功课`

## Query Set F - Special-case Little House Burn
1. `site:xinlingfamen.info 口罩 烧 小房子`
2. `site:xinlingfamen.info 49张 小房子 一次`
3. `site:orientalradio.com.sg 小房子 下雨 晚上`
4. `site:xinlingfamen.info 小房子 每天 21张 特殊情况`

## Query Set G - Da Bei Special Uses
1. `site:xinlingfamen.info 几种特殊情况下 大悲咒 49遍`
2. `site:lujunhong2or.com 手术前 大悲咒 21 49`
3. `site:xinlingfamen.info 家庭争吵 大悲咒 遍数`

## Query Set H - Pregnancy/Birth Support
1. `site:lujunhong2or.com 保胎 大悲咒 小房子`
2. `site:orientalradio.com.sg chi-email-qna 胎儿 绕颈`
3. `site:xinlingfamen.info 求子 流产 超度 小房子`

## Query Set I - Ten Small Mantras Utility
1. `site:orientalradio.com.sg 专题 20201012 十小咒`
2. `site:xinlingfamen.info 十小咒 功用`
3. `site:ebooks.xinlingfamen.info 入门手册 十小咒`

## Query Set J - Vow Breach 24h Window
1. `site:xinlingfamen.info 违愿 24小时 礼佛大忏悔文`
2. `site:xinlingfamen.info 有关许愿不能做到的问题`
3. `site:lujunhong2or.com 违愿 24小时 忏悔`

## Query Set K - Altar Daily Maintenance
1. `site:ebooks.xinlingfamen.info 设佛台 开示合集 保养 供水 香灰`
2. `site:orientalradio.com.sg 设佛台 chap7 保养`
3. `site:xinlingfamen.info 空调 对着 佛像 上香 注意事项`

## Query Set L - Wording Safety For Vows
1. `site:orientalradio.com.sg 求姻缘 不要强求 命中应有`
2. `site:lujunhong2or.com 求事业 准提神咒 合法`
3. `site:xinlingfamen.info 求子 流产 超度 小房子`

## Query Set M - Heart Incense / Busy Fallback
1. `site:lujunhong2or.com 心香 忙 没有佛台`
2. `site:orientalradio.com.sg 忘记上香 忏悔文 七佛灭罪真言`
3. `site:xinlingfamen.info 心香 早晚 上香`

## Query Set N - Dream Non-Attachment
1. `site:lujunhong2or.com 梦见 踢足球 不必多想`
2. `site:xinlingfamen.info 梦境 不要执著`
3. `site:orientalradio.com.sg 梦境 开示 不要害怕`

## Query Set O - Elderly Assistance And Family Space
1. `site:xinlingfamen.info 老同修 记不住 念经 遍数 红点`
2. `site:lujunhong2or.com 家人 佛台 屏风`
3. `site:lujunhong2or.com 调整 佛台 念 大悲咒 心经 礼佛大忏悔文`

## Thin Areas To Verify Line-by-Line
- Exact quote + Wenda code/date for:
  - special-case burn limits and exceptions
  - pregnancy-specific count recommendations
  - vow-breach remediation bundles
  - disease-case testimonials (to avoid over-claim)
- Conflicting ranges between sources (same topic, different counts).
- Source tiering:
  - official PDF
  - Wenda transcript
  - testimonial post
  Maintain tier label in evidence output.

## Retrieval Rules
- Ưu tiên nguồn official/domain gốc trước.
- Lưu cả:
  - link raw
  - quote ngắn
  - ngữ cảnh thời gian (Wenda code/date nếu có)
- Nếu có mâu thuẫn giữa nguồn, đánh dấu `conflict` thay vì tự kết luận.
- Với claim liên quan sức khỏe/sinh sản, bắt buộc gắn `medical_disclaimer_needed: true`.
