---
title: use cache
description: "Learn how to use the \"use cache\" directive to cache data in your Next.js application."
url: "https://nextjs.org/docs/app/api-reference/directives/use-cache"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "Directives: /docs/app/api-reference/directives"
related:
  - app/api-reference/directives/use-cache-private
  - app/api-reference/config/next-config-js/cacheComponents
  - app/api-reference/config/next-config-js/cacheLife
  - app/api-reference/config/next-config-js/cacheHandlers
  - app/api-reference/functions/cacheTag
  - app/api-reference/functions/cacheLife
  - app/api-reference/functions/revalidateTag
---


The `use cache` directive allows you to mark a route, React component, or a function as cacheable. It can be used at the top of a file to indicate that all exports in the file should be cached, or inline at the top of function or component to cache the return value.

> **Good to know:**
>
> * To use cookies or headers, read them outside cached scopes and pass values as arguments. This is the preferred pattern.
> * If the in-memory cache isn't sufficient for runtime data, [`'use cache: remote'`](/docs/app/api-reference/directives/use-cache-remote) allows platforms to provide a dedicated cache handler, though it requires a network roundtrip to check the cache and typically incurs platform fees.
> * For compliance requirements or when you can't refactor to pass runtime data as arguments to a `use cache` scope, see [`'use cache: private'`](/docs/app/api-reference/directives/use-cache-private).

## Usage

`use cache` is a Cache Components feature. To enable it, add the [`cacheComponents`](/docs/app/api-reference/config/next-config-js/cacheComponents) option to your `next.config.ts` file:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
}

module.exports = nextConfig
```

Then, add `use cache` at the file, component, or function level:

```tsx
// File level
'use cache'

export default async function Page() {
  // ...
}

// Component level
export async function MyComponent() {
  'use cache'
  return <></>
}

// Function level
export async function getData() {
  'use cache'
  const data = await fetch('/api/data')
  return data
}
```

> **Good to know**: When used at file level, all function exports must be async functions.

## How `use cache` works

### Cache keys

A cache entry's key is generated using a serialized version of its inputs, which includes:

1. **Build ID** - Unique per build, changing this invalidates all cache entries
2. **Function ID** - A secure hash of the function's location and signature in the codebase
3. **Serializable arguments** - Props (for components) or function arguments
4. **HMR refresh hash** (development only) - Invalidates cache on hot module replacement

When a cached function references variables from outer scopes, those variables are automatically captured and bound as arguments, making them part of the cache key.

```tsx filename="lib/data.ts"
async function Component({ userId }: { userId: string }) {
  const getData = async (filter: string) => {
    'use cache'
    // Cache key includes both userId (from closure) and filter (argument)
    return fetch(`/api/users/${userId}/data?filter=${filter}`)
  }

  return getData('active')
}
```

In the snippet above, `userId` is captured from the outer scope and `filter` is passed as an argument, so both become part of the `getData` function's cache key. This means different user and filter combinations will have separate cache entries.

## Serialization

Arguments to cached functions and their return values must be serializable.

For a complete reference, see:

* [Serializable arguments](https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values) - Uses **React Server Components** serialization
* [Serializable return types](https://react.dev/reference/rsc/use-client#serializable-types) - Uses **React Client Components** serialization

> **Good to know:** Arguments and return values use different serialization systems. Server Component serialization (for arguments) is more restrictive than Client Component serialization (for return values). This means you can return JSX elements but cannot accept them as arguments unless using pass-through patterns.

### Supported types

**Arguments:**

* Primitives: `string`, `number`, `boolean`, `null`, `undefined`
* Plain objects: `{ key: value }`
* Arrays: `[1, 2, 3]`
* Dates, Maps, Sets, TypedArrays, ArrayBuffers
* React elements (as pass-through only)

**Return values:**

* Same as arguments, plus JSX elements

### Unsupported types

* Class instances
* Functions (except as pass-through)
* Symbols, WeakMaps, WeakSets
* URL instances

```tsx filename="app/components/user-card.tsx"
// Valid - primitives and plain objects
async function UserCard({
  id,
  config,
}: {
  id: string
  config: { theme: string }
}) {
  'use cache'
  return <div>{id}</div>
}

// Invalid - class instance
async function UserProfile({ user }: { user: UserClass }) {
  'use cache'
  // Error: Cannot serialize class instance
  return <div>{user.name}</div>
}
```

### Pass-through (non-serializable arguments)

You can accept non-serializable values **as long as you don't introspect them**. This enables composition patterns with `children` and Server Actions:

```tsx filename="app/components/cached-wrapper.tsx"
async function CachedWrapper({ children }: { children: ReactNode }) {
  'use cache'
  // Don't read or modify children - just pass it through
  return (
    <div className="wrapper">
      <header>Cached Header</header>
      {children}
    </div>
  )
}

// Usage: children can be dynamic
export default function Page() {
  return (
    <CachedWrapper>
      <DynamicComponent /> {/* Not cached, passed through */}
    </CachedWrapper>
  )
}
```

You can also pass Server Actions through cached components:

```tsx filename="app/components/cached-form.tsx"
async function CachedForm({ action }: { action: () => Promise<void> }) {
  'use cache'
  // Don't call action here - just pass it through
  return <form action={action}>{/* ... */}</form>
}
```

## Constraints

Cached functions execute in an isolated environment. The following constraints ensure cache behavior remains predictable and secure.

### Request-time APIs

Cached functions and components **cannot** directly access runtime APIs like `cookies()`, `headers()`, or `searchParams`. Instead, read these values outside the cached scope and pass them as arguments.

### Runtime caching considerations

While `use cache` is designed primarily to include uncached data in the static shell, it can also cache data at runtime using in-memory LRU (Least Recently Used) storage.

Runtime cache behavior depends on your hosting environment:

| Environment     | Runtime Caching Behavior                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Serverless**  | Cache entries typically don't persist across requests (each request can be a different instance). Build-time caching works normally.                              |
| **Self-hosted** | Cache entries persist across requests. Control cache size with [`cacheMaxMemorySize`](/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath). |

If the default in-memory cache isn't enough, consider **[`use cache: remote`](/docs/app/api-reference/directives/use-cache-remote)** which allows platforms to provide a dedicated cache handler (like Redis or KV database). This helps reduce hits against data sources not scaled to your total traffic, though it comes with costs (storage, network latency, platform fees).

Very rarely, for compliance requirements or when you can't refactor your code to pass runtime data as arguments to a `use cache` scope, you might need [`use cache: private`](/docs/app/api-reference/directives/use-cache-private).

### React.cache isolation

[`React.cache`](https://react.dev/reference/react/cache) operates in an isolated scope inside `use cache` boundaries. Values stored via `React.cache` outside a `use cache` function are not visible inside it.

This means you cannot use `React.cache` to pass data into a `use cache` scope:

```tsx
import { cache } from 'react'

