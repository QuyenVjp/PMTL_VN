# XLFM_RITUAL_SOURCE_INDEX

## Purpose
- Chỉ mục tham chiếu ngoài (external source index) cho ritual nuance liên quan PMTL.
- Dùng cho design handbooks và codegen prompt grounding.
- Không tự động trở thành hard-rule implementation nếu chưa được content owner chốt.

## Usage Rule
- Khi triển khai feature, ưu tiên canon nội bộ (`design/03-domains/*`, `design/04-execution-overlay/*`).
- File này là lớp bổ sung để đối chiếu wording/nuance từ nguồn Trung.

## Five Treasures Reference (Ngu Dai Phap Bao)
- `许愿` (Phat nguyen)
- `放生` (Phong sanh)
- `念经` (Niem kinh)
- `看白话佛法` (Doc Bach Thoai Phat Phap)
- `大忏悔` (Dai Sam Hoi)

## Source Links (raw)
- `https://www.orientalradio.com.sg/chi-daily-fyfy/aug-14/`
- `https://blog.xinlingfamen.info/lu-tai-chang-xin-ling-fa-men-de-wu-da-fa-bao-shi-shi-yao/`
- `https://www.orientalradio.com.sg/chi-little-house-guide/xfz-chap6/`
- `https://www.guanyincitta.info/downloads/xlfm_chinese_guide.pdf`
- `https://ebooks.xinlingfamen.info/ebooks/18%20%E5%BF%83%E7%81%B5%E6%B3%95%E9%97%A8%E5%85%A5%E9%97%A8%E6%89%8B%E5%86%8C.pdf`
- `https://www.lujunhong2or.com/`
- `https://www.xinlingfamen.info/web/article/`
- `https://xinlingfamen.info/web/article/%E8%80%81%E5%90%8C%E4%BF%AE%E8%AE%B0%E4%B8%8D%E4%BD%8F%E5%BF%B5%E7%BB%8F%E9%81%8D%E6%95%B0%E8%AF%A5%E6%80%8E%E4%B9%88%E5%8A%9E/`
- `https://lujunhong2or.com/%E7%95%99%E8%A8%80%E6%9D%BF202409`
- `https://lujunhong2or.com/%E7%95%99%E8%A8%80%E6%9D%BF202601`
- `https://lujunhong2or.com/%E7%95%99%E8%A8%80%E6%9D%BF202602`
- `https://lujunhong2or.com/%E5%87%A0%E5%8D%81%E5%B9%B4%E4%B8%A5%E9%87%8D%E9%81%97%E4%BC%A0%E6%80%A7%E5%BF%83%E8%84%8F%E7%97%85%E5%BA%B7%E5%A4%8D%E6%AF%8D%E4%BA%B2%E6%88%90%E5%8A%9F%E8%A1%A8%E6%B3%95%E5%BA%A6%E5%8C%96%E5%AE%B6%E4%BA%BA/`
- `https://lujunhong2or.com/%E7%95%99%E8%A8%80%E6%9D%BF202406`
- `https://ebooks.xinlingfamen.info/ebooks/%E8%AE%BE%E4%BD%9B%E5%8F%B0%E5%BC%80%E7%A4%BA%E5%90%88%E9%9B%86.pdf`

## Normalized Notes For Design
- Little House burn flow:
  - burn one-by-one, from `敬赠` corner
  - avoid touching ashes directly
  - caution for weather/time conditions and recipient-switch intervals
  - day cap references (commonly cited `21/day`) must be treated as source-backed caution unless owner canonizes as strict runtime validation
  - common composition references: `27/49/84/87` should be modeled as structured fields in tracker UI
  - signature and recipient clarity should be validated before advancing to burn state
- Little House self-storage (zi cun):
  - pre-chant witness prayer pattern is referenced in Wenda materials
  - signature-first and delayed `jing zeng/date` write-at-use pattern is repeatedly cited
  - red-envelope storage and periodic recharge references (commonly cited 7-year cycle) should stay as guidance text unless owner converts to strict workflow
- Repentance count bands:
  - references include `1-7`, `18`, `21`, `27`, `49`, and higher emergency bands
  - daily UX should remain gentle; high-count paths require caution and source link
- Daily gongke beginner sequence:
  - references include a fixed beginner order: purification mantra, invitation, core sutras, optional minor mantras, closing mantras, gratitude
  - time-window references exist (including avoid windows for weak users); use as advisory copy rather than hard block by default
  - some sources mention soft prayer-scope limits per session (often cited as up to 3 wishes)
- Dream vow:
  - dream number can be recorded as personal reminder
  - app must not auto-create or auto-force vow targets
- Burn edge-case references:
  - 49-day deceased cycles and grouped-burn cadence are frequently cited
  - qingming tomb-repair timing and pre-birthday burn planning are cited in article/Wenda references
  - mixed-recipient session handling and incense relight exceptions are cited as practical edge guidance
- Vow breach recovery references:
  - some references propose heavy remediation bundles (Little House + repentance + release-life support)
  - keep as escalation guidance with caution language, not automatic punishment logic
