import StoryApi from '../data/api';

const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotification = {
  async init() {

    if (process.env.NODE_ENV !== 'production') {
      console.log('Service Worker & Push Notification dimatikan pada mode development.');
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push Notifications tidak didukung di browser ini.");
      return;
    }

    try {
      this._registration = await navigator.serviceWorker.register("/sw.bundle.js");
      this._toggleBtn = document.querySelector("#push-toggle");
      this._icon = this._toggleBtn.querySelector("i");

      await this._updateUI();

      this._toggleBtn.addEventListener("click", async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await this._toggleSubscription();
        } else {
          console.warn("Izin notifikasi tidak diberikan.");
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  },

  async _updateUI() {
    const subscription = await this._registration.pushManager.getSubscription();
    if (subscription) {
      this._icon.classList.replace("fa-bell-slash", "fa-bell");
      this._toggleBtn.style.color = "#ffc107";
    } else {
      this._icon.classList.replace("fa-bell", "fa-bell-slash");
      this._toggleBtn.style.color = "";
    }
  },

  async _toggleSubscription() {
    const subscription = await this._registration.pushManager.getSubscription();
    if (subscription) {
      try {
        await StoryApi.unsubscribePushNotification(subscription.endpoint);
        await subscription.unsubscribe();
        console.log('Unsubscribed dari Push Notification');
      } catch (err) {
        console.error('Gagal unsubscribe dari server:', err);
      }
    } else {
      try {
        const newSubscription = await this._registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        
        const subData = newSubscription.toJSON();
        const payload = {
          endpoint: subData.endpoint,
          keys: {
            p256dh: subData.keys.p256dh,
            auth: subData.keys.auth
          }
        };

        await StoryApi.subscribePushNotification(payload); 
        console.log('Berhasil Subscribed ke Push Notification');
      } catch (err) {
        console.error('Gagal subscribe:', err);
      }
    }
    await this._updateUI();
  }
};

export default PushNotification;
