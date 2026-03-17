import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'

const webVitalSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(32),
  value: z.number().finite().nonnegative(),
  delta: z.number().finite(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  navigationType: z.string().min(1).max(120).optional(),
  pathname: z.string().min(1).max(500),
  href: z.string().url(),
  userAgent: z.string().min(1).max(1000).optional(),
  timestamp: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const payload = webVitalSchema.parse(await request.json())

    logger.info('Web vital recorded', {
      metric: {
        id: payload.id,
        name: payload.name,
        value: payload.value,
        delta: payload.delta,
        rating: payload.rating ?? null,
        navigationType: payload.navigationType ?? null,
      },
      route: payload.pathname,
      href: payload.href,
      userAgent: payload.userAgent ?? null,
      timestamp: payload.timestamp,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.warn('Web vital payload rejected', { error })
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
