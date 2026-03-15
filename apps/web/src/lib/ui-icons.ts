import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Bird,
  BookOpen,
  Briefcase,
  Compass,
  Flame,
  Flower2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Lamp,
  Leaf,
  MessageCircleQuestion,
  Moon,
  Radio,
  Scale,
  Search,
  Sparkles,
  Star,
  Users,
  Waves,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  baby: Baby,
  bird: Bird,
  book: BookOpen,
  bookopen: BookOpen,
  briefcase: Briefcase,
  compass: Compass,
  flame: Flame,
  flower2: Flower2,
  gift: Gift,
  graduationcap: GraduationCap,
  heartpulse: HeartPulse,
  home: Home,
  house: Home,
  lamp: Lamp,
  leaf: Leaf,
  messagecirclequestion: MessageCircleQuestion,
  moon: Moon,
  radio: Radio,
  scale: Scale,
  search: Search,
  sparkles: Sparkles,
  star: Star,
  users: Users,
  waves: Waves,
}

export type UiIconLike =
  | string
  | null
  | undefined
  | {
      key?: string | null
      lucideName?: string | null
      name?: string | null
    }

export function resolveIconToken(icon: UiIconLike): string | null {
  if (!icon) return null
  if (typeof icon === 'string') return icon
  return icon.key ?? icon.lucideName ?? icon.name ?? null
}

export function resolveLucideIcon(icon: UiIconLike, fallback: LucideIcon = Search): LucideIcon {
  const token = resolveIconToken(icon)
  if (!token) return fallback
  const normalized = token.replace(/[\s_-]/g, '').toLowerCase()
  return ICON_MAP[normalized] ?? fallback
}
