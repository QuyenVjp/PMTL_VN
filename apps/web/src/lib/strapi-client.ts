// ═══════════════════════════════════════════════════════════════
//  lib/strapi-client.ts — Client-side API utilities
//
//  ⚠️  QUAN TRỌNG: File này dành cho 'use client' components.
//  KHÔNG import STRAPI_API_TOKEN ở đây.
//  KHÔNG gọi strapiFetch() từ file này.
//
//  Auth: JWT được lưu trong httpOnly cookie — không truy cập từ JS.
//  Các endpoint cần auth phải proxy qua /api/... routes.
// ═══════════════════════════════════════════════════════════════

const API = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

// ─── Auth helpers (backward compat — không còn dùng localStorage) ─────

/** @deprecated JWT nằm trong httpOnly cookie, không thể đọc từ JS */
export function getAuthToken(): null {
  return null
}

/** Luôn trả {} — dùng httpOnly cookie thay vì Authorization header */
export function buildAuthHeaders(): HeadersInit {
  return {}
}

/** Build JSON content-type header */
export function buildJsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' }
}

// ─── Base fetch ───────────────────────────────────────────────

/**
 * Gọi API Strapi từ phía client (browser).
 * Chỉ dùng cho các endpoint Public. Endpoint cần auth phải proxy qua /api/...
 * @example
 *   const data = await clientFetch('/blog-posts', { page: 1 })
 */
export async function clientFetch<T = unknown>(
  path: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.set(k, String(v))
  })
  const url = `/api${path}${qs.toString() ? `?${qs}` : ''}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API Error ${res.status}: ${path}`)
  }
  return res.json()
}

// ─── Upload ───────────────────────────────────────────────────

/**
 * Upload file lên Strapi Media Library (public endpoint).
 * Dùng cho community post images — không cần auth.
 * Để upload avatar, dùng uploadAvatarFile() từ lib/api/user.ts
 * @example
 *   const fileId = await uploadFile(file)
 */
export async function uploadFile(file: File): Promise<{
  id: number
  url: string
  name: string
  mime: string
  size: number
}> {
  const formData = new FormData()
  formData.append('files', file)
  const res = await fetch(`/api/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Upload file thất bại')
  const json = await res.json()
  if (!json[0]) throw new Error('Upload trả về dữ liệu trống')
  return {
    id: json[0].id,
    url: json[0].url.startsWith('http') ? json[0].url : `${API}${json[0].url}`,
    name: json[0].name,
    mime: json[0].mime,
    size: json[0].size,
  }
}

/**
 * Upload nhiều file cùng lúc — dùng cho gallery.
 */
export async function uploadMultipleFiles(files: File[]): Promise<Array<{
  id: number
  url: string
  name: string
}>> {
  return Promise.all(files.map((f) => uploadFile(f)))
}

// ─── Media URL (client-side) ─────────────────────────────────

/** Resolve URL ảnh/file từ Strapi media object, client-side version */
export function resolveUrl(media: any): string | null {
  if (!media) return null
  const url = media?.url ?? null
  if (!url) return null
  return url.startsWith('http') ? url : `${API}${url}`
}

export const STRAPI_API = API
