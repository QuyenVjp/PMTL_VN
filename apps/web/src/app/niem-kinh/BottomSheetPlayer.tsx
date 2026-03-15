'use client'

import { useEffect } from 'react'
import { AlertTriangle, Check, CheckCircle2, Circle, Clock3, X } from 'lucide-react'
import type { ItemProgress, TodayChantItem } from '@/lib/api/chanting'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChantScriptPreview } from '@/components/chanting/ChantScriptPreview'

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

interface Props {
  item: TodayChantItem | null
  progress: ItemProgress | undefined
  onClose: () => void
  onIncrement: (by: number) => void
  onDecrement: () => void
  onReset: () => void
  onToggleStep: () => void
  serverTimeOffset: number
}

export default function BottomSheetPlayer({
  item,
  progress,
  onClose,
  onIncrement,
  onDecrement,
  onReset,
  onToggleStep,
  serverTimeOffset,
}: Props) {
  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [item])

  if (!item) return null

  const count = progress?.count ?? 0
  const done = progress?.done ?? (item.kind !== 'step' && item.target != null && count >= item.target)
  const effectiveCap = item.capMax ?? item.max ?? item.target ?? null
  const atCap = effectiveCap != null && count >= effectiveCap
  const pct = item.kind === 'step' ? (done ? 100 : 0) : item.target ? Math.min(100, Math.round((count / item.target) * 100)) : 0
  const presets = item.presets?.length ? item.presets : []
  const timeState = isTimeRuleViolated(item.timeRules, serverTimeOffset)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[1.4rem] border-t border-border bg-background shadow-2xl lg:hidden">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/25" />
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-foreground">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.target ? `Mục tiêu hôm nay: ${item.target} biến` : 'Bài này không đặt số biến bắt buộc.'}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="mx-5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${done ? 'bg-green-500' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
        </div>

        {timeState.violated && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-md border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-3.5" />
            <Clock3 className="size-3.5" />
            {timeState.message}
          </div>
        )}

        <ScrollArea className="mt-4 h-[calc(88vh-13.5rem)] px-5 pb-6" data-lenis-prevent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <ChantScriptPreview item={item} />
            </div>

            {item.openingPrayer && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Lời mở đầu</p>
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {item.openingPrayer.split('\n').map((paragraph, index) => (
                    <p key={`${item.slug}-mobile-prayer-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="text" className="space-y-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Văn bản</TabsTrigger>
                <TabsTrigger value="counter">Bộ đếm</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-0">
                {item.content ? (
                  <div
                    className="prose prose-sm max-w-none rounded-xl border border-border bg-card px-4 py-4 text-foreground/85 prose-headings:font-serif prose-headings:text-foreground prose-p:leading-7"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    Bài này hiện chưa có văn bản rút gọn.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="counter" className="mt-0">
                {item.kind === 'step' ? (
                  <Button variant={done ? 'secondary' : 'outline'} size="lg" className="w-full" onClick={onToggleStep}>
                    {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                    {done ? 'Đã hoàn thành' : 'Đánh dấu xong'}
                  </Button>
                ) : (
                  <div className="space-y-4">
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
                      <span className="mt-2 text-xs text-muted-foreground">Chạm vào số để +1</span>
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
                    {done && (
                      <div className="inline-flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-700 dark:text-green-300">
                        <Check className="size-3.5" />
                        Anh đã đủ mục tiêu cho bài này.
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
