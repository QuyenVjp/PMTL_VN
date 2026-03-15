export interface RevalidationTarget {
  tags: string[]
  paths: string[]
}

interface WebhookEntry {
  documentId?: string
  slug?: string
  [key: string]: unknown
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function getRevalidationTarget(uidOrModel: string, entry?: WebhookEntry): RevalidationTarget {
  const slug = typeof entry?.slug === 'string' ? entry.slug : undefined
  const tags: string[] = []
  const paths: string[] = []

  switch (uidOrModel) {
    case 'api::blog-post.blog-post':
    case 'blog-post':
      tags.push('blog-posts', 'blog-posts-slugs', 'blog-posts-related')
      paths.push('/blog', '/search', '/archive')
      if (slug) {
        tags.push(`blog-post-${slug}`, `blog-post-seo-${slug}`)
        paths.push(`/blog/${slug}`)
      }
      if (typeof entry?.documentId === 'string') tags.push(`blog-post-${entry.documentId}`)
      break
    case 'api::category.category':
    case 'category':
      tags.push('categories', 'blog-posts')
      paths.push('/blog', '/search')
      if (slug) paths.push(`/category/${slug}`)
      break
    case 'api::blog-tag.blog-tag':
    case 'blog-tag':
      tags.push('blog-tags', 'blog-posts')
      paths.push('/blog', '/search')
      if (slug) paths.push(`/tag/${slug}`)
      break
    case 'api::hub-page.hub-page':
    case 'hub-page':
      tags.push('hub-pages')
      if (slug) paths.push(`/hub/${slug}`)
      break
    case 'api::download-item.download-item':
    case 'download-item':
      tags.push('downloads')
      paths.push('/library')
      break
    case 'api::event.event':
    case 'event':
      tags.push('events')
      paths.push('/events')
      if (slug) paths.push(`/events/${slug}`)
      break
    case 'api::site-setting.site-setting':
    case 'site-setting':
    case 'setting':
      tags.push('homepage-settings', 'settings')
      paths.push('/')
      break
    case 'api::sidebar-config.sidebar-config':
    case 'sidebar-config':
      tags.push('sidebar-config')
      paths.push('/blog')
      break
    case 'api::gallery-item.gallery-item':
    case 'gallery-item':
      tags.push('gallery')
      paths.push('/gallery')
      break
    case 'api::sutra.sutra':
    case 'sutra':
      tags.push('sutras', 'sutra-dictionary')
      paths.push('/kinh-dien')
      if (slug) paths.push(`/kinh-dien/${slug}`)
      break
    default:
      break
  }

  return {
    tags: unique(tags),
    paths: unique(paths),
  }
}
