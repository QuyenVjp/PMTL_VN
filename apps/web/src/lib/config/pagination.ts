// ─────────────────────────────────────────────────────────────
//  lib/config/pagination.ts — Cấu hình phân trang dùng chung
//  Sử dụng ở mọi trang có danh sách: blog, search, category...
// ─────────────────────────────────────────────────────────────

export const PAGINATION = {
  /** Số bài mặc định mỗi trang cho trang blog */
  BLOG_PAGE_SIZE: 20,
  /** Số bài mặc định cho trang tìm kiếm */
  SEARCH_PAGE_SIZE: 20,
  /** Số bài mặc định cho trang category */
  CATEGORY_PAGE_SIZE: 24,
  /** Số bài tối đa hiển thị cho Khai thị liên kết (không phân trang router, chỉ giới hạn hiển thị) */
  RELATED_BLOGS_LIMIT: 3,
  /** Số trang tối đa hiển thị trong pagination bar (không tính prev/next) */
  MAX_VISIBLE_PAGES: 5,
  /** Số trang hiển thị ở đầu và cuối trước khi dùng ellipsis */
  SIBLING_COUNT: 1,
} as const

/** Tính danh sách số trang để hiển thị (có ellipsis) */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = PAGINATION.SIBLING_COUNT
): (number | 'ellipsis')[] {
  // Tổng số "slot" = 2*sibling + trang đầu + trang cuối + trang hiện tại + 2 ellipsis = 7
  const totalSlots = siblingCount * 2 + 5

  // Nếu ít trang hơn slots, hiển thị tất cả
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    // Ưu tiên trái: [1...(2+2*sibling)] ... [last]
    const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Ưu tiên phải: [1] ... [(last - 2 - 2*sibling)...last]
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (3 + 2 * siblingCount) + 1 + i
    )
    return [1, 'ellipsis', ...rightRange]
  }

  // Cả hai phía: [1] ... [left...right] ... [last]
  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i
  )
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}
