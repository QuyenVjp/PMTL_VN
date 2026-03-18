'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GalleryVerticalEnd } from 'lucide-react'

import { cn } from '@/lib/utils'
import { LoginForm } from '@/features/auth/components/login-form'
import { RegisterForm } from '@/features/auth/components/register-form'

type AuthMode = 'login' | 'register'

const authModes: AuthMode[] = ['login', 'register']

function resolveMode(value: string | null): AuthMode {
  return value === 'register' ? 'register' : 'login'
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = resolveMode(searchParams.get('mode'))

  const setMode = (nextMode: AuthMode) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', nextMode)
    router.replace(`/auth?${params.toString()}`, { scroll: false })
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,hsl(var(--gold)/0.14),transparent_26%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--card)))] px-4 py-4 md:px-6 md:py-6">
      <div className="grid min-h-[calc(100svh-2rem)] overflow-hidden rounded-[2rem] border border-border/70 bg-card/92 shadow-elevated backdrop-blur lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
        <section className="relative flex flex-col bg-[linear-gradient(180deg,hsl(var(--background)/0.98),hsl(var(--card)/0.94))]">
          <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-8">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-gold">
                <GalleryVerticalEnd className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold tracking-[0.02em] text-foreground">Pháp Môn Tâm Linh</span>
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Portal thành viên</span>
              </span>
            </Link>
            <Link
              href="/"
              className="rounded-full border border-border/80 bg-background/75 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Về trang chủ
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 pb-8 pt-2 md:px-10 md:pb-10">
            <div className="w-full max-w-md">
              <div className="mb-6 inline-flex w-full rounded-2xl border border-border/80 bg-background/70 p-1.5 shadow-[inset_0_1px_0_hsl(var(--background)/0.8)]">
                {authModes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={cn(
                      'min-h-11 flex-1 rounded-[1rem] px-4 text-sm font-medium transition-all duration-200 touch-manipulation',
                      mode === item
                        ? 'bg-card text-foreground shadow-ant'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </button>
                ))}
              </div>

              <div className="rounded-[1.75rem] border border-border/75 bg-background/76 p-6 shadow-[inset_0_1px_0_hsl(var(--background)/0.85)] backdrop-blur md:p-8">
                {mode === 'login' ? <LoginForm redirectTo="/profile" /> : <RegisterForm />}
              </div>
            </div>
          </div>
        </section>

        <aside className="relative hidden lg:block">
          <Image
            src="/images/hero-bg.jpg"
            alt="Không gian thiền định của Pháp Môn Tâm Linh"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--zen-dark)/0.24),hsl(var(--zen-dark)/0.72))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,hsl(var(--gold)/0.26),transparent_24%),radial-gradient(circle_at_80%_70%,hsl(var(--gold-glow)/0.18),transparent_26%)]" />

          <div className="absolute inset-x-0 bottom-0 p-8 xl:p-12">
            <div className="max-w-xl rounded-[2rem] border border-white/12 bg-black/22 p-8 text-white backdrop-blur-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-white/65">
                Nơi nhịp tu học được giữ đều
              </p>
              <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] text-white xl:text-5xl">
                Một cổng vào yên tĩnh, rõ ràng, và đủ đẹp để người dùng muốn quay lại.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/72">
                Giao diện đăng nhập được làm lại theo tinh thần tối giản cao cấp: nhịp thở rộng, tương phản sạch,
                và một điểm nhấn vàng đủ tiết chế để giữ bản sắc PMTL.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
