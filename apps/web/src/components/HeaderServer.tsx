// ─────────────────────────────────────────────────────────────
//  components/HeaderServer.tsx — Server wrapper for Header
//  Fetches navigation data from CMS and passes to client Header
// ─────────────────────────────────────────────────────────────

import Header from '@/components/Header'

export default async function HeaderServer() {
  return <Header />
}
