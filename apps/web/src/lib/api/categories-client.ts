import type { Category, CategoryTree, StrapiList } from '@/types/strapi'

// ── Cache phía trình duyệt: categories ít khi thay đổi ────────
let _cacheData: Category[] | null = null
let _cacheTime = 0
let _treeCacheData: CategoryTree[] | null = null
let _treeCacheTime = 0
const CACHE_THOI_GIAN = 5 * 60 * 1000 // 5 phút

/**
 * Lấy danh sách chủ đề khai thị từ Route Handler.
 * Có cache 5 phút phía client để tránh gọi network mỗi lần mở menu.
 */
export async function getCategoriesClient(): Promise<Category[]> {
  // Trả cache nếu còn hạn
  if (_cacheData && Date.now() - _cacheTime < CACHE_THOI_GIAN) {
    return _cacheData
  }

  try {
    const res = await fetch('/api/categories', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Để trình duyệt / CDN cache theo Cache-Control header từ route handler
    })

    if (!res.ok) return _cacheData ?? []

    const data: StrapiList<Category> = await res.json()
    const danhSach = data.data ?? []

    // Cập nhật cache phía client
    _cacheData = danhSach
    _cacheTime = Date.now()

    return danhSach
  } catch (error) {
    console.error('[DanhMuc] Lỗi khi lấy danh mục:', error)
    return _cacheData ?? []
  }
}

export async function getCategoryTreeClient(): Promise<CategoryTree[]> {
  if (_treeCacheData && Date.now() - _treeCacheTime < CACHE_THOI_GIAN) {
    return _treeCacheData
  }

  try {
    const res = await fetch('/api/categories/tree', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) return _treeCacheData ?? []

    const data: { data: CategoryTree[] } = await res.json()
    const tree = data.data ?? []

    _treeCacheData = tree
    _treeCacheTime = Date.now()

    return tree
  } catch (error) {
    console.error('[DanhMuc] Lỗi khi lấy cây danh mục:', error)
    return _treeCacheData ?? []
  }
}
