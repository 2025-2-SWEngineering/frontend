/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

self.skipWaiting();
self.clients.claim();

// 빌드 시 __WB_MANIFEST가 주입됩니다.
precacheAndRoute(self.__WB_MANIFEST);

// API 캐싱: NetworkFirst
registerRoute(
  /^https:\/\/api\./i,
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 }),
    ],
  }),
);

// 푸시 알림 수신 이벤트 리스너
self.addEventListener("push", (event: PushEvent) => {
  let notificationData: any = {
    title: "우리회계",
    body: "새로운 알림이 있습니다.",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || notificationData.data,
      };
    } catch (e) {
      const text = event.data.text();
      if (text) {
        notificationData.body = text;
      }
    }
  }

  const showPromise = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    tag: (notificationData.data && notificationData.data.type) || "default",
    requireInteraction: false,
  });

  event.waitUntil(showPromise);
});

// 알림 클릭 이벤트 리스너
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const data: any = event.notification.data || {};
  let url = "/dashboard";

  if (data.type === "dues_reminder" && data.groupId) {
    url = `/dashboard?groupId=${data.groupId}`;
  }

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i] as WindowClient;
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
