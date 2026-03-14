---
name: pmtl-vercel-precision
description: Use when designing, reviewing, or refactoring PMTL_VN frontend UI toward a Vercel-grade level of precision while preserving the project's warm Buddhist editorial identity. Applies to homepage work, landing sections, cards, navigation, spacing, typography, motion, and visual system cleanup.
---

# PMTL Vercel Precision

Use this skill when the user wants PMTL UI to feel more precise, premium, and disciplined without losing its warm Buddhist editorial tone.

## Read First

1. Read the target page or component.
2. Read [docs/pmtl-homepage-vercel-grade-audit.md](../../../docs/pmtl-homepage-vercel-grade-audit.md) when the task affects homepage direction or marketing page quality.
3. Read [docs/pmtl-precision-design-playbook.md](../../../docs/pmtl-precision-design-playbook.md) before making visual decisions.
4. If the task touches existing project conventions, also use `pmtl-vn-project`.
5. If the task edits shadcn-style primitives or composition patterns, also use `shadcn`.

## Design Intent

The target style is:

- warm
- calm
- editorial
- premium through discipline
- spiritual without ornament overload

Do not copy Next.js or Vercel visually.
Borrow their precision:

- strict hierarchy
- limited visual vocabulary
- exact spacing
- clean interaction states
- consistent component anatomy

## Hard Rules

### 1. Surface discipline

Limit UI to 3 surface levels:

- page ground
- standard panel
- emphasis panel

Avoid stacking multiple tinted backgrounds, glow, blur, and strong shadows in one component.

### 2. Radius discipline

Prefer:

- `rounded-md` for controls
- `rounded-xl` for standard cards
- `rounded-2xl` for marquee blocks only

Do not introduce arbitrary radii unless the block is intentionally flagship.

### 3. Gold discipline

Gold is strategic, not ambient.

Use gold for:

- primary action
- active state
- sacred emphasis
- one key metadata marker

Do not spray gold across all icons, labels, links, dividers, and hover states.

### 4. Card anatomy

Default card order:

1. eyebrow
2. title
3. description
4. meta or CTA

When one row is not needed, omit it without changing the overall rhythm.

### 5. Motion discipline

Default motion:

- fade
- slight rise
- tiny translate
- crossfade for content replacement

Avoid decorative motion stacks with glow, large scale, and strong color transitions together.

### 6. Spacing discipline

Unify:

- section intro width
- heading-to-content gap
- panel padding
- card internal spacing

If two adjacent sections feel like different products, normalize spacing before changing colors.

## Review Checklist

For every UI change, check:

- Is this component using one of the approved surfaces?
- Does its radius match its semantic role?
- Is gold conveying meaning here?
- Does the content follow the shared anatomy?
- Is motion mostly opacity/transform based?
- Is the hierarchy still strong without decorative accents?

## PMTL Translation Layer

When adapting Vercel-grade precision to PMTL:

- keep serif-led authority for headings
- keep warm cream, sand, earth, and restrained gold tokens
- keep motion gentle and respectful
- keep the experience quiet, not startup-like

Reduce:

- random hover theatrics
- excessive accent density
- too many panel personalities
- too many decorative gradients per view

## Deliverable Style

When the user asks for design help, prefer delivering:

- a short diagnosis of what is inconsistent
- a system decision for surfaces, radius, accent, spacing, and motion
- concrete implementation changes in the target files

Do not stop at vague advice like "make it cleaner" or "more minimal".

## Homepage Bias

For homepage work, use this priority order:

1. section rhythm
2. card anatomy
3. surface consistency
4. accent reduction
5. motion cleanup

This order is more reliable than starting with color tweaks.
