---
description: Generate API documentation from NestJS controllers in apps/api
argument-hint: [module-name or controller path]
---

Generate API documentation for: $ARGUMENTS

If no argument, scan all controllers in `apps/api/src/modules/`.

## Step 1 — Scan source

Read controller files: `apps/api/src/modules/$ARGUMENTS/$ARGUMENTS.controller.ts`
Read schema files: `apps/api/src/modules/$ARGUMENTS/$ARGUMENTS.schemas.ts`
Read DTO files: `apps/api/src/modules/$ARGUMENTS/dto/`

## Step 2 — Extract and document each endpoint

For each route, produce:

```markdown
## [METHOD] /api/[path]

**Auth**: Required / Public
**Roles**: member / admin / super-admin
**Rate-limit**: Yes / No

### Request body
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ...   | ...  | ...      | Zod rule   |

### Response (200)
\`\`\`json
{ ... }
\`\`\`

### Errors
| Code | HTTP | Condition |
|------|------|-----------|
| `invalid_body` | 400 | Zod schema rejected |
| `forbidden` | 403 | Role/ownership check failed |
| `not_found` | 404 | Entity doesn't exist |

### cURL example
\`\`\`bash
curl -X POST https://api.pmtl.vn/api/[path] \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
\`\`\`
```

## Step 3 — Save output

Write to: `docs/api/[module-name].md`

Ask for confirmation before writing.
