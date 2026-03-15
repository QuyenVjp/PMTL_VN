// ─────────────────────────────────────────────────────────────
//  lib/api/homepage.ts — Homepage Dynamic Content API
//  Server-side only — fetch settings from Strapi v5
// ─────────────────────────────────────────────────────────────

import { strapiFetch, getStrapiMediaUrl } from '@/lib/strapi'
import type {
  StrapiSingle,
  SiteSetting,
  HeroSlide,
  StatItem,
  PhapBaoItem,
  ActionCardItem,
  VideoItem,
  AwardItem,
  GallerySlide,
  StickyBannerConfig,
} from '@/types/strapi'

/**
 * Fetch toàn bộ cài đặt trang chủ từ Strapi (Single Type: setting)
 * Dùng documentId cho Strapi v5
 */
export async function getHomepageSettings(): Promise<SiteSetting | null> {
  try {
    const res = await strapiFetch<StrapiSingle<SiteSetting>>('/setting', {
      populate: [
        'logo',
        'heroSlides',
        'heroSlides.image',
        'stats',
        'phapBao',
        'actionCards',
        'featuredVideos',
        'awards',
        'gallerySlides',
        'gallerySlides.image',
        'stickyBanner'
      ],
      next: { revalidate: 300, tags: ['homepage-settings'] },
    })
    if (res.data) {
      if (res.data.heroSlides) {
        res.data.heroSlides = res.data.heroSlides.map((slide: any) => ({
          ...slide,
          src: getStrapiMediaUrl(slide.image?.url) ?? slide.src ?? '/images/hero-bg.jpg',
        }))
      }
      if (res.data.gallerySlides) {
        res.data.gallerySlides = res.data.gallerySlides.map((slide: any) => ({
          ...slide,
          src: getStrapiMediaUrl(slide.image?.url) ?? slide.src ?? '/images/hero-bg.jpg',
        }))
      }
      if (res.data.featuredVideos) {
        res.data.featuredVideos = res.data.featuredVideos.map((video: any) => ({
          id: video.videoId || video.id || '',
          title: video.title || '',
          subtitle: video.subtitle || '',
          description: video.description || '',
          youtubeId: video.youtubeId || '',
          duration: video.duration || '00:00',
          category: video.category || 'Video',
        }))
      }
      if (res.data.phapBao) {
        res.data.phapBao = res.data.phapBao.map((item: any) => ({
          ...item,
          link: item.link || '#',
        }))
      }
      if (res.data.actionCards) {
        res.data.actionCards = res.data.actionCards.map((item: any) => ({
          ...item,
          link: item.link || '#',
        }))
      }

      if (res.data.stickyBanner) {
        res.data.stickyBanner.buttonLink = res.data.stickyBanner.buttonLink || '#';
      }
    }
    return res.data ?? null
  } catch (err) {
    console.error('[Homepage] Failed to fetch settings:', err)
    return null
  }
}

// ─── Fallback Data (Dùng khi Strapi chưa có dữ liệu) ──────

export const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/banner.jfif",
    title: "Tâm Tịnh Thì",
    highlight: "Cõi Phật Hiện Tiền",
    sub: "Khai thị Phật pháp ứng dụng trong đời sống, hóa giải phiền não, vun bồi phước đức cho bản thân và gia đình.",
  },
  {
    src: "/images/slide2.jpg",
    title: "Pháp Hội Trang Nghiêm",
    highlight: "Hàng Nghìn Đồng Tu",
    sub: "Cùng nhau niệm Kinh, sám hối, phóng sinh — gắn kết cộng đồng tu học trên toàn thế giới.",
  },
  {
    src: "/images/hero-bg.jpg",
    title: "Gieo Duyên Bồ Tát",
    highlight: "Đồng Đăng Cực Lạc",
    sub: "Nguyện rằng chúng sinh hữu duyên lên được thuyền cứu độ của Quán Thế Âm Bồ Tát, thoát khổ an vui.",
  },
]

export const FALLBACK_STATS: StatItem[] = [
  { value: "50+", label: "Quốc Gia Hoằng Pháp", detail: "Lan toả giáo Pháp toàn cầu" },
  { value: "20+", label: "Năm Khai Thị", detail: "Hành trình cứu độ chúng sinh" },
  { value: "Miễn Phí", label: "Pháp Bảo & Kinh Văn", detail: "Gieo duyên Bồ Tát không cầu báo đáp" },
]

