import HeaderServer from "@/components/HeaderServer";
import Footer from "@/components/Footer";
import StickyBanner from "@/components/StickyBanner";
import EventsClient from "./EventsClient";
import { fetchEvents } from "@/lib/api/event";

export const revalidate = 3600; // ISR cache

export const metadata = {
  title: "Sự Kiện & Pháp Hội - Pháp Môn Tâm Linh",
  description: "Cập nhật các sự kiện, pháp hội, phóng sinh, khóa tu tập mới nhất tại Việt Nam.",
};

export default async function EventsPage() {
  const { data: initialEvents } = await fetchEvents();

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <EventsClient initialEvents={initialEvents || []} />
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  );
}
