# PMTL_VN - Quick Implementation Guide

**For:** Solo dev wanting to level up production quality
**Time:** 2-4 weeks to implement all recommendations
**Difficulty:** Medium (mostly configuration and documentation)

---

## 🚀 Phase 1: Immediate (This Week)

### Task 1.1: Fix TypeScript Strictness
**Time:** 15 minutes
**Impact:** High - Consistency across codebase

```bash
# apps/web/tsconfig.json - REMOVE these overrides:
- "strict": false
- "noUncheckedIndexedAccess": false
- "exactOptionalPropertyTypes": false
- "verbatimModuleSyntax": false

# Result: Both apps now have strict: true
# Fix any resulting errors in the web app
```

**Expected issues:**
- Some `any` types will surface
- undefined access will need guards
- Use `unknown` then narrow instead

**Estimate errors:** 10-30 type errors to fix (easy fixes)

---

### Task 1.2: Setup Logging (pino)
**Time:** 1-2 hours
**Impact:** High - Debugging becomes 10x easier

**Step 1: Install**
```bash
cd PMTL_VN
pnpm add pino pino-pretty pino-http
```

**Step 2: Create logger in both apps**

Create `apps/web/src/lib/logger.ts`:
```typescript
import pino from 'pino';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    singleLine: false,
    colorizeObjects: true,
    translateTime: 'SYS:standard',
    destination: process.stdout,
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  },
  transport
);
```

Create `apps/cms/src/lib/logger.ts` (same as above)

**Step 3: Replace console.logs**
```typescript
// Before:
console.error('Post sync failed', err);

// After:
import { logger } from '@/lib/logger';
logger.error({ error: err, postId }, 'Post sync failed');
```

**Test:**
```bash
pnpm dev
# See nicely formatted logs in terminal
```

---

### Task 1.3: Add Security Headers (Helmet)
**Time:** 30 minutes
**Impact:** Medium - Production security hardening

**Step 1: Install**
```bash
pnpm add helmet
```

**Step 2: Update middleware**

`apps/web/src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import helmet from 'helmet';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  }
  
  return response;
}

export const config = {
  matcher: ['/:path*'],
};
```

---

### Task 1.4: Create Security Documentation
**Time:** 2-3 hours
**Impact:** Critical - Production requirement

Create `docs/security.md`:
```markdown
# PMTL_VN Security Documentation

## Authentication & Authorization

### Payload Auth
- Source of truth: Payload CMS user collection
- Token storage: HttpOnly cookies (Payload handles)
- Token refresh: Automatic via Payload
- RBAC: 6 roles (admin, editor, moderator, member, guest, banned)

### Cookie Configuration
```toml
# Payload manages these, verify in production:
HttpOnly: true       # JavaScript can't access
Secure: true         # HTTPS only in production
SameSite: Strict     # CSRF protection
Max-Age: 604800      # 7 days
```

### Protected Routes
- /profile/*         - Requires auth
- /admin/*          - Requires admin role
- /api/*            - Rate limited

## CSRF Protection
- Payload uses token-based CSRF
- All form submissions include token
- Verify: Check POST requests include X-CSRF-Token header

## Input Validation
- All inputs validated with Zod schemas
- Database layer uses Payload ORM (parameterized queries)
- Search index: Meilisearch filters untrusted input

## Rate Limiting
- API endpoints: 100 requests/minute per IP
- Login endpoint: 5 attempts/minute per IP
- Comment submission: 1 per minute per user

## Secrets Management
- Database password: Environment variable
- JWT secret: Environment variable
- VAPID keys: Environment variable
- .env.prod: Never commit, use GitHub Secrets + CI/CD

## Backup Security
- Database backups: Encrypted at rest
- Backup retention: 30 days
- Restore testing: Monthly

## Monitoring
- Failed auth attempts: Logged
- API errors: Sentry tracking
- Search indexing: Health checks
```

---

### Task 1.5: Verify Environment Secrets
**Time:** 30 minutes
**Impact:** Critical - Prevent leaked secrets

