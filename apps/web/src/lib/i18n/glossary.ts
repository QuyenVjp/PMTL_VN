/**
 * Vietnamese Glossary & UI Constants
 * Standardized terminology for PMTL project
 * Usage: import { i18n } from '@/lib/i18n/glossary' 
 */

export const i18n = {
  // ─── Navigation & Global ───
  nav: {
    home: 'Trang Chủ',
    about: 'Giới Thiệu',
    blog: 'Khai Thị (Blog)',
    contact: 'Liên Hệ',
    login: 'Đăng Nhập',
    signup: 'Đăng Ký',
    logout: 'Đăng Xuất',
    profile: 'Hồ Sơ',
    settings: 'Cài Đặt',
    search: 'Tìm Kiếm',
    menu: 'Menu',
    close: 'Đóng',
    back: 'Quay Lại',
    next: 'Tiếp Theo',
    prev: 'Trước Đó',
    moreInfo: 'Thêm Thông Tin',
    readMore: 'Đọc Tiếp',
  },

  // ─── Practice & Learning ───
  practice: {
    beginnerGuide: 'Hướng Dẫn Sơ Học',
    chanting: 'Niệm Kinh Online',
    dailyRecitation: 'Kinh Bài Tập Hằng Ngày',
    qa: 'Hỏi Đáp Phật Học',
    library: 'Thư Viện Kinh Sách',
    lunarCalendar: 'Lịch Tu Học',
    sutraPractice: 'Bài Tập Kinh Điển',
    guidedChanting: 'Niệm Kinh Hướng Dẫn',
    listeningDharma: 'Nghe Giảng Pháp',
    releaseLife: 'Phóng Sinh',
  },

  // ─── Content & Media ───
  content: {
    teachings: 'Khai Thị',
    videos: 'Video Khai Thị',
    radio: 'Đài Phát Thanh',
    articles: 'Bài Viết',
    podcasts: 'Podcast Phật Pháp',
    gallery: 'Galerie Hình Ảnh',
    events: 'Sự Kiện & Pháp Hội',
    directory: 'Danh Bạ Toàn Cầu',
    downloads: 'Tài Liệu Tải Về',
  },

  // ─── Community ───
  community: {
    forum: 'Diễn Đàn',
    testimonials: 'Chứng Nghiệm & Chia Sẻ',
    shares: 'Chia Sẻ Kinh Nghiệm',
    donations: 'Hộ Trì Phật Pháp',
    volunteer: 'Tình Nguyện Viên',
    groupChat: 'Nhóm Chat',
  },

  // ─── Buddhist Terms (phải viết hoa, tôn trọng) ───
  buddhist: {
    dhamma: 'Phật Pháp',
    dharma: 'Pháp Môn',
    buddha: 'Phật',
    avalokitesvara: 'Quán Thế Âm Bồ Tát',
    bodhisattva: 'Bồ Tát',
    enlightenment: 'Giác Ngộ',
    cultivation: 'Tu Tập',
    practitioner: 'Phật Tử',
    chanting: 'Niệm Tụng',
    sutra: 'Kinh',
    precepts: 'Giới Luật',
    karma: 'Nghiệp',
    compassion: 'Từ Bi',
    wisdom: 'Trí Tuệ',
    liberation: 'Giải Thoát',
  },

  // ─── User Actions & CTA ───
  actions: {
    submit: 'Gửi',
    save: 'Lưu',
    edit: 'Chỉnh Sửa',
    delete: 'Xóa',
    cancel: 'Hủy',
    confirm: 'Xác Nhận',
    tryAgain: 'Thử Lại',
    load: 'Tải',
    loading: 'Đang Tải...',
    error: 'Lỗi',
    errorOccurred: 'Có Lỗi Xảy Ra',
    success: 'Thành Công',
    noData: 'Không Có Dữ Liệu',
    emptyState: 'Chưa Có Nội Dung',
    retry: 'Thử Lại',
  },

  // ─── Metadata & Info ───
  metadata: {
    author: 'Tác Giả',
    publishedAt: 'Xuất Bản',
    updatedAt: 'Cập Nhật',
    views: 'Lượt Xem',
    likes: 'Thích',
    comments: 'Bình Luận',
    shares: 'Chia Sẻ',
    category: 'Danh Mục',
    tags: 'Tags',
    duration: 'Thời Lượng',
    date: 'Ngày',
    time: 'Giờ',
  },

  // ─── Validation & Messages ───
  validation: {
    required: 'Không Được Để Trống',
    invalidEmail: 'Email Không Hợp Lệ',
    passwordTooShort: 'Mật Khẩu Quá Ngắn',
    passwordMismatch: 'Mật Khẩu Không Khớp',
    nameRequired: 'Vui Lòng Nhập Tên',
    agreeTerms: 'Vui Lòng Đồng Ý Với Điều Khoản',
  },

  // ─── Error Messages ───
  errors: {
    errorOccurred: 'Có Lỗi Xảy Ra',
    tryAgain: 'Thử Lại',
    backHome: 'Quay Về Trang Chủ',
    pageNotFound: 'Không Tìm Thấy Trang',
    notAuthorized: 'Bạn Không Có Quyền Truy Cập',
    networkError: 'Lỗi Kết Nối Mạng',
    contactSupport: 'Liên Hệ Hỗ Trợ',
  },

  // ─── Footer & External Links ───
  external: {
    youtube: 'YouTube',
    facebook: 'Facebook',
    zalo: 'Zalo',
    tiktok: 'TikTok',
    website: 'Website Chính Thức',
    globalSite: 'Website Toàn Cầu (心灵法门)',
    masterBlog: 'Blog Đài Trưởng Lư',
    guidelines: 'Hướng Dẫn Sử Dụng',
    privacyPolicy: 'Chính Sách Riêng Tư',
    termsOfService: 'Điều Khoản Dịch Vụ',
    copyright: 'Bản Quyền © 2024-2026 Pháp Môn Tâm Linh. Tất Cả Quyền Được Bảo Vệ.',
  },

  // ─── Status & States ───
  status: {
    active: 'Hoạt Động',
    inactive: 'Không Hoạt Động',
    pending: 'Đang Chờ',
    approved: 'Đã Duyệt',
    rejected: 'Bị Từ Chối',
    draft: 'Nháp',
    published: 'Đã Xuất Bản',
    archived: 'Đã Lưu Trữ',
  },

  // ─── Date & Time Formatting ───
  dateFormat: {
    // Use with date-fns: format(date, i18n.dateFormat.shortDate)
    shortDate: 'dd/MM/yyyy',
    longDate: 'dd MMMM yyyy',
    time: 'HH:mm',
    dateTime: 'dd/MM/yyyy HH:mm',
    iso: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },

  // ─── Punctuation (Vietnamese style) ───
  punctuation: {
    colon: ': ',        // space after colon
    comma: ', ',        // space after comma
    dash: ' – ',        // en-dash with spaces
    ellipsis: '…',      // proper ellipsis
  },

  // ─── Quantity Formatting ───
  quantity: {
    singular: (count: number, word: string) => count === 1 ? word : word,
    plural: (count: number, word: string, pluralForm?: string) =>
      count === 1 ? word : (pluralForm || word),
  },
}

/**
 * Helper: Format Vietnamese date
 * Usage: formatDate(date, 'long')
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Intl.DateTimeFormat('vi-VN', options).format(d)
}

/**
 * Helper: Format number as Vietnamese currency
 * Usage: formatVND(1000000) => '1.000.000 ₫'
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Helper: Format number with Vietnamese locale
 * Usage: formatNumber(1000000) => '1.000.000'
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}
