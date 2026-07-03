import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/cashback-ua/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "icons/icon.svg",
        "icons/pwa-192.png",
        "icons/pwa-512.png",
        "logos/abank.svg",
        "logos/monobank.svg",
        "logos/pumb.svg",
        "logos/kasta.svg",
        "logos/raiffeisen.svg",
        "logos/sense.svg",
      ],
      manifest: {
        name: "Cashback UA",
        short_name: "Cashback UA",
        description: "Порівняння кешбеків українських банків",
        lang: "uk",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#0b0e11",
        theme_color: "#0b0e11",
        icons: [
          {
            src: "icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes("/logos/") ||
              url.pathname.includes("/icons/"),
            handler: "CacheFirst",
            options: {
              cacheName: "cashback-static-assets",
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
