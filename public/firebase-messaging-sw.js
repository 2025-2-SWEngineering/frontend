// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* public/firebase-messaging-sw.js */
/* FCM 서비스워커 (compat 방식, import 없이) */

/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

// 1) Firebase SDK v8 compat 로드
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// 2) 웹에서 쓰는 것과 동일한 firebaseConfig 사용
firebase.initializeApp({
  apiKey: "AIzaSyAonylZ_Bbh2GdodyVfFKi4sm7TqMirbzY",
  authDomain: "swengineering-80720.firebaseapp.com",
  projectId: "swengineering-80720",
  messagingSenderId: "919454578960",
  appId: "1:919454578960:web:d3729a139cf6246a7a8d95",
});

// 3) messaging 인스턴스
const messaging = firebase.messaging();

// 4) 설치/활성화 훅
// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener("install", (_event) => {
  // 바로 활성화 상태로 전환
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 모든 클라이언트 탭을 바로 이 SW가 컨트롤
      await self.clients.claim();
    })(),
  );
});

// 5) 알림 클릭 핸들러
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const urlFromData = data.url;
  const targetUrl = urlFromData || "/";

  event.waitUntil(
    (async () => {
      // 이미 열려있는 탭이 있으면 포커스, 없으면 새로 열기
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          // 필요하면 client.url 검사해서 특정 그룹 페이지에 있는 탭만 포커스 가능
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })(),
  );
});

// 6) 백그라운드 메시지 핸들러
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Received background message ", payload);

  const rawData = payload.data || {};

  // 1) notification 필드가 있으면 → FCM이 알아서 OS 알림을 띄움
  //    이 때 우리가 showNotification까지 하면 2번 뜨므로, 기본적으로 리턴
  //    (data-only 메시지에서는 payload.notification이 없음)
  if (payload.notification && !rawData.forceCustomNotification) {
    console.log("[FCM SW] notification present, let FCM handle display");
    return;
  }

  // 2) data-only 메시지거나, forceCustomNotification이 true일 때만 우리가 알림 띄움
  const baseTitle = rawData.title || (payload.notification && payload.notification.title) || "알림";
  const baseBody = rawData.body || (payload.notification && payload.notification.body) || "";

  let title = baseTitle;
  const options = {
    body: baseBody,
    data: rawData,
  };

  // 그룹 이름이 있으면 [그룹명] 붙이기
  if (rawData.groupName) {
    title = `[${rawData.groupName}] ${baseTitle}`;
  }

  // 그룹 ID가 있으면 클릭 시 이동할 URL
  if (rawData.groupId) {
    options.data = options.data || {};
    options.data.url = `/groups/${rawData.groupId}`;
  }

  self.registration.showNotification(title, options);
});
