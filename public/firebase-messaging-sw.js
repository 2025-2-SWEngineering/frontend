/*
  Service worker for Firebase Cloud Messaging (Web)
  NOTE: Replace the firebaseConfig below with values from your Firebase project.
  You can find them in Firebase Console -> Project Settings -> General (Web app)
  `messagingSenderId` and related keys are public and safe to include here.
*/

importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js");

// TODO: REPLACE the config values with your project's values
var firebaseConfig = {
  apiKey: "AIzaSyAonylZ_Bbh2GdodyVfFKi4sm7TqMirbzY",
  authDomain: "swengineering-80720.firebaseapp.com",
  projectId: "swengineering-80720",
  messagingSenderId: "919454578960",
  appId: "1:919454578960:web:d3729a139cf6246a7a8d95",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = (payload && payload.notification && payload.notification.title) || "알림";
  const options = {
    body: (payload && payload.notification && payload.notification.body) || "",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
