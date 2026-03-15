// ─────────────────────────────────────────────────────────────
//  lib/api/categories.ts — Category tree API
//  Server-side only
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { Category, CategoryTree, StrapiList } from '@/types/strapi'

interface CategoryTreeResponse {
  data: CategoryTree[]
  meta: {
    totalRoots: number
  }
}

/** Fetch flat list of all categories */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await strapiFetch<StrapiList<Category>>('/categories', {
      sort: ['order:asc', 'name:asc'],
      populate: ['parent'],
      pagination: { page: 1, pageSize: 100 },
      next: { revalidate: 300, tags: ['categories'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getCategoryTree(): Promise<CategoryTree[]> {
  try {
    const res = await strapiFetch<CategoryTreeResponse>('/categories/tree', {
      next: { revalidate: 300, tags: ['categories'] },
    })

    return Array.isArray(res.data) ? res.data : []
  } catch {
    const flat = await getCategories()
    return buildCategoryTree(flat)
  }
}

/** Get single category by slug */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const res = await strapiFetch<StrapiList<Category>>('/categories', {
      filters: { slug: { $eq: slug } },
      populate: ['parent', 'parent.parent'],
      pagination: { page: 1, pageSize: 1 },
      next: { revalidate: 300, tags: [`category-${slug}`] },
    })
    return res.data[0] ?? null
  } catch {
    return null
  }
}

/**
 * Build hierarchical tree from flat category list.
 * Categories with no parent become root nodes.
 */
export function buildCategoryTree(flat: Category[]): CategoryTree[] {
  const map = new Map<number, CategoryTree>()

  // Initialise all nodes
  for (const cat of flat) {
    map.set(cat.id, { ...cat, children: [], depth: 0 })
  }

  const roots: CategoryTree[] = []

  for (const node of Array.from(map.values())) {
    if (node.parent?.id && map.has(node.parent.id)) {
      const parent = map.get(node.parent.id)!
      node.depth = parent.depth + 1
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // Sort each level by order
  const sortLevel = (nodes: CategoryTree[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    nodes.forEach((n) => sortLevel(n.children))
  }
  sortLevel(roots)

  return roots
}

/** Breadcrumb path from root to given slug */
export function getCategoryBreadcrumb(flat: Category[], slug: string): Category[] {
  const target = flat.find((c) => c.slug === slug)
  if (!target) return []

  const path: Category[] = [target]
  let current = target

  while (current.parent?.id) {
    const parent = flat.find((c) => c.id === current.parent!.id)
    if (!parent) break
    path.unshift(parent)
    current = parent
  }

  return path
}
