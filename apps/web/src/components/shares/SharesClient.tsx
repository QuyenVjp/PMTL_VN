'use client';
// ─────────────────────────────────────────────────────────────
//  /shares — Diễn đàn chia sẻ cộng đồng (Fully Dynamic)
//  Refactored: URL searchParams + useTransition (like BlogListClient)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef, useTransition, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal, Info, Pin, ImageIcon, Globe, SlidersHorizontal, X, Loader2, Check, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/http-error';
import {
  fetchPosts,
  fetchPostById,
  fetchPostBySlug,
  getCurrentPushEndpoint,
  likePost,
  submitPost,
  submitComment,
  likeComment,
  reportComment,
  reportPost,
  viewPost,
  uploadFile,
  type CommunityPost,
  type CommunityComment,
} from '@/lib/api/community';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const DEFAULT_SHARE_CATEGORIES = ['Tâm Linh', 'Sức Khoẻ', 'Gia Đình', 'Sự Nghiệp', 'Hôn Nhân', 'Thi Cử', 'Kinh Doanh', 'Mất Ngủ', 'Mối Quan Hệ'];
const REPORT_REASON_OPTIONS = ['spam', 'abuse', 'off-topic', 'unsafe'] as const;

function getPostKey(post: CommunityPost, index: number) {
  if (post.documentId) return post.documentId;
  if (post.slug) return post.slug;
  return `post-${index}`;
}

/* ── Icons ────────────────────────────────────────────────── */
const HeartIcon = ({ filled, className = 'w-4 h-4' }: { filled?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChatIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EyeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const SendIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const XIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);
const PlusIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const QuoteIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" />
  </svg>
);
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-border'}`} stroke="currentColor" strokeWidth="1.5">
    <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26l-4.94 2.44.94-5.49-4-3.9 5.53-.8L10 1.5z" />
  </svg>
);

