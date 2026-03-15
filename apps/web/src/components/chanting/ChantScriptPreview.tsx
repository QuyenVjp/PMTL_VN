'use client'

import { useEffect, useState } from 'react'
import { BookOpenText, FileText, ImageIcon } from 'lucide-react'
import type { TodayChantItem } from '@/lib/api/chanting'
import { getCmsMediaUrl } from '@/lib/cms'
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
import PdfPreview from '@/components/PdfPreview'

interface Props {
  item: TodayChantItem
}

function ScriptPreviewBody({ item }: Props) {
  const imageItems = (item.scriptPreviewImages ?? [])
    .map((image) => ({
      ...image,
      url: getCmsMediaUrl(image.url) ?? image.url,
    }))
    .filter((image) => Boolean(image.url))

  const file = item.scriptFile
    ? {
        id: item.scriptFile.id,
        name: item.scriptFile.name,
        url: getCmsMediaUrl(item.scriptFile.url) ?? item.scriptFile.url,
        mime: item.scriptFile.mime,
        size: item.scriptFile.size,
        ext: item.scriptFile.ext,
        description: item.scriptFile.caption,
      }
    : null

  return (
    <div className="grid gap-4 px-5 py-4 md:px-6">
      {imageItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ImageIcon className="size-4 text-gold" />
            Ảnh bản kinh
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {imageItems.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-xl border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alternativeText || image.name}
                  className="h-auto w-full object-contain"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {file && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4 text-gold" />
            Bản PDF
          </div>
          <PdfPreview file={file} lazyLoad={false} />
        </section>
      )}

      {!file && imageItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
          Bài này hiện chưa có bản PDF hoặc ảnh preview. Anh vẫn có thể niệm trực tiếp trong phần văn bản.
        </div>
      )}
    </div>
  )
}

export function ChantScriptPreview({ item }: Props) {
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
      <BookOpenText className="size-4" />
      <span>Bản kinh</span>
    </Button>
  )

  const description = item.scriptFile || (item.scriptPreviewImages?.length ?? 0) > 0
    ? 'Mở bản kinh hoặc ảnh preview để tiện tụng niệm khi cần đối chiếu.'
    : 'Bài này hiện chưa có media preview, anh có thể dùng phần văn bản bên cạnh.'

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] rounded-t-[1.25rem] border-border bg-background">
          <DrawerHeader className="border-b border-border px-5 pb-4 pt-5 text-left">
            <DrawerTitle className="ant-title text-xl">{item.title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
            <ScriptPreviewBody item={item} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-xl border-border bg-background p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
          <ScriptPreviewBody item={item} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
