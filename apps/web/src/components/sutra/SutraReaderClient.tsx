'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkPlus, BookOpen, Clock3, Highlighter, Pin, Play, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/AuthContext'
import {
  createMyBookmark,
  deleteMyBookmark,
  fetchMyBookmarks,
  fetchMyReadingProgress,
  upsertMyReadingProgress,
} from '@/lib/api/sutra-reader'
import type { SutraBookmark, SutraGlossary } from '@/types/strapi'
import type { SutraReaderData } from '@/lib/api/sutra'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type ReadingTheme = 'warm' | 'sepia' | 'night'

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractSnippet(content: string, max = 180) {
  const plain = content.replace(/\s+/g, ' ').trim()
  return plain.length <= max ? plain : `${plain.slice(0, max)}...`
}

function GlossaryToken({
  label,
  glossary,
  onPin,
}: {
  label: string
  glossary: SutraGlossary
  onPin: (item: SutraGlossary) => void
}) {
  const content = (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="ant-title text-lg text-foreground">{glossary.term}</div>
      <div className="text-sm leading-7 text-muted-foreground">{glossary.meaning}</div>
      <Button type="button" size="sm" variant="outline" className="w-fit rounded-md" onClick={() => onPin(glossary)}>
        <Pin data-icon="inline-start" />
        Ghim chú giải
      </Button>
    </div>
  )

  return (
    <>
      <span className="hidden md:inline">
        <HoverCard openDelay={120}>
          <HoverCardTrigger asChild>
            <button type="button" className="text-gold hover:text-gold-glow underline underline-offset-2">
              {label}
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 rounded-lg border-gold/20 bg-card">{content}</HoverCardContent>
        </HoverCard>
      </span>
      <span className="inline md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-gold hover:text-gold-glow underline underline-offset-2">
              {label}
            </button>
          </PopoverTrigger>
          <PopoverContent className="rounded-lg border-gold/20 bg-card">{content}</PopoverContent>
        </Popover>
      </span>
    </>
  )
}

