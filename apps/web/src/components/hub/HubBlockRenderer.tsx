// components/hub/HubBlockRenderer.tsx
// Renderer với spacing rhythm — visual cadence, không flat space-y-4
import type { HubBlock } from '@/types/strapi'
import RichTextBlock from './blocks/RichTextBlock'
import PostListManualBlock from './blocks/PostListManualBlock'
import PostListAutoBlock from './blocks/PostListAutoBlock'
import DownloadGridBlock from './blocks/DownloadGridBlock'

interface HubBlockRendererProps {
  blocks?: HubBlock[]
  theme?: 'teaching' | 'practice' | 'story' | 'reference' | null
}

export default function HubBlockRenderer({ blocks, theme }: HubBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null

  // Spacing dựa trên theme: story cần thoáng, reference cần gọn
  const spacingClass = theme === 'story' ? 'space-y-24' : theme === 'reference' ? 'space-y-12' : 'space-y-16'

  return (
    <div className={spacingClass}>
      {blocks.map((block, index) => {
        // Divider bespoke theo theme
        let divider = null
        if (index > 0) {
          switch (theme) {
            case 'story':
              divider = (
                <div className="flex items-center justify-center mb-16 opacity-30">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                  <span className="mx-4 text-lg">❦</span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                </div>
              )
              break
            case 'teaching':
              divider = (
                <div className="flex items-center gap-4 mb-12">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                  <span className="text-gold/40 text-[10px] tracking-widest uppercase">Nam Mô A Di Đà Phật</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                </div>
              )
              break
            case 'practice':
              divider = (
                <div className="flex items-center justify-center mb-10">
                  <div className="w-24 h-px bg-gold/10" />
                  <div className="mx-3 h-2 w-2 rounded-md border border-gold/30" />
                  <div className="w-24 h-px bg-gold/10" />
                </div>
              )
              break
            case 'reference':
              divider = <div className="h-px bg-border/40 mb-10" />
              break
            default:
              divider = (
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
                  <span className="text-gold/30 text-xs">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
                </div>
              )
          }
        }

        switch (block.__component) {
          case 'blocks.rich-text':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <RichTextBlock content={block.content} />
              </div>
            )

          case 'blocks.post-list-manual':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <PostListManualBlock
                  heading={block.heading}
                  description={block.description}
                  posts={block.posts}
                />
              </div>
            )

          case 'blocks.post-list-auto':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <PostListAutoBlock
                  heading={block.heading}
                  description={block.description}
                  category={block.category}
                  count={block.count}
                />
              </div>
            )

          case 'blocks.download-grid':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <DownloadGridBlock
                  heading={block.heading}
                  description={block.description}
                  downloads={block.downloads}
                />
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
