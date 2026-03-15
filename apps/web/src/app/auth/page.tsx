'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { createHttpError, getErrorMessage } from '@/lib/http-error'

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

// ─── Input Field ──────────────────────────────────────────────
const Field = ({
  label, type = 'text', value, onChange, placeholder, error, children, id,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; error?: string; children?: React.ReactNode; id: string
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-foreground">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-secondary border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 ${error ? 'border-red-500/60' : 'border-border hover:border-gold/30'
          }`}
      />
      {children}
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

// ─── Login Form ───────────────────────────────────────────────
const LoginForm = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ'
    if (!password) e.password = 'Vui lòng nhập mật khẩu'
    else if (password.length < 6) e.password = 'Mật khẩu từ 6 ký tự trở lên'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw await createHttpError(res, 'Đăng nhập thất bại')
      }

      const data = await res.json()

      login(data.user)
      toast.success('Đăng nhập thành công')
      setSuccess(true)
      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      const message = getErrorMessage(error, 'Lỗi kết nối máy chủ')
      setErrors({ submit: message })
      toast.error(message)
      setLoading(false)
    }
  }

  if (success) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 space-y-4"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <p className="font-display text-lg text-foreground">Đăng nhập thành công</p>
      <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
      <Link href="/" className="inline-block mt-2 px-6 py-2.5 bg-gold text-black text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
        Về trang chủ
      </Link>
    </motion.div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{errors.submit}</p>
        </div>
      )}
      <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" error={errors.email} />
      <Field id="login-password" label="Mật khẩu" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••" error={errors.password}>
        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <EyeIcon open={showPwd} />
        </button>
      </Field>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" className="rounded border-border accent-gold" />
          Nhớ đăng nhập
        </label>
        <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gold text-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}

// ─── Google Login Section ──────────────────────────────────────
const GoogleLoginSection = () => {
  const handleGoogleLogin = () => {
    const strapiUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
    window.location.href = `${strapiUrl}/api/connect/google`
  }

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-secondary border border-border hover:border-gold/50 text-foreground text-sm font-medium rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083L43.611,20.083L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        Đăng nhập bằng Google
      </button>
    </>
  )
}

// ─── Register Form ────────────────────────────────────────────
const RegisterForm = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agree, setAgree] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Vui lòng nhập họ và tên'
    if (!email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ'
    if (!password) e.password = 'Vui lòng nhập mật khẩu'
    else if (password.length < 8) e.password = 'Mật khẩu từ 8 ký tự trở lên'
    if (password !== confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    if (!agree) e.agree = 'Vui lòng đồng ý với điều khoản'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          email,
          password
        }),
      })

      if (!res.ok) {
        throw await createHttpError(res, 'Đăng ký thất bại')
      }

      const data = await res.json()

      login(data.user)
      toast.success('Đăng ký thành công')
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (error) {
      const message = getErrorMessage(error, 'Lỗi kết nối máy chủ')
      setErrors({ submit: message })
      toast.error(message)
      setLoading(false)
    }
  }

  if (success) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 space-y-4"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <p className="font-display text-lg text-foreground">Đăng ký thành công!</p>
      <p className="text-sm text-muted-foreground">
        Đang chuyển tới trang chủ...
      </p>
      <Link href="/auth" className="inline-block mt-2 px-6 py-2.5 border border-gold/50 text-gold text-sm font-medium rounded-full hover:bg-gold/10 transition-all">
        Đăng nhập ngay
      </Link>
    </motion.div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{errors.submit}</p>
        </div>
      )}
      <Field id="reg-name" label="Họ và tên" value={name} onChange={setName} placeholder="Nguyễn Văn A" error={errors.name} />
      <Field id="reg-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" error={errors.email} />
      <Field id="reg-password" label="Mật khẩu" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Tối thiểu 8 ký tự" error={errors.password}>
        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <EyeIcon open={showPwd} />
        </button>
      </Field>
      <Field id="reg-confirm" label="Xác nhận mật khẩu" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={setConfirm} placeholder="Nhập lại mật khẩu" error={errors.confirm}>
        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <EyeIcon open={showConfirm} />
        </button>
      </Field>
      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 rounded border-border accent-gold"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Tôi đồng ý với điều khoản sử dụng và chính sách quyền riêng tư
          </span>
        </label>
        {errors.agree && <p className="text-xs text-red-400 mt-1">{errors.agree}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gold text-black text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-background/95 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/images/logoo.png" alt="Phap Mon Tam Linh" width={36} height={36} className="h-9 w-auto object-contain" />
        </Link>
        <Link href="/" className="text-xs text-muted-foreground hover:text-gold transition-colors">
          Về trang chủ
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-foreground mb-2">
              {tab === 'login' ? 'Chào mừng trở lại' : 'Tham gia cộng đồng'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tab === 'login'
                ? 'Đăng nhập để tiếp tục hành trình tu học'
                : 'Kết nối với hàng ngàn hành gia trên toàn thế giới'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex bg-secondary rounded-xl p-1 mb-6">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-background border border-border rounded-lg shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{t === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'login' ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>

            <GoogleLoginSection />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Mọi thông tin cá nhân đều được bảo mật tuyệt đối
          </p>
        </div>
      </div>
    </div>
  )
}
