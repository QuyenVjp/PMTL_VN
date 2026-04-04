---
name: pmtl-domain-design-writer
description: converts pmtl business rule specifications (BRD) into USE_CASE design documentation files inside design/03-domains/. use when the user provides spiritual business logic, practice rules, or domain constraints and asks you to document them — without writing application code. produces one .md file per use case, placed in the correct domain folder, following the canonical pmtl use-case template.
---

# PMTL Domain Design Writer

## Purpose

This skill converts incoming BRD (Business Requirements Documents) describing spiritual business rules of the Pháp Môn Tâm Linh (Guan Yin Citta Dharma Door) platform into structured USE_CASE `.md` files inside `design/03-domains/`.

**Output = design docs only. No TypeScript, no Prisma migrations, no application code.**

---

## When to Use

- User pastes a batch of spiritual/practice business rules and says "viết design", "fix folder design", "không cần code" or similar.
- User provides Phase N BRD specifications to be turned into design documentation.
- User wants to extend the `design/03-domains/` source-of-truth without touching `apps/`.

## When NOT to Use

- User explicitly asks for code implementation → use `pmtl-api-builder` or `pmtl-web-builder` instead.
- User asks for Prisma schema migration → use `pmtl-data-runtime-keeper`.

---

## Domain → Folder Mapping

Always place files in the narrowest matching domain:

| Business concern | Folder |
|---|---|
| User identity, name change, spiritual forms, aliases | `design/03-domains/identity/USE_CASES/` |
| Altar management, oil/water/incense offerings, phóng sinh, Ngũ Đại Pháp Bảo | `design/03-domains/vows-merit/USE_CASES/` |
| Ngôi Nhà Nhỏ (NNN), Little House chanting, burn sessions, debt ledger, dreams | `design/03-domains/engagement/USE_CASES/` |
| E-reader, sutra content, PDF guides, spiritual application forms | `design/03-domains/content/USE_CASES/` |
| Daily recitation system, Q&A wisdom, diet scanner, career presets | `design/03-domains/wisdom-qa/USE_CASES/` |
| Testimonials, community posts, karmic disclaimers | `design/03-domains/community/USE_CASES/` |
| Calendar, lunar/solar scheduling, hotline hours, DST | `design/03-domains/calendar/USE_CASES/` |
| Contact, external booking, Totem hotline | `design/03-domains/contact/USE_CASES/` |

If a logic spans 2 domains, place it in the **primary owner** domain and add a `Related` link to the secondary.

---

## File Naming Convention

```
kebab-case describing the constraint or flow.md
```

Examples:
- `single-fruit-plate-constraint.md`
- `offered-oil-vegan-cooking-guard.md`
- `little-house-sky-facing-burn-gate.md`
- `ereader-bedroom-device-reminder.md`

---

## Canonical USE_CASE File Template

Every file MUST follow this structure in this order:

```markdown
# [Tên tiếng Việt — English Name]

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh ([Nguồn số hoặc tên tài liệu])
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** [YYYY-MM-DD]

---

## Purpose

[1–3 câu giải thích tại sao rule này tồn tại và hậu quả nếu vi phạm theo giáo lý]

---

## Owner module

`[domain-name]` — [Model hoặc Service chủ]
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — [role của người dùng]
- `system` — [role của hệ thống]

---

## Trigger

[Khi nào rule này được kích hoạt]

---

## Business Rules

[Bảng điều kiện → hành động. Luôn dùng ✅ / ❌ / ⚠️]

| Điều kiện | Hành động |
|---|---|
| ... | ✅ ALLOWED / ❌ FORBIDDEN / ⚠️ WARNING |

---

## Input Contract

[DTO fields với types — dùng code block ```]

---

## Write Path

[Pseudocode API flow — dùng code block ```. Bao gồm endpoint, validation steps, error throws, và DB operations]

---

## FE Behavior

[ASCII wireframe của modal/banner/checklist/toast. Mô tả khi nào disable/enable button. Tooltip text.]

---

## Schema Notes

[Prisma model snippet — dùng code block ```prisma. Chỉ các fields liên quan đến use case này.]

---

## Audit

| Action | Trigger |
|---|---|
| `domain.entity.action` | Khi nào |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| ... | `snake_case_code` | 4xx |

---

## Notes for AI/codegen

[Bullet points về implementation gotchas, edge cases, Phase 2+ considerations]

---

## Related

