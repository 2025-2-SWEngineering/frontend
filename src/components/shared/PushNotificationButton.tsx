import React from "react";
import { usePushNotification } from "../../hooks/usePushNotification";
import { Button } from "../../styles/primitives";

const PushNotificationButton: React.FC = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotification();

  if (!isSupported) {
    return null; // 푸시 알림을 지원하지 않는 브라우저
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} $variant="outline">
      {isSubscribed ? "푸시 알림 끄기" : "푸시 알림 켜기"}
    </Button>
  );
};

export default PushNotificationButton;
