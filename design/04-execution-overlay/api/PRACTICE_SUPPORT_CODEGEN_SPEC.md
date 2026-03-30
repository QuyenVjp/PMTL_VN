# Practice Support Codegen Spec

## Scope
Chuẩn hóa batch vận hành nghi thức để BE/FE generate trực tiếp:
- Phật đài & bảo dưỡng.
- Quy tắc viết/chấm NNN.
- Định mức số tờ NNN theo tình huống.
- Tâm Hương 9 bước + travel edge cases.
- Nghi thức đổi tên tâm linh.
- Hóa giải nghiệp thai nhi.
- Hướng dẫn niệm kinh (kinh lớn + thập tiểu chú).
- Chọn loài phóng sanh & nguyên tắc sinh thái.
- Checklist tự tu tại gia Việt Nam.

## Route Canon
- Public:
  - `GET /content/practice-support/altar-care`
  - `GET /content/practice-support/little-house-writing-rules`
  - `GET /content/practice-support/little-house-allocation-guidelines`
  - `GET /content/practice-support/heart-incense`
  - `GET /content/practice-support/name-change-ritual`
  - `GET /content/practice-support/fetal-karma-resolution`
  - `GET /content/practice-support/recitation-guide`
  - `GET /content/practice-support/life-release-selection-guide`
  - `GET /content/practice-support/vietnam-home-practice-guide`
- Admin:
  - `GET/PATCH /admin/content/practice-support/altar-care`
  - `GET/PATCH /admin/content/practice-support/little-house-writing-rules`
  - `GET/PATCH /admin/content/practice-support/little-house-allocation-guidelines`
  - `GET/PATCH /admin/content/practice-support/heart-incense`
  - `GET/PATCH /admin/content/practice-support/name-change-ritual`
  - `GET/PATCH /admin/content/practice-support/fetal-karma-resolution`
  - `GET/PATCH /admin/content/practice-support/recitation-guide`
  - `GET/PATCH /admin/content/practice-support/life-release-selection-guide`
  - `GET/PATCH /admin/content/practice-support/vietnam-home-practice-guide`

## DTO Canon
- Public:
  - `PracticeSupportAltarCareDto`
  - `PracticeSupportLittleHouseWritingRulesDto`
  - `PracticeSupportLittleHouseAllocationGuidelinesDto`
  - `PracticeSupportHeartIncenseDto`
  - `PracticeSupportNameChangeRitualDto`
  - `PracticeSupportFetalKarmaResolutionDto`
  - `PracticeSupportRecitationGuideDto`
  - `PracticeSupportLifeReleaseSelectionGuideDto`
  - `PracticeSupportVietnamHomePracticeGuideDto`
- Admin:
  - `AdminPracticeSupportAltarCareDto`
  - `AdminPracticeSupportLittleHouseWritingRulesDto`
  - `AdminPracticeSupportLittleHouseAllocationGuidelinesDto`
  - `AdminPracticeSupportHeartIncenseDto`
  - `AdminPracticeSupportNameChangeRitualDto`
  - `AdminPracticeSupportFetalKarmaResolutionDto`
  - `AdminPracticeSupportRecitationGuideDto`
  - `AdminPracticeSupportLifeReleaseSelectionGuideDto`
  - `AdminPracticeSupportVietnamHomePracticeGuideDto`

## JSON Schema Artifacts
- `design/04-execution-overlay/api/schemas/practice-support-playbook.schema.json`
- `design/04-execution-overlay/api/schemas/practice-support.seed.vi.json`

## Notes for AI/codegen
- Không để FE tự parse prose dài để build checklist/rules.
- Không map edge cases vào hardcoded text trong component.
- Rule items phải có `ruleCode`, `severity`, `description` để chạy filter và warning banner nhất quán.