- Merit transfer percentage:
  - support partial percentage with clear elderly-safe UI
  - avoid gamified “remaining merit” framing
  - temporary personal blessing impact warnings are cited and should appear as gentle caution copy
- Life release ritual references:
  - pre-release chanting and opening prayer sequence are cited
  - release-step wording, handling accidental death during release, and multi-recipient separation are cited
  - cadence guidance (large once vs smaller recurring) is cited as practical recommendation
  - preference for daytime release and calmer weather is frequently cited
  - ecology-fit caution (species/water compatibility) should be rendered as operational warning
  - funding-source nuance (self-paid vs proxy-for-others) appears in multiple Q&A lanes and should remain advisory, not moral scoring
- Luc trai day references:
  - six-day monthly practice focus (`8/14/15/23/29/30`) is repeatedly cited
  - advisory copy should encourage vegetarian + practice uplift without hard coercion
- Altar/incense respect references:
  - setup/orientation/respect handling and non-respect warnings are cited in PDF + Wenda
  - use as checklist guidance; avoid fear-first UX
- Dream-response references:
  - “co thi sua, khong thi gia can” tone is cited
  - with common-life dreams (e.g. ball/sky/fragmented images), references often suggest “khong can nghi qua nhieu, giu deu cong phu”
  - keep dream interpretation as advisory, not deterministic automation
- Heart-incense references:
  - when busy or temporarily unable to offer incense physically, references allow `tam huong` fallback
  - occasional forgetfulness should route to gentle repentance guidance, not automatic violation state
- Elderly-practice references:
  - if elderly users cannot remember counts, assisted red-dot tracking by family can be an acceptable support lane
  - UX priority should be support and continuity, not guilt
- Family-relation references:
  - family conflict around practice space should route to calming, household-friendly guidance first
  - for altar-space sensitivity, separation/arrangement hints can be shown as practical notes
- Altar-move references:
  - changing a well-established altar setup should be handled with caution and a preparation checklist
  - daytime move and pre/post notice flow can be represented as advisory steps
- Dharma-sharing moderation references:
  - sharing should stay positive/source-backed
  - avoid attack-style comparative rhetoric against other traditions
- Daily gongke:
  - beginner sequence and time-window references exist in external guide PDFs
  - keep as guidance layer, not fear-based enforcement logic
- BTPP reading:
  - “doc/nghe deu dan” is commonly positioned as wisdom-building lane
  - strongest product use is reading-to-practice bridge, not standalone scoring
  - merit-transfer narratives from reading should remain optional/private notes
- Ten small mantras references:
  - role-based usage (career, safety, health, longevity, conflict, etc.) is frequently explained in themed talks
  - treat as optional enhancement after core practice lane, not replacement
- Marriage/career/fertility references:
  - guidance commonly combines vow + core practice + optional support mantras
  - “khong gang cau” nuance should appear clearly in UX wording
- Dietary caution references:
  - advanced vegetarian cautions and avoidance lists are cited in Wenda/Q&A contexts
  - render as advisory habit guidance, not punitive runtime checks
- Health testimonial references:
  - case stories can be used as private encouragement copy
  - avoid transforming testimonial into guaranteed medical outcome promise
  - explicitly keep “ritual cannot replace medical care” disclaimer on sensitive surfaces
- Special-case burn references:
  - mask usage, weather/night exception handling, and high-volume one-time burn are cited in some Q&A contexts
  - keep as explicit special-case lane with confirmation step
- Pregnancy/birth support references:
  - vow + practice support narratives are frequent in testimonials
  - all pregnancy-related UX must remain private, gentle, and medically non-claiming
- Home-spirit/family-conflict references:
  - references often map to reconciliation and calming practice lanes
  - avoid deterministic supernatural attribution in UI
- Da Bei “energy support” references:
  - Da Bei is frequently framed as baseline protection/energy lane in daily recitation
  - increased counts in critical contexts should remain advisory guidance, not mandatory auto-rules

## Source Buckets (for quick lookup)
- five-treasures and daily teachings:
  - `https://www.orientalradio.com.sg/chi-daily-fyfy/aug-14/`
  - `https://blog.xinlingfamen.info/lu-tai-chang-xin-ling-fa-men-de-wu-da-fa-bao-shi-shi-yao/`
- little-house chapter and handbook PDFs:
  - `https://www.orientalradio.com.sg/chi-little-house-guide/xfz-chap6/`
  - `https://ebooks.xinlingfamen.info/ebooks/18%20%E5%BF%83%E7%81%B5%E6%B3%95%E9%97%A8%E5%85%A5%E9%97%A8%E6%89%8B%E5%86%8C.pdf`
  - `https://www.orientalradio.com.sg/ebooks/`
- beginner gongke references:
  - `https://www.guanyincitta.info/downloads/xlfm_chinese_guide.pdf`
  - `https://www.orientalradio.com.sg/wp-content/uploads/2020/04/%E6%AF%8F%E6%97%A5%E5%8A%9F%E8%AF%BE%E6%AD%A5%E9%AA%A4-%E5%88%9D%E5%AD%A6%E8%80%85.pdf`
