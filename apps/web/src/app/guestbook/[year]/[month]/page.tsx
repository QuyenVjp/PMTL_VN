// app/guestbook/[year]/[month]/page.tsx
// Redirect sang route chuan /guestbook/archive/[year]/[month]
import { redirect } from 'next/navigation'

export default async function GuestbookOldArchivePage({
  params
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params
  redirect(`/guestbook/archive/${year}/${month}`)
}
