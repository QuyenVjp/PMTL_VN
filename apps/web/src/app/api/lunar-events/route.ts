// Route Handler: /api/lunar-events
// Proxy server-side fetch đến CMS với API token để populate relatedBlogs đúng cách
// Client (use client page) gọi route này thay vì gọi CMS trực tiếp

import { NextResponse } from 'next/server';
import { connection } from 'next/server';
import { fetchLunarEvents } from '@/lib/api/lunar-calendar';
import { logger } from '@/lib/logger';

export async function GET() {
  await connection();
  try {
    const events = await fetchLunarEvents();
    return NextResponse.json(events, {
      headers: {
        // Cache ngắn — dữ liệu lịch ít thay đổi
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    logger.error('Lunar events API failed', { error });
    return NextResponse.json([], { status: 200 }); // trả [] để FE không crash
  }
}
