# PMTL_VN - Production Toolkit & AI Skill Configuration Guide

**Dành cho:** Solo dev, production-grade, design-focused, efficient debugging
**Updated:** March 15, 2026

---

## 🎯 I. THƯ VIỆN CÔNG CỤ CHIẾN LƯỢC

### A. **Security & Authentication** 🔐

#### Current (Payload Auth)
```typescript
// ✅ GOOD: Payload auth built-in
// ❌ NEED TO ADD: Auth helpers, rate limiting

// RECOMMEND ADDING:
```

| Library | Reason | Installation |
|---------|--------|--------------|
| **helmet** | Secure HTTP headers | `pnpm add helmet` |
| **rate-limiter-flexible** | Per-IP/user rate limiting | `pnpm add rate-limiter-flexible redis` |
| **jsonwebtoken** (optional) | JWT ops if needed | `pnpm add jsonwebtoken` |
| **zod** (already have!) | ✅ Input validation | - |
| **argon2** | Password hashing (Payload uses) | ✅ Already included |

**Setup in apps/web middleware:**
```typescript
// middleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Add to middleware stack
```

---

### B. **Data Fetching & Caching** 📊

| Current | Recommendation | Why |
|---------|-----------------|-----|
| React Query | ✅ KEEP (SWR là alternative) | State management, auto-retry |
| Payload SDK | ✅ KEEP | Built-in REST client |
| No Redis adapter | ❌ **ADD** | Cache layer for Phase 2 |
| No ISR strategy | ❌ **DOCUMENT** | Next.js cache won |

**Thêm vào packages/shared:**
```typescript
// lib/cache.ts
export const REVALIDATE_TIMES = {
  POSTS: 3600,       // 1 hour
  COMMENTS: 300,     // 5 min
  SEARCH: 600,       // 10 min
  USER_DATA: 60,     // 1 min
  STATIC: 86400,     // 1 day
};

export function getCacheKey(domain: string, id: string) {
  return `${domain}:${id}`;
}
```

**Libraries to add:**
```json
{
  "dependencies": {
    "react-query": "^3.39.0",        // ✅ Keep
    "swr": "^2.2.0",                 // Alternative if needed
    "cache-manager": "^5.2.3",       // Multi-backend caching
    "ioredis": "^5.3.0"              // Redis client (Phase 2)
  }
}
```

---

### C. **Search & Semantic Understanding** 🔍

**Current:** Meilisearch + instant-meilisearch
**Enhance with:**

```typescript
// packages/shared/lib/search-semantic.ts (IMPROVE)

// Add semantic expansion cho Vietnamese
const semanticExpansions = {
  'phật pháp': ['buddhism', 'dharma', 'kinh thánh', 'quy tắc'],
  'thiền': ['meditation', 'zen', 'tĩnh tâm', 'chánh niệm'],
  'niệm phật': ['chanting', 'recitation', 'mantra', 'tụng kinh'],
};

// Better relevance ranking
export function rankSearchResults(results: SearchResult[], query: string) {
  return results.sort((a, b) => {
    const aScore = calculateRelevance(a, query);
    const bScore = calculateRelevance(b, query);
    return bScore - aScore;
  });
}

function calculateRelevance(result: SearchResult, query: string): number {
  let score = result._rankingScore || 0;
  
  // Title match = higher weight
  if (result.title?.toLowerCase().includes(query.toLowerCase())) {
    score += 10;
  }
  
  // Exact phrase match
  if (result.content?.includes(query)) {
    score += 5;
  }
  
  return score;
}
```

**Add to package.json:**
```json
{
  "dependencies": {
    "meilisearch": "^0.35.0",           // ✅ Keep
    "instant-meilisearch": "^0.11.6",   // ✅ Keep
    "natural": "^6.7.0",                // NLP tools (stemming, etc)
    "stopwords": "^1.1.1",              // Vietnamese stopwords
    "micromark": "^4.0.0"               // Markdown parsing for search content
  }
}
```

---

### D. **Error Handling & Logging** 📝

**Current:** Sparse logging
**Recommend:**

```json
{
  "dependencies": {
    "pino": "^8.16.0",                 // Fast JSON logger
    "pino-pretty": "^10.2.0",          // Dev-friendly output
    "pino-http": "^8.4.0",             // HTTP request logging
    "sentry": "^7.80.0",               // Error tracking (optional)
    "winston": "^3.11.0"               // Alternative to pino
  }
}
```

