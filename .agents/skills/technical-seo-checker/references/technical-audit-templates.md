# Technical SEO Checker — Output Templates

Detailed output templates for technical-seo-checker steps 3-9. Referenced from [SKILL.md](../SKILL.md).

---

## Step 3: Audit Site Speed & Core Web Vitals

```markdown
## Performance Analysis

### Core Web Vitals

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| LCP (Largest Contentful Paint) | [X]s | [X]s | <2.5s | [OK]/[WARN]️/[FAIL] |
| FID (First Input Delay) | [X]ms | [X]ms | <100ms | [OK]/[WARN]️/[FAIL] |
| CLS (Cumulative Layout Shift) | [X] | [X] | <0.1 | [OK]/[WARN]️/[FAIL] |
| INP (Interaction to Next Paint) | [X]ms | [X]ms | <200ms | [OK]/[WARN]️/[FAIL] |

### Additional Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Time to First Byte (TTFB) | [X]ms | [OK]/[WARN]️/[FAIL] |
| First Contentful Paint (FCP) | [X]s | [OK]/[WARN]️/[FAIL] |
| Speed Index | [X] | [OK]/[WARN]️/[FAIL] |
| Total Blocking Time | [X]ms | [OK]/[WARN]️/[FAIL] |
| Page Size | [X]MB | [OK]/[WARN]️/[FAIL] |
| Requests | [X] | [OK]/[WARN]️/[FAIL] |

### Performance Issues

**LCP Issues**:
- [Issue]: [Impact] - [Solution]
- [Issue]: [Impact] - [Solution]

**CLS Issues**:
- [Issue]: [Impact] - [Solution]

**Resource Loading**:
| Resource Type | Count | Size | Issues |
|---------------|-------|------|--------|
| Images | [X] | [X]MB | [notes] |
| JavaScript | [X] | [X]MB | [notes] |
| CSS | [X] | [X]KB | [notes] |
| Fonts | [X] | [X]KB | [notes] |

### Optimization Recommendations

**High Impact**:
1. [Recommendation] - Est. improvement: [X]s
2. [Recommendation] - Est. improvement: [X]s

**Medium Impact**:
1. [Recommendation]
2. [Recommendation]

**Performance Score**: [X]/10
```

---

## Step 4: Audit Mobile-Friendliness

```markdown
## Mobile Optimization Analysis

### Mobile-Friendly Test

| Check | Status | Notes |
|-------|--------|-------|
| Mobile-friendly overall | [OK]/[FAIL] | [notes] |
| Viewport configured | [OK]/[FAIL] | [viewport tag] |
| Text readable | [OK]/[WARN]️/[FAIL] | Font size: [X]px |
| Tap targets sized | [OK]/[WARN]️/[FAIL] | [notes] |
| Content fits viewport | [OK]/[FAIL] | [notes] |
| No horizontal scroll | [OK]/[FAIL] | [notes] |

### Responsive Design Check

| Element | Desktop | Mobile | Issues |
|---------|---------|--------|--------|
| Navigation | [status] | [status] | [notes] |
| Images | [status] | [status] | [notes] |
| Forms | [status] | [status] | [notes] |
| Tables | [status] | [status] | [notes] |
| Videos | [status] | [status] | [notes] |

### Mobile-First Indexing

| Check | Status | Notes |
|-------|--------|-------|
| Mobile version has all content | [OK]/[WARN]️/[FAIL] | [notes] |
| Mobile has same structured data | [OK]/[WARN]️/[FAIL] | [notes] |
| Mobile has same meta tags | [OK]/[WARN]️/[FAIL] | [notes] |
| Mobile images have alt text | [OK]/[WARN]️/[FAIL] | [notes] |

**Mobile Score**: [X]/10
```

---

## Step 5: Audit Security & HTTPS

```markdown
## Security Analysis

### HTTPS Status

| Check | Status | Notes |
|-------|--------|-------|
| SSL certificate valid | [OK]/[FAIL] | Expires: [date] |
| HTTPS enforced | [OK]/[FAIL] | [redirects properly?] |
| Mixed content | [OK]/[WARN]️/[FAIL] | [X] issues |
| HSTS enabled | [OK]/[WARN]️ | [notes] |
| Certificate chain | [OK]/[WARN]️/[FAIL] | [notes] |

### Security Headers

| Header | Present | Value | Recommended |
|--------|---------|-------|-------------|
| Content-Security-Policy | [OK]/[FAIL] | [value] | [recommendation] |
| X-Frame-Options | [OK]/[FAIL] | [value] | DENY or SAMEORIGIN |
| X-Content-Type-Options | [OK]/[FAIL] | [value] | nosniff |
| X-XSS-Protection | [OK]/[FAIL] | [value] | 1; mode=block |
| Referrer-Policy | [OK]/[FAIL] | [value] | [recommendation] |

**Security Score**: [X]/10
```

---

## Step 6: Audit URL Structure

