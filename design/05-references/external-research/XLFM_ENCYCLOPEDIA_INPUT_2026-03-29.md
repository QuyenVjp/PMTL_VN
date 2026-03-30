# XLFM_ENCYCLOPEDIA_INPUT_2026-03-29

## Purpose
- Lưu toàn bộ dữ liệu bách khoa do owner cung cấp ngày `2026-03-29`.
- Đây là `research archive`, không phải implementation canon trực tiếp.
- Dùng để tránh mất dữ liệu và làm nguồn truy vết khi mở rộng design.

## Provenance
- Input lane: owner-provided long-form encyclopedia dump in Vietnamese.
- Scope gồm:
  - tổng quan lịch sử/phát triển pháp môn
  - ngũ đại pháp bảo
  - little-house ritual, special cases, self-storage
  - altar setup/maintenance
  - vow/dream/repentance/life-release
  - elderly, busy mode, pregnancy, chronic illness, special days
  - controversy/legal and institutional criticism
  - FAQ + testimonial narratives
  - glossary CN-VI-EN terms

## Detailed Intake Matrix (Owner Encyclopedia)
- Chapter 1:
  - tổng quan pháp môn, lịch sử, founder profile, totem-reading framing
  - five treasures definition + mission statement
- Chapter 2:
  - little-house definition, composition, ritual 6-step
  - write/chant/burn/ash handling details
  - edge cases: weather/night, self-storage, wrong-sheet handling
- Chapter 3:
  - deep breakdown of five treasures:
    - vow, life release, daily recitation, BTPP reading, repentance
  - mantra-purpose matrix and time-window cautions
- Chapter 4:
  - altar setup, placement constraints, offering protocol
  - maintenance and travel edge cases
- Chapter 5:
  - ritual taboos + ethical/legal controversies
  - mainstream criticism and policy-risk context
- Chapter 6:
  - specialized practice protocols:
    - elderly
    - busy users
    - pregnancy/fertility
    - chronic illness and severe distress
- Chapter 7:
  - dream and spiritual-response interpretation lanes
  - symptom-triggered coping flow
- Chapter 8:
  - vow breach and remediation narratives
  - rename-application and sheet-error handling
- Chapter 9:
  - special days, heart incense fallback, family-convincing practice
- Chapter 10-13:
  - general FAQ
  - 30 operational FAQs
  - testimonial case library
  - 30-day beginner roadmap
  - glossary appendix

## Normalized Extraction

### A. Implementation-safe candidates
- Five treasures mapping:
  - `niem kinh`, `phat nguyen`, `phong sanh`, `bach thoai`, `dai sam hoi`
- Little House composition:
  - `27/49/84/87` as structured tracker fields
- Little House ritual lifecycle:
  - create/sign/chant/burn/post-process
  - burn one-by-one and context-aware caution
- Daily recitation model:
  - core set + optional mantras
  - busy fallback and private journaling
- Repentance model:
  - private practice logs
  - caution bands and activation-response advisory
- Life-release model:
  - pre-release prep, on-site checklist, incident handling
- Elderly support model:
  - larger UI, simple counters, assist lane
- Calendar model:
  - special-day advisory and lunar context notes
- Moderation model:
  - testimonial labeling and review-required for sensitive claims
- Beginner roadmap model:
  - phased onboarding by week
  - checklists + no-overload progression
- FAQ model:
  - convert repeated practical questions into structured support cards
  - keep risky claims in research-only or testimonial tier

### B. Research-only / contested buckets
- Supernatural certainty claims and deterministic karmic outcome language.
- Medical cure guarantees from testimonials.
- Political/legal allegations by jurisdictions and organizations.
- Credential/status claims used as doctrinal proof.
- Statements that may trigger fear-based UX or coercive behavior.

## Owner Notes For Future Canonization
- Keep source-tier separation:
  - `official guide/pdf` > `wenda nuance` > `testimonial`
- Any number-heavy or sanction-heavy rules remain advisory unless owner canonizes.
- Any health-related flow must include medical disclaimer.
- Any controversial context remains in research lane unless explicitly requested for public copy.
- Do not directly promote “clinical cure” case stories without safety framing and non-medical disclaimer.

## Canonization Queue (from this intake)
- Priority 1 (implementation docs):
  - `LITTLE-HOUSE-RITUAL-FLOW.md`
  - `LITTLE-HOUSE-SPECIAL-CASES.md`
  - `LIFE-RELEASE-RITUAL-CHECKLIST.md`
  - `REPENTANCE-GUIDE.md`
  - `DAILY-GONGKE-STEPS.md`
  - `BTPP-ADVANCED-READING-NOTES.md`
- Priority 2 (policy/moderation):
  - `DHARMA_SHARING_MODERATION_NOTES.md`
  - `XLFM_FOUNDER_PROFILE_AND_RISK.md`
- Priority 3 (execution/codegen):
  - `PRACTICE_CORE_MODULES.md`
  - `PAGE_INVENTORY.md`
  - API route inventory overlays

## Glossary Seed (from owner input)
- `心灵法门` -> `Pháp Môn Tâm Linh` -> `Guan Yin Citta Dharma Door`
- `小房子` -> `Ngôi Nhà Nhỏ` -> `Little House`
- `观世音菩萨` -> `Quán Thế Âm Bồ Tát` -> `Guan Yin Bodhisattva`
- `白话佛法` -> `Bạch Thoại Phật Pháp` -> `Buddhism in Plain Terms`
- `礼佛大忏悔文` -> `Lễ Phật Đại Sám Hối Văn` -> `88 Buddhas Great Repentance`
- `往生咒` -> `Vãng Sinh Chú` -> `Pure Land Rebirth Mantra`
- `要经者` -> `Oan gia trái chủ` -> `Karmic Creditor`
- `心香` -> `Tâm Hương` -> `Heart Incense`
- `放生` -> `Phóng sinh` -> `Life Liberation`
- `许愿` -> `Phát đại nguyện` -> `Making Great Vows`

## Integration Targets
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
- `design/05-references/external-research/SOURCE_ANALYSIS.md`
- `design/03-domains/content/REFERENCES/*`
- `design/03-domains/vows-merit/REFERENCES/*`
- `design/03-domains/wisdom-qa/REFERENCES/*`
- `design/03-domains/community/REFERENCES/DHARMA_SHARING_MODERATION_NOTES.md`

## Status
- `archived`: yes
- `canonized`: partial (see per-file domain references)
