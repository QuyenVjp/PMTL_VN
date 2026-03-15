// components/hub/blocks/DownloadGridBlock.tsx
// Visual: palette vàng/trầm Phật giáo — không dùng màu đỏ/tím/xanh lá mạnh
import { Download, ExternalLink, FileText, Music, Video, Archive, File, BookOpen, RefreshCw, Sparkles } from 'lucide-react'
import type { DownloadItem } from '@/types/strapi'

interface DownloadGridBlockProps {
  heading: string
  description?: string
  downloads: DownloadItem[]
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4" />
    case 'mp3': return <Music className="w-4 h-4" />
    case 'mp4': return <Video className="w-4 h-4" />
    case 'zip': return <Archive className="w-4 h-4" />
    case 'epub':
    case 'doc': return <BookOpen className="w-4 h-4" />
    default: return <File className="w-4 h-4" />
  }
}

/* Palette vàng/trầm — không dùng màu chói */
function typeBadgeClass(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-amber-500/10 text-amber-500'
    case 'mp3': return 'bg-gold/10 text-gold'
    case 'mp4': return 'bg-amber-700/10 text-amber-600'
    case 'zip': return 'bg-stone-500/10 text-stone-400'
    default: return 'bg-secondary text-muted-foreground'
  }
}

/* Label loại file */
function typeLabel(type: string): string {
  switch (type) {
    case 'pdf': return 'PDF'
    case 'mp3': return 'Âm Thanh'
    case 'mp4': return 'Video'
    case 'zip': return 'Lưu Trữ'
    case 'epub': return 'Sách'
    case 'doc': return 'Tài Liệu'
    default: return type.toUpperCase()
  }
}

export default function DownloadGridBlock({ heading, description, downloads }: DownloadGridBlockProps) {
  if (!downloads || downloads.length === 0) return null

  return (
    <section>
      {/* ── Section Header — nhất quán với các block khác ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block h-5 w-1 rounded-sm bg-gold/60 shrink-0" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-semibold">
            Thư Viện
          </p>
        </div>

        <div className="flex items-start gap-3 pl-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/10">
            <Download className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1">
            <h2 className="ant-title text-xl leading-snug text-foreground md:text-2xl">{heading}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed italic">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent mt-5" />
      </div>

      {/* ── Download Items ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {downloads.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-gold/30 hover:shadow-ant"
          >
            {/* Icon vàng/trầm */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105 ${typeBadgeClass(item.fileType)}`}>
              <FileIcon type={item.fileType} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* badge loại file — nhẹ, không chói */}
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${typeBadgeClass(item.fileType)}`}>
                  {typeLabel(item.fileType)}
                </span>
                {item.fileSizeMB && (
                  <span className="text-[10px] text-muted-foreground/50">{item.fileSizeMB}MB</span>
                )}
                {item.isNew && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gold font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> Mới
                  </span>
                )}
                {item.isUpdating && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                    <RefreshCw className="w-2.5 h-2.5" /> Cập nhật
                  </span>
                )}
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-muted-foreground/20 group-hover:text-gold transition-colors shrink-0" />
          </a>
        ))}
      </div>

      {/* note nhẹ */}
      <p className="text-xs text-muted-foreground/40 mt-4 text-center italic">
        Tất cả tài liệu hoàn toàn miễn phí — Nhấp để tải hoặc xem trực tuyến
      </p>
    </section>
  )
}
