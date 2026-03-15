'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { VideoItem } from "@/types/strapi";

interface VideoSectionProps {
  videos: VideoItem[]
}

const VideoSection = ({ videos }: VideoSectionProps) => {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Video Khai Thị</p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Giới Thiệu <span className="gold-gradient-text">Pháp Môn</span>
          </h2>
          <div className="zen-divider w-24 mx-auto mb-4" />
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Những video quan trọng nhất để hiểu về Pháp Môn Tâm Linh và con đường tu tập theo lời Quán Thế Âm truyền dạy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((vid, i) => (
            <motion.div
              key={vid.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden border border-border bg-card hover:border-gold/30 transition-all duration-300 hover:shadow-gold">
                {/* Thumbnail / Player */}
                <div
                  className="relative aspect-video bg-zinc-900 cursor-pointer overflow-hidden"
                  onClick={() => setPlaying(vid.id)}
                >
                  {playing === vid.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.youtubeId}?autoplay=1&rel=0`}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  ) : (
                    <>
                      <Image
                        src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                        alt={vid.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                        >
                          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
                        {vid.duration}
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold/80 text-[10px] text-black font-medium">
                        {vid.category}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs text-gold/70 mb-1 font-medium">{vid.subtitle}</p>
                  <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors leading-snug mb-2">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{vid.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Xem thêm YouTube */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-gold/40 text-sm text-muted-foreground hover:text-gold transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
            </svg>
            Xem thêm trên YouTube Pháp Môn Tâm Linh
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
