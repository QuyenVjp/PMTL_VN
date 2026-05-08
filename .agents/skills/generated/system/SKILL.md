---
name: system
description: "Skill for the System area of PMTL_VN. 30 symbols across 21 files."
---

# System

30 symbols | 21 files | Cohesion: 88%

## When to Use

- Working with code in `apps/`
- Understanding how searchStatusOptions, useReindexMutation, useToggleTemplate work
- Modifying system-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/features/system/health-page.tsx` | statusLabel, statusBadgeClass, cardBorderClass, ComponentCard, HealthPage |
| `apps/admin/src/features/system/feature-flags-page.tsx` | statusBadge, FeatureFlagsPage, openToggleConfirm, closeConfirm |
| `apps/admin/src/features/system/mutations.ts` | useReindexMutation, useUpdateFeatureFlag |
| `apps/web/src/app/(member)/tu-tap/nha-nho/little-house-client.tsx` | doAdvance, doBurn |
| `apps/admin/src/features/system/search-queries.ts` | searchStatusOptions |
| `apps/admin/src/features/sacred-forms/mutations.ts` | useToggleTemplate |
| `apps/admin/src/features/workspaces/module-pages.tsx` | SearchOpsPage |
| `apps/admin/src/features/sacred-forms/index.tsx` | TemplateRowActions |
| `apps/admin/src/features/events/mutations.ts` | useCheckIn |
| `apps/admin/src/features/practice-support-home-guide/index.tsx` | handleSave |

## Entry Points

Start here when exploring this area:

- **`searchStatusOptions`** (Function) — `apps/admin/src/features/system/search-queries.ts:35`
- **`useReindexMutation`** (Function) — `apps/admin/src/features/system/mutations.ts:46`
- **`useToggleTemplate`** (Function) — `apps/admin/src/features/sacred-forms/mutations.ts:34`
- **`SearchOpsPage`** (Function) — `apps/admin/src/features/workspaces/module-pages.tsx:44`
- **`useCheckIn`** (Function) — `apps/admin/src/features/events/mutations.ts:32`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `searchStatusOptions` | Function | `apps/admin/src/features/system/search-queries.ts` | 35 |
| `useReindexMutation` | Function | `apps/admin/src/features/system/mutations.ts` | 46 |
| `useToggleTemplate` | Function | `apps/admin/src/features/sacred-forms/mutations.ts` | 34 |
| `SearchOpsPage` | Function | `apps/admin/src/features/workspaces/module-pages.tsx` | 44 |
| `useCheckIn` | Function | `apps/admin/src/features/events/mutations.ts` | 32 |
| `handleSave` | Function | `apps/admin/src/features/downloads/downloads-detail.tsx` | 98 |
| `handleSave` | Function | `apps/admin/src/features/contact-info/index.tsx` | 36 |
| `onSubmit` | Function | `apps/web/src/app/(member)/tu-tap/bai-tap/gongke-form.tsx` | 67 |
| `flagListOptions` | Function | `apps/admin/src/features/system/queries.ts` | 29 |
| `useUpdateFeatureFlag` | Function | `apps/admin/src/features/system/mutations.ts` | 18 |
| `FeatureFlagsPage` | Function | `apps/admin/src/features/system/feature-flags-page.tsx` | 27 |
| `openToggleConfirm` | Function | `apps/admin/src/features/system/feature-flags-page.tsx` | 55 |
| `closeConfirm` | Function | `apps/admin/src/features/system/feature-flags-page.tsx` | 64 |
| `healthExtendedOptions` | Function | `apps/admin/src/features/system/health-queries.ts` | 28 |
| `HealthPage` | Function | `apps/admin/src/features/system/health-page.tsx` | 59 |
| `list` | Method | `apps/api/src/platform/feature-flags/admin-feature-flags.controller.ts` | 39 |
| `TemplateRowActions` | Function | `apps/admin/src/features/sacred-forms/index.tsx` | 31 |
| `handleSave` | Function | `apps/admin/src/features/practice-support-home-guide/index.tsx` | 238 |
| `handleAdd` | Function | `apps/admin/src/features/media-library/index.tsx` | 868 |
| `handleSave` | Function | `apps/admin/src/features/media/index.tsx` | 476 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `FeatureFlagsPage → FindAll` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 3 calls |
| Health | 1 calls |

## How to Explore

1. `gitnexus_context({name: "searchStatusOptions"})` — see callers and callees
2. `gitnexus_query({query: "system"})` — find related execution flows
3. Read key files listed above for implementation details
