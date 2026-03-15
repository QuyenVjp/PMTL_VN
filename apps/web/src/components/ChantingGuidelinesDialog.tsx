'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import type { ChantingSetting } from '@/lib/api/chanting'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  setting: Pick<ChantingSetting, 'guidelinesTitle' | 'guidelinesSummary' | 'guidelineSections'>
}

function GuidelineBody({ setting }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 px-5 py-4 md:px-6">
        {setting.guidelineSections.map((section, index) => (
          <section key={section.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-md border border-gold/25 bg-gold/5 text-xs font-semibold text-gold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-foreground md:text-base">{section.title}</h3>
            </div>
            <div
              className="prose prose-sm max-w-none text-muted-foreground prose-p:leading-6 prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          </section>
        ))}
      </div>
    </div>
  )
}

export function ChantingGuidelinesDialog({ setting }: Props) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const trigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Info className="size-4" />
      <span>Lưu ý</span>
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[88vh] rounded-t-[1.25rem] border-border bg-background">
          <DrawerHeader className="gap-2 border-b border-border px-5 pb-4 pt-5 text-left">
            <DrawerTitle className="ant-title text-xl">
              {setting.guidelinesTitle || 'Những điều cần lưu ý'}
            </DrawerTitle>
            <DrawerDescription>
              {setting.guidelinesSummary || 'Những nhắc nhở ngắn giúp anh giữ sự trang nghiêm khi niệm.'}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
            <GuidelineBody setting={setting} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden rounded-xl border-border bg-background p-0">
        <DialogHeader className="gap-2 border-b border-border px-6 py-5">
          <DialogTitle>{setting.guidelinesTitle || 'Những điều cần lưu ý'}</DialogTitle>
          <DialogDescription>
            {setting.guidelinesSummary || 'Những nhắc nhở ngắn giúp anh giữ sự trang nghiêm khi niệm.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
          <GuidelineBody setting={setting} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
