// components/layout/widgets/CategoryWidget.tsx — Server component
// Compact category list for sidebar (top-level only)
import Link from 'next/link'
import { TagIcon } from 'lucide-react'
import { getCategoryTree } from '@/lib/api/categories'
import type { CategoryTree } from '@/types/cms'

export default async function CategoryWidget() {
  let topLevel: CategoryTree[] = []
  try {
    const tree = await getCategoryTree()
    topLevel = tree.slice(0, 12) // max 12 top-level for sidebar
  } catch {
    return null
  }

  if (topLevel.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold/80">
        Chủ đề
      </h3>
      <ul className="space-y-1.5">
        {topLevel.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/category/${cat.slug}`}
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-all hover:bg-secondary/35"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/45 text-muted-foreground transition-colors group-hover:text-gold">
                <TagIcon className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{cat.name}</span>
              {cat.children.length > 0 && (
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">
                  +{cat.children.length}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
