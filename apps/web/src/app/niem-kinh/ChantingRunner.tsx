'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import type {
  ChantSessionConfig,
  ChantingSetting,
  ItemProgress,
  ProgressMap,
  TodayChantItem,
  TodayChantResponse,
} from '@/lib/api/chanting'
import type { BlogPost, CmsEvent } from '@/types/cms'
import {
  findNextPendingChantItem,
  loadLastSelectedChantItem,
  loadLocalChantProgress,
  saveLastSelectedChantItem,
  saveLocalChantProgress,
  summarizeChantProgress,
} from '@/lib/chanting-progress'
import {
  applyUserChantConfig,
  buildDefaultTemplateConfig,
  loadLocalChantTemplate,
  loadLocalSessionConfig,
  normalizeChantConfig,
  saveLocalChantTemplate,
  saveLocalSessionConfig,
} from '@/lib/chanting-config'
import { formatDateVN, truncate } from '@/lib/cms-helpers'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChantingGuidelinesDialog } from '@/components/ChantingGuidelinesDialog'
import { ChantingPreferencesDialog } from '@/components/chanting/ChantingPreferencesDialog'
import { ChantScriptPreview } from '@/components/chanting/ChantScriptPreview'
import BottomSheetPlayer from './BottomSheetPlayer'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Info,
  Link2,
  LoaderCircle,
  MoonStar,
  Save,
  ScrollText,
  WifiOff,
} from 'lucide-react'

interface Props {
  todayChant: TodayChantResponse
  isoDate: string
  serverNow: string
  initialSelectedSlug?: string | null
  solarLabel: string
  lunarLabel: string
  recommendedPosts: BlogPost[]
  upcomingEvents: CmsEvent[]
  chantingSetting: Pick<ChantingSetting, 'guidelinesTitle' | 'guidelinesSummary' | 'guidelineSections'>
}

function isTimeRuleViolated(timeRules: TodayChantItem['timeRules'], offset = 0): { violated: boolean; message: string } {
  if (!timeRules) return { violated: false, message: '' }
  const now = new Date(Date.now() + offset)
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  if (timeRules.notAfter && hhmm >= timeRules.notAfter) {
    return { violated: true, message: `Nên niệm trước ${timeRules.notAfter}` }
  }
  if (timeRules.avoidRange) {
    const [from, to] = timeRules.avoidRange
    if (hhmm >= from && hhmm <= to) {
      return { violated: true, message: `Nên tránh niệm ${from}–${to}` }
    }
  }
  return { violated: false, message: '' }
}

function progressLabel(item: TodayChantItem, prog: ItemProgress | undefined) {
  if (item.kind === 'step') return prog?.done ? 'Xong' : 'Chưa'
  const count = prog?.count ?? 0
  if (item.target) return `${count}/${item.target}`
  if (item.max) return `${count}/${item.max}`
  return String(count)
}

function progressPercent(item: TodayChantItem, prog: ItemProgress | undefined) {
  if (item.kind === 'step') return prog?.done ? 100 : 0
  const count = prog?.count ?? 0
  const total = item.target ?? item.max ?? 0
  if (!total) return 0
  return Math.min(100, Math.round((count / total) * 100))
}

