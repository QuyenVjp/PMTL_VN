# Encyclopedia 9-Parts Codegen Spec

## Scope
Đóng gói bản Bách khoa 9 phần thành package aggregate để BE/FE codegen chạy thẳng:
- chapter package
- onboarding 90 ngày
- glossary
- audio overview script

## Route Canon
- Public:
  - `GET /content/newcomer/encyclopedia`
  - `GET /content/newcomer/onboarding-90d`
  - `GET /content/newcomer/glossary`
  - `GET /content/newcomer/audio-overview`
- Admin:
  - `GET/PATCH /admin/content/newcomer/encyclopedia`
  - `GET/PATCH /admin/content/newcomer/onboarding-90d`
  - `GET/PATCH /admin/content/newcomer/glossary`
  - `GET/PATCH /admin/content/newcomer/audio-overview`

## DTO Canon
- Public:
  - `NewcomerEncyclopediaDto`
  - `NewcomerOnboarding90dDto`
  - `NewcomerGlossaryDto`
  - `NewcomerAudioOverviewDto`
- Admin:
  - `AdminNewcomerEncyclopediaDto`
  - `AdminNewcomerOnboarding90dDto`
  - `AdminNewcomerGlossaryDto`
  - `AdminNewcomerAudioOverviewDto`

## JSON Schema Artifacts
- `design/04-execution-overlay/api/schemas/newcomer-encyclopedia.schema.json`
- `design/04-execution-overlay/api/schemas/newcomer-encyclopedia.seed.vi.json`

## Notes for AI/codegen
- Không parse markdown dài trực tiếp ở FE.
- Không hardcode glossary/audio script trong component.
- Dùng refs trong encyclopedia package để prefetch FAQ/onboarding/case-study lanes đã có canon.
