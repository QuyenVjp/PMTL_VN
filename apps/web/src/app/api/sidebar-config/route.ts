// ─────────────────────────────────────────────────────────────
//  app/api/sidebar-config/route.ts
//  GET — cấu hình sidebar từ CMS
// ─────────────────────────────────────────────────────────────
import { connection } from 'next/server'
import { getSidebarConfig } from '@/lib/api/sidebar'
import { logger } from '@/lib/logger'

export async function GET() {
  await connection()

  try {
    const data = await getSidebarConfig()
    return Response.json(data)
  } catch (error) {
    logger.error('Sidebar config API failed', { error })
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
