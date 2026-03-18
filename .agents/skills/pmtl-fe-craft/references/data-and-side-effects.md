# Data and Side Effects

Use this reference when async work, caching, and effects are involved.

## Rules

- Trigger independent async work in parallel.
- Keep data fetching close to the server boundary when possible.
- Avoid `useEffect` for derived state.
- Use effects for real synchronization, not general-purpose sequencing.
- Treat cache decisions as part of architecture, not styling.

## Smells

- `useEffect(() => { fetch(...) }, [])` in components that could be server-rendered
- duplicated loading state logic across siblings
- fetch waterfalls caused by deeply nested component ownership
