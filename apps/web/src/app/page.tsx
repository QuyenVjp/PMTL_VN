// ─────────────────────────────────────────────────────────────
//  app/page.tsx — Server Component
//  Fetch dữ liệu động từ Strapi CMS → truyền props vào các section
// ─────────────────────────────────────────────────────────────

import HeaderServer from "@/components/HeaderServer";
import HeroSection from "@/components/HeroSection";
import PhaoBaoSection from "@/components/PhaoBaoSection";
import ActionCards from "@/components/ActionCards";
import AboutSection from "@/components/AboutSection";
import AwardsSection from "@/components/AwardsSection";
import HallGallery from "@/components/HallGallery";
import VideoSection from "@/components/VideoSection";
import ContentFeeds from "@/components/ContentFeeds";
import NewsletterSignup from "@/components/NewsletterSignup";
import Footer from "@/components/Footer";
import StickyBanner from "@/components/StickyBanner";

import {
  getHomepageSettings,
  FALLBACK_HERO_SLIDES,
  FALLBACK_STATS,
  FALLBACK_PHAP_BAO,
  FALLBACK_ACTION_CARDS,
  FALLBACK_VIDEOS,
  FALLBACK_AWARDS,
  FALLBACK_GALLERY,
  FALLBACK_STICKY_BANNER,
} from "@/lib/api/homepage";

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pháp Môn Tâm Linh — Trang Chủ | Hộ Trì Phật Pháp',
  description: 'Trung tâm chia sẻ lời khai thị, hướng dẫn tu tập niệm kinh, phóng sinh và các hoạt động Phật sự theo truyền bá của Sư Phụ Lư Quân Hoành. Hành trình tìm về sự thanh tịnh và giải thoát.',
  keywords: ['Pháp Môn Tâm Linh', 'Niệm Kinh', 'Sư Phụ Lư Quân Hoành', 'Bạch Thoại Phật Pháp', 'Khai Thị'],
  openGraph: {
    title: 'Pháp Môn Tâm Linh — Trang Chủ | Hộ Trì Phật Pháp',
    description: 'Trung tâm chia sẻ lời khai thị, hướng dẫn tu tập niệm kinh và các hoạt động Phật sự.',
    url: 'https://phapmontamlinh.vn',
    siteName: 'Pháp Môn Tâm Linh',
    images: [
      {
        url: '/images/PMTL-LOGO.png',
        width: 1200,
        height: 630,
        alt: 'Pháp Môn Tâm Linh Logo',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pháp Môn Tâm Linh — Trang Chủ',
    description: 'Trung tâm chia sẻ lời khai thị và hướng dẫn tu tập Phật pháp.',
    images: ['/images/PMTL-LOGO.png'],
  },
}


export default async function HomePage() {
  // Fetch dữ liệu trang chủ từ CMS — fallback nếu CMS chưa có data
  const settings = await getHomepageSettings()

  const heroSlides = settings?.heroSlides ?? FALLBACK_HERO_SLIDES
  const stats = settings?.stats ?? FALLBACK_STATS
  const phapBao = settings?.phapBao ?? FALLBACK_PHAP_BAO
  const actionCards = settings?.actionCards ?? FALLBACK_ACTION_CARDS
  const featuredVideos = settings?.featuredVideos ?? FALLBACK_VIDEOS
  const awards = settings?.awards ?? FALLBACK_AWARDS
  const gallerySlides = settings?.gallerySlides ?? FALLBACK_GALLERY
  const stickyBanner = settings?.stickyBanner ?? FALLBACK_STICKY_BANNER

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main>
        {/* Hero slideshow 3 ảnh */}
        <HeroSection slides={heroSlides} stats={stats} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* 5 Đại Pháp Bảo */}
        <PhaoBaoSection items={phapBao} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* 3 card hành động nhanh */}
        <ActionCards cards={actionCards} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* Giới thiệu Pháp Môn & Đài Trưởng */}
        <AboutSection />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* Giải thưởng & vinh danh quốc tế */}
        <AwardsSection awards={awards} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* Slideshow hội trường trang nghiêm */}
        <HallGallery slides={gallerySlides} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* 3 Video giới thiệu quan trọng */}
        <VideoSection videos={featuredVideos} />
        <div className="zen-divider max-w-xs mx-auto" />

        {/* Khai thị mới nhất & Chuyện Phật Pháp */}
        <ContentFeeds />
        <div className="zen-divider max-w-xs mx-auto" />



        {/* Bản tin Phật pháp */}
        <NewsletterSignup />
      </main>
      <Footer />
      <StickyBanner config={stickyBanner} />
    </div>
  );
}
