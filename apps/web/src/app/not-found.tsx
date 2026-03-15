import Link from "next/link";
import HeaderServer from "@/components/HeaderServer";
import Footer from "@/components/Footer";
import StickyBanner from "@/components/StickyBanner";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderServer />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="mb-4 text-6xl font-display text-gold">404</h1>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Không Tìm Thấy Trang</h2>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không truy cập được.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold text-background font-semibold hover:bg-gold/90 transition-colors"
          >
            Quay Về Trang Chủ
          </Link>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  );
}
