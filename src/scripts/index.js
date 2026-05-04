import "../styles/variables.css";
import "../styles/base.css";
import "../styles/components/navbar.css";
import "../styles/components/modal.css";
import "../styles/pages/home-page.css";
import "../styles/pages/about-page.css";

import App from "./pages/app";
import PushNotification from "./utils/push-notification";
import StoryIdb from "./data/idb";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();
  await PushNotification.init();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});

async function syncOfflineStories() {
  try {
    const offlineStories = await StoryIdb.getOfflineStories();

    if (offlineStories.length === 0) return;

    console.log(`Ditemukan ${offlineStories.length} cerita offline. Memulai sinkronisasi...`);

    let hasSynced = false;

    for (const story of offlineStories) {
      const formData = new FormData();
      formData.append("description", story.description);
      formData.append("photo", story.photo, "capture.jpg");

      if (story.lat && story.lon) {
        formData.append("lat", story.lat);
        formData.append("lon", story.lon);
      }

      const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${story.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log("Sinkronisasi berhasil untuk cerita:", story.description);
        await StoryIdb.deleteOfflineStory(story.id);
        hasSynced = true;
      } else {
        console.error("Gagal sinkronisasi cerita:", story.description);
      }
    }

    if (hasSynced) {
      if ("caches" in window) {
        await caches.delete("storydrop-api-cache");
      }

      Swal.fire({
        icon: "success",
        title: "Sinkronisasi Berhasil!",
        text: "Cerita yang kamu buat saat offline sudah berhasil diunggah.",
        confirmButtonText: "Muat Ulang Peta",
        confirmButtonColor: "#28a745",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Menyiapkan Data...",
            text: "Mengambil data terbaru dari server.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          setTimeout(() => {
            window.location.href = window.location.pathname + "#/";
            window.location.reload();
          }, 2000);
        }
      });
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat sinkronisasi offline:", error);
  }
}

window.addEventListener("online", () => {
  syncOfflineStories();
});

window.addEventListener("load", () => {
  if (navigator.onLine) {
    syncOfflineStories();
  }
});