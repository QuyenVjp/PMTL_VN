// ─────────────────────────────────────────────────────────────
//  app/api/practice-log/route.ts
//
//  GET  /api/practice-log?date=YYYY-MM-DD&planSlug=...
//  PUT  /api/practice-log  body: { date, planSlug, itemsProgress }
//
//  Proxy đến Strapi — đọc JWT từ httpOnly cookie (không dùng Authorization header)
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

function proxyJsonOrEmpty(res: Response, data: unknown) {
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(data, { status: res.status });
}

async function getUserJwt(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value ?? null
}

export async function GET(req: NextRequest) {
  const jwt = await getUserJwt();
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  const planSlug = searchParams.get('planSlug');

  if (!date) return NextResponse.json({ error: 'Thiếu date' }, { status: 400 });

  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my?${qs}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { error: text || 'Unknown backend error' };
    }

    return proxyJsonOrEmpty(res, data);
  } catch (err) {
    console.error('[api/practice-log GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const jwt = await getUserJwt();
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { error: text || 'Unknown backend error' };
    }

    return proxyJsonOrEmpty(res, data);
  } catch (err) {
    console.error('[api/practice-log PUT]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
