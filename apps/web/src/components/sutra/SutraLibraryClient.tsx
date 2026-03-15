'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SutraListItem } from '@/lib/api/sutra'

export default function SutraLibraryClient({ items }: { items: SutraListItem[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('Tất cả')

  const allTags = useMemo(() => {
    const names = new Set<string>()
    for (const item of items) {
      for (const tag of item.tags) names.add(tag.name)
    }
    return ['Tất cả', ...Array.from(names).sort((a, b) => a.localeCompare(b, 'vi'))]
  }, [items])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.shortExcerpt?.toLowerCase().includes(normalized) ||
        item.description?.toLowerCase().includes(normalized) ||
        item.tags.some((tag) => tag.name.toLowerCase().includes(normalized))
      const matchesTag = activeTag === 'Tất cả' || item.tags.some((tag) => tag.name === activeTag)
      return matchesQuery && matchesTag
    })
  }, [activeTag, items, query])

  return (
    <div className="flex flex-col gap-6">
      <Card className="panel-shell rounded-xl">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên kinh, trích đoạn, tag..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={activeTag === tag ? 'sacred' : 'outline'}
                size="sm"
                className="rounded-md"
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </Button>
            ))}
            <Button asChild type="button" variant="outlineGlow" size="sm" className="rounded-md">
              <Link href="/kinh-dien/tu-dien">Từ điển thuật ngữ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.documentId} className="panel-shell panel-hover rounded-xl overflow-hidden">
            <div className="relative aspect-[16/9] bg-muted">
              {item.coverUrl ? (
                <Image src={item.coverUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 33vw" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BookOpen className="size-8" />
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {item.shortExcerpt || item.description || 'Kho nội dung kinh điển đại thừa đã được biên tập để đọc trực tuyến.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag.documentId} variant="secondary" className="rounded-md">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.translatorHan ? <p>Hán dịch: {item.translatorHan}</p> : null}
                {item.translatorViet ? <p>Việt dịch: {item.translatorViet}</p> : null}
              </div>
              <Button asChild variant="outlineGlow" className="rounded-md">
                <Link href={`/kinh-dien/${item.slug}`}>Đọc kinh</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
