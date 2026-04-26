import HomeView from "./home-view";
import StoryApi from "../../data/api";
import * as L from "leaflet";

class HomePage {
  constructor() {
    this.view = new HomeView();
    this.map = null;
    this.markers = [];
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.initMap();
    await this.loadData();
  }

  initMap() {
    if (this.map !== null) this.map.remove();

    this.map = L.map("mapContainer").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("moveend", () => this.filterStoriesByMapBounds());
  }

  async loadData() {
    try {
      const stories = await StoryApi.getStoriesWithLocation();
      this.markers.forEach((m) => this.map.removeLayer(m.marker));
      this.markers = [];

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon]).addTo(this.map);
          marker.bindPopup(`<b>${story.name}</b>`);
          this.markers.push({ marker, data: story });
        }
      });
      this.filterStoriesByMapBounds();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  filterStoriesByMapBounds() {
    const bounds = this.map.getBounds();
    const visibleStories = this.markers
      .filter((item) => bounds.contains(item.marker.getLatLng()))
      .map((item) => item.data);
    this.view.showStories(visibleStories);
  }
}

export default HomePage;