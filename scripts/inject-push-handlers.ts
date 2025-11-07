#!/usr/bin/env node

/**
 * Service Worker에 푸시 알림 이벤트 리스너를 주입하는 스크립트
 * generateSW 전략을 사용할 때 필요합니다.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

async function main() {
  const distPath = join(process.cwd(), "dist");
  // generateSW 전략에서는 sw.js가 생성됨
  const swPath = join(distPath, "sw.js");

  // 파일이 생성될 때까지 최대 3초 대기
  const maxWaitTime = 3000;
  const checkInterval = 100;
  let waited = 0;

  while (!existsSync(swPath) && waited < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    waited += checkInterval;
  }

  if (!existsSync(swPath)) {
    console.error("✗ Service Worker 파일(sw.js)을 찾을 수 없습니다.");
    console.error(`   찾은 경로: ${swPath}`);
    console.error("   빌드가 완료되었는지 확인하세요.");
    process.exit(1);
  }

  const pushHandlers = `
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

    if (data.type === "dues_reminder" && data.groupId) {
        url = \`/dashboard?groupId=\${data.groupId}\`;
    }

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clientList) => {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
`;

  try {
    const swContent = readFileSync(swPath, "utf-8");
    // 파일 끝에 푸시 핸들러 추가
    const newContent = swContent + pushHandlers;
    writeFileSync(swPath, newContent, "utf-8");
    console.log("✓ 푸시 알림 핸들러가 Service Worker에 주입되었습니다.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("✗ Service Worker 파일을 수정할 수 없습니다:", errorMessage);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("✗ 스크립트 실행 중 오류 발생:", error);
  process.exit(1);
});
