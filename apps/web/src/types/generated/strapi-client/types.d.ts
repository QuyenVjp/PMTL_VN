// Auto-generated TypeScript types from Strapi schema
// Do not edit manually
// Base types

export interface MediaFile {
  id: number
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: unknown
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

// Strapi Blocks Editor API Types
// Based on: https://docs.strapi.io/dev-docs/api/document/blocks

/**
 * Main type for Strapi Blocks content
 */
export type BlocksContent = Block[]

/**
 * All possible block types
 */
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | CodeBlock
  | ListBlock
  | ImageBlock

/**
 * Paragraph block - default text block
 */
export interface ParagraphBlock {
  type: 'paragraph'
  children: InlineNode[]
}

/**
 * Heading block - h1 to h6
 */
export interface HeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

/**
 * Quote block - blockquote
 */
export interface QuoteBlock {
  type: 'quote'
  children: InlineNode[]
}

/**
 * Code block - preformatted code with optional language
 */
export interface CodeBlock {
  type: 'code'
  language?: string
  children: InlineNode[]
}

/**
 * List block - ordered or unordered
 */
export interface ListBlock {
  type: 'list'
  format: 'ordered' | 'unordered'
  children: ListItemBlock[]
}

/**
 * List item - individual item in a list
 */
export interface ListItemBlock {
  type: 'list-item'
  children: InlineNode[]
}

/**
 * Image block - embedded image with optional caption
 */
export interface ImageBlock {
  type: 'image'
  image: {
    name: string
    alternativeText?: string | null
    url: string
    caption?: string | null
    width?: number
    height?: number
    formats?: unknown
    hash: string
    ext: string
    mime: string
    size: number
    previewUrl?: string | null
    provider: string
    createdAt: string
    updatedAt: string
  }
  children: InlineNode[]
}

/**
 * Inline nodes - text formatting and inline elements
 */
export type InlineNode = TextNode | LinkInline

/**
 * Plain text node with optional formatting
 */
export interface TextNode {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

/**
 * Inline link
 */
export interface LinkInline {
  type: 'link'
  url: string
  children: TextNode[]
}
// Helper types for field and sort options in populate
type _EntityField<T> = Exclude<keyof T & string, '__typename'>
type _SortValue<T> = _EntityField<T> | `${_EntityField<T>}:${"asc" | "desc"}`

// Apply fields narrowing from populate entry (e.g. populate: { item: { fields: ["title"] } })
type _ApplyFields<TFull, TBase, TEntry> = TEntry extends true ? TFull : TEntry extends { fields: readonly (infer F extends string)[] } ? Pick<TBase, Extract<F | 'id' | 'documentId', keyof TBase>> & Omit<TFull, keyof TBase> : TFull

export interface BlocksDownloadGrid {
    id: number;
    __component: 'blocks.download-grid';
    heading: string;
    description: string | null;
    downloads: { id: number; documentId: string }[];
}

export interface BlocksPostListAuto {
    id: number;
    __component: 'blocks.post-list-auto';
    heading: string;
    description: string | null;
    count: number | null;
    category: { id: number; documentId: string } | null;
}

export interface BlocksPostListManual {
    id: number;
    __component: 'blocks.post-list-manual';
    heading: string;
    description: string | null;
    posts: { id: number; documentId: string }[];
}

export interface BlocksRichText {
    id: number;
    __component: 'blocks.rich-text';
    content: string | null;
}

export interface ChantingPlanItem {
    id: number;
    __component: 'chanting.plan-item';
    order: number;
    targetDefault: number | null;
    targetMin: number | null;
    targetMax: number | null;
    isOptional: boolean | null;
    item: { id: number; documentId: string } | null;
}

export interface HomepageActionCardItem {
    id: number;
    __component: 'homepage.action-card-item';
    title: string | null;
    description: string | null;
    link: string | null;
    icon: { id: number; documentId: string } | null;
}

export interface HomepageAwardItem {
    id: number;
    __component: 'homepage.award-item';
    year: string | null;
    title: string | null;
    org: string | null;
    description: string | null;
}

export interface HomepageFeaturedVideo {
    id: number;
    __component: 'homepage.featured-video';
    videoId: string | null;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    youtubeId: string | null;
    duration: string | null;
    category: string | null;
}

export interface HomepageGallerySlide {
    id: number;
    __component: 'homepage.gallery-slide';
    caption: string | null;
    subcap: string | null;
    image: MediaFile | null;
}

export interface HomepageHeroSlide {
    id: number;
    __component: 'homepage.hero-slide';
    title: string | null;
    highlight: string | null;
    sub: string | null;
    image: MediaFile | null;
}

export interface HomepagePhapBaoItem {
    id: number;
    __component: 'homepage.phap-bao-item';
    item_id: string | null;
    title: string | null;
    chinese: string | null;
    color: string | null;
    borderColor: string | null;
    description: string | null;
    link: string | null;
    icon: { id: number; documentId: string } | null;
}

export interface HomepageSearchCategory {
    id: number;
    __component: 'homepage.search-category';
    category_id: number | null;
    title: string | null;
    link: string | null;
    icon: { id: number; documentId: string } | null;
}

export interface HomepageStatItem {
    id: number;
    __component: 'homepage.stat-item';
    value: string | null;
    label: string | null;
    detail: string | null;
}

export interface HomepageStickyBanner {
    id: number;
    __component: 'homepage.sticky-banner';
    enabled: boolean | null;
    title: string | null;
    subtitle: string | null;
    buttonText: string | null;
    buttonLink: string | null;
}

export interface HubHubLink {
    id: number;
    __component: 'hub.hub-link';
    title: string;
    url: string;
    description: string | null;
    kind: 'internal' | 'external' | null;
    thumbnail: MediaFile | null;
}

export interface HubHubSection {
    id: number;
    __component: 'hub.hub-section';
    heading: string;
    description: string | null;
    links: HubHubLink[] | null;
}

export interface SharedQuickLink {
    id: number;
    __component: 'shared.quick-link';
    title: string;
    url: string;
}

export interface SharedSeo {
    id: number;
    __component: 'shared.seo';
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    canonicalURL: string | null;
    metaImage: MediaFile | null;
}

export interface SharedSocialLink {
    id: number;
    __component: 'shared.social-link';
    label: string;
    url: string;
    icon: { id: number; documentId: string } | null;
}

/** Input type for creating/updating BlocksDownloadGrid */
export interface BlocksDownloadGridInput {
    id?: number;
    __component: 'blocks.download-grid';
    heading?: string | null;
    description?: string | null;
    downloads?: number[] | null;
}

/** Input type for creating/updating BlocksPostListAuto */
export interface BlocksPostListAutoInput {
    id?: number;
    __component: 'blocks.post-list-auto';
    heading?: string | null;
    description?: string | null;
    count?: number | null;
    category?: number | null;
}

/** Input type for creating/updating BlocksPostListManual */
export interface BlocksPostListManualInput {
    id?: number;
    __component: 'blocks.post-list-manual';
    heading?: string | null;
    description?: string | null;
    posts?: number[] | null;
}

/** Input type for creating/updating BlocksRichText */
export interface BlocksRichTextInput {
    id?: number;
    __component: 'blocks.rich-text';
    content?: string | null;
}

/** Input type for creating/updating ChantingPlanItem */
export interface ChantingPlanItemInput {
    id?: number;
    __component: 'chanting.plan-item';
    order?: number | null;
    targetDefault?: number | null;
    targetMin?: number | null;
    targetMax?: number | null;
    isOptional?: boolean | null;
    item?: number | null;
}

/** Input type for creating/updating HomepageActionCardItem */
export interface HomepageActionCardItemInput {
    id?: number;
    __component: 'homepage.action-card-item';
    title?: string | null;
    description?: string | null;
    link?: string | null;
    icon?: number | null;
}

/** Input type for creating/updating HomepageAwardItem */
export interface HomepageAwardItemInput {
    id?: number;
    __component: 'homepage.award-item';
    year?: string | null;
    title?: string | null;
    org?: string | null;
    description?: string | null;
}

/** Input type for creating/updating HomepageFeaturedVideo */
export interface HomepageFeaturedVideoInput {
    id?: number;
    __component: 'homepage.featured-video';
    videoId?: string | null;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    youtubeId?: string | null;
    duration?: string | null;
    category?: string | null;
}

/** Input type for creating/updating HomepageGallerySlide */
export interface HomepageGallerySlideInput {
    id?: number;
    __component: 'homepage.gallery-slide';
    caption?: string | null;
    subcap?: string | null;
    image?: number | null;
}

/** Input type for creating/updating HomepageHeroSlide */
export interface HomepageHeroSlideInput {
    id?: number;
    __component: 'homepage.hero-slide';
    title?: string | null;
    highlight?: string | null;
    sub?: string | null;
    image?: number | null;
}

/** Input type for creating/updating HomepagePhapBaoItem */
export interface HomepagePhapBaoItemInput {
    id?: number;
    __component: 'homepage.phap-bao-item';
    item_id?: string | null;
    title?: string | null;
    chinese?: string | null;
    color?: string | null;
    borderColor?: string | null;
    description?: string | null;
    link?: string | null;
    icon?: number | null;
}

/** Input type for creating/updating HomepageSearchCategory */
export interface HomepageSearchCategoryInput {
    id?: number;
    __component: 'homepage.search-category';
    category_id?: number | null;
    title?: string | null;
    link?: string | null;
    icon?: number | null;
}

/** Input type for creating/updating HomepageStatItem */
export interface HomepageStatItemInput {
    id?: number;
    __component: 'homepage.stat-item';
    value?: string | null;
    label?: string | null;
    detail?: string | null;
}

/** Input type for creating/updating HomepageStickyBanner */
export interface HomepageStickyBannerInput {
    id?: number;
    __component: 'homepage.sticky-banner';
    enabled?: boolean | null;
    title?: string | null;
    subtitle?: string | null;
    buttonText?: string | null;
    buttonLink?: string | null;
}

/** Input type for creating/updating HubHubLink */
export interface HubHubLinkInput {
    id?: number;
    __component: 'hub.hub-link';
    title?: string | null;
    url?: string | null;
    description?: string | null;
    kind?: 'internal' | 'external' | null;
    thumbnail?: number | null;
}

/** Input type for creating/updating HubHubSection */
export interface HubHubSectionInput {
    id?: number;
    __component: 'hub.hub-section';
    heading?: string | null;
    description?: string | null;
    links?: HubHubLinkInput[] | null;
}

/** Input type for creating/updating SharedQuickLink */
export interface SharedQuickLinkInput {
    id?: number;
    __component: 'shared.quick-link';
    title?: string | null;
    url?: string | null;
}

/** Input type for creating/updating SharedSeo */
export interface SharedSeoInput {
    id?: number;
    __component: 'shared.seo';
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string | null;
    canonicalURL?: string | null;
    metaImage?: number | null;
}

/** Input type for creating/updating SharedSocialLink */
export interface SharedSocialLinkInput {
    id?: number;
    __component: 'shared.social-link';
    label?: string | null;
    url?: string | null;
    icon?: number | null;
}

export interface AuditLog {
    readonly __typename?: 'AuditLog';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    targetUid: string;
    targetDocumentId: string | null;
    targetId: number | null;
    targetLabel: string | null;
    actorType: 'admin' | 'user' | 'guest' | 'system';
    actorId: number | null;
    actorDisplayName: string | null;
    actorEmail: string | null;
    requestMethod: string | null;
    requestPath: string | null;
    requestId: string | null;
    ipHash: string | null;
    userAgent: string | null;
    changedFields: unknown | null;
    metadata: unknown | null;
}

export interface BeginnerGuide {
    readonly __typename?: 'BeginnerGuide';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string | null;
    content: string | null;
    details: unknown | null;
    duration: string | null;
    order: number | null;
    step_number: number | null;
    guide_type: 'so-hoc' | 'kinh-bai-tap';
    pdf_url: string | null;
    video_url: string | null;
}

export interface BlogComment {
    readonly __typename?: 'BlogComment';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    authorName: string;
    userId: string | null;
    content: string;
    likes: number | null;
    isOfficialReply: boolean | null;
    badge: string | null;
    ipHash: string | null;
    moderationStatus: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount: number | null;
    lastReportReason: string | null;
    isHidden: boolean | null;
    spamScore: number | null;
}

export interface BlogPost {
    readonly __typename?: 'BlogPost';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    video_url: string | null;
    audio_url: string | null;
    oembed: string | null;
    featured: boolean | null;
    views: number | null;
    unique_views: number | null;
    likes: number | null;
    seriesKey: string | null;
    seriesNumber: number | null;
    sourceName: string | null;
    sourceUrl: string | null;
    sourceTitle: string | null;
    allowComments: boolean | null;
    commentCount: number | null;
    eventDate: string | null;
    location: string | null;
}

export interface BlogReaderState {
    readonly __typename?: 'BlogReaderState';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean | null;
    firstReadAt: string | null;
    lastReadAt: string | null;
    favoritedAt: string | null;
    isPinned: boolean | null;
    pinnedAt: string | null;
    readCount: number | null;
}

export interface BlogTag {
    readonly __typename?: 'BlogTag';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    slug: string;
    description: string | null;
}

export interface Category {
    readonly __typename?: 'Category';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    order: number | null;
    is_active: boolean | null;
}

export interface ChantItem {
    readonly __typename?: 'ChantItem';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    kind: 'step' | 'sutra' | 'mantra';
    content: string | null;
    openingPrayer: string | null;
    timeRules: unknown | null;
    recommendedPresets: unknown | null;
}

export interface ChantPlan {
    readonly __typename?: 'ChantPlan';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    planType: 'daily' | 'special';
}

export interface CommunityComment {
    readonly __typename?: 'CommunityComment';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    author_name: string;
    author_avatar: string | null;
    likes: number | null;
    moderationStatus: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount: number | null;
    lastReportReason: string | null;
    isHidden: boolean | null;
    spamScore: number | null;
}

export interface CommunityPost {
    readonly __typename?: 'CommunityPost';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    content: string;
    type: 'story' | 'feedback' | 'video';
    category: 'Sức Khoẻ' | 'Gia Đình' | 'Sự Nghiệp' | 'Hôn Nhân' | 'Tâm Linh' | 'Thi Cử' | 'Kinh Doanh' | 'Mất Ngủ' | 'Mối Quan Hệ' | 'Khác' | null;
    video_url: string | null;
    author_name: string;
    author_avatar: string | null;
    author_country: string | null;
    likes: number | null;
    views: number | null;
    tags: unknown | null;
    rating: number | null;
    pinned: boolean | null;
    moderationStatus: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount: number | null;
    lastReportReason: string | null;
    isHidden: boolean | null;
    spamScore: number | null;
}

export interface ContentHistory {
    readonly __typename?: 'ContentHistory';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    targetUid: string;
    targetDocumentId: string;
    targetId: number | null;
    targetLabel: string | null;
    action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    versionNumber: number;
    actorType: 'admin' | 'user' | 'guest' | 'system';
    actorId: number | null;
    actorDisplayName: string | null;
    actorEmail: string | null;
    changedFields: unknown | null;
    snapshot: unknown;
    metadata: unknown | null;
}

export interface DownloadItem {
    readonly __typename?: 'DownloadItem';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string | null;
    url: string;
    fileType: 'pdf' | 'mp3' | 'mp4' | 'zip' | 'doc' | 'epub' | 'html' | 'unknown';
    category: 'Kinh Điển' | 'Khai Thị Audio' | 'Khai Thị Video' | 'Sách' | 'Pháp Hội' | 'Hướng Dẫn' | 'Khác';
    groupYear: number | null;
    groupLabel: string | null;
    notes: string | null;
    isUpdating: boolean | null;
    isNew: boolean | null;
    sortOrder: number | null;
    fileSizeMB: number | null;
}

export interface Event {
    readonly __typename?: 'Event';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    description: string;
    content: string | null;
    date: string | null;
    timeString: string | null;
    location: string;
    type: 'dharma-talk' | 'webinar' | 'retreat' | 'liberation' | 'festival';
    eventStatus: 'upcoming' | 'live' | 'past';
    speaker: string | null;
    language: string | null;
    link: string | null;
    youtubeId: string | null;
    oembed: string | null;
}

export interface GalleryItem {
    readonly __typename?: 'GalleryItem';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    description: string | null;
    quote: string | null;
    category: 'Hoa Sen' | 'Kiến Trúc' | 'Nghi Lễ' | 'Pháp Hội' | 'Thiền Định' | 'Thiên Nhiên' | 'Kinh Sách' | 'Phật Tượng' | 'Khác';
    album: string | null;
    location: string | null;
    device: string | null;
    photographer: string | null;
    shotDate: string | null;
    featured: boolean | null;
    sortOrder: number | null;
    keywords: string | null;
}

export interface GuestbookEntry {
    readonly __typename?: 'GuestbookEntry';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    authorName: string;
    country: string | null;
    message: string;
    adminReply: string | null;
    approvalStatus: 'pending' | 'approved';
    isOfficialReply: boolean | null;
    badge: string | null;
    year: number | null;
    month: number | null;
    entryType: 'message' | 'question' | null;
    questionCategory: string | null;
    isAnswered: boolean | null;
}

export interface HeThongTest {
    readonly __typename?: 'HeThongTest';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
}

export interface HubPage {
    readonly __typename?: 'HubPage';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    description: string | null;
    sortOrder: number | null;
    showInMenu: boolean | null;
    visualTheme: 'teaching' | 'practice' | 'story' | 'reference' | null;
}

export interface LunarEvent {
    readonly __typename?: 'LunarEvent';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    isRecurringLunar: boolean | null;
    lunarMonth: number | null;
    lunarDay: number | null;
    solarDate: string | null;
    eventType: 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal' | null;
}

export interface LunarEventChantOverride {
    readonly __typename?: 'LunarEventChantOverride';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    mode: 'enable' | 'disable' | 'override_target' | 'cap_max';
    target: number | null;
    max: number | null;
    priority: number | null;
    note: string | null;
}

export interface PracticeLog {
    readonly __typename?: 'PracticeLog';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    date: string;
    itemsProgress: unknown | null;
    startedAt: string | null;
    completedAt: string | null;
    isCompleted: boolean | null;
}

export interface PushJob {
    readonly __typename?: 'PushJob';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    kind: 'daily_chant' | 'broadcast' | 'content_update' | 'event_reminder' | 'community';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    title: string;
    body: string;
    url: string | null;
    tag: string | null;
    payload: unknown | null;
    cursor: number | null;
    chunkSize: number | null;
    targetedCount: number | null;
    processedCount: number | null;
    successCount: number | null;
    failedCount: number | null;
    invalidCount: number | null;
    lastError: string | null;
    startedAt: string | null;
    finishedAt: string | null;
}

export interface PushSubscription {
    readonly __typename?: 'PushSubscription';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    reminderHour: number | null;
    reminderMinute: number | null;
    timezone: string | null;
    isActive: boolean | null;
    lastSentAt: string | null;
    lastError: string | null;
    failedCount: number | null;
    notificationTypes: unknown | null;
    quietHoursStart: number | null;
    quietHoursEnd: number | null;
}

export interface RequestGuard {
    readonly __typename?: 'RequestGuard';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    guardKey: string;
    scope: string;
    hits: number | null;
    expiresAt: string;
    lastSeenAt: string;
    notes: unknown | null;
}

export interface Setting {
    readonly __typename?: 'Setting';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    siteTitle: string;
    siteDescription: string;
    socialLinks: unknown | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
}

export interface SidebarConfig {
    readonly __typename?: 'SidebarConfig';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    showSearch: boolean | null;
    showCategoryTree: boolean | null;
    showArchive: boolean | null;
    showLatestComments: boolean | null;
    showDownloadLinks: boolean | null;
}

export interface Sutra {
    readonly __typename?: 'Sutra';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    description: string | null;
    shortExcerpt: string | null;
    translatorHan: string | null;
    translatorViet: string | null;
    reviewer: string | null;
    isFeatured: boolean | null;
    sortOrder: number | null;
}

export interface SutraBookmark {
    readonly __typename?: 'SutraBookmark';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    anchorKey: string | null;
    charOffset: number | null;
    excerpt: string | null;
    note: string | null;
}

export interface SutraChapter {
    readonly __typename?: 'SutraChapter';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    chapterNumber: number;
    openingText: string | null;
    content: string;
    endingText: string | null;
    estimatedReadMinutes: number | null;
    sortOrder: number | null;
}

export interface SutraGlossary {
    readonly __typename?: 'SutraGlossary';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    markerKey: string;
    term: string;
    meaning: string;
    sortOrder: number | null;
}

export interface SutraReadingProgress {
    readonly __typename?: 'SutraReadingProgress';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    anchorKey: string | null;
    charOffset: number | null;
    scrollPercent: number | null;
    lastReadAt: string | null;
}

export interface SutraVolume {
    readonly __typename?: 'SutraVolume';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    slug: string;
    volumeNumber: number;
    bookStart: number | null;
    bookEnd: number | null;
    description: string | null;
    sortOrder: number | null;
}

export interface UiIcon {
    readonly __typename?: 'UiIcon';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    key: string;
    lucideName: string;
    category: 'general' | 'social' | 'navigation' | 'content' | 'practice' | null;
    notes: string | null;
    isActive: boolean | null;
    sortOrder: number | null;
}

export interface User {
    readonly __typename?: 'User';
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    username: string;
    email: string;
    provider: string | null;
    password: string | null;
    resetPasswordToken: string | null;
    confirmationToken: string | null;
    confirmed: boolean | null;
    blocked: boolean | null;
}

/** Input type for creating/updating AuditLog */
export interface AuditLogInput {
    action?: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | null;
    targetUid?: string | null;
    targetDocumentId?: string | null;
    targetId?: number | null;
    targetLabel?: string | null;
    actorType?: 'admin' | 'user' | 'guest' | 'system' | null;
    actorId?: number | null;
    actorDisplayName?: string | null;
    actorEmail?: string | null;
    requestMethod?: string | null;
    requestPath?: string | null;
    requestId?: string | null;
    ipHash?: string | null;
    userAgent?: string | null;
    changedFields?: unknown | null;
    metadata?: unknown | null;
}

/** Input type for creating/updating BeginnerGuide */
export interface BeginnerGuideInput {
    title?: string | null;
    description?: string | null;
    content?: string | null;
    details?: unknown | null;
    duration?: string | null;
    order?: number | null;
    step_number?: number | null;
    guide_type?: 'so-hoc' | 'kinh-bai-tap' | null;
    pdf_url?: string | null;
    video_url?: string | null;
    images?: number[] | null;
    attached_files?: number[] | null;
    icon?: number | null;
}

/** Input type for creating/updating BlogComment */
export interface BlogCommentInput {
    authorName?: string | null;
    userId?: string | null;
    content?: string | null;
    likes?: number | null;
    isOfficialReply?: boolean | null;
    badge?: string | null;
    ipHash?: string | null;
    moderationStatus?: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount?: number | null;
    lastReportReason?: string | null;
    isHidden?: boolean | null;
    spamScore?: number | null;
    authorAvatar?: number | null;
    post?: number | null;
    parent?: number | null;
    replies?: number[] | null;
    user?: number | null;
}

/** Input type for creating/updating BlogPost */
export interface BlogPostInput {
    title?: string | null;
    slug?: string | null;
    content?: string | null;
    excerpt?: string | null;
    video_url?: string | null;
    audio_url?: string | null;
    oembed?: string | null;
    featured?: boolean | null;
    views?: number | null;
    unique_views?: number | null;
    likes?: number | null;
    seriesKey?: string | null;
    seriesNumber?: number | null;
    sourceName?: string | null;
    sourceUrl?: string | null;
    sourceTitle?: string | null;
    allowComments?: boolean | null;
    commentCount?: number | null;
    eventDate?: string | null;
    location?: string | null;
    thumbnail?: number | null;
    gallery?: number[] | null;
    categories?: number[] | null;
    tags?: number[] | null;
    related_posts?: number[] | null;
    lunarEvents?: number[] | null;
    seo?: SharedSeoInput | null;
}

/** Input type for creating/updating BlogReaderState */
export interface BlogReaderStateInput {
    isFavorite?: boolean | null;
    firstReadAt?: string | null;
    lastReadAt?: string | null;
    favoritedAt?: string | null;
    isPinned?: boolean | null;
    pinnedAt?: string | null;
    readCount?: number | null;
    user?: number | null;
    post?: number | null;
}

/** Input type for creating/updating BlogTag */
export interface BlogTagInput {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    blog_posts?: number[] | null;
}

/** Input type for creating/updating Category */
export interface CategoryInput {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    color?: string | null;
    order?: number | null;
    is_active?: boolean | null;
    parent?: number | null;
    children?: number[] | null;
    blog_posts?: number[] | null;
}

/** Input type for creating/updating ChantItem */
export interface ChantItemInput {
    title?: string | null;
    slug?: string | null;
    kind?: 'step' | 'sutra' | 'mantra' | null;
    content?: string | null;
    openingPrayer?: string | null;
    timeRules?: unknown | null;
    recommendedPresets?: unknown | null;
    audio?: number | null;
}

/** Input type for creating/updating ChantPlan */
export interface ChantPlanInput {
    title?: string | null;
    slug?: string | null;
    planType?: 'daily' | 'special' | null;
    planItems?: ChantingPlanItemInput[] | null;
}

/** Input type for creating/updating CommunityComment */
export interface CommunityCommentInput {
    content?: string | null;
    author_name?: string | null;
    author_avatar?: string | null;
    likes?: number | null;
    moderationStatus?: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount?: number | null;
    lastReportReason?: string | null;
    isHidden?: boolean | null;
    spamScore?: number | null;
    user?: number | null;
    post?: number | null;
    parent?: number | null;
    replies?: number[] | null;
}

/** Input type for creating/updating CommunityPost */
export interface CommunityPostInput {
    title?: string | null;
    slug?: string | null;
    content?: string | null;
    type?: 'story' | 'feedback' | 'video' | null;
    category?: 'Sức Khoẻ' | 'Gia Đình' | 'Sự Nghiệp' | 'Hôn Nhân' | 'Tâm Linh' | 'Thi Cử' | 'Kinh Doanh' | 'Mất Ngủ' | 'Mối Quan Hệ' | 'Khác' | null;
    video_url?: string | null;
    author_name?: string | null;
    author_avatar?: string | null;
    author_country?: string | null;
    likes?: number | null;
    views?: number | null;
    tags?: unknown | null;
    rating?: number | null;
    pinned?: boolean | null;
    moderationStatus?: 'visible' | 'flagged' | 'hidden' | 'removed' | null;
    reportCount?: number | null;
    lastReportReason?: string | null;
    isHidden?: boolean | null;
    spamScore?: number | null;
    cover_image?: number | null;
    user?: number | null;
    comments?: number[] | null;
}

/** Input type for creating/updating ContentHistory */
export interface ContentHistoryInput {
    targetUid?: string | null;
    targetDocumentId?: string | null;
    targetId?: number | null;
    targetLabel?: string | null;
    action?: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | null;
    versionNumber?: number | null;
    actorType?: 'admin' | 'user' | 'guest' | 'system' | null;
    actorId?: number | null;
    actorDisplayName?: string | null;
    actorEmail?: string | null;
    changedFields?: unknown | null;
    snapshot?: unknown | null;
    metadata?: unknown | null;
}

/** Input type for creating/updating DownloadItem */
export interface DownloadItemInput {
    title?: string | null;
    description?: string | null;
    url?: string | null;
    fileType?: 'pdf' | 'mp3' | 'mp4' | 'zip' | 'doc' | 'epub' | 'html' | 'unknown' | null;
    category?: 'Kinh Điển' | 'Khai Thị Audio' | 'Khai Thị Video' | 'Sách' | 'Pháp Hội' | 'Hướng Dẫn' | 'Khác' | null;
    groupYear?: number | null;
    groupLabel?: string | null;
    notes?: string | null;
    isUpdating?: boolean | null;
    isNew?: boolean | null;
    sortOrder?: number | null;
    fileSizeMB?: number | null;
    thumbnail?: number | null;
}

/** Input type for creating/updating Event */
export interface EventInput {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    content?: string | null;
    date?: string | null;
    timeString?: string | null;
    location?: string | null;
    type?: 'dharma-talk' | 'webinar' | 'retreat' | 'liberation' | 'festival' | null;
    eventStatus?: 'upcoming' | 'live' | 'past' | null;
    speaker?: string | null;
    language?: string | null;
    link?: string | null;
    youtubeId?: string | null;
    oembed?: string | null;
    coverImage?: number | null;
    gallery?: number[] | null;
    files?: number[] | null;
}

/** Input type for creating/updating GalleryItem */
export interface GalleryItemInput {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    quote?: string | null;
    category?: 'Hoa Sen' | 'Kiến Trúc' | 'Nghi Lễ' | 'Pháp Hội' | 'Thiền Định' | 'Thiên Nhiên' | 'Kinh Sách' | 'Phật Tượng' | 'Khác' | null;
    album?: string | null;
    location?: string | null;
    device?: string | null;
    photographer?: string | null;
    shotDate?: string | null;
    featured?: boolean | null;
    sortOrder?: number | null;
    keywords?: string | null;
    image?: number | null;
}

/** Input type for creating/updating GuestbookEntry */
export interface GuestbookEntryInput {
    authorName?: string | null;
    country?: string | null;
    message?: string | null;
    adminReply?: string | null;
    approvalStatus?: 'pending' | 'approved' | null;
    isOfficialReply?: boolean | null;
    badge?: string | null;
    year?: number | null;
    month?: number | null;
    entryType?: 'message' | 'question' | null;
    questionCategory?: string | null;
    isAnswered?: boolean | null;
    avatar?: number | null;
}

/** Input type for creating/updating HeThongTest */
export interface HeThongTestInput {
}

/** Input type for creating/updating HubPage */
export interface HubPageInput {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    sortOrder?: number | null;
    showInMenu?: boolean | null;
    visualTheme?: 'teaching' | 'practice' | 'story' | 'reference' | null;
    coverImage?: number | null;
    curated_posts?: number[] | null;
    downloads?: number[] | null;
    menuIcon?: number | null;
    sections?: HubHubSectionInput[] | null;
    blocks?: (BlocksPostListAutoInput | BlocksPostListManualInput | BlocksDownloadGridInput | BlocksRichTextInput)[] | null;
}

/** Input type for creating/updating LunarEvent */
export interface LunarEventInput {
    title?: string | null;
    isRecurringLunar?: boolean | null;
    lunarMonth?: number | null;
    lunarDay?: number | null;
    solarDate?: string | null;
    eventType?: 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal' | null;
    relatedBlogs?: number[] | null;
}

/** Input type for creating/updating LunarEventChantOverride */
export interface LunarEventChantOverrideInput {
    mode?: 'enable' | 'disable' | 'override_target' | 'cap_max' | null;
    target?: number | null;
    max?: number | null;
    priority?: number | null;
    note?: string | null;
    lunarEvent?: number | null;
    item?: number | null;
}

/** Input type for creating/updating PracticeLog */
export interface PracticeLogInput {
    date?: string | null;
    itemsProgress?: unknown | null;
    startedAt?: string | null;
    completedAt?: string | null;
    isCompleted?: boolean | null;
    user?: number | null;
    plan?: number | null;
}

/** Input type for creating/updating PushJob */
export interface PushJobInput {
    kind?: 'daily_chant' | 'broadcast' | 'content_update' | 'event_reminder' | 'community' | null;
    status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
    title?: string | null;
    body?: string | null;
    url?: string | null;
    tag?: string | null;
    payload?: unknown | null;
    cursor?: number | null;
    chunkSize?: number | null;
    targetedCount?: number | null;
    processedCount?: number | null;
    successCount?: number | null;
    failedCount?: number | null;
    invalidCount?: number | null;
    lastError?: string | null;
    startedAt?: string | null;
    finishedAt?: string | null;
}

/** Input type for creating/updating PushSubscription */
export interface PushSubscriptionInput {
    endpoint?: string | null;
    p256dh?: string | null;
    auth?: string | null;
    reminderHour?: number | null;
    reminderMinute?: number | null;
    timezone?: string | null;
    isActive?: boolean | null;
    lastSentAt?: string | null;
    lastError?: string | null;
    failedCount?: number | null;
    notificationTypes?: unknown | null;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
    user?: number | null;
}

/** Input type for creating/updating RequestGuard */
export interface RequestGuardInput {
    guardKey?: string | null;
    scope?: string | null;
    hits?: number | null;
    expiresAt?: string | null;
    lastSeenAt?: string | null;
    notes?: unknown | null;
}

/** Input type for creating/updating Setting */
export interface SettingInput {
    siteTitle?: string | null;
    siteDescription?: string | null;
    socialLinks?: unknown | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    logo?: number | null;
    heroSlides?: HomepageHeroSlideInput[] | null;
    stats?: HomepageStatItemInput[] | null;
    phapBao?: HomepagePhapBaoItemInput[] | null;
    actionCards?: HomepageActionCardItemInput[] | null;
    featuredVideos?: HomepageFeaturedVideoInput[] | null;
    awards?: HomepageAwardItemInput[] | null;
    gallerySlides?: HomepageGallerySlideInput[] | null;
    stickyBanner?: HomepageStickyBannerInput | null;
}

/** Input type for creating/updating SidebarConfig */
export interface SidebarConfigInput {
    showSearch?: boolean | null;
    showCategoryTree?: boolean | null;
    showArchive?: boolean | null;
    showLatestComments?: boolean | null;
    showDownloadLinks?: boolean | null;
    qrImages?: number[] | null;
    downloadLinks?: SharedQuickLinkInput[] | null;
    socialLinks?: SharedSocialLinkInput[] | null;
}

/** Input type for creating/updating Sutra */
export interface SutraInput {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    shortExcerpt?: string | null;
    translatorHan?: string | null;
    translatorViet?: string | null;
    reviewer?: string | null;
    isFeatured?: boolean | null;
    sortOrder?: number | null;
    coverImage?: number | null;
    tags?: number[] | null;
    volumes?: number[] | null;
    glossaries?: number[] | null;
}

/** Input type for creating/updating SutraBookmark */
export interface SutraBookmarkInput {
    anchorKey?: string | null;
    charOffset?: number | null;
    excerpt?: string | null;
    note?: string | null;
    user?: number | null;
    sutra?: number | null;
    volume?: number | null;
    chapter?: number | null;
}

/** Input type for creating/updating SutraChapter */
export interface SutraChapterInput {
    title?: string | null;
    slug?: string | null;
    chapterNumber?: number | null;
    openingText?: string | null;
    content?: string | null;
    endingText?: string | null;
    estimatedReadMinutes?: number | null;
    sortOrder?: number | null;
    sutra?: number | null;
    volume?: number | null;
    glossaries?: number[] | null;
}

/** Input type for creating/updating SutraGlossary */
export interface SutraGlossaryInput {
    markerKey?: string | null;
    term?: string | null;
    meaning?: string | null;
    sortOrder?: number | null;
    sutra?: number | null;
    volume?: number | null;
    chapter?: number | null;
}

/** Input type for creating/updating SutraReadingProgress */
export interface SutraReadingProgressInput {
    anchorKey?: string | null;
    charOffset?: number | null;
    scrollPercent?: number | null;
    lastReadAt?: string | null;
    user?: number | null;
    sutra?: number | null;
    volume?: number | null;
    chapter?: number | null;
}

/** Input type for creating/updating SutraVolume */
export interface SutraVolumeInput {
    title?: string | null;
    slug?: string | null;
    volumeNumber?: number | null;
    bookStart?: number | null;
    bookEnd?: number | null;
    description?: string | null;
    sortOrder?: number | null;
    sutra?: number | null;
    chapters?: number[] | null;
}

/** Input type for creating/updating UiIcon */
export interface UiIconInput {
    name?: string | null;
    key?: string | null;
    lucideName?: string | null;
    category?: 'general' | 'social' | 'navigation' | 'content' | 'practice' | null;
    notes?: string | null;
    isActive?: boolean | null;
    sortOrder?: number | null;
}

/** Input type for creating/updating User */
export interface UserInput {
    username?: string | null;
    email?: string | null;
    provider?: string | null;
    password?: string | null;
    resetPasswordToken?: string | null;
    confirmationToken?: string | null;
    confirmed?: boolean | null;
    blocked?: boolean | null;
    role?: number | null;
}
// ============================================
// PopulateParam types for type-safe populate
// ============================================
export type BlocksDownloadGridPopulateParam = {
      downloads?: true | { fields?: _EntityField<DownloadItem>[]; populate?: DownloadItemPopulateParam | (keyof DownloadItemPopulateParam & string)[] | '*'; filters?: DownloadItemFilters; sort?: _SortValue<DownloadItem> | _SortValue<DownloadItem>[]; limit?: number; start?: number }
    };
export type BlocksPostListAutoPopulateParam = {
      category?: true | { fields?: _EntityField<Category>[]; populate?: CategoryPopulateParam | (keyof CategoryPopulateParam & string)[] | '*'; filters?: CategoryFilters; sort?: _SortValue<Category> | _SortValue<Category>[]; limit?: number; start?: number }
    };
export type BlocksPostListManualPopulateParam = {
      posts?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
    };
export type ChantingPlanItemPopulateParam = {
      item?: true | { fields?: _EntityField<ChantItem>[]; populate?: ChantItemPopulateParam | (keyof ChantItemPopulateParam & string)[] | '*'; filters?: ChantItemFilters; sort?: _SortValue<ChantItem> | _SortValue<ChantItem>[]; limit?: number; start?: number }
    };
export type HomepageActionCardItemPopulateParam = {
      icon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
    };
export type HomepageGallerySlidePopulateParam = {
      image?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type HomepageHeroSlidePopulateParam = {
      image?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type HomepagePhapBaoItemPopulateParam = {
      icon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
    };
export type HomepageSearchCategoryPopulateParam = {
      icon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
    };
export type HubHubLinkPopulateParam = {
      thumbnail?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type HubHubSectionPopulateParam = {
      links?: true | { fields?: (keyof HubHubLink & string)[]; populate?: HubHubLinkPopulateParam | (keyof HubHubLinkPopulateParam & string)[] | '*' }
    };
export type SharedSeoPopulateParam = {
      metaImage?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type SharedSocialLinkPopulateParam = {
      icon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
    };
export type BeginnerGuidePopulateParam = {
      icon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
      images?: true | { fields?: (keyof MediaFile & string)[] }
      attached_files?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type BlogCommentPopulateParam = {
      post?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
      parent?: true | { fields?: _EntityField<BlogComment>[]; populate?: BlogCommentPopulateParam | (keyof BlogCommentPopulateParam & string)[] | '*'; filters?: BlogCommentFilters; sort?: _SortValue<BlogComment> | _SortValue<BlogComment>[]; limit?: number; start?: number }
      replies?: true | { fields?: _EntityField<BlogComment>[]; populate?: BlogCommentPopulateParam | (keyof BlogCommentPopulateParam & string)[] | '*'; filters?: BlogCommentFilters; sort?: _SortValue<BlogComment> | _SortValue<BlogComment>[]; limit?: number; start?: number }
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      authorAvatar?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type BlogPostPopulateParam = {
      categories?: true | { fields?: _EntityField<Category>[]; populate?: CategoryPopulateParam | (keyof CategoryPopulateParam & string)[] | '*'; filters?: CategoryFilters; sort?: _SortValue<Category> | _SortValue<Category>[]; limit?: number; start?: number }
      tags?: true | { fields?: _EntityField<BlogTag>[]; populate?: BlogTagPopulateParam | (keyof BlogTagPopulateParam & string)[] | '*'; filters?: BlogTagFilters; sort?: _SortValue<BlogTag> | _SortValue<BlogTag>[]; limit?: number; start?: number }
      related_posts?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
      lunarEvents?: true | { fields?: _EntityField<LunarEvent>[]; populate?: LunarEventPopulateParam | (keyof LunarEventPopulateParam & string)[] | '*'; filters?: LunarEventFilters; sort?: _SortValue<LunarEvent> | _SortValue<LunarEvent>[]; limit?: number; start?: number }
      thumbnail?: true | { fields?: (keyof MediaFile & string)[] }
      gallery?: true | { fields?: (keyof MediaFile & string)[] }
      seo?: true | { fields?: (keyof SharedSeo & string)[]; populate?: SharedSeoPopulateParam | (keyof SharedSeoPopulateParam & string)[] | '*' }
    };
export type BlogReaderStatePopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      post?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
    };
export type BlogTagPopulateParam = {
      blog_posts?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
    };
export type CategoryPopulateParam = {
      parent?: true | { fields?: _EntityField<Category>[]; populate?: CategoryPopulateParam | (keyof CategoryPopulateParam & string)[] | '*'; filters?: CategoryFilters; sort?: _SortValue<Category> | _SortValue<Category>[]; limit?: number; start?: number }
      children?: true | { fields?: _EntityField<Category>[]; populate?: CategoryPopulateParam | (keyof CategoryPopulateParam & string)[] | '*'; filters?: CategoryFilters; sort?: _SortValue<Category> | _SortValue<Category>[]; limit?: number; start?: number }
      blog_posts?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
    };
export type ChantItemPopulateParam = {
      audio?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type ChantPlanPopulateParam = {
      planItems?: true | { fields?: (keyof ChantingPlanItem & string)[]; populate?: ChantingPlanItemPopulateParam | (keyof ChantingPlanItemPopulateParam & string)[] | '*' }
    };
export type CommunityCommentPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      post?: true | { fields?: _EntityField<CommunityPost>[]; populate?: CommunityPostPopulateParam | (keyof CommunityPostPopulateParam & string)[] | '*'; filters?: CommunityPostFilters; sort?: _SortValue<CommunityPost> | _SortValue<CommunityPost>[]; limit?: number; start?: number }
      parent?: true | { fields?: _EntityField<CommunityComment>[]; populate?: CommunityCommentPopulateParam | (keyof CommunityCommentPopulateParam & string)[] | '*'; filters?: CommunityCommentFilters; sort?: _SortValue<CommunityComment> | _SortValue<CommunityComment>[]; limit?: number; start?: number }
      replies?: true | { fields?: _EntityField<CommunityComment>[]; populate?: CommunityCommentPopulateParam | (keyof CommunityCommentPopulateParam & string)[] | '*'; filters?: CommunityCommentFilters; sort?: _SortValue<CommunityComment> | _SortValue<CommunityComment>[]; limit?: number; start?: number }
    };
export type CommunityPostPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      comments?: true | { fields?: _EntityField<CommunityComment>[]; populate?: CommunityCommentPopulateParam | (keyof CommunityCommentPopulateParam & string)[] | '*'; filters?: CommunityCommentFilters; sort?: _SortValue<CommunityComment> | _SortValue<CommunityComment>[]; limit?: number; start?: number }
      cover_image?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type DownloadItemPopulateParam = {
      thumbnail?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type EventPopulateParam = {
      coverImage?: true | { fields?: (keyof MediaFile & string)[] }
      gallery?: true | { fields?: (keyof MediaFile & string)[] }
      files?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type GalleryItemPopulateParam = {
      image?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type GuestbookEntryPopulateParam = {
      avatar?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type HubPagePopulateParam = {
      curated_posts?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
      downloads?: true | { fields?: _EntityField<DownloadItem>[]; populate?: DownloadItemPopulateParam | (keyof DownloadItemPopulateParam & string)[] | '*'; filters?: DownloadItemFilters; sort?: _SortValue<DownloadItem> | _SortValue<DownloadItem>[]; limit?: number; start?: number }
      menuIcon?: true | { fields?: _EntityField<UiIcon>[]; filters?: UiIconFilters; sort?: _SortValue<UiIcon> | _SortValue<UiIcon>[]; limit?: number; start?: number }
      coverImage?: true | { fields?: (keyof MediaFile & string)[] }
      sections?: true | { fields?: (keyof HubHubSection & string)[]; populate?: HubHubSectionPopulateParam | (keyof HubHubSectionPopulateParam & string)[] | '*' }
      blocks?: true | { on?: { 'blocks.post-list-auto'?: true | { fields?: (keyof BlocksPostListAuto & string)[]; populate?: BlocksPostListAutoPopulateParam | (keyof BlocksPostListAutoPopulateParam & string)[] | '*' }; 'blocks.post-list-manual'?: true | { fields?: (keyof BlocksPostListManual & string)[]; populate?: BlocksPostListManualPopulateParam | (keyof BlocksPostListManualPopulateParam & string)[] | '*' }; 'blocks.download-grid'?: true | { fields?: (keyof BlocksDownloadGrid & string)[]; populate?: BlocksDownloadGridPopulateParam | (keyof BlocksDownloadGridPopulateParam & string)[] | '*' }; 'blocks.rich-text'?: true | { fields?: (keyof BlocksRichText & string)[] } } }
    };
export type LunarEventPopulateParam = {
      relatedBlogs?: true | { fields?: _EntityField<BlogPost>[]; populate?: BlogPostPopulateParam | (keyof BlogPostPopulateParam & string)[] | '*'; filters?: BlogPostFilters; sort?: _SortValue<BlogPost> | _SortValue<BlogPost>[]; limit?: number; start?: number }
    };
export type LunarEventChantOverridePopulateParam = {
      lunarEvent?: true | { fields?: _EntityField<LunarEvent>[]; populate?: LunarEventPopulateParam | (keyof LunarEventPopulateParam & string)[] | '*'; filters?: LunarEventFilters; sort?: _SortValue<LunarEvent> | _SortValue<LunarEvent>[]; limit?: number; start?: number }
      item?: true | { fields?: _EntityField<ChantItem>[]; populate?: ChantItemPopulateParam | (keyof ChantItemPopulateParam & string)[] | '*'; filters?: ChantItemFilters; sort?: _SortValue<ChantItem> | _SortValue<ChantItem>[]; limit?: number; start?: number }
    };
export type PracticeLogPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      plan?: true | { fields?: _EntityField<ChantPlan>[]; populate?: ChantPlanPopulateParam | (keyof ChantPlanPopulateParam & string)[] | '*'; filters?: ChantPlanFilters; sort?: _SortValue<ChantPlan> | _SortValue<ChantPlan>[]; limit?: number; start?: number }
    };
export type PushSubscriptionPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
    };
export type SettingPopulateParam = {
      logo?: true | { fields?: (keyof MediaFile & string)[] }
      heroSlides?: true | { fields?: (keyof HomepageHeroSlide & string)[]; populate?: HomepageHeroSlidePopulateParam | (keyof HomepageHeroSlidePopulateParam & string)[] | '*' }
      stats?: true | { fields?: (keyof HomepageStatItem & string)[] }
      phapBao?: true | { fields?: (keyof HomepagePhapBaoItem & string)[]; populate?: HomepagePhapBaoItemPopulateParam | (keyof HomepagePhapBaoItemPopulateParam & string)[] | '*' }
      actionCards?: true | { fields?: (keyof HomepageActionCardItem & string)[]; populate?: HomepageActionCardItemPopulateParam | (keyof HomepageActionCardItemPopulateParam & string)[] | '*' }
      featuredVideos?: true | { fields?: (keyof HomepageFeaturedVideo & string)[] }
      awards?: true | { fields?: (keyof HomepageAwardItem & string)[] }
      gallerySlides?: true | { fields?: (keyof HomepageGallerySlide & string)[]; populate?: HomepageGallerySlidePopulateParam | (keyof HomepageGallerySlidePopulateParam & string)[] | '*' }
      stickyBanner?: true | { fields?: (keyof HomepageStickyBanner & string)[] }
    };
export type SidebarConfigPopulateParam = {
      qrImages?: true | { fields?: (keyof MediaFile & string)[] }
      downloadLinks?: true | { fields?: (keyof SharedQuickLink & string)[] }
      socialLinks?: true | { fields?: (keyof SharedSocialLink & string)[]; populate?: SharedSocialLinkPopulateParam | (keyof SharedSocialLinkPopulateParam & string)[] | '*' }
    };
export type SutraPopulateParam = {
      tags?: true | { fields?: _EntityField<BlogTag>[]; populate?: BlogTagPopulateParam | (keyof BlogTagPopulateParam & string)[] | '*'; filters?: BlogTagFilters; sort?: _SortValue<BlogTag> | _SortValue<BlogTag>[]; limit?: number; start?: number }
      volumes?: true | { fields?: _EntityField<SutraVolume>[]; populate?: SutraVolumePopulateParam | (keyof SutraVolumePopulateParam & string)[] | '*'; filters?: SutraVolumeFilters; sort?: _SortValue<SutraVolume> | _SortValue<SutraVolume>[]; limit?: number; start?: number }
      glossaries?: true | { fields?: _EntityField<SutraGlossary>[]; populate?: SutraGlossaryPopulateParam | (keyof SutraGlossaryPopulateParam & string)[] | '*'; filters?: SutraGlossaryFilters; sort?: _SortValue<SutraGlossary> | _SortValue<SutraGlossary>[]; limit?: number; start?: number }
      coverImage?: true | { fields?: (keyof MediaFile & string)[] }
    };
export type SutraBookmarkPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      sutra?: true | { fields?: _EntityField<Sutra>[]; populate?: SutraPopulateParam | (keyof SutraPopulateParam & string)[] | '*'; filters?: SutraFilters; sort?: _SortValue<Sutra> | _SortValue<Sutra>[]; limit?: number; start?: number }
      volume?: true | { fields?: _EntityField<SutraVolume>[]; populate?: SutraVolumePopulateParam | (keyof SutraVolumePopulateParam & string)[] | '*'; filters?: SutraVolumeFilters; sort?: _SortValue<SutraVolume> | _SortValue<SutraVolume>[]; limit?: number; start?: number }
      chapter?: true | { fields?: _EntityField<SutraChapter>[]; populate?: SutraChapterPopulateParam | (keyof SutraChapterPopulateParam & string)[] | '*'; filters?: SutraChapterFilters; sort?: _SortValue<SutraChapter> | _SortValue<SutraChapter>[]; limit?: number; start?: number }
    };
export type SutraChapterPopulateParam = {
      sutra?: true | { fields?: _EntityField<Sutra>[]; populate?: SutraPopulateParam | (keyof SutraPopulateParam & string)[] | '*'; filters?: SutraFilters; sort?: _SortValue<Sutra> | _SortValue<Sutra>[]; limit?: number; start?: number }
      volume?: true | { fields?: _EntityField<SutraVolume>[]; populate?: SutraVolumePopulateParam | (keyof SutraVolumePopulateParam & string)[] | '*'; filters?: SutraVolumeFilters; sort?: _SortValue<SutraVolume> | _SortValue<SutraVolume>[]; limit?: number; start?: number }
      glossaries?: true | { fields?: _EntityField<SutraGlossary>[]; populate?: SutraGlossaryPopulateParam | (keyof SutraGlossaryPopulateParam & string)[] | '*'; filters?: SutraGlossaryFilters; sort?: _SortValue<SutraGlossary> | _SortValue<SutraGlossary>[]; limit?: number; start?: number }
    };
export type SutraGlossaryPopulateParam = {
      sutra?: true | { fields?: _EntityField<Sutra>[]; populate?: SutraPopulateParam | (keyof SutraPopulateParam & string)[] | '*'; filters?: SutraFilters; sort?: _SortValue<Sutra> | _SortValue<Sutra>[]; limit?: number; start?: number }
      volume?: true | { fields?: _EntityField<SutraVolume>[]; populate?: SutraVolumePopulateParam | (keyof SutraVolumePopulateParam & string)[] | '*'; filters?: SutraVolumeFilters; sort?: _SortValue<SutraVolume> | _SortValue<SutraVolume>[]; limit?: number; start?: number }
      chapter?: true | { fields?: _EntityField<SutraChapter>[]; populate?: SutraChapterPopulateParam | (keyof SutraChapterPopulateParam & string)[] | '*'; filters?: SutraChapterFilters; sort?: _SortValue<SutraChapter> | _SortValue<SutraChapter>[]; limit?: number; start?: number }
    };
export type SutraReadingProgressPopulateParam = {
      user?: true | { fields?: _EntityField<User>[]; populate?: UserPopulateParam | (keyof UserPopulateParam & string)[] | '*'; filters?: UserFilters; sort?: _SortValue<User> | _SortValue<User>[]; limit?: number; start?: number }
      sutra?: true | { fields?: _EntityField<Sutra>[]; populate?: SutraPopulateParam | (keyof SutraPopulateParam & string)[] | '*'; filters?: SutraFilters; sort?: _SortValue<Sutra> | _SortValue<Sutra>[]; limit?: number; start?: number }
      volume?: true | { fields?: _EntityField<SutraVolume>[]; populate?: SutraVolumePopulateParam | (keyof SutraVolumePopulateParam & string)[] | '*'; filters?: SutraVolumeFilters; sort?: _SortValue<SutraVolume> | _SortValue<SutraVolume>[]; limit?: number; start?: number }
      chapter?: true | { fields?: _EntityField<SutraChapter>[]; populate?: SutraChapterPopulateParam | (keyof SutraChapterPopulateParam & string)[] | '*'; filters?: SutraChapterFilters; sort?: _SortValue<SutraChapter> | _SortValue<SutraChapter>[]; limit?: number; start?: number }
    };
export type SutraVolumePopulateParam = {
      sutra?: true | { fields?: _EntityField<Sutra>[]; populate?: SutraPopulateParam | (keyof SutraPopulateParam & string)[] | '*'; filters?: SutraFilters; sort?: _SortValue<Sutra> | _SortValue<Sutra>[]; limit?: number; start?: number }
      chapters?: true | { fields?: _EntityField<SutraChapter>[]; populate?: SutraChapterPopulateParam | (keyof SutraChapterPopulateParam & string)[] | '*'; filters?: SutraChapterFilters; sort?: _SortValue<SutraChapter> | _SortValue<SutraChapter>[]; limit?: number; start?: number }
    };
export type UserPopulateParam = {
      role?: true | { fields?: _EntityField<Role>[]; filters?: RoleFilters; sort?: _SortValue<Role> | _SortValue<Role>[]; limit?: number; start?: number }
    };
// Prisma-like Payload types for populate support
// These types allow type-safe population of relations
//
// Usage example:
// type ItemWithCategory = ItemGetPayload<{ populate: { category: true } }>
// const items = await strapi.items.find({ populate: { category: true } }) as ItemWithCategory[]
//
// This ensures that relations are only included in the type when populate is used
// Payload type for BlocksDownloadGrid with populate support
export type BlocksDownloadGridGetPayload<P extends { populate?: any } = {}> =
  BlocksDownloadGrid &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          downloads?: DownloadItem[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            downloads?: 'downloads' extends Pop[number] ? DownloadItem[] : never
          }
        : {
          downloads?: 'downloads' extends keyof Pop
            ? _ApplyFields<Pop['downloads'] extends { populate: infer NestedPop } ? DownloadItemGetPayload<{ populate: NestedPop }> : DownloadItem, DownloadItem, Pop['downloads']>[]
            : never
          }
    : {})
// Payload type for BlocksPostListAuto with populate support
export type BlocksPostListAutoGetPayload<P extends { populate?: any } = {}> =
  BlocksPostListAuto &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          category?: Category | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            category?: 'category' extends Pop[number] ? Category | null : never
          }
        : {
          category?: 'category' extends keyof Pop
            ? _ApplyFields<Pop['category'] extends { populate: infer NestedPop } ? CategoryGetPayload<{ populate: NestedPop }> : Category, Category, Pop['category']> | null
            : never
          }
    : {})
// Payload type for BlocksPostListManual with populate support
export type BlocksPostListManualGetPayload<P extends { populate?: any } = {}> =
  BlocksPostListManual &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          posts?: BlogPost[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            posts?: 'posts' extends Pop[number] ? BlogPost[] : never
          }
        : {
          posts?: 'posts' extends keyof Pop
            ? _ApplyFields<Pop['posts'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['posts']>[]
            : never
          }
    : {})
// Payload type for ChantingPlanItem with populate support
export type ChantingPlanItemGetPayload<P extends { populate?: any } = {}> =
  ChantingPlanItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          item?: ChantItem | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            item?: 'item' extends Pop[number] ? ChantItem | null : never
          }
        : {
          item?: 'item' extends keyof Pop
            ? _ApplyFields<Pop['item'] extends { populate: infer NestedPop } ? ChantItemGetPayload<{ populate: NestedPop }> : ChantItem, ChantItem, Pop['item']> | null
            : never
          }
    : {})
// Payload type for HomepageActionCardItem with populate support
export type HomepageActionCardItemGetPayload<P extends { populate?: any } = {}> =
  HomepageActionCardItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          icon?: UiIcon | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            icon?: 'icon' extends Pop[number] ? UiIcon | null : never
          }
        : {
          icon?: 'icon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['icon']> | null
            : never
          }
    : {})
// Payload type for HomepageGallerySlide with populate support
export type HomepageGallerySlideGetPayload<P extends { populate?: any } = {}> =
  HomepageGallerySlide &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          image?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            image?: 'image' extends Pop[number] ? MediaFile : never
          }
        : {
          image?: 'image' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['image']> : never
          }
    : {})
