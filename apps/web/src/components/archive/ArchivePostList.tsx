import Link from 'next/link'
import Image from 'next/image'
import type { StrapiList, BlogPost } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'

interface ArchivePostListProps {
  data: StrapiList<BlogPost>
  year: number
  month?: number
}

const MONTH_VI = [
  '', 'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
]

function PostCard({ post }: { post: BlogPost }) {
  const cover = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
    : null

  const day = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit' })
    : ''
  const month = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { month: 'short' })
    : ''

  return (
    <article className="group flex gap-5 rounded-xl border border-border bg-card px-5 py-5 transition-colors hover:border-gold/25 hover:bg-gold/[0.03] hover:shadow-ant">
      <div className="w-12 shrink-0 pt-1 text-center">
        <span className="ant-number block text-2xl text-foreground">{day}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/65">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <Link href={`/blog/${post.slug}`} className="ant-title mb-2 block text-xl leading-tight text-foreground transition-colors group-hover:text-gold">
          {post.title}
        </Link>
        {post.excerpt && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 text-[11px] text-gold/70">Đọc bài viết →</div>
      </div>

      {cover && (
        <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:block">
          <Image
            src={cover}
            alt={post.title}
            width={120}
            height={120}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </article>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  const cover = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.large?.url ?? post.thumbnail.url)
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-gold/35 hover:shadow-ant"
    >
      <div className="flex flex-col gap-0 lg:flex-row">
        {cover && (
          <div className="relative h-64 w-full shrink-0 overflow-hidden lg:h-auto lg:w-1/2">
            <Image
              src={cover}
              alt={post.title}
              width={600}
              height={480}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/25 lg:to-background/30" />
            <div className="absolute left-6 top-6 rounded-md border border-white/15 bg-black/35 px-4 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Bài tiêu biểu</span>
            </div>
          </div>
        )}
        <div className={`${cover ? 'lg:w-1/2' : 'w-full'} flex flex-col justify-center p-8 md:p-12`}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-sm bg-gold" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/70">Điểm tin lưu trữ</p>
            </div>

            <h2 className="ant-title text-3xl leading-[1.15] text-foreground transition-colors group-hover:text-gold md:text-4xl">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="border-l-2 border-gold/20 pl-5 text-base italic leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="pt-3 text-sm font-semibold text-gold">Đọc bài viết →</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ArchivePostList({ data, year, month }: ArchivePostListProps) {
  const { data: posts } = data

  const periodLabel = month
    ? `${MONTH_VI[month]} ${year}`
    : `Năm ${year}`

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gold/20 py-20 text-center">
        <p className="italic text-muted-foreground">Không tìm thấy bản ghi nào trong {periodLabel}.</p>
      </div>
    )
  }

  const [featured, ...remaining] = posts

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/70">Tuyển tập tiêu biểu</p>
          <span className="mx-6 hidden h-px flex-1 bg-gold/10 md:block" />
        </div>
        <FeaturedPostCard post={featured} />
      </section>

      {remaining.length > 0 && (
        <div className="border-t border-gold/10 pt-8">
          <p className="mb-6 text-sm text-muted-foreground">
            {remaining.length} bài viết khác · {periodLabel}
          </p>
          <div className="space-y-4">
            {remaining.map((post) => (
              <PostCard key={post.documentId} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
