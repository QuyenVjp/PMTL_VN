// ─────────────────────────────────────────────────────────────
//  fe-pmtl/lib/api/user.ts
//  API client cho profile — proxy qua Next.js routes để dùng httpOnly cookie
// ─────────────────────────────────────────────────────────────

import { createHttpError, getErrorMessage } from '@/lib/http-error'

/**
 * Cập nhật thông tin: Lưu tên, bio... HOẶC truyền ID của Media vào avatar_url
 * Proxy qua /api/user/update (server đọc JWT từ httpOnly cookie)
 */
export async function updateMe(data: Record<string, unknown>): Promise<unknown> {
  const res = await fetch('/api/user/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await createHttpError(res, 'Cập nhật thất bại')
  }
  return res.json()
}

/**
 * Upload avatar và trả về id + url
 * Proxy qua /api/user/avatar (server đọc JWT từ httpOnly cookie)
 */
export async function uploadAvatarFile(file: File): Promise<{ id: number; url: string }> {
  const form = new FormData()
  form.append('files', file)

  const res = await fetch('/api/user/avatar', {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw await createHttpError(res, 'Upload thất bại')
  return res.json()
}

export { getErrorMessage }
