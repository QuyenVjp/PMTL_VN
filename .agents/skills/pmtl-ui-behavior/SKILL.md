---
name: pmtl-ui-behavior
description: PMTL_VN interaction and accessibility discipline. Use when building or reviewing forms, navigation, dialogs, loading states, empty states, error handling, and interactive components.
---

# PMTL UI Behavior

## Interaction rules

- Use `:focus-visible`, not generic `:focus`.
- Keep touch targets at least `44x44px`.
- Keep mobile input font size at least `16px`.
- Prefer inline validation and direct field feedback over toast-only failures.
- Focus the first invalid field after failed submit.
- Always provide loading, empty, success, and error states for non-trivial interactive surfaces.
- Use semantic HTML for landmarks and icon-only button labels.
- Prefer keyboard-complete flows: submit on Enter, dismiss on Escape when appropriate, restore focus after dialog close.

## Form discipline

- Labels above inputs.
- Helper text optional, but structure must support it.
- Errors belong near the related control.
- Do not hide critical state changes behind motion alone.

## Pair with

- `pmtl-fe-implementation` for code structure.
- `pmtl-ui-style-system` for visual hierarchy.
- `pmtl-review-web-ui` when reviewing an existing surface.
