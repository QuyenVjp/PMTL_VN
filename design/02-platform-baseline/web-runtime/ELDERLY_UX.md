# Elderly UX Rules

File này chốt nguyên tắc UX cho nhóm người dùng lớn tuổi.

## Nguyên tắc gốc

- ít bước
- chữ to
- tương phản cao
- tránh chuyển cảnh phức tạp
- ưu tiên thao tác quen thuộc, giống đời thật

## Áp dụng theo module

### Ngôi Nhà Nhỏ
- giao diện gần giấy thật
- thao tác "chấm" rõ ràng
- không dùng animation thừa

### Bài tập hằng ngày
- thứ tự bài đọc rõ
- một màn hình tập trung
- phase 1 dùng light mode tương phản cao; `chế độ đọc đêm` chỉ cân nhắc ở phase 2+ theo `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`

### Bạch thoại Phật pháp
- font to
- line-height thoáng
- nút nghe rõ
- lưu vị trí đọc đơn giản

### Huyền học vấn đáp
- ô tìm kiếm lớn
- gợi ý từ khóa quen thuộc
- kết quả ít nhưng đúng

### Lịch tu học
- hiển thị ngày quan trọng thật rõ
- không nhồi quá nhiều badge nhỏ khó đọc

## Không nên làm

- micro-interactions dày
- carousel phức tạp
- quá nhiều tab phụ
- icon-only actions không có text
- gamification gây nhiễu

## Accessibility baseline

- text size phải scale được
- touch target lớn
- audio controls đơn giản
- không bắt user nhớ quá nhiều gesture

## Offline-First & Low-Bandwidth Support

### Nguyên tắc

Người cao tuổi thường dùng mạng 3G/4G yếu hoặc ở vùng sóng không ổn định.
PMTL phải hoạt động tốt trong điều kiện bandwidth thấp.

### Progressive Loading Strategy

```typescript
// 1. Critical CSS inline (< 14KB)
// 2. Above-the-fold images: eager load
// 3. Below-the-fold: lazy load với skeleton
// 4. Audio/video: stream không tải trước

// Component example
export function ContentCard({ content }) {
  return (
    <article>
      {/* Critical: Text first */}
      <h2>{content.title}</h2>
      <p>{content.excerpt}</p>
      
      {/* Deferred: Image lazy */}
      <Image
        src={content.thumbnail}
        loading="lazy"
        placeholder="blur"
        blurDataURL={content.thumbBlurHash}
      />
    </article>
  );
}
```

### Service Worker (PWA)

```javascript
// public/sw.js - Cache-first cho static assets
const CACHE_NAME = 'pmtl-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first with timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        ),
      ]).catch(() => {
        // Return cached version or offline message
        return caches.match(request) || caches.match('/offline');
      })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      });
    })
  );
});
```

### PWA Manifest

```json
// public/manifest.json
{
  "name": "Phật Mẫu Thiên Lý",
  "short_name": "PMTL",
  "description": "Tu học Phật pháp hằng ngày",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Offline Bundles (Phase 2)

Pre-download content cho offline reading:

```typescript
// Offline bundle cho daily practice
export async function downloadDailyBundle() {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's content IDs
  const bundle = await fetch(`/api/offline/daily-bundle?date=${today}`);
  const { articles, audio } = await bundle.json();
  
  // Cache articles (text-only, small)
  const textCache = await caches.open('pmtl-content');
  for (const article of articles) {
    await textCache.put(`/articles/${article.id}`, new Response(article.html));
  }
  
  // Optional: Cache audio (user-initiated, large)
  if (navigator.storage?.estimate) {
    const { quota, usage } = await navigator.storage.estimate();
    const available = (quota || 0) - (usage || 0);
    
    // Only cache audio if > 100MB available
    if (available > 100 * 1024 * 1024) {
      for (const track of audio) {
        const audioResp = await fetch(track.url);
        await textCache.put(track.url, audioResp);
      }
    }
  }
}
```

### Low-Bandwidth Optimizations

| Asset | Full | Low-BW mode |
|-------|------|-------------|
| Images | Full size | WebP @ 60% quality |
| Thumbnails | 320px | 150px |
| Audio | 128kbps | 64kbps |
| Fonts | Full set | Subset Vietnamese |
| JavaScript | Full bundle | Core only |

Detection:

```typescript
// Detect slow connection
function isSlowConnection(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return false;
  
  return (
    conn.saveData ||
    conn.effectiveType === '2g' ||
    conn.effectiveType === 'slow-2g' ||
    conn.downlink < 1.5
  );
}

// Use in components
export function AudioPlayer({ src, lowBwSrc }) {
  const slow = isSlowConnection();
  return (
    <audio src={slow ? lowBwSrc : src} controls preload={slow ? 'none' : 'metadata'} />
  );
}
```

### Offline Page

```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Không có kết nối mạng</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Vui lòng kiểm tra kết nối internet và thử lại.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg"
      >
        Thử lại
      </button>
      
      {/* Show cached content if available */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Nội dung đã lưu</h2>
        <CachedContentList />
      </div>
    </main>
  );
}
```

### Checklist

- [ ] PWA manifest.json
- [ ] Service worker registration
- [ ] Offline fallback page
- [ ] Image lazy loading
- [ ] Audio streaming (không buffer toàn bộ)
- [ ] Connection quality detection
- [ ] Low-bandwidth image variants
- [ ] Daily bundle download (Phase 2)
- [ ] Storage quota management

## Notes for AI/codegen

- Khi có hai lựa chọn, chọn phương án ít thông minh hơn nhưng dễ dùng hơn.
- Ưu tiên đúng, rõ, quen thuộc hơn là mới lạ.
- Offline-first không có nghĩa là full offline app — chỉ cần graceful degradation.
