import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { openDB } from 'idb';

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
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("push", (event) => {
  let notificationData = {
    title: "StoryDrop",
    options: {
      body: "Ada pembaruan cerita terbaru!",
      icon: "/favicon.png",
      actions: [
        { action: "explore", title: "Lihat Cerita" },
        { action: "close", title: "Tutup" },
      ],
      data: { url: "/" },
    },
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      notificationData.title = dataJson.title || notificationData.title;
      notificationData.options.body = dataJson.body || notificationData.options.body;
      if (dataJson.url) notificationData.options.data.url = dataJson.url;
    } catch (error) {
      notificationData.options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData.options));
});

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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    event.waitUntil(syncStoriesToServer());
  }
});

async function syncStoriesToServer() {
  const db = await openDB('storydrop-db', 1);
  const offlineStories = await db.getAll('offline-stories');

  for (const story of offlineStories) {
    const formData = new FormData();
    formData.append('description', story.description);
    formData.append('photo', story.photo, 'capture.jpg');
    
    if (story.lat && story.lon) {
      formData.append('lat', story.lat);
      formData.append('lon', story.lon);
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${story.token}`
        },
        body: formData
      });

      if (response.ok) {
        await db.delete('offline-stories', story.id);
      
        self.registration.showNotification("StoryDrop", {
          body: "Asyik! Cerita yang kamu buat saat offline sudah berhasil diunggah.",
          icon: "/favicon.png"
        });
      }
    } catch (error) {
      console.error('Gagal sync cerita, akan dicoba lagi nanti:', error);
    }
  }
}