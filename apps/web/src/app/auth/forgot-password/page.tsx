'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { createHttpError, getErrorMessage } from '@/lib/http-error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw await createHttpError(res, 'Gửi yêu cầu thất bại')
      }

      setSuccess(true)
      toast.success('Đã gửi email đặt lại mật khẩu')
    } catch (e) {
      const message = getErrorMessage(e, 'Lỗi kết nối máy chủ')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-background/95 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/images/logoo.png" alt="Phap Mon Tam Linh" width={36} height={36} className="h-9 w-auto object-contain" />
        </Link>
        <Link href="/auth" className="text-xs text-muted-foreground hover:text-gold transition-colors">
          Quay lại đăng nhập
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="font-display text-2xl text-foreground mb-2">Quên mật khẩu</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.
          </p>

          {success ? (
            <div className="p-4 rounded-lg border border-gold/30 bg-gold/10 text-sm text-foreground">
              Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold text-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
