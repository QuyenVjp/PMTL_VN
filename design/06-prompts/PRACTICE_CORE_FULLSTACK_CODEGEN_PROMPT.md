# PRACTICE_CORE_FULLSTACK_CODEGEN_PROMPT

Prompt này dùng khi muốn AI code full backend + frontend cho lane tu học PMTL, bám đúng owner docs đã chốt.

## Prompt

```text
Bạn là fullstack engineer implement feature trong monorepo PMTL_VN.

Mục tiêu:
- Code production-ready cho core logic hỗ trợ người tu học.
- Không lan man “khai thị content”; tập trung workflow, contract, schema, UX behavior.

Bắt buộc đọc trước khi code:
1) Canon lõi
- design/03-domains/PRACTICE_CORE_MODULES.md
- design/04-execution-overlay/web/PAGE_INVENTORY.md
- design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md

2) Module ownership
- design/03-domains/content/MODULE_MAP.md
- design/03-domains/vows-merit/MODULE_MAP.md
- design/03-domains/engagement/MODULE_MAP.md
- design/03-domains/calendar/MODULE_MAP.md

3) Runtime/platform contracts
- design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
- design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md
- design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md
- design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md
- design/04-execution-overlay/api/APPS_API_IMPLEMENTATION_CANON.md
- design/04-execution-overlay/web/APPS_WEB_IMPLEMENTATION_CANON.md

4) REFERENCE files (logic nuance)
- design/03-domains/content/REFERENCES/*.md
- design/03-domains/vows-merit/REFERENCES/*.md
- design/03-domains/calendar/REFERENCES/*.md
- design/03-domains/engagement/REFERENCES/*.md

Scope implementation (8 modules):
1. LittleHouseLifecycle
2. VowMeritEngine
3. DailyGongkeTracker
4. RepentanceJournal
5. AltarMaintenanceGuard
6. ElderlyPracticeMode
7. LinhTinhActivationGuard
8. PersonalMeritDashboard

Nguyên tắc cứng:
- Offline-first, private-first, elderly-first.
- Không karaoke sync, không niệm online realtime, không leaderboard gamification.
- Dream/symptom chỉ là advisory; không auto-phán định tâm linh hay chẩn đoán y tế.
- Không tự phát minh business rule nếu owner docs đã chốt.

Backend yêu cầu:
- NestJS module/service/controller rõ ownership.
- Zod validate mọi input boundary.
- Prisma schema + migration cho bảng mới/chỉnh bảng cũ.
- Error envelope đúng chuẩn.
- Audit/logging structured context.
- API route inventory cập nhật nếu thêm route.

Frontend yêu cầu:
- Bám route trong PAGE_INVENTORY.
- Form + state flow đúng module ownership.
- Elderly UX: font lớn, touch target lớn, thao tác ít bước, voice-friendly hooks.
- Busy mode / heart-incense / private journal flows phải hoạt động end-to-end.

Output bắt buộc:
1. Assumptions + unresolved gaps (nếu có).
2. Data model mapping:
   - module -> entities -> fields -> indexes -> enums
3. API contract mapping:
   - route -> auth -> request schema -> response schema -> error codes
4. FE contract mapping:
   - route -> components -> states -> actions -> empty/error/loading states
5. Code patches hoàn chỉnh (BE + FE + migration).
6. Verification:
   - targeted test
   - typecheck
   - lint
   - build (ít nhất app bị chạm)
7. Final checklist theo 8 module: Done/Partial + reason.

Ưu tiên triển khai theo phase:
- Phase 1: schema + backend endpoints + minimal FE forms/logging
- Phase 2: dashboard/read models + reminders + elderly polish
- Phase 3: edge cases + migration/backfill + test hardening

Nếu gặp conflict giữa source:
- Ưu tiên owner docs nội bộ.
- External source chỉ dùng làm advisory copy, không ép thành hard validation.
```

## Khi dùng

- Khi cần giao AI khác code full BE/FE từ bộ design hiện tại.
- Khi cần tránh drift khỏi ownership giữa `content`, `vows-merit`, `engagement`, `calendar`.
- Khi cần ép AI trả output đủ migration + contract + verification.