**Setup logger:**
```typescript
// libs/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Use in services:
export class PostService {
  async syncPostToSearch(postData: Post) {
    try {
      logger.info({ postId: postData.id }, 'Syncing post to search');
      await meilisearch.index('posts').addDocuments([postData]);
      logger.info({ postId: postData.id }, 'Post synced successfully');
    } catch (err) {
      logger.error({ postId: postData.id, error: err }, 'Post sync failed');
      throw err; // Fail safe
    }
  }
}
```

---

### E. **Performance Monitoring** 📈

```json
{
  "dependencies": {
    "web-vitals": "^3.4.0",            // Core Web Vitals
    "@vercel/analytics": "^1.1.0",     // If using Vercel
    "lighthouse": "^11.4.0",           // Budget: performance audit
    "pageinsights": "^0.1.0",          // Alternative to Lighthouse
    "clinic": "^13.0.0"                // Node profiler (optional)
  }
}
```

**Setup in apps/web:**
```typescript
// lib/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function setupWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Use in root layout
```

---

### F. **API Documentation & Testing** 📚

```json
{
  "devDependencies": {
    "@types/node": "^20.8.0",          // ✅ Already have
    "tsx": "^4.6.0",                   // ✅ TypeScript runner
    "vitest": "^0.34.0",               // Fast unit tests
    "supertest": "^6.3.0",             // API testing
    "jest": "^29.7.0",                 // Alternative test runner
    "@testing-library/react": "^14.1.0" // React component tests
  }
}
```

**API documentation:**
```typescript
// docs/api/endpoints.md (GENERATE from code)
// or use OpenAPI/Swagger

// Setup Swagger:
// apps/cms/package.json
{
  "devDependencies": {
    "swagger-ui-express": "^4.6.0",
    "swagger-jsdoc": "^6.2.0"
  }
}

// cms routes auto-documented
```

---

### G. **UI/Design System** 🎨

**Current:** shadcn/ui + Tailwind ✅
**Enhance with these tools:**

```json
{
  "dependencies": {
    "@radix-ui/react-*": "^latest",    // ✅ Keep (headless)
    "clsx": "^2.0.0",                  // Class concatenation
    "tailwind-merge": "^2.2.0",        // Smart Tailwind merge
    "class-variance-authority": "^0.7.0", // CVA for variants
    "framer-motion": "^10.16.0",       // ✅ Keep (animations)
    "lucide-react": "^0.294.0",        // Beautiful icons
    "headless-ui": "^1.7.0"            // Alternative to Radix
  }
}
```

**Create design system docs:**
```typescript
// docs/design/DESIGN_SYSTEM.md (NEW)
// Include:
// - Color palette reference
// - Typography scale
// - Spacing rules
// - Component variants (CVA examples)
// - Motion/animation guidelines
// - Accessibility checklist per component
```

**Component pattern with CVA:**
```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'px-4 py-2 rounded-lg font-semibold transition-colors',
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
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants>;

export function Button({ variant, size, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })} {...props} />;
}
```

---

### H. **Database & ORM** 🗄️

**Current:** Payload (abstracts Postgres)
**Consider for direct access:**

```json
{
  "dependencies": {
    "@prisma/client": "^5.3.0",        // Type-safe ORM (optional)
    "knex": "^3.0.0",                  // Query builder (optional)
    "postgres": "^3.3.0",              // Lightweight Postgres client
    "pg": "^8.10.0",                   // Standard Postgres driver
    "pgvector": "^0.1.0"               // Vector search (Phase 2)
  }
}
```

---

### I. **Deployment & DevOps** 🚀

```json
{
  "devDependencies": {
    "docker": "^latest",               // ✅ Already have
    "docker-compose": "^latest",       // ✅ Already have
    "caddy": "^latest",                // ✅ Already have
    "pm2": "^5.3.0",                   // Process manager (alternative)
    "dotenv": "^16.3.0",               // Env management
    "tsx": "^4.6.0"                    // ✅ TypeScript runner
  }
}
```

---

## 🛠️ II. PRODUCTION CONFIGURATION SETUP

### A. **ESLint + Prettier (Enhance)**

Create `packages/config/eslint/production.mjs`:
```javascript
export default [
  ...baseConfig,
  {
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
];
```