// Payload type for HomepageHeroSlide with populate support
export type HomepageHeroSlideGetPayload<P extends { populate?: any } = {}> =
  HomepageHeroSlide &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          image?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            image?: 'image' extends Pop[number] ? MediaFile : never
          }
        : {
          image?: 'image' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['image']> : never
          }
    : {})
// Payload type for HomepagePhapBaoItem with populate support
export type HomepagePhapBaoItemGetPayload<P extends { populate?: any } = {}> =
  HomepagePhapBaoItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          icon?: UiIcon | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            icon?: 'icon' extends Pop[number] ? UiIcon | null : never
          }
        : {
          icon?: 'icon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['icon']> | null
            : never
          }
    : {})
// Payload type for HomepageSearchCategory with populate support
export type HomepageSearchCategoryGetPayload<P extends { populate?: any } = {}> =
  HomepageSearchCategory &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          icon?: UiIcon | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            icon?: 'icon' extends Pop[number] ? UiIcon | null : never
          }
        : {
          icon?: 'icon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['icon']> | null
            : never
          }
    : {})
// Payload type for HubHubLink with populate support
export type HubHubLinkGetPayload<P extends { populate?: any } = {}> =
  HubHubLink &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          thumbnail?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            thumbnail?: 'thumbnail' extends Pop[number] ? MediaFile : never
          }
        : {
          thumbnail?: 'thumbnail' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['thumbnail']> : never
          }
    : {})