const store = cache(() => ({ current: null as string | null }))

function Parent() {
  const shared = store()
  shared.current = 'value from parent'
  return <Child />
}

async function Child() {
  'use cache'
  const shared = store()
  // shared.current is null, not 'value from parent'
  // use cache has its own isolated React.cache scope
  return <div>{shared.current}</div>
}
```

This isolation ensures cached functions have predictable, self-contained behavior. To pass data into a `use cache` scope, use function arguments instead.

## `use cache` at runtime

On the **server**, cache entries are stored in-memory and respect the `revalidate` and `expire` times from your `cacheLife` configuration. You can customize the cache storage by configuring [`cacheHandlers`](/docs/app/api-reference/config/next-config-js/cacheHandlers) in your `next.config.js` file.

On the **client**, content from the server cache is stored in the browser's memory for the duration defined by the `stale` time. The client router enforces a **minimum 30-second stale time**, regardless of configuration.

The `x-nextjs-stale-time` response header communicates cache lifetime from server to client, ensuring coordinated behavior.

## Revalidation

By default, `use cache` uses the `default` profile with these settings:

* **stale**: 5 minutes (client-side)
* **revalidate**: 15 minutes (server-side)
* **expire**: Never expires by time

```tsx filename="lib/data.ts"
async function getData() {
  'use cache'
  // Implicitly uses default profile
  return fetch('/api/data')
}
```

### Customizing cache lifetime

Use the [`cacheLife`](/docs/app/api-reference/functions/cacheLife) function to customize cache duration:

```tsx filename="lib/data.ts"
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours') // Use built-in 'hours' profile
  return fetch('/api/data')
}
```

### On-demand revalidation

Use [`cacheTag`](/docs/app/api-reference/functions/cacheTag), [`updateTag`](/docs/app/api-reference/functions/updateTag), or [`revalidateTag`](/docs/app/api-reference/functions/revalidateTag) for on-demand cache invalidation:

```tsx filename="lib/data.ts"
import { cacheTag } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheTag('products')
  return fetch('/api/products')
}
```

```tsx filename="app/actions.ts"
'use server'

import { updateTag } from 'next/cache'

export async function updateProduct() {
  await db.products.update(...)
  updateTag('products') // Invalidates all 'products' caches
}
```

Both `cacheLife` and `cacheTag` integrate across client and server caching layers, meaning you configure your caching semantics in one place and they apply everywhere.

## Examples

### Caching an entire route with `use cache`

To prerender an entire route, add `use cache` to the top of **both** the `layout` and `page` files. Each of these segments are treated as separate entry points in your application, and will be cached independently.

```tsx filename="app/layout.tsx" switcher
'use cache'

export default async function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}
```

```jsx filename="app/layout.js" switcher
'use cache'

export default async function Layout({ children }) {
  return <div>{children}</div>
}
```

Any components imported and nested in `page` file are part of the cache output associated with the `page`.

```tsx filename="app/page.tsx" switcher
'use cache'

async function Users() {
  const users = await fetch('/api/users')
  // loop through users
}

export default async function Page() {
  return (
    <main>
      <Users />
    </main>
  )
}
```

```jsx filename="app/page.js" switcher
'use cache'

async function Users() {
  const users = await fetch('/api/users')
  // loop through users
}

export default async function Page() {
  return (
    <main>
      <Users />
    </main>
  )
}
```

> **Good to know**:
>
> * If `use cache` is added only to the `layout` or the `page`, only that route segment and any components imported into it will be cached.

### Caching a component's output with `use cache`

You can use `use cache` at the component level to cache any fetches or computations performed within that component. The cache entry will be reused as long as the serialized props produce the same value in each instance.

```tsx filename="app/components/bookings.tsx" highlight={2} switcher
export async function Bookings({ type = 'haircut' }: BookingsProps) {
  'use cache'
  async function getBookingsData() {
    const data = await fetch(`/api/bookings?type=${encodeURIComponent(type)}`)
    return data
  }
  return //...
}

interface BookingsProps {
  type: string
}
```

```jsx filename="app/components/bookings.js" highlight={2} switcher
export async function Bookings({ type = 'haircut' }) {
  'use cache'
  async function getBookingsData() {
    const data = await fetch(`/api/bookings?type=${encodeURIComponent(type)}`)
    return data
  }
  return //...
}
```

### Caching function output with `use cache`

Since you can add `use cache` to any asynchronous function, you aren't limited to caching components or routes only. You might want to cache a network request, a database query, or a slow computation.

```tsx filename="app/actions.ts" highlight={2} switcher
export async function getData() {
  'use cache'

  const data = await fetch('/api/data')
  return data
}
```

```jsx filename="app/actions.js" highlight={2} switcher
export async function getData() {
  'use cache'

  const data = await fetch('/api/data')
  return data
}
```

### Interleaving

In React, composition with `children` or slots is a well-known pattern for building flexible components. When using `use cache`, you can continue to compose your UI in this way. Anything included as `children`, or other compositional slots, in the returned JSX will be passed through the cached component without affecting its cache entry.

As long as you don't directly reference any of the JSX slots inside the body of the cacheable function itself, their presence in the returned output won't affect the cache entry.

```tsx filename="app/page.tsx" switcher
export default async function Page() {
  const uncachedData = await getData()
  return (
    // Pass compositional slots as props, e.g. header and children
    <CacheComponent header={<h1>Home</h1>}>
      {/* DynamicComponent is provided as the children slot */}
      <DynamicComponent data={uncachedData} />
    </CacheComponent>
  )
}

