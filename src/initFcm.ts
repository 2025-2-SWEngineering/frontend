// Frontend/src/initFcm.ts
/// <reference types="vite/client" />
import axios from "axios";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

let initialized = false;

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0]!;
}

function getFirebaseMessaging(): Messaging {
  const app = getFirebaseApp();
  return getMessaging(app);
}

/**
 * 로그인된 상태에서만 호출되는 FCM 초기화 함수
 */
export async function initFcm() {
  if (initialized) {
    console.log("[FCM] already initialized, skip");
    return;
  }

  // 브라우저 지원 체크
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    console.log("[FCM] Service Worker or window is not available");
    return;
  }

  if (!VAPID_KEY) {
    console.error("[FCM] VAPID_KEY is empty. Check VITE_FIREBASE_VAPID_KEY env.");
    return;
  }

  console.log("[FCM] initFcm start");

  try {
    // ----- 1. Service Worker 등록 -----
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js?v=20251206");
    console.log("[FCM] SW register() returned:", {
      scope: swReg.scope,
    });

    const readyReg = await navigator.serviceWorker.ready;
    console.log("[FCM] navigator.serviceWorker.ready:", {
      scope: readyReg.scope,
      scriptURL: (readyReg as any).scriptURL,
    });

    // ----- 2. FCM 토큰 발급 -----
    const messaging = getFirebaseMessaging();

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: readyReg,
    });

    if (!fcmToken) {
      console.warn("[FCM] getToken() returned empty token");
      return;
    }

    console.log("[FCM] Token issued:", fcmToken);

    // ----- 3. 백엔드에 FCM 토큰 등록 (Authorization 포함) -----
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      console.log("[FCM] no auth token found in localStorage, skip backend register");
    } else {
      try {
        await axios.post(
          "/api/fcm/register",
          {
            // 🔥 여기가 핵심: fcmToken -> token + platform
            token: fcmToken,
            platform: "web",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        console.log("[FCM] FCM token registered to backend");
      } catch (e: any) {
        console.warn("[FCM] Failed to register FCM token with backend", e);
      }
    }

    // ----- 4. 포그라운드 메시지 수신 핸들러 -----
    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground message", payload);

      const title = payload.notification?.title ?? "알림";
      const body = payload.notification?.body ?? "";

      // 탭이 열려 있을 때도 브라우저/폰에 알림처럼 보이게

      alert(`${title}\n\n${body}`);
    });

    initialized = true;
    console.log("[FCM] initFcm completed");
  } catch (e: any) {
    console.error("[FCM] initialization failed", e);
  }
}
