// ─────────────────────────────────────────────────────────────
//  public/sw.js — Service Worker cho PWA
//  Cache-first cho static assets, network-only cho API/pages
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'pmtl-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// ── Install: pre-cache shell ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => { })
    })
  )
  self.skipWaiting()
})

// ── Activate: xóa cache cũ ───────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch strategy ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Bỏ qua các request không phải GET và các request cross-origin
  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // 1. API & Navigation (Pages): Network-only để tránh Ctrl+R lấy cache cũ
  const isApi = url.pathname.startsWith('/api/')
  const isPage = event.request.mode === 'navigate'

  if (isApi || isPage) {
    event.respondWith(fetch(event.request))
    return
  }

  // 2. Static Assets (JS, CSS, Images, Fonts): Cache-First
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2')

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((res) => {
          if (res.ok && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return res
        })
      })
    )
    return
  }
})

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pháp Môn Tâm Linh', {
      body: data.body || 'Nhắc nhở niệm kinh hôm nay',
      icon: '/images/PMTL-LOGO.png',
      badge: '/images/PMTL-LOGO.png',
      tag: data.tag || 'pmtl-reminder',
      data: { url: data.url || '/niem-kinh' },
      actions: [
        { action: 'open', title: 'Mở ngay' },
        { action: 'dismiss', title: 'Để sau' },
      ],
    })
  )
})

// ── Notification click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/niem-kinh'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(targetUrl))
      if (existing) return existing.focus()
      return self.clients.openWindow(targetUrl)
    })
  )
})