/* ── Share Pagination ─────────────────────────────────────── */
interface SharesPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
const SharesPagination = ({ currentPage, totalPages, onPageChange }: SharesPaginationProps) => {
  if (totalPages <= 1) return null
  const range = getPaginationRange(currentPage, totalPages)
  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Phân trang chia sẻ">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn('inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all', currentPage <= 1 ? 'cursor-not-allowed border-border/40 text-muted-foreground/40' : 'border-border text-muted-foreground hover:border-gold/25 hover:bg-secondary/60 hover:text-gold-dim')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>
      {range.map((item, idx) => item === 'ellipsis' ? (
        <span key={`e-${idx}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground/60"><MoreHorizontal className="h-4 w-4" /></span>
      ) : (
        <button
          key={item}
          onClick={() => item !== currentPage && onPageChange(item)}
          className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all', item === currentPage ? 'cursor-default border-gold/30 bg-gold/10 font-semibold text-gold-dim' : 'border-border/60 text-muted-foreground hover:border-gold/25 hover:bg-secondary/60 hover:text-gold-dim')}
        >{item}</button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn('inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all', currentPage >= totalPages ? 'cursor-not-allowed border-border/40 text-muted-foreground/40' : 'border-border text-muted-foreground hover:border-gold/25 hover:bg-secondary/60 hover:text-gold-dim')}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-3 text-xs text-muted-foreground/60 hidden md:block">Trang {currentPage}/{totalPages}</span>
    </nav>
  )
}

/* ── Format helpers ──────────────────────────────────────────── */
function fmt(n: number) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
function avatar(name: string, size = 9) {
  const safeName = name?.trim() || 'Ẩn danh';
  const colors = ['from-gold/40 to-amber-600/40 text-gold', 'from-emerald-500/30 to-teal-600/30 text-emerald-400', 'from-purple-500/30 to-indigo-600/30 text-purple-400', 'from-rose-500/30 to-pink-600/30 text-rose-400'];
  const idx = safeName.charCodeAt(0) % colors.length;
  return `w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-sm shrink-0`;
}
function initials(name: string) {
  const safeName = name?.trim() || 'Ẩn danh';
  return safeName.charAt(0).toUpperCase();
}

/* ── Type Badge — Tông màu Phật giáo, tĩnh lặng ── */
const TypeBadge = ({ type }: { type: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    story: { label: 'Câu Chuyện', color: 'bg-gold/10 text-gold' },
    feedback: { label: 'Cảm Ngộ', color: 'bg-amber-600/10 text-amber-500' },
    video: { label: 'Video', color: 'bg-stone-500/10 text-stone-400' },
  };
  const t = map[type] || map.story;
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${t.color}`}>{t.label}</span>;
};

const REPORT_REASON_LABELS: Record<(typeof REPORT_REASON_OPTIONS)[number], string> = {
  spam: 'Spam / quảng cáo',
  abuse: 'Thiếu tôn trọng',
  'off-topic': 'Sai chủ đề',
  unsafe: 'Nội dung không phù hợp',
};

function ReportMenu({
  disabled,
  onSelect,
  compact = false,
}: {
  disabled?: boolean;
  onSelect: (reason: (typeof REPORT_REASON_OPTIONS)[number]) => void;
  compact?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title="Báo nội dung không phù hợp"
          className={compact
            ? "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-400 transition-colors disabled:opacity-50"
            : "inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-muted-foreground hover:border-amber-400/40 hover:text-amber-400 transition-colors disabled:opacity-50"}
        >
          <Flag className={compact ? "w-3 h-3" : "w-4 h-4"} />
          {compact ? (disabled ? 'Đã báo cáo' : 'Báo cáo') : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {REPORT_REASON_OPTIONS.map((reason) => (
          <DropdownMenuItem key={reason} onClick={() => onSelect(reason)}>
            {REPORT_REASON_LABELS[reason]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ══════════════════════ POST CARD ══════════════════════════════ */
interface PostCardProps {
  post: CommunityPost;
  onOpen: (p: CommunityPost) => void;
  onLike: (id: string | number) => void;
  liked: boolean;
}
const PostCard = ({ post, onOpen, onLike, liked }: PostCardProps) => {
  const isFeedback = post.type === 'feedback' && !post.coverUrl;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`panel-shell panel-hover group flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 ${isFeedback
        ? 'border-gold/20 bg-primary/[0.04]'
        : ''
        }`}
      onClick={() => onOpen(post)}
    >
      {/* Cover / Video thumbnail */}
      {(post.coverUrl || post.type === 'video') && (
        <div className="relative aspect-video overflow-hidden bg-secondary shrink-0">
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.documentId}/640/360`; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-border/50 flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {post.type === 'video' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-black transition-transform group-hover:scale-110">
                <PlayIcon className="w-5 h-5 ml-0.5" />
              </div>
            </div>
          )}
          {post.pinned && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-black">
              <Pin className="w-2.5 h-2.5" /> Ghim
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <span className="rounded-sm bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-md">{post.category}</span>
            <TypeBadge type={post.type} />
          </div>
        </div>
      )}

      {/* Feedback card quote watermark */}
      {isFeedback && (
        <div className="px-6 pt-6 pb-0">
          <QuoteIcon className="w-9 h-9 text-gold/25" />
        </div>
      )}

      <div className={`flex flex-col flex-1 gap-4 ${isFeedback ? 'px-6 pb-6 pt-3' : 'p-6'}`}>
        {/* Category (non-image story) */}
        {!post.coverUrl && !isFeedback && (
          <div className="flex items-center gap-2">
            <span className="subtle-badge">{post.category}</span>
            <TypeBadge type={post.type} />
          </div>
        )}
        {/* Category (feedback) */}
        {isFeedback && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gold-dim">{post.category}</span>
            <span className="w-1 h-1 rounded-full bg-gold/30" />
            <TypeBadge type={post.type} />
          </div>
        )}

        <div className="flex-1">
          {isFeedback ? (
            <>
              <p className="text-sm text-foreground/75 leading-relaxed italic line-clamp-4">&ldquo;{post.content}&rdquo;</p>
              <p className="mt-3 text-sm font-semibold text-foreground transition-colors group-hover:text-gold-dim not-italic">{post.title}</p>
            </>
          ) : (
            <>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-gold-dim">{post.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2 mt-1.5">{post.content}</p>
            </>
          )}
        </div>

        {/* Rating */}
        {post.rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= post.rating!} />)}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-2.5 mt-auto">
          {post.author_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className={avatar(post.author_name, 8)}>{initials(post.author_name)}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground/80 truncate">{post.author_name}</p>
            <p className="text-[10px] text-muted-foreground/60">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><EyeIcon className="w-3.5 h-3.5" />{fmt(post.views)}</span>
            <span className="flex items-center gap-1.5"><ChatIcon className="w-3.5 h-3.5" />{Array.isArray(post.comments) ? post.comments.length : 0}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(post.documentId); }}
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-gold-dim' : 'hover:text-gold-dim'}`}
          >
            <HeartIcon filled={liked} className="w-3.5 h-3.5" />
            <span>{fmt(post.likes + (liked ? 1 : 0))}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* ══════════════════════ COMMENT ITEM ═══════════════════════════ */
interface CommentItemProps {
  comment: CommunityComment;
  postId: string | number;
  allComments: CommunityComment[];
  depth?: number;
  onRefresh?: () => Promise<void>;
}

const CommentItem = ({ comment, postId, allComments, depth = 0, onRefresh }: CommentItemProps) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [replyName, setReplyName] = useState('');
  const [sending, setSending] = useState(false);
  const [reported, setReported] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setReplyName(user.fullName || user.username || '');
    } else {
      const saved = localStorage.getItem('pmtl_author_name');
      if (saved) setReplyName(saved);
    }
  }, [user]);

  useEffect(() => {
    if (!showReply) return;

    const timer = window.setTimeout(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.select();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [showReply]);

  const replies = allComments.filter((item) => item.parent?.documentId === comment.documentId);
  const visualDepth = Math.min(depth, 2);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((l) => l + 1);
    try {
      await likeComment(comment.documentId);
      toast.success('Đã thích bình luận');
    } catch (error) {
      setLiked(false);
      setLikes((l) => l - 1);
      toast.error(getErrorMessage(error, 'Không thể thích bình luận'));
    }
  };

  const handleReport = async (reason: (typeof REPORT_REASON_OPTIONS)[number]) => {
    if (reported) return;
    try {
      const message = await reportComment(comment.documentId, reason);
      setReported(true);
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể báo cáo bình luận'));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = (user ? (user.fullName || user.username || user.email) : replyName) || '';
    if (!reply.trim() || !finalName.trim()) {
      if (!finalName.trim()) toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    setSending(true);
    try {
      const actorEndpoint = await getCurrentPushEndpoint();
      await submitComment({
        postDocumentId: String(postId),
        content: reply,
        author_name: finalName,
        parentDocumentId: comment.documentId,
        author_avatar: user?.avatar_url || undefined,
        actorUserId: user?.id,
        actorEndpoint,
      });
      toast.success('Trả lời đã được đăng');
      setReply('');
      if (!user) localStorage.setItem('pmtl_author_name', finalName);
      setShowReply(false);
      await onRefresh?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gửi trả lời thất bại'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={cn(
        "flex max-w-full gap-3",
        visualDepth === 1 && "ml-5 border-l border-gold/15 pl-4",
        visualDepth >= 2 && "ml-3 border-l border-gold/10 pl-3"
      )}
    >
      {comment.author_avatar ? (
        <img src={comment.author_avatar} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className={avatar(comment.author_name, 8)}>{initials(comment.author_name)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="max-w-full bg-secondary/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-foreground/90">{comment.author_name}</span>
          </div>
          <p className="max-w-full text-sm text-foreground/75 leading-relaxed break-words [overflow-wrap:anywhere]">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button type="button" onClick={handleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'}`}>
            <HeartIcon filled={liked} className="w-3 h-3" />{likes}
          </button>
          <button type="button" onClick={() => setShowReply((s) => !s)} className="text-xs text-muted-foreground transition-colors hover:text-gold-dim">
            Trả lời
          </button>
          <ReportMenu disabled={reported} onSelect={handleReport} compact />
          <span className="text-[10px] text-muted-foreground/50">{timeAgo(comment.createdAt)}</span>
        </div>
        {showReply && (
          <form onSubmit={handleReply} className="mt-2 flex flex-col gap-2">
            {!user && !localStorage.getItem('pmtl_author_name') && (
              <input
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Tên bạn..."
                required
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 w-48"
              />
            )}
            <div className="flex gap-2">
              <input
                ref={replyInputRef}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={user || replyName ? `Trả lời ${comment.author_name}...` : "Viết trả lời..."}
                required
                className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-50 hover:bg-gold transition-colors"
              >
                Gửi
              </button>
            </div>
          </form>
        )}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((replyComment) => (
              <CommentItem
                key={replyComment.documentId}
                comment={replyComment}
                postId={postId}
                allComments={allComments}
                depth={depth + 1}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════ DETAIL MODAL ══════════════════════════ */
interface DetailModalProps {
  post: CommunityPost | null;
  onClose: () => void;
  onLike: (id: string | number) => void;
  liked: boolean;
  onRefreshPost: (documentId: string) => Promise<CommunityPost>;
}

const DetailModal = ({ post, onClose, onLike, liked, onRefreshPost }: DetailModalProps) => {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [sending, setSending] = useState(false);
  const [reportedPost, setReportedPost] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!post) return;
    setComments(post.comments || []);
    setReportedPost(false);

    if (user) {
      setCommentName(user.fullName || user.username || '');
    } else {
      const saved = localStorage.getItem('pmtl_author_name');
      if (saved) setCommentName(saved);
    }
  }, [post, user]);

  const refreshCurrentPost = useCallback(async () => {
    if (!post?.documentId) return;

    const refreshedPost = await onRefreshPost(post.documentId);
    setComments(refreshedPost.comments || []);
  }, [onRefreshPost, post?.documentId]);

  const rootComments = comments.filter((item) => !item.parent?.documentId);

  const handleReportPost = async (reason: (typeof REPORT_REASON_OPTIONS)[number]) => {
    if (!post || reportedPost) return;
    try {
      const message = await reportPost(post.documentId, reason);
      setReportedPost(true);
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể báo cáo bài viết'));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = (user ? (user.fullName || user.username || user.email) : commentName) || '';
    if (!commentText.trim() || !finalName.trim()) return;
    setSending(true);
    try {
      const actorEndpoint = await getCurrentPushEndpoint();
      await submitComment({
        postDocumentId: post!.documentId,
        content: commentText,
        author_name: finalName,
        author_avatar: user?.avatar_url || undefined,
        actorUserId: user?.id,
        actorEndpoint,
      });
      toast.success('Bình luận đã được đăng');
      setCommentText('');
      if (!user) localStorage.setItem('pmtl_author_name', finalName);
      await refreshCurrentPost();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gửi bình luận thất bại'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-hidden flex w-[calc(100vw-1rem)] flex-col gap-0 border-0 bg-transparent p-0 shadow-none outline-none [&>button:last-child]:hidden sm:rounded-xl"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{post?.title || 'Chi tiết bài viết'}</DialogTitle>
        </DialogHeader>
        {post && (
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl outline-none sm:rounded-xl">
            {/* Header: Sticky and non-shrinking */}
            <div className="shrink-0 z-10 bg-card/95 backdrop-blur-sm px-6 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={post.type} />
                <span className="text-xs text-muted-foreground">{post.category}</span>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary transition-colors hover:bg-border">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Scrollable area */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y"
              data-lenis-prevent
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="px-5 pt-5 pb-8 space-y-4">

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className={`${avatar(post.author_name, 10)} text-base`}>{initials(post.author_name)}</div>
                    )}
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1.5 leading-tight">
                        {post.author_name}
                      </h3>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {timeAgo(post.createdAt)}
                        <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                        <Globe className="w-3 h-3 text-muted-foreground/70" />
                      </div>
                    </div>
                  </div>
                  {post.rating && (
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= post.rating!} />)}
                    </div>
                  )}
                </div>

                {/* Title & Content */}
                <div className="space-y-2.5 pt-1">
                  <h2 className="ant-title text-lg font-semibold leading-snug text-foreground sm:text-xl">{post.title}</h2>
                  <div className={`text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap ${post.type === 'feedback' ? 'border-l-4 border-gold/30 pl-4 bg-gold/5 p-3 rounded-r-xl' : ''}`}>
                    {post.content}
                  </div>
                </div>

                {/* Cover / Video */}
                {post.coverUrl && post.type !== 'video' && (
                  <div className="rounded-xl overflow-hidden -mx-5 bg-black/5 flex items-center justify-center relative">
                    <img src={post.coverUrl} alt={post.title} className="w-full h-auto max-h-[60vh] object-contain" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.documentId}/640/360`; }} />
                  </div>
                )}

                {post.type === 'video' && post.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black -mx-5 relative group">
                    {post.coverUrl && <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-60 transition-opacity" />}
                    <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform backdrop-blur-sm">
                        <PlayIcon className="w-8 h-8 ml-1" />
                      </div>
                    </a>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((t) => (
                      <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-muted-foreground/80 lowercase">#{t}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between py-3 border-y border-border text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-500">
                    <HeartIcon filled className="w-3.5 h-3.5" />
                    {fmt(post.likes + (liked ? 1 : 0))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="cursor-pointer hover:text-foreground transition-colors">{comments.length} bình luận</span>
                    <span className="flex items-center gap-1 cursor-default"><EyeIcon className="w-3.5 h-3.5" /> {fmt(post.views)} lượt xem</span>
                  </div>
                </div>



                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                    <ChatIcon className="w-5 h-5 text-gold" /> Bình luận ({comments.length})
                  </h3>

                  {rootComments.length > 0 ? (
                    <div className="space-y-4">
                      {rootComments.map((c) => (
                        <CommentItem
                          key={c.documentId}
                          comment={c}
                          postId={post.documentId}
                          allComments={comments}
                          onRefresh={refreshCurrentPost}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground/60 text-center py-6">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  )}

                  {/* Comment form */}
                  <form onSubmit={handleComment} className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground">Để lại cảm nghĩ</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(!user && !localStorage.getItem('pmtl_author_name')) && (
                        <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Tên bạn *" required className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors" />
                      )}
                    </div>
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Chia sẻ cảm nghĩ, kinh nghiệm của bạn..." required rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Bình luận hiển thị ngay. Nếu bị nhiều báo cáo, hệ thống sẽ tạm ẩn để kiểm tra.</p>
                      <button type="submit" disabled={sending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        <SendIcon />{sending ? 'Đang gửi...' : 'Bình luận'}
                      </button>
                    </div>
                  </form>
                </div> {/* End of Comments Section */}
              </div> {/* End of scrollable body content wrapper px-5 */}
            </div> {/* End of scrollable Body flex-1 */}

            {/* Sticky Actions Footer */}
            <div className="shrink-0 z-10 bg-card/95 backdrop-blur-sm px-6 py-4 border-t border-border flex items-center gap-3">
              <button
                onClick={() => onLike(post.documentId)}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${liked ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                <HeartIcon filled={liked} className="w-5 h-5" />
                {liked ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
              <button
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) form.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all active:scale-[0.98]"
              >
                <ChatIcon className="w-5 h-5" />
                Bình luận
              </button>
              <ReportMenu disabled={reportedPost} onSelect={handleReportPost} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ══════════════════════ SUBMIT POST MODAL ══════════════════════ */
const SubmitModal = ({ open, onOpenChange, user, availableTags, categories }: { open: boolean; onOpenChange: (open: boolean) => void; user: any; availableTags: string[]; categories: string[] }) => {
  const defaultCategory = useMemo(
    () => categories.find((item) => item !== 'Tất cả') ?? 'Tâm Linh',
    [categories],
  );
  const [form, setForm] = useState({
    title: '', content: '', type: 'story', category: defaultCategory,
    author_name: user ? (user.fullName || user.username || user.email || '') : '',
    video_url: '', tags: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      author_name: user ? (user.fullName || user.username || user.email || '') : prev.author_name,
    }));
  }, [user, open]);

  useEffect(() => {
    setForm((prev) => {
      if (categories.includes(prev.category)) return prev;
      return { ...prev, category: defaultCategory };
    });
  }, [categories, defaultCategory]);

  // Cleanup state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setTimeout(() => {
        setForm({
          title: '', content: '', type: 'story', category: defaultCategory,
          author_name: user ? (user.fullName || user.username || user.email || '') : '',
          video_url: '', tags: '',
        });
        setCoverFile(null);
        setCoverPreview(null);
        setSending(false);
        // no-op: keep form state reset on close
      }, 300);
    }
    onOpenChange(newOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const finalAuthorName = user ? (user.fullName || user.username || user.email || '') : form.author_name;
      if (!finalAuthorName.trim()) {
        toast.error('Thiếu tên người đăng bài');
        return;
      }
      let cover_image;
      if (coverFile) {
        cover_image = await uploadFile(coverFile);
      }
      const actorEndpoint = await getCurrentPushEndpoint();
      await submitPost({
        ...form,
        author_name: finalAuthorName,
        video_url: form.video_url || undefined,
        tags: form.tags || undefined,
        cover_image: cover_image || undefined,
        author_avatar: user?.avatar_url || undefined,
        actorUserId: user?.id,
        actorEndpoint,
      });
      toast.success('Bài viết đã được đăng');
      handleOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gửi bài viết thất bại'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-hidden flex w-[calc(100vw-1rem)] flex-col gap-0 border-0 bg-transparent p-0 shadow-none outline-none [&>button:last-child]:hidden sm:rounded-xl"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Đăng Bài Chia Sẻ</DialogTitle>
        </DialogHeader>
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl outline-none sm:rounded-xl">
          <div className="shrink-0 z-10 bg-card/95 backdrop-blur-sm px-6 pt-4 pb-3 border-b border-border flex items-center justify-between">
            <h2 className="ant-title text-lg text-foreground">Đăng Bài Chia Sẻ</h2>
            <button onClick={() => handleOpenChange(false)} className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary transition-colors hover:bg-border"><XIcon className="w-4 h-4" /></button>
          </div>

          <div
            className="flex flex-1 min-h-0 flex-col overflow-hidden"
            data-lenis-prevent
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-4 custom-scrollbar touch-pan-y" data-lenis-prevent style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">Loại bài *</label>
                      <ShadcnSelect value={form.type} onValueChange={(val) => handleSelectChange('type', val)}>
                        <SelectTrigger className="w-full bg-secondary border-border h-10 rounded-lg">
                          <SelectValue placeholder="Chọn loại bài" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">Câu Chuyện</SelectItem>
                          <SelectItem value="feedback">Cảm Ngộ / Trải Nghiệm</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">Danh mục *</label>
                      <ShadcnSelect value={form.category} onValueChange={(val) => handleSelectChange('category', val)}>
                        <SelectTrigger className="w-full bg-secondary border-border h-10 rounded-lg">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </ShadcnSelect>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Tiêu đề *</label>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="Tiêu đề câu chuyện của bạn..." required className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Nội dung *</label>
                    <textarea name="content" value={form.content} onChange={handleChange} placeholder="Chia sẻ câu chuyện, trải nghiệm của bạn..." required rows={6} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 resize-none" />
                  </div>

                  {form.type === 'video' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">Link Video (YouTube, Vimeo...)</label>
                      <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://youtube.com/..." className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Ảnh bìa cho bài viết</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-border/50 transition-colors">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          {coverFile ? 'Đổi ảnh bìa' : 'Tải ảnh lên'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        {coverFile && <span className="text-xs text-muted-foreground truncate w-40">{coverFile.name}</span>}
                      </div>
                      {coverPreview && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-secondary">
                          <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      {!user ? (
                        <>
                          <label className="text-xs text-muted-foreground">Họ tên *</label>
                          <input name="author_name" value={form.author_name} onChange={handleChange} required placeholder="Tên của bạn..." className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
                        </>
                      ) : (
                        <>
                          <label className="text-xs text-muted-foreground">Tài khoản đăng bài</label>
                          <div className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
                            {form.author_name}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">Tags (chọn từ danh sách hoặc nhập mới qua dấu phẩy)</label>
                      {availableTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const currentTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
                                if (!currentTags.includes(tag)) {
                                  handleSelectChange('tags', [...currentTags, tag].join(', '));
                                } else {
                                  handleSelectChange('tags', currentTags.filter(t => t !== tag).join(', '));
                                }
                              }}
                              className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${form.tags.split(',').map(t => t.trim()).includes(tag) ? 'bg-gold text-black border-gold' : 'bg-transparent text-muted-foreground border-border hover:border-gold/40'}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="vd: niệm-phật, trị-bệnh, cảm-ngộ"
                        className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>

                  <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-500">
                    <Info className="w-4 h-4" />
                    <AlertTitle className="text-xs font-semibold">Lưu ý cộng đồng</AlertTitle>
                    <AlertDescription className="text-[10px] leading-relaxed">
                      Bài viết hiển thị ngay. Nếu bị nhiều người báo cáo hoặc có dấu hiệu spam, hệ thống sẽ tạm ẩn để kiểm tra.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="shrink-0 px-6 py-4 border-t border-border bg-card">
                  <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    <SendIcon />{sending ? 'Đang gửi...' : 'Gửi Bài Chia Sẻ'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ══════════════════════ SKELETON ════════════════════════════════ */
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card animate-pulse">
    <div className="aspect-video bg-secondary/50" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-secondary/50 rounded w-3/4" />
      <div className="h-3 bg-secondary/50 rounded w-full" />
      <div className="h-3 bg-secondary/50 rounded w-2/3" />
      <div className="mt-2 h-8 w-24 rounded-md bg-secondary/50" />
    </div>
  </div>
);

/* ══════════════════════ MAIN PAGE ══════════════════════════════ */
export default function SharesClient({
  initialPosts = [],
  initialTotal = 0,
  initialPage = 1,
  availableTags = [],
  categoryOptions = [],
}: {
  initialPosts?: CommunityPost[],
  initialTotal?: number,
  initialPage?: number,
  availableTags?: string[],
  categoryOptions?: string[],
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Đọc params từ URL
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const currentSearch = searchParams.get('q') ?? '';
  const currentCategory = searchParams.get('category') ?? 'Tất cả';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const openPostParam = searchParams.get('post') ?? searchParams.get('open');

  // State
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / PAGINATION.BLOG_PAGE_SIZE) || 1);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const openingParamRef = useRef<string | null>(null);
  const categories = useMemo(() => {
    const source = categoryOptions.length ? categoryOptions : DEFAULT_SHARE_CATEGORIES;
    const cleaned = Array.from(new Set(source.map((item) => item.trim()).filter(Boolean))).filter((item) => item !== 'Tất cả');
    return ['Tất cả', ...cleaned];
  }, [categoryOptions]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pmtl_liked_community');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setLikedIds(new Set(parsed.map(String)));
      }
    } catch { }
  }, []);

  // Đóng filter sheet khi click escape
  useEffect(() => {
    if (!filterOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFilterOpen(false) }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    }
  }, [filterOpen]);

  // Fetch posts khi URL params thay đổi
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { posts: p, total: t } = await fetchPosts({
          search: currentSearch || undefined,
          category: currentCategory === 'Tất cả' ? undefined : currentCategory,
          sort: currentSort,
          page: currentPage,
          pageSize: PAGINATION.BLOG_PAGE_SIZE,
        });
        setPosts(p);
        setTotal(t);
        setTotalPages(Math.ceil(t / PAGINATION.BLOG_PAGE_SIZE) || 1);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentSearch, currentCategory, currentSort, currentPage]);

  // Update URL params
  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 khi thay đổi search/category/sort
    if (key !== 'page') params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [pathname, searchParams, router]);

  const updatePostParam = useCallback((value: string | null) => {
    const currentValue = searchParams.get('post') ?? searchParams.get('open') ?? null;
    if ((value ?? null) === currentValue) return;

    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== '') {
      params.set('post', value);
    } else {
      params.delete('post');
      params.delete('open');
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, searchParams, router]);

  const handleSearch = useCallback((val: string) => {
    updateParam('q', val);
  }, [updateParam]);

  const handleCategory = useCallback((cat: string) => {
    updateParam('category', cat === 'Tất cả' ? null : cat);
    setFilterOpen(false);
  }, [updateParam]);

  const handleSort = useCallback((s: string) => {
    updateParam('sort', s);
  }, [updateParam]);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateParam('page', String(page));
  };

  const clearFilters = () => {
    startTransition(() => { router.push(pathname, { scroll: false }) });
    setFilterOpen(false);
  };

  const handleLike = async (id: string | number) => {
    const sid = String(id);
    if (likedIds.has(sid)) {
      toast.info('Bạn đã thích bài viết này rồi');
      return;
    }

    setLikedIds((prev) => {
      const n = new Set(prev);
      n.add(sid);
      localStorage.setItem('pmtl_liked_community', JSON.stringify(Array.from(n)));
      return n;
    });

    try {
      await likePost(sid);
      toast.success('Đã thích bài viết');
    } catch (error) {
      setLikedIds((prev) => {
        const n = new Set(prev);
        n.delete(sid);
        localStorage.setItem('pmtl_liked_community', JSON.stringify(Array.from(n)));
        return n;
      });
      toast.error(getErrorMessage(error, 'Không thể thích bài viết'));
    }
  };

  const handleOpenPost = useCallback(async (p: CommunityPost) => {
    setSelectedPost(p);
    updatePostParam(p.slug || p.documentId);
    // Tăng lượt xem
    try {
      const newViews = await viewPost(p.documentId);
      if (newViews > 0) {
        setSelectedPost((prev) => prev ? { ...prev, views: newViews } : prev);
        setPosts((current) => current.map((item) => item.documentId === p.documentId ? { ...item, views: newViews } : item));
      }
    } catch { }
  }, [updatePostParam]);

  const refreshSelectedPost = useCallback(async (documentId: string) => {
    const refreshedPost = await fetchPostById(documentId);
    setSelectedPost(refreshedPost);
    setPosts((current) =>
      current.map((item) => (item.documentId === documentId ? { ...item, comments: refreshedPost.comments || [] } : item))
    );
    return refreshedPost;
  }, []);

  useEffect(() => {
    if (!openPostParam) {
      openingParamRef.current = null;
      return;
    }

    if (openingParamRef.current === openPostParam) return;
    if (selectedPost && (selectedPost.documentId === openPostParam || selectedPost.slug === openPostParam)) {
      openingParamRef.current = openPostParam;
      return;
    }

    openingParamRef.current = openPostParam;
    let active = true;

    const openByParam = async () => {
      try {
        const byId = await fetchPostById(openPostParam);
        if (!active) return;
        handleOpenPost(byId);
        return;
      } catch {
        // continue to slug lookup
      }

      try {
        const bySlug = await fetchPostBySlug(openPostParam);
        if (!active) return;
        const full = await fetchPostById(bySlug.documentId);
        if (!active) return;
        handleOpenPost(full);
      } catch {
        // ignore
      }
    };

    openByParam();
    return () => {
      active = false;
    };
  }, [openPostParam, selectedPost, handleOpenPost]);

  const handleClosePost = useCallback(() => {
    setSelectedPost(null);
    if (openPostParam) {
      updatePostParam(null);
    }
  }, [openPostParam, updatePostParam]);

  const pinned = posts.filter((p) => p.pinned);
  const regular = posts.filter((p) => !p.pinned);
  const hasFilter = currentSearch !== '' || currentCategory !== 'Tất cả';
  return (
    <>
      <main className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          {/* ── Hero ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col items-center text-center"
          >
            <div className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">
              Diễn Đàn Đồng Tu
            </div>

            <h1 className="mb-4 font-display text-4xl text-foreground md:text-5xl">
              Người Thật&nbsp;<span className="text-gold">Việc Thật</span>
            </h1>

            <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Những chứng nghiệm từ đồng tu khắp thế giới — mỗi câu chuyện là hạt mầm thiện lành, truyền cảm hứng trên con đường tu học.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setShowSubmit(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gold/90"
              >
                <PlusIcon className="w-4 h-4" />
                Gửi Câu Chuyện
              </button>
              <a
                href="#danh-sach"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/30 hover:text-gold"
              >
                Khám Phá Cộng Đồng
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-xl border border-border bg-card px-6 py-4">
              {[
                { value: total > 0 ? `${total}+` : '—', label: 'Bài Chứng Nghiệm' },
                { value: '50+', label: 'Quốc Gia' },
                { value: '10M+', label: 'Lượt Đọc' },
                { value: '4.9★', label: 'Đánh Giá' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="mb-1 font-body text-2xl font-semibold leading-none tabular-nums text-gold">{s.value}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          {/* ── Pinned Spotlight ─────────────────────────────── */}
          {!loading && pinned.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-dim">
                <Pin className="w-3.5 h-3.5" /> Câu Chuyện Nổi Bật
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pinned.map((post, index) => (
                  <PostCard key={getPostKey(post, index)} post={post} onOpen={handleOpenPost} onLike={handleLike} liked={likedIds.has(String(post.documentId))} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Filter Bar ─────────────────────────────────────── */}
          <motion.div
            id="danh-sach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-10 space-y-4"
          >

            {/* Desktop: Category Pills + Sort Select */}
            <div className="hidden items-start gap-3 md:flex sm:flex-row sm:items-center">
              <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategory(cat)}
                    className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${currentCategory === cat
                      ? 'filter-chip-active text-sm'
                      : 'filter-chip-idle text-sm'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-44 shrink-0">
                <ShadcnSelect value={currentSort} onValueChange={handleSort}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-border bg-card/85 text-sm">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới Nhất</SelectItem>
                    <SelectItem value="popular">Nhiều Xem Nhất</SelectItem>
                    <SelectItem value="most_liked">Nhiều Tim Nhất</SelectItem>
                  </SelectContent>
                </ShadcnSelect>
              </div>
            </div>

            {/* Mobile: Filter Button + Sticky Bar */}
            <div className="sticky top-14 z-30 -mx-4 flex items-center gap-3 border-b border-border bg-background/88 px-4 py-3 backdrop-blur-md md:hidden">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                <input
                  type="text"
                  defaultValue={currentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm bài..."
                  className="toolbar-search pl-12"
                />
              </div>
              <button
                onClick={() => setFilterOpen(true)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${hasFilter
                  ? 'filter-chip-active'
                  : 'filter-chip-idle'
                  }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bộ lọc</span>
                {hasFilter && <span className="h-1.5 w-1.5 rounded-sm bg-gold" />}
              </button>
            </div>
          </motion.div>

          {/* ── MOBILE: Bottom Sheet Overlay ── */}
          <AnimatePresence>
            {filterOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFilterOpen(false)}
                  className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                />
                {/* Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="overlay-shell fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t md:hidden"
                >
                  {/* Handle bar */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-sm bg-border" />
                  </div>
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <div>
                      <h3 className="ant-title text-base text-foreground">Bộ Lọc & Sắp Xếp</h3>
                      <p className="text-[11px] text-muted-foreground">{total.toLocaleString('vi-VN')} bài viết</p>
                    </div>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Content */}
                  <div className="p-5 pb-10 space-y-5">
                    {/* categories */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Danh Mục</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategory(cat)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentCategory === cat
                              ? 'filter-chip-active'
                              : 'filter-chip-idle'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Sắp Xếp</p>
                      <div className="space-y-2">
                        {[
                          { value: 'newest', label: 'Mới Nhất' },
                          { value: 'popular', label: 'Nhiều Xem Nhất' },
                          { value: 'most_liked', label: 'Nhiều Tim Nhất' }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { handleSort(opt.value); setFilterOpen(false); }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${currentSort === opt.value
                              ? 'filter-chip-active'
                              : 'filter-chip-idle'
                              }`}
                          >
                            {opt.label}
                            {currentSort === opt.value && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasFilter && (
                      <button
                        onClick={clearFilters}
                        className="w-full rounded-lg border border-gold/20 py-2 text-sm text-gold-dim transition-colors hover:bg-gold/5"
                      >
                        × Xóa toàn bộ bộ lọc
                      </button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Main: Feed + Sidebar ─────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-10 ">

            {/* Feed (2/3) */}
            <div className="flex-1 min-w-0">
              {/* Results bar */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                  <span>
                    <span className="text-foreground font-medium">{posts.length}</span>
                    {' '}/ <span className="text-foreground font-medium">{total.toLocaleString('vi-VN')}</span> bài
                  </span>
                  {hasFilter && (
                    <button
                      onClick={clearFilters}
                      className="ml-1 text-xs text-gold-dim hover:underline"
                    >
                      × Xóa lọc
                    </button>
                  )}
                </p>
                <span className="text-xs text-muted-foreground/60">Trang {currentPage}/{totalPages}</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : regular.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regular.map((post, i) => (
                      <motion.div
                        key={getPostKey(post, i)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.4, delay: (i % 2) * 0.07 }}
                      >
                        <PostCard
                          post={post}
                          onOpen={handleOpenPost}
                          onLike={handleLike}
                          liked={likedIds.has(String(post.documentId))}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <SharesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                  <QuoteIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="ant-title mb-2 text-xl text-foreground">
                    {posts.length === 0 && !currentSearch && currentCategory === 'Tất cả' ? 'Chưa có bài chia sẻ nào' : 'Không tìm thấy kết quả'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {posts.length === 0 && !currentSearch && currentCategory === 'Tất cả'
                      ? 'Hãy là người đầu tiên chia sẻ câu chuyện của bạn!'
                      : 'Thử từ khóa khác hoặc đổi danh mục.'}
                  </p>
                  {hasFilter && (
                    <button
                      onClick={clearFilters}
                      className="mr-3 rounded-xl bg-secondary px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-border"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="rounded-xl bg-gold px-5 py-2.5 text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:opacity-95"
                  >
                    Đăng bài ngay
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5 lg:sticky lg:top-24">

              {/* Community stats */}
              <div className="panel-shell-strong p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gold-dim">Cộng Đồng</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: total > 0 ? `${total}+` : '—', label: 'Câu Chuyện' },
                    { value: '50+', label: 'Quốc Gia' },
                    { value: '10M+', label: 'Lượt Đọc' },
                    { value: '4.9★', label: 'Đánh Giá' },
                  ].map((s) => (
                    <div key={s.label} className="text-center py-2">
                      <p className="mb-0.5 font-body text-xl font-semibold leading-none tabular-nums text-gold-dim">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic cloud */}
              <div className="panel-shell p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Chủ Đề Tu Học</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategory('Tất cả')}
                    className={`rounded-md px-3 py-1 text-xs transition-all ${currentCategory === 'Tất cả'
                      ? 'filter-chip-active'
                      : 'filter-chip-idle'
                      }`}
                  >
                    Tất cả
                  </button>
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategory(cat)}
                      className={`rounded-md px-3 py-1 text-xs transition-all ${currentCategory === cat
                        ? 'filter-chip-active'
                        : 'filter-chip-idle'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editorial invitation */}
              <div className="panel-shell relative overflow-hidden p-6">
                <QuoteIcon className="absolute right-3 top-3 h-14 w-14 text-gold/[0.06]" />
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gold-dim">Câu Chuyện Của Bạn</p>
                <h3 className="ant-title mb-2 text-lg leading-tight text-foreground">
                  Chia sẻ chứng<br />nghiệm tu học
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  Mỗi câu chuyện là hạt giống thiện lành. Kinh nghiệm của bạn có thể là ánh sáng cho ai đó đang tìm đường.
                </p>
                <div className="space-y-2.5 mb-5">
                  {[
                    'Viết câu chuyện của bạn',
                    'Kiểm duyệt trong 24 giờ',
                    'Lan tỏa đến cộng đồng',
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold-dim">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowSubmit(true)}
                  className="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:opacity-95"
                >
                  Đăng Bài Chia Sẻ
                </button>
              </div>

            </aside>
          </div>
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <DetailModal
        post={selectedPost}
        onClose={handleClosePost}
        onLike={handleLike}
        liked={selectedPost ? likedIds.has(selectedPost.documentId) : false}
        onRefreshPost={refreshSelectedPost}
      />

      <SubmitModal open={showSubmit} onOpenChange={setShowSubmit} user={user} availableTags={availableTags} categories={categories} />
    </>
  );
}