export default function ChantingRunner({
  todayChant,
  isoDate,
  serverNow,
  initialSelectedSlug = null,
  solarLabel,
  lunarLabel,
  recommendedPosts,
  upcomingEvents,
  chantingSetting,
}: Props) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressMap>({})
  const [templateConfig, setTemplateConfig] = useState<ChantSessionConfig>({})
  const [sessionConfig, setSessionConfig] = useState<ChantSessionConfig>({})
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSelectedSlug)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'offline'>('saved')
  const [relatedOpen, setRelatedOpen] = useState(false)
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { planSlug } = todayChant

  useEffect(() => {
    const serverDate = new Date(serverNow)
    const localDate = new Date()
    setServerTimeOffset(serverDate.getTime() - localDate.getTime())
  }, [serverNow])

  useEffect(() => {
    let cancelled = false

    async function loadState() {
      if (user) {
        setSaveStatus('saving')
        try {
          const [logRes, preferenceRes] = await Promise.all([
            fetch(`/api/practice-log?date=${isoDate}&planSlug=${planSlug}`, { cache: 'no-store' }),
            fetch(`/api/chant-preference?planSlug=${planSlug}`, { cache: 'no-store' }),
          ])

          const logData = logRes.ok ? await logRes.json() : null
          const preferenceData = preferenceRes.ok ? await preferenceRes.json() : null
          if (!cancelled) {
            setProgress(logData?.itemsProgress ?? {})
            setSessionConfig(normalizeChantConfig(logData?.sessionConfig ?? {}))
            setTemplateConfig(
              normalizeChantConfig(preferenceData?.templateConfig ?? buildDefaultTemplateConfig(todayChant.items))
            )
            setSaveStatus('saved')
          }
          return
        } catch {
          if (!cancelled) setSaveStatus('offline')
        }
      }

      if (!cancelled) {
        setProgress(loadLocalChantProgress(isoDate, planSlug))
        setTemplateConfig(normalizeChantConfig(loadLocalChantTemplate(planSlug)))
        setSessionConfig(normalizeChantConfig(loadLocalSessionConfig(isoDate, planSlug)))
        setSaveStatus('saved')
      }
    }

    void loadState()
    return () => {
      cancelled = true
    }
  }, [isoDate, planSlug, todayChant.items, user])

  const items = useMemo(
    () => applyUserChantConfig(todayChant.items, templateConfig, sessionConfig),
    [sessionConfig, templateConfig, todayChant.items]
  )

  useEffect(() => {
    const requested = initialSelectedSlug && items.some((item) => item.slug === initialSelectedSlug)
      ? initialSelectedSlug
      : null
    const remembered = loadLastSelectedChantItem(planSlug)
    const rememberedValid = remembered && items.some((item) => item.slug === remembered) ? remembered : null
    const nextPending = findNextPendingChantItem(items, progress)?.slug ?? null

    setSelectedSlug((current) => {
      if (current && items.some((item) => item.slug === current)) return current
      return requested ?? nextPending ?? rememberedValid ?? items[0]?.slug ?? null
    })
  }, [initialSelectedSlug, items, planSlug, progress])

  useEffect(() => {
    saveLastSelectedChantItem(planSlug, selectedSlug)
  }, [planSlug, selectedSlug])

  const syncToBackend = async (nextProgress: ProgressMap, nextSessionConfig: ChantSessionConfig) => {
    if (!user) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/practice-log', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: isoDate, planSlug, itemsProgress: nextProgress, sessionConfig: nextSessionConfig }),
      })
      setSaveStatus(res.ok ? 'saved' : 'unsaved')
    } catch {
      setSaveStatus('offline')
    }
  }

  const persistSessionState = (nextProgress: ProgressMap, nextSessionConfig: ChantSessionConfig) => {
    if (user) {
      setSaveStatus('unsaved')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void syncToBackend(nextProgress, nextSessionConfig)
      }, 900)
      return
    }

    saveLocalChantProgress(isoDate, planSlug, nextProgress)
    saveLocalSessionConfig(isoDate, planSlug, nextSessionConfig)
    setSaveStatus('saved')
  }

  const saveTemplate = async (nextTemplate: ChantSessionConfig) => {
    setTemplateConfig(nextTemplate)
    if (user) {
      const res = await fetch('/api/chant-preference', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, templateConfig: nextTemplate }),
      })
      if (!res.ok) throw new Error('Failed to save template')
    } else {
      saveLocalChantTemplate(planSlug, nextTemplate)
    }
  }

  const saveSession = async (nextSession: ChantSessionConfig) => {
    setSessionConfig(nextSession)
    persistSessionState(progress, nextSession)
  }

  const getItem = (slug: string) => items.find((item) => item.slug === slug)

  const increment = (slug: string, by = 1) => {
    const item = getItem(slug)
    if (!item) return

    const current = progress[slug]?.count ?? 0
    const effectiveCap = item.capMax ?? item.max ?? item.target ?? Infinity
    if (current >= effectiveCap) {
      toast.error(item.capMax != null ? `Đã đạt giới hạn hôm nay: ${item.capMax} biến` : `Đã niệm đủ mục tiêu`)
      return
    }

    const next = Math.min(current + by, effectiveCap)
    const done = item.target ? next >= item.target : false
    const newProgress = { ...progress, [slug]: { count: next, done } }
    setProgress(newProgress)
    persistSessionState(newProgress, sessionConfig)

    if (item.target != null && current < item.target && next >= item.target) {
      const nextItem = findNextPendingChantItem(items.filter((entry) => entry.slug !== slug || !done), newProgress)
      toast.success(`Hoàn thành ${item.title}`, {
        description: nextItem ? `Tiếp theo: ${nextItem.title}` : 'Anh đã xong công khóa hôm nay.',
      })
      if (nextItem) setTimeout(() => setSelectedSlug(nextItem.slug), 1000)
    }
  }

  const decrement = (slug: string) => {
    const current = progress[slug]?.count ?? 0
    if (current <= 0) return
    const item = getItem(slug)
    const next = current - 1
    const done = item?.target ? next >= item.target : false
    const newProgress = { ...progress, [slug]: { count: next, done } }
    setProgress(newProgress)
    persistSessionState(newProgress, sessionConfig)
  }

  const resetItem = (slug: string) => {
    const prev = progress[slug]
    const newProgress = { ...progress, [slug]: { count: 0, done: false } }
    setProgress(newProgress)
    persistSessionState(newProgress, sessionConfig)
    toast('Đã reset bài niệm', {
      action: {
        label: 'Hoàn tác',
        onClick: () => {
          const restored = { ...progress, [slug]: prev ?? { count: 0, done: false } }
          setProgress(restored)
          persistSessionState(restored, sessionConfig)
        },
      },
    })
  }

  const toggleStep = (slug: string) => {
    const current = progress[slug]?.done ?? false
    const newProgress = { ...progress, [slug]: { count: current ? 0 : 1, done: !current } }
    setProgress(newProgress)
    persistSessionState(newProgress, sessionConfig)
  }

  useEffect(() => {
    if (!selectedSlug) return

    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.code === 'Space') {
        event.preventDefault()
        increment(selectedSlug)
      } else if (event.code === 'Backspace') {
        event.preventDefault()
        decrement(selectedSlug)
      } else if (event.code === 'KeyR') {
        event.preventDefault()
        resetItem(selectedSlug)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedSlug, items, progress, sessionConfig])

  const summary = useMemo(() => summarizeChantProgress(items, progress), [items, progress])
  const nextItem = useMemo(() => findNextPendingChantItem(items, progress), [items, progress])
  const selectedItem = selectedSlug ? getItem(selectedSlug) ?? null : null
  const selectedIntention = selectedItem
    ? sessionConfig.intentionsBySlug?.[selectedItem.slug] ?? templateConfig.intentionsBySlug?.[selectedItem.slug] ?? null
    : null
  const hasRelated = recommendedPosts.length > 0 || upcomingEvents.length > 0 || todayChant.todayEvents.length > 0
  const saveStatusUi = {
    saved: { label: 'Đã lưu', icon: Save, className: 'text-muted-foreground' },
    saving: { label: 'Đang lưu', icon: LoaderCircle, className: 'animate-spin text-muted-foreground' },
    unsaved: { label: 'Chưa đồng bộ', icon: Save, className: 'text-amber-600 dark:text-amber-400' },
    offline: { label: 'Ngoại tuyến', icon: WifiOff, className: 'text-amber-600 dark:text-amber-400' },
  }[saveStatus]
  const SaveStatusIcon = saveStatusUi.icon

  if (!items.length) {
    return <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Chưa có bài niệm nào khả dụng cho công khóa hôm nay.</div>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryCell label="Hôm nay" value={solarLabel} meta={lunarLabel} icon={<MoonStar className="size-4 text-gold" />} />
            <SummaryCell label="Đã niệm" value={`${summary.completedItems}/${summary.totalItems} bài`} meta={summary.totalTarget > 0 ? `${summary.completedTarget}/${summary.totalTarget} biến` : `${summary.totalCount} biến`} icon={<CheckCircle2 className="size-4 text-gold" />} />
            <SummaryCell label="Bài tiếp theo" value={nextItem?.title ?? 'Đã hoàn tất'} meta={nextItem ? 'Mở ngay để tiếp tục hành trì' : 'Anh đã xong công khóa hôm nay'} icon={<Flame className="size-4 text-gold" />} />
            <SummaryCell label="Sự kiện đặc biệt" value={todayChant.todayEvents[0]?.title ?? 'Ngày thường'} meta={todayChant.todayEvents.length > 1 ? `${todayChant.todayEvents.length} dấu mốc trong ngày` : 'Không có ngày vía nổi bật'} icon={<Info className="size-4 text-gold" />} />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ChantingGuidelinesDialog setting={chantingSetting} />
            <ChantingPreferencesDialog
              items={todayChant.items}
              templateConfig={templateConfig}
              sessionConfig={sessionConfig}
              onSaveTemplate={saveTemplate}
              onSaveSession={saveSession}
            />
          </div>
        </div>
      </div>
      {hasRelated && (
        <div className="rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setRelatedOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-5"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Liên quan hôm nay</p>
              <p className="mt-1 text-sm text-muted-foreground">Bài đọc, sự kiện và dấu mốc đang đi cùng công khóa của anh.</p>
            </div>
            <ChevronRight className={`size-4 text-muted-foreground transition-transform ${relatedOpen ? 'rotate-90' : ''}`} />
          </button>
          {relatedOpen && (
            <div className="grid gap-4 border-t border-border px-4 py-4 md:grid-cols-3 md:px-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Sự kiện trong ngày</p>
                {todayChant.todayEvents.length > 0 ? todayChant.todayEvents.map((event) => (
                  <div key={event.documentId} className="rounded-md border border-border/70 bg-background px-3 py-3 text-sm text-foreground">
                    {event.title}
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Không có ngày đặc biệt.</p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Bài đọc gợi ý</p>
                {recommendedPosts.length > 0 ? recommendedPosts.map((post) => (
                  <Link
                    key={post.documentId}
                    href={`/blog/${post.slug}`}
                    className="block rounded-md border border-border/70 bg-background px-3 py-3 transition-colors hover:border-gold/30"
                  >
                    <p className="text-sm font-medium text-foreground">{post.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{truncate(post.excerpt || post.content, 88)}</p>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground">Chưa có bài đọc gợi ý.</p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Sắp tới</p>
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                  <Link
                    key={event.documentId}
                    href={`/events/${event.slug}`}
                    className="block rounded-md border border-border/70 bg-background px-3 py-3 transition-colors hover:border-gold/30"
                  >
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateVN(event.date)}{event.location ? ` · ${event.location}` : ''}</p>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground">Chưa có sự kiện sắp tới.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="hidden gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-sm font-semibold text-foreground">Danh sách bài niệm</p>
              <p className="text-sm text-muted-foreground">{items.length} bài đang hiển thị theo cấu hình hiện tại</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <SaveStatusIcon className={`size-3.5 ${saveStatusUi.className}`} />
              {saveStatusUi.label}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <ItemCard
                key={item.slug}
                item={item}
                progress={progress[item.slug]}
                selected={selectedSlug === item.slug}
                serverTimeOffset={serverTimeOffset}
                onSelect={() => setSelectedSlug(item.slug)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {selectedItem ? (
              <>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-md border border-gold/20 bg-gold/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                          {selectedItem.kind === 'step' ? 'Nghi thức' : selectedItem.kind === 'sutra' ? 'Kinh văn' : 'Thần chú'}
                        </span>
                        {selectedItem.isOptional && (
                          <span className="inline-flex rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                            Tùy chọn
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="ant-title text-3xl leading-tight text-foreground">{selectedItem.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedItem.target ? `Mục tiêu hôm nay: ${selectedItem.target} biến` : 'Bài này không đặt số biến bắt buộc.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ChantScriptPreview item={selectedItem} />
                    </div>
                  </div>

                  {(selectedItem.openingPrayer || selectedIntention) && (
                    <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ScrollText className="size-4 text-gold" />
                        Nguyện và lời mở đầu
                      </div>
                      {selectedIntention && (
                        <p className="mb-3 text-sm text-muted-foreground">
                          {[selectedIntention.selfName, selectedIntention.counterpartName, selectedIntention.wish].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {selectedItem.openingPrayer && (
                        <div className="prose prose-sm max-w-none text-muted-foreground prose-p:leading-6 prose-strong:text-foreground">
                          {selectedItem.openingPrayer.split('\n').map((paragraph, index) => (
                            <p key={`${selectedItem.slug}-prayer-${index}`}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <Tabs defaultValue="text" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="text">Văn bản</TabsTrigger>
                      <TabsTrigger value="support">Hỗ trợ niệm</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-0">
                      {selectedItem.content ? (
                        <ScrollArea className="h-[26rem] rounded-xl border border-border/70 bg-background" data-lenis-prevent>
                          <div
                            className="prose prose-sm md:prose-base max-w-none px-5 py-5 text-foreground/85 prose-headings:font-serif prose-headings:text-foreground prose-p:leading-7 prose-strong:text-foreground"
                            dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                          />
                        </ScrollArea>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                          Bài này hiện chưa có văn bản rút gọn. Anh có thể mở “Bản kinh” nếu admin đã gắn PDF hoặc ảnh preview.
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="support" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-2">
                        <SupportCard
                          title="Nhịp hành trì"
                          description="Niệm đến đâu hệ thống sẽ ghi nhớ đến đó, kể cả khi anh tạm rời trang."
                          icon={<Check className="size-4 text-gold" />}
                        />
                        <SupportCard
                          title="Khi đi đường hoặc đi tàu"
                          description="Ưu tiên bài ngắn và phần văn bản gọn. Khi cần đối chiếu, mở drawer bản kinh rồi tiếp tục đếm biến."
                          icon={<Link2 className="size-4 text-gold" />}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                Chọn một bài để bắt đầu niệm.
              </div>
            )}
          </div>

          <div className="sticky top-20 self-start">
            {selectedItem ? (
              <DesktopCounterPanel
                item={selectedItem}
                progress={progress[selectedItem.slug]}
                onIncrement={(by) => increment(selectedItem.slug, by)}
                onDecrement={() => decrement(selectedItem.slug)}
                onReset={() => resetItem(selectedItem.slug)}
                onToggleStep={() => toggleStep(selectedItem.slug)}
                serverTimeOffset={serverTimeOffset}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold text-foreground">Danh sách bài niệm</p>
            <p className="text-sm text-muted-foreground">Chạm vào bài cần niệm để mở player</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <SaveStatusIcon className={`size-3.5 ${saveStatusUi.className}`} />
            {saveStatusUi.label}
          </span>
        </div>
        {items.map((item) => (
          <ItemCard
            key={item.slug}
            item={item}
            progress={progress[item.slug]}
            selected={selectedSlug === item.slug}
            serverTimeOffset={serverTimeOffset}
            onSelect={() => setSelectedSlug(item.slug)}
          />
        ))}
      </div>

      <BottomSheetPlayer
        item={selectedItem}
        progress={selectedItem ? progress[selectedItem.slug] : undefined}
        onClose={() => setSelectedSlug(null)}
        onIncrement={(by) => selectedSlug && increment(selectedSlug, by)}
        onDecrement={() => selectedSlug && decrement(selectedSlug)}
        onReset={() => selectedSlug && resetItem(selectedSlug)}
        onToggleStep={() => selectedSlug && toggleStep(selectedSlug)}
        serverTimeOffset={serverTimeOffset}
      />
    </section>
  )
}

function SummaryCell({
  label,
  value,
  meta,
  icon,
}: {
  label: string
  value: string
  meta: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
    </div>
  )
}

function SupportCard({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function ItemCard({
  item,
  progress,
  selected,
  serverTimeOffset,
  onSelect,
}: {
  item: TodayChantItem
  progress: ItemProgress | undefined
  selected: boolean
  serverTimeOffset: number
  onSelect: () => void
}) {
  const done = progress?.done || (item.kind !== 'step' && item.target != null && (progress?.count ?? 0) >= item.target)
  const label = progressLabel(item, progress)
  const pct = progressPercent(item, progress)
  const timeState = isTimeRuleViolated(item.timeRules, serverTimeOffset)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full overflow-hidden rounded-xl border text-left transition-all duration-200',
        selected ? 'border-gold/35 bg-gold/5 shadow-sm' : 'border-border bg-card hover:border-gold/20 hover:bg-muted/20',
      ].join(' ')}
    >
      {pct > 0 && item.kind !== 'step' && (
        <div className="h-1 w-full bg-muted">
          <div className={`h-full ${done ? 'bg-green-500' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{item.title}</span>
            {item.isOptional && (
              <span className="rounded-md border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Tùy chọn
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.target != null && <span>{item.target} biến</span>}
            {timeState.violated && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock3 className="size-3.5" />
                {timeState.message}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${done ? 'text-green-600 dark:text-green-400' : 'text-gold'}`}>{label}</p>
          <ChevronRight className={`mt-1 size-4 text-muted-foreground transition-transform ${selected ? 'translate-x-0.5' : ''}`} />
        </div>
      </div>
    </button>
  )
}

function DesktopCounterPanel({
  item,
  progress,
  onIncrement,
  onDecrement,
  onReset,
  onToggleStep,
  serverTimeOffset,
}: {
  item: TodayChantItem
  progress: ItemProgress | undefined
  onIncrement: (by: number) => void
  onDecrement: () => void
  onReset: () => void
  onToggleStep: () => void
  serverTimeOffset: number
}) {
  const count = progress?.count ?? 0
  const done = progress?.done ?? false
  const presets = item.presets?.length ? item.presets : []
  const effectiveCap = item.capMax ?? item.max ?? item.target ?? null
  const atCap = effectiveCap != null && count >= effectiveCap
  const pct = item.target ? Math.min(100, Math.round((count / item.target) * 100)) : 0
  const timeState = isTimeRuleViolated(item.timeRules, serverTimeOffset)

  if (item.kind === 'step') {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
        <Button variant={done ? 'secondary' : 'outline'} size="lg" className="w-full" onClick={onToggleStep}>
          {done ? <CheckCircle2 className="size-4" /> : <Check className="size-4" />}
          {done ? 'Đã hoàn thành' : 'Đánh dấu xong'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Bộ đếm biến</p>
          {item.target != null && (
            <span className={`text-xs font-medium ${done ? 'text-green-600 dark:text-green-400' : 'text-gold'}`}>
              {count}/{item.target}
            </span>
          )}
        </div>
        {item.target != null && (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${done ? 'bg-green-500' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {timeState.violated && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-3.5" />
          {timeState.message}
        </div>
      )}

      <button
        type="button"
        onClick={() => onIncrement(1)}
        disabled={atCap}
        className={`flex h-44 w-full flex-col items-center justify-center rounded-xl border-2 transition-transform active:scale-[0.99] ${
          done
            ? 'border-green-500/25 bg-green-500/5'
            : atCap
              ? 'border-amber-500/20 bg-amber-500/5'
              : 'border-gold/30 bg-gold/5 hover:bg-gold/10'
        }`}
      >
        <span className={`text-8xl font-bold leading-none ${done ? 'text-green-600 dark:text-green-400' : 'text-gold'}`}>
          {count}
        </span>
        <span className="mt-2 text-xs text-muted-foreground">Nhấn vào số để +1</span>
      </button>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <Button type="button" variant="outline" className="h-12 text-xl" onClick={onDecrement}>−</Button>
        <Button type="button" variant="outline" className="h-12 px-4" onClick={onReset}>Reset</Button>
        <Button type="button" variant="sacred" className="h-12 text-xl" onClick={() => onIncrement(1)} disabled={atCap}>+</Button>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset} type="button" variant="outline" size="sm" onClick={() => onIncrement(preset)} disabled={atCap}>
              +{preset}
            </Button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">Phím tắt: `Space` +1, `Backspace` -1, `R` reset.</p>
    </div>
  )
}
