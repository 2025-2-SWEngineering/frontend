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

  if (!("serviceWorker" in navigator)) {
    console.warn("[FCM] Service worker not supported in this browser");
    return;
  }

  try {
    console.log("[FCM] initFcm start");

    // 1. Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    // 2. 알림 권한 요청
    try {
      if (Notification.permission !== "granted") {
        console.log("[FCM] requesting notification permission");
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          console.warn("[FCM] Notification permission not granted:", result);
          return;
        }
      }
    } catch (e) {
      console.warn("[FCM] Notification.requestPermission failed", e);
      return;
    }

    if (Notification.permission !== "granted") {
      console.warn("[FCM] Notification permission not granted (final check)");
      return;
    }

    // 3. 서비스워커 등록 (ESM 모듈 SW, v10 전용)
    const swUrl = "/firebase-messaging-sw.js?v=20251206";
    let registration: ServiceWorkerRegistration;

    try {
      registration = await navigator.serviceWorker.register(swUrl, {
        type: "module", // firebase-messaging-sw.js 가 ESM 이므로 module 로 등록
      });

      console.log("[FCM] SW register() returned:", {
        scope: registration.scope,
      });
    } catch (e) {
      console.error("[FCM] service worker register failed", e);
      return;
    }

    // 4. 실제로 활성화된 SW 가 준비될 때까지 대기
    const readyRegistration = await navigator.serviceWorker.ready;
    console.log("[FCM] navigator.serviceWorker.ready:", {
      scope: readyRegistration.scope,
      scriptURL: readyRegistration.active?.scriptURL,
    });

    // 5. FCM 토큰 발급
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: readyRegistration,
      });

      if (currentToken) {
        console.log("[FCM] Token issued:", currentToken);

        // 6. 백엔드에 토큰 등록
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

    // 7. 포그라운드 메시지 수신 핸들러
    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground message", payload);

      const title = payload.notification?.title ?? "알림";
      const body = payload.notification?.body ?? "";
      const data = payload.data ?? {};

      // 탭이 열려 있을 때 OS 알림을 1번 띄움
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          data,
        });
      }
    });

    initialized = true;
    console.log("[FCM] initFcm completed");
  } catch (e) {
    console.error("[FCM] initialization failed", e);
  }
}
export default initFcm;
