import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      filename: "sw.js",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "우리회계",
        short_name: "우리회계",
        description: "소규모 조직을 위한 회계 관리 어플리케이션",
        theme_color: "#667eea",
        background_color: "#f5f5f5",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // 빌드 성능 최적화: dist 디렉토리 내의 필수 파일만 스캔
        globPatterns: [
          "assets/**/*.{js,css}",
          "*.{html,ico,png,svg,webmanifest}",
          "favicon-*.png",
          "apple-touch-icon.png",
          "pwa-*.png",
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // 빌드 성능 개선: 불필요한 파일 제외
        globIgnores: [
          "**/node_modules/**/*",
          "**/.git/**/*",
          "**/.vscode/**/*",
          "**/src/**/*",
          "**/*.map",
          "sw.js",
          "workbox-*.js",
          "registerSW.js",
        ],
        // Service Worker 파일명 명시
        swDest: "sw.js",
        // 빌드 성능 최적화: 디렉토리 스캔 범위 제한
        globDirectory: "dist",
        // 캐싱 전략 단순화
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw-custom.js",
      devOptions: {
        enabled: false, // 개발 중에는 비활성화 (필요시 true로 변경)
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173, // 터널이 프록시하는 포트
    host: true, // 0.0.0.0 바인딩
    // 방법 1) 해당 호스트 하나만 허용
    // allowedHosts: ["chorus-dat-separated-val.trycloudflare.com"],

    // 방법 2) trycloudflare 전체 허용(테스트/임시 주소가 자주 바뀔 때 추천)
    allowedHosts: [".trycloudflare.com"],
  },
});
