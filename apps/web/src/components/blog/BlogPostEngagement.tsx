'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, History } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BlogPostEngagementProps {
  documentId: string
}

export default function BlogPostEngagement({ documentId }: BlogPostEngagementProps) {
  const { user, loading } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [lastReadAt, setLastReadAt] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !user || !documentId) return

    let ignore = false

    async function sync() {
      try {
        await fetch('/api/blog-reader-states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogPostDocumentId: documentId, markRead: true }),
        })

        const res = await fetch(`/api/blog-reader-states?documentIds=${documentId}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (ignore || !Array.isArray(data) || !data[0]) return
        setIsFavorite(Boolean(data[0].isFavorite))
        setLastReadAt(data[0].lastReadAt ?? null)
      } catch {}
    }

    sync()

    return () => {
      ignore = true
    }
  }, [documentId, loading, user])

  async function toggleFavorite() {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu bài yêu thích.')
      return
    }

    const nextFavorite = !isFavorite
    setIsFavorite(nextFavorite)

    const res = await fetch('/api/blog-reader-states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogPostDocumentId: documentId, isFavorite: nextFavorite }),
    })

    if (!res.ok) {
      setIsFavorite(!nextFavorite)
      toast.error('Không thể cập nhật yêu thích.')
      return
    }

    toast.success(nextFavorite ? 'Đã lưu vào yêu thích.' : 'Đã bỏ khỏi yêu thích.')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {lastReadAt && (
        <Badge variant="outline" className="rounded-md">
          <History className="mr-1 size-3.5" />
          Đã đọc
        </Badge>
      )}

      <Button type="button" variant={isFavorite ? 'sacred' : 'outline'} size="sm" className="rounded-xl" onClick={toggleFavorite}>
        <Heart className={isFavorite ? 'fill-current' : ''} />
        {isFavorite ? 'Đã yêu thích' : 'Lưu yêu thích'}
      </Button>

      {!user && !loading && (
        <Button asChild type="button" variant="ghost" size="sm" className="rounded-xl">
          <Link href="/auth">Đăng nhập để đồng bộ</Link>
        </Button>
      )}
    </div>
  )
}
