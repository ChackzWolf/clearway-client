import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Clearway — Debt Free & Saving",
        short_name: "Clearway",
        description: "Track debt payoff and goal-based savings for your household.",
        theme_color: "#3B6FF2",
        background_color: "#0B0D12",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache the API's read-only GETs (dashboard, debts, buckets) so the
        // app opens instantly offline; writes (payments, allocations) queue
        // via the network-only default and just fail gracefully offline for now.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/dashboard") || url.pathname.includes("/buckets"),
            handler: "NetworkFirst",
            options: { cacheName: "clearway-api-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } },
          },
        ],
      },
    }),
  ],
});
