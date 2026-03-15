'use client'

// ─────────────────────────────────────────────────────────────
//  components/BlogPagination.tsx — Phân trang dùng shadcn/ui
//  Client component — nhận tổng trang & trang hiện tại, điều hướng qua URL
// ─────────────────────────────────────────────────────────────

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPaginationRange } from '@/lib/config/pagination'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  /** Nếu true, ẩn khi totalPages <= 1 */
  className?: string
}

export default function BlogPagination({ currentPage, totalPages, className }: BlogPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Xây URL mới khi chuyển trang — giữ nguyên tất cả params khác
  const buildPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      const qs = params.toString()
      return `${pathname}${qs ? `?${qs}` : ''}`
    },
    [pathname, searchParams]
  )

  const goTo = (page: number) => {
    router.push(buildPageUrl(page), { scroll: true })
  }

  if (totalPages <= 1) return null

  const range = getPaginationRange(currentPage, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Phân trang bài viết"
      className={cn('flex items-center justify-center gap-1 mt-10', className)}
    >
      {/* Nút Trước */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all',
          currentPage <= 1
            ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
            : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5 cursor-pointer'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Các số trang */}
      {range.map((item, idx) => {
        if (item === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground/60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )
        }

        const isActive = item === currentPage
        return (
          <button
            key={item}
            onClick={() => !isActive && goTo(item)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Trang ${item}`}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all',
              isActive
                ? 'border-gold bg-gold/10 text-gold font-semibold cursor-default shadow-sm'
                : 'border-border/60 bg-transparent text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 cursor-pointer'
            )}
          >
            {item}
          </button>
        )
      })}

      {/* Nút Sau */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all',
          currentPage >= totalPages
            ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
            : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5 cursor-pointer'
        )}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Thông tin trang */}
      <span className="ml-3 text-xs text-muted-foreground/70 hidden md:block">
        Trang {currentPage}/{totalPages}
      </span>
    </nav>
  )
}
