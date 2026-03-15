'use client'

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import type { GallerySlide } from "@/types/strapi"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface HallGalleryProps {
  slides: GallerySlide[]
}

export default function HallGallery({ slides }: HallGalleryProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <section className="relative overflow-hidden bg-secondary/10">
      <div className="container mx-auto px-6 ">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
            Đạo Tràng Không Khoảng Cách
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            Chiêm Ngưỡng <span className="gold-gradient-text tracking-tight">Pháp Hội</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Tận mắt chiêm ngưỡng những thước ảnh tuyệt đẹp tại các buổi pháp hội và đạo tràng lớn nhỏ. Phật tử đồng tâm, chung tay hướng thiện.
          </p>
        </div>

        {/* Shadcn Carousel */}
        <div className="relative group/carousel  mx-auto">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {/* Carousel Items */}
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-border shadow-xl aspect-[4/3] sm:aspect-[16/9] isolation-auto">
                    <Image
                      src={slide.src}
                      alt={slide.caption}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 80vw"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                    />

                    {/* Dark gradient overlay for text specifically */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Text wrapper */}
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12">
                      <p className="text-xs md:text-sm text-gold tracking-wider uppercase mb-2 md:mb-3 font-semibold drop-shadow-md">
                        {slide.subcap}
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl md:text-4xl text-white leading-snug drop-shadow-lg max-w-3xl">
                        {slide.caption}
                      </h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom styled Next/Prev buttons */}
            <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
              <CarouselPrevious className="-left-6 lg:-left-12 xl:h-12 xl:w-12 bg-background/80 hover:bg-gold hover:text-black border-border/50 backdrop-blur-md shadow-md" />
              <CarouselNext className="-right-6 lg:-right-12 xl:h-12 xl:w-12 bg-background/80 hover:bg-gold hover:text-black border-border/50 backdrop-blur-md shadow-md" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
