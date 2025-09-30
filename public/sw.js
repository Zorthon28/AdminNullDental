// Service Worker for Push Notifications
const CACHE_NAME = "nulldental-v1";

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Push received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || "/",
    },
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/favicon.ico",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    requireInteraction: true,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "NullDental Admin",
      options
    )
  );
});

// Notification click event - handle user interaction
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline functionality (future enhancement)
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log("Performing background sync...");
}
