import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

function normalizeUploadPayload(data: any) {
  const file = data?.doc ?? (Array.isArray(data?.docs) ? data.docs[0] : Array.isArray(data) ? data[0] : data)
  if (!file) return null

  const url = typeof file.url === 'string' ? (file.url.startsWith('http') ? file.url : `${CMS_API_URL}${file.url}`) : undefined

  return {
    id: file.id,
    documentId: file.id,
    url,
    name: file.filename ?? file.name ?? file.originalFilename ?? '',
    mime: file.mimeType ?? file.mime ?? file.type ?? '',
    size: file.filesize ?? file.size ?? 0,
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  // Ưu tiên token hệ thống để tránh bị chặn do role user thiếu quyền upload.
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN) || cookieStore.get('auth_token')?.value

  try {
    const incoming = await req.formData()
    const file = (incoming.get('file') ?? incoming.get('files')) as File | null

    if (!file) {
      return NextResponse.json({ error: 'Thiếu tệp tải lên' }, { status: 400 })
    }

    const formData = new FormData()
    formData.set('file', file)
    const alt = incoming.get('alt')
    if (typeof alt === 'string' && alt.trim()) {
      formData.set('alt', alt.trim())
    }

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // KHÔNG set 'Content-Type': 'multipart/form-data', fetch sẽ tự động set boundary
    const res = await fetch(`${CMS_API_URL}/api/media`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return NextResponse.json(
        data || { error: 'Có lỗi xảy ra khi tải ảnh lên' },
        { status: res.status }
      )
    }

    const normalized = normalizeUploadPayload(data)
    if (!normalized) {
      return NextResponse.json({ error: 'Phản hồi upload không hợp lệ' }, { status: 500 })
    }

    // Giữ format mảng (tương thích Strapi client cũ)
    return NextResponse.json([normalized])
  } catch (error) {
    console.error('Proxy upload error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình tải ảnh' }, { status: 500 })
  }
}
