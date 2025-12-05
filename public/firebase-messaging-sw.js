// Service worker for Firebase Cloud Messaging (Web) - ESM module version
// This file is served from /firebase-messaging-sw.js and must be registered with { type: 'module' }
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

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Ensure the service worker activates immediately and takes control of pages.
// This helps avoid "no active Service Worker" errors when registering and subscribing.
self.addEventListener("install", (event) => {
  // Immediately move to the activating state
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients so the new SW controls pages without a full reload
  event.waitUntil(
    (async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await self.clients.claim();
    })(),
  );
});

onBackgroundMessage(messaging, (payload) => {
  const title = payload?.notification?.title || "알림";
  const options = {
    body: payload?.notification?.body || "",
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});