// Payload type for HubHubSection with populate support
export type HubHubSectionGetPayload<P extends { populate?: any } = {}> =
  HubHubSection &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          links?: HubHubLink[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            links?: 'links' extends Pop[number] ? HubHubLink[] : never
          }
        : {
          links?: 'links' extends keyof Pop
            ? _ApplyFields<Pop['links'] extends { populate: infer NestedPop } ? HubHubLinkGetPayload<{ populate: NestedPop }> : HubHubLink, HubHubLink, Pop['links']>[]
            : never
          }
    : {})
// Payload type for SharedSeo with populate support
export type SharedSeoGetPayload<P extends { populate?: any } = {}> =
  SharedSeo &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          metaImage?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            metaImage?: 'metaImage' extends Pop[number] ? MediaFile : never
          }
        : {
          metaImage?: 'metaImage' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['metaImage']> : never
          }
    : {})
// Payload type for SharedSocialLink with populate support
export type SharedSocialLinkGetPayload<P extends { populate?: any } = {}> =
  SharedSocialLink &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          icon?: UiIcon | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            icon?: 'icon' extends Pop[number] ? UiIcon | null : never
          }
        : {
          icon?: 'icon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['icon']> | null
            : never
          }
    : {})
// Payload type for BeginnerGuide with populate support
export type BeginnerGuideGetPayload<P extends { populate?: any } = {}> =
  BeginnerGuide &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          icon?: UiIcon | null
          images?: MediaFile[]
          attached_files?: MediaFile[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            icon?: 'icon' extends Pop[number] ? UiIcon | null : never
            images?: 'images' extends Pop[number] ? MediaFile[] : never
            attached_files?: 'attached_files' extends Pop[number] ? MediaFile[] : never
          }
        : {
          icon?: 'icon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['icon']> | null
            : never
          images?: 'images' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['images']>[] : never
          attached_files?: 'attached_files' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['attached_files']>[] : never
          }
    : {})
