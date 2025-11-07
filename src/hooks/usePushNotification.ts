import { useEffect, useState } from "react";
import { getVapidPublicKey, subscribePush, unsubscribePush } from "../api/client";

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Service Worker와 Push API 지원 확인
    const checkSupport = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
        setIsSupported(true);

        // 현재 구독 상태 확인
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Failed to check subscription status:", err);
        }
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      alert("이 브라우저는 푸시 알림을 지원하지 않습니다.");
      return false;
    }

    setIsLoading(true);
    try {
      // 알림 권한 요청
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        alert("푸시 알림 권한이 필요합니다.");
        setIsLoading(false);
        return false;
      }

      // VAPID 공개 키 가져오기
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        alert("푸시 알림이 설정되지 않았습니다.");
        setIsLoading(false);
        return false;
      }

      // Service Worker 등록 및 구독
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 백엔드에 구독 정보 전송
      await subscribePush({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(subscription.getKey("auth")!),
        },
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to subscribe:", err);
      alert("푸시 알림 구독에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 백엔드에서 구독 정보 삭제
        await unsubscribePush(subscription.endpoint);
        // 브라우저에서 구독 취소
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to unsubscribe:", err);
      alert("푸시 알림 구독 취소에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}

// VAPID 공개 키를 Uint8Array로 변환
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// ArrayBuffer를 Base64로 변환
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
