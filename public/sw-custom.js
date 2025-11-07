// 커스텀 Service Worker - 푸시 알림 처리
// vite-plugin-pwa의 injectManifest 전략으로 이 파일에 Workbox 코드가 주입됩니다.
// Workbox import는 자동으로 주입되므로 여기서는 이벤트 리스너만 작성합니다.

// 푸시 알림 수신 이벤트 리스너
self.addEventListener("push", (event) => {
    let notificationData = {
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
            // JSON 파싱 실패 시 기본값 사용
            const text = event.data.text();
            if (text) {
                notificationData.body = text;
            }
        }
    }

    const promiseChain = self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: notificationData.data,
        tag: notificationData.data.type || "default",
        requireInteraction: false,
    });

    event.waitUntil(promiseChain);
});

// 알림 클릭 이벤트 리스너
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let url = "/dashboard";

    // 알림 타입에 따라 다른 페이지로 이동
    if (data.type === "dues_reminder" && data.groupId) {
        url = `/dashboard?groupId=${data.groupId}`;
    }

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clientList) => {
                // 이미 열려있는 창이 있으면 포커스
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                // 새 창 열기
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

