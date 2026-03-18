# Server-First Boundaries

Use this reference when deciding whether a component or helper should be server or client side.

## Prefer server when

- data can be fetched on the server
- the output is static or request-time only
- the component has no browser event handling

## Prefer a leaf client component when

- the UI owns local state, DOM APIs, or event handling
- only a small sub-tree is interactive
- the rest of the route can stay server-rendered

## Avoid

- marking a whole page `'use client'` because one child needs interactivity
- importing server-only modules into client helpers
- server components fetching this app's own `/api/*` routes without a strong reason
