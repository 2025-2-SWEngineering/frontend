import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    allowedHosts: ["woori-accounting.site", "3.25.235.88", "www.woori-accounting.site"],
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ["woori-accounting.site", "www.woori-accounting.site", "3.25.235.88"],
  },
});
