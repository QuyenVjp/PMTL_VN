# SUPER PROMPT — PMTL_VN Practice Support Home Guide (API + Admin Only)

> Dùng prompt này để giao cho Claude Code hoặc AI agent scaffold và hoàn thiện **API + Admin** cho `practice-support/vietnam-home-practice-guide`.
> `apps/web` **KHÔNG nằm trong scope**. Không sửa web frontend trong task này.

---

## 0. MISSION

Hoàn thiện 2 phần sau, end-to-end, theo đúng canon repo:

1. **Scaffold API đọc `practice-support/vietnam-home-practice-guide` với field mới**
2. **Nối admin editor cho**
   - `vegetarianDisciplineRules`
   - `officeNutritionNotes`
   - `supplementalDietNotes`

### Out of scope
- Không sửa `apps/web`
- Không build page public mới
- Không tự mở rộng sang các practice-support khác nếu không cần cho `vietnam-home-practice-guide`

---

## 1. CONTEXT BẮT BUỘC — ĐỌC TRƯỚC KHI CODE

Đọc theo thứ tự:

```text
1. AGENTS.md
2. TEAM_GUIDE.md
3. apps/api/AGENTS.override.md
4. apps/admin/AGENTS.override.md
5. design/03-domains/content/REFERENCES/PRACTICE-SUPPORT-REFERENCE.MD
6. design/03-domains/content/REFERENCES/SACRED-ITEMS-AND-PROTECTION-CARD-RULES.md
7. design/03-domains/vows-merit/REFERENCES/VEGETARIAN-PRACTICE-AND-VOW-GUIDE.md
8. design/03-domains/wisdom-qa/REFERENCES/AFFINITY-WITH-BUDDHISM-NOTES.md
9. design/03-domains/content/REFERENCES/NIEM-KINH-CORE-RULES.md
10. design/03-domains/vows-merit/REFERENCES/HEART-INCENSE-GUIDE.md
11. design/04-execution-overlay/api/PRACTICE_SUPPORT_CODEGEN_SPEC.md
12. design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md
13. design/04-execution-overlay/api/API_ROUTE_INVENTORY.md
14. design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md
15. design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md
16. design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md
17. design/04-execution-overlay/api/AUDIT_POLICY.md
18. design/04-execution-overlay/api/schemas/practice-support-playbook.schema.json
19. design/04-execution-overlay/api/schemas/practice-support.seed.vi.json
20. apps/api/prisma/schema.prisma
```

Nếu design, code, và prompt mâu thuẫn nhau:
- `design/` thắng
- rồi tới `AGENTS.md`
- rồi mới tới prompt này

---

## 2. CORNHUB-FIRST RULE — BẮT BUỘC

Với task này, agent phải dùng CornHub trước khi sửa code:

1. `corn_detect_changes`
2. `corn_code_search` để tìm entry point practice-support API/admin
3. `corn_code_context` cho symbol/service/controller/query feature liên quan
4. `corn_code_impact` trước khi sửa shared DTOs, schemas, validators, admin feature wiring
5. Sau khi xong:
   - `corn_quality_report`
   - `corn_session_end`

Nếu CornHub không trả đủ kết quả:
- nói rõ ngắn gọn
- rồi fallback sang direct file inspection

---

## 3. TECH STACK & CONSTRAINTS

### Backend (`apps/api`)
- NestJS
- Zod validation, không dùng class-validator
- Prisma 7
- `?? null` trong `create.data` / `update.data` khi field optional
- pino structured logging
- AppError hierarchy + GlobalExceptionFilter hiện có
- Audit bắt buộc cho mọi `PATCH`
- Response envelope chuẩn:
  - detail/action: `{ data: {...} }`
  - delete: `204`

### Admin (`apps/admin`)
- React + Vite + TypeScript
- TanStack Query v5
- TanStack Router
- shadcn/ui
- business logic không đặt trong page component
- query ở `queries.ts`
- mutation ở `mutations.ts`
- `adminClient` từ `@/lib/api/admin-client`
- `handleApiError` cho mọi mutation
- tiếng Việt đầy đủ dấu

### Scope discipline
- Không đụng `apps/web`
- Không refactor unrelated practice-support owners
- Không đổi design canon trừ khi phát hiện sai rõ ràng và có lý do

---

## 4. CURRENT CANON — FIELD MỚI ĐÃ CÓ TRONG DESIGN

`PracticeSupportVietnamHomePracticeGuideDto` hiện phải support:

```text
publicId
slug
title
overview
homeAltarRules[]
heartIncenseFallbackRules[]
littleHouseDisciplineRules[]
familyCoordinationRules[]
sacredItemRules[]
accidentalViolationRecovery[]
vegetarianDisciplineRules[]
officeNutritionNotes[]
supplementalDietNotes[]
complianceAndEthicsRules[]
updatedAt
```

Trong task này, trọng tâm UI/admin là:
- `vegetarianDisciplineRules[]`
- `officeNutritionNotes[]`
- `supplementalDietNotes[]`

Nhưng API detail phải trả **đủ toàn bộ shape canon** của `vietnam-home-practice-guide`, không chỉ 3 field mới.

---

## 5. PHASE 1 — API READ + ADMIN READ/PATCH

### Mục tiêu
Hoàn thiện owner lane cho:

```text
GET   /content/practice-support/vietnam-home-practice-guide
GET   /admin/content/practice-support/vietnam-home-practice-guide
PATCH /admin/content/practice-support/vietnam-home-practice-guide
```

### Yêu cầu backend

