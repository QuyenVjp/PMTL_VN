'use client'
// ─────────────────────────────────────────────────────────────
//  components/CategoryNav.tsx
//  Mega Menu "Chủ Đề Khai Thị" — thiết kế theo phong cách Zen
//  của dự án: nền kem ngà, viền vàng nhẹ, typography trang trọng
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ShieldCheck, HeartPulse, Users, Sparkles, Moon, Scroll,
  BookOpen, ArrowRight, Zap, Leaf, Compass, Award, ChevronRight
} from 'lucide-react'
import { getCategoryTreeClient } from '@/lib/api/categories-client'
import type { CategoryTree } from '@/types/strapi'

// ── Map biểu tượng theo slug/tên ─────────────────────────────
function layBieuTuong(ten: string, slug: string) {
  const t = ten.toLowerCase()
  const s = slug.toLowerCase()
  if (s.includes('phap-bao') || t.includes('pháp bảo')) return ShieldCheck
  if (s.includes('suc-khoe') || t.includes('sức khỏe') || t.includes('bệnh')) return HeartPulse
  if (s.includes('hon-nhan') || t.includes('hôn nhân') || t.includes('vợ chồng')) return Users
  if (s.includes('phong-thuy') || t.includes('phong thủy')) return Sparkles
  if (s.includes('giac-mo') || t.includes('giấc mơ')) return Moon
  if (s.includes('an-chay') || t.includes('ăn chay')) return Leaf
  if (s.includes('niem-kinh') || t.includes('niệm kinh')) return Zap
  if (s.includes('su-nghiep') || t.includes('sự nghiệp')) return Compass
  if (s.includes('kien-thuc') || t.includes('kiến thức')) return BookOpen
  if (s.includes('le-phat') || t.includes('lễ phật')) return Award
  return Scroll
}

