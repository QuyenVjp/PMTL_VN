'use client'

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "@/components/icons/ZenIcons";
import type { HeroSlide, StatItem } from "@/types/strapi";

interface HeroSectionProps {
  slides: HeroSlide[];
  stats: StatItem[];
}

export default function HeroSection({ slides, stats }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (!hasSlides) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [hasSlides, slides.length]);

  if (!hasSlides) return null;

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-background text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt="Pháp Môn Tâm Linh"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,12,7,0.46)_0%,rgba(19,12,7,0.72)_42%,rgba(19,12,7,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,208,56,0.18),transparent_28%)]" />

          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(16,11,7,0.38)_45%,rgba(16,11,7,0.74)_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative container mx-auto px-5 pb-10 pt-24 md:px-6 md:pb-16 md:pt-32 lg:pt-36">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-glass-panel inline-flex items-center gap-3 px-4 py-2"
          >
            <span className="size-2 rounded-full bg-white/70" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/82">
              心灵法门 · Pháp Môn Tâm Linh
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="mt-7 space-y-5 md:mt-8 md:space-y-6"
            >
              <h1 className="max-w-4xl ant-title text-[clamp(3.1rem,8vw,6rem)] leading-[0.96] tracking-[-0.03em] text-white">
                <span className="block text-balance">{slide.title}</span>
                <span className="mt-1.5 block text-balance text-gold md:mt-2">{slide.highlight}</span>
              </h1>
              <div className="h-px w-20 bg-gradient-to-r from-white/60 to-transparent md:w-24" />
              <p className="max-w-3xl font-body text-[1.05rem] leading-relaxed text-white/76 md:text-xl">
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-3 md:mt-10 md:gap-4">
            <Link
              href="/search"
              className="hero-glass-panel group flex w-full max-w-3xl items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:border-white/22 hover:bg-black/30 md:px-5"
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-white/58 transition-colors group-hover:text-white/74" />
              <span className="flex-1 text-left text-sm leading-relaxed text-white/72 md:text-base">
                Tìm kinh văn, khai thị, pháp bảo hoặc chủ đề tu học
              </span>
              <span className="shrink-0 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-transform duration-200 group-hover:translate-x-0.5 md:px-6">
                Tra cứu
              </span>
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/beginner-guide" className="hero-glass-panel inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white/88 transition-colors duration-200 hover:border-white/24 hover:text-white">
                Hướng dẫn sơ học
              </Link>
              <Link href="/library" className="inline-flex items-center justify-center rounded-md border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-white/70 transition-colors duration-200 hover:border-white/24 hover:text-white">
                Thư viện pháp bảo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:max-w-5xl lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 + index * 0.08 }}
              className="hero-stat-panel p-5"
            >
              <p className="ant-label text-white/54">{stat.label}</p>
              <p className="ant-number mt-3 text-[2rem] leading-none text-white md:text-[2.4rem]">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-6 lg:left-auto lg:right-6 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col lg:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={[
              "pointer-events-auto rounded-full border transition-all duration-300",
              index === current
                ? "h-2.5 w-7 border-gold/80 bg-gold/90 lg:h-11 lg:w-2"
                : "h-2.5 w-2.5 border-white/20 bg-white/25 hover:bg-white/45",
            ].join(" ")}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