Use in production:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:prod": "eslint . --config ./eslint/production.mjs --fix"
  }
}
```

---

### B. **TypeScript Production Config**

Create `packages/config/typescript/production.json`:
```json
{
  "extends": "./nextjs.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "alwaysStrict": true,
    "useDefineForClassFields": true,
    "verbatimModuleSyntax": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "importsNotUsedAsValues": "error"
  }
}
```

Update `apps/web/tsconfig.json`:
```json
{
  "extends": "@pmtl/config/typescript/production.json"
}
```

---

### C. **Environment Management**

Create `infra/docker/.env.example`:
```bash
# ===== SECURITY =====
POSTGRES_PASSWORD=change_me_production
REDIS_PASSWORD=change_me_production
JWT_SECRET=change_me_production
VAPID_PUBLIC_KEY=change_me_production
VAPID_PRIVATE_KEY=change_me_production

# ===== PAYLOAD =====
PAYLOAD_SECRET=change_me_production
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com

# ===== SEARCH =====
MEILISEARCH_HOST=meilisearch
MEILISEARCH_PORT=7700
MEILISEARCH_MASTER_KEY=change_me_production

# ===== LOGGING =====
LOG_LEVEL=info
SENTRY_DSN=optional_sentry_dsn

# ===== MONITORING =====
NEW_RELIC_LICENSE_KEY=optional
DATADOG_API_KEY=optional
```

---

## 💡 III. AI SKILL CONFIGURATION FOR YOUR PROJECT

### A. **Custom Copilot Instructions** (.vscode/settings.json)

```json
{
  "GitHub.Copilot.chat.welcomeMessage": false,
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

### B. **Create .instructions.md for Copilot Context**

```markdown
# PMTL_VN Copilot Instructions

## Project Overview
Buddhist editorial platform with Next.js 16 frontend + Payload CMS backend.
- Solo dev project with focus on code aesthetics and maintainability
- Production-grade with clear conventions

## Architecture Rules
- Never break monorepo boundaries
- Web app = feature-first (src/features/{domain})
- CMS collections = 5-file split (index, fields, access, hooks, service)
- Shared package = framework-agnostic only (types, utils, validators)

## When Asked to Code
1. Check existing patterns first (don't reinvent)
2. Follow TypeScript strict mode
3. Use Zod for validation
4. Add logging in try-catch (never silent failures)
5. Document APIs in service/lib layer
6. Keep components small and focused

## Red Flags (Reject These Patterns)
- ❌ Business logic in collection index.ts
- ❌ Next.js imports in packages/shared
- ❌ Empty catch blocks
- ❌ Any types (use unknown, then narrow)
- ❌ Circular imports between apps
- ❌ Redux or heavy state management (React Query sufficient)

## Preferred Libraries
- UI: shadcn/ui + Tailwind + Framer Motion
- Data: React Query + Zod schemas
- Search: Meilisearch + instant-meilisearch
- Log: pino (JSON, fast)
- Test: vitest (fast, ESM-native)
- API: REST via Payload IPC
```

Create file: `.vscode/.instructions.md`

---

### C. **Create PMTL_VN Custom Skill** (Copilot Skills)

Create `.agents/skills/pmtl-production-ready/SKILL.md`:

```markdown
# PMTL_VN Production-Ready Skill

Use this skill when:
- Adding features to web or cms
- Debugging production issues
- Optimizing performance
- Adding security measures
- Writing documentation
- Setting up monitoring

## Context
- Monorepo: apps/web, apps/cms, packages/*
- Frontend: Next.js 16 App Router, shadcn/ui, Tailwind
- CMS: Payload 3, 34 collections
- Search: Meilisearch with Vietnamese semantic expansion
- Database: PostgreSQL 17
- Infrastructure: Docker Compose local, Caddy reverse proxy
- Solo dev environment

## Patterns to Follow
1. Next.js: Server Components by default, use 'use client' minimally
2. Payload: Collection split into 5 files, services isolated
3. Types: Full strict TypeScript, use Zod schemas
4. Errors: Always log before catch, never silent failures
5. Performance: ISR for posts (1h), revalidate for comments (5min)

## Do Not
- Move business logic into components or collection configs
- Import Next.js/Payload in packages/shared
- Use any types
- Create catch blocks without logging
- Add Redis/workers unless Phase 2 requested

## When Recommending
- Prioritize simplicity over cleverness
- Document security implications
- Add logging for debugging
- Consider solo dev context (clarity > optimization premature)
```

---

### D. **Configure Copilot for Debugging**

In VS Code Copilot settings:
```json
{
  "copilot.chat.debugging.enabled": true,
  "copilot.chat.debugging.logLevel": "debug",
  "copilot.chat.codeSnippetsContextLimit": 50
}
```

---

## 🐛 IV. DEBUG & MONITORING SETUP

### A. **Local Debugging with VS Code**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node: CMS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/cms/node_modules/.bin/next",
      "args": ["dev"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "payload:*"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Chrome: Web App",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/apps/web/src"
    }
  ]
}
```

---

### B. **Runtime Error Boundaries**

Create error tracking setup:
```typescript
// apps/web/src/lib/error-tracking.ts
import * as Sentry from "@sentry/nextjs";