// Payload type for BlogComment with populate support
export type BlogCommentGetPayload<P extends { populate?: any } = {}> =
  BlogComment &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          post?: BlogPost | null
          parent?: BlogComment | null
          replies?: BlogComment[]
          user?: User | null
          authorAvatar?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            post?: 'post' extends Pop[number] ? BlogPost | null : never
            parent?: 'parent' extends Pop[number] ? BlogComment | null : never
            replies?: 'replies' extends Pop[number] ? BlogComment[] : never
            user?: 'user' extends Pop[number] ? User | null : never
            authorAvatar?: 'authorAvatar' extends Pop[number] ? MediaFile : never
          }
        : {
          post?: 'post' extends keyof Pop
            ? _ApplyFields<Pop['post'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['post']> | null
            : never
          parent?: 'parent' extends keyof Pop
            ? _ApplyFields<Pop['parent'] extends { populate: infer NestedPop } ? BlogCommentGetPayload<{ populate: NestedPop }> : BlogComment, BlogComment, Pop['parent']> | null
            : never
          replies?: 'replies' extends keyof Pop
            ? _ApplyFields<Pop['replies'] extends { populate: infer NestedPop } ? BlogCommentGetPayload<{ populate: NestedPop }> : BlogComment, BlogComment, Pop['replies']>[]
            : never
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          authorAvatar?: 'authorAvatar' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['authorAvatar']> : never
          }
    : {})