async function CacheComponent({
  header, // header: a compositional slot, injected as a prop
  children, // children: another slot for nested composition
}: {
  header: ReactNode
  children: ReactNode
}) {
  'use cache'
  const cachedData = await fetch('/api/cached-data')
  return (
    <div>
      {header}
      <PrerenderedComponent data={cachedData} />
      {children}
    </div>
  )
}
```

```jsx filename="app/page.js" switcher
export default async function Page() {
  const uncachedData = await getData()
  return (
    // Pass compositional slots as props, e.g. header and children
    <CacheComponent header={<h1>Home</h1>}>
      {/* DynamicComponent is provided as the children slot */}
      <DynamicComponent data={uncachedData} />
    </CacheComponent>
  )
}

async function CacheComponent({
  header, // header: a compositional slot, injected as a prop
  children, // children: another slot for nested composition
}) {
  'use cache'
  const cachedData = await fetch('/api/cached-data')
  return (
    <div>
      {header}
      <PrerenderedComponent data={cachedData} />
      {children}
    </div>
  )
}
```

You can also pass Server Actions through cached components to Client Components without invoking them inside the cacheable function.

```tsx filename="app/page.tsx" switcher
import ClientComponent from './ClientComponent'

export default async function Page() {
  const performUpdate = async () => {
    'use server'
    // Perform some server-side update
    await db.update(...)
  }

  return <CachedComponent performUpdate={performUpdate} />
}

async function CachedComponent({
  performUpdate,
}: {
  performUpdate: () => Promise<void>
}) {
  'use cache'
  // Do not call performUpdate here
  return <ClientComponent action={performUpdate} />
}
```

```jsx filename="app/page.js" switcher
import ClientComponent from './ClientComponent'

export default async function Page() {
  const performUpdate = async () => {
    'use server'
    // Perform some server-side update
    await db.update(...)
  }

  return <CachedComponent performUpdate={performUpdate} />
}

async function CachedComponent({ performUpdate }) {
  'use cache'
  // Do not call performUpdate here
  return <ClientComponent action={performUpdate} />
}
```

```tsx filename="app/ClientComponent.tsx" switcher
'use client'

export default function ClientComponent({
  action,
}: {
  action: () => Promise<void>
}) {
  return <button onClick={action}>Update</button>
}
```

```jsx filename="app/ClientComponent.js" switcher
'use client'

export default function ClientComponent({ action }) {
  return <button onClick={action}>Update</button>
}
```

## Troubleshooting

### Debugging cache behavior

#### Verbose logging

Set `NEXT_PRIVATE_DEBUG_CACHE=1` for verbose cache logging:

```bash
NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev
# or for production
NEXT_PRIVATE_DEBUG_CACHE=1 npm run start
```

> **Good to know:** This environment variable also logs ISR and other caching mechanisms. See [Verifying correct production behavior](/docs/app/guides/incremental-static-regeneration#verifying-correct-production-behavior) for more details.

#### Console log replays

In development, console logs from cached functions appear with a `Cache` prefix.

### Build Hangs (Cache Timeout)

If your build hangs, you're accessing Promises that resolve to uncached or runtime data, created outside a `use cache` boundary. The cached function waits for data that can't resolve during the build, causing a timeout after 50 seconds.

When the build timeouts you'll see this error message:

> Error: Filling a cache during prerender timed out, likely because request-specific arguments such as params, searchParams, cookies() or uncached data were used inside "use cache".

Common ways this happens: passing such Promises as props, accessing them via closure, or retrieving them from shared storage (Maps).

> **Good to know:** Directly calling `cookies()` or `headers()` inside `use cache` fails immediately with a [different error](/docs/messages/next-request-in-use-cache), not a timeout.

**Passing runtime data Promises as props:**

```tsx filename="app/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dynamic />
    </Suspense>
  )
}

async function Dynamic() {
  const cookieStore = cookies()
  return <Cached promise={cookieStore} /> // Build hangs
}

async function Cached({ promise }: { promise: Promise<unknown> }) {
  'use cache'
  const data = await promise // Waits for runtime data during build
  return <p>..</p>
}
```

Await the `cookies` store in the `Dynamic` component, and pass a cookie value to the `Cached` component.

**Shared deduplication storage:**

```tsx filename="app/page.tsx"
// Problem: Map stores dynamic Promises, accessed by cached code
import { Suspense } from 'react'

const cache = new Map<string, Promise<string>>()

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Dynamic id="data" />
      </Suspense>
      <Cached id="data" />
    </>
  )
}

async function Dynamic({ id }: { id: string }) {
  // Stores dynamic Promise in shared Map
  cache.set(
    id,
    fetch(`https://api.example.com/${id}`).then((r) => r.text())
  )
  return <p>Dynamic</p>
}

