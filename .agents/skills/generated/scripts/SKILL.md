---
name: scripts
description: "Skill for the Scripts area of PMTL_VN. 71 symbols across 10 files."
---

# Scripts

71 symbols | 10 files | Cohesion: 97%

## When to Use

- Working with code in `infra/`
- Understanding how slugify, collapse_whitespace, strip_cjk work
- Modifying scripts-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `infra/scripts/extract_practice_pdfs.py` | slugify, collapse_whitespace, strip_cjk, is_vietnamese_friendly_line, vietnamese_only_text (+19) |
| `infra/scripts/dev.ts` | fail, ensureDockerInstalled, ensureDockerDaemonReady, ensureDockerEnvFile, buildComposeArgs (+5) |
| `infra/scripts/admin-smoke.ts` | ensureOutputDir, extractRoutes, login, resolveBrowserExecutable, main (+4) |
| `infra/scripts/ensure-port-free.ts` | parsePort, getListeningPidsWindows, getListeningPidsUnix, getListeningPids, killPid (+3) |
| `infra/scripts/smoke-test.ts` | sleep, waitForService, isRetryableError, expectJson, warmUpEndpoint (+2) |
| `infra/scripts/test-monitoring.ts` | fetchJson, requireOk, checkPrometheusTargets, triggerSentryTest, checkAlertSinkDelivery (+1) |
| `infra/scripts/reset-dev-db.ts` | parseEnvFile, runDockerCompose, main |
| `apps/api/scripts/prepare-test-db.mjs` | ensureDatabase, main |
| `infra/scripts/test-telegram.ts` | main |
| `infra/scripts/env-utils.ts` | isPlaceholderEnvValue |

## Entry Points

Start here when exploring this area:

- **`slugify`** (Function) — `infra/scripts/extract_practice_pdfs.py:98`
- **`collapse_whitespace`** (Function) — `infra/scripts/extract_practice_pdfs.py:106`
- **`strip_cjk`** (Function) — `infra/scripts/extract_practice_pdfs.py:110`
- **`is_vietnamese_friendly_line`** (Function) — `infra/scripts/extract_practice_pdfs.py:114`
- **`vietnamese_only_text`** (Function) — `infra/scripts/extract_practice_pdfs.py:139`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `slugify` | Function | `infra/scripts/extract_practice_pdfs.py` | 98 |
| `collapse_whitespace` | Function | `infra/scripts/extract_practice_pdfs.py` | 106 |
| `strip_cjk` | Function | `infra/scripts/extract_practice_pdfs.py` | 110 |
| `is_vietnamese_friendly_line` | Function | `infra/scripts/extract_practice_pdfs.py` | 114 |
| `vietnamese_only_text` | Function | `infra/scripts/extract_practice_pdfs.py` | 139 |
| `detect_flow_hints` | Function | `infra/scripts/extract_practice_pdfs.py` | 194 |
| `detect_business_signals` | Function | `infra/scripts/extract_practice_pdfs.py` | 205 |
| `detect_presentation_mode` | Function | `infra/scripts/extract_practice_pdfs.py` | 216 |
| `page_extraction_method` | Function | `infra/scripts/extract_practice_pdfs.py` | 227 |
| `page_confidence` | Function | `infra/scripts/extract_practice_pdfs.py` | 239 |
| `document_source_type` | Function | `infra/scripts/extract_practice_pdfs.py` | 250 |
| `document_extraction_method` | Function | `infra/scripts/extract_practice_pdfs.py` | 258 |
| `document_confidence` | Function | `infra/scripts/extract_practice_pdfs.py` | 266 |
| `document_needs_review` | Function | `infra/scripts/extract_practice_pdfs.py` | 276 |
| `render_page` | Function | `infra/scripts/extract_practice_pdfs.py` | 284 |
| `extract_document` | Function | `infra/scripts/extract_practice_pdfs.py` | 290 |
| `build_markdown_document` | Function | `infra/scripts/extract_practice_pdfs.py` | 412 |
| `ensure_tessdata` | Function | `infra/scripts/extract_practice_pdfs.py` | 148 |
| `configure_tesseract` | Function | `infra/scripts/extract_practice_pdfs.py` | 160 |
| `ensure_language_file` | Function | `infra/scripts/extract_practice_pdfs.py` | 170 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → Ensure_tessdata` | intra_community | 3 |
| `Main → Ensure_language_file` | intra_community | 3 |
| `Main → Slugify` | cross_community | 3 |
| `Main → Detect_presentation_mode` | cross_community | 3 |
| `Main → Render_page` | cross_community | 3 |
| `Main → Collapse_whitespace` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "slugify"})` — see callers and callees
2. `gitnexus_query({query: "scripts"})` — find related execution flows
3. Read key files listed above for implementation details