export function initErrorTracking() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
    });
  }
}

// With fallback logger
import { logger } from '@/lib/logger';

export function captureException(error: Error, context: Record<string, any> = {}) {
  logger.error({ error, context }, 'Exception captured');
  
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}
```

---

### C. **Performance Profiling Setup**

```typescript
// lib/performance-profiler.ts
export function startProfiling(label: string) {
  if (process.env.NODE_ENV === 'development') {
    console.time(label);
  }
  
  return () => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label);
    }
  };
}

// Usage in CMS service:
export async function syncPostToSearch(post: Post) {
  const end = startProfiling(`sync-post-${post.id}`);
  try {
    await meilisearch.index('posts').addDocuments([post]);
  } finally {
    end();
  }
}
```

---

## 🎨 V. DESIGN & VIBE OPTIMIZATION

### A. **Design System Documentation** (New File)

Create `docs/design/DESIGN_SYSTEM.md`:
```markdown
# PMTL_VN Design System

## Color Palette
- Primary: Gold (#D4AF37)
- Light: Cream (#FFF8DC)
- Dark: Zen Black (#1A1A1A)
- Accent: Ember Red (#C5643D)

## Typography
- Heading: Playfair Display (serif)
- Body: Inter (sans-serif)
- Scale: 12px, 14px, 16px, 18px, 24px, 32px, 48px

## Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Component Variants
[Document each component with visual examples]

## Animation Guidelines
- Smooth entrance: 300ms ease-out
- Hover effects: 150ms ease-in-out
- Page transitions: 400ms ease-in-out
```

---

### B. **Tailwind Configuration Enhancement**

```javascript
// tailwind.config.ts (enhance existing)
export default {
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FEF9F0',
          100: '#FDF0D9',
          200: '#FBE1B2',
          300: '#F9D78B',
          400: '#F1C856',
          500: '#D4AF37',    // Primary
          600: '#C99A1E',
          700: '#A67C1B',
          800: '#7D5918',
          900: '#543A0F',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FFF8DC',    // Light
          200: '#FFE8A3',
          300: '#FFD96A',
          400: '#FFC942',
          500: '#FFB81C',
          600: '#FF9E00',
          700: '#E68900',
          800: '#CC7700',
          900: '#8B5200',
        },
        zen: {
          50: '#F5F5F5',
          900: '#1A1A1A',    // Dark
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
};
```

---

### C. **Component Showcase/Storybook** (Optional)

```json
{
  "devDependencies": {
    "@storybook/react": "^7.4.0",
    "@storybook/addon-essentials": "^7.4.0",
    "@storybook/addon-interactions": "^7.4.0"
  },
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build"
  }
}
```

---

## 📊 VI. PRODUCTION CHECKLIST

Before launch, ensure:

```markdown
# Pre-Launch Checklist

## Security ✅
- [ ] docs/security.md written and reviewed
- [ ] CORS policy documented
- [ ] CSRF tokens configured
- [ ] Rate limiting in place
- [ ] .env.prod secrets management verified
- [ ] Database encryption at-rest checked
- [ ] Backup encryption verified

## Performance ✅
- [ ] Core Web Vitals baseline established
- [ ] ISR/revalidation strategy implemented
- [ ] Redis cache configured (Phase 2)
- [ ] Database indexes verified
- [ ] Search latency measured
- [ ] CDN/edge caching plan documented

## Debugging & Monitoring ✅
- [ ] Pino logging configured
- [ ] Error tracking (Sentry optional) setup
- [ ] Performance profiling enabled
- [ ] Health checks for all services
- [ ] Log aggregation plan documented

## Testing ✅
- [ ] Unit tests > 70% coverage
- [ ] Integration tests for API contracts
- [ ] E2E tests for critical flows
- [ ] Security testing plan documented

## Documentation ✅
- [ ] API contracts complete
- [ ] Field rules documented
- [ ] Runbooks for common operations
- [ ] Data migration strategy documented
- [ ] Incident response plan created
- [ ] Design system docs published

## DevOps ✅
- [ ] CI/CD pipeline documented
- [ ] GitHub Actions configured
- [ ] Disaster recovery tested
- [ ] Backup/restore procedure verified
- [ ] Monitoring alerts configured
- [ ] Load testing completed

## Team/Solo Doc ✅
- [ ] Conventions documented
- [ ] Code review guidelines established
- [ ] Debugging guide created
- [ ] Copilot instructions in place
- [ ] Skill configurations saved
```

---

## 📦 VII. QUICK SETUP COMMANDS

### Install Production Dependencies
```bash
cd PMTL_VN

# Security & logging
pnpm add helmet rate-limiter-flexible pino pino-pretty pino-http

# Performance
pnpm add web-vitals

# Better errors
pnpm add sentry

# Optional: Testing setup
pnpm add -D vitest supertest @testing-library/react

# Update apps/cms and apps/web separately if needed
cd apps/web
pnpm add sentry
```

### Setup Production Config
```bash
# Copy security config
cp packages/config/typescript/production.json packages/config/typescript/

# Setup logging service
touch apps/cms/src/lib/logger.ts
touch apps/web/src/lib/logger.ts

# Create error tracking
touch apps/cms/src/lib/error-tracking.ts
touch apps/web/src/lib/error-tracking.ts
```

### Activate Copilot Skill
```bash
mkdir -p .agents/skills/pmtl-production-ready
# Create SKILL.md (see above)
```

---

## 🎯 VIII. RECOMMENDED PRIORITY ORDER

### Week 1 (Foundation)
- [ ] Install security + logging libraries
- [ ] Setup pino logger in both apps
- [ ] Create .instructions.md for Copilot
- [ ] Add TypeScript production config
- [ ] Setup helmet + rate limiting

### Week 2-3 (Documentation)
- [ ] Write docs/security.md
- [ ] Create design system docs
- [ ] Document field rules
- [ ] Create debugging guide
- [ ] Write error handling patterns

### Week 4+ (Testing & Monitoring)
- [ ] Setup Vitest + test scaffolds
- [ ] Add performance profiling
- [ ] Configure error tracking (Sentry optional)
- [ ] Setup monitoring alerts
- [ ] Complete pre-launch checklist

---

## 🚀 FINAL RECOMMENDATION

For **solo dev + production + beautiful code vibe**:

### Must-Have Libraries
```json
{
  "dependencies": {
    "helmet": "^7.1.0",                    // Security headers
    "pino": "^8.16.0",                     // Logging
    "rate-limiter-flexible": "^2.4.0",     // Rate limiting
    "zod": "^3.22.0",                      // ✅ Already have
    "react-query": "^3.39.0",              // ✅ Already have
    "framer-motion": "^10.16.0",           // ✅ Already have
    "@radix-ui/react-*": "^latest",        // ✅ Already have
    "tailwind-merge": "^2.2.0",            // Tailwind helpers
    "class-variance-authority": "^0.7.0"   // Component variants
  },
  "devDependencies": {
    "vitest": "^0.34.0",                   // Testing
    "supertest": "^6.3.0",                 // API testing
    "@testing-library/react": "^14.1.0",   // Component testing
    "tsx": "^4.6.0"                        // ✅ Already have
  }
}
```

### Must-Do Configuration
1. ✅ Fix TypeScript `strict: false` → `true`
2. ✅ Create docs/security.md
3. ✅ Setup pino logging
4. ✅ Add rate limiting middleware
5. ✅ Create AI Copilot instructions
6. ✅ Setup design system docs

### Solo Dev Productivity Tips
```
USE THESE COMMANDS:
pnpm dev           # Local dev everything

USE COPILOT FOR:
- Bug fixing (explain error, ask for fix)
- Pattern extraction (show code, ask to refactor)
- Documentation (ask to generate docs from code)
- Testing (ask to write tests for function)

AVOID LETTING COPILOT:
- Generate features without logic (always review)
- Change security code (always audit first)
- Delete code (use git history instead)
```

---

**Next Step:** Ready to implement? Pick one item from Week 1 and let's go! 🚀
