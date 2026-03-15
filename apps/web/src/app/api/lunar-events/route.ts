// Route Handler: /api/lunar-events
// Proxy server-side fetch đến Strapi với API token để populate relatedBlogs đúng cách
// Client (use client page) gọi route này thay vì gọi Strapi trực tiếp

import { NextResponse } from 'next/server';
import { fetchLunarEvents } from '@/lib/api/lunar-calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await fetchLunarEvents();
    return NextResponse.json(events, {
      headers: {
        // Cache ngắn — dữ liệu lịch ít thay đổi
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (err) {
    console.error('[/api/lunar-events] Error:', err);
    return NextResponse.json([], { status: 200 }); // trả [] để FE không crash
  }
}