// Payload type for BlogPost with populate support
export type BlogPostGetPayload<P extends { populate?: any } = {}> =
  BlogPost &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          categories?: Category[]
          tags?: BlogTag[]
          related_posts?: BlogPost[]
          lunarEvents?: LunarEvent[]
          thumbnail?: MediaFile
          gallery?: MediaFile[]
          seo?: SharedSeo
        }
      : Pop extends readonly (infer _)[]
        ? {
            categories?: 'categories' extends Pop[number] ? Category[] : never
            tags?: 'tags' extends Pop[number] ? BlogTag[] : never
            related_posts?: 'related_posts' extends Pop[number] ? BlogPost[] : never
            lunarEvents?: 'lunarEvents' extends Pop[number] ? LunarEvent[] : never
            thumbnail?: 'thumbnail' extends Pop[number] ? MediaFile : never
            gallery?: 'gallery' extends Pop[number] ? MediaFile[] : never
            seo?: 'seo' extends Pop[number] ? SharedSeo : never
          }
        : {
          categories?: 'categories' extends keyof Pop
            ? _ApplyFields<Pop['categories'] extends { populate: infer NestedPop } ? CategoryGetPayload<{ populate: NestedPop }> : Category, Category, Pop['categories']>[]
            : never
          tags?: 'tags' extends keyof Pop
            ? _ApplyFields<Pop['tags'] extends { populate: infer NestedPop } ? BlogTagGetPayload<{ populate: NestedPop }> : BlogTag, BlogTag, Pop['tags']>[]
            : never
          related_posts?: 'related_posts' extends keyof Pop
            ? _ApplyFields<Pop['related_posts'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['related_posts']>[]
            : never
          lunarEvents?: 'lunarEvents' extends keyof Pop
            ? _ApplyFields<Pop['lunarEvents'] extends { populate: infer NestedPop } ? LunarEventGetPayload<{ populate: NestedPop }> : LunarEvent, LunarEvent, Pop['lunarEvents']>[]
            : never
          thumbnail?: 'thumbnail' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['thumbnail']> : never
          gallery?: 'gallery' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['gallery']>[] : never
          seo?: 'seo' extends keyof Pop
            ? _ApplyFields<Pop['seo'] extends { populate: infer NestedPop } ? SharedSeoGetPayload<{ populate: NestedPop }> : SharedSeo, SharedSeo, Pop['seo']>
            : never
          }
    : {})
// Payload type for BlogReaderState with populate support
export type BlogReaderStateGetPayload<P extends { populate?: any } = {}> =
  BlogReaderState &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          post?: BlogPost | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            post?: 'post' extends Pop[number] ? BlogPost | null : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          post?: 'post' extends keyof Pop
            ? _ApplyFields<Pop['post'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['post']> | null
            : never
          }
    : {})
// Payload type for BlogTag with populate support
export type BlogTagGetPayload<P extends { populate?: any } = {}> =
  BlogTag &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          blog_posts?: BlogPost[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            blog_posts?: 'blog_posts' extends Pop[number] ? BlogPost[] : never
          }
        : {
          blog_posts?: 'blog_posts' extends keyof Pop
            ? _ApplyFields<Pop['blog_posts'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['blog_posts']>[]
            : never
          }
    : {})
// Payload type for Category with populate support
export type CategoryGetPayload<P extends { populate?: any } = {}> =
  Category &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          parent?: Category | null
          children?: Category[]
          blog_posts?: BlogPost[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            parent?: 'parent' extends Pop[number] ? Category | null : never
            children?: 'children' extends Pop[number] ? Category[] : never
            blog_posts?: 'blog_posts' extends Pop[number] ? BlogPost[] : never
          }
        : {
          parent?: 'parent' extends keyof Pop
            ? _ApplyFields<Pop['parent'] extends { populate: infer NestedPop } ? CategoryGetPayload<{ populate: NestedPop }> : Category, Category, Pop['parent']> | null
            : never
          children?: 'children' extends keyof Pop
            ? _ApplyFields<Pop['children'] extends { populate: infer NestedPop } ? CategoryGetPayload<{ populate: NestedPop }> : Category, Category, Pop['children']>[]
            : never
          blog_posts?: 'blog_posts' extends keyof Pop
            ? _ApplyFields<Pop['blog_posts'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['blog_posts']>[]
            : never
          }
    : {})
// Payload type for ChantItem with populate support
export type ChantItemGetPayload<P extends { populate?: any } = {}> =
  ChantItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          audio?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            audio?: 'audio' extends Pop[number] ? MediaFile : never
          }
        : {
          audio?: 'audio' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['audio']> : never
          }
    : {})
// Payload type for ChantPlan with populate support
export type ChantPlanGetPayload<P extends { populate?: any } = {}> =
  ChantPlan &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          planItems?: ChantingPlanItem[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            planItems?: 'planItems' extends Pop[number] ? ChantingPlanItem[] : never
          }
        : {
          planItems?: 'planItems' extends keyof Pop
            ? _ApplyFields<Pop['planItems'] extends { populate: infer NestedPop } ? ChantingPlanItemGetPayload<{ populate: NestedPop }> : ChantingPlanItem, ChantingPlanItem, Pop['planItems']>[]
            : never
          }
    : {})
// Payload type for CommunityComment with populate support
export type CommunityCommentGetPayload<P extends { populate?: any } = {}> =
  CommunityComment &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          post?: CommunityPost | null
          parent?: CommunityComment | null
          replies?: CommunityComment[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            post?: 'post' extends Pop[number] ? CommunityPost | null : never
            parent?: 'parent' extends Pop[number] ? CommunityComment | null : never
            replies?: 'replies' extends Pop[number] ? CommunityComment[] : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          post?: 'post' extends keyof Pop
            ? _ApplyFields<Pop['post'] extends { populate: infer NestedPop } ? CommunityPostGetPayload<{ populate: NestedPop }> : CommunityPost, CommunityPost, Pop['post']> | null
            : never
          parent?: 'parent' extends keyof Pop
            ? _ApplyFields<Pop['parent'] extends { populate: infer NestedPop } ? CommunityCommentGetPayload<{ populate: NestedPop }> : CommunityComment, CommunityComment, Pop['parent']> | null
            : never
          replies?: 'replies' extends keyof Pop
            ? _ApplyFields<Pop['replies'] extends { populate: infer NestedPop } ? CommunityCommentGetPayload<{ populate: NestedPop }> : CommunityComment, CommunityComment, Pop['replies']>[]
            : never
          }
    : {})
// Payload type for CommunityPost with populate support
export type CommunityPostGetPayload<P extends { populate?: any } = {}> =
  CommunityPost &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          comments?: CommunityComment[]
          cover_image?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            comments?: 'comments' extends Pop[number] ? CommunityComment[] : never
            cover_image?: 'cover_image' extends Pop[number] ? MediaFile : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          comments?: 'comments' extends keyof Pop
            ? _ApplyFields<Pop['comments'] extends { populate: infer NestedPop } ? CommunityCommentGetPayload<{ populate: NestedPop }> : CommunityComment, CommunityComment, Pop['comments']>[]
            : never
          cover_image?: 'cover_image' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['cover_image']> : never
          }
    : {})
