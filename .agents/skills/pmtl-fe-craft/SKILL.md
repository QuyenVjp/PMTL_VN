---
name: pmtl-fe-craft
description: Advanced Frontend Craftsmanship for PMTL_VN. Focuses on writing professional, "human-like" code that follows Next.js/Vercel best practices while avoiding common AI-generated code smells. Use for all frontend implementation, refactoring, and code reviews.
---

# PMTL Frontend Craftsmanship

Apply this skill to ensure code feels written by a meticulous Senior Frontend Engineer, not an AI generator.

## 1. Eliminate AI Code Smells
- **No Over-commenting:** Do not describe *what* the code does (e.g., `// Initialize state`). Only comment on *why* a complex decision was made.
- **No Over-nesting:** Use early returns to keep logic flat.
- **Meaningful Naming:** Avoid generic names like `data`, `item`, `val`. Use specific domain terms (e.g., `sacredText`, `monkProfile`).
- **No "Placeholder" Patterns:** Never leave `TODO` or `// Implement logic here`. Deliver full, working implementations.

## 2. Next.js & React Discipline
- **Server-First Logic:** Default to Server Components. Only add `"use client"` if interactivity or hooks (useState, useEffect) are strictly required.
- **No Waterfalls:** Trigger independent data fetches in parallel using `Promise.all`.
- **Zod Validation:** All API inputs and environment variables MUST be validated with Zod.
- **Strict TypeScript:** No `any`. Use discriminated unions for complex states.

## 3. Component Architecture
- **Composition over Props-drilling:** Use React children or context for deep hierarchies.
- **Logical Grouping:** Keep related components in a local `_components` folder within the route, not a global `components` folder if they aren't reusable.
- **Single Responsibility:** If a component exceeds 200 lines, it's time to split.

## 4. Performance Checklist
- Use `next/image` for all images with proper `placeholder="blur"` where applicable.
- Use `tabular-nums` for any numeric data lists (prices, counts, dates).
- Implement `prefers-reduced-motion` checks for all animations.
- Ensure all forms have proper `inputmode` and `autocomplete` attributes.
- In Server Components, call domain/server helpers directly. Do not fetch this app's own `/api/*` routes unless the caller is a browser/client component.
- Treat `next dev` timings as debugging noise; use production build output and real vitals to judge performance.
- Keep initial render narrow: defer notifications, auth adornments, and secondary panels until interaction or after the main shell is visible.
- When a route must be request-time under Next 16 `cacheComponents`, use `await connection()` at the entry point, not `export const dynamic`.
- Prefer static or Partial Prerender for content shells, then stream or hydrate only the volatile segment.
- Default to Server Components at the route level. If a page needs filters, tabs, carousels, or accordions, move `'use client'` into the smallest child component that owns that state.
- Never import server-only modules (`node:*`, server helpers, crypto, filesystem) into browser-facing helpers. Split shared constants/types into a neutral module when both server and client need them.
- Replace internal `<a href="/...">` navigation with `next/link`. Raw anchors are only for external URLs, `tel:`, `mailto:`, downloads, and deliberate full page reloads.
- Do not keep purely decorative `framer-motion` wrappers in large sections by default. For PMTL_VN, prefer server-rendered sections first and reserve client animation for genuinely interactive areas.
- For Docker dev on Windows, treat filesystem polling and bind mounts as the first bottleneck. Optimize client boundaries before reaching for experimental bundlers.
- Do not enable `next-rspack` by default in this repo. It is experimental and should only be evaluated as an explicit web-only dev experiment after verifying compatibility; keep `apps/cms` on the supported path.

## 5. Implementation Standard
When the user asks for a feature, provide:
1. The implementation with zero shortcuts.
2. A brief "Senior Review" note explaining the architectural choice.
3. Verification that it meets Vercel-grade performance patterns.
