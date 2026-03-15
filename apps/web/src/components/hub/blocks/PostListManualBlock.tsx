// components/hub/blocks/PostListManualBlock.tsx
// Visual: Phật giáo, không gian chủ đề, có dẫn nhập, palette vàng/trầm
import Link from 'next/link'
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi'
import type { BlogPost } from '@/types/strapi'
import { BookMarked } from 'lucide-react'

interface PostListManualBlockProps {
  heading: string
  description?: string
  posts: BlogPost[]
}

export default function PostListManualBlock({ heading, description, posts }: PostListManualBlockProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section>
      {/* ── Section Header — không gian chủ đề, có dẫn nhập ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block h-5 w-1 rounded-sm bg-gold/60 shrink-0" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-semibold">
            Tuyển Đọc
          </p>
        </div>

        <div className="flex items-start gap-3 pl-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/10">
            <BookMarked className="w-4 h-4 text-gold" />
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

      {/* ── Grid bài đọc ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => {
          const thumbUrl = post.thumbnail
            ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
            : null
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex h-full gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-gold/30 hover:shadow-ant"
            >
              {thumbUrl && (
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border/50">
                  <Image
                    src={thumbUrl}
                    alt={post.thumbnail?.alternativeText ?? post.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-[10px] font-medium text-gold/60 uppercase tracking-wider mb-1">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                    : ''}
                </p>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-3 leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/40 mt-2 font-medium group-hover:text-gold/50 transition-colors">
                  Đọc tiếp →
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
