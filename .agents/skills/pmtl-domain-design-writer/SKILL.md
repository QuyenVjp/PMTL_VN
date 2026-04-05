---
name: pmtl-domain-design-writer
description: Use when converting PMTL business rules (BRD) into design documentation — user provides spiritual constraints and says "write design", "design docs", or provides Phase N BRD. Triggers skill check BEFORE creating any .md file in design/03-domains/
---

# PMTL Domain Design Writer

## Overview

Convert PMTL (Pháp Môn Tâm Linh) business rule specifications into structured USE_CASE `.md` documentation files placed in `design/03-domains/`. Output is design specification only — no TypeScript, no Prisma, no application code.

## When to Use

```
User provides BRD rules?
    → Yes: Check domain + file exists before writing
           ↓
    → No: This skill does not apply
```

**Triggers:**
- User pastes Phase N BRD with spiritual/practice rules
- User says "write design", "design docs", "fix design folder"
- User provides batch of constraint rules for documentation
- User asks to extend `design/03-domains/` specification

**When NOT to use:**
- User asks for code implementation → use `pmtl-api-builder` or `pmtl-web-builder`
- User asks for schema migration → use `pmtl-data-runtime-keeper`

---

## Mandatory Workflow (MUST follow in order)

1. **READ THIS SKILL FIRST** — do not skip to step 2
2. **Categorize each logic** → identify owner domain (11 domains table below)
3. **Check for existing files** → use Glob to list domain folder
   - File exists + covers logic? → EDIT (add to existing)
   - File exists + different logic? → CREATE new
   - No file? → CREATE new
4. **Plan before writing** — list filenames + "exists/new" status
5. **Write/edit in batches** → 3–4 files max per batch
6. **Skip typecheck** — state explicitly "Only `.md` files"

---

## Domain Mapping (Read before categorizing)

| Business Concern | Folder |
|---|---|
| Identity, name change, spiritual forms | `identity/USE_CASES/` |
| Altar, oil, water, incense, phóng sinh | `altar-management/USE_CASES/` |
| Little House (NNN), burn sessions, debt | `engagement/USE_CASES/` |
| E-reader, sutras, PDFs, forms | `content/USE_CASES/` |
| Recitation, Q&A, diet, career | `wisdom-qa/USE_CASES/` |
| Testimonials, community posts | `community/USE_CASES/` |
| Calendar, lunar, scheduling | `calendar/USE_CASES/` |
| Hotline, contact, booking | `contact/USE_CASES/` |

**If spanning 2 domains: place in PRIMARY owner, add Related link to secondary.**

---

## File Naming + Template

**Name:** `kebab-case-describing-constraint.md`

**Every file MUST include (in order):**
```
# Tên Việt — English Name
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** YYYY-MM-DD

## Purpose / Owner module / Actors / Trigger / Business Rules
## Input Contract / Write Path / FE Behavior / Schema Notes
## Audit / Errors / Notes for AI/codegen / Related
```

---

## Rationalization Table: Why Agents Skip This Skill

| Excuse | Reality |
|--------|---------|
| "Pattern is obvious" | Obvious ≠ documented. Use case rules evolve. Read skill. |
| "I'll check domain later" | Wrong domain = merge confusion. Check BEFORE writing. |
| "Template exists, I know it" | Template ≠ rules. Skill documents edge cases templates miss. |
| "Just start, optimize later" | Creating first = missing anti-lazy checks. Plan first. |
| "No time for pre-flight" | Pre-flight takes 2 min. Wrong domain = 1 hour refactor. |
| "Use existing files as reference" | Examples show patterns, not rules. Skill shows rules. |
| "Can parallelize file creation" | Yes, BUT only after planning phase. Never plan + write together. |

---

## Red Flags (STOP if you see these)

- About to create file WITHOUT opening Glob to check if it exists in domain
- About to create file WITHOUT identifying owner domain first
- About to write 5+ files in one batch
- About to skip planning step ("just start writing")
- Created file in wrong domain (e.g., engagement rule in altar-management)
- Domain folder has SIMILAR file but you decided to create new instead of EDIT
- Thinking "I'll use this file as reference for the next one" (no — read skill for each)

**All of these mean: STOP. Re-read this skill. Start workflow from step 1.**

---

## Anti-Lazy Rule (MANDATORY)

**NEVER create a new file when existing file in same domain covers the same constraint area.**

Test: "Does a file in this domain describe the same service/guard?"
- Yes → EDIT existing file (add table row, extend FE section)
- No → CREATE new file

Examples of lazy creation (forbidden):
- Create `burn-container-rules.md` when `burn-container-altitude-constraint.md` exists
- Create `face-down-device-v2.md` when `face-down-device.md` exists
- Create Phase-level BRD file instead of per-domain USE_CASE files

---

## Tone Requirements

- **Business rules:** Vietnamese (full diacritics)
- **Technical IDs:** English (field names, enum values, endpoints)
- **Enum values:** `SCREAMING_SNAKE_CASE`
- **Error codes:** `snake_case` matching domain
- **FE wireframes:** ASCII art (no external tools)

---

## Schema Notes Pattern

Show ONLY new fields:
```prisma
model ExampleEntity {
  // ... existing fields ...
  newField: Type
  // Migration: ALTER TABLE "table" ADD COLUMN ...
}
```

---

## Verification Rule

After writing `.md` files only:
> "Chỉ `.md` files — skip typecheck."

Do NOT run `pnpm typecheck` after design-only sessions.

---

## References

- `design/03-domains/` — living USE_CASE examples
- `design/05-references/brd-research/INDEX.md` — phase distribution map
- Full template guide: existing skill file (detailed reference)
