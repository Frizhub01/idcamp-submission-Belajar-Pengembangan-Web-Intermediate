import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import StoryIdb from "../../data/idb";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

class HomeView {
  constructor() {
    this.map = null;
    this.markers = [];
    this.favoriteStoriesCache = [];
  }

  getTemplate() {
    return `
      <section class="home-layout">
        <h1 class="visually-hidden">StoryDrop</h1>

        <a href="#/add" id="fabAddStory" class="fab-btn" aria-label="Tambah Cerita Baru">
          <i class="fas fa-plus"></i> Tambah Cerita
        </a>
        
        <div class="map-section">
          <h2>Peta Lokasi Cerita</h2>
          <div id="mapContainer" class="map-container" style="height: 400px;"></div>
        </div>
        <div class="list-section">
          
          <div class="list-header-sticky">
            <div class="list-header-title">
              <h2 id="listTitleText">Daftar Cerita Terlihat</h2>
              <h2>(<span id="storyCount">0</span>)</h2>
            </div>
            
            <div class="list-header-controls">
              <label for="searchStoryInput" class="visually-hidden">Cari pembuat cerita</label>
              <input type="search" id="searchStoryInput" class="search-input" placeholder="Cari pembuat cerita...">
              
              <div class="filter-buttons">
                <button id="btnShowAll" class="btn-filter active">Semua Cerita</button>
                <button id="btnShowFavorites" class="btn-filter">Lihat Favorit <i class="fas fa-heart"></i></button>
              </div>
            </div>
          </div>
          
          <div id="storiesContainer" class="stories-list">
            <p>Memuat data cerita...</p>
          </div>
        </div>
      </section>
    `;
  }

  initMap(onMapMovedCallback) {
    const mapContainer = document.getElementById("mapContainer");
    if (!mapContainer) return;

    if (this.map !== null) {
      this.map.remove();
    }

    this.map = L.map("mapContainer").setView([-2.5489, 118.0149], 5);

    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });

    const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap & CartoDB",
    });

    osmLayer.addTo(this.map);

    const baseMaps = {
      "Peta Terang (OSM)": osmLayer,
      "Peta Gelap (Dark)": darkLayer,
    };
    L.control.layers(baseMaps).addTo(this.map);

    this.map.on("moveend", () => {
      if (onMapMovedCallback) onMapMovedCallback();
    });
  }

  renderMarkers(stories) {
    if (!this.map) return;

    this.markers.forEach((item) => this.map.removeLayer(item.marker));
    this.markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`<b>${story.name}</b><br>Tersedia di lokasi ini.`);
        this.markers.push({
          marker: marker,
          data: story,
        });
      }
    });
  }

  getVisibleStories() {
    if (!this.map) return [];
    const bounds = this.map.getBounds();
    return this.markers
      .filter((item) => bounds.contains(item.marker.getLatLng()))
      .map((item) => item.data);
  }

  async showStories(stories) {
    const container = document.getElementById("storiesContainer");
    const countLabel = document.getElementById("storyCount");

    if (!container || !countLabel) return;

    countLabel.innerText = stories.length;
    container.innerHTML = "";

    if (stories.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding: 20px;">Tidak ada cerita di area peta ini atau tidak ditemukan.</p>';
      return;
    }

    try {
        this.favoriteStoriesCache = await StoryIdb.getFavoriteStories() || [];
    } catch(e) {
        console.warn("Gagal memuat favorit", e);
    }

    stories.forEach((story) => {
      const shortDesc = story.description.length > 80 ? story.description.substring(0, 80) + "..." : story.description;
      const date = new Date(story.createdAt).toLocaleDateString("id-ID");
      
      const isFavorited = this.favoriteStoriesCache.some(fav => fav.id === story.id);
      
      const favoriteIcon = isFavorited ? '<i class="fas fa-heart" style="color: red;"></i>' : '<i class="far fa-heart"></i>';

      container.innerHTML += `
        <article class="story-card" id="story-${story.id}" style="cursor: pointer; position: relative;">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-img">
          
          <!-- TAMBAHAN: Tombol Favorit -->
          <button class="btn-favorite" data-id="${story.id}" data-favorited="${isFavorited}" aria-label="Simpan ke Favorit" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.8); border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            ${favoriteIcon}
          </button>

          <div class="story-info">
            <h3>${story.name}</h3> <span class="story-date">${date}</span>
            <p>${shortDesc}</p>
          </div>
        </article>
      `;
    });

    this._bindStoryCardEvents();
  }

  initSearchListener(onSearchCallback) {
    const searchInput = document.getElementById("searchStoryInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      if (onSearchCallback) {
        onSearchCallback(query);
      }
    });
  }

  initFavoriteButtons(onFavoriteActionCallback) {
    const favoriteButtons = document.querySelectorAll(".btn-favorite");
    
    favoriteButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentBtn = e.currentTarget; 
        const storyId = currentBtn.getAttribute("data-id");
        const isFavorited = currentBtn.getAttribute("data-favorited") === "true";
        
        if (onFavoriteActionCallback) {
           onFavoriteActionCallback(storyId, isFavorited ? 'delete' : 'add');
        }
      });
    });
  }

  initFilterButtons(onShowAllCallback, onShowFavoritesCallback) {
    const btnAll = document.getElementById("btnShowAll");
    const btnFav = document.getElementById("btnShowFavorites");

    if (btnAll) {
      btnAll.addEventListener("click", () => {
        if (onShowAllCallback) onShowAllCallback();
      });
    }

    if (btnFav) {
      btnFav.addEventListener("click", () => {
        if (onShowFavoritesCallback) onShowFavoritesCallback();
      });
    }
  }

  updateFilterUI(isFavorites) {
    const btnAll = document.getElementById("btnShowAll");
    const btnFav = document.getElementById("btnShowFavorites");
    const titleText = document.getElementById("listTitleText");

    if (!btnAll || !btnFav || !titleText) return;

    if (isFavorites) {
      btnFav.classList.add("active");
      btnAll.classList.remove("active");
      titleText.innerText = "Cerita Favorit";
    } else {
      btnAll.classList.add("active");
      btnFav.classList.remove("active");
      titleText.innerText = "Daftar Cerita Terlihat";
    }
  }

  _bindStoryCardEvents() {
    const cards = document.querySelectorAll(".story-card");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest('.btn-favorite')) {
          return; 
        }

        const storyId = card.id.replace("story-", "");
        const targetItem = this.markers.find((item) => item.data.id === storyId);

        if (targetItem && this.map) {
          this.map.setView(targetItem.marker.getLatLng(), 13);
          targetItem.marker.openPopup();
        }
      });
    });
  }

  showError(message) {
    const container = document.getElementById("storiesContainer");
    if (container) {
      container.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }
}

export default HomeView;