- Wenda archive umbrella:
  - `https://www.lujunhong2or.com/`
  - `https://www.xinlingfamen.info/web/article/`
- life release and ritual knowledge lanes:
  - `https://www.orientalradio.com.sg/life-liberation/`
  - `https://www.orientalradio.com.sg/chi-buddhism-knowledge-2/changshi2-chap1-1/`
- luc trai and day-practice lanes:
  - `https://www.xinlingfamen.info/web/article/`
  - `https://www.orientalradio.com.sg/`
- altar setup and incense respect lanes:
  - `https://ebooks.xinlingfamen.info/`
  - `https://www.orientalradio.com.sg/buddhism-in-plain-terms/20220307-zhuanti/`
- ten-small-mantras themed lanes:
  - `https://www.orientalradio.com.sg/buddhism-in-plain-terms/zhuanti-20201012/`
- life release + vows + dream/wenda umbrella:
  - `https://www.lujunhong2or.com/`
  - `https://www.xinlingfamen.info/web/article/`
- marriage/career/fertility lanes:
  - `https://www.orientalradio.com.sg/chi-marital-relationship-discourse-book1/hunyin1-chap2-1/`
  - `https://www.orientalradio.com.sg/infertility/`
- special-case little-house lanes:
  - `https://www.xinlingfamen.info/web/article/`
  - `https://www.orientalradio.com.sg/chi-little-house-guide/xfz-chap6/`

## AI Search Requests
- See `design/05-references/external-research/AI_SEARCH_REQUESTS_XLFM.md` for normalized crawler prompts.
- See `design/05-references/external-research/THIN_AREAS_SEARCH_BACKLOG.md` for unresolved evidence lanes.
- See `design/05-references/external-research/XLFM_FOUNDER_PROFILE_AND_RISK.md` for founder-profile and controversy handling boundaries.
- See `design/05-references/external-research/XLFM_ENCYCLOPEDIA_INPUT_2026-03-29.md` for full owner-supplied encyclopedia archive.

## Verification Status
- `external-reference`: collected and structured for design use
- `owner-canonization`: pending content/vows owner review before converting any item to strict implementation rule

## Encyclopedia Intake Normalization (2026-03-29)
Mục này dùng để lọc các bản “bách khoa tổng hợp” dài trước khi đưa vào design canon.

### Safe-to-Product (co the dua vao flow)
- five treasures mapping (niem kinh, phat nguyen, phong sanh, bach thoai, dai sam hoi)
- little-house composition `27/49/84/87`
- little-house lifecycle + burn checklist + special-case caution lane
- daily/weekly practice rhythm, busy fallback (`tam huong`), elderly-friendly operation
- life-release checklist + incident handling when animals die during release
- repentance journaling + activation-response advisory
- private-first policy for dream/health/family logs

### Research-Only / Contested (khong dua thang vao UI copy)
- claims about supernatural certainty or guaranteed karmic outcomes
- medical cure guarantees from testimonials
- political/legal accusations and cult labels in specific jurisdictions
- credential/award claims used as doctrinal proof (`JP`, ambassador titles, etc.)
- framing rituals as deterministic “transaction engine” without disclaimer

### Mandatory Product Guardrails
- every sensitive health-related surface must keep medical disclaimer
- no hard deterministic language (“chac chan”, “bat buoc 100%”) for contested claims
- keep doctrinally sensitive numbers as `source-backed advisory` unless owner canonizes strict validation

## New Evidence (2024-2026, quote + raw link)
- Elderly counting support:
  - Quote: “老同修记不住念经遍数…家人负责帮点红点…”
  - Link: `https://xinlingfamen.info/web/article/老同修记不住念经遍数该怎么办/`
  - Implication: `ELDERLY-GONGKE.md` + assisted private tracking.
- Heart incense when busy/forget:
  - Quote: “早晚要上香（没有佛台上心香）…偶然一两次没有关系…”
  - Links:
    - `https://lujunhong2or.com/留言板202409`
    - `https://lujunhong2or.com/留言板202601`
  - Implication: `HEART-INCENSE-GUIDE.md` + `DAILY-GONGKE-STEPS.md` busy mode.
- Family relation / household conflict:
  - Quote: “先尽快给房子要经者烧送小房子并重新恭请菩萨。”
  - Link: `https://lujunhong2or.com/留言板202602`
  - Implication: `FAMILY-RELATION-GUIDE.md` + private family tag flow.
- Altar move caution:
  - Quote: “供奉很好的佛台不宜随便调整…念大悲咒、心经、礼佛大忏悔文各7遍…”
  - Link: `https://lujunhong2or.com/留言板202601`
  - Implication: `PHAT-DAI-BAO-DUONG.md` move checklist.
- Altar placement / airflow:
  - Quote: “空调不能完全对着菩萨吹…”
  - Link: `https://ebooks.xinlingfamen.info/ebooks/设佛台开示合集.pdf`
  - Implication: altar maintenance warning card.