async function Cached({ id }: { id: string }) {
  'use cache'
  return <p>{await cache.get(id)}</p> // Build hangs - retrieves dynamic Promise
}
```

Use Next.js's built-in `fetch()` deduplication or use separate Maps for cached and uncached contexts.

## Platform Support

| Deployment Option                                                   | Supported         |
| ------------------------------------------------------------------- | ----------------- |
| [Node.js server](/docs/app/getting-started/deploying#nodejs-server) | Yes               |
| [Docker container](/docs/app/getting-started/deploying#docker)      | Yes               |
| [Static export](/docs/app/getting-started/deploying#static-export)  | No                |
| [Adapters](/docs/app/getting-started/deploying#adapters)            | Platform-specific |

Learn how to [configure caching](/docs/app/guides/self-hosting#caching-and-isr) when self-hosting Next.js.

## Version History

| Version   | Changes                                                     |
| --------- | ----------------------------------------------------------- |
| `v16.0.0` | `"use cache"` is enabled with the Cache Components feature. |
| `v15.0.0` | `"use cache"` is introduced as an experimental feature.     |
## Related

View related API references.

- [use cache: private](/docs/app/api-reference/directives/use-cache-private)
  - Learn how to use the "use cache: private" directive to cache functions that access runtime request APIs.
- [cacheComponents](/docs/app/api-reference/config/next-config-js/cacheComponents)
  - Learn how to enable the cacheComponents flag in Next.js.
- [cacheLife](/docs/app/api-reference/config/next-config-js/cacheLife)
  - Learn how to set up cacheLife configurations in Next.js.
- [cacheHandlers](/docs/app/api-reference/config/next-config-js/cacheHandlers)
  - Configure custom cache handlers for use cache directives in Next.js.
- [cacheTag](/docs/app/api-reference/functions/cacheTag)
  - Learn how to use the cacheTag function to manage cache invalidation in your Next.js application.
- [cacheLife](/docs/app/api-reference/functions/cacheLife)
  - Learn how to use the cacheLife function to set the cache expiration time for a cached function or component.
- [revalidateTag](/docs/app/api-reference/functions/revalidateTag)
  - API Reference for the revalidateTag function.

---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---
title: revalidateTag
description: API Reference for the revalidateTag function.
url: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "Functions: /docs/app/api-reference/functions"
---


`revalidateTag` allows you to invalidate cached data on-demand for a specific cache tag.

This function is ideal for content where a slight delay in updates is acceptable, such as blog posts, product catalogs, or documentation. Users receive stale content while fresh data loads in the background.

## Usage

`revalidateTag` can be called in Server Functions and Route Handlers.

`revalidateTag` cannot be called in Client Components or Proxy, as it only works in server environments.

### Revalidation Behavior

The revalidation behavior depends on whether you provide the second argument:

* **With `profile="max"` (recommended)**: The tag entry is marked as stale, and the next time a resource with that tag is visited, it will use stale-while-revalidate semantics. This means the stale content is served while fresh content is fetched in the background.
* **With a custom cache life profile**: For advanced usage, you can specify any cache life profile that your application has defined, allowing for custom revalidation behaviors tailored to your specific caching requirements.
* **Without the second argument (deprecated)**: The tag entry is expired immediately, and the next request to that resource will be a blocking revalidate/cache miss. This behavior is now deprecated, and you should either use `profile="max"` or migrate to [`updateTag`](/docs/app/api-reference/functions/updateTag).

> **Good to know**: When using `profile="max"`, `revalidateTag` marks tagged data as stale, but fresh data is only fetched when pages using that tag are next visited. This means calling `revalidateTag` will not immediately trigger many revalidations at once. The invalidation only happens when any page using that tag is next visited.

## Parameters

```ts
revalidateTag(tag: string, profile: string | { expire?: number }): void;
```

* `tag`: A string representing the cache tag associated with the data you want to revalidate. Must not exceed 256 characters. This value is case-sensitive.
* `profile`: A string that specifies the revalidation behavior. The recommended value is `"max"` which provides stale-while-revalidate semantics, or any of the other default or custom profiles defined in [`cacheLife`](/docs/app/api-reference/config/next-config-js/cacheLife). Alternatively, you can pass an object with an `expire` property for custom expiration behavior.

Tags must first be assigned to cached data. You can do this in two ways:

* Using the [`next.tags`](/docs/app/api-reference/functions/fetch) option with `fetch` for caching external API requests:

```tsx
fetch(url, { next: { tags: ['posts'] } })
```

* Using [`cacheTag`](/docs/app/api-reference/functions/cacheTag) inside cached functions or components with the `'use cache'` directive:

```tsx
import { cacheTag } from 'next/cache'

async function getData() {
  'use cache'
  cacheTag('posts')
  // ...
}
```

> **Good to know**: The single-argument form `revalidateTag(tag)` is deprecated. It currently works if TypeScript errors are suppressed, but this behavior may be removed in a future version. Update to the two-argument signature.

## Returns

`revalidateTag` does not return a value.

## Relationship with `revalidatePath`

`revalidateTag` invalidates data with specific tags across all pages that use those tags, while [`revalidatePath`](/docs/app/api-reference/functions/revalidatePath) invalidates specific page or layout paths.

> **Good to know**: These functions serve different purposes and may need to be used together for comprehensive data consistency. For detailed examples and considerations, see [relationship with revalidateTag and updateTag](/docs/app/api-reference/functions/revalidatePath#relationship-with-revalidatetag-and-updatetag) for more information.

## Examples

The following examples demonstrate how to use `revalidateTag` in different contexts. In both cases, we're using `profile="max"` to mark data as stale and use stale-while-revalidate semantics, which is the recommended approach for most use cases.

### Server Action

```ts filename="app/actions.ts" switcher
'use server'

import { revalidateTag } from 'next/cache'

export default async function submit() {
  await addPost()
  revalidateTag('posts', 'max')
}
```

```js filename="app/actions.js" switcher
'use server'

import { revalidateTag } from 'next/cache'

export default async function submit() {
  await addPost()
  revalidateTag('posts', 'max')
}
```

### Route Handler

```ts filename="app/api/revalidate/route.ts" switcher
import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')

  if (tag) {
    revalidateTag(tag, 'max')
    return Response.json({ revalidated: true, now: Date.now() })
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing tag to revalidate',
  })
}
```

```js filename="app/api/revalidate/route.js" switcher
import { revalidateTag } from 'next/cache'

