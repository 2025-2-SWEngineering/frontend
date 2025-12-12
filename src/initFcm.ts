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
async function initFcm() {
  console.log("[FCM] VAPID:", import.meta.env.VITE_VAPID_PUBLIC_KEY);
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
      // 일부 브라우저에서는 scriptURL이 없을 수 있음
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // 백엔드는 token / platform 을 기대
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
      } catch (e) {
        console.warn("[FCM] Failed to register FCM token with backend", e);
      }
    }

    // ----- 4. 포그라운드 메시지 수신 핸들러 -----
    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground message", payload);

      // data / notification 둘 다 고려
      const data = (payload.data as Record<string, string> | undefined) || {};
      const notif = payload.notification;

      const baseTitle = data.title || notif?.title || "알림";

      const baseBody = data.body || notif?.body || "";

      // 그룹 이름 (data에 있다고 가정)
      const groupName = data.groupName;
      let title = baseTitle;

      const notifData: Record<string, unknown> = { ...data };

      if (groupName) {
        title = `[${groupName}] ${baseTitle}`;
      }

      // 그룹 ID가 있으면 URL 세팅 (SW notificationclick과 동일 규칙)
      if (data.groupId) {
        notifData.url = notifData.url || `/groups/${data.groupId}`;
      }

      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body: baseBody,
            data: notifData,
          });
        } catch (err) {
          console.warn("[FCM] failed to show Notification, falling back to alert", err);
          alert(`${title}\n\n${baseBody}`);
        }
      } else {
        // 권한 없으면 그냥 alert로라도 표시
        alert(`${title}\n\n${baseBody}`);
      }
    });

    initialized = true;
    console.log("[FCM] initFcm completed");
  } catch (e) {
    console.error("[FCM] initialization failed", e);
  }
}

export default initFcm;
