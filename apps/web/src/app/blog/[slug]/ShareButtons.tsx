'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  Facebook,
  Link as LinkIcon
} from 'lucide-react'
import { toast } from 'sonner'

export default function ShareButtons({ url, content }: { url: string; content?: string }) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const copyToClipboard = async (text: string, type: 'link' | 'content') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        setCopiedContent(true)
        setTimeout(() => setCopiedContent(false), 2000)
      }
      toast.success(type === 'link' ? 'Đã sao chép liên kết!' : 'Đã sao chép nội dung!')
    } catch {
      toast.error('Không thể sao chép')
    }
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank')
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-6 border-y border-border/50 my-10">
      <span className="text-sm font-medium text-muted-foreground mr-2">Chia sẻ & Lưu trữ:</span>

      {/* Copy Link */}
      <button
        onClick={() => copyToClipboard(fullUrl, 'link')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-gold/10 hover:text-gold transition-colors text-xs font-medium border border-transparent hover:border-gold/20"
        title="Sao chép liên kết"
      >
        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
        {copiedLink ? 'Đã chép' : 'Sao chép link'}
      </button>

      {/* Copy Content */}
      <button
        onClick={() => {
          const plainContent = content?.replace(/<[^>]*>/g, '').trim() || ''
          const prayer = "Xin Quán Thế Âm Bồ Tát từ bi, nếu trong quá trình con dịch và chia sẻ, có chỗ nào không đúng lý, không đúng pháp, xin Quán Thế Âm Bồ Tát, Chư vị Thần Hộ Pháp có thể tha thứ cho con."
          const textToCopy = `${plainContent}\n\n${prayer}\n\nXem thêm tại: ${fullUrl}`
          copyToClipboard(textToCopy, 'content')
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-gold/10 hover:text-gold transition-colors text-xs font-medium border border-transparent hover:border-gold/20"
        title="Sao chép nội dung bài viết"
      >
        {copiedContent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        Sao chép bài viết
      </button>

      {/* Facebook */}
      <button
        onClick={shareFacebook}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors text-xs font-medium border border-[#1877F2]/20"
      >
        <Facebook className="w-3.5 h-3.5" />
        Facebook
      </button>
    </div>
  )
}
