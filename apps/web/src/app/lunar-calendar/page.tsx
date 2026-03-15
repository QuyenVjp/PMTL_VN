'use client';
// ─────────────────────────────────────────────────────────────────
//  /lunar-calendar — Lịch Âm Tu Học Pháp Môn Tâm Linh
//  Tích hợp @forvn/vn-lunar-calendar, đánh dấu ngày vía Phật/BT,
//  khai thị sư phụ, ngày trai, đổi tháng, có link khai thị liên kết.
// ─────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sun,
  Moon,
  Flower2,
  BookOpen,
  Sparkles,
  Calendar as CalendarIcon,
  Bell as BellIcon,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  ScrollText,
  Flame,
  Leaf,
  Sword,
  X,
  type LucideIcon
} from 'lucide-react';
// fetchLunarEvents chạy server-side qua route handler /api/lunar-events

/* ── Lazy-load lunar lib ─────────────────────────────────────── */
// @forvn/vn-lunar-calendar — converts solar <-> Vietnamese lunar
let lunarLib: { LunarCalendar?: any; default?: { LunarCalendar: any } } | null = null;
async function getLunarLib() {
  if (lunarLib) return lunarLib;
  lunarLib = await import('@forvn/vn-lunar-calendar');
  return lunarLib;
}

/* ── Types ──────────────────────────────────────────────────── */
interface BlogLink {
  id: number;
  title: string;
  slug: string;
}

interface SpecialDay {
  lunarMonth: number;
  lunarDay: number;
  name: string;
  type: 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal';
  description: string;
  icon: LucideIcon;

  solarDate?: string;
  isRecurringLunar?: boolean;
  relatedBlogs?: BlogLink[]; // Khai thị blog liên quan từ admin
}

