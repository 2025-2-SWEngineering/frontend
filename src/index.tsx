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
// Init FCM on load (service worker is registered inside initFcm)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await initFcm();
    } catch (e) {
      console.warn("initFcm failed", e);
    }
  });
}
