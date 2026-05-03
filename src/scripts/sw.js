import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Precaching aset statis dari Webpack
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories'),
  new StaleWhileRevalidate({
    cacheName: 'storydrop-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache disimpan selama 30 Hari
      }),
    ],
  })
);

// Event listener untuk menerima Push Notification
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "StoryDrop",
    options: {
      body: "Ada pembaruan cerita terbaru!",
      icon: "/favicon.png", // Ganti dengan path logo yang sesuai
      actions: [
        { action: "explore", title: "Lihat Cerita" },
        { action: "close", title: "Tutup" },
      ],
      data: { url: "/" }, // URL fallback
    },
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      notificationData.title = dataJson.title || notificationData.title;
      notificationData.options.body = dataJson.body || notificationData.options.body;
      if (dataJson.url) notificationData.options.data.url = dataJson.url;
    } catch (error) {
      // Fallback ke text jika payload bukan JSON
      notificationData.options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData.options));
});

// Event listener untuk interaksi action button pada notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