export const FALLBACK_PHAP_BAO: PhapBaoItem[] = [
  { id: "niem-kinh", title: "Niệm Kinh", chinese: "念经", color: "from-amber-500/20 to-amber-600/10", borderColor: "hover:border-amber-500/50", description: "Ba trụ cột: Chú Đại Bi, Tâm Kinh và Lễ Phật Đại Sám Hối Văn.", link: "/library", icon: null, iconType: "book" },
  { id: "phat-nguyen", title: "Phát Nguyện", chinese: "许愿", color: "from-purple-500/20 to-purple-600/10", borderColor: "hover:border-purple-500/50", description: "Nguyện thành tâm dâng lên Bồ Tát, nhận được gia trì và bảo hộ.", link: "/hub/bach-thoai-phat-phap", icon: null, iconType: "star" },
  { id: "phong-sinh", title: "Phóng Sinh", chinese: "放生", color: "from-emerald-500/20 to-emerald-600/10", borderColor: "hover:border-emerald-500/50", description: "Giải cứu sinh linh, tích đức hồi hướng, tiêu trừ nghiệp chướng.", link: "/blog", icon: null, iconType: "leaf" },
  { id: "sam-hoi", title: "Đại Sám Hối", chinese: "忏悔", color: "from-rose-500/20 to-rose-600/10", borderColor: "hover:border-rose-500/50", description: "Thành tâm sám hối nghiệp chướng từ vô thỉ kiếp, tịnh hóa ba nghiệp.", link: "/library", icon: null, iconType: "flame" },
  { id: "ngoi-nha-nho", title: "Ngôi Nhà Nhỏ", chinese: "小房子", color: "from-sky-500/20 to-sky-600/10", borderColor: "hover:border-sky-500/50", description: "Siêu độ vong linh, hóa giải oán kết, trả nợ oan gia trái chủ.", link: "/hub/thuong-thuc-niem-phat", icon: null, iconType: "house" },
]

export const FALLBACK_ACTION_CARDS: ActionCardItem[] = [
  { icon: null, iconType: "book", title: "Thư Viện Tài Liệu", description: "Hướng dẫn từng bước cho người mới, từ niệm Phật đến công khóa hàng ngày.", link: "/library" },
  { icon: null, iconType: "compass", title: "Tra cứu Khai thị", description: "Tìm lời khai thị phù hợp với hoàn cảnh của bạn từ kho tàng Phật pháp.", link: "/search" },
  { icon: null, iconType: "users", title: "Hỏi Đáp & Lưu Bút", description: "Giao lưu tu học, giải đáp thắc mắc và chia sẻ cảm nhận từ các thiện hữu.", link: "/guestbook" },
]

export const FALLBACK_VIDEOS: VideoItem[] = [
  { id: "intro", title: "Giới Thiệu Pháp Môn Tâm Linh", subtitle: "心灵法门 介绍", description: "Tổng quan về 5 Đại Pháp Bảo và con đường tu tập theo Quán Thế Âm Bồ Tát truyền thụ.", youtubeId: "I__6Zi4xlIQ", duration: "12:35", category: "Giới Thiệu" },
  { id: "master-life", title: "Sơ Lược Cuộc Đời Sư Phụ Lư Quân Hoành", subtitle: "卢军宏台长生平简介", description: "Hành trình từ người cư sĩ bình thường đến vị Đài Trưởng được Quán Âm Bồ Tát khai thị.", youtubeId: "6-0etr8-QhA", duration: "18:20", category: "Về Sư Phụ" },
  { id: "impermanence", title: "Nhân Sinh Một Kiếp Vô Thường", subtitle: "人生一世无常", description: "Nguyện rằng chúng sinh hữu duyên lên được thuyền cứu độ của Quán Thế Âm Bồ Tát, thoát khổ an vui.", youtubeId: "dwtoP8WGKb4", duration: "25:10", category: "Khai Thị" },
]

export const FALLBACK_AWARDS: AwardItem[] = [
  { year: "2014", title: "Giải Peace & Philanthropy Award", org: "House of Lords, UK Parliament", description: "Vinh danh đóng góp cho hòa bình và từ thiện quốc tế." },
  { year: "2013", title: "World Peace Award", org: "Simon Wiesenthal Centre — Museum of Tolerance", description: "Giải thưởng Hòa bình Thế giới tại Los Angeles, Hoa Kỳ." },
  { year: "2015", title: "Certificate of Appreciation", org: "United Nations — UNESCO", description: "Chứng nhận đóng góp cho văn hóa, giáo dục và hòa bình." },
  { year: "2012", title: "Community Service Excellence", org: "Liên đoàn Phật giáo Úc", description: "Vinh danh hoạt động phục vụ cộng đồng Phật tử tại Australia." },
]

export const FALLBACK_GALLERY: GallerySlide[] = [
  { src: "/images/slide2.jpg", caption: "Pháp hội trang nghiêm — Hàng nghìn đồng tu quy tụ", subcap: "Quán Âm Đường toàn cầu" },
  { src: "/images/banner.jfif", caption: "Đạo tràng thanh tịnh — Niệm Kinh hồi hướng", subcap: "Tâm tịnh thì cõi Phật hiện tiền" },
  { src: "/images/hero-bg.jpg", caption: "Gieo duyên Phật pháp — Lan tỏa ánh sáng trí tuệ", subcap: "Cùng nhau lên Tứ Thánh" },
]



export const FALLBACK_STICKY_BANNER: StickyBannerConfig = {
  title: "Thỉnh Kinh Văn & Máy Niệm Kinh Miễn Phí",
  subtitle: "Gieo duyên miễn phí: Máy niệm kinh, Tranh Phật, Kinh văn",
  buttonText: "Đăng ký ngay",
  buttonLink: "/register",
  enabled: true,
}
