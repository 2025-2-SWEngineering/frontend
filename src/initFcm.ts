// Frontend/src/initFcm.ts
/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./services/api";

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
    console.log("[FCM] initFcm start");
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    // 1. 알림 권한 요청
    try {
      if (Notification.permission !== "granted") {
        console.log("[FCM] requesting notification permission");
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn("[FCM] Notification.requestPermission failed", e);
    }

    if (Notification.permission !== "granted") {
      console.warn("[FCM] Notification permission not granted");
      return;
    }

    // 2. 서비스워커 등록
    let registration: ServiceWorkerRegistration | undefined;

    if ("serviceWorker" in navigator) {
      try {
        // 기존 firebase-messaging-sw.js 관련 SW들 정리
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

        // 새 서비스워커 등록 (type: "module" 제거!)
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js?v=20251205",
        );

        console.log("[FCM] SW registered:", {
          scriptURL: registration.active?.scriptURL,
          scope: registration.scope,
          active: !!registration.active,
        });
      } catch (e) {
        console.warn("[FCM] service worker register failed", e);
      }
    } else {
      console.warn("[FCM] Service worker not supported in this browser");
    }

    // registration이 없으면 getToken 호출 중단
    if (!registration) {
      console.warn("[FCM] No SW registration, skip getToken");
      return;
    }

    // 3. FCM 토큰 발급
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log("[FCM] Token issued:", currentToken);

        // 4. 백엔드에 토큰 등록
        try {
          await api.post("/fcm/register", {
            token: currentToken,
            platform: "web",
          });
          console.log("[FCM] token registered with backend");
        } catch (err) {
          console.warn("[FCM] Failed to register FCM token with backend", err);
        }
      } else {
        console.warn("[FCM] No registration token available (getToken returned null)");
      }
    } catch (err) {
      console.error("[FCM] getToken failed", err);
    }

    // 5. 포그라운드 메시지 수신 핸들러
    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground message", payload);
      // 여기서 in-app 알림 UI를 띄우거나 처리 로직을 넣을 수 있음
    });

    initialized = true;
    console.log("[FCM] initFcm completed");
  } catch (e) {
    console.error("[FCM] initialization failed", e);
  }
}

// 개발용: 브라우저 콘솔에서 직접 호출해 볼 수 있게
(window as any).initFcm = initFcm;

export default initFcm;
