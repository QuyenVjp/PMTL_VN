import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
        // Dùng 127.0.0.1 thay localhost — Windows Node 18+ resolve localhost → ::1 (IPv6)
        // mà API NestJS listen trên IPv4 → gây ECONNREFUSED
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[vite-proxy] API unreachable:", err.message);
          });
        },
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
