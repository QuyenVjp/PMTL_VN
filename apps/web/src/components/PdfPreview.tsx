'use client';
// ─────────────────────────────────────────────────────────────────────────
//  components/PdfPreview.tsx
//  Component tái sử dụng để xem preview PDF hoặc tải xuống bất kỳ file nào.
//  Dùng thẻ <embed> / <iframe> để preview PDF ngay trong trình duyệt.
//  Không dùng thư viện ngoài — hỗ trợ 100% các PDF viewer tích hợp sẵn.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────

export interface PreviewableFile {
  id: number;
  name: string;
  url: string;        // URL tuyệt đối
  mime: string;       // vd: 'application/pdf', 'image/jpeg'
  size: number;       // bytes
  ext?: string;       // vd: '.pdf'
  description?: string | null;
}

interface PdfPreviewProps {
  file: PreviewableFile;
  className?: string;
  /** Nếu true, hiện nút preview trước — click mới load */
  lazyLoad?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file: PreviewableFile): boolean {
  return file.mime === 'application/pdf' || file.ext === '.pdf';
}

function isImage(file: PreviewableFile): boolean {
  return file.mime?.startsWith('image/') ?? false;
}

// ─── Icons (nội tuyến để không phụ thuộc thêm) ───────────────────────────

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);

const IconFile = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── PdfPreview Component ─────────────────────────────────────────────────

export default function PdfPreview({ file, className = '', lazyLoad = true }: PdfPreviewProps) {
  const [showPreview, setShowPreview] = useState(!lazyLoad);

  const canPreview = isPdf(file) || isImage(file);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* File info bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <IconFile className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canPreview && (
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-gold hover:bg-primary/20 transition-colors"
            >
              <IconEye /> {showPreview ? 'Ẩn' : 'Xem'}
            </button>
          )}
          <a
            href={file.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-border transition-colors text-foreground"
          >
            <IconDownload /> Tải xuống
          </a>
        </div>
      </div>

      {/* Preview panel */}
      <AnimatePresence>
        {showPreview && canPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground truncate max-w-xs">{file.name}</p>
              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold hover:underline"
                >
                  Mở tab mới ↗
                </a>
                <button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <IconClose />
                </button>
              </div>
            </div>
            {isPdf(file) ? (
              // PDF: nhúng bằng embed — hỗ trợ tốt nhất trên Chrome/Edge/Firefox
              <embed
                src={`${file.url}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full"
                style={{ height: '75vh', minHeight: '500px' }}
              />
            ) : isImage(file) ? (
              // Ảnh: hiển thị inline
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.url} alt={file.name} className="w-full h-auto object-contain max-h-[75vh]" loading="lazy" />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