/* ── Dữ liệu ngày đặc biệt theo LỊCH ÂM ─────────────────────
   Nguồn: truyền thống Phật giáo Đại Thừa — Bồ Tát Quan Thế Âm,
   Ngày vía Phật, ngày trai 6 ngày / 10 ngày.
   teacher = ngày sư phụ khai thị sẽ được thêm vào sau theo CMS.
─────────────────────────────────────────────────────────────── */
const SPECIAL_DAYS: SpecialDay[] = [
  // ── Chư Phật ──
  { lunarMonth: 1, lunarDay: 1, name: 'Tết Nguyên Đán & Vía Di Lặc', type: 'holiday', description: 'Năm mới Âm lịch — niệm kinh cầu an đầu năm.', icon: PartyPopper },
  { lunarMonth: 1, lunarDay: 15, name: 'Rằm Thượng Nguyên', type: 'holiday', description: 'Ngày cầu nguyện linh ứng nhất năm.', icon: Sun },
  { lunarMonth: 2, lunarDay: 8, name: 'Vía Phật Thích Ca Xuất Gia', type: 'buddha', description: 'Kỷ niệm Thái tử Tất Đạt Đa rời hoàng cung tu đạo.', icon: Sparkles },
  { lunarMonth: 2, lunarDay: 15, name: 'Vía Phật Thích Ca Nhập Niết Bàn', type: 'buddha', description: 'Kỷ niệm ngày Đức Phật nhập diệt tại rừng Câu Thi Na.', icon: Moon },
  { lunarMonth: 2, lunarDay: 19, name: 'Vía Quán Thế Âm Đản Sinh', type: 'bodhisattva', description: 'Đản sinh Bồ Tát Quán Thế Âm — Chú Đại Bi 49+ biến.', icon: Flower2 },
  { lunarMonth: 2, lunarDay: 21, name: 'Vía Phổ Hiền Bồ Tát', type: 'bodhisattva', description: 'Đại Hạnh Bồ Tát Phổ Hiền — khổ hạnh, thực hành.', icon: Sparkles },
  { lunarMonth: 3, lunarDay: 16, name: 'Vía Chuẩn Đề Bồ Tát', type: 'bodhisattva', description: 'Công đức vô lượng — niệm Chuẩn Đề Thần Chú tăng phước.', icon: Sparkles },
  { lunarMonth: 4, lunarDay: 4, name: 'Vía Văn Thù Sư Lợi Bồ Tát', type: 'bodhisattva', description: 'Đản sinh Bồ Tát Văn Thù — trí tuệ, học hành.', icon: BookOpen },
  { lunarMonth: 4, lunarDay: 8, name: 'Vía Phật Thích Ca Đản Sinh (Phật Đản)', type: 'buddha', description: 'Đức Phật đản sinh tại vườn Lâm Tỳ Ni.', icon: Sparkles },
  { lunarMonth: 4, lunarDay: 15, name: 'Phật Đản (Lễ Hội Vesak)', type: 'buddha', description: 'Kỷ niệm ngày Đức Phật Thích Ca ra đời. Ăn chay, phóng sinh.', icon: Sparkles },
  { lunarMonth: 6, lunarDay: 3, name: 'Vía Hộ Pháp Vi Đà Bồ Tát', type: 'bodhisattva', description: 'Bảo hộ chánh pháp — niệm kinh hộ trì.', icon: Sword },
  { lunarMonth: 6, lunarDay: 19, name: 'Vía Quán Thế Âm Thành Đạo', type: 'bodhisattva', description: 'Ngày Bồ Tát Quán Thế Âm đắc đạo — Chú Đại Bi 49 biến.', icon: Flower2 },
  { lunarMonth: 7, lunarDay: 13, name: 'Vía Đại Thế Chí Bồ Tát', type: 'bodhisattva', description: 'Đản sinh Bồ Tát Đại Thế Chí.', icon: Sparkles },
  { lunarMonth: 7, lunarDay: 15, name: 'Vu Lan Báo Hiếu (Rằm Tháng Bảy)', type: 'holiday', description: 'Tháng báo hiếu — siêu độ vong linh, đốt Ngôi Nhà Nhỏ.', icon: Moon },
  { lunarMonth: 7, lunarDay: 30, name: 'Vía Địa Tạng Vương Bồ Tát', type: 'bodhisattva', description: 'Đản sinh Bồ Tát Địa Tạng — đại nguyện độ thoát chúng sinh.', icon: Flame },
  { lunarMonth: 9, lunarDay: 9, name: 'Vía Diêm Vương (Ngày Trùng Cửu)', type: 'holiday', description: 'Dâng lễ, siêu độ vong linh và cầu nguyện gia tiên.', icon: Flame },
  { lunarMonth: 9, lunarDay: 19, name: 'Vía Quán Thế Âm Xuất Gia', type: 'bodhisattva', description: 'Kỷ niệm Bồ Tát Quán Thế Âm xuất gia tu hành.', icon: Flower2 },
  { lunarMonth: 9, lunarDay: 30, name: 'Vía Phật Dược Sư', type: 'buddha', description: 'Cầu sức khỏe, tiêu trừ nghiệp bệnh thân tâm.', icon: Sparkles },
  { lunarMonth: 11, lunarDay: 17, name: 'Vía Phật A Di Đà', type: 'buddha', description: 'Niệm hồng danh A Di Đà nhiều nhất trong năm.', icon: Sparkles },
  { lunarMonth: 12, lunarDay: 8, name: 'Ngày Phóng Sinh / Sư Phụ Khai Thị', type: 'teacher', description: 'Ngày đặc biệt tu tập — quảng độ chúng sinh.', icon: Flower2 },
  { lunarMonth: 12, lunarDay: 23, name: 'Tiễn Ông Táo', type: 'holiday', description: 'Sám hối, niệm kinh tiễn Thần Bếp về trời.', icon: Flame },
];

// Ngày trai thêm vào hàng tháng
const FAST_DAYS_LUNAR = [1, 8, 14, 15, 18, 23, 24, 28, 29, 30];

