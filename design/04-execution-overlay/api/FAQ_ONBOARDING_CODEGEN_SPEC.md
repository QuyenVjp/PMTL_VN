# FAQ + Onboarding Codegen Spec (Chapter 10-13)

## Scope
- Mục tiêu: chuyển chapter 10-13 thành contract machine-readable cho BE/FE codegen.
- Surface:
  - FAQ handbook aggregate (chapter 10 + chapter 11 + chapter 12).
  - Onboarding roadmap aggregate (chapter 13).

## Route Canon
- Public:
  - `GET /content/newcomer/faq-handbook`
  - `GET /content/newcomer/onboarding-roadmap`
  - `GET /content/newcomer/case-studies`
  - `GET /content/newcomer/case-studies/:slug`
- Admin:
  - `GET /admin/content/newcomer/faq-handbook`
  - `PATCH /admin/content/newcomer/faq-handbook`
  - `GET /admin/content/newcomer/onboarding-roadmap`
  - `PATCH /admin/content/newcomer/onboarding-roadmap`
  - `GET /admin/content/newcomer/case-studies`
  - `POST /admin/content/newcomer/case-studies`
  - `PATCH /admin/content/newcomer/case-studies/:publicId`

## DTO Canon
- Public:
  - `NewcomerFaqHandbookDto`
  - `NewcomerOnboardingRoadmapDto`
- Admin:
  - `AdminNewcomerFaqHandbookDto`
  - `AdminNewcomerOnboardingRoadmapDto`

## JSON Schema Artifacts
- `design/04-execution-overlay/api/schemas/faq-handbook.schema.json`
- `design/04-execution-overlay/api/schemas/onboarding-roadmap.schema.json`
- Seed data:
  - `design/04-execution-overlay/api/schemas/chapter10-13.seed.vi.json`

## Zod Naming Canon
- Request schemas:
  - `newcomerFaqHandbookQuerySchema`
  - `newcomerOnboardingRoadmapQuerySchema`
  - `adminNewcomerFaqHandbookPatchSchema`
  - `adminNewcomerOnboardingRoadmapPatchSchema`
  - `adminNewcomerCaseStudyUpsertSchema`
- Response schemas:
  - `newcomerFaqHandbookDtoSchema`
  - `newcomerOnboardingRoadmapDtoSchema`
  - `newcomerFaqEntrySchema`
  - `newcomerCaseStudySchema`
  - `newcomerRoadmapWeekSchema`
  - `newcomerRoadmapTaskSchema`

## Generation Notes
- FE:
  - render tab sections từ `faqSections[]`
  - render searchable FAQ list từ `faqEntries[]`
  - render case cards từ `caseStudies[]`
  - render week timeline/checklist từ `weeks[]`
- BE:
  - giữ aggregate read model ổn định, không expose raw editorial storage
  - mọi mutation admin phải bump `updatedAt` và `versionNote` khi thay logic wording

## Notes for AI/codegen
- Không tách riêng chapter 10/11/12 thành route public nhỏ lẻ nếu chưa có owner update.
- Không để FE tự ráp FAQ handbook từ nhiều `beginner_guides` records ở client.
- Nếu cần partial loading, vẫn phải giữ schema payload tương thích (backward-compatible fields).
