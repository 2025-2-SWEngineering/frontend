import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import initFcm from "./initFcm";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// FCM 초기화 (내부에서 서비스워커 등록 + 토큰 발급까지 처리)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Only initialize FCM for authenticated users to avoid network calls on login/register pages
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("[FCM] skip init on unauthenticated page");
      return;
    }
    initFcm().catch((e: any) => {
      console.warn("[FCM] initFcm failed", e);
    });
  });
}
