import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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
  plugins: [react(), tailwindcss()],
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
