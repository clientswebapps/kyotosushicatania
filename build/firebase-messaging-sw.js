// Kyō-To Sushi Catania — Firebase Cloud Messaging Service Worker
// Handles background push notifications when the website/app is closed

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHCZ1aa8txmP1mjW0_Ic4HfJUI_N5Mo8c",
  authDomain: "kyotosushicatania.firebaseapp.com",
  projectId: "kyotosushicatania",
  storageBucket: "kyotosushicatania.firebasestorage.app",
  messagingSenderId: "817479494676",
  appId: "1:817479494676:web:9916de79c3acc0b19a0b01"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || "Kyō-To Sushi Catania";
  const notificationOptions = {
    body: payload.notification?.body || "Nuova offerta disponibile!",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the web app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Custom click action or default to home page
  const clickAction = event.notification.data?.clickAction || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If there is an existing window, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(clickAction) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
