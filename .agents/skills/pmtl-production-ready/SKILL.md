---
name: PMTL_VN Production Ready
description: >-
  Production-grade configuration and best practices for PMTL_VN.
  Use when building features, debugging, optimizing performance,
  ensuring security, and maintaining code quality for solo dev environment.
  Covers monorepo structure, design patterns, logging, error handling, and production checklist.
---

# PMTL_VN Production-Ready Skill

## Quick Reference

**Stack:** Next.js 16 + Payload CMS 3 + PostgreSQL 17 + Meilisearch + Docker Compose
**Environment:** Solo developer, production-grade, design-focused
**Principles:** Clear code > clever code, explicit > implicit, safe > fast

---

## When to Use This Skill

✅ **Use this skill when:**
- Adding features to web or cms apps
- Debugging production issues in local or live
- Optimizing performance (queries, rendering, search)
- Adding security measures or hardening
- Writing documentation or tests
- Setting up monitoring, logging, or error tracking
- Configuring infrastructure or deployment

❌ **Don't use this skill for:**
- General React/Next.js questions (use the `next` skill instead)
- Payload-specific internals (use Payload docs)
- Ubuntu/Linux system administration (use SSH skill)

---

## Architecture Rules (Non-Negotiable)

### Monorepo Boundaries
```
✅ CORRECT:
├─ apps/web/                    ← Next.js frontend only
├─ apps/cms/                    ← Payload CMS server
├─ packages/shared/             ← Framework-agnostic types, utils, validators
├─ packages/ui/                 ← Shared UI components (next.js only)
├─ packages/config/             ← Shared configurations
├─ infra/                        ← Docker, Caddy, deploy scripts
└─ docs/                         ← Architecture, API contracts, design

❌ ANTI-PATTERNS:
- ❌ Business logic in packages/shared (only types + utils + validators)
- ❌ Next.js imports in packages/shared
- ❌ Payload collections split incorrectly
- ❌ API response handling in web pages/layouts
- ❌ Circular imports between apps
```

### Web App (feature-first)
```typescript
// ✅ CORRECT structure:
src/
├─ app/                         ← Routes, layouts, middleware
├─ features/
│  ├─ auth/                     ← Auth domain
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ types.ts
│  │  └─ utils/
│  ├─ posts/                    ← Posts domain
│  │  ├─ api/
│  │  ├─ components/
│  │  └─ ...
│  └─ search/
├─ components/                  ← Shared UI primitives
├─ lib/                         ← Utils, cms client, logger, error tracker
├─ styles/
├─ types/
└─ contexts/

// ❌ WRONG structure (don't do this):
src/
├─ api/                         ← ❌ Don't scatter API routes
├─ pages/
├─ services/                    ← ❌ Services belong in CMS, not web
├─ models/
└─ utils/
```

### CMS Collections (exactly 5 files per collection)
```typescript
// ✅ MUST FOLLOW THIS PATTERN:
Posts/
├─ index.ts        ← Collection config, field/access/hooks/service refs
├─ fields.ts       ← Field definitions only
├─ access.ts       ← RBAC rules only
├─ hooks.ts        ← Orchestration hooks (beforeChange, afterChange)
└─ service.ts      ← Business logic (validation, search sync, mappers)

// ❌ ANTI-PATTERNS (never do):
❌ Business logic in index.ts (belongs in service.ts)
❌ Access control in hooks.ts (belongs in access.ts)
❌ Raw database queries in hooks (belongs in service.ts)
❌ Field definitions in service.ts (belongs in fields.ts)
```

### Shared Package (truly framework-agnostic)
```typescript
// ✅ GOOD (no framework imports):
export type User = { id: string; email: string };
export const USER_ROLES = ['admin', 'editor'] as const;
export function validateEmail(email: string): boolean { }

// ❌ BAD (has Next.js/Payload imports):
import { NextRequest } from 'next/server';        // ❌ NO!
import { CollectionConfig } from 'payload';       // ❌ NO!
import { useRouter } from 'next/navigation';      // ❌ NO!

// ✅ CORRECT structure:
packages/shared/src/
├─ types/              ← All type definitions
├─ enums/              ← Admin, Editor, Member, etc.
├─ schemas/            ← Zod schemas for validation
├─ constants/          ← Domain constants
├─ mappers/            ← Data transformation functions
├─ validators/         ← Validation utilities
└─ utils/              ← Pure utility functions
```

---

## Code Style & Patterns

### TypeScript Strictness
```json
// Both apps MUST use production TypeScript config:
{
  "extends": "@pmtl/config/typescript/production.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "useDefineForClassFields": true,
    "verbatimModuleSyntax": true
  }
}
```

