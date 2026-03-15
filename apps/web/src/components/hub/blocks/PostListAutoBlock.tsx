// components/hub/blocks/PostListAutoBlock.tsx
import Link from 'next/link'
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { getPosts } from '@/lib/api/blog'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { Category } from '@/types/strapi'

interface PostListAutoBlockProps {
  heading: string
  description?: string
  category?: Category
  count: number
}

export default async function PostListAutoBlock({ heading, description, category, count }: PostListAutoBlockProps) {
  const postsRes = await getPosts({
    categorySlug: category?.slug,
    pageSize: count || 4
  })

  const posts = postsRes.data
  if (!posts || posts.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="ant-title text-2xl text-foreground">{heading}</h2>
          </div>
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-semibold text-gold hover:text-amber-500 flex items-center gap-1 transition-colors"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground ml-7">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => {
          const thumbUrl = post.thumbnail
            ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
            : null
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-gold/30 hover:shadow-ant"
            >
              {thumbUrl && (
                <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-secondary border border-border/50">
                  <Image
                    src={thumbUrl}
                    alt={post.thumbnail?.alternativeText ?? post.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                    : ''}
                </p>
                <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-gold transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
