export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Bạn cần đăng nhập để tiếp tục.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  413: 'Tệp tải lên quá lớn. Vui lòng chọn tệp nhỏ hơn.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
}

function extractMessage(payload: unknown): string | undefined {
  if (!payload) return undefined

  if (typeof payload === 'string') {
    const message = payload.trim()
    return message || undefined
  }

  if (typeof payload !== 'object') return undefined

  const record = payload as Record<string, unknown>
  const direct = [record.message, record.error, record.detail]

  for (const value of direct) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>
    const nestedValues = [nested.message, nested.details, nested.name]
    for (const value of nestedValues) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  return undefined
}

export async function parseResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return res.json().catch(() => null)
  }

  const text = await res.text().catch(() => '')
  return text || null
}

export function normalizeApiErrorMessage(payload: unknown, status: number, fallback: string): string {
  return extractMessage(payload) ?? STATUS_MESSAGES[status] ?? (status >= 500 ? 'Máy chủ đang bận. Vui lòng thử lại sau.' : fallback)
}

export async function createHttpError(res: Response, fallback: string): Promise<HttpError> {
  const payload = await parseResponseBody(res)
  return createHttpErrorFromPayload(res.status, payload, fallback)
}

export function createHttpErrorFromPayload(status: number, payload: unknown, fallback: string): HttpError {
  const message = normalizeApiErrorMessage(payload, status, fallback)
  return new HttpError(status, message, payload)
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
