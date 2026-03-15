---
name: pmtl-uiux-specialist
description: UI/UX Behavioral Specialist for PMTL_VN. Focuses on the "how it feels" part of the interface, applying Vercel-grade interaction rules, accessibility standards, and behavioral discipline. Use when building interactive components, forms, and navigation.
---

# PMTL UI/UX Specialist

Use this skill to ensure the application feels snappy, accessible, and high-quality in every interaction.

## 1. Interaction Discipline
- **Focus States:** Never use `:focus`. Always use `:focus-visible` with a custom ring that matches the project's Gold accent.
- **Touch Targets:** All interactive elements must be at least 44x44px.
- **Input Font Size:** Mobile inputs MUST be at least 16px to prevent iOS Safari from auto-zooming.
- **Scroll Behavior:** Use `touch-action: manipulation` for buttons to remove click delays on mobile.

## 2. Form Excellence (Vercel Standards)
- **Submit on Enter:** Always ensure the primary button triggers when `Enter` is pressed in any input.
- **Error Placement:** Errors must appear inline next to the field, not in a generic toast only. Focus the first error on failed submit.
- **Indicative Placeholders:** Placeholders should show the format (e.g., `janedoe@example.com...`) and end with an ellipsis.
- **Success States:** Always provide immediate visual feedback (e.g., loading spinner, optimistic update).

## 3. Accessibility (A11y)
- **Semantic HTML:** Use `<main>`, `<section>`, `<nav>`, `<aside>` correctly. No `div` soup.
- **Aria Labels:** Provide `aria-label` for icon-only buttons.
- **Color Contrast:** Ensure all text passes WCAG AA standards against the warm/earthy backgrounds.
- **Keyboard Navigation:** The entire app must be usable via `Tab` and `Shift+Tab`.

## 4. Navigation & State
- **Deep Linking:** The URL should be the "source of truth" for UI state (e.g., active filters, pagination).
- **Predictable Transitions:** Use `framer-motion` for page transitions, keeping them short (under 200ms) and functional (entry/exit).

## 5. Review Checklist
Before finishing a UI task, check:
- Is it usable with just a keyboard?
- Does it look good on a 320px width screen?
- Are the empty states (skeletons) as beautiful as the content?
- Does the hover state "brighten intent" without being loud?
