// ─────────────────────────────────────────────────────────────
//  app/api/revalidate/route.ts
//
//  On-Demand Revalidation endpoint for Strapi v5 Webhooks.
//
//  HOW IT WORKS:
//  1. Admin publishes/updates/deletes content in Strapi
//  2. Strapi fires a webhook POST to this endpoint
//  3. This handler calls revalidateTag() → Next.js clears the
//     specific cache entries instantly (no 5-minute wait)
//
//  SETUP IN STRAPI ADMIN:
//  Settings → Webhooks → Add new webhook
//    URL:     http://your-fe-domain.com/api/revalidate
//    Headers: Authorization: Bearer <REVALIDATE_SECRET>
//    Events:  entry.publish, entry.update, entry.unpublish, entry.delete
//
//  .env.local:
//    REVALIDATE_SECRET=any-long-random-string-you-choose
// ─────────────────────────────────────────────────────────────

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getRevalidationTarget } from '@/lib/revalidate'

/** Strapi v5 webhook payload shape */
interface StrapiWebhookPayload {
  event: 'entry.create' | 'entry.update' | 'entry.publish' | 'entry.unpublish' | 'entry.delete' | string
  createdAt: string
  model: string
  uid: string
  entry?: {
    id?: number
    documentId?: string
    slug?: string
    [key: string]: unknown
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Security: Validate the secret token ─────────────────
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Server misconfiguration: missing secret' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  if (token !== secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ── 2. Parse the Strapi webhook payload ────────────────────
  let payload: StrapiWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  const { event, model, uid, entry } = payload
  const primary = getRevalidationTarget(uid || model, entry)
  const fallback = uid && uid !== model ? getRevalidationTarget(model, entry) : { tags: [], paths: [] }
  const tagsToInvalidate = Array.from(new Set([...primary.tags, ...fallback.tags]))
  const pathsToInvalidate = Array.from(new Set([...primary.paths, ...fallback.paths]))

  if (tagsToInvalidate.length === 0 && pathsToInvalidate.length === 0) {
    return NextResponse.json({
      revalidated: false,
      message: `No cache targets registered for model: ${model}`,
    })
  }

  for (const tag of tagsToInvalidate) {
    revalidateTag(tag, 'max')
  }
  for (const path of pathsToInvalidate) {
    revalidatePath(path)
  }

  return NextResponse.json({
    revalidated: true,
    model,
    uid,
    event,
    tags: tagsToInvalidate,
    paths: pathsToInvalidate,
    timestamp: new Date().toISOString(),
  })
}

// ── Health check ──────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint is active. Use POST with Strapi webhook.',
    docsUrl: 'https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation',
  })
}