// ── Node con trong vùng nội dung bên phải ─────────────────────
const NutDanhMucCon = ({ nut, khiDiChuyen }: { nut: CategoryTree, khiDiChuyen: () => void }) => {
  const coCon = nut.children.length > 0

  return (
    <div className="flex flex-col">
      <Link
        href={`/category/${nut.slug}`}
        onClick={khiDiChuyen}
        className="group flex flex-col"
      >
        <span className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors flex items-center gap-1.5">
          {nut.name}
          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gold" />
        </span>
        {nut.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">
            {nut.description}
          </p>
        )}
      </Link>

      {coCon && (
        <ul className="mt-2 ml-0.5 pl-3 border-l border-gold/15 space-y-1.5">
          {nut.children.map((con) => (
            <li key={con.id}>
              <Link
                href={`/category/${con.slug}`}
                onClick={khiDiChuyen}
                className="text-xs text-muted-foreground hover:text-gold transition-colors block font-medium"
              >
                {con.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Component chính: Mega Menu Desktop ────────────────────────
export default function CategoryNav({ onClose }: { onClose?: () => void }) {
  const [cay, setCay] = useState<CategoryTree[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState<string | null>(null)
  const [idGocDangChon, setIdGocDangChon] = useState<number | null>(null)

  useEffect(() => {
    const taiDanhMuc = async () => {
      try {
        const cayDaXay = await getCategoryTreeClient()
        if (!cayDaXay || cayDaXay.length === 0) {
          setLoi('Chưa có khai thị nào được cấu hình')
        } else {
          setCay(cayDaXay)
          if (cayDaXay.length > 0) setIdGocDangChon(cayDaXay[0].id)
          setLoi(null)
        }
      } catch (err) {
        console.error('[DanhMuc] Lỗi tải:', err)
        setLoi('Không thể tải danh sách khai thị')
      } finally {
        setDangTai(false)
      }
    }
    taiDanhMuc()
  }, [])

  const nutGocDangChon = useMemo(() => cay.find(r => r.id === idGocDangChon), [cay, idGocDangChon])

  if (dangTai) return (
    <div className="p-12 flex items-center justify-center min-h-[360px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Đang tải khai thị...</p>
      </div>
    </div>
  )

  if (loi || cay.length === 0) return (
    <div className="p-12 text-center text-sm text-muted-foreground italic">
      {loi || 'Chưa có khai thị nào được cấu hình'}
    </div>
  )

  return (
    <div className="overflow-hidden bg-background">
      <div className="container mx-auto flex min-h-[400px] max-h-[560px]">

        {/* ── Cột trái: Danh sách chủ đề gốc ────────────────── */}
        <aside className="w-[280px] shrink-0 border-r border-border/50 overflow-y-auto custom-scrollbar bg-secondary/20 py-5 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 px-3 mb-3">
            Chủ Đề Khai Thị
          </p>
          <div className="space-y-0.5">
            {cay.map((goc) => {
              const BieuTuong = layBieuTuong(goc.name, goc.slug)
              const dangChon = idGocDangChon === goc.id
              return (
                <button
                  key={goc.id}
                  onMouseEnter={() => setIdGocDangChon(goc.id)}
                  onClick={() => setIdGocDangChon(goc.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 text-left group relative
                    ${dangChon
                      ? 'bg-gold/10 text-foreground border border-gold/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-gold/5 hover:text-foreground border border-transparent'
                    }
                  `}
                >
                  {/* Indicator sọc vàng bên trái */}
                  {dangChon && (
                    <motion.div
                      layoutId="vach-chon"
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gold"
                    />
                  )}
                  <div className={`
                    flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors
                    ${dangChon
                      ? 'bg-gold/20 text-gold'
                      : 'bg-secondary/80 text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold'
                    }
                  `}>
                    <BieuTuong className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className={`
                      block text-[12px] font-semibold uppercase tracking-wide leading-none truncate
                      ${dangChon ? 'text-foreground' : 'group-hover:text-foreground'}
                    `}>
                      {goc.name}
                    </span>
                    {goc.description && (
                      <span className={`block text-[10px] mt-0.5 truncate font-normal
                        ${dangChon ? 'text-muted-foreground' : 'text-muted-foreground/60'}
                      `}>
                        {goc.description}
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${dangChon ? 'text-gold opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Cột phải: Nội dung chủ đề đang chọn ────────────── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar py-6 px-8 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={idGocDangChon}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {nutGocDangChon && (
                <>
                  {/* Header chủ đề */}
                  <div className="flex items-start justify-between mb-6 pb-4 border-b border-border/60">
                    <div>
                      <h2 className="font-display text-xl text-foreground mb-1 flex items-center gap-2">
                        {nutGocDangChon.name}
                      </h2>
                      <p className="text-xs text-muted-foreground max-w-lg italic leading-relaxed">
                        {nutGocDangChon.description || `Khám phá các khai thị về chủ đề ${nutGocDangChon.name}.`}
                      </p>
                    </div>
                    <Link
                      href={`/category/${nutGocDangChon.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0 ml-4 px-4 py-1.5 rounded-full border border-gold/40 text-gold text-[11px] font-semibold uppercase tracking-wider hover:bg-gold hover:text-black transition-all"
                    >
                      Xem tất cả
                    </Link>
                  </div>

                  {/* Lưới danh mục con */}
                  {nutGocDangChon.children.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                      {nutGocDangChon.children.map((con) => (
                        <NutDanhMucCon
                          key={con.id}
                          nut={con}
                          khiDiChuyen={() => onClose?.()}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Scroll className="w-10 h-10 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground/50 italic">
                        Nội dung đang được ban biên tập tổng hợp...
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ── Node accordion cho Mobile ──────────────────────────────────
const NutMobileCodon = ({
  nut,
  tangSau = 0,
  khiDiChuyen,
}: {
  nut: CategoryTree
  tangSau?: number
  khiDiChuyen: () => void
}) => {
  const [moRong, setMoRong] = useState(false)
  const coCon = nut.children.length > 0
  const BieuTuong = layBieuTuong(nut.name, nut.slug)

  return (
    <div className="overflow-hidden">
      <div className={`flex items-center justify-between group transition-colors px-2 
        ${tangSau === 0 ? 'bg-secondary/30 rounded-xl mb-1' : 'ml-3 border-l border-gold/10'}`}
      >
        <Link
          href={`/category/${nut.slug}`}
          onClick={khiDiChuyen}
          className={`flex items-center gap-2.5 flex-1 py-3 px-2 hover:text-gold transition-all
            ${tangSau === 0 ? 'font-semibold text-foreground text-sm uppercase tracking-wide' : 'text-sm text-muted-foreground'}`}
        >
          {tangSau === 0 && <BieuTuong className="w-4 h-4 text-gold flex-shrink-0" />}
          <div className="flex flex-col">
            <span>{nut.name}</span>
            {nut.description && tangSau === 0 && (
              <span className="text-[10px] text-muted-foreground/60 italic leading-tight mt-0.5 font-normal">
                {nut.description}
              </span>
            )}
          </div>
        </Link>
        {coCon && (
          <button
            onClick={() => setMoRong(!moRong)}
            className="p-2 text-muted-foreground hover:text-gold rounded-full transition-colors"
          >
            <motion.span
              animate={{ rotate: moRong ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {coCon && moRong && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {nut.children.map((con) => (
              <NutMobileCodon key={con.id} nut={con} tangSau={tangSau + 1} khiDiChuyen={khiDiChuyen} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Mobile Flat List ───────────────────────────────────────────
export function CategoryNavMobile({ onClose }: { onClose: () => void }) {
  const [cay, setCay] = useState<CategoryTree[]>([])
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    getCategoryTreeClient()
      .then(danhSach => {
        if (danhSach && danhSach.length > 0) setCay(danhSach)
      })
      .catch(console.error)
      .finally(() => setDangTai(false))
  }, [])

  if (dangTai) return (
    <div className="py-8 flex justify-center">
      <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-1 p-2">
      {cay.map((goc) => (
        <NutMobileCodon key={goc.id} nut={goc} tangSau={0} khiDiChuyen={onClose} />
      ))}
    </div>
  )
}
