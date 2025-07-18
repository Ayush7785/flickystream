/// <reference lib="webworker" />
/// <reference path="./workbox.d.ts" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";
import type { RuntimeCaching } from "workbox-build";

declare const self: ServiceWorkerGlobalScope;

interface TMDBResponse {
  error?: { message: string };
  data: unknown;
}

const CACHE_VERSION = `v${pkg.version}`;
const CACHE_NAMES = {
  pages: `pages-cache-${CACHE_VERSION}`,
  static: `static-assets-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  tmdbApi: `tmdb-api-${CACHE_VERSION}`,
  tmdbImages: `tmdb-images-${CACHE_VERSION}`,
  firebaseData: `firebase-data-${CACHE_VERSION}`,
  googleApis: `google-apis-${CACHE_VERSION}`,
};

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    minify: "esbuild",
    sourcemap: mode !== "production",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-components": [
            "@radix-ui/react-*"
          ],
          "firebase-auth": ["firebase/auth", "@firebase/auth"],
          "data-visualization": ["recharts"],
          "icons": ["lucide-react", "react-icons", "react-feather"],
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-icon-180.png",
        "manifest-icon-192.maskable.png",
        "manifest-icon-512.maskable.png",
        "offline.html",
      ],
      manifest: {
        name: "FlickyStream",
        short_name: "FlickyStream",
        description: "Stream movies and TV shows online",
        theme_color: "#00ffff",
        background_color: "#1a1a1a",
        display: "fullscreen",
        display_override: ["fullscreen"],
        scope: "/",
        start_url: "/",
        orientation: "any",
        icons: [
          { src: "icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
          { src: "icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        screenshots: [
          {
            src: "/screenshots/1.png",
            sizes: "1280x720",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2,ttf}"],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: CACHE_NAMES.pages,
              networkTimeoutSeconds: 3,
              plugins: [
                {
                  requestWillFetch: async ({ event }) => {
                    const preload = await event?.preloadResponse;
                    return preload || event.request;
                  },
                  handlerDidError: async () => {
                    const cache = await self.caches.open(CACHE_NAMES.pages);
                    return cache.match("/offline.html");
                  },
                },
              ],
            },
          },
          {
            urlPattern: /\.(css|js|woff2|ttf)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: CACHE_NAMES.static,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: CACHE_NAMES.images,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [
                {
                  handlerDidError: async () => {
                    const cache = await self.caches.open(CACHE_NAMES.static);
                    return cache.match("/placeholder.svg");
                  },
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/3\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: CACHE_NAMES.tmdbApi,
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400,
              },
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    if (response?.status === 200) {
                      const json = await response.clone().json();
                      return json?.error ? null : response;
                    }
                    return null;
                  },
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: CACHE_NAMES.tmdbImages,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
              matchOptions: { ignoreVary: true },
              plugins: [
                {
                  handlerDidError: async () => {
                    const cache = await self.caches.open(CACHE_NAMES.static);
                    return cache.match("/placeholder.svg");
                  },
                },
              ],
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.includes("firebase") || url.hostname.includes("firebaseio.com"),
            handler: "NetworkOnly",
            options: {
              plugins: [
                {
                  fetchDidFail: async () => {
                    console.error("Firebase request failed.");
                  },
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/(apis\.google\.com|www\.googleapis\.com)\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: CACHE_NAMES.googleApis,
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600,
              },
              plugins: [
                {
                  handlerDidError: async ({ request }) => {
                    console.error("Google API request failed:", request.url);
                    return undefined;
                  },
                },
              ],
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigationPreload: true,
        offlineGoogleAnalytics: {
          parameterOverrides: {
            cd1: "offline",
          },
        },
      },
      devOptions: {
        enabled: mode !== "production",
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