```bash
# Check if .env.prod has real secrets:
git log --all --oneline -- "infra/docker/.env.prod" | wc -l
# Result should be 0 (never been committed)

# Verify .env.prod is in .gitignore:
cat .gitignore | grep "\.env\.prod"
# Result should show: infra/docker/.env.prod

# Check for any hardcoded secrets in code:
grep -r "password:" apps/ --include="*.ts" | grep -v "// TODO"
grep -r "secret:" apps/ --include="*.ts" | grep -v "// TODO"
grep -r "API_KEY" apps/ --include="*.ts"

# If anything found: move to .env.example, use environment vars
```

---

## 📊 Phase 2: Foundation (Weeks 2-3)

### Task 2.1: Setup Testing Infrastructure
**Time:** 2-3 hours
**Impact:** High - Catch bugs before production

**Install:**
```bash
pnpm add -D vitest @vitest/ui supertest @testing-library/react @testing-library/jest-dom
```

**Create test runner:**

`vitest.config.ts` (root):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      lines: 70,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@payload-config': path.resolve(__dirname, './apps/cms/src'),
      '@pmtl/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
```

**Create test examples:**

`packages/shared/src/validators/__tests__/email.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '../email';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });
});
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Task 2.2: Create Field Rules Documentation
**Time:** 1-2 hours
**Impact:** Medium - Onboarding clarity

Expand `docs/cms/field-rules.md`:
```markdown
# CMS Field Rules & Requirements

## Collections Overview

### Posts
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | ✅ | Max 200 chars, indexed |
| slug | String | ✅ | Auto-generated from title, unique |
| content | RichText | ✅ | Lexical editor, min 10 chars |
| excerpt | String | ⚠️ | Auto-generated if empty, max 300 |
| featured_image | Upload | ⚠️ | If status=published |
| status | Select | ✅ | draft, published, archived |
| author_id | Relationship | ✅ | Links to User |
| tags | Array | ⚠️ | Max 10 tags |
| created_at | Date | 🔒 | Auto (beforeChange hook) |
| updated_at | Date | 🔒 | Auto (beforeChange hook) |

**Access Control:**
- owner can edit/delete own posts
- editor/admin can edit/delete all posts
- member can only view published posts

### Comments
[Similar detail for each collection]
```

---

### Task 2.3: Create Design System Documentation
**Time:** 1-2 hours
**Impact:** Medium - Design consistency

Create `docs/design/DESIGN_SYSTEM.md`:
```markdown
# Design System

## Color Palette

### Primary Colors
- Gold: #D4AF37 (interactive elements, buttons)
- Cream: #FFF8DC (backgrounds, light surfaces)
- Black: #1A1A1A (text, dark surfaces)

### Semantic Colors
- Success: #22c55e (confirmations, success states)
- Warning: #f59e0b (warnings, pending states)  
- Error: #ef4444 (errors, dangerous actions)
- Info: #3b82f6 (information, help text)

## Typography

### Fonts
- Headings: Playfair Display (serif) - elegant, traditional
- Body: Inter (sans-serif) - clear, modern

### Scale
```8px / 12px / 14px / 16px / 18px / 24px / 32px / 48px```

## Components

### Button Variants
```typescript
// Primary (CTA)
<Button variant="primary">Subscribe</Button>

// Secondary (Less emphasis)
<Button variant="secondary">Learn More</Button>

// Danger (Destructive)
<Button variant="danger">Delete</Button>
```

## Animation

### Entrance
- Duration: 300ms
- Easing: ease-out
- Scale: 0.95 → 1
- Opacity: 0 → 1

### Interaction
- Duration: 150ms
- Easing: ease-in-out
```

---

### Task 2.4: Create Debugging Guide
**Time:** 1 hour
**Impact:** Medium - Faster problem solving

Create `docs/DEBUGGING.md`:
```markdown
# Debugging Guide

## Common Issues & Solutions

### Search Returns No Results
**Cause:** Meilisearch index empty or out of sync
**Fix:**
```bash
pnpm reindex:posts
```

### API Returns 401 Unauthorized
**Cause:** Auth token expired or missing
**Check:**
```typescript
// Check request headers
headers: { 'Authorization': `Bearer ${token}` }

// Or use cookies (Payload default)
credentials: 'include'
```

### Database Connection Fails
**Cause:** Postgres not running or wrong env vars
**Fix:**
```bash
# Check services
docker ps | grep postgres