export default function SutraReaderClient({
  data,
  initialChapterDocumentId,
}: {
  data: SutraReaderData
  initialChapterDocumentId?: string
}) {
  const { user } = useAuth()
  const chapterById = useMemo(() => new Map(data.chapters.map((chapter) => [chapter.documentId, chapter])), [data.chapters])
  const defaultChapter = data.chapters.find((item) => item.documentId === initialChapterDocumentId) || data.chapters[0] || null

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(defaultChapter?.documentId ?? null)
  const [chapterQuery, setChapterQuery] = useState('')
  const [fontScale, setFontScale] = useState(100)
  const [lineHeightScale, setLineHeightScale] = useState(18)
  const [theme, setTheme] = useState<ReadingTheme>('warm')
  const [autoScroll, setAutoScroll] = useState(false)
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(24)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [bookmarks, setBookmarks] = useState<SutraBookmark[]>([])
  const [pinnedGlossaries, setPinnedGlossaries] = useState<SutraGlossary[]>([])
  const [resumeTargetChapterId, setResumeTargetChapterId] = useState<string | null>(null)
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [bookmarkDraftNote, setBookmarkDraftNote] = useState('')
  const [bookmarkDraftExcerpt, setBookmarkDraftExcerpt] = useState('')

  const contentRef = useRef<HTMLDivElement | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const paragraphCountRef = useRef(0)

  const selectedChapter = selectedChapterId ? chapterById.get(selectedChapterId) ?? null : null
  const filteredChapters = useMemo(() => {
    const normalized = chapterQuery.trim().toLowerCase()
    if (!normalized) return data.chapters
    return data.chapters.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.content.toLowerCase().includes(normalized) ||
        item.openingText?.toLowerCase().includes(normalized) ||
        item.endingText?.toLowerCase().includes(normalized)
      )
    })
  }, [chapterQuery, data.chapters])

  const glossaryPool = useMemo(() => {
    if (!selectedChapter) return []
    const volumeId = selectedChapter.volume?.documentId
    return data.glossaries.filter((item) => {
      const byChapter = !item.chapter?.documentId || item.chapter.documentId === selectedChapter.documentId
      const byVolume = !item.volume?.documentId || item.volume.documentId === volumeId
      return byChapter && byVolume
    })
  }, [data.glossaries, selectedChapter])

  const glossaryByMarker = useMemo(() => {
    const map = new Map<string, SutraGlossary>()
    for (const item of glossaryPool) {
      const marker = normalizeKey(item.markerKey)
      if (!map.has(marker)) map.set(marker, item)
      const term = normalizeKey(item.term)
      if (!map.has(term)) map.set(term, item)
    }
    return map
  }, [glossaryPool])

  const paragraphs = useMemo(() => {
    if (!selectedChapter) return []
    const blocks = [selectedChapter.openingText ?? '', selectedChapter.content, selectedChapter.endingText ?? '']
      .join('\n\n')
      .trim()
    const parsed = splitParagraphs(blocks)
    paragraphCountRef.current = parsed.length
    return parsed
  }, [selectedChapter])

  const saveProgress = useCallback((nextPercent: number, anchorKey: string) => {
    if (!selectedChapter || !selectedChapterId) return

    const payload = {
      sutraDocumentId: data.sutra.documentId,
      volumeDocumentId: selectedChapter.volume?.documentId ?? undefined,
      chapterDocumentId: selectedChapter.documentId,
      anchorKey,
      charOffset: 0,
      scrollPercent: nextPercent,
    }

    if (user) {
      void upsertMyReadingProgress(payload).catch(() => {
        // silent: tránh spam toast khi user kéo cuộn nhanh
      })
    } else {
      localStorage.setItem(`sutra-progress:${data.sutra.documentId}`, JSON.stringify(payload))
    }
  }, [data.sutra.documentId, selectedChapter, selectedChapterId, user])

  const queueSaveProgress = useCallback((nextPercent: number, anchorKey: string) => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveProgress(nextPercent, anchorKey)
    }, 700)
  }, [saveProgress])

  useEffect(() => {
    let active = true
    void (async () => {
      if (user) {
        const [progressRes, bookmarksRes] = await Promise.all([
          fetchMyReadingProgress({ sutraDocumentId: data.sutra.documentId }).catch(() => null),
          fetchMyBookmarks({ sutraDocumentId: data.sutra.documentId }).catch(() => null),
        ])
        if (!active) return
        if (Array.isArray(bookmarksRes)) setBookmarks(bookmarksRes)
        if (Array.isArray(progressRes) && progressRes[0]?.chapter?.documentId) {
          const chapterId = progressRes[0].chapter.documentId
          if (chapterId !== selectedChapterId) setResumeTargetChapterId(chapterId)
        }
      } else {
        const stored = localStorage.getItem(`sutra-progress:${data.sutra.documentId}`)
        const storedBookmarks = localStorage.getItem(`sutra-bookmarks:${data.sutra.documentId}`)
        if (storedBookmarks) {
          try {
            const parsedBookmarks = JSON.parse(storedBookmarks) as SutraBookmark[]
            if (Array.isArray(parsedBookmarks)) setBookmarks(parsedBookmarks)
          } catch {
            setBookmarks([])
          }
        }
        if (!stored) return
        const parsed = JSON.parse(stored) as { chapterDocumentId?: string } | null
        if (parsed?.chapterDocumentId && parsed.chapterDocumentId !== selectedChapterId) {
          setResumeTargetChapterId(parsed.chapterDocumentId)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [data.sutra.documentId, selectedChapterId, user])

  useEffect(() => {
    if (!selectedChapterId) return
    setScrollPercent(0)
    const container = contentRef.current
    if (!container) return
    container.scrollTop = 0
  }, [selectedChapterId])

  useEffect(() => {
    if (!autoScroll) return
    const container = contentRef.current
    if (!container) return

    const id = window.setInterval(() => {
      const max = container.scrollHeight - container.clientHeight
      if (max <= 0) return
      if (container.scrollTop >= max - 2) {
        setAutoScroll(false)
        return
      }
      container.scrollTop = Math.min(max, container.scrollTop + autoScrollSpeed / 10)
    }, 80)
    return () => window.clearInterval(id)
  }, [autoScroll, autoScrollSpeed])

  const onContentScroll = useCallback(() => {
    const container = contentRef.current
    if (!container || !selectedChapter) return

    const max = container.scrollHeight - container.clientHeight
    if (max <= 0) return
    const nextPercent = Math.max(0, Math.min(100, (container.scrollTop / max) * 100))
    setScrollPercent(nextPercent)

    const paragraphIndex = Math.max(1, Math.min(paragraphCountRef.current, Math.floor((nextPercent / 100) * paragraphCountRef.current) + 1))
    queueSaveProgress(nextPercent, `p-${paragraphIndex}`)
  }, [queueSaveProgress, selectedChapter])

  const submitBookmark = async (excerpt: string, note: string) => {
    if (!selectedChapter) return

    const payload = {
      sutraDocumentId: data.sutra.documentId,
      volumeDocumentId: selectedChapter.volume?.documentId ?? undefined,
      chapterDocumentId: selectedChapter.documentId,
      anchorKey: undefined,
      charOffset: 0,
      excerpt,
      note,
    }

    if (!user) {
      const key = `sutra-bookmarks:${data.sutra.documentId}`
      const raw = localStorage.getItem(key)
      const old = raw ? (JSON.parse(raw) as SutraBookmark[]) : []
      const localItem: SutraBookmark = {
        id: Date.now(),
        documentId: `local-${Date.now()}`,
        anchorKey: null,
        charOffset: 0,
        excerpt,
        note,
        createdAt: new Date().toISOString(),
        sutra: { documentId: data.sutra.documentId, title: data.sutra.title, slug: data.sutra.slug },
        volume: selectedChapter.volume
          ? {
              documentId: selectedChapter.volume.documentId,
              title: selectedChapter.volume.title,
              slug: selectedChapter.volume.slug,
              volumeNumber: selectedChapter.volume.volumeNumber,
            }
          : null,
        chapter: {
          documentId: selectedChapter.documentId,
          title: selectedChapter.title,
          slug: selectedChapter.slug,
          chapterNumber: selectedChapter.chapterNumber,
        },
      }
      const next = [localItem, ...old]
      localStorage.setItem(key, JSON.stringify(next))
      setBookmarks(next)
      toast.success('Đã lưu bookmark cục bộ (chưa đăng nhập)')
      return
    }

    const created = await createMyBookmark(payload)
    if (created) {
      setBookmarks((prev) => [created, ...prev])
      toast.success('Đã lưu bookmark')
    }
  }

  const onCreateBookmark = () => {
    if (!selectedChapter) return

    const selectedText = window.getSelection()?.toString().trim() || extractSnippet(selectedChapter.content)
    if (!selectedText) {
      toast.error('Không tìm thấy đoạn văn để lưu bookmark.')
      return
    }

    setBookmarkDraftExcerpt(selectedText)
    setBookmarkDraftNote('')
    setBookmarkDialogOpen(true)
  }

  const onConfirmBookmark = async () => {
    const excerpt = bookmarkDraftExcerpt.trim()
    if (!excerpt) {
      toast.error('Không tìm thấy đoạn văn để lưu bookmark.')
      return
    }

    await submitBookmark(excerpt, bookmarkDraftNote.trim())
    setBookmarkDialogOpen(false)
    setBookmarkDraftNote('')
    setBookmarkDraftExcerpt('')
  }

  const onDeleteBookmark = async (documentId: string) => {
    if (!user && documentId.startsWith('local-')) {
      const key = `sutra-bookmarks:${data.sutra.documentId}`
      const next = bookmarks.filter((item) => item.documentId !== documentId)
      localStorage.setItem(key, JSON.stringify(next))
      setBookmarks(next)
      return
    }
    const ok = await deleteMyBookmark(documentId)
    if (ok) {
      setBookmarks((prev) => prev.filter((item) => item.documentId !== documentId))
      toast.success('Đã xoá bookmark')
    }
  }

  const onPinGlossary = (item: SutraGlossary) => {
    setPinnedGlossaries((prev) => {
      if (prev.some((entry) => entry.documentId === item.documentId)) return prev
      return [item, ...prev].slice(0, 8)
    })
  }

  const renderParagraph = (paragraph: string, index: number) => {
    const tokens = paragraph.split(/(\(\d+\s*\)|\[\[[^\]]+\]\])/g)
    return (
      <div id={`p-${index + 1}`} key={`p-${index + 1}`} className="text-foreground/95">
        {tokens.map((token, tokenIndex) => {
          const markerMatch = token.match(/^\((\d+)\s*\)$/)
          if (markerMatch) {
            const key = normalizeKey(markerMatch[1])
            const glossary = glossaryByMarker.get(key)
            if (!glossary) return <span key={`${index}-${tokenIndex}`}>{token}</span>
            return <GlossaryToken key={`${index}-${tokenIndex}`} label={token} glossary={glossary} onPin={onPinGlossary} />
          }

          const termMatch = token.match(/^\[\[([^\]]+)\]\]$/)
          if (termMatch) {
            const raw = termMatch[1].trim()
            const glossary = glossaryByMarker.get(normalizeKey(raw))
            if (!glossary) return <span key={`${index}-${tokenIndex}`}>{raw}</span>
            return <GlossaryToken key={`${index}-${tokenIndex}`} label={raw} glossary={glossary} onPin={onPinGlossary} />
          }

          return <span key={`${index}-${tokenIndex}`}>{token}</span>
        })}
      </div>
    )
  }

  const contentClass =
    theme === 'night'
      ? 'bg-[#16110b] text-[#f3ecdf]'
      : theme === 'sepia'
        ? 'bg-[#f5ead7] text-[#3c2a1f]'
        : 'bg-card text-foreground'

  return (
    <>
      <Dialog open={bookmarkDialogOpen} onOpenChange={setBookmarkDialogOpen}>
        <DialogContent className="rounded-md">
          <DialogHeader>
            <DialogTitle>Lưu bookmark</DialogTitle>
            <DialogDescription>
              Thêm ghi chú ngắn cho đoạn kinh đã chọn. Có thể để trống nếu chỉ muốn đánh dấu nhanh.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Đoạn được lưu</p>
              <p className="mt-2 break-words text-sm leading-6 text-foreground">{bookmarkDraftExcerpt}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="bookmark-note" className="text-sm font-medium text-foreground">
                Ghi chú
              </label>
              <Textarea
                id="bookmark-note"
                value={bookmarkDraftNote}
                onChange={(event) => setBookmarkDraftNote(event.target.value)}
                placeholder="Ví dụ: đoạn cần đọc lại vào buổi tối."
                className="min-h-[120px] rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBookmarkDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" variant="sacred" onClick={() => void onConfirmBookmark()}>
              Lưu bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
        <Card className="surface-panel h-full rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="size-4 text-gold" />
              Mục lục
            </CardTitle>
            <CardDescription>Chọn tập/phẩm để đọc nhanh</CardDescription>
            <Input
              value={chapterQuery}
              onChange={(event) => setChapterQuery(event.target.value)}
              placeholder="Tìm phẩm..."
            />
          </CardHeader>
          <CardContent className="min-h-0 p-0">
            <ScrollArea className="h-[60vh] xl:h-[calc(100vh-15rem)] px-4 pb-4">
              <div className="flex flex-col gap-2">
                {filteredChapters.map((chapter) => (
                  <button
                    type="button"
                    key={chapter.documentId}
                    onClick={() => setSelectedChapterId(chapter.documentId)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selectedChapterId === chapter.documentId
                        ? 'border-gold bg-gold/10'
                        : 'border-border bg-background/50 hover:border-gold/30'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">
                      Tập {chapter.volume?.volumeNumber ?? '—'} · Phẩm {chapter.chapterNumber}
                    </p>
                    <p className="mt-1 font-medium text-foreground">{chapter.title}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

        <section className="min-w-0">
        <Card className="surface-panel rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="sacred">Đọc kinh</Badge>
              <Badge variant="secondary">Tiến độ {scrollPercent.toFixed(0)}%</Badge>
              {selectedChapter ? (
                <Badge variant="outline">
                  Tập {selectedChapter.volume?.volumeNumber ?? '—'} · Phẩm {selectedChapter.chapterNumber}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-3xl">{selectedChapter?.title || data.sutra.title}</CardTitle>
            <CardDescription>{selectedChapter?.openingText || data.sutra.description}</CardDescription>
            {resumeTargetChapterId ? (
              <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-sm">
                <p className="text-foreground">Bạn có phiên đọc trước đó. Muốn tiếp tục tại vị trí cũ?</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="sacred"
                    className="rounded-md"
                    onClick={() => {
                      setSelectedChapterId(resumeTargetChapterId)
                      setResumeTargetChapterId(null)
                    }}
                  >
                    Tiếp tục đọc
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setResumeTargetChapterId(null)}>
                    Bỏ qua
                  </Button>
                </div>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 rounded-lg border border-border bg-background/50 p-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Theme đọc</p>
                <Select value={theme} onValueChange={(value) => setTheme(value as ReadingTheme)}>
                  <SelectTrigger className="mt-1 rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="sepia">Sepia</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cỡ chữ ({fontScale}%)</p>
                <Slider value={[fontScale]} min={85} max={140} step={5} onValueChange={(v) => setFontScale(v[0] ?? 100)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Giãn dòng ({(lineHeightScale / 10).toFixed(1)})</p>
                <Slider value={[lineHeightScale]} min={14} max={24} step={1} onValueChange={(v) => setLineHeightScale(v[0] ?? 18)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">Auto-scroll</p>
                  <p className="text-xs text-foreground">Tốc độ {autoScrollSpeed}</p>
                </div>
                <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
              </div>
            </div>

            <div className="rounded-xl border border-border">
              <div
                ref={contentRef}
                onScroll={onContentScroll}
                className={`h-[62vh] overflow-y-auto px-5 py-6 md:px-8 ${contentClass}`}
                style={{ fontSize: `${fontScale}%`, lineHeight: `${lineHeightScale / 10}` }}
              >
                <div className="prose prose-neutral max-w-none dark:prose-invert">
                  {paragraphs.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground not-prose">
                      Chưa có nội dung phẩm/chương được xuất bản cho kinh này.
                    </div>
                  ) : (
                    paragraphs.map((paragraph, index) => (
                      <div key={`block-${index}`} className="mb-4 leading-relaxed">
                        {renderParagraph(paragraph, index)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outlineGlow" className="rounded-md" onClick={onCreateBookmark}>
                <BookmarkPlus data-icon="inline-start" />
                Lưu bookmark
              </Button>
              <Button type="button" variant={autoScroll ? 'sacred' : 'outline'} className="rounded-md" onClick={() => setAutoScroll((prev) => !prev)}>
                <Play data-icon="inline-start" />
                {autoScroll ? 'Tạm dừng cuộn' : 'Bật auto-scroll'}
              </Button>
              <Button type="button" variant="outline" className="rounded-md" onClick={() => setAutoScrollSpeed((prev) => Math.min(60, prev + 6))}>
                Tăng tốc cuộn
              </Button>
              <Button type="button" variant="outline" className="rounded-md" onClick={() => setAutoScrollSpeed((prev) => Math.max(8, prev - 6))}>
                Giảm tốc cuộn
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
        <div className="flex h-full flex-col gap-4">
          <Card className="surface-panel min-w-0 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Trạng thái đọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2 text-foreground">
                <Clock3 className="size-4 text-gold" />
                {selectedChapter?.estimatedReadMinutes ?? 5} phút cho phẩm hiện tại
              </p>
              <p className="inline-flex items-center gap-2 text-foreground">
                <Search className="size-4 text-gold" />
                {glossaryPool.length} chú giải khả dụng
              </p>
              <p className="inline-flex items-center gap-2 text-foreground">
                <Sparkles className="size-4 text-gold" />
                {bookmarks.length} bookmark đã lưu
              </p>
              <Separator />
              <Button asChild variant="outline" className="w-full rounded-md">
                <Link href="/kinh-dien">Về thư viện kinh</Link>
              </Button>
              <Button asChild variant="outlineGlow" className="w-full rounded-md">
                <Link href="/kinh-dien/tu-dien">Mở từ điển thuật ngữ</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-panel min-h-0 min-w-0 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Bookmark</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 p-0">
              <ScrollArea className="h-56 px-4 pb-4">
                <div className="flex min-w-0 flex-col gap-2">
                  {bookmarks.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có bookmark.</p> : null}
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.documentId} className="min-w-0 rounded-lg border border-border bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">{bookmark.chapter?.title}</p>
                      <p className="mt-1 break-words text-sm text-foreground line-clamp-2">{bookmark.excerpt || 'Đoạn đã đánh dấu'}</p>
                      {bookmark.note ? <p className="mt-1 break-words text-xs text-muted-foreground line-clamp-2">{bookmark.note}</p> : null}
                      <div className="mt-2 flex gap-2">
                        {bookmark.chapter?.documentId ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-md"
                            onClick={() => setSelectedChapterId(bookmark.chapter?.documentId ?? null)}
                          >
                            Mở
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="rounded-md text-destructive hover:text-destructive"
                          onClick={() => {
                            void onDeleteBookmark(bookmark.documentId)
                          }}
                        >
                          Xoá
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="surface-panel min-h-0 min-w-0 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <Highlighter className="size-4 text-gold" />
                Chú giải đã ghim
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 p-0">
              <ScrollArea className="h-56 px-4 pb-4">
                <div className="flex min-w-0 flex-col gap-2">
                  {pinnedGlossaries.length === 0 ? <p className="text-sm text-muted-foreground">Chưa ghim chú giải nào.</p> : null}
                  {pinnedGlossaries.map((item) => (
                    <div key={item.documentId} className="min-w-0 rounded-lg border border-border bg-background/50 p-3">
                      <p className="break-words text-sm font-medium text-foreground">{item.term}</p>
                      <p className="mt-1 break-words text-xs leading-6 text-muted-foreground line-clamp-4">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        </aside>
      </div>
    </>
  )
}