/* ── Color map ───────────────────────────────────────────────── */
const TYPE_STYLE: Record<SpecialDay['type'], { bg: string; text: string; border: string; dot: string }> = {
  buddha: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  bodhisattva: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  teacher: { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/40', dot: 'bg-gold' },
  fast: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  holiday: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
};

// Emojis replaced with Lucide icons imported above.
// Custom LotusMarker remains for the calendar grid dots as it is highly specific.


/* ── LotusIcon SVG ────────────────────────────────────────────── */
const LotusMarker = ({ type }: { type: SpecialDay['type'] }) => {
  const colors: Record<SpecialDay['type'], string> = {
    buddha: '#D97706',   // amber-600 — Phật đản, ấm trầm
    bodhisattva: '#E11D48', // rose-600
    teacher: '#CA9500',  // vàng gold dịu, không lóa
    fast: '#059669',     // emerald-600
    holiday: '#9333EA',  // purple-600
    normal: '#2563EB',   // blue-600
  };
  const fill = colors[type] || '#CA9500';

  return (
    <svg viewBox="0 0 20 20" className="w-3 h-3 drop-shadow-sm" fill={fill}>
      <path d="M10 2c-1 2-3 3-3 5s2 3 3 3 3-1 3-3-2-3-3-5z" opacity="0.9" />
      <path d="M3 10c2-1 3-3 5-3s3 2 3 3-1 3-3 3-3-2-5-3z" opacity="0.75" />
      <path d="M17 10c-2-1-3-3-5-3s-3 2-3 3 1 3 3 3 3-2 5-3z" opacity="0.75" />
      <circle cx="10" cy="13" r="2.5" opacity="0.9" />
    </svg>
  );
};

/* ── Lunar helper ────────────────────────────────────────────── */
interface LunarInfo { lunarDay: number; lunarMonth: number; lunarYear: number; isLeapMonth: boolean; canChi?: string }
const lunarCache = new Map<string, LunarInfo>();

async function solarToLunar(year: number, month: number, day: number): Promise<LunarInfo> {
  const key = `${year}-${month}-${day}`;
  if (lunarCache.has(key)) return lunarCache.get(key)!;
  try {
    const lib = await getLunarLib();
    // API: new LunarCalendar(day, month, year)._lunarDate → { day, month, year, leap }
    const Cls = lib.LunarCalendar ?? lib.default?.LunarCalendar;
    if (Cls) {
      const lc = new Cls(day, month, year);
      const ld = lc._lunarDate;
      const result: LunarInfo = {
        lunarDay: ld.day,
        lunarMonth: ld.month,
        lunarYear: ld.year,
        isLeapMonth: ld.leap ?? false,
      };
      lunarCache.set(key, result);
      return result;
    }
  } catch { }
  return { lunarDay: day, lunarMonth: month, lunarYear: year, isLeapMonth: false };
}


/* ── Tháng Can Chi ────────────────────────────────────────────── */
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
function yearCanChi(year: number) {
  return `${CAN[(year - 4) % 10]} ${CHI[(year - 4) % 12]}`;
}

/* ══════════════════════════════════════════════════════════════ */
/*  COMPONENT DayCell — 1 ô trong lịch                          */
/* ══════════════════════════════════════════════════════════════ */
interface DayCellProps {
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  allEvents: SpecialDay[];
  onClick: () => void;
}

function DayCell({ solarDay, solarMonth, solarYear, isToday, isCurrentMonth, allEvents, onClick }: DayCellProps) {
  const [lunar, setLunar] = useState<LunarInfo | null>(null);
  const [markers, setMarkers] = useState<SpecialDay[]>([]);

  useEffect(() => {
    let cancelled = false;
    solarToLunar(solarYear, solarMonth, solarDay).then((l) => {
      if (cancelled) return;
      setLunar(l);
      // Tìm ngày đặc biệt
      const found = allEvents.filter((s) => {
        // Neu co solarDate thi LUON uu tien match theo duong lich (bat ke isRecurringLunar)
        if (s.solarDate) {
          const solarStr = `${solarYear}-${solarMonth.toString().padStart(2, '0')}-${solarDay.toString().padStart(2, '0')}`;
          return s.solarDate.startsWith(solarStr);
        }
        // Su kien am lich lap lai hang nam (khong co solarDate co dinh)
        if (s.isRecurringLunar) {
          return s.lunarMonth === l.lunarMonth && s.lunarDay === l.lunarDay;
        }
        return false;
      });
      // Ngày trai
      if (FAST_DAYS_LUNAR.includes(l.lunarDay)) {
        found.push({ lunarMonth: l.lunarMonth, lunarDay: l.lunarDay, name: `Ngày ${l.lunarDay === 1 ? 'Mùng 1' : l.lunarDay === 15 ? 'Rằm' : `Trai ${l.lunarDay}`}`, type: 'fast', description: 'Ngày trai — ăn chay, niệm kinh nhiều hơn.', icon: Leaf });
      }
      setMarkers(found);
    });
    return () => { cancelled = true; };
  }, [solarDay, solarMonth, solarYear, allEvents]);

  const isSpecial = markers.length > 0;

  return (
    <button
      onClick={onClick}
      className={`
        relative group w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all duration-200
        ${isToday ? 'bg-gold/20 border border-gold/60 shadow-md shadow-gold/10' : ''}
        ${!isToday && isSpecial ? 'bg-card border border-border hover:border-gold/40' : ''}
        ${!isToday && !isSpecial ? 'hover:bg-secondary/50' : ''}
        ${!isCurrentMonth ? 'opacity-30' : ''}
      `}
    >
      {/* Solar day number */}
      <span className={` text-sm leading-none mb-0.5 ${isToday ? 'text-gold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
        {solarDay}
      </span>

      {/* Lunar day */}
      {lunar && (
        <span className={`text-[9px] leading-none ${isToday ? 'text-gold/70' : 'text-muted-foreground/60'}`}>
          {lunar.lunarDay === 1 ? `M.1 Th.${lunar.lunarMonth}` : lunar.lunarDay === 15 ? 'Rằm' : `${lunar.lunarDay}`}
        </span>
      )}

      {/* Lotus markers */}
      {markers.length > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {markers.slice(0, 3).map((m, i) => (
            <LotusMarker key={i} type={m.type} />
          ))}
        </div>
      )}

      {/* Tooltip on hover */}
      {isSpecial && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 pointer-events-none">
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl text-left whitespace-nowrap max-w-[200px]">
            {markers.map((m, i) => (
              <p key={i} className={`flex items-center gap-1.5 truncate ${TYPE_STYLE[m.type]?.text}`}>
                <m.icon className="w-3 h-3" /> {m.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  DETAIL MODAL — hiện khi click vào ngày (dùng Dialog)           */
/* ══════════════════════════════════════════════════════════════ */
interface DayDetail {
  solar: { day: number; month: number; year: number };
  lunar: LunarInfo;
  markers: SpecialDay[];
}

function DayDrawer({ detail, onClose }: { detail: DayDetail | null; onClose: () => void }) {
  if (!detail) return null;
  const { solar, lunar, markers } = detail;
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dow = new Date(solar.year, solar.month - 1, solar.day).getDay();

  return (
    <Dialog open={!!detail} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 bg-transparent border-0 shadow-none outline-none [&>button]:hidden w-[calc(100vw-1rem)]"
      >
        <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full h-full shadow-2xl relative outline-none flex flex-col overflow-hidden">
          {/* Header — NOT scrollable */}
          <DialogHeader className="px-6 py-5 border-b border-border bg-gradient-to-r from-card to-secondary/30 space-y-0 shrink-0">
            <div className="flex items-start justify-between w-full">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{dayNames[dow]}</p>
                <DialogTitle className="font-display text-4xl text-foreground leading-none">{solar.day}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">tháng {solar.month}, {solar.year}</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-gold/10 border border-gold/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-gold/70 font-medium mb-0.5">Âm lịch</p>
                  <p className="font-display text-2xl text-gold">{lunar.lunarDay}</p>
                  <p className="text-xs text-gold/70">tháng {lunar.lunarMonth}{lunar.isLeapMonth ? ' nhuận' : ''}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable content area */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y"
            data-lenis-prevent
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="px-6 py-4 space-y-3">
              {markers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Ngày thường — tu học như thường.</p>
              ) : (
                markers.map((m, i) => {
                  const style = TYPE_STYLE[m.type];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-xl p-4 border ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <m.icon className={`w-5 h-5 ${style.text} flex-shrink-0`} />
                        <h3 className={`text-sm font-semibold ${style.text}`}>{m.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {m.description}
                      </p>

                      {/* Blog liên quan tu admin */}
                      {m.relatedBlogs && m.relatedBlogs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className={`text-xs font-semibold mb-2 ${style.text}`}>Khai Thị Liên Kết:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {m.relatedBlogs.map((blog) => (
                              <a
                                key={blog.id}
                                href={`/blog/${blog.slug}`}
                                className="group px-3 py-2 rounded-lg border border-white/10 hover:border-gold/20 bg-white/5 hover:bg-gold/5 transition-all duration-200"
                              >
                                <div className={`text-xs font-medium ${style.text} group-hover:text-gold transition-colors flex items-center gap-1.5`}>
                                  <BookOpen className="w-3 h-3 flex-shrink-0" /> {blog.title}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-border bg-card flex items-center justify-between shrink-0">
            <button
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
              onClick={() => { alert('Tính năng nhắc lịch qua email sắp ra mắt!'); }}
            >
              <BellIcon className="w-4 h-4" /> Nhắc trước 1 ngày
            </button>
            <button
              onClick={onClose}
              className="px-6 h-10 rounded-xl bg-secondary text-xs text-foreground hover:bg-border transition-colors font-medium"
            >
              Đóng
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                    */
/* ══════════════════════════════════════════════════════════════ */
const DOW_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export default function LunarCalendarPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [todayLunar, setTodayLunar] = useState<LunarInfo | null>(null);
  const [upcomingMarkers, setUpcomingMarkers] = useState<Array<{ date: string; items: SpecialDay[] }>>([]);

  const [adminEvents, setAdminEvents] = useState<SpecialDay[]>([]);
  const allEvents = useMemo(() => [...SPECIAL_DAYS, ...adminEvents], [adminEvents]);

  useEffect(() => {
    const today = new Date();
    solarToLunar(today.getFullYear(), today.getMonth() + 1, today.getDate()).then(setTodayLunar);

    // Lấy sự kiện từ CMS qua route handler (server-side, có token, deep populate)
    fetch('/api/lunar-events')
      .then(r => r.json())
      .then((events: import('@/lib/api/lunar-calendar').LunarEvent[]) => {
        const getIcon = (t: string) => {
          if (t === 'buddha') return Sparkles;
          if (t === 'bodhisattva') return Flower2;
          if (t === 'teacher') return ScrollText;
          if (t === 'fast') return Leaf;
          return PartyPopper;
        };

        const mapped: SpecialDay[] = events.map(e => ({
          lunarMonth: e.lunarMonth || 1,
          lunarDay: e.lunarDay || 1,
          solarDate: e.solarDate || undefined,
          isRecurringLunar: e.isRecurringLunar,
          name: e.title,
          type: e.eventType || 'normal',
          description: 'Tu tập theo hướng dẫn của sư phụ.',
          icon: getIcon(e.eventType),
          relatedBlogs: e.relatedBlogs
            ? e.relatedBlogs.map(b => ({ id: b.id, title: b.title, slug: b.slug }))
            : [],
        }));
        setAdminEvents(mapped);
      })
      .catch(err => {
        console.error('[lunar-calendar] Fetch error:', err);
      });
  }, []);

  // Build upcoming events (next 60 days)
  useEffect(() => {
    const result: Array<{ date: string; items: SpecialDay[] }> = [];
    const run = async () => {
      const today = new Date();
      for (let i = 0; i <= 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
        const lunar = await solarToLunar(y, m, day);
        const found = allEvents.filter((s) => {
          if (s.solarDate) {
            const solarStr = `${y}-${m.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            return s.solarDate.startsWith(solarStr);
          }
          if (s.isRecurringLunar) {
            return s.lunarMonth === lunar.lunarMonth && s.lunarDay === lunar.lunarDay && s.type !== 'fast';
          }
          return false;
        });
        if (found.length > 0) {
          result.push({ date: `${day}/${m}/${y}`, items: found });
          if (result.length >= 5) break;
        }
      }
      setUpcomingMarkers(result);
    };
    if (allEvents.length) run();
  }, [allEvents]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: Array<{ day: number; month: number; year: number; current: boolean }> = [];

    // Prev month trail
    for (let i = startDow - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
      cells.push({ day, month: prevMonth, year: prevYear, current: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, current: true });
    }

    // Next month trail
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;
      cells.push({ day: d, month: nextMonth, year: nextYear, current: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrev = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const handleNext = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
  const goToday = () => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth() + 1); };

  const handleCellClick = async (day: number, month: number, year: number) => {
    const lunar = await solarToLunar(year, month, day);
    const markers = allEvents.filter((s) => {
      if (s.solarDate) {
        const solarStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return s.solarDate.startsWith(solarStr);
      }
      if (s.isRecurringLunar) {
        return s.lunarMonth === lunar.lunarMonth && s.lunarDay === lunar.lunarDay;
      }
      return false;
    });
    if (FAST_DAYS_LUNAR.includes(lunar.lunarDay)) {
      markers.push({ lunarMonth: lunar.lunarMonth, lunarDay: lunar.lunarDay, name: `Ngày ${lunar.lunarDay === 1 ? 'Mùng 1' : lunar.lunarDay === 15 ? 'Rằm' : `${lunar.lunarDay}`} — Ngày Trai`, type: 'fast', description: 'Ăn chay, niệm kinh gấp đôi, phóng sinh nếu có thể.', icon: Leaf });
    }
    setSelectedDay({ solar: { day, month, year }, lunar, markers });
  };

  const isToday = (day: number, month: number, year: number) =>
    day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  const todayMarkers = useMemo(() => {
    if (!todayLunar) return [] as SpecialDay[];
    const solarStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const markers = allEvents.filter((s) => {
      if (s.solarDate) return s.solarDate.startsWith(solarStr);
      if (s.isRecurringLunar) {
        return s.lunarMonth === todayLunar.lunarMonth && s.lunarDay === todayLunar.lunarDay;
      }
      return false;
    });
    if (FAST_DAYS_LUNAR.includes(todayLunar.lunarDay)) {
      markers.push({
        lunarMonth: todayLunar.lunarMonth,
        lunarDay: todayLunar.lunarDay,
        name: `Ngày ${todayLunar.lunarDay === 1 ? 'Mùng 1' : todayLunar.lunarDay === 15 ? 'Rằm' : `${todayLunar.lunarDay}`} — Ngày Trai`,
        type: 'fast',
        description: 'Ăn chay, niệm kinh gấp đôi, phóng sinh nếu có thể.',
        icon: Leaf,
      });
    }
    return markers;
  }, [allEvents, now, todayLunar]);

  const suggestedBlogsToday = useMemo(() => {
    const map = new Map<string, BlogLink>();
    for (const marker of todayMarkers) {
      for (const blog of marker.relatedBlogs ?? []) {
        map.set(blog.slug, blog);
      }
    }
    return Array.from(map.values()).slice(0, 4);
  }, [todayMarkers]);

  return (
    <>

      <main className="pb-24">
        {/* ── Hero compact ────────────────────────────────────── */}
        <div className="border-b border-border/50 bg-gradient-to-b from-card/80 to-background py-10">
          <div className="route-frame text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-dim mb-4">
              <Sparkles className="w-3 h-3" /> Pháp Môn Tâm Linh
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
              Lịch Tu Học <span className="text-gold-dim">Âm Lịch</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Ngày vía Phật, Bồ Tát · Ngày trai · Khai thị Sư Phụ — tất cả trên một trang.
            </p>

            {/* Today's info pill */}
            {todayLunar && (
              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
                <div className="panel-shell inline-flex items-center gap-2 rounded-xl px-4 py-2">
                  <span className="text-xs text-muted-foreground">Hôm nay:</span>
                  <span className="text-sm font-bold text-foreground">{now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}</span>
                  <span className="w-px h-4 bg-border" />
                  <span className="text-xs text-gold-dim font-medium">
                    ÂL: {todayLunar.lunarDay} tháng {todayLunar.lunarMonth}{todayLunar.isLeapMonth ? ' nhuận' : ''}
                  </span>
                  <span className="w-px h-4 bg-border" />
                  <span className="text-xs text-muted-foreground">Năm {yearCanChi(now.getFullYear())}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto mt-8 px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Calendar ────────────────────────────────────── */}
            <div className="flex-1">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={handlePrev} className="p-2 rounded-xl bg-card border border-border hover:border-gold/40 transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronLeft />
                </button>

                <div className="text-center">
                  <h2 className="text-xl text-foreground">
                    {MONTH_NAMES[viewMonth - 1]} · <span className="text-gold">{viewYear}</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground/60">Năm {yearCanChi(viewYear)}</p>
                </div>

                <button onClick={handleNext} className="p-2 rounded-xl bg-card border border-border hover:border-gold/40 transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronRight />
                </button>
              </div>

              {/* Today button */}
              <div className="flex justify-end mb-4">
                <button onClick={goToday} className="text-[11px] text-muted-foreground hover:text-gold transition-colors border border-border bg-card px-3 py-1 rounded-full">
                  Hôm nay
                </button>
              </div>

              {/* DOW header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DOW_LABELS.map((d, i) => (
                  <div key={d} className={`text-center text-[10px] font-bold uppercase py-1.5 ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground/60'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <motion.div
                key={`${viewYear}-${viewMonth}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-1"
              >
                {calendarDays.map((cell, idx) => (
                  <DayCell
                    key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                    solarDay={cell.day}
                    solarMonth={cell.month}
                    solarYear={cell.year}
                    isToday={isToday(cell.day, cell.month, cell.year)}
                    isCurrentMonth={cell.current}
                    allEvents={allEvents}
                    onClick={() => handleCellClick(cell.day, cell.month, cell.year)}
                  />
                ))}
              </motion.div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center">
                {([
                  ['buddha', Sparkles, 'Ngày vía Phật'],
                  ['bodhisattva', Flower2, 'Ngày vía Bồ Tát'],
                  ['teacher', ScrollText, 'Khai thị Sư Phụ'],
                  ['holiday', PartyPopper, 'Sự kiện / Pháp hội'],
                  ['fast', Leaf, 'Ngày Trai'],
                ] as const).map(([type, Icon, label]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${TYPE_STYLE[type].text}`} />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sidebar ─────────────────────────────────────── */}
            <div className="lg:w-72 space-y-5">
              <div className="rounded-xl border border-border bg-card p-5 shadow-ant">
                <div className="flex items-center gap-2 mb-3">
                  <BellIcon className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-bold text-foreground">Sự Kiện Tu Học Hôm Nay</h3>
                </div>
                {todayMarkers.length > 0 ? (
                  <div className="space-y-3">
                    {todayMarkers.map((marker, index) => (
                      <div key={`${marker.name}-${index}`} className={`rounded-xl border px-3 py-3 ${TYPE_STYLE[marker.type].bg} ${TYPE_STYLE[marker.type].border}`}>
                        <div className="flex items-start gap-2">
                          <marker.icon className={`mt-0.5 w-4 h-4 ${TYPE_STYLE[marker.type].text}`} />
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${TYPE_STYLE[marker.type].text}`}>{marker.name}</p>
                            <p className="mt-1 text-xs leading-6 text-muted-foreground">{marker.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-6 text-muted-foreground">
                    Hôm nay không có ngày vía lớn. Anh có thể giữ nhịp tu đều với công khóa và bài đọc gợi ý bên dưới.
                  </p>
                )}

                <div className="mt-4 grid gap-2">
                  <Link
                    href="/niem-kinh"
                    className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold/90"
                  >
                    Mở công khóa hôm nay
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/35 hover:text-gold"
                  >
                    Cài nhắc việc nhẹ nhàng
                  </Link>
                </div>
              </div>

              {/* Upcoming events */}
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-gold/5 to-transparent flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-bold text-foreground">Ngày Quan Trọng Sắp Tới</h3>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {upcomingMarkers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Đang tải...</p>
                  ) : (
                    upcomingMarkers.map((ev, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-medium">{ev.date}</p>
                        {ev.items.map((m, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <LotusMarker type={m.type} />
                            <p className={`text-xs font-medium ${TYPE_STYLE[m.type].text}`}>{m.name}</p>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-emerald-400">Ngày Trai Hàng Tháng</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FAST_DAYS_LUNAR.map((d) => (
                    <span key={d} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      {d === 1 ? 'M.1' : d === 15 ? 'Rằm' : d}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-3">
                  Ăn chay · Niệm kinh gấp đôi · Phóng sinh
                </p>
              </div>

              {/* Quick links */}
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-bold text-foreground">Bài Nên Đọc Theo Ngày</h3>
                </div>
                <div className="space-y-1.5">
                  {suggestedBlogsToday.length > 0 ? (
                    suggestedBlogsToday.map((blog) => (
                      <Link
                        key={blog.slug}
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors group py-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="group-hover:underline line-clamp-1">{blog.title}</span>
                      </Link>
                    ))
                  ) : adminEvents.filter((s) => s.relatedBlogs && s.relatedBlogs.length > 0).slice(0, 5).map((s, idx) => (
                    s.relatedBlogs!.map((blog) => (
                      <Link key={`${idx}-${blog.id}`} href={`/blog/${blog.slug}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors group py-1">
                        <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="group-hover:underline line-clamp-1">{s.name} — {blog.title}</span>
                      </Link>
                    ))
                  ))}
                  {suggestedBlogsToday.length === 0 && adminEvents.filter((s) => s.relatedBlogs && s.relatedBlogs.length > 0).length === 0 && (
                    <p className="text-xs text-muted-foreground/60">Chưa có khai thị liên kết.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-bold text-foreground">Nhắc Việc Không Làm Phiền</h3>
                </div>
                <ul className="space-y-2 text-xs leading-6 text-muted-foreground">
                  <li>Chỉ bật nhóm thật sự cần: tu học, sự kiện, diễn đàn, bài viết mới.</li>
                  <li>Ngày đặc biệt nên để riêng thành lời nhắc nhẹ vào buổi sáng.</li>
                  <li>Sự kiện quan trọng chỉ nên nhắc trước giờ và trước 1 ngày.</li>
                </ul>
                <Link
                  href="/thong-bao"
                  className="mt-4 inline-flex items-center text-xs font-medium text-gold hover:underline"
                >
                  Mở trung tâm thông báo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DayDrawer detail={selectedDay} onClose={() => setSelectedDay(null)} />
    </>
  );
}
