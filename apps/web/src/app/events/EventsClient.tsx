'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Clock, Calendar, ChevronRight, PlayCircle
} from "lucide-react";
import type { StrapiEvent } from "@/types/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, { label: string }> = {
  "dharma-talk": { label: "Pháp Hội" },
  "webinar": { label: "Trực Tuyến" },
  "retreat": { label: "Khóa Tu" },
  "liberation": { label: "Phóng Sinh" },
  "festival": { label: "Lễ Hội" },
};

export default function EventsClient({ initialEvents }: { initialEvents: StrapiEvent[] }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filtered = initialEvents.filter((e) => {
    if (filter === "upcoming" && e.eventStatus !== "upcoming" && e.eventStatus !== "live") return false;
    if (filter === "past" && e.eventStatus !== "past") return false;
    return true;
  });

  const upcomingEvents = filtered.filter(e => e.eventStatus === "upcoming" || e.eventStatus === "live");
  const pastEvents = filtered.filter(e => e.eventStatus === "past");

  const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const otherUpcoming = upcomingEvents.slice(1);

  return (
    <>
      <div className="mb-12 flex flex-col items-center text-center md:mb-14">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">Thư Mời & Nơi Hội Tụ</p>
        <h1 className="mb-4 font-display text-4xl text-foreground md:text-5xl">Pháp Hội & Sự Kiện</h1>
        <p className="mx-auto max-w-2xl text-lg italic leading-relaxed text-muted-foreground">
          "Cùng nhau tu học, cùng nhau tinh tấn trên con đường giác ngộ."
        </p>
      </div>

      <div className="mb-12 flex justify-center">
        <div className="inline-flex overflow-hidden rounded-xl border border-border bg-card p-1">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-6 py-2 text-xs font-medium uppercase tracking-widest transition-all",
                filter === f
                  ? "bg-gold text-black"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {f === "all" ? "Toàn bộ" : f === "upcoming" ? "Sắp diễn ra" : "Đã khép lại"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-24">
        {/* Featured Upcoming Event */}
        <AnimatePresence mode="wait">
          {featuredEvent && (
            <motion.section
              key="featured"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-gold/20" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Tâm Điểm Sắp Tới</span>
                <span className="h-px flex-1 bg-gold/20" />
              </div>

              <Link
                href={`/events/${featuredEvent.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-gold/25 hover:shadow-ant"
              >
                <div className="flex min-h-[360px] flex-col lg:h-[440px] lg:flex-row">
                  {/* Info Panel */}
                  <div className="lg:w-1/2 p-8 md:p-14 flex flex-col relative z-10 bg-card">
                    {/* Date Ribbon */}
                    {featuredEvent.date && (
                      <div className="absolute right-8 top-0 flex h-20 w-16 flex-col items-center justify-center rounded-b-xl border-x border-b border-gold/20 bg-gold/10">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">TH.{new Date(featuredEvent.date).getMonth() + 1}</span>
                        <span className="ant-number mt-1 text-2xl leading-none text-foreground">{new Date(featuredEvent.date).getDate()}</span>
                      </div>
                    )}

                    <div className="mb-auto">
                      <div className="flex items-center gap-3 mb-6">
                        {featuredEvent.eventStatus === 'live' && (
                          <span className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-500">
                            <span className="h-1.5 w-1.5 rounded-sm bg-red-500 animate-pulse" /> Đang phát
                          </span>
                        )}
                          <span className="rounded-md border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                            {typeLabels[featuredEvent.type]?.label || "Sự Kiện"}
                          </span>
                      </div>

                      <h2 className="ant-title mb-4 text-3xl leading-tight text-foreground transition-colors duration-500 group-hover:text-gold md:text-4xl">
                        {featuredEvent.title}
                      </h2>
                      <p className="max-w-md border-l-2 border-gold/20 pl-4 text-base italic leading-relaxed text-muted-foreground/80">
                        {featuredEvent.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-sm text-foreground/80">
                        <Clock className="w-4 h-4 text-gold/60" />
                        <span>{featuredEvent.timeString || 'Đang cập nhật thời gian'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/80">
                        <MapPin className="w-4 h-4 text-gold/60" />
                        <span>{featuredEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Image Cover */}
                  <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden bg-muted">
                    {featuredEvent.coverImage ? (
                      <Image
                        src={getStrapiMediaUrl(featuredEvent.coverImage.url) ?? ''}
                        alt={featuredEvent.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-zen-surface">
                        <span className="ant-title text-4xl text-gold/20">PMTL</span>
                      </div>
                    )}
                    {/* Gradient Overlay for seamless blend on mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/85 via-card/10 to-transparent md:bg-gradient-to-r lg:w-1/3" />
                  </div>
                </div>
              </Link>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Other Upcoming Events */}
        {otherUpcoming.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherUpcoming.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-gold/25 hover:shadow-ant"
                  >
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-baseline gap-4 mb-6">
                        <div className="text-center">
                          <span className="ant-number block text-3xl text-gold transition-transform group-hover:scale-105">
                            {event.date ? new Date(event.date).getDate() : '--'}
                          </span>
                          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {event.date ? `Tháng ${new Date(event.date).getMonth() + 1}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
                            {typeLabels[event.type]?.label || "Sự kiện"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {event.timeString || 'Cập nhật sau'}
                          </span>
                        </div>
                      </div>

                      <h3 className="ant-title mb-4 text-xl leading-snug text-foreground transition-colors group-hover:text-gold md:text-[1.75rem]">
                        {event.title}
                      </h3>

                      <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5 truncate pr-4">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{event.location}</span>
                        </span>
                        <ChevronRight className="w-5 h-5 text-gold/30 group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Past Events Archive */}
        {pastEvents.length > 0 && (
          <section className="pt-12 border-t border-border">
            <div className="flex items-center gap-3 mb-8">
              <span className="size-2 rounded-sm bg-border" />
              <h2 className="ant-title text-2xl text-muted-foreground">Lưu Trữ Sự Kiện</h2>
            </div>

            <div className="flex flex-col gap-4">
              {pastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 md:p-6 rounded-xl border border-transparent bg-secondary/30 hover:bg-card hover:border-border hover:shadow-sm transition-all"
                >
                  <div className="w-full sm:w-48 shrink-0 flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                    {event.date ? new Date(event.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Không rõ ngày'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-base md:text-lg font-medium text-foreground/80 group-hover:text-gold transition-colors truncate">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
                    {event.youtubeId && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                        <PlayCircle className="w-3 h-3" /> Video
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60 group-hover:text-gold transition-colors uppercase tracking-widest font-semibold flex items-center gap-1">
                      Xem lại <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-24 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-background shadow-sm">
              <Calendar className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-base max-w-sm mx-auto italic">
              Hiện tại không có sự kiện nào trong danh mục này.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
