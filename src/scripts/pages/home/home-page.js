import HomeView from "./home-view";
import StoryApi from "../../data/api";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

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
      this.filterStoriesByMapBounds();
    });
  }

  async loadData() {
    try {
      const stories = await StoryApi.getStoriesWithLocation();
      
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

      this.filterStoriesByMapBounds();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  filterStoriesByMapBounds() {
    if (!this.map) return;
    
    const bounds = this.map.getBounds();
    const visibleStories = this.markers
      .filter((item) => bounds.contains(item.marker.getLatLng()))
      .map((item) => item.data);
    this.view.showStories(visibleStories);
  }
}

export default HomePage;