export async function GET(request) {
  const tag = request.nextUrl.searchParams.get('tag')

  if (tag) {
    revalidateTag(tag, 'max')
    return Response.json({ revalidated: true, now: Date.now() })
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing tag to revalidate',
  })
}
```

> **Good to know**: For webhooks or third-party services that need immediate expiration, you can pass `{ expire: 0 }` as the second argument: `revalidateTag(tag, { expire: 0 })`. This pattern is necessary when external systems call your Route Handlers and require data to expire immediately. For all other cases, it's recommended to use [`updateTag`](/docs/app/api-reference/functions/updateTag) in Server Actions for immediate updates instead.
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---
title: updateTag
description: API Reference for the updateTag function.
url: "https://nextjs.org/docs/app/api-reference/functions/updateTag"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "Functions: /docs/app/api-reference/functions"
---


`updateTag` allows you to update cached data on-demand for a specific cache tag from within [Server Actions](/docs/app/getting-started/mutating-data).

This function is designed for **read-your-own-writes** scenarios, where a user makes a change (like creating a post), and the UI immediately shows the change, rather than stale data.

## Usage

`updateTag` can **only** be called from within [Server Actions](/docs/app/getting-started/mutating-data). It cannot be used in Route Handlers, Client Components, or any other context.

If you need to invalidate cache tags in Route Handlers or other contexts, use [`revalidateTag`](/docs/app/api-reference/functions/revalidateTag) instead.

> **Good to know**: `updateTag` immediately expires the cached data for the specified tag. The next request will wait to fetch fresh data rather than serving stale content from the cache, ensuring users see their changes immediately.

## Parameters

```tsx
updateTag(tag: string): void;
```

* `tag`: A string representing the cache tag associated with the data you want to update. Must not exceed 256 characters. This value is case-sensitive.

Tags must first be assigned to cached data. You can do this in two ways:

* Using the [`next.tags`](/docs/app/api-reference/functions/fetch) option with `fetch` for caching external API requests:

```tsx
fetch(url, { next: { tags: ['posts'] } })
```

* Using [`cacheTag`](/docs/app/api-reference/functions/cacheTag) inside cached functions or components with the `'use cache'` directive:

```tsx
import { cacheTag } from 'next/cache'

async function getData() {
  'use cache'
  cacheTag('posts')
  // ...
}
```

## Returns

`updateTag` does not return a value.

## Differences from revalidateTag

While both `updateTag` and `revalidateTag` invalidate cached data, they serve different purposes:

* **`updateTag`**:
  * Can only be used in Server Actions
  * Next request waits for fresh data (no stale content served)
  * Designed for read-your-own-writes scenarios

* **`revalidateTag`**:
  * Can be used in Server Actions and Route Handlers
  * With `profile="max"` (recommended): Serves cached data while fetching fresh data in the background (stale-while-revalidate)
  * With custom profile: Can be configured to any cache life profile for advanced usage
  * Without profile: legacy behavior which is equivalent to `updateTag`

## Examples

### Server Action with Read-Your-Own-Writes

```ts filename="app/actions.ts" switcher
'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')

  // Create the post in your database
  const post = await db.post.create({
    data: { title, content },
  })

  // Invalidate cache tags so the new post is immediately visible
  // 'posts' tag: affects any page that displays a list of posts
  updateTag('posts')
  // 'post-{id}' tag: affects the individual post detail page
  updateTag(`post-${post.id}`)

  // Redirect to the new post - user will see fresh data, not cached
  redirect(`/posts/${post.id}`)
}
```

```js filename="app/actions.js" switcher
'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')

  // Create the post in your database
  const post = await db.post.create({
    data: { title, content },
  })

  // Invalidate cache tags so the new post is immediately visible
  // 'posts' tag: affects any page that displays a list of posts
  updateTag('posts')
  // 'post-{id}' tag: affects the individual post detail page
  updateTag(`post-${post.id}`)

  // Redirect to the new post - user will see fresh data, not cached
  redirect(`/posts/${post.id}`)
}
```

### Error when used outside Server Actions

```ts filename="app/api/posts/route.ts" switcher
import { updateTag } from 'next/cache'

export async function POST() {
  // This will throw an error
  updateTag('posts')
  // Error: updateTag can only be called from within a Server Action

  // Use revalidateTag instead in Route Handlers
  revalidateTag('posts', 'max')
}
```

## When to use updateTag

Use `updateTag` when:

* You're in a Server Action
* You need immediate cache invalidation for read-your-own-writes
* You want to ensure the next request sees updated data

Use `revalidateTag` instead when:

* You're in a Route Handler or other non-action context
* You want stale-while-revalidate semantics
* You're building a webhook or API endpoint for cache invalidation

## Related

* [`revalidateTag`](/docs/app/api-reference/functions/revalidateTag) - For invalidating tags in Route Handlers
* [`revalidatePath`](/docs/app/api-reference/functions/revalidatePath) - For invalidating specific paths
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)
---
title: Route Handlers
description: Learn how to use Route Handlers
url: "https://nextjs.org/docs/app/getting-started/route-handlers"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "Getting Started: /docs/app/getting-started"
related:
  - app/api-reference/file-conventions/route
  - app/guides/backend-for-frontend
---


## Route Handlers

Route Handlers allow you to create custom request handlers for a given route using the Web [Request](https://developer.mozilla.org/docs/Web/API/Request) and [Response](https://developer.mozilla.org/docs/Web/API/Response) APIs.

![Route.js Special File](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/route-special-file.png)

> **Good to know**: Route Handlers are only available inside the `app` directory. They are the equivalent of [API Routes](/docs/pages/building-your-application/routing/api-routes) inside the `pages` directory meaning you **do not** need to use API Routes and Route Handlers together.

### Convention

Route Handlers are defined in a [`route.js|ts` file](/docs/app/api-reference/file-conventions/route) inside the `app` directory:

```ts filename="app/api/route.ts" switcher
export async function GET(request: Request) {}
```

```js filename="app/api/route.js" switcher
export async function GET(request) {}
```

Route Handlers can be nested anywhere inside the `app` directory, similar to `page.js` and `layout.js`. But there **cannot** be a `route.js` file at the same route segment level as `page.js`.

### Supported HTTP Methods

The following [HTTP methods](https://developer.mozilla.org/docs/Web/HTTP/Methods) are supported: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`. If an unsupported method is called, Next.js will return a `405 Method Not Allowed` response.

