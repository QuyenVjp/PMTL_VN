import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  // Ưu tiên token hệ thống để tránh bị chặn do role user thiếu quyền upload.
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN) || cookieStore.get('auth_token')?.value

  try {
    const formData = await req.formData()

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Gửi trực tiếp FormData tới API Strapi
    // KHÔNG set 'Content-Type': 'multipart/form-data', fetch sẽ tự động set boundary
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
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

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy upload error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình tải ảnh' }, { status: 500 })
  }
}
