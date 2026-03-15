# PMTL_VN Design System

## Purpose

This file defines the visual contract for production UI work in `apps/web`.
Use it when adding or refactoring components so the interface stays warm, editorial, and structurally consistent.

## Core Vibe
- Editorial Buddhist tone, not generic SaaS.
- Warm surfaces over sterile white.
- Gold is an accent, not a flood fill.
- Typography should feel calm, ceremonial, and readable.
- Motion should support hierarchy, not distract from reading.

## Token Source
- Shared token source: `packages/shared/src/constants/design-tokens.ts`
- Tailwind wiring: `apps/web/tailwind.config.ts`
- Runtime CSS variables: `apps/web/src/app/globals.css`

## Color System

### Gold
Use gold for emphasis, actions, highlights, and sacred accents.
- `gold-50` `#FEF9EF`
- `gold-100` `#FCEFD1`
- `gold-200` `#F8DFA2`
- `gold-300` `#F1CA6A`
- `gold-400` `#E2B243`
- `gold-500` `#C9971F`
- `gold-600` `#A97C17`
- `gold-700` `#865E15`
- `gold-800` `#614313`
- `gold-900` `#3F2B0C`

### Cream
Use cream for soft backgrounds, supporting surfaces, and readable contrast.
- `cream-50` `#FFFDF8`
- `cream-100` `#FBF4E7`
- `cream-200` `#F3E6CF`
- `cream-300` `#EAD7B4`
- `cream-400` `#D9BC88`
- `cream-500` `#C6A060`
- `cream-600` `#A98244`
- `cream-700` `#826334`
- `cream-800` `#5C4527`
- `cream-900` `#392A18`

### Zen
Use zen tones for text, grounding surfaces, borders, and dark sections.
- `zen-50` `#F6F2EC`
- `zen-100` `#E7DED0`
- `zen-200` `#CDBEAA`
- `zen-300` `#B09B82`
- `zen-400` `#8B755E`
- `zen-500` `#685545`
- `zen-600` `#4E4035`
- `zen-700` `#392F28`
- `zen-800` `#261F1A`
- `zen-900` `#16110F`

## Typography
- Headings use the display font token and should feel composed, not aggressive.
- Body text should optimize for long reading sessions.
- Prefer these patterns:
  - page title: `text-3xl md:text-5xl ant-title`
  - section title: `section-title`
  - body copy: `text-base leading-relaxed text-muted-foreground`
  - labels/kickers: `ant-label`

## Motion
Available named animations:
- `animate-fade-in`
- `animate-slide-up`
- `animate-scale-in`

Rules:
- Use one primary entrance animation per section.
- Avoid stacking multiple looping effects.
- Keep hover motion subtle: lift, border shift, glow, or opacity only.

## Surface Patterns
Use existing utilities before inventing new panel styles.
- `surface-panel`
- `surface-panel-muted`
- `surface-panel-strong`
- `panel-shell`
- `panel-shell-emphasis`
- `panel-hover`

## Component Variants

### Button
Source: `apps/web/src/components/ui/button.tsx`
- `default`: primary action
- `sacred`: highlighted editorial CTA
- `outlineGlow`: restrained accent action
- `ghost`: low-emphasis action
- `glass`: hero/overlay surfaces

### Badge
Source: `apps/web/src/components/ui/badge.tsx`
- `default`: general state
- `sacred`: warm gold metadata
- `whisper`: overlay/dark-surface metadata

### Input
Source: `apps/web/src/components/ui/input.tsx`
- tones: `default`, `muted`, `emphasis`
- sizes: `sm`, `default`, `lg`

### Textarea
Source: `apps/web/src/components/ui/textarea.tsx`
- tones: `default`, `muted`, `emphasis`
- sizes: `sm`, `default`, `lg`

### Card
Source: `apps/web/src/components/ui/card.tsx`
- variants: `default`, `muted`, `emphasis`, `strong`

## AI Authoring Rules
- Keep new UI work inside the existing PMTL palette and utilities.
- Do not introduce raw random hex colors when a token already exists.
- Do not reintroduce generic Inter-only corporate styling.
- Prefer CVA variants for reusable primitives.
- Prefer semantic utility names over duplicated inline class strings.
- Check mobile spacing and line length before finishing.

## Red Flags
- Flat white cards with no tonal hierarchy.
- Full-gold sections with poor text contrast.
- Random gradients unrelated to the palette.
- More than one competing CTA style in the same block.
- New primitive components without CVA when variants are expected.
- Visual changes that ignore `globals.css` surface utilities.
