// Service Worker for PMTL PWA
// Enterprise 2026: Offline-first for elderly users on weak 3G/4G

const CACHE_VERSION = "pmtl-v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const CONTENT_CACHE = `content-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;

// Critical static assets
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CONTENT_CACHE && name !== AUDIO_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - routing strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network-first with 5s timeout
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTimeout(request, 5000));
    return;
  }

  // Audio files: Cache-first (large files)
  if (url.pathname.includes("/audio/") || url.pathname.match(/\.(mp3|m4a)$/)) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
    return;
  }

  // Content (kinh điển, bài học): Stale-while-revalidate
  if (url.pathname.startsWith("/content/") || url.pathname.startsWith("/kinh-dien/")) {
    event.respondWith(staleWhileRevalidate(request, CONTENT_CACHE));
    return;
  }

  // Static assets: Cache-first
  if (STATIC_ASSETS.some((asset) => url.pathname === asset)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirstWithTimeout(request, 3000));
});

// Strategy: Cache-first
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    // Return offline fallback
    return caches.match("/offline");
  }
}

// Strategy: Network-first with timeout
async function networkFirstWithTimeout(request, timeout) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network timeout")), timeout)
      ),
    ]);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CONTENT_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    // Try cache fallback
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page
    return caches.match("/offline");
  }
}

// Strategy: Stale-while-revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Background revalidate
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  // Return cached immediately, or wait for network
  return cached || fetchPromise;
}

// Background sync for offline actions (future enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-prayers") {
    event.waitUntil(syncPrayers());
  }
});

async function syncPrayers() {
  // Sync offline prayer completions when back online
  const db = await openDB();
  const pendingPrayers = await db.getAll("pending-prayers");

  for (const prayer of pendingPrayers) {
    try {
      await fetch("/api/prayers/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prayer),
      });
      await db.delete("pending-prayers", prayer.id);
    } catch (error) {
      console.error("Failed to sync prayer:", error);
    }
  }
}

function openDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open("pmtl-offline", 1);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending-prayers")) {
        db.createObjectStore("pending-prayers", { keyPath: "id" });
      }
    };
  });
}
