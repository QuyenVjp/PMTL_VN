// ─────────────────────────────────────────────────────────────
//  STRAPI v5 Types — shared across all API calls
//  Follows Strapi's flat response format (v5 removed data.attributes)
// ─────────────────────────────────────────────────────────────

/** Generic paginated list response from Strapi */
export interface StrapiList<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

/** Generic single item response from Strapi */
export interface StrapiSingle<T> {
  data: T
  meta: Record<string, unknown>
}

/** Strapi media/image format */
export interface StrapiMedia {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  } | null
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  createdAt: string
  updatedAt: string
}

export interface StrapiMediaFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: string | null
  width: number
  height: number
  size: number
  url: string
}

/** SEO component (shared.seo) */
export interface StrapiSEO {
  id: number
  metaTitle: string | null
  metaDescription: string | null
  metaImage: StrapiMedia | null
  keywords: string | null
  canonicalURL: string | null
}

export interface StrapiOEmbedField {
  url: string
  thumbnail: string | null
  oembed: Record<string, unknown> | null
}

/** Shared UI icon entity from Strapi */
export interface UiIcon {
  id: number
  documentId: string
  name: string
  key: string
  lucideName: string
  category: 'general' | 'social' | 'navigation' | 'content' | 'practice'
  notes: string | null
  isActive: boolean
  sortOrder: number
}

export type UiIconValue = UiIcon | string | null

// ─── Category ─────────────────────────────────────────────────

