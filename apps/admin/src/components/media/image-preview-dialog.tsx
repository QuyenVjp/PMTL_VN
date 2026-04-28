import { useEffect, useState, type ReactNode } from "react";
import { Maximize2Icon, RotateCcwIcon, RotateCwIcon, Undo2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null | undefined;
  alt?: string;
  title?: string;
}

export function ImagePreviewDialog({ open, onOpenChange, src, alt = "Preview ảnh", title = "Xem ảnh" }: ImagePreviewDialogProps) {
  const resolvedSrc = resolveMediaSrc(src) ?? undefined;
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  function resetView() {
    setScale(1);
    setRotation(0);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetView();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[88vh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <DialogTitle className="truncate text-base">{title}</DialogTitle>
            <span className="rounded-md border bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">
              {Math.round(scale * 100)}% · {((rotation % 360) + 360) % 360}°
            </span>
          </div>
        </DialogHeader>

        {resolvedSrc ? (
          <TransformWrapper
            key={resolvedSrc}
            initialScale={1}
            minScale={0.25}
            maxScale={6}
            centerOnInit
            centerZoomedOut
            limitToBounds={false}
            wheel={{ step: 0.12 }}
            pinch={{ step: 5 }}
            doubleClick={{ mode: "toggle", step: 1.4 }}
            onTransform={(_, state) => setScale(state.scale)}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 border-b px-4 py-2">
                  <Button type="button" variant="outline" size="icon" className="size-9" onClick={() => zoomOut(0.25)} aria-label="Thu nhỏ ảnh">
                    <ZoomOutIcon className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="size-9" onClick={() => zoomIn(0.25)} aria-label="Phóng to ảnh">
                    <ZoomInIcon className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="size-9" onClick={() => setRotation((value) => value - 90)} aria-label="Xoay trái">
                    <RotateCcwIcon className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="size-9" onClick={() => setRotation((value) => value + 90)} aria-label="Xoay phải">
                    <RotateCwIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => {
                      resetTransform();
                      resetView();
                    }}
                    aria-label="Đặt lại ảnh"
                  >
                    <Undo2Icon className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={resolvedSrc} target="_blank" rel="noreferrer">
                      Ảnh gốc
                    </a>
                  </Button>
                </div>
                <div className="min-h-0 flex-1 bg-muted/40">
                  <TransformComponent
                    wrapperClass="!h-full !w-full"
                    contentClass="!h-full !w-full"
                    wrapperProps={{ className: "cursor-grab active:cursor-grabbing" }}
                  >
                    <div className="flex h-full w-full items-center justify-center p-6">
                      <img
                        src={resolvedSrc}
                        alt={alt}
                        className="max-h-full max-w-full select-none rounded-md bg-background object-contain shadow-sm"
                        draggable={false}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                        }}
                      />
                    </div>
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/40 p-4">
            <div className="rounded-lg border border-dashed bg-background px-4 py-8 text-sm text-muted-foreground">
              Không có ảnh để preview.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PreviewableImageProps {
  src: string | null | undefined;
  alt: string;
  title?: string;
  className?: string;
  imageClassName?: string;
  fallback?: ReactNode;
  loading?: "lazy" | "eager";
}

export function PreviewableImage({
  src,
  alt,
  title,
  className,
  imageClassName,
  fallback,
  loading = "lazy",
}: PreviewableImageProps) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveMediaSrc(src);
  const canPreview = Boolean(resolvedSrc && !failed);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative flex overflow-hidden rounded-md border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          canPreview ? "cursor-zoom-in" : "cursor-default",
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
          if (canPreview) setOpen(true);
        }}
        disabled={!canPreview}
        aria-label={canPreview ? `Xem preview ${alt}` : alt}
      >
        {canPreview ? (
          <>
            <img src={resolvedSrc ?? undefined} alt={alt} className={cn("size-full object-cover", imageClassName)} loading={loading} onError={() => setFailed(true)} />
            <span className="absolute right-1 top-1 flex size-6 items-center justify-center rounded bg-background/85 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2Icon className="size-3.5" />
            </span>
          </>
        ) : (
          fallback ?? null
        )}
      </button>
      <ImagePreviewDialog open={open} onOpenChange={setOpen} src={resolvedSrc} alt={alt} title={title ?? alt} />
    </>
  );
}
