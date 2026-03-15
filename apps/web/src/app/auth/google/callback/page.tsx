'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Strapi may redirect with either access_token (provider token) or id_token (Strapi JWT)
    const accessToken = searchParams.get('access_token')
    const idToken = searchParams.get('id_token')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    const handleGoogleAuth = async () => {
      try {
        // Gửi token của Strapi tới Backend để set cookie
        const res = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            id_token: idToken,
          }),
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Xác thực phiên đăng nhập thất bại')

        if (data.user) {
          login(data.user)
          router.push('/')
        } else {
          throw new Error('Không có dữ liệu người dùng từ server')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi xác thực Google'
        toast.error(message)
        setError(message)
      }
    }

    if (errorParam) {
      const message = `${errorParam}: ${errorDescription || 'Không rõ lý do'}`
      toast.error(message)
      setError(message)
    } else if (accessToken || idToken) {
      handleGoogleAuth()
    } else {
      const message = 'Không tìm thấy token Google từ Strapi.'
      toast.error(message)
      setError(message)
    }
  }, [searchParams, login, router])

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h2 className="text-xl font-display text-foreground">Xác thực thất bại</h2>
        <p className="text-sm text-red-400 max-w-xs mx-auto">{error}</p>
        <button
          onClick={() => router.push('/auth')}
          className="px-6 py-2 bg-gold text-black rounded-full text-sm font-medium"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-10">
      <style>{`
        .pl {
          width: 8em;
          height: 8em;
          display: block;
          margin: 0 auto;
        }
        .pl__ring {
          animation: ringA 2s linear infinite;
        }
        .pl__ring--a { stroke: #ef4444; } /* Đỏ hỷ xả */
        .pl__ring--b { animation-name: ringB; stroke: #facc15; } /* Vàng trung đạo */
        .pl__ring--c { animation-name: ringC; stroke: #3b82f6; } /* Xanh từ bi */
        .pl__ring--d { animation-name: ringD; stroke: #f97316; } /* Cam trí tuệ */

        @keyframes ringA {
          from, 4% { stroke-dasharray: 0 660; stroke-width: 15; stroke-dashoffset: -330; }
          12% { stroke-dasharray: 60 600; stroke-width: 25; stroke-dashoffset: -335; }
          32% { stroke-dasharray: 60 600; stroke-width: 25; stroke-dashoffset: -595; }
          40%, 54% { stroke-dasharray: 0 660; stroke-width: 15; stroke-dashoffset: -660; }
          62% { stroke-dasharray: 60 600; stroke-width: 25; stroke-dashoffset: -665; }
          82% { stroke-dasharray: 60 600; stroke-width: 25; stroke-dashoffset: -925; }
          90%, to { stroke-dasharray: 0 660; stroke-width: 15; stroke-dashoffset: -990; }
        }
        @keyframes ringB {
          from, 12% { stroke-dasharray: 0 220; stroke-width: 15; stroke-dashoffset: -110; }
          20% { stroke-dasharray: 20 200; stroke-width: 25; stroke-dashoffset: -115; }
          40% { stroke-dasharray: 20 200; stroke-width: 25; stroke-dashoffset: -195; }
          48%, 62% { stroke-dasharray: 0 220; stroke-width: 15; stroke-dashoffset: -220; }
          70% { stroke-dasharray: 20 200; stroke-width: 25; stroke-dashoffset: -225; }
          90% { stroke-dasharray: 20 200; stroke-width: 25; stroke-dashoffset: -305; }
          98%, to { stroke-dasharray: 0 220; stroke-width: 15; stroke-dashoffset: -330; }
        }
        @keyframes ringC {
          from { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: 0; }
          8% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -5; }
          28% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -175; }
          36%, 58% { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: -220; }
          66% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -225; }
          86% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -395; }
          94%, to { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: -440; }
        }
        @keyframes ringD {
          from, 8% { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: 0; }
          16% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -5; }
          36% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -175; }
          44%, 50% { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: -220; }
          58% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -225; }
          78% { stroke-dasharray: 40 400; stroke-width: 25; stroke-dashoffset: -395; }
          86%, to { stroke-dasharray: 0 440; stroke-width: 15; stroke-dashoffset: -440; }
        }
      `}</style>

      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        {/* Vòng quay đa sắc pháp */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 240 240" className="pl">
            <circle strokeLinecap="round" strokeDashoffset={-330} strokeDasharray="0 660" strokeWidth={20} fill="none" r={105} cy={120} cx={120} className="pl__ring pl__ring--a shadow-lg" opacity="0.8" />
            <circle strokeLinecap="round" strokeDashoffset={-110} strokeDasharray="0 220" strokeWidth={20} fill="none" r={35} cy={120} cx={120} className="pl__ring pl__ring--b shadow-md" opacity="0.9" />
            <circle strokeLinecap="round" strokeDasharray="0 440" strokeWidth={20} fill="none" r={70} cy={120} cx={85} className="pl__ring pl__ring--c" opacity="0.8" />
            <circle strokeLinecap="round" strokeDasharray="0 440" strokeWidth={20} fill="none" r={70} cy={120} cx={155} className="pl__ring pl__ring--d" opacity="0.8" />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-3 font-display">Đang hoàn tất đăng nhập</h2>
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground/80 flex items-center gap-2">
            PHÁP MÔN TÂM LINH
          </p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-gold"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div>Đang tải...</div>}>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
