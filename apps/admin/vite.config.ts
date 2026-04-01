import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveApiProxyTarget(): string {
  const raw = process.env.VITE_API_BASE_URL?.trim();
  if (!raw) {
    return "http://127.0.0.1:3001";
  }

  // Accept both origin-only and /api-suffixed values from env.
  // Vite proxy target must be origin to avoid /api/api/* duplication.
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return "http://127.0.0.1:3001";
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // Network-first for API — always prefer fresh data from server
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "pmtl-admin-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 },
            },
          },
          // Cache-first for static assets (JS/CSS/fonts/images)
          {
            urlPattern: /\.(js|css|woff2?|png|svg|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pmtl-admin-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
        // Offline fallback: serve the SPA shell when network unavailable
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\/queues/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "PMTL Admin",
        short_name: "PMTL",
        description: "PMTL Admin — quản trị nội dung & kiểm duyệt",
        theme_color: "#1e293b",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
        ],
      },
      devOptions: {
        // Enable PWA in dev for testing offline fallback
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3002,
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: resolveApiProxyTarget(),
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[vite-proxy] API unreachable:", err.message);
          });
        },
      },
      "/media": {
        target: resolveApiProxyTarget(),
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("@tanstack")) {
            return "tanstack";
          }

          if (id.includes("@radix-ui") || id.includes("cmdk")) {
            return "radix";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }
        },
      },
    },
  },
});
