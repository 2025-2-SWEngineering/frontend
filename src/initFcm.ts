// Frontend/src/initFcm.ts
/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./services/api";

// analytics는 원하면 추가
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

let initialized = false;

export async function initFcm(): Promise<void> {
  if (initialized) return;
  try {
    const app = initializeApp(firebaseConfig);
    // analytics 사용시 (선택)
    // const analytics = getAnalytics(app);

    const messaging = getMessaging(app);

    // Request notification permission if not granted
    try {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    } catch (e) {
      // ignore
    }

    if (Notification.permission === "granted") {
      try {
        let registration: ServiceWorkerRegistration | undefined;
        if ("serviceWorker" in navigator) {
          try {
            // Unregister previously registered classic SW for FCM (so ESM can load)
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
              regs
                .filter((r) => {
                  const urls = [
                    r.active?.scriptURL,
                    r.waiting?.scriptURL,
                    r.installing?.scriptURL,
                  ].filter(Boolean) as string[];
                  return urls.some((u) => u.includes("/firebase-messaging-sw.js"));
                })
                .map((r) => r.unregister()),
            );
            registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
              type: "module",
            });
          } catch (e) {
            console.warn("[FCM] service worker register failed", e);
          }
        }
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (currentToken) {
          // send token to backend to register and subscribe to topics
          try {
            await api.post("/fcm/register", { token: currentToken, platform: "web" });
            console.log("FCM token registered with backend");
          } catch (err) {
            console.warn("Failed to register FCM token with backend", err);
          }
        } else {
          console.warn("No registration token available.");
        }
      } catch (err) {
        console.error("getToken failed", err);
      }
    } else {
      console.warn("Notification permission not granted");
    }

    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground message", payload);
      // Optionally show an in-app notification UI here
    });

    initialized = true;
  } catch (e) {
    console.error("[FCM] initialization failed", e);
  }
}

export default initFcm;
