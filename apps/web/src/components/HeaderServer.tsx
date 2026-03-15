// ─────────────────────────────────────────────────────────────
//  components/HeaderServer.tsx — Server wrapper for Header
//  Fetches navigation data from CMS and passes to client Header
// ─────────────────────────────────────────────────────────────

import Header from '@/components/Header'
import { buildNavigation } from '@/lib/api/navigation'

export default async function HeaderServer() {
  let nav = null
  try {
    nav = await buildNavigation()
  } catch (err) {
    console.error('[HeaderServer] Failed to fetch navigation:', err)
    // Fallback to default nav (Header component handles this)
  }

  return <Header tuHoc={nav?.tuHoc} congDong={nav?.congDong} hoTri={nav?.hoTri} />
}
