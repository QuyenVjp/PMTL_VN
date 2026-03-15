import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { fetchEventBySlug, getAllEventSlugs } from '@/lib/api/event'
import { getStrapiMediaUrl } from '@/lib/strapi'
import {
  Calendar, MapPin, User, Globe, ExternalLink,
  ChevronLeft, FileText, Download, Play, Video
} from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

const typeLabels: Record<string, string> = {
  'dharma-talk': 'Pháp Hội',
  'webinar': 'Trực Tuyến',
  'retreat': 'Khóa Tu',
  'liberation': 'Phóng Sinh',
  'festival': 'Lễ Hội',
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllEventSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const event = await fetchEventBySlug(slug)
    if (!event) return { title: 'Sự kiện không tìm thấy' }

    const imageUrl = event.coverImage ? getStrapiMediaUrl(event.coverImage.url) : undefined

    return {
      title: `${event.title} — Pháp Môn Tâm Linh`,
      description: event.description || '',
      openGraph: {
        title: event.title,
        description: event.description || '',
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    }
  } catch {
    return { title: 'Sự Kiện & Pháp Hội' }
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  if (!event) notFound()

  const coverUrl = event.coverImage ? getStrapiMediaUrl(event.coverImage.url) : null
  const typeLabel = typeLabels[event.type] ?? event.type
  const oembedHtml =
    typeof event.oembed?.oembed?.html === 'string' && event.oembed.oembed.html.length > 0
      ? event.oembed.oembed.html
      : null
  const isUpcoming = event.eventStatus === 'upcoming' || event.eventStatus === 'live'
  const dateValue = event.date ? new Date(event.date) : null
  const eventStart = dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue : null
  const eventEnd = eventStart ? new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) : null
  const formatCalendarDate = (value: Date) =>
    value
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z')
  const googleCalendarUrl =
    eventStart && eventEnd
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description || event.content?.replace(/<[^>]+>/g, ' ').trim() || '')}&location=${encodeURIComponent(event.location || '')}&dates=${formatCalendarDate(eventStart)}/${formatCalendarDate(eventEnd)}`
      : null
  const mapUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null
  const attendanceLabel = event.link ? 'Trực tuyến / đăng ký' : 'Trực tiếp tại đạo tràng'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderServer />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-gold/10 bg-gradient-to-b from-card/70 to-background">
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt={event.coverImage?.alternativeText || event.title}
                fill
                className="object-cover opacity-[0.07] select-none grayscale-[30%]"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/8 via-background to-background" />
          )}

          <div className="container relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-20">
            <Link
              href="/events"
              className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold/70 transition-colors hover:text-gold"
            >
              <ChevronLeft className="w-4 h-4" /> Tuyển Tập Sự Kiện
            </Link>

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-md border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold">
                {typeLabel}
              </span>
              <span className="rounded-md border border-border bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground/80">
                {attendanceLabel}
              </span>
              {event.eventStatus === 'live' && (
                <span className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-500">
                  <span className="h-1.5 w-1.5 rounded-sm bg-red-500 animate-pulse" /> Trực Tiếp
                </span>
              )}
            </div>

            <h1 className="mb-5 font-display text-4xl leading-[1.08] text-foreground md:text-5xl lg:text-6xl">
              {event.title}
            </h1>

            {event.description && (
              <p className="max-w-3xl text-lg italic leading-relaxed text-muted-foreground md:text-xl">
                {event.description}
              </p>
            )}
          </div>
        </section>

        {/* Program / Invitation Panel */}
        <div className="container relative z-20 mx-auto mb-16 max-w-5xl px-6">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-ant md:flex-row">
            {/* Meta Grid */}
            <div className="flex-1 p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
              {event.date && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Khởi hành
                  </p>
                  <p className="font-medium text-foreground text-lg">
                    {new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {event.timeString && <p className="text-sm text-muted-foreground mt-1">{event.timeString}</p>}
                </div>
              )}
              {event.location && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Tọa lạc
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.location}</p>
                </div>
              )}
              {event.speaker && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Giảng sư
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.speaker}</p>
                </div>
              )}
              {event.language && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Ngôn ngữ
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.language}</p>
                </div>
              )}
            </div>

            {/* Sacred Action CTA Area */}
            {(event.link || googleCalendarUrl || mapUrl) && (
              <div className="flex flex-col items-stretch justify-center border-t border-gold/10 bg-gold/5 p-8 md:w-72 md:border-l md:border-t-0">
                {event.link ? (
                  isUpcoming ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-4 text-center">Hoan hỷ mời quý đạo hữu cùng tham dự pháp hội.</p>
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-4 text-sm font-bold text-black transition-colors hover:bg-gold/90"
                      >
                        <ExternalLink className="w-4 h-4" /> Tham Gia Ngay
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-4 text-center">Pháp hội đã viên mãn. Quý vị có thể xem lại tư liệu.</p>
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold/40 bg-card px-6 py-4 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
                      >
                        <Video className="w-4 h-4" /> Xem Tư Liệu
                      </a>
                    </>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Thông tin tham dự đang cập nhật. Quý đạo hữu có thể lưu lịch và xem đường đi trước.
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  {googleCalendarUrl ? (
                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-gold/35 hover:text-gold"
                    >
                      <Calendar className="w-4 h-4" /> Lưu vào lịch cá nhân
                    </a>
                  ) : null}
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-gold/35 hover:text-gold"
                    >
                      <MapPin className="w-4 h-4" /> Xem địa điểm
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 max-w-4xl pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-16 items-start">

            {/* Main Program Description */}
            <div className="min-w-0">
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px bg-gold/30 w-12" />
                <h2 className="ant-title text-2xl text-foreground">Nội Dung Chương Trình</h2>
              </div>

              {event.content ? (
                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-gold hover:prose-a:text-gold/80 prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">Đang cập nhật nội dung chi tiết môn quy và lịch trình...</p>
              )}

              {/* Media: YouTube */}
              {event.youtubeId && (
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-px bg-gold/30 w-12" />
                    <h2 className="ant-title text-2xl text-foreground">Pháp Âm / Hình Ảnh</h2>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-ant">
                    <iframe
                      src={`https://www.youtube.com/embed/${event.youtubeId}`}
                      title="Video sự kiện"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              {oembedHtml && !event.youtubeId && (
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-px bg-gold/30 w-12" />
                    <h2 className="ant-title text-2xl text-foreground">Pháp Âm / Hình Ảnh</h2>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 shadow-ant md:p-4">
                    <div
                      className="prose prose-sm max-w-none [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: oembedHtml }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-px bg-gold/30 w-12" />
                    <h2 className="ant-title text-2xl text-foreground">Khoảnh Khắc Pháp Hội</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {event.gallery.map((img) => {
                      const imgUrl = getStrapiMediaUrl(img.url)
                      if (!imgUrl) return null
                      return (
                        <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group cursor-zoom-in">
                          <Image
                            src={imgUrl}
                            alt="Khoảnh khắc sự kiện"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Resources Shelf */}
            <div className="md:sticky md:top-24 space-y-12">
              {event.files && event.files.length > 0 && (
                <div>
                  <h3 className="ant-title mb-4 flex items-center gap-2 text-xl text-foreground">
                    Kệ Tài Liệu
                  </h3>
                  <div className="space-y-3">
                    {event.files.map((file) => {
                      const fileUrl = getStrapiMediaUrl(file.url)
                      if (!fileUrl) return null
                      const isImage = file.mime?.startsWith('image/')
                      const Icon = isImage ? FileText : Download
                      return (
                        <a
                          key={file.id}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-gold/40 hover:bg-gold/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm text-foreground font-medium line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Share/Action */}
              <div className="rounded-xl border border-border bg-secondary/50 p-6 text-center">
                <p className="text-sm text-foreground font-medium mb-2">Chuyển tiếp thư mời</p>
                <p className="text-xs text-muted-foreground mb-4">Chia sẻ cơ hội tu học đến những người hữu duyên.</p>
                {/* 
                  Do đây là server component, ta không dùng nút có window.navigator được. 
                  Sửa lại thành một simple "Chép link" thủ công hoặc copy logic nhẹ bằng Client component nhỏ 
                  nếu cần. Ở đây để giữ mã nguồn Server, ta thay bằng lời kêu gọi. 
                */}
                <div className="w-full py-2.5 rounded-lg border border-gold/30 bg-card text-gold text-xs font-bold uppercase cursor-default">
                  Hoan Hỷ Chia Sẻ
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