### Error Handling Pattern
```typescript
// ❌ WRONG (silent failure):
try {
  await syncPostToSearch(post);
} catch (err) {
  // No logging! Silent failure means debugging nightmare
}

// ✅ CORRECT (log then decide):
import { logger } from '@/lib/logger';

try {
  logger.info({ postId: post.id }, 'Starting post sync');
  await syncPostToSearch(post);
  logger.info({ postId: post.id }, 'Post synced successfully');
} catch (err) {
  logger.error(
    { postId: post.id, error: err },
    'Post sync failed - retrying'
  );
  // Re-throw to fail safe, or handle gracefully if non-critical
  throw err;
}
```

### Input Validation
```typescript
// ✅ ALWAYS use Zod schemas:
import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(10),
  status: z.enum(['draft', 'published', 'archived']),
});

// Type-safe schema parsing:
export async function validatePostData(data: unknown) {
  const validated = CreatePostSchema.parse(data);  // Throws if invalid
  return validated; // Type is 100% inferred
}
```

### Component Pattern (shadcn/ui + CVA)
```typescript
// ✅ Use class-variance-authority for component variants:
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors duration-200',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-white hover:bg-gold-600',
        secondary: 'bg-cream text-black hover:bg-cream-200',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, disabled }), className)}
      disabled={disabled}
      {...props}
    />
  );
}
```

### Server Component Pattern (Next.js App Router)
```typescript
// ✅ DEFAULT: Server Components (no 'use client')
export default async function PostsPage() {
  // Fetch data directly on server
  const posts = await fetchPosts();
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// ✅ ONLY use 'use client' for interactivity:
'use client';

import { useState } from 'react';

export function CommentForm() {
  const [text, setText] = useState('');
  
  return <textarea value={text} onChange={e => setText(e.target.value)} />;
}

// ❌ WRONG: Server components inside client component
// Each component should have ONE reason for being client/server
```

---

## Security Practices

### Authentication & Authorization
```typescript
// ✅ Check auth in middleware (not every page):
import { middleware } from '@/middleware';
// Protects routes: /profile, /admin, /settings

// ✅ RBAC via Payload collections:
// Use access.ts to control who can access/modify

// ✅ API route protection:
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();
  
  // Process request
}
```

### Input Sanitization
```typescript
// ✅ Validate all inputs via Zod:
const schema = z.object({
  title: z.string().min(1).max(200),
});

// ✅ Never trust user input:
// - Always parse/validate before using
// - Use parameterized queries (Payload handles this)
// - Sanitize HTML if rendering user content
```

### Secrets Management
```
// ✅ CORRECT:
.env.prod → GitHub Secrets → CI/CD → Container env vars

// ❌ WRONG:
.env.prod committed to repo with real secrets
Secrets in database seed scripts
Hardcoded API keys

// 🔒 INFRA_DOCKER/.env.example
POSTGRES_PASSWORD=change_me_production
JWT_SECRET=change_me_production
// (All marked with "change_me_")
```

---

## Performance Patterns

### Next.js 16 Cache Components
```typescript
// ✅ Prefer cache at the data layer:
import { cacheLife, cacheTag } from 'next/cache';

export async function getPostsCached() {
  "use cache";
  cacheLife('hours');
  cacheTag('blog-posts');
  return cmsFetch('/blog-posts');
}

// ✅ Keep route/page files thin and let feature helpers own caching
const posts = await getPostsCached();

// ✅ Use no-store only for truly user-specific or request-specific data
await fetch(url, { cache: 'no-store' });

// ✅ For route handlers/pages that must never prerender under cacheComponents,
// use `await connection()` at the entry point.
import { connection } from 'next/server';
await connection();

// ❌ Avoid defaulting to page-level `export const revalidate`
// ❌ Avoid `unstable_cache` when `cacheComponents` + "use cache" fits
// ❌ Do not use `export const dynamic = 'force-dynamic'` with cacheComponents enabled
```

### React Query for Client State
```typescript
// ✅ Use React Query for remote data fetching:
export function useComments(postId: string) {
  return useQuery(
    ['comments', postId],
    () => fetch(`/api/comments?postId=${postId}`).then(r => r.json()),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// ✅ DON'T use useState + useEffect for API calls:
// ❌ const [comments, setComments] = useState([]);
// ❌ useEffect(() => { fetch(...) }, []);
// Use React Query instead!
```

### Search Optimization
```typescript
// Use Meilisearch for full-text search:
import MeiliSearch from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

// ✅ Search with semantic expansion (Vietnamese):
const results = await client.index('posts').search(query, {
  attributesToSearchOn: ['title', 'content', 'tags'],
  limit: 20,
  offset: 0,
});
```

---

## Debugging & Logging