- [other-use-case.md](./other-use-case.md) — brief description
```

---

## Grouping Rules

When a BRD provides multiple logics, group them into files as follows:

- **1 logic = 1 file** (default)
- **Group into 1 file** only when logics are inseparable at the service layer (e.g., oil type validation + water validation both in `AltarOfferingService`) — use Part A / Part B headers
- **Never merge** logics from different domains into a single file
- If a logic is already documented in a prior phase, add a `Related` link instead of duplicating

---

## Execution Workflow

When given a batch of BRD rules:

1. **Read and categorize** each logic → identify owner domain.
2. **Check for existing files** in that domain folder that might already cover the logic partially.
   - Use `Glob design/03-domains/[domain]/USE_CASES/*.md` or `find` to list all existing files.
   - **If a matching file exists → EDIT it** (add new rules, update tables, extend FE behavior section). Do NOT create a duplicate.
   - **If no matching file exists → CREATE** a new file with the canonical template.
   - If in doubt: scan file name AND first 20 lines for matching purpose before deciding.
3. **Plan files** — list filenames + "exists/new" decision before writing (do not write blindly).
4. **Write/Edit files in parallel batches** (3–4 at a time): use `Edit` tool for existing files, `Write` tool for new files.
5. **After each batch**, skip `pnpm typecheck` — only `.md` files were touched. State this explicitly to satisfy any stop hooks.
6. **Do not** create new domain folders, new `CONTRACTS.md`, or new `REFERENCES/` files unless explicitly asked.
7. **Do not** write TypeScript, Prisma migrations, or NestJS code — those go in separate sessions.

### Anti-Lazy Rule (MANDATORY)

> **NEVER create a new file when an existing file already covers the same domain + constraint area.**

The test: ask yourself — "Does an existing file in this domain describe the same service/guard/entity?" If yes → EDIT, not CREATE.

Red flags that mean you are being lazy:
- Creating `face-down-device-v2.md` when `face-down-device.md` exists.
- Creating `burn-container-rules.md` when `burn-container-altitude-constraint.md` and `burn-container-sanitization-protocol.md` already exist.
- Creating a new Phase-level root BRD file (`design/BRD_PHASE_XX.md`) instead of breaking logics into per-domain USE_CASE files.

**Root-level BRD files (`design/BRD_PHASE_XX.md`) are acceptable ONLY as a one-time source-of-truth snapshot. They MUST still be broken down into per-domain USE_CASE files — one per logic — in `design/03-domains/`.**

---

## Tone and Language Rules

- Business rules in **Vietnamese** (tiếng Việt đầy đủ dấu).
- Technical identifiers (field names, HTTP codes, enum values, DTO names) in **English**.
- Prisma model names in **PascalCase**.
- Enum values in **SCREAMING_SNAKE_CASE**.
- API endpoints in **REST style**: `POST /api/{domain}/{resource}`.
- Error codes in **snake_case** matching the domain: `mixed_fruit_plate_forbidden`, `oil_meat_cooking_forbidden`.
- FE wireframes in **ASCII art** — no images, no external tools.

---

## Special Patterns to Know

### Hard Gate vs Soft Warning

- **Hard gate** (block user until confirmed): Use checkbox DTO field (`boolean`, validated server-side = true). Returns 4xx if false.
- **Soft warning** (inform but allow): Flash modal with dismiss. Return `warning` field in response but do not block.

### Session-scoped vs Persistent

- `sessionStorage` for one-time-per-session confirmations (hygiene gate, memorization mode warning).
- DB model for anything that needs audit trail or analytics.

### Atomic patterns

- "Replace all or nothing" = Zod `z.literal("CLEAR_ALL_AND_REPLACE")` in DTO.
- "Single type per slot" = query `distinct` before insert at service layer, not DB constraint alone.

### Dynamic Prayer / Template Injection

- When a prayer text depends on user input (temple name, recipient name), store `prayerPayload: Json` in DB.
- Generate via a pure function `generatePrayer(dto): string` — do not inline string concat in controller.

### Stateless vs Stateful responses

- Blessing toast, notification payload = stateless — return in response body, do not persist.
- Audit logs, session confirmations = stateful — persist to DB.

---

## Schema Note Conventions

When writing Schema Notes:

- Show only **new fields** being added, not the full existing model.
- Use `// ... existing fields ...` comment for existing content.
- Include migration hint as a comment: `// Migration: ALTER TABLE "X" ADD COLUMN "y" TYPE`
- Mark nullable fields with `?` and explain why.
- Never include `@@map`, `@@schema`, or advanced Prisma directives unless the use case requires them.

---

## Verification Rule

**After writing `.md` files only**: skip `pnpm typecheck`. State explicitly:
> "Chỉ `.md` files — skip typecheck."

**If stop hook fires**: run `pnpm typecheck 2>&1 | tail -5` once to satisfy it, then note that failures are pre-existing from prior sessions, not from this session's `.md` changes.

---

## Example: Minimal Correct File

```markdown
# Ràng Buộc Một Loại Trái Cây Mỗi Đĩa — Single-Fruit Plate Constraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mỗi đĩa trái cây trên bàn thờ CHỈ ĐƯỢC PHÉP chứa một loại quả duy nhất.
Trộn lẫn nhiều loại trên cùng một đĩa là sai giáo lý.

---

## Owner module

`vows-merit` — AltarOfferingItem / AltarPlate

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Đĩa có 1 loại quả (bất kỳ số lượng) | ✅ ALLOWED |
| Đĩa có 2+ loại quả | ❌ REJECTED — 400 BadRequest |

---

## Write Path

POST /api/vows-merit/altar-offerings/fruit-plates
1. Load existingTypes = distinct fruitType WHERE plateIndex = X AND status = ACTIVE
2. If existingTypes.length > 0 AND existingTypes[0] !== payload.fruitType:
   → throw 400 { error: "mixed_fruit_plate_forbidden" }
3. Insert AltarOfferingItem.

---

## Schema Notes

model AltarOfferingItem {
  // ... existing fields ...
  @@unique([userId, plateIndex, fruitType, status])
}

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Mixed fruit types | mixed_fruit_plate_forbidden | 400 |
```

---

## References

- `design/03-domains/` — all existing USE_CASE files as living examples
- `design/03-domains/vows-merit/CONTRACTS.md` — vows-merit public contract
- `CLAUDE.md` — repo operating contract (Treat `design/` as source of truth)
