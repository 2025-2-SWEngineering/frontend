// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Web Push - Service Worker (ESM module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getMessaging,
  onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-sw.js";

const firebaseConfig = {
  apiKey: "AIzaSyAonylZ_Bbh2GdodyVfFKi4sm7TqMirbzY",
  authDomain: "swengineering-80720.firebaseapp.com",
  projectId: "swengineering-80720",
  messagingSenderId: "919454578960",
  appId: "1:919454578960:web:d3729a139cf6246a7a8d95",
};

// Firebase 앱 & Messaging (SW 전용)
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 설치 후 바로 활성화되도록 (no active Service Worker 방지용)
self.addEventListener("install", (event) => {
  // 바로 활성화 상태로 전환
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 이 서비스워커가 기존 페이지들을 바로 컨트롤하도록
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await self.clients.claim();
    })(),
  );
});

// 🔥 알림 클릭 시 동작
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  // 백엔드에서 data.url 을 같이 보내면 그걸 쓰고,
  // 아니면 기본으로 루트("/")로 이동
  const urlFromData = data.url;
  const targetUrl = urlFromData || "/";

  event.waitUntil(
    (async () => {
      // 이미 열려 있는 탭이 있으면 포커스, 없으면 새 창/탭 오픈
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          // URL 매칭이 필요하면 여기서 client.url.includes(...) 로 비교해서 필터링 가능
          return client.focus();
        }
      }

      // 열려 있는 탭이 없으면 새로운 탭/창 오픈
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
