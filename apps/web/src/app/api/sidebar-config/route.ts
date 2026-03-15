// ─────────────────────────────────────────────────────────────
//  app/api/sidebar-config/route.ts
//  GET — cấu hình sidebar từ CMS
// ─────────────────────────────────────────────────────────────
import qs from 'qs'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function GET() {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const query = qs.stringify(
    {
      populate: {
        downloadLinks: true,
        socialLinks: true,
        qrImages: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
      },
    },
    { encodeValuesOnly: true }
  )

  try {
    const res = await fetch(`${STRAPI_URL}/api/sidebar-config?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600, tags: ['sidebar-config'] },
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