/** Category with hierarchical tree support — can have parent/children */
export interface Category {
  id: number
  documentId: string
  uuid?: string | null
  name: string
  slug: string
  description: string | null       // rich text — ghi chú cho admin
  color: string | null             // hex color for UI accents
  order: number                     // display order among siblings
  is_active: boolean
  parent: Category | null           // self-relation — null means root category
  children: Category[] | null       // child categories (populated client-side)
  blog_posts: BlogPost[] | null     // posts that belong to this category (not populated by default)
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Tree node built client-side from flat Category list */
export interface CategoryTree extends Category {
  children: CategoryTree[]
  depth: number
}

// ─── BlogTag  ─────────────────────────────────────────────────

/** BlogTag entity — replaces JSON array tags for searchability */
export interface BlogTag {
  id: number
  documentId: string
  name: string
  slug: string
  description: string | null
  blog_posts: BlogPost[] | null
  createdAt: string
  updatedAt: string
}

/** BlogPost entity (Strapi v5 flat format) */
export interface BlogPost {
  id: number
  documentId: string
  title: string
  slug: string
  content: string
  excerpt: string | null           // tóm tắt ngắn (auto-extracted hoặc editor nhập tay)
  // ── Media ──────────────────────────────────────────────────────
  thumbnail: StrapiMedia | null
  gallery: StrapiMedia[] | null
  video_url: string | null
  audio_url: string | null
  oembed: StrapiOEmbedField | null
  // ── Taxonomy ────────────────────────────────────────────────────
  categories: Category[] | null
  tags: BlogTag[] | null
  // ── Stats ──────────────────────────────────────────────────────
  views: number
  unique_views: number
  likes: number
  // ── Editorial ──────────────────────────────────────────────────
  featured: boolean
  // ── Source/Origin (bài sưu tầm / dịch) ────────────────────────
  sourceName: string | null        // tên nguồn/kênh
  sourceUrl: string | null         // URL bài gốc
  sourceTitle: string | null       // tiêu đề ngôn ngữ gốc
  // ── Related ────────────────────────────────────────────────────
  related_posts: BlogPost[] | null
  // ── Series ─────────────────────────────────────────────────────
  seriesKey: string | null
  seriesNumber: number | null
  eventDate: string | null
  location: string | null
  // ── Comments ────────────────────────────────────────────────────
  allowComments: boolean           // true = cho phép bình luận (default), false = đã khóa
  commentCount: number             // số bình luận đã duyệt (denorm)
  // ── SEO ────────────────────────────────────────────────────────
  seo: StrapiSEO | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}


export interface BeginnerGuide {
  id: number
  documentId: string
  title: string
  description: string | null
  content: string | null // rich text
  details: string[] | null // chi tiết từng bước
  duration: string | null
  order: number
  step_number: number
  guide_type: 'so-hoc' | 'kinh-bai-tap'
  icon: UiIconValue
  pdf_url: string | null
  video_url: string | null
  images: StrapiMedia[] | null
  attached_files: StrapiMedia[] | null // <== New direct file attachments
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}


// ─── Homepage Dynamic Content ────────────────────────────────

export interface HeroSlide {
  src: string
  title: string
  highlight: string
  sub: string
}

export interface StatItem {
  value: string
  label: string
  detail: string
}

export interface PhapBaoItem {
  id: string
  title: string
  chinese: string
  color: string
  borderColor: string
  description: string
  link: string
  icon: UiIconValue
  iconType?: string | null // legacy fallback
}

export interface ActionCardItem {
  title: string
  description: string
  link: string
  icon: UiIconValue
  iconType?: string | null // legacy fallback
}

export interface VideoItem {
  id: string
  title: string
  subtitle: string
  description: string
  youtubeId: string
  duration: string
  category: string
}

export interface AwardItem {
  year: string
  title: string
  org: string
  description: string
}

export interface GallerySlide {
  src: string
  caption: string
  subcap: string
}

export interface StickyBannerConfig {
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  enabled: boolean
}

// StrapiSEO da duoc dinh nghia o tren (dong 63) — khong lap lai

// ─── Settings ────────────────────────────────────────────────

export interface SocialLinks {
  facebook?: string
  youtube?: string
  zalo?: string
  tiktok?: string
  instagram?: string
  telegram?: string
}

/** Settings single type — bao gồm cả nội dung động trang chủ */
export interface SiteSetting {
  id: number
  documentId: string
  siteTitle: string
  siteDescription: string
  logo: StrapiMedia | null
  socialLinks: SocialLinks | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  footerText: string | null
  // ── Homepage Dynamic Content ──
  heroSlides: HeroSlide[] | null
  stats: StatItem[] | null
  phapBao: PhapBaoItem[] | null
  actionCards: ActionCardItem[] | null
  featuredVideos: VideoItem[] | null
  awards: AwardItem[] | null
  gallerySlides: GallerySlide[] | null
  stickyBanner: StickyBannerConfig | null
  createdAt: string
  updatedAt: string
}

// ─── API Errors ───────────────────────────────────────────────

export interface StrapiError {
  data: null
  error: {
    status: number
    name: string
    message: string
    details?: Record<string, unknown>
  }
}

export type StrapiResponse<T> = T | StrapiError

export function isStrapiError(res: unknown): res is StrapiError {
  return (
    typeof res === 'object' &&
    res !== null &&
    'error' in res &&
    typeof (res as StrapiError).error?.status === 'number'
  )
}

// ─── Blog Comments ────────────────────────────────────────────

export interface BlogComment {
  id: number
  documentId: string
  authorName: string
  authorAvatar: StrapiMedia | null
  userId: string | null
  content: string
  likes: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  /** Populated for top-level comments returned from byPost endpoint */
  replies: BlogComment[]
}

export interface BlogCommentThread {
  data: BlogComment[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// ─── Guestbook ────────────────────────────────────────────────

export interface GuestbookEntry {
  id: number
  documentId: string
  authorName: string
  country: string | null
  avatar: StrapiMedia | null
  message: string
  adminReply: string | null
  approvalStatus: 'pending' | 'approved'
  isOfficialReply: boolean         // true = Admin reply — hiển thị nổi bật viền vàng
  badge?: string | null            // 'Ban Quản Trị' / 'Đông Phương Đài' ...
  entryType: 'message' | 'question'
  questionCategory?: string | null
  isAnswered: boolean
  year?: number | null             // Dùng lọc archive
  month?: number | null
  createdAt: string
  updatedAt: string
}

export interface GuestbookList {
  data: GuestbookEntry[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
    archive?: { year: number; month: number }
  }
}

// ─── Archive ──────────────────────────────────────────────────

export interface ArchiveMonth {
  month: number
  count: number
}

export interface ArchiveYear {
  year: number
  total: number
  months: ArchiveMonth[]
}

// ─── Hub Pages ────────────────────────────────────────────────

export interface HubLink {
  id: number
  title: string
  url: string
  description: string | null
  thumbnail: StrapiMedia | null
  kind: 'internal' | 'external'
}

export interface HubSection {
  id: number
  heading: string
  description: string | null
  links: HubLink[]
}

export type HubBlock =
  | { __component: 'blocks.post-list-auto'; id: number; heading: string; description?: string; category?: Category; count: number }
  | { __component: 'blocks.post-list-manual'; id: number; heading: string; description?: string; posts: BlogPost[] }
  | { __component: 'blocks.download-grid'; id: number; heading: string; description?: string; downloads: DownloadItem[] }
  | { __component: 'blocks.rich-text'; id: number; content: string }

export interface HubPage {
  id: number
  documentId: string
  title: string
  slug: string
  description: string | null
  sections: HubSection[]
  coverImage?: StrapiMedia | null
  curated_posts?: BlogPost[]       // Legacy — Bài Editor chọn tay
  downloads?: DownloadItem[]       // Legacy — Khối tài liệu tải gắn vào hub này
  blocks?: HubBlock[]              // New Dynamic Blocks
  visualTheme?: 'teaching' | 'practice' | 'story' | 'reference' | null  // Hub personality
  sortOrder: number
  showInMenu: boolean
  menuIcon?: UiIconValue
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Download Item ─────────────────────────────────────────────────────

export interface DownloadItem {
  id: number
  documentId: string
  title: string
  description?: string | null
  url: string
  fileType: 'pdf' | 'mp3' | 'mp4' | 'zip' | 'doc' | 'epub' | 'html' | 'unknown'
  category: string
  groupYear?: number | null
  groupLabel?: string | null
  notes?: string | null
  isUpdating: boolean
  isNew: boolean
  sortOrder: number
  fileSizeMB?: number | null
  thumbnail?: StrapiMedia | null
  publishedAt: string | null
  createdAt: string
}

// ─── Sidebar Config ───────────────────────────────────────────

export interface QuickLink {
  id: number
  title: string
  url: string
}

export interface CmsSocialLink {
  id: number
  label: string
  url: string
  icon: UiIconValue
  iconName?: string | null // legacy fallback
}

export interface SidebarConfig {
  showSearch: boolean
  showCategoryTree: boolean
  showArchive: boolean
  showLatestComments: boolean
  showDownloadLinks: boolean
  downloadLinks: QuickLink[]
  socialLinks: CmsSocialLink[]
  qrImages: StrapiMedia[] | null
}

// ─── Series ───────────────────────────────────────────────────

export interface SeriesPost {
  documentId: string
  title: string
  slug: string
  seriesKey: string | null
  seriesNumber: number | null
  eventDate: string | null
  location: string | null
  publishedAt: string | null
  thumbnail: StrapiMedia | null
}

export interface SeriesData {
  data: SeriesPost[]
  meta: {
    seriesKey: string
    currentSlug: string
    currentIndex: number
    prev: SeriesPost | null
    next: SeriesPost | null
  }
}

// ─── Event ────────────────────────────────────────────────────

export interface StrapiEvent {
  id: number
  documentId: string
  title: string
  slug: string
  description: string
  content: string | null
  date: string | null
  timeString: string | null
  location: string
  type: 'dharma-talk' | 'webinar' | 'retreat' | 'liberation' | 'festival'
  eventStatus: 'upcoming' | 'live' | 'past'
  speaker: string
  language: string
  link: string | null
  youtubeId: string | null
  oembed: StrapiOEmbedField | null
  coverImage: StrapiMedia | null
  gallery: StrapiMedia[] | null
  files: StrapiMedia[] | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Gallery ──────────────────────────────────────────────────

export interface GalleryItem {
  id: number
  documentId: string
  title: string
  slug: string
  description: string | null
  quote: string | null
  category: string
  album: string | null
  location: string | null
  device: string | null
  photographer: string | null
  shotDate: string | null
  image: StrapiMedia | null
  featured: boolean
  sortOrder: number
  keywords: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Sutra Reader ────────────────────────────────────────────

export interface Sutra {
  id: number
  documentId: string
  title: string
  slug: string
  description: string | null
  shortExcerpt: string | null
  coverImage: StrapiMedia | null
  translatorHan: string | null
  translatorViet: string | null
  reviewer: string | null
  tags: BlogTag[] | null
  volumes: SutraVolume[] | null
  glossaries: SutraGlossary[] | null
  isFeatured: boolean
  sortOrder: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SutraVolume {
  id: number
  documentId: string
  title: string
  slug: string
  volumeNumber: number
  bookStart: number | null
  bookEnd: number | null
  description: string | null
  sutra: Sutra | null
  chapters: SutraChapter[] | null
  sortOrder: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SutraChapter {
  id: number
  documentId: string
  title: string
  slug: string
  chapterNumber: number
  openingText: string | null
  content: string
  endingText: string | null
  estimatedReadMinutes: number
  sortOrder: number
  sutra: Sutra | null
  volume: SutraVolume | null
  glossaries: SutraGlossary[] | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SutraGlossary {
  id: number
  documentId: string
  markerKey: string
  term: string
  meaning: string
  sortOrder: number
  sutra: Sutra | null
  volume: SutraVolume | null
  chapter: SutraChapter | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SutraReadingProgress {
  id: number
  documentId: string
  anchorKey: string | null
  charOffset: number
  scrollPercent: number
  lastReadAt: string | null
  updatedAt: string
  sutra: Pick<Sutra, 'documentId' | 'title' | 'slug'> | null
  volume: Pick<SutraVolume, 'documentId' | 'title' | 'slug' | 'volumeNumber'> | null
  chapter: Pick<SutraChapter, 'documentId' | 'title' | 'slug' | 'chapterNumber'> | null
}

export interface SutraBookmark {
  id: number
  documentId: string
  anchorKey: string | null
  charOffset: number
  excerpt: string | null
  note: string | null
  createdAt: string
  sutra: Pick<Sutra, 'documentId' | 'title' | 'slug'> | null
  volume: Pick<SutraVolume, 'documentId' | 'title' | 'slug' | 'volumeNumber'> | null
  chapter: Pick<SutraChapter, 'documentId' | 'title' | 'slug' | 'chapterNumber'> | null
}

export interface BlogReaderState {
  id: number
  documentId: string
  isFavorite: boolean
  isPinned: boolean
  firstReadAt: string | null
  lastReadAt: string | null
  favoritedAt: string | null
  pinnedAt: string | null
  readCount: number
  updatedAt: string
  post: Pick<
    BlogPost,
    'documentId' | 'title' | 'slug' | 'excerpt' | 'publishedAt' | 'createdAt' | 'views' | 'featured'
  > & {
    thumbnail: BlogPost['thumbnail']
    categories: BlogPost['categories']
    tags: BlogPost['tags']
  } | null
}

export interface BlogReaderPostList {
  data: BlogPost[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
    counts: {
      totalRead: number
      totalFavorite: number
      totalPinned: number
      recentReadToday: number
      recentReadWeek: number
      recentFavoriteToday: number
      recentFavoriteWeek: number
    }
    states: Record<
      string,
      Pick<BlogReaderState, 'documentId' | 'isFavorite' | 'isPinned' | 'firstReadAt' | 'lastReadAt' | 'favoritedAt' | 'pinnedAt' | 'readCount'> | null
    >
  }
}

export interface BlogReaderSummary {
  totalRead: number
  totalFavorite: number
  totalPinned: number
  recentReadToday: number
  recentReadWeek: number
  recentFavoriteToday: number
  recentFavoriteWeek: number
}
