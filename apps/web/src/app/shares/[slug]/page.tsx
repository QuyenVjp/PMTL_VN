// ─────────────────────────────────────────────────────────────
//  /shares/[slug] — Deprecated detail route
//  Redirects to /shares with modal open
// ─────────────────────────────────────────────────────────────
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunityPostDetailPage({ params }: Props) {
  const { slug } = await params
  redirect(`/shares?post=${encodeURIComponent(slug)}`)
}
