import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

// Amazon Linux 감지 및 빠른 모드 기본 적용
const isAmazonLinux = (() => {
  try {
    const osr = readFileSync("/etc/os-release", "utf-8");
    return /Amazon Linux/i.test(osr);
  } catch {
    return false;
  }
})();

// 빠른 PWA 빌드를 위한 플래그 (PWA_FAST=1 npm run build)
const isPwaFast = process.env.PWA_FAST === "1" || process.env.PWA_FAST === "true" || isAmazonLinux;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // 빠른 빌드 모드에서는 SW minify를 비활성화해 시간 단축
      minify: isPwaFast ? false : true,
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
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: isPwaFast
        ? {
            // 빠른 모드: 필수 파일만 precache
            globPatterns: ["assets/index-*.{js,css}", "index.html"],
            maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
            globIgnores: ["**/*.map"],
          }
        : {
            // 기본 모드: 아이콘/manifest 포함
            globPatterns: [
              "assets/index-*.{js,css}",
              "index.html",
              "manifest.webmanifest",
              "favicon.ico",
              "favicon-16x16.png",
              "favicon-32x32.png",
              "apple-touch-icon.png",
              "pwa-192x192.png",
              "pwa-512x512.png",
            ],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            globIgnores: [
              "**/node_modules/**",
              "**/.git/**",
              "**/.vscode/**",
              "**/src/**",
              "**/*.map",
              "sw.js",
              "workbox-*.js",
              "registerSW.js",
              "site.webmanifest",
            ],
          },
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
