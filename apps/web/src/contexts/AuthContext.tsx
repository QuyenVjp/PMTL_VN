'use client'
// ─────────────────────────────────────────────────────────────
//  contexts/AuthContext.tsx
//  Global auth state — JWT lưu trong httpOnly cookie server-side.
//  Client chỉ lưu thông tin user (không lưu JWT).
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

export interface AuthUser {
  id: number
  documentId?: string
  username: string
  email: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  // Các trường mở rộng (khai báo trong schema extension)
  fullName?: string | null
  avatar_url?: string | null
  phone?: string | null
  address?: string | null
  bio?: string | null
  dharmaName?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  /** Luôn null — JWT được lưu trong httpOnly cookie, không truy cập từ JS */
  token: null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => { },
  logout: () => { },
  refetch: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Khôi phục session qua /api/auth/me — đọc httpOnly cookie phía server
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { setUser(null); return }
      const data = await res.json()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = useCallback((userData: AuthUser) => {
    setUser(userData)
  }, [])

  // Xóa cookie ngay lập tức qua API route, reset state đồng thời
  const logout = useCallback(() => {
    setUser(null)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => { })
  }, [])

  const refetch = useCallback(async () => {
    await fetchMe()
  }, [fetchMe])

  return (
    <AuthContext.Provider value={{ user, token: null, loading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
