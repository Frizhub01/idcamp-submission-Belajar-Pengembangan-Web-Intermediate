import { openDB } from 'idb';

const dbPromise = openDB('storydrop-db', 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('stories')) {
      db.createObjectStore('stories', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('offline-stories')) {
      db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('favorites')) {
      db.createObjectStore('favorites', { keyPath: 'id' });
    }
  },
});

const StoryIdb = {
  // --- Fungsi untuk Fitur Favorit ---
  async getFavoriteStories() { return (await dbPromise).getAll('favorites'); },
  async putFavorite(story) { return (await dbPromise).put('favorites', story); },
  async deleteFavorite(id) { return (await dbPromise).delete('favorites', id); },

  // --- Fungsi untuk Sync Offline ---
  async getOfflineStories() { return (await dbPromise).getAll('offline-stories'); },
  async putOfflineStory(story) { return (await dbPromise).put('offline-stories', story); },
  async deleteOfflineStory(id) { return (await dbPromise).delete('offline-stories', id); },

  // --- Fungsi untuk Cache Cerita Halaman Utama ---
  async getAllStories() { return (await dbPromise).getAll('stories'); },
  async putStory(story) { return (await dbPromise).put('stories', story); },
  async deleteStory(id) { return (await dbPromise).delete('stories', id); },
  async clearStories() { return (await dbPromise).clear('stories'); }
};

export default StoryIdb;