// Payload type for DownloadItem with populate support
export type DownloadItemGetPayload<P extends { populate?: any } = {}> =
  DownloadItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          thumbnail?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            thumbnail?: 'thumbnail' extends Pop[number] ? MediaFile : never
          }
        : {
          thumbnail?: 'thumbnail' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['thumbnail']> : never
          }
    : {})
// Payload type for Event with populate support
export type EventGetPayload<P extends { populate?: any } = {}> =
  Event &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          coverImage?: MediaFile
          gallery?: MediaFile[]
          files?: MediaFile[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            coverImage?: 'coverImage' extends Pop[number] ? MediaFile : never
            gallery?: 'gallery' extends Pop[number] ? MediaFile[] : never
            files?: 'files' extends Pop[number] ? MediaFile[] : never
          }
        : {
          coverImage?: 'coverImage' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['coverImage']> : never
          gallery?: 'gallery' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['gallery']>[] : never
          files?: 'files' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['files']>[] : never
          }
    : {})
// Payload type for GalleryItem with populate support
export type GalleryItemGetPayload<P extends { populate?: any } = {}> =
  GalleryItem &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          image?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            image?: 'image' extends Pop[number] ? MediaFile : never
          }
        : {
          image?: 'image' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['image']> : never
          }
    : {})
// Payload type for GuestbookEntry with populate support
export type GuestbookEntryGetPayload<P extends { populate?: any } = {}> =
  GuestbookEntry &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          avatar?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            avatar?: 'avatar' extends Pop[number] ? MediaFile : never
          }
        : {
          avatar?: 'avatar' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['avatar']> : never
          }
    : {})
// Payload type for HubPage with populate support
export type HubPageGetPayload<P extends { populate?: any } = {}> =
  HubPage &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          curated_posts?: BlogPost[]
          downloads?: DownloadItem[]
          menuIcon?: UiIcon | null
          coverImage?: MediaFile
          sections?: HubHubSection[]
          blocks?: (BlocksPostListAuto | BlocksPostListManual | BlocksDownloadGrid | BlocksRichText)[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            curated_posts?: 'curated_posts' extends Pop[number] ? BlogPost[] : never
            downloads?: 'downloads' extends Pop[number] ? DownloadItem[] : never
            menuIcon?: 'menuIcon' extends Pop[number] ? UiIcon | null : never
            coverImage?: 'coverImage' extends Pop[number] ? MediaFile : never
            sections?: 'sections' extends Pop[number] ? HubHubSection[] : never
            blocks?: 'blocks' extends Pop[number] ? (BlocksPostListAuto | BlocksPostListManual | BlocksDownloadGrid | BlocksRichText)[] : never
          }
        : {
          curated_posts?: 'curated_posts' extends keyof Pop
            ? _ApplyFields<Pop['curated_posts'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['curated_posts']>[]
            : never
          downloads?: 'downloads' extends keyof Pop
            ? _ApplyFields<Pop['downloads'] extends { populate: infer NestedPop } ? DownloadItemGetPayload<{ populate: NestedPop }> : DownloadItem, DownloadItem, Pop['downloads']>[]
            : never
          menuIcon?: 'menuIcon' extends keyof Pop
            ? _ApplyFields<UiIcon, UiIcon, Pop['menuIcon']> | null
            : never
          coverImage?: 'coverImage' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['coverImage']> : never
          sections?: 'sections' extends keyof Pop
            ? _ApplyFields<Pop['sections'] extends { populate: infer NestedPop } ? HubHubSectionGetPayload<{ populate: NestedPop }> : HubHubSection, HubHubSection, Pop['sections']>[]
            : never
          blocks?: 'blocks' extends keyof Pop ? ((Pop['blocks'] extends { on: infer On } ? 'blocks.post-list-auto' extends keyof On ? On['blocks.post-list-auto'] extends { populate: infer NestedPop } ? BlocksPostListAutoGetPayload<{ populate: NestedPop }> : BlocksPostListAuto : BlocksPostListAuto : BlocksPostListAuto) | (Pop['blocks'] extends { on: infer On } ? 'blocks.post-list-manual' extends keyof On ? On['blocks.post-list-manual'] extends { populate: infer NestedPop } ? BlocksPostListManualGetPayload<{ populate: NestedPop }> : BlocksPostListManual : BlocksPostListManual : BlocksPostListManual) | (Pop['blocks'] extends { on: infer On } ? 'blocks.download-grid' extends keyof On ? On['blocks.download-grid'] extends { populate: infer NestedPop } ? BlocksDownloadGridGetPayload<{ populate: NestedPop }> : BlocksDownloadGrid : BlocksDownloadGrid : BlocksDownloadGrid) | BlocksRichText)[] : never
          }
    : {})
// Payload type for LunarEvent with populate support
export type LunarEventGetPayload<P extends { populate?: any } = {}> =
  LunarEvent &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          relatedBlogs?: BlogPost[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            relatedBlogs?: 'relatedBlogs' extends Pop[number] ? BlogPost[] : never
          }
        : {
          relatedBlogs?: 'relatedBlogs' extends keyof Pop
            ? _ApplyFields<Pop['relatedBlogs'] extends { populate: infer NestedPop } ? BlogPostGetPayload<{ populate: NestedPop }> : BlogPost, BlogPost, Pop['relatedBlogs']>[]
            : never
          }
    : {})
// Payload type for LunarEventChantOverride with populate support
export type LunarEventChantOverrideGetPayload<P extends { populate?: any } = {}> =
  LunarEventChantOverride &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          lunarEvent?: LunarEvent | null
          item?: ChantItem | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            lunarEvent?: 'lunarEvent' extends Pop[number] ? LunarEvent | null : never
            item?: 'item' extends Pop[number] ? ChantItem | null : never
          }
        : {
          lunarEvent?: 'lunarEvent' extends keyof Pop
            ? _ApplyFields<Pop['lunarEvent'] extends { populate: infer NestedPop } ? LunarEventGetPayload<{ populate: NestedPop }> : LunarEvent, LunarEvent, Pop['lunarEvent']> | null
            : never
          item?: 'item' extends keyof Pop
            ? _ApplyFields<Pop['item'] extends { populate: infer NestedPop } ? ChantItemGetPayload<{ populate: NestedPop }> : ChantItem, ChantItem, Pop['item']> | null
            : never
          }
    : {})
// Payload type for PracticeLog with populate support
export type PracticeLogGetPayload<P extends { populate?: any } = {}> =
  PracticeLog &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          plan?: ChantPlan | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            plan?: 'plan' extends Pop[number] ? ChantPlan | null : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          plan?: 'plan' extends keyof Pop
            ? _ApplyFields<Pop['plan'] extends { populate: infer NestedPop } ? ChantPlanGetPayload<{ populate: NestedPop }> : ChantPlan, ChantPlan, Pop['plan']> | null
            : never
          }
    : {})
// Payload type for PushSubscription with populate support
export type PushSubscriptionGetPayload<P extends { populate?: any } = {}> =
  PushSubscription &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          }
    : {})
// Payload type for Setting with populate support
export type SettingGetPayload<P extends { populate?: any } = {}> =
  Setting &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          logo?: MediaFile
          heroSlides?: HomepageHeroSlide[]
          stats?: HomepageStatItem[]
          phapBao?: HomepagePhapBaoItem[]
          actionCards?: HomepageActionCardItem[]
          featuredVideos?: HomepageFeaturedVideo[]
          awards?: HomepageAwardItem[]
          gallerySlides?: HomepageGallerySlide[]
          stickyBanner?: HomepageStickyBanner
        }
      : Pop extends readonly (infer _)[]
        ? {
            logo?: 'logo' extends Pop[number] ? MediaFile : never
            heroSlides?: 'heroSlides' extends Pop[number] ? HomepageHeroSlide[] : never
            stats?: 'stats' extends Pop[number] ? HomepageStatItem[] : never
            phapBao?: 'phapBao' extends Pop[number] ? HomepagePhapBaoItem[] : never
            actionCards?: 'actionCards' extends Pop[number] ? HomepageActionCardItem[] : never
            featuredVideos?: 'featuredVideos' extends Pop[number] ? HomepageFeaturedVideo[] : never
            awards?: 'awards' extends Pop[number] ? HomepageAwardItem[] : never
            gallerySlides?: 'gallerySlides' extends Pop[number] ? HomepageGallerySlide[] : never
            stickyBanner?: 'stickyBanner' extends Pop[number] ? HomepageStickyBanner : never
          }
        : {
          logo?: 'logo' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['logo']> : never
          heroSlides?: 'heroSlides' extends keyof Pop
            ? _ApplyFields<Pop['heroSlides'] extends { populate: infer NestedPop } ? HomepageHeroSlideGetPayload<{ populate: NestedPop }> : HomepageHeroSlide, HomepageHeroSlide, Pop['heroSlides']>[]
            : never
          stats?: 'stats' extends keyof Pop
            ? _ApplyFields<HomepageStatItem, HomepageStatItem, Pop['stats']>[]
            : never
          phapBao?: 'phapBao' extends keyof Pop
            ? _ApplyFields<Pop['phapBao'] extends { populate: infer NestedPop } ? HomepagePhapBaoItemGetPayload<{ populate: NestedPop }> : HomepagePhapBaoItem, HomepagePhapBaoItem, Pop['phapBao']>[]
            : never
          actionCards?: 'actionCards' extends keyof Pop
            ? _ApplyFields<Pop['actionCards'] extends { populate: infer NestedPop } ? HomepageActionCardItemGetPayload<{ populate: NestedPop }> : HomepageActionCardItem, HomepageActionCardItem, Pop['actionCards']>[]
            : never
          featuredVideos?: 'featuredVideos' extends keyof Pop
            ? _ApplyFields<HomepageFeaturedVideo, HomepageFeaturedVideo, Pop['featuredVideos']>[]
            : never
          awards?: 'awards' extends keyof Pop
            ? _ApplyFields<HomepageAwardItem, HomepageAwardItem, Pop['awards']>[]
            : never
          gallerySlides?: 'gallerySlides' extends keyof Pop
            ? _ApplyFields<Pop['gallerySlides'] extends { populate: infer NestedPop } ? HomepageGallerySlideGetPayload<{ populate: NestedPop }> : HomepageGallerySlide, HomepageGallerySlide, Pop['gallerySlides']>[]
            : never
          stickyBanner?: 'stickyBanner' extends keyof Pop
            ? _ApplyFields<HomepageStickyBanner, HomepageStickyBanner, Pop['stickyBanner']>
            : never
          }
    : {})
// Payload type for SidebarConfig with populate support
export type SidebarConfigGetPayload<P extends { populate?: any } = {}> =
  SidebarConfig &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          qrImages?: MediaFile[]
          downloadLinks?: SharedQuickLink[]
          socialLinks?: SharedSocialLink[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            qrImages?: 'qrImages' extends Pop[number] ? MediaFile[] : never
            downloadLinks?: 'downloadLinks' extends Pop[number] ? SharedQuickLink[] : never
            socialLinks?: 'socialLinks' extends Pop[number] ? SharedSocialLink[] : never
          }
        : {
          qrImages?: 'qrImages' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['qrImages']>[] : never
          downloadLinks?: 'downloadLinks' extends keyof Pop
            ? _ApplyFields<SharedQuickLink, SharedQuickLink, Pop['downloadLinks']>[]
            : never
          socialLinks?: 'socialLinks' extends keyof Pop
            ? _ApplyFields<Pop['socialLinks'] extends { populate: infer NestedPop } ? SharedSocialLinkGetPayload<{ populate: NestedPop }> : SharedSocialLink, SharedSocialLink, Pop['socialLinks']>[]
            : never
          }
    : {})
// Payload type for Sutra with populate support
export type SutraGetPayload<P extends { populate?: any } = {}> =
  Sutra &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          tags?: BlogTag[]
          volumes?: SutraVolume[]
          glossaries?: SutraGlossary[]
          coverImage?: MediaFile
        }
      : Pop extends readonly (infer _)[]
        ? {
            tags?: 'tags' extends Pop[number] ? BlogTag[] : never
            volumes?: 'volumes' extends Pop[number] ? SutraVolume[] : never
            glossaries?: 'glossaries' extends Pop[number] ? SutraGlossary[] : never
            coverImage?: 'coverImage' extends Pop[number] ? MediaFile : never
          }
        : {
          tags?: 'tags' extends keyof Pop
            ? _ApplyFields<Pop['tags'] extends { populate: infer NestedPop } ? BlogTagGetPayload<{ populate: NestedPop }> : BlogTag, BlogTag, Pop['tags']>[]
            : never
          volumes?: 'volumes' extends keyof Pop
            ? _ApplyFields<Pop['volumes'] extends { populate: infer NestedPop } ? SutraVolumeGetPayload<{ populate: NestedPop }> : SutraVolume, SutraVolume, Pop['volumes']>[]
            : never
          glossaries?: 'glossaries' extends keyof Pop
            ? _ApplyFields<Pop['glossaries'] extends { populate: infer NestedPop } ? SutraGlossaryGetPayload<{ populate: NestedPop }> : SutraGlossary, SutraGlossary, Pop['glossaries']>[]
            : never
          coverImage?: 'coverImage' extends keyof Pop ? _ApplyFields<MediaFile, MediaFile, Pop['coverImage']> : never
          }
    : {})
// Payload type for SutraBookmark with populate support
export type SutraBookmarkGetPayload<P extends { populate?: any } = {}> =
  SutraBookmark &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          sutra?: Sutra | null
          volume?: SutraVolume | null
          chapter?: SutraChapter | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            sutra?: 'sutra' extends Pop[number] ? Sutra | null : never
            volume?: 'volume' extends Pop[number] ? SutraVolume | null : never
            chapter?: 'chapter' extends Pop[number] ? SutraChapter | null : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          sutra?: 'sutra' extends keyof Pop
            ? _ApplyFields<Pop['sutra'] extends { populate: infer NestedPop } ? SutraGetPayload<{ populate: NestedPop }> : Sutra, Sutra, Pop['sutra']> | null
            : never
          volume?: 'volume' extends keyof Pop
            ? _ApplyFields<Pop['volume'] extends { populate: infer NestedPop } ? SutraVolumeGetPayload<{ populate: NestedPop }> : SutraVolume, SutraVolume, Pop['volume']> | null
            : never
          chapter?: 'chapter' extends keyof Pop
            ? _ApplyFields<Pop['chapter'] extends { populate: infer NestedPop } ? SutraChapterGetPayload<{ populate: NestedPop }> : SutraChapter, SutraChapter, Pop['chapter']> | null
            : never
          }
    : {})
// Payload type for SutraChapter with populate support
export type SutraChapterGetPayload<P extends { populate?: any } = {}> =
  SutraChapter &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          sutra?: Sutra | null
          volume?: SutraVolume | null
          glossaries?: SutraGlossary[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            sutra?: 'sutra' extends Pop[number] ? Sutra | null : never
            volume?: 'volume' extends Pop[number] ? SutraVolume | null : never
            glossaries?: 'glossaries' extends Pop[number] ? SutraGlossary[] : never
          }
        : {
          sutra?: 'sutra' extends keyof Pop
            ? _ApplyFields<Pop['sutra'] extends { populate: infer NestedPop } ? SutraGetPayload<{ populate: NestedPop }> : Sutra, Sutra, Pop['sutra']> | null
            : never
          volume?: 'volume' extends keyof Pop
            ? _ApplyFields<Pop['volume'] extends { populate: infer NestedPop } ? SutraVolumeGetPayload<{ populate: NestedPop }> : SutraVolume, SutraVolume, Pop['volume']> | null
            : never
          glossaries?: 'glossaries' extends keyof Pop
            ? _ApplyFields<Pop['glossaries'] extends { populate: infer NestedPop } ? SutraGlossaryGetPayload<{ populate: NestedPop }> : SutraGlossary, SutraGlossary, Pop['glossaries']>[]
            : never
          }
    : {})
// Payload type for SutraGlossary with populate support
export type SutraGlossaryGetPayload<P extends { populate?: any } = {}> =
  SutraGlossary &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          sutra?: Sutra | null
          volume?: SutraVolume | null
          chapter?: SutraChapter | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            sutra?: 'sutra' extends Pop[number] ? Sutra | null : never
            volume?: 'volume' extends Pop[number] ? SutraVolume | null : never
            chapter?: 'chapter' extends Pop[number] ? SutraChapter | null : never
          }
        : {
          sutra?: 'sutra' extends keyof Pop
            ? _ApplyFields<Pop['sutra'] extends { populate: infer NestedPop } ? SutraGetPayload<{ populate: NestedPop }> : Sutra, Sutra, Pop['sutra']> | null
            : never
          volume?: 'volume' extends keyof Pop
            ? _ApplyFields<Pop['volume'] extends { populate: infer NestedPop } ? SutraVolumeGetPayload<{ populate: NestedPop }> : SutraVolume, SutraVolume, Pop['volume']> | null
            : never
          chapter?: 'chapter' extends keyof Pop
            ? _ApplyFields<Pop['chapter'] extends { populate: infer NestedPop } ? SutraChapterGetPayload<{ populate: NestedPop }> : SutraChapter, SutraChapter, Pop['chapter']> | null
            : never
          }
    : {})
// Payload type for SutraReadingProgress with populate support
export type SutraReadingProgressGetPayload<P extends { populate?: any } = {}> =
  SutraReadingProgress &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          user?: User | null
          sutra?: Sutra | null
          volume?: SutraVolume | null
          chapter?: SutraChapter | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            user?: 'user' extends Pop[number] ? User | null : never
            sutra?: 'sutra' extends Pop[number] ? Sutra | null : never
            volume?: 'volume' extends Pop[number] ? SutraVolume | null : never
            chapter?: 'chapter' extends Pop[number] ? SutraChapter | null : never
          }
        : {
          user?: 'user' extends keyof Pop
            ? _ApplyFields<Pop['user'] extends { populate: infer NestedPop } ? UserGetPayload<{ populate: NestedPop }> : User, User, Pop['user']> | null
            : never
          sutra?: 'sutra' extends keyof Pop
            ? _ApplyFields<Pop['sutra'] extends { populate: infer NestedPop } ? SutraGetPayload<{ populate: NestedPop }> : Sutra, Sutra, Pop['sutra']> | null
            : never
          volume?: 'volume' extends keyof Pop
            ? _ApplyFields<Pop['volume'] extends { populate: infer NestedPop } ? SutraVolumeGetPayload<{ populate: NestedPop }> : SutraVolume, SutraVolume, Pop['volume']> | null
            : never
          chapter?: 'chapter' extends keyof Pop
            ? _ApplyFields<Pop['chapter'] extends { populate: infer NestedPop } ? SutraChapterGetPayload<{ populate: NestedPop }> : SutraChapter, SutraChapter, Pop['chapter']> | null
            : never
          }
    : {})
// Payload type for SutraVolume with populate support
export type SutraVolumeGetPayload<P extends { populate?: any } = {}> =
  SutraVolume &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          sutra?: Sutra | null
          chapters?: SutraChapter[]
        }
      : Pop extends readonly (infer _)[]
        ? {
            sutra?: 'sutra' extends Pop[number] ? Sutra | null : never
            chapters?: 'chapters' extends Pop[number] ? SutraChapter[] : never
          }
        : {
          sutra?: 'sutra' extends keyof Pop
            ? _ApplyFields<Pop['sutra'] extends { populate: infer NestedPop } ? SutraGetPayload<{ populate: NestedPop }> : Sutra, Sutra, Pop['sutra']> | null
            : never
          chapters?: 'chapters' extends keyof Pop
            ? _ApplyFields<Pop['chapters'] extends { populate: infer NestedPop } ? SutraChapterGetPayload<{ populate: NestedPop }> : SutraChapter, SutraChapter, Pop['chapters']>[]
            : never
          }
    : {})
// Payload type for User with populate support
export type UserGetPayload<P extends { populate?: any } = {}> =
  User &
  (P extends { populate: infer Pop }
    ? Pop extends '*' | true
      ? {
          role?: Role | null
        }
      : Pop extends readonly (infer _)[]
        ? {
            role?: 'role' extends Pop[number] ? Role | null : never
          }
        : {
          role?: 'role' extends keyof Pop
            ? _ApplyFields<Role, Role, Pop['role']> | null
            : never
          }
    : {})
// ============================================
// Filter Utility Types
// ============================================

/** String filter operators */
export interface StringFilterOperators {
  $eq?: string
  $eqi?: string
  $ne?: string
  $nei?: string
  $in?: string[]
  $notIn?: string[]
  $contains?: string
  $notContains?: string
  $containsi?: string
  $notContainsi?: string
  $startsWith?: string
  $startsWithi?: string
  $endsWith?: string
  $endsWithi?: string
  $null?: boolean
  $notNull?: boolean
}

/** Number filter operators */
export interface NumberFilterOperators {
  $eq?: number
  $ne?: number
  $lt?: number
  $lte?: number
  $gt?: number
  $gte?: number
  $in?: number[]
  $notIn?: number[]
  $between?: [number, number]
  $null?: boolean
  $notNull?: boolean
}

/** Boolean filter operators */
export interface BooleanFilterOperators {
  $eq?: boolean
  $ne?: boolean
  $null?: boolean
  $notNull?: boolean
}

/** Date filter operators (dates are strings in Strapi) */
export interface DateFilterOperators {
  $eq?: string
  $ne?: string
  $lt?: string
  $lte?: string
  $gt?: string
  $gte?: string
  $in?: string[]
  $notIn?: string[]
  $between?: [string, string]
  $null?: boolean
  $notNull?: boolean
}

/** ID filter operators (for relations) */
export interface IdFilterOperators {
  $eq?: number | string
  $ne?: number | string
  $in?: (number | string)[]
  $notIn?: (number | string)[]
  $null?: boolean
  $notNull?: boolean
}

/** Relation filter - filter by nested fields */
export type RelationFilter<T> = {
  id?: number | IdFilterOperators
  documentId?: string | StringFilterOperators
} & {
  [K in keyof T]?: T[K] extends string
    ? string | StringFilterOperators
    : T[K] extends number
    ? number | NumberFilterOperators
    : T[K] extends boolean
    ? boolean | BooleanFilterOperators
    : any
}

/** Logical operators for combining filters */
export interface LogicalOperators<T> {
  $and?: T[]
  $or?: T[]
  $not?: T
}
// ============================================
// Typed Query Parameters
// ============================================

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Sort option - can be a field name or field:direction */
export type SortOption<T> = keyof T & string | `${keyof T & string}:${SortDirection}`

/** Typed query parameters */
export interface TypedQueryParams<
  TEntity,
  TFilters = Record<string, any>,
  TPopulate = any
> {
  /** Type-safe filters */
  filters?: TFilters
  /** Sort by field(s) */
  sort?: SortOption<TEntity> | SortOption<TEntity>[]
  /** Pagination options */
  pagination?: {
    page?: number
    pageSize?: number
    limit?: number
    start?: number
  }
  /** Populate relations */
  populate?: TPopulate
  /** Select specific fields */
  fields?: (keyof TEntity)[]
}
/** Type-safe filters for AuditLog */
export interface AuditLogFilters extends LogicalOperators<AuditLogFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    action?: ('create' | 'update' | 'delete' | 'publish' | 'unpublish') | StringFilterOperators;
    targetUid?: string | StringFilterOperators;
    targetDocumentId?: string | StringFilterOperators;
    targetId?: number | NumberFilterOperators;
    targetLabel?: string | StringFilterOperators;
    actorType?: ('admin' | 'user' | 'guest' | 'system') | StringFilterOperators;
    actorId?: number | NumberFilterOperators;
    actorDisplayName?: string | StringFilterOperators;
    actorEmail?: string | StringFilterOperators;
    requestMethod?: string | StringFilterOperators;
    requestPath?: string | StringFilterOperators;
    requestId?: string | StringFilterOperators;
    ipHash?: string | StringFilterOperators;
    userAgent?: string | StringFilterOperators;
    changedFields?: any;
    metadata?: any;
}
/** Type-safe filters for BeginnerGuide */
export interface BeginnerGuideFilters extends LogicalOperators<BeginnerGuideFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    details?: any;
    duration?: string | StringFilterOperators;
    order?: number | NumberFilterOperators;
    step_number?: number | NumberFilterOperators;
    guide_type?: ('so-hoc' | 'kinh-bai-tap') | StringFilterOperators;
    pdf_url?: string | StringFilterOperators;
    video_url?: string | StringFilterOperators;
    icon?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    images?: { id?: number | IdFilterOperators; [key: string]: any };
    attached_files?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for BlogComment */
export interface BlogCommentFilters extends LogicalOperators<BlogCommentFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    authorName?: string | StringFilterOperators;
    userId?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    likes?: number | NumberFilterOperators;
    isOfficialReply?: boolean | BooleanFilterOperators;
    badge?: string | StringFilterOperators;
    ipHash?: string | StringFilterOperators;
    moderationStatus?: ('visible' | 'flagged' | 'hidden' | 'removed') | StringFilterOperators;
    reportCount?: number | NumberFilterOperators;
    lastReportReason?: string | StringFilterOperators;
    isHidden?: boolean | BooleanFilterOperators;
    spamScore?: number | NumberFilterOperators;
    post?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    parent?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    replies?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    authorAvatar?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for BlogPost */
export interface BlogPostFilters extends LogicalOperators<BlogPostFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    excerpt?: string | StringFilterOperators;
    video_url?: string | StringFilterOperators;
    audio_url?: string | StringFilterOperators;
    oembed?: string | StringFilterOperators;
    featured?: boolean | BooleanFilterOperators;
    views?: number | NumberFilterOperators;
    unique_views?: number | NumberFilterOperators;
    likes?: number | NumberFilterOperators;
    seriesKey?: string | StringFilterOperators;
    seriesNumber?: number | NumberFilterOperators;
    sourceName?: string | StringFilterOperators;
    sourceUrl?: string | StringFilterOperators;
    sourceTitle?: string | StringFilterOperators;
    allowComments?: boolean | BooleanFilterOperators;
    commentCount?: number | NumberFilterOperators;
    eventDate?: string | DateFilterOperators;
    location?: string | StringFilterOperators;
    categories?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    tags?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    related_posts?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    lunarEvents?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    thumbnail?: { id?: number | IdFilterOperators; [key: string]: any };
    gallery?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for BlogReaderState */
export interface BlogReaderStateFilters extends LogicalOperators<BlogReaderStateFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    isFavorite?: boolean | BooleanFilterOperators;
    firstReadAt?: string | DateFilterOperators;
    lastReadAt?: string | DateFilterOperators;
    favoritedAt?: string | DateFilterOperators;
    isPinned?: boolean | BooleanFilterOperators;
    pinnedAt?: string | DateFilterOperators;
    readCount?: number | NumberFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    post?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for BlogTag */
export interface BlogTagFilters extends LogicalOperators<BlogTagFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    name?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    blog_posts?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for Category */
export interface CategoryFilters extends LogicalOperators<CategoryFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    name?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    color?: string | StringFilterOperators;
    order?: number | NumberFilterOperators;
    is_active?: boolean | BooleanFilterOperators;
    parent?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    children?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    blog_posts?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for ChantItem */
export interface ChantItemFilters extends LogicalOperators<ChantItemFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    kind?: ('step' | 'sutra' | 'mantra') | StringFilterOperators;
    content?: string | StringFilterOperators;
    openingPrayer?: string | StringFilterOperators;
    timeRules?: any;
    recommendedPresets?: any;
    audio?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for ChantPlan */
export interface ChantPlanFilters extends LogicalOperators<ChantPlanFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    planType?: ('daily' | 'special') | StringFilterOperators;
}
/** Type-safe filters for CommunityComment */
export interface CommunityCommentFilters extends LogicalOperators<CommunityCommentFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    author_name?: string | StringFilterOperators;
    author_avatar?: string | StringFilterOperators;
    likes?: number | NumberFilterOperators;
    moderationStatus?: ('visible' | 'flagged' | 'hidden' | 'removed') | StringFilterOperators;
    reportCount?: number | NumberFilterOperators;
    lastReportReason?: string | StringFilterOperators;
    isHidden?: boolean | BooleanFilterOperators;
    spamScore?: number | NumberFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    post?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    parent?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    replies?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for CommunityPost */
export interface CommunityPostFilters extends LogicalOperators<CommunityPostFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    type?: ('story' | 'feedback' | 'video') | StringFilterOperators;
    category?: ('Sức Khoẻ' | 'Gia Đình' | 'Sự Nghiệp' | 'Hôn Nhân' | 'Tâm Linh' | 'Thi Cử' | 'Kinh Doanh' | 'Mất Ngủ' | 'Mối Quan Hệ' | 'Khác') | StringFilterOperators;
    video_url?: string | StringFilterOperators;
    author_name?: string | StringFilterOperators;
    author_avatar?: string | StringFilterOperators;
    author_country?: string | StringFilterOperators;
    likes?: number | NumberFilterOperators;
    views?: number | NumberFilterOperators;
    tags?: any;
    rating?: number | NumberFilterOperators;
    pinned?: boolean | BooleanFilterOperators;
    moderationStatus?: ('visible' | 'flagged' | 'hidden' | 'removed') | StringFilterOperators;
    reportCount?: number | NumberFilterOperators;
    lastReportReason?: string | StringFilterOperators;
    isHidden?: boolean | BooleanFilterOperators;
    spamScore?: number | NumberFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    comments?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    cover_image?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for ContentHistory */
export interface ContentHistoryFilters extends LogicalOperators<ContentHistoryFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    targetUid?: string | StringFilterOperators;
    targetDocumentId?: string | StringFilterOperators;
    targetId?: number | NumberFilterOperators;
    targetLabel?: string | StringFilterOperators;
    action?: ('create' | 'update' | 'delete' | 'publish' | 'unpublish') | StringFilterOperators;
    versionNumber?: number | NumberFilterOperators;
    actorType?: ('admin' | 'user' | 'guest' | 'system') | StringFilterOperators;
    actorId?: number | NumberFilterOperators;
    actorDisplayName?: string | StringFilterOperators;
    actorEmail?: string | StringFilterOperators;
    changedFields?: any;
    snapshot?: any;
    metadata?: any;
}
/** Type-safe filters for DownloadItem */
export interface DownloadItemFilters extends LogicalOperators<DownloadItemFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    url?: string | StringFilterOperators;
    fileType?: ('pdf' | 'mp3' | 'mp4' | 'zip' | 'doc' | 'epub' | 'html' | 'unknown') | StringFilterOperators;
    category?: ('Kinh Điển' | 'Khai Thị Audio' | 'Khai Thị Video' | 'Sách' | 'Pháp Hội' | 'Hướng Dẫn' | 'Khác') | StringFilterOperators;
    groupYear?: number | NumberFilterOperators;
    groupLabel?: string | StringFilterOperators;
    notes?: string | StringFilterOperators;
    isUpdating?: boolean | BooleanFilterOperators;
    isNew?: boolean | BooleanFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    fileSizeMB?: number | NumberFilterOperators;
    thumbnail?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for Event */
export interface EventFilters extends LogicalOperators<EventFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    date?: string | DateFilterOperators;
    timeString?: string | StringFilterOperators;
    location?: string | StringFilterOperators;
    type?: ('dharma-talk' | 'webinar' | 'retreat' | 'liberation' | 'festival') | StringFilterOperators;
    eventStatus?: ('upcoming' | 'live' | 'past') | StringFilterOperators;
    speaker?: string | StringFilterOperators;
    language?: string | StringFilterOperators;
    link?: string | StringFilterOperators;
    youtubeId?: string | StringFilterOperators;
    oembed?: string | StringFilterOperators;
    coverImage?: { id?: number | IdFilterOperators; [key: string]: any };
    gallery?: { id?: number | IdFilterOperators; [key: string]: any };
    files?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for GalleryItem */
export interface GalleryItemFilters extends LogicalOperators<GalleryItemFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    quote?: string | StringFilterOperators;
    category?: ('Hoa Sen' | 'Kiến Trúc' | 'Nghi Lễ' | 'Pháp Hội' | 'Thiền Định' | 'Thiên Nhiên' | 'Kinh Sách' | 'Phật Tượng' | 'Khác') | StringFilterOperators;
    album?: string | StringFilterOperators;
    location?: string | StringFilterOperators;
    device?: string | StringFilterOperators;
    photographer?: string | StringFilterOperators;
    shotDate?: string | DateFilterOperators;
    featured?: boolean | BooleanFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    keywords?: string | StringFilterOperators;
    image?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for GuestbookEntry */
export interface GuestbookEntryFilters extends LogicalOperators<GuestbookEntryFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    authorName?: string | StringFilterOperators;
    country?: string | StringFilterOperators;
    message?: string | StringFilterOperators;
    adminReply?: string | StringFilterOperators;
    approvalStatus?: ('pending' | 'approved') | StringFilterOperators;
    isOfficialReply?: boolean | BooleanFilterOperators;
    badge?: string | StringFilterOperators;
    year?: number | NumberFilterOperators;
    month?: number | NumberFilterOperators;
    entryType?: ('message' | 'question') | StringFilterOperators;
    questionCategory?: string | StringFilterOperators;
    isAnswered?: boolean | BooleanFilterOperators;
    avatar?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for HeThongTest */
export interface HeThongTestFilters extends LogicalOperators<HeThongTestFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
}
/** Type-safe filters for HubPage */
export interface HubPageFilters extends LogicalOperators<HubPageFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    showInMenu?: boolean | BooleanFilterOperators;
    visualTheme?: ('teaching' | 'practice' | 'story' | 'reference') | StringFilterOperators;
    curated_posts?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    downloads?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    menuIcon?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    coverImage?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for LunarEvent */
export interface LunarEventFilters extends LogicalOperators<LunarEventFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    isRecurringLunar?: boolean | BooleanFilterOperators;
    lunarMonth?: number | NumberFilterOperators;
    lunarDay?: number | NumberFilterOperators;
    solarDate?: string | DateFilterOperators;
    eventType?: ('buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal') | StringFilterOperators;
    relatedBlogs?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for LunarEventChantOverride */
export interface LunarEventChantOverrideFilters extends LogicalOperators<LunarEventChantOverrideFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    mode?: ('enable' | 'disable' | 'override_target' | 'cap_max') | StringFilterOperators;
    target?: number | NumberFilterOperators;
    max?: number | NumberFilterOperators;
    priority?: number | NumberFilterOperators;
    note?: string | StringFilterOperators;
    lunarEvent?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    item?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for PracticeLog */
export interface PracticeLogFilters extends LogicalOperators<PracticeLogFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    date?: string | DateFilterOperators;
    itemsProgress?: any;
    startedAt?: string | DateFilterOperators;
    completedAt?: string | DateFilterOperators;
    isCompleted?: boolean | BooleanFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    plan?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for PushJob */
export interface PushJobFilters extends LogicalOperators<PushJobFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    kind?: ('daily_chant' | 'broadcast' | 'content_update' | 'event_reminder' | 'community') | StringFilterOperators;
    status?: ('pending' | 'processing' | 'completed' | 'failed') | StringFilterOperators;
    title?: string | StringFilterOperators;
    body?: string | StringFilterOperators;
    url?: string | StringFilterOperators;
    tag?: string | StringFilterOperators;
    payload?: any;
    cursor?: number | NumberFilterOperators;
    chunkSize?: number | NumberFilterOperators;
    targetedCount?: number | NumberFilterOperators;
    processedCount?: number | NumberFilterOperators;
    successCount?: number | NumberFilterOperators;
    failedCount?: number | NumberFilterOperators;
    invalidCount?: number | NumberFilterOperators;
    lastError?: string | StringFilterOperators;
    startedAt?: string | DateFilterOperators;
    finishedAt?: string | DateFilterOperators;
}
/** Type-safe filters for PushSubscription */
export interface PushSubscriptionFilters extends LogicalOperators<PushSubscriptionFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    endpoint?: string | StringFilterOperators;
    p256dh?: string | StringFilterOperators;
    auth?: string | StringFilterOperators;
    reminderHour?: number | NumberFilterOperators;
    reminderMinute?: number | NumberFilterOperators;
    timezone?: string | StringFilterOperators;
    isActive?: boolean | BooleanFilterOperators;
    lastSentAt?: string | DateFilterOperators;
    lastError?: string | StringFilterOperators;
    failedCount?: number | NumberFilterOperators;
    notificationTypes?: any;
    quietHoursStart?: number | NumberFilterOperators;
    quietHoursEnd?: number | NumberFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for RequestGuard */
export interface RequestGuardFilters extends LogicalOperators<RequestGuardFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    guardKey?: string | StringFilterOperators;
    scope?: string | StringFilterOperators;
    hits?: number | NumberFilterOperators;
    expiresAt?: string | DateFilterOperators;
    lastSeenAt?: string | DateFilterOperators;
    notes?: any;
}
/** Type-safe filters for Setting */
export interface SettingFilters extends LogicalOperators<SettingFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    siteTitle?: string | StringFilterOperators;
    siteDescription?: string | StringFilterOperators;
    socialLinks?: any;
    contactEmail?: string | StringFilterOperators;
    contactPhone?: string | StringFilterOperators;
    address?: string | StringFilterOperators;
    logo?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for SidebarConfig */
export interface SidebarConfigFilters extends LogicalOperators<SidebarConfigFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    showSearch?: boolean | BooleanFilterOperators;
    showCategoryTree?: boolean | BooleanFilterOperators;
    showArchive?: boolean | BooleanFilterOperators;
    showLatestComments?: boolean | BooleanFilterOperators;
    showDownloadLinks?: boolean | BooleanFilterOperators;
    qrImages?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for Sutra */
export interface SutraFilters extends LogicalOperators<SutraFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    description?: string | StringFilterOperators;
    shortExcerpt?: string | StringFilterOperators;
    translatorHan?: string | StringFilterOperators;
    translatorViet?: string | StringFilterOperators;
    reviewer?: string | StringFilterOperators;
    isFeatured?: boolean | BooleanFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    tags?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    volumes?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    glossaries?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    coverImage?: { id?: number | IdFilterOperators; [key: string]: any };
}
/** Type-safe filters for SutraBookmark */
export interface SutraBookmarkFilters extends LogicalOperators<SutraBookmarkFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    anchorKey?: string | StringFilterOperators;
    charOffset?: number | NumberFilterOperators;
    excerpt?: string | StringFilterOperators;
    note?: string | StringFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    sutra?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    volume?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    chapter?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for SutraChapter */
export interface SutraChapterFilters extends LogicalOperators<SutraChapterFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    chapterNumber?: number | NumberFilterOperators;
    openingText?: string | StringFilterOperators;
    content?: string | StringFilterOperators;
    endingText?: string | StringFilterOperators;
    estimatedReadMinutes?: number | NumberFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    sutra?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    volume?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    glossaries?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for SutraGlossary */
export interface SutraGlossaryFilters extends LogicalOperators<SutraGlossaryFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    markerKey?: string | StringFilterOperators;
    term?: string | StringFilterOperators;
    meaning?: string | StringFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    sutra?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    volume?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    chapter?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for SutraReadingProgress */
export interface SutraReadingProgressFilters extends LogicalOperators<SutraReadingProgressFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    anchorKey?: string | StringFilterOperators;
    charOffset?: number | NumberFilterOperators;
    scrollPercent?: number | NumberFilterOperators;
    lastReadAt?: string | DateFilterOperators;
    user?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    sutra?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    volume?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    chapter?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for SutraVolume */
export interface SutraVolumeFilters extends LogicalOperators<SutraVolumeFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    title?: string | StringFilterOperators;
    slug?: string | StringFilterOperators;
    volumeNumber?: number | NumberFilterOperators;
    bookStart?: number | NumberFilterOperators;
    bookEnd?: number | NumberFilterOperators;
    description?: string | StringFilterOperators;
    sortOrder?: number | NumberFilterOperators;
    sutra?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
    chapters?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}
/** Type-safe filters for UiIcon */
export interface UiIconFilters extends LogicalOperators<UiIconFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    name?: string | StringFilterOperators;
    key?: string | StringFilterOperators;
    lucideName?: string | StringFilterOperators;
    category?: ('general' | 'social' | 'navigation' | 'content' | 'practice') | StringFilterOperators;
    notes?: string | StringFilterOperators;
    isActive?: boolean | BooleanFilterOperators;
    sortOrder?: number | NumberFilterOperators;
}
/** Type-safe filters for User */
export interface UserFilters extends LogicalOperators<UserFilters> {
    id?: number | IdFilterOperators;
    documentId?: string | StringFilterOperators;
    username?: string | StringFilterOperators;
    email?: string | StringFilterOperators;
    provider?: string | StringFilterOperators;
    password?: string | StringFilterOperators;
    resetPasswordToken?: string | StringFilterOperators;
    confirmationToken?: string | StringFilterOperators;
    confirmed?: boolean | BooleanFilterOperators;
    blocked?: boolean | BooleanFilterOperators;
    role?: { id?: number | IdFilterOperators; documentId?: string | StringFilterOperators; [key: string]: any };
}




