### Logging Best Practices
```typescript
// Use pino for structured JSON logging
import { logger } from '@/lib/logger';

// ✅ Good logging:
logger.info({ userId: user.id }, 'User logged in');
logger.warn({ token: 'expired' }, 'JWT expired, refresh needed');
logger.error({ postId, error: err }, 'Search sync failed');

// ❌ Bad logging:
console.log('done');                          // ❌ Vague
console.log(JSON.stringify(fullObject));      // ❌ Unstructured
logger.info(err.toString());                  // ❌ Lost context

// Log levels:
// logger.fatal()   - App can't recover
// logger.error()   - Operation failed
// logger.warn()    - Unexpected but handled
// logger.info()    - Important event
// logger.debug()   - Development info
// logger.trace()   - Low-level details
```

### Error Tracking
```typescript
// Optional: Use Sentry for production error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Then errors auto-sent to Sentry dashboard
```

---

## Testing Patterns

### Unit Tests (Vitest)
```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRelevance } from './search';

describe('calculateRelevance', () => {
  it('should prioritize title matches', () => {
    const result = calculateRelevance(
      { title: 'React tips', content: 'Some content' },
      'React'
    );
    expect(result).toBeGreaterThan(5);
  });
});
```

### Integration Tests (Vitest + Supertest)
```typescript
// api/posts.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('GET /api/posts', () => {
  it('should return posts list', async () => {
    const res = await request(app)
      .get('/api/posts')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## Pre-Launch Checklist

Before shipping to production:

### Security ✅
- [ ] `docs/security.md` written and reviewed
- [ ] CORS policy documented and implemented
- [ ] CSRF tokens configured (Payload + forms)
- [ ] Rate limiting on `/api/*` routes
- [ ] Authentication verified with secure cookies
- [ ] Database backups encrypted
- [ ] Environment secrets managed properly

### Performance ✅
- [ ] Core Web Vitals measured (LCP, FID, CLS)
- [ ] Cache profiles and tags tuned for each feature
- [ ] Search latency < 200ms
- [ ] API response time < 500ms
- [ ] Images optimized (AVIF/WebP)
- [ ] Code splitting verified

### Reliability ✅
- [ ] Logging configured (pino)
- [ ] Error tracking enabled (Sentry optional)
- [ ] Health checks for all services
- [ ] Backup/restore tested
- [ ] Monitoring alerts configured

### Testing ✅
- [ ] Unit tests > 70% coverage
- [ ] Integration tests for critical APIs
- [ ] E2E tests for user flows
- [ ] Performance tests done

### Documentation ✅
- [ ] API contracts complete
- [ ] Field rules documented
- [ ] Runbooks for common operations
- [ ] Incident response plan
- [ ] Design system published
- [ ] Copilot instructions saved

---

## Quick Commands

```bash
# Local development
pnpm dev              # Everything (web, cms, worker, infra)
pnpm dev:apps         # Just web + cms
pnpm dev:infra        # Just docker services

# Building
pnpm build            # Build all apps
pnpm build --filter=web

# Quality checks
pnpm lint             # Lint all
pnpm typecheck        # Type check all
pnpm test             # Run tests (when setup)

# Docker production
pnpm docker:prod      # Run production docker-compose

# Debugging
DEBUG=payload:* pnpm dev  # Enable Payload debug logs
NODE_DEBUG=http pnpm dev  # Enable HTTP debug logs
```

---

## When You're Stuck

### Common Issues & Solutions

| Issue | Cause | Fix |
|-------|-------|-----|
| Search results empty | Meilisearch not synced | Run `pnpm reindex:posts` |
| Type errors in services | CMS hooks type mismatch | Use generated Payload types |
| Comment sync fails | Service error silently caught | Check pino logs for the error |
| Performance slow | Too many Server Components | Check Next.js Insights |
| Deployment broken | Env vars missing | Verify `.env.prod` has all vars from example |

---

## Recommended Reading

- `docs/architecture/conventions.md` - Placement rules
- `docs/architecture/domains.md` - Domain structure
- `docs/api/contracts.md` - API DTOs
- `docs/cms/content-model.md` - Collection dependencies
- `docs/cms/field-rules.md` - Field requirements
- `PRODUCTION_TOOLKIT_GUIDE.md` - Detailed library recommendations

---

## Remember

✨ **Key mindset for solo dev:**
- Code clarity > performance premature
- Logging > debugging guesswork
- Patterns > ad hoc solutions
- Documentation > relying on memory
- Tests > manual verification
- Security > shipping fast

**When in doubt:**
1. Check existing patterns (don't invent)
2. Log what's happening
3. Test locally first
4. Document what you learned
5. Commit with clear message

Good luck! 🚀
