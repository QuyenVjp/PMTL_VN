// ─────────────────────────────────────────────────────────────
//  app/api/today-chant/route.ts
//
//  GET /api/today-chant?date=YYYY-MM-DD&planSlug=<optional>
//
//  1) Tính lunarMonth/lunarDay từ date dùng @forvn/vn-lunar-calendar
//  2) Gọi CMS chanting endpoint và trả về kết quả cho client
// ─────────────────────────────────────────────────────────────
import { connection, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchTodayChant } from '@/lib/api/chanting';
import { CHANTING_ADMIN_COPY } from '@/lib/config/chanting';
import { logger } from '@/lib/logger';

const todayChantQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  planSlug: z.string().trim().min(1).max(160).optional(),
});

export async function GET(req: NextRequest) {
  await connection();

  try {
    const parsed = todayChantQuerySchema.parse({
      date: req.nextUrl.searchParams.get('date') ?? undefined,
      planSlug: req.nextUrl.searchParams.get('planSlug') ?? undefined,
    });
    const planSlug = parsed.planSlug;

    // ── Xác định ngày hôm nay (Asia/Bangkok = UTC+7) ──
    const dateParam = parsed.date;
    let isoDate: string;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      isoDate = dateParam;
    } else {
      // Tính ngày theo timezone Asia/Bangkok (UTC+7)
      const now = new Date();
      const bkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      isoDate = bkk.toISOString().slice(0, 10);
    }

    // ── Tính âm lịch ──────────────────────────────────
    let lunarMonth: number | null = null;
    let lunarDay: number | null = null;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      // @forvn/vn-lunar-calendar API: new LunarCalendar(day, month, year)._lunarDate
      const lunarLib = await import('@forvn/vn-lunar-calendar');
      const LC = (lunarLib as any).LunarCalendar ?? (lunarLib as any).default?.LunarCalendar;
      if (LC) {
        const lc = new LC(day, month, year);
        const ld = (lc as any)._lunarDate;
        if (ld) {
          lunarMonth = ld.month ?? null;
          lunarDay = ld.day ?? null;
        }
      }
    } catch (lunarErr) {
      logger.warn('today-chant lunar conversion failed', { error: lunarErr });
    }

    const data = await fetchTodayChant({ date: isoDate, lunarMonth, lunarDay, planSlug });

    if (!data) {
      return NextResponse.json(
        {
          error: planSlug
            ? `Chưa có dữ liệu cho slug "${planSlug}". Hãy kiểm tra entry trong "${CHANTING_ADMIN_COPY.collectionName}" và bảo đảm đã gắn "${CHANTING_ADMIN_COPY.itemComponent}".`
            : `Chưa có plan publish nào có dữ liệu. Hãy kiểm tra "${CHANTING_ADMIN_COPY.collectionName}" và bảo đảm đã gắn "${CHANTING_ADMIN_COPY.itemComponent}".`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Tham số không hợp lệ' }, { status: 400 });
    }

    logger.error('today-chant route failed', { error: err, path: req.nextUrl.pathname });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
