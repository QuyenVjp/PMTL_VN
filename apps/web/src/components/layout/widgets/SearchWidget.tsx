// components/layout/widgets/SearchWidget.tsx
'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SearchWidget() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    })
  }

  return (
    <div>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Tìm kiếm
      </h3>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ khoá..."
          className="h-12 rounded-full border-gold/35 bg-background/80 pl-4 pr-12 text-sm placeholder:text-muted-foreground/60"
        />
        <Button
          type="submit"
          aria-label="Tìm kiếm"
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <SearchIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