# Or restart services
pnpm dev:infra:down
pnpm dev:infra
```

### TypeScript Errors in Editor
**Cause:** Editor cache stale
**Fix:**
```bash
# Restart TS server
pnpm typecheck
# Then reload VS Code
```

## Logging Cheatsheet

```typescript
import { logger } from '@/lib/logger';

// For starting an operation
logger.info({ userId }, 'User login attempt');

// For warnings
logger.warn({ postId, reason: 'slow query' }, 'Post sync delayed');

// For errors
logger.error({ error: err, postId }, 'Post sync failed');

// For detailed debugging
logger.debug({ raw: data }, 'Raw API response');
```

## Performance Profiling

```bash
# Run with Node profiler (Linux/Mac only)
node --inspect-brk node_modules/.bin/next dev

# Then open chrome://inspect in Chrome
# Profile the slow operation
```
```

---

## 🎯 Phase 3: Polish (Weeks 3-4)

### Task 3.1: Performance Baseline
**Time:** 1-2 hours
**Impact:** Medium - Know your baseline

```bash
# Run Lighthouse
pnpm add -D lighthouse

# Audit production build
npm run build
pnpm dlx lighthouse https://localhost:3000

# Use web-vitals in production
pnpm add web-vitals
```

---

### Task 3.2: Setup Error Tracking (Optional)
**Time:** 1-2 hours
**Impact:** Medium - production monitoring

```bash
pnpm add @sentry/nextjs

# Configure in apps/web/sentry.server.config.ts
# Configure in apps/web/sentry.client.config.ts
```

---

### Task 3.3: Update Copilot Instructions
**Time:** 30 minutes
**Impact:** High - AI helps better

Already created! Just verify it exists:
```
.vscode/.instructions.md
.agents/skills/pmtl-production-ready/SKILL.md
```

---

### Task 3.4: Create Pre-Launch Checklist
**Time:** 30 minutes
**Impact:** High - Don't forget anything

Create `docs/LAUNCH_CHECKLIST.md`:
```markdown
# Pre-Launch Checklist

## 1 Week Before Launch
- [ ] Security audit completed
- [ ] Performance baseline measured
- [ ] All tests passing
- [ ] Documentation complete and reviewed
- [ ] Staging environment tested
- [ ] Backup/restore procedure tested
- [ ] Team trained on runbooks

## 48 Hours Before
- [ ] Final code review
- [ ] Staging environment matches production
- [ ] Monitoring alerts configured
- [ ] On-call rotation defined
- [ ] Incident response plan reviewed

## Launch Day
- [ ] Deploy to production
- [ ] Smoke tests pass
- [ ] Monitor for 2 hours
- [ ] Verify critical paths working
- [ ] Check error tracking (Sentry/logs)
- [ ] Confirm metrics in dashboard

## After Launch
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Plan improvements for next sprint
```

---

## 📈 Implementation Timeline

```
Week 1:
├─ Mon:  Tasks 1.1-1.2 (TypeScript + Logging)
├─ Tue:  Tasks 1.3-1.4 (Security + Documentation)
├─ Wed:  Task 1.5 (Verify secrets)
└─ Thu:  Buffer day + review

Week 2-3:
├─ Task 2.1 (Testing setup)
├─ Task 2.2 (Field rules docs)
├─ Task 2.3 (Design system)
└─ Task 2.4 (Debugging guide)

Week 4:
├─ Task 3.1 (Performance baseline)
├─ Task 3.2 (Error tracking optional)
├─ Task 3.3 (Copilot instructions)
└─ Task 3.4 (Launch checklist)
```

---

## ✅ Success Criteria

After completing all tasks:

- [ ] Type errors: 0 in both apps
- [ ] Test coverage: > 70%
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Security docs: Complete and reviewed
- [ ] Error logs: Clean (no silent failures)
- [ ] Deployment: Automated via GitHub Actions
- [ ] Monitoring: Alerts configured
- [ ] Runbooks: For 5+ common operations
- [ ] AI Copilot: Understands project (via .instructions.md)

---

## 💪 You've Got This!

Each task is straightforward:
1. Follow the steps
2. Test locally (`pnpm dev`)
3. Verify with checklist
4. Move to next task

**Questions?** Your Copilot skill is configured to help with each step!

**Need help?** 
- Check `docs/DEBUGGING.md`
- Review similar patterns in codebase
- Ask Copilot with `.instructions.md` context