Agent phải:

1. Tìm implementation hiện có cho `practice-support`
2. Nếu đã có aggregate service/repository:
   - mở rộng đúng lane hiện có
3. Nếu route đã tồn tại nhưng chưa trả đủ field:
   - sửa DTO/schema/mapper/service để trả đủ canon mới
4. `PATCH` admin phải validate runtime cho:
   - `vegetarianDisciplineRules[]`
   - `officeNutritionNotes[]`
   - `supplementalDietNotes[]`
5. `PATCH` phải append audit log đúng policy
6. Không hardcode response rời khỏi source canonical seed/mapping layer nếu repo đã có source load pattern

### Validation rules

#### `vegetarianDisciplineRules[]`
- array of rule items
- mỗi item có:
  - `ruleCode`
  - `label`
  - `description`
  - `severity`

#### `officeNutritionNotes[]`
- array of non-empty strings
- giữ đây là guidance note, không biến thành object phức tạp nếu design chưa yêu cầu

#### `supplementalDietNotes[]`
- array of non-empty strings
- phải giữ boundary:
  - đây là `supplemental`
  - không được upgrade thành `source-backed hard rule`

### Acceptance criteria Phase 1
- [ ] Public GET trả đủ shape canon
- [ ] Admin GET trả đủ shape canon + review metadata nếu lane admin owner cần
- [ ] Admin PATCH update được 3 field mới
- [ ] Zod validation pass
- [ ] Audit log có append
- [ ] API tests hoặc targeted verification pass

---

## 6. PHASE 2 — ADMIN EDITOR

### Mục tiêu
Nối admin editor cho `vietnam-home-practice-guide` để editor sửa được 3 field mới.

### UI scope
Agent phải tìm đúng feature admin owner hiện có cho `practice-support` hoặc scaffold đúng pattern repo nếu chưa có:

```text
queries.ts
mutations.ts
index.tsx
```

### Yêu cầu admin

1. Render và fetch được detail `vietnam-home-practice-guide`
2. Có form editor cho:
   - `vegetarianDisciplineRules[]`
   - `officeNutritionNotes[]`
   - `supplementalDietNotes[]`
3. Với `vegetarianDisciplineRules[]`
   - cho phép add/remove item
   - edit `ruleCode`, `label`, `description`, `severity`
4. Với `officeNutritionNotes[]`
   - add/remove string rows
5. Với `supplementalDietNotes[]`
   - add/remove string rows
6. Submit qua mutation chuẩn
7. `onError: handleApiError`
8. `toast.success` tiếng Việt đầy đủ dấu
9. invalidate query key đúng

### UI boundary rules
- Không được biến page thành prose editor freeform
- Đây là structured editor, không WYSIWYG
- Không nhét business logic vào component top-level
- Không tạo widget lạ ngoài design/admin canon

### Acceptance criteria Phase 2
- [ ] Admin load được record `vietnam-home-practice-guide`
- [ ] Edit/save được 3 field mới
- [ ] Refresh lại thấy dữ liệu mới
- [ ] Không có type error
- [ ] Không có console error ở admin flow này

---

## 7. FILE DISCOVERY EXPECTATION

Trước khi sửa, agent phải tự tìm và xác định:

### API likely areas
```text
apps/api/src/modules/content/
apps/api/src/modules/content/practice-support/
apps/api/src/modules/content/...controller.ts
apps/api/src/modules/content/...service.ts
apps/api/src/modules/content/...repository.ts
apps/api/src/modules/content/...schemas.ts
```

### Admin likely areas
```text
apps/admin/src/features/
apps/admin/src/features/*practice*
apps/admin/src/features/*content*
apps/admin/src/routes/
```

Không được bịa file structure nếu repo đã có owner lane sẵn.

---

## 8. VERIFICATION — BẮT BUỘC

Ít nhất phải chạy:

```powershell
pnpm --filter @pmtl/api typecheck
pnpm --filter @pmtl/admin typecheck
```

Nếu có test target phù hợp, chạy thêm:

```powershell
pnpm --filter @pmtl/api test -- <target>
```

Nếu có admin smoke/route check chạm đúng flow này, chạy thêm targeted check.

Không được claim done nếu chưa verify.

---

## 9. FINAL OUTPUT FORMAT — BẮT BUỘC

Khi hoàn thành, agent phải report theo format này:

### Changed files
- liệt kê file đầy đủ

### API
- route nào đã hoàn thiện
- DTO/validation/audit thay đổi gì

### Admin
- editor nào đã nối
- field nào đã edit được

### Verification
- command đã chạy
- kết quả chính

### CornHub usage
- tools đã dùng
- nếu skip tool nào, nêu lý do

---

## 10. HARD FAIL CONDITIONS

Task bị coi là chưa đạt nếu rơi vào bất kỳ lỗi nào sau:

- đụng `apps/web`
- chỉ sửa design mà không sửa API/admin runtime
- chỉ sửa API mà không nối admin editor
- PATCH không có audit
- không có Zod validation
- không chạy typecheck
- nhét `supplementalDietNotes` thành hard rule source-backed
- tự ý thêm medical claims hoặc spiritual certainty claims

---

## 11. EXECUTE NOW

Thực hiện theo thứ tự:

1. đọc context bắt buộc
2. dùng CornHub
3. map đúng owner files
4. hoàn thiện API
5. hoàn thiện admin editor
6. verify
7. report đúng format

Không hỏi lại nếu repo đã cho đủ context. Chỉ dừng nếu gặp blocker thật sự.