### Extended `NextRequest` and `NextResponse` APIs

In addition to supporting the native [Request](https://developer.mozilla.org/docs/Web/API/Request) and [Response](https://developer.mozilla.org/docs/Web/API/Response) APIs, Next.js extends them with [`NextRequest`](/docs/app/api-reference/functions/next-request) and [`NextResponse`](/docs/app/api-reference/functions/next-response) to provide convenient helpers for advanced use cases.

### Caching

Route Handlers are not cached by default. You can, however, opt into caching for `GET` methods. Other supported HTTP methods are **not** cached. To cache a `GET` method, use a [route config option](/docs/app/guides/caching-without-cache-components#dynamic) such as `export const dynamic = 'force-static'` in your Route Handler file.

```ts filename="app/items/route.ts" switcher
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

```js filename="app/items/route.js" switcher
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

> **Good to know**: Other supported HTTP methods are **not** cached, even if they are placed alongside a `GET` method that is cached, in the same file.

#### With Cache Components

When [Cache Components](/docs/app/getting-started/caching) is enabled, `GET` Route Handlers follow the same model as normal UI routes in your application. They run at request time by default, can be prerendered when they don't access uncached or runtime data, and you can use `use cache` to include uncached data in the static response.

**Static example** - doesn't access uncached or runtime data, so it will be prerendered at build time:

```tsx filename="app/api/project-info/route.ts"
export async function GET() {
  return Response.json({
    projectName: 'Next.js',
  })
}
```

**Dynamic example** - accesses non-deterministic operations. During the build, prerendering stops when `Math.random()` is called, deferring to request-time rendering:

```tsx filename="app/api/random-number/route.ts"
export async function GET() {
  return Response.json({
    randomNumber: Math.random(),
  })
}
```

**Runtime data example** - accesses request-specific data. Prerendering terminates when runtime APIs like `headers()` are called:

```tsx filename="app/api/user-agent/route.ts"
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')

  return Response.json({ userAgent })
}
```

> **Good to know**: Prerendering stops if the `GET` handler accesses network requests, database queries, async file system operations, request object properties (like `req.url`, `request.headers`, `request.cookies`, `request.body`), runtime APIs like [`cookies()`](/docs/app/api-reference/functions/cookies), [`headers()`](/docs/app/api-reference/functions/headers), [`connection()`](/docs/app/api-reference/functions/connection), or non-deterministic operations.

**Cached example** - accesses uncached data (database query) but caches it with `use cache`, allowing it to be included in the prerendered response:

```tsx filename="app/api/products/route.ts"
import { cacheLife } from 'next/cache'

export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}

async function getProducts() {
  'use cache'
  cacheLife('hours')

  return await db.query('SELECT * FROM products')
}
```

> **Good to know**: `use cache` cannot be used directly inside a Route Handler body; extract it to a helper function. Cached responses revalidate according to `cacheLife` when a new request arrives.

### Special Route Handlers

Special Route Handlers like [`sitemap.ts`](/docs/app/api-reference/file-conventions/metadata/sitemap), [`opengraph-image.tsx`](/docs/app/api-reference/file-conventions/metadata/opengraph-image), and [`icon.tsx`](/docs/app/api-reference/file-conventions/metadata/app-icons), and other [metadata files](/docs/app/api-reference/file-conventions/metadata) remain static by default unless they use Request-time APIs or dynamic config options.

### Route Resolution

You can consider a `route` the lowest level routing primitive.

* They **do not** participate in layouts or client-side navigations like `page`.
* There **cannot** be a `route.js` file at the same route as `page.js`.

| Page                 | Route              | Result                       |
| -------------------- | ------------------ | ---------------------------- |
| `app/page.js`        | `app/route.js`     |  Conflict |
| `app/page.js`        | `app/api/route.js` |  Valid    |
| `app/[user]/page.js` | `app/api/route.js` |  Valid    |

Each `route.js` or `page.js` file takes over all HTTP verbs for that route.

```ts filename="app/page.ts" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}

// Conflict
// `app/route.ts`
export async function POST(request: Request) {}
```

```js filename="app/page.js" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}

// Conflict
// `app/route.js`
export async function POST(request) {}
```

Read more about how Route Handlers [complement your frontend application](/docs/app/guides/backend-for-frontend), or explore the Route Handlers [API Reference](/docs/app/api-reference/file-conventions/route).

### Route Context Helper

In TypeScript, you can type the `context` parameter for Route Handlers with the globally available [`RouteContext`](/docs/app/api-reference/file-conventions/route#route-context-helper) helper:

```ts filename="app/users/[id]/route.ts" switcher
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
```

> **Good to know**
>
> * Types are generated during `next dev`, `next build` or `next typegen`.
## API Reference

Learn more about Route Handlers

- [route.js](/docs/app/api-reference/file-conventions/route)
  - API reference for the route.js special file.
- [Backend for Frontend](/docs/app/guides/backend-for-frontend)
  - Learn how to use Next.js as a backend framework

---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---
title: Metadata and OG images
description: Learn how to add metadata to your pages and create dynamic OG images.
url: "https://nextjs.org/docs/app/getting-started/metadata-and-og-images"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "Getting Started: /docs/app/getting-started"
related:
  - app/api-reference/functions/generate-metadata
  - app/api-reference/functions/generate-viewport
  - app/api-reference/functions/image-response
  - app/api-reference/file-conventions/metadata
  - app/api-reference/file-conventions/metadata/app-icons
  - app/api-reference/file-conventions/metadata/opengraph-image
  - app/api-reference/file-conventions/metadata/robots
  - app/api-reference/file-conventions/metadata/sitemap
  - app/api-reference/config/next-config-js/htmlLimitedBots
---


The Metadata APIs can be used to define your application metadata for improved SEO and web shareability and include:

1. [The static `metadata` object](#static-metadata)
2. [The dynamic `generateMetadata` function](#generated-metadata)
3. Special [file conventions](/docs/app/api-reference/file-conventions/metadata) that can be used to add static or dynamically generated [favicons](#favicons) and [OG images](#static-open-graph-images).

With all the options above, Next.js will automatically generate the relevant `<head>` tags for your page, which can be inspected in the browser's developer tools.

The `metadata` object and `generateMetadata` function exports are only supported in Server Components.

## Default fields

There are two default `meta` tags that are always added even if a route doesn't define metadata:

* The [meta charset tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta#attr-charset) sets the character encoding for the website.
* The [meta viewport tag](https://developer.mozilla.org/docs/Web/HTML/Viewport_meta_tag) sets the viewport width and scale for the website to adjust for different devices.

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

The other metadata fields can be defined with the `Metadata` object (for [static metadata](#static-metadata)) or the `generateMetadata` function (for [generated metadata](#generated-metadata)).

## Static metadata

To define static metadata, export a [`Metadata` object](/docs/app/api-reference/functions/generate-metadata#metadata-object) from a static [`layout.js`](/docs/app/api-reference/file-conventions/layout) or [`page.js`](/docs/app/api-reference/file-conventions/page) file. For example, to add a title and description to the blog route:

```tsx filename="app/blog/layout.tsx" switcher
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Blog',
  description: '...',
}

export default function Layout() {}
```

```jsx filename="app/blog/layout.js" switcher
export const metadata = {
  title: 'My Blog',
  description: '...',
}

export default function Layout() {}
```

You can view a full list of available options, in the [`generateMetadata` documentation](/docs/app/api-reference/functions/generate-metadata#metadata-fields).

## Generated metadata

You can use [`generateMetadata`](/docs/app/api-reference/functions/generate-metadata) function to `fetch` metadata that depends on data. For example, to fetch the title and description for a specific blog post:

```tsx filename="app/blog/[slug]/page.tsx" switcher
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug

  // fetch post information
  const post = await fetch(`https://api.vercel.app/blog/${slug}`).then((res) =>
    res.json()
  )

  return {
    title: post.title,
    description: post.description,
  }
}

export default function Page({ params, searchParams }: Props) {}
```

```jsx filename="app/blog/[slug]/page.js" switcher
export async function generateMetadata({ params, searchParams }, parent) {
  const slug = (await params).slug

  // fetch post information
  const post = await fetch(`https://api.vercel.app/blog/${slug}`).then((res) =>
    res.json()
  )

  return {
    title: post.title,
    description: post.description,
  }
}

export default function Page({ params, searchParams }) {}
```

### Streaming metadata

For dynamically rendered pages, Next.js streams metadata separately, injecting it into the HTML once `generateMetadata` resolves, without blocking UI rendering.

Streaming metadata improves perceived performance by allowing visual content to stream first.

Streaming metadata is **disabled for bots and crawlers** that expect metadata to be in the `<head>` tag (e.g. `Twitterbot`, `Slackbot`, `Bingbot`). These are detected by using the User Agent header from the incoming request.

You can customize or **disable** streaming metadata completely, with the [`htmlLimitedBots`](/docs/app/api-reference/config/next-config-js/htmlLimitedBots#disabling) option in your Next.js config file.

Prerendered pages don’t use streaming since metadata is resolved at build time.

Learn more about [streaming metadata](/docs/app/api-reference/functions/generate-metadata#streaming-metadata).

### Memoizing data requests

There may be cases where you need to fetch the **same** data for metadata and the page itself. To avoid duplicate requests, you can use React's [`cache` function](https://react.dev/reference/react/cache) to memoize the return value and only fetch the data once. For example, to fetch the blog post information for both the metadata and the page:

```ts filename="app/lib/data.ts" highlight={5} switcher
import { cache } from 'react'
import { db } from '@/app/lib/db'

// getPost will be used twice, but execute only once
export const getPost = cache(async (slug: string) => {
  const res = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return res
})
```

```js filename="app/lib/data.js" highlight={5} switcher
import { cache } from 'react'
import { db } from '@/app/lib/db'

// getPost will be used twice, but execute only once
export const getPost = cache(async (slug) => {
  const res = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return res
})
```

```tsx filename="app/blog/[slug]/page.tsx" switcher
import { getPost } from '@/app/lib/data'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return <div>{post.title}</div>
}
```

```jsx filename="app/blog/[slug]/page.js" switcher
import { getPost } from '@/app/lib/data'

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function Page({ params }) {
  const post = await getPost(params.slug)
  return <div>{post.title}</div>
}
```

## File-based metadata

The following special files are available for metadata:

* [favicon.ico, apple-icon.jpg, and icon.jpg](/docs/app/api-reference/file-conventions/metadata/app-icons)
* [opengraph-image.jpg and twitter-image.jpg](/docs/app/api-reference/file-conventions/metadata/opengraph-image)
* [robots.txt](/docs/app/api-reference/file-conventions/metadata/robots)
* [sitemap.xml](/docs/app/api-reference/file-conventions/metadata/sitemap)

You can use these for static metadata, or you can programmatically generate these files with code.

## Favicons

Favicons are small icons that represent your site in bookmarks and search results. To add a favicon to your application, create a `favicon.ico` and add to the root of the app folder.

![Favicon Special File inside the App Folder with sibling layout and page files](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/favicon-ico.png)

> You can also programmatically generate favicons using code. See the [favicon docs](/docs/app/api-reference/file-conventions/metadata/app-icons) for more information.

## Static Open Graph images

Open Graph (OG) images are images that represent your site in social media. To add a static OG image to your application, create a `opengraph-image.jpg` file in the root of the app folder.

![OG image special file inside the App folder with sibling layout and page files](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/opengraph-image.png)

You can also add OG images for specific routes by creating a `opengraph-image.jpg` deeper down the folder structure. For example, to create an OG image specific to the `/blog` route, add a `opengraph-image.jpg` file inside the `blog` folder.

![OG image special file inside the blog folder](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/opengraph-image-blog.png)

The more specific image will take precedence over any OG images above it in the folder structure.

> Other image formats such as `jpeg`, `png`, and `gif` are also supported. See the [Open Graph Image docs](/docs/app/api-reference/file-conventions/metadata/opengraph-image) for more information.

## Generated Open Graph images

The [`ImageResponse` constructor](/docs/app/api-reference/functions/image-response) allows you to generate dynamic images using JSX and CSS. This is useful for OG images that depend on data.

For example, to generate a unique OG image for each blog post, add a `opengraph-image.tsx` file inside the `blog` folder, and import the `ImageResponse` constructor from `next/og`:

```tsx filename="app/blog/[slug]/opengraph-image.tsx" switcher
import { ImageResponse } from 'next/og'
import { getPost } from '@/app/lib/data'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {post.title}
      </div>
    )
  )
}
```

```jsx filename="app/blog/[slug]/opengraph-image.js" switcher
import { ImageResponse } from 'next/og'
import { getPost } from '@/app/lib/data'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }) {
  const post = await getPost(params.slug)

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {post.title}
      </div>
    )
  )
}
```

`ImageResponse` supports common CSS properties including flexbox and absolute positioning, custom fonts, text wrapping, centering, and nested images. [See the full list of supported CSS properties](/docs/app/api-reference/functions/image-response).

> **Good to know**:
>
> * Examples are available in the [Vercel OG Playground](https://og-playground.vercel.app/).
> * `ImageResponse` uses [`@vercel/og`](https://vercel.com/docs/og-image-generation), [`satori`](https://github.com/vercel/satori), and `resvg` to convert HTML and CSS into PNG.
> * Only flexbox and a subset of CSS properties are supported. Advanced layouts (e.g. `display: grid`) will not work.
## API Reference

Learn more about the Metadata APIs mentioned in this page.

- [generateMetadata](/docs/app/api-reference/functions/generate-metadata)
  - Learn how to add Metadata to your Next.js application for improved search engine optimization (SEO) and web shareability.
- [generateViewport](/docs/app/api-reference/functions/generate-viewport)
  - API Reference for the generateViewport function.
- [ImageResponse](/docs/app/api-reference/functions/image-response)
  - API Reference for the ImageResponse constructor.
- [Metadata Files](/docs/app/api-reference/file-conventions/metadata)
  - API documentation for the metadata file conventions.
- [favicon, icon, and apple-icon](/docs/app/api-reference/file-conventions/metadata/app-icons)
  - API Reference for the Favicon, Icon and Apple Icon file conventions.
- [opengraph-image and twitter-image](/docs/app/api-reference/file-conventions/metadata/opengraph-image)
  - API Reference for the Open Graph Image and Twitter Image file conventions.
- [robots.txt](/docs/app/api-reference/file-conventions/metadata/robots)
  - API Reference for robots.txt file.
- [sitemap.xml](/docs/app/api-reference/file-conventions/metadata/sitemap)
  - API Reference for the sitemap.xml file.
- [htmlLimitedBots](/docs/app/api-reference/config/next-config-js/htmlLimitedBots)
  - Specify a list of user agents that should receive blocking metadata.

---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---
title: Proxy
description: Learn how to use Proxy
url: "https://nextjs.org/docs/app/getting-started/proxy"
version: 16.2.1
lastUpdated: 2026-03-25
prerequisites:
  - "Getting Started: /docs/app/getting-started"
related:
  - app/api-reference/file-conventions/proxy
  - app/guides/backend-for-frontend
---


## Proxy

> **Good to know**: Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

Proxy allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

### Use cases

Some common scenarios where Proxy is effective include:

* Modifying headers for all pages or a subset of pages
* Rewriting to different pages based on A/B tests or experiments
* Programmatic redirects based on incoming request properties

For simple redirects, consider using the [`redirects`](/docs/app/api-reference/config/next-config-js/redirects) configuration in `next.config.ts` first. Proxy should be used when you need access to request data or more complex logic.

Proxy is *not* intended for slow data fetching. While Proxy can be helpful for [optimistic checks](/docs/app/guides/authentication#optimistic-checks-with-proxy-optional) such as permission-based redirects, it should not be used as a full session management or authorization solution.

Using fetch with `options.cache`, `options.next.revalidate`, or `options.next.tags`, has no effect in Proxy.

### Convention

Create a `proxy.ts` (or `.js`) file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`.

> **Note**: While only one `proxy.ts` file is supported per project, you can still organize your proxy logic into modules. Break out proxy functionalities into separate `.ts` or `.js` files and import them into your main `proxy.ts` file. This allows for cleaner management of route-specific proxy, aggregated in the `proxy.ts` for centralized control. By enforcing a single proxy file, it simplifies configuration, prevents potential conflicts, and optimizes performance by avoiding multiple proxy layers.

### Example

You can export your proxy function as either a default export or a named `proxy` export:

```ts filename="proxy.ts" switcher
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: '/about/:path*',
}
```

```js filename="proxy.js" switcher
import { NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request) { ... }

export const config = {
  matcher: '/about/:path*',
}
```

The `matcher` config allows you to filter Proxy to run on specific paths. See the [Matcher](/docs/app/api-reference/file-conventions/proxy#matcher) documentation for more details on path matching.

Read more about [using `proxy`](/docs/app/guides/backend-for-frontend#proxy), or refer to the `proxy` [API reference](/docs/app/api-reference/file-conventions/proxy).
## API Reference

Learn more about Proxy

- [proxy.js](/docs/app/api-reference/file-conventions/proxy)
  - API reference for the proxy.js file.
- [Backend for Frontend](/docs/app/guides/backend-for-frontend)
  - Learn how to use Next.js as a backend framework

---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)