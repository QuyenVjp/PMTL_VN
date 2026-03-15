'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Settings2 } from 'lucide-react'
import type { ChantSessionConfig, TodayChantItem } from '@/lib/api/chanting'
import { buildDefaultTemplateConfig, normalizeChantConfig } from '@/lib/chanting-config'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Props {
  items: TodayChantItem[]
  templateConfig: ChantSessionConfig
  sessionConfig: ChantSessionConfig
  onSaveTemplate: (config: ChantSessionConfig) => Promise<void>
  onSaveSession: (config: ChantSessionConfig) => Promise<void>
}

function getEnabledOptionalSlugs(items: TodayChantItem[], config: ChantSessionConfig) {
  return config.enabledOptionalSlugs ?? buildDefaultTemplateConfig(items).enabledOptionalSlugs ?? []
}

export function ChantingPreferencesDialog({
  items,
  templateConfig,
  sessionConfig,
  onSaveTemplate,
  onSaveSession,
}: Props) {
  const [open, setOpen] = useState(false)
  const [templateDraft, setTemplateDraft] = useState<ChantSessionConfig>({})
  const [sessionDraft, setSessionDraft] = useState<ChantSessionConfig>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setTemplateDraft(normalizeChantConfig(templateConfig))
    setSessionDraft(normalizeChantConfig(sessionConfig))
  }, [open, sessionConfig, templateConfig])

  const optionalItems = useMemo(() => items.filter((item) => item.isOptional), [items])
  const configurableItems = useMemo(() => items.filter((item) => item.kind !== 'step'), [items])

  const updateToggle = (
    scope: 'template' | 'session',
    slug: string,
    checked: boolean,
  ) => {
    const current = scope === 'template' ? templateDraft : sessionDraft
    const setter = scope === 'template' ? setTemplateDraft : setSessionDraft
    const currentEnabled = new Set(getEnabledOptionalSlugs(items, current))
    if (checked) currentEnabled.add(slug)
    else currentEnabled.delete(slug)
    setter({
      ...current,
      enabledOptionalSlugs: Array.from(currentEnabled),
    })
  }

  const updateTarget = (
    scope: 'template' | 'session',
    slug: string,
    value: string,
  ) => {
    const current = scope === 'template' ? templateDraft : sessionDraft
    const setter = scope === 'template' ? setTemplateDraft : setSessionDraft
    setter({
      ...current,
      targetsBySlug: {
        ...(current.targetsBySlug ?? {}),
        [slug]: Number(value || 0),
      },
    })
  }

  const updateIntention = (
    scope: 'template' | 'session',
    slug: string,
    field: 'selfName' | 'counterpartName' | 'wish',
    value: string,
  ) => {
    const current = scope === 'template' ? templateDraft : sessionDraft
    const setter = scope === 'template' ? setTemplateDraft : setSessionDraft
    setter({
      ...current,
      intentionsBySlug: {
        ...(current.intentionsBySlug ?? {}),
        [slug]: {
          ...(current.intentionsBySlug?.[slug] ?? {}),
          [field]: value,
        },
      },
    })
  }

  const handleSave = (scope: 'template' | 'session') => {
    startTransition(async () => {
      try {
        if (scope === 'template') {
          await onSaveTemplate(templateDraft)
          toast.success('Đã lưu công khóa mặc định của anh')
        } else {
          await onSaveSession(sessionDraft)
          toast.success('Đã áp dụng cấu hình cho hôm nay')
        }
      } catch {
        toast.error('Không thể lưu cấu hình niệm kinh')
      }
    })
  }

  const renderConfigScope = (scope: 'template' | 'session', draft: ChantSessionConfig) => (
    <div className="space-y-5">
      {optionalItems.length > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Bài chú tùy chọn</h3>
            <p className="text-sm text-muted-foreground">
              Bật hoặc tắt các bài chú nhỏ theo nhu cầu của anh. Bài cốt lõi vẫn luôn được giữ lại.
            </p>
          </div>
          <div className="space-y-3">
            {optionalItems.map((item) => {
              const enabled = getEnabledOptionalSlugs(items, draft).includes(item.slug)
              return (
                <div key={item.slug} className="flex items-start justify-between gap-3 rounded-md border border-border/70 bg-background px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.target ? `Mặc định ${item.target} biến` : 'Bài tùy chọn'}
                    </p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={(checked) => updateToggle(scope, item.slug, checked)} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Số biến mục tiêu</h3>
          <p className="text-sm text-muted-foreground">
            Điều chỉnh mục tiêu trong biên mà admin đã cho phép. Nếu không sửa, hệ thống dùng mức mặc định.
          </p>
        </div>
        <div className="space-y-3">
          {configurableItems.map((item) => {
            const currentValue = draft.targetsBySlug?.[item.slug] ?? item.target ?? 0
            return (
              <div key={item.slug} className="rounded-md border border-border/70 bg-background px-3 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.min != null || item.max != null
                        ? `Cho phép ${item.min ?? 0} - ${item.max ?? 'không giới hạn'} biến`
                        : 'Theo mục tiêu admin'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(item.presets ?? []).slice(0, 4).map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateTarget(scope, item.slug, String(preset))}
                      >
                        {preset}
                      </Button>
                    ))}
                    <Input
                      type="number"
                      min={item.min ?? undefined}
                      max={item.max ?? undefined}
                      value={currentValue}
                      onChange={(event) => updateTarget(scope, item.slug, event.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Nguyện hôm nay</h3>
          <p className="text-sm text-muted-foreground">
            Dùng cho các thần chú cần ghi tâm nguyện cá nhân. Hệ thống sẽ hiển thị gọn trong player để anh tiện theo dõi.
          </p>
        </div>
        <div className="space-y-4">
          {items.filter((item) => item.kind === 'mantra').map((item) => {
            const intention = draft.intentionsBySlug?.[item.slug] ?? {}
            return (
              <div key={item.slug} className="rounded-md border border-border/70 bg-background px-3 py-3">
                <p className="mb-3 text-sm font-medium text-foreground">{item.title}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tên của anh</Label>
                    <Input
                      value={intention.selfName ?? ''}
                      onChange={(event) => updateIntention(scope, item.slug, 'selfName', event.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên đối phương</Label>
                    <Input
                      value={intention.counterpartName ?? ''}
                      onChange={(event) => updateIntention(scope, item.slug, 'counterpartName', event.target.value)}
                      placeholder="Không bắt buộc"
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Điều cầu nguyện</Label>
                  <Textarea
                    value={intention.wish ?? ''}
                    onChange={(event) => updateIntention(scope, item.slug, 'wish', event.target.value)}
                    placeholder="Ví dụ: tiêu tai cát tường, hóa giải ác duyên..."
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="size-4" />
          <span>Công khóa của tôi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-xl border-border bg-background p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Công khóa của tôi</DialogTitle>
          <DialogDescription>
            Anh có thể giữ một mẫu công khóa riêng và chỉnh nhanh cho riêng hôm nay mà không làm mất baseline của admin.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="template" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border px-6 py-4">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="template">Mặc định của tôi</TabsTrigger>
              <TabsTrigger value="today">Hôm nay</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="template" className="mt-0 flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-6 py-5" data-lenis-prevent>
              {renderConfigScope('template', templateDraft)}
            </ScrollArea>
            <DialogFooter className="border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button type="button" variant="sacred" onClick={() => handleSave('template')} disabled={isPending}>
                Lưu mẫu công khóa
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="today" className="mt-0 flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-6 py-5" data-lenis-prevent>
              {renderConfigScope('session', sessionDraft)}
            </ScrollArea>
            <DialogFooter className="border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button type="button" variant="sacred" onClick={() => handleSave('session')} disabled={isPending}>
                Áp dụng cho hôm nay
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
