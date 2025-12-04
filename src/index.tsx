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
// Register firebase messaging service worker and init FCM
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // register firebase messaging SW (file created under public/)
      const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Firebase SW registered:", reg.scope);
    } catch (err) {
      console.warn("Firebase SW registration failed", err);
    }
    // initialize FCM (will request permission and send token to backend)
    try {
      await initFcm();
    } catch (e) {
      console.warn("initFcm failed", e);
    }
  });
}