```markdown
## URL Structure Analysis

### URL Pattern Review

| Check | Status | Notes |
|-------|--------|-------|
| HTTPS URLs | [OK]/[WARN]️/[FAIL] | [X]% HTTPS |
| Lowercase URLs | [OK]/[WARN]️/[FAIL] | [notes] |
| No special characters | [OK]/[WARN]️/[FAIL] | [notes] |
| Readable/descriptive | [OK]/[WARN]️/[FAIL] | [notes] |
| Appropriate length | [OK]/[WARN]️/[FAIL] | Avg: [X] chars |
| Keywords in URLs | [OK]/[WARN]️/[FAIL] | [notes] |
| Consistent structure | [OK]/[WARN]️/[FAIL] | [notes] |

### URL Issues Found

| Issue Type | Count | Examples |
|------------|-------|----------|
| Dynamic parameters | [X] | [URLs] |
| Session IDs in URLs | [X] | [URLs] |
| Uppercase characters | [X] | [URLs] |
| Special characters | [X] | [URLs] |
| Very long URLs (>100) | [X] | [URLs] |

### Redirect Analysis

| Check | Status | Notes |
|-------|--------|-------|
| Redirect chains | [X] found | [max chain length] |
| Redirect loops | [X] found | [URLs] |
| 302 → 301 needed | [X] found | [URLs] |
| Broken redirects | [X] found | [URLs] |

**URL Score**: [X]/10
```

---

## Step 7: Audit Structured Data

> **CORE-EEAT alignment**: Schema markup quality maps to O05 (Schema Markup) in the CORE-EEAT benchmark. See [content-quality-auditor](../../cross-cutting/content-quality-auditor/) for full content quality audit.

```markdown
## Structured Data Analysis

### Schema Markup Found

| Schema Type | Pages | Valid | Errors |
|-------------|-------|-------|--------|
| [Type 1] | [X] | [OK]/[FAIL] | [errors] |
| [Type 2] | [X] | [OK]/[FAIL] | [errors] |

### Validation Results

**Errors**:
- [Error 1]: [affected pages] - [solution]
- [Error 2]: [affected pages] - [solution]

**Warnings**:
- [Warning 1]: [notes]

### Missing Schema Opportunities

| Page Type | Current Schema | Recommended |
|-----------|----------------|-------------|
| Blog posts | [current] | Article + FAQ |
| Products | [current] | Product + Review |
| Homepage | [current] | Organization |

**Structured Data Score**: [X]/10
```

---

## Step 8: Audit International SEO (if applicable)

```markdown
## International SEO Analysis

### Hreflang Implementation

| Check | Status | Notes |
|-------|--------|-------|
| Hreflang tags present | [OK]/[FAIL] | [notes] |
| Self-referencing | [OK]/[WARN]️/[FAIL] | [notes] |
| Return tags present | [OK]/[WARN]️/[FAIL] | [notes] |
| Valid language codes | [OK]/[WARN]️/[FAIL] | [notes] |
| x-default tag | [OK]/[WARN]️ | [notes] |

### Language/Region Targeting

| Language | URL | Hreflang | Status |
|----------|-----|----------|--------|
| [en-US] | [URL] | [tag] | [OK]/[WARN]️/[FAIL] |
| [es-ES] | [URL] | [tag] | [OK]/[WARN]️/[FAIL] |

**International Score**: [X]/10
```

---

## Step 9: Generate Technical Audit Summary

```markdown
# Technical SEO Audit Report

**Domain**: [domain]
**Audit Date**: [date]
**Pages Analyzed**: [X]

## Overall Technical Health: [X]/100

```
Score Breakdown:
████████░░ Crawlability: 8/10
███████░░░ Indexability: 7/10
█████░░░░░ Performance: 5/10
████████░░ Mobile: 8/10
█████████░ Security: 9/10
██████░░░░ URL Structure: 6/10
█████░░░░░ Structured Data: 5/10
```

## Critical Issues (Fix Immediately)

1. **[Issue]**: [Impact]
   - Affected: [pages/scope]
   - Solution: [specific fix]
   - Priority: 🔴 Critical

2. **[Issue]**: [Impact]
   - Affected: [pages/scope]
   - Solution: [specific fix]
   - Priority: 🔴 Critical

## High Priority Issues

1. **[Issue]**: [Solution]
2. **[Issue]**: [Solution]

## Medium Priority Issues

1. **[Issue]**: [Solution]
2. **[Issue]**: [Solution]

## Quick Wins

These can be fixed quickly for immediate improvement:

1. [Quick fix 1]
2. [Quick fix 2]
3. [Quick fix 3]

## Implementation Roadmap

### Week 1: Critical Fixes
- [ ] [Task 1]
- [ ] [Task 2]

### Week 2-3: High Priority
- [ ] [Task 1]
- [ ] [Task 2]

### Week 4+: Optimization
- [ ] [Task 1]
- [ ] [Task 2]

## Monitoring Recommendations

Set up alerts for:
- Core Web Vitals drops
- Crawl error spikes
- Index coverage changes
- Security issues
```

