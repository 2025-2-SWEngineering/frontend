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
    initFcm().catch((e) => {
      console.warn("[FCM] initFcm failed", e);
    });
  });
}
