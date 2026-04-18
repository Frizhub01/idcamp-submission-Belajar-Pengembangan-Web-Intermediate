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
    this.allStories = [];
    this.markers = [];
    this.modalMap = null;
    this.modalMarker = null;
    this.cameraStream = null;
    this.selectedPhotoFile = null;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.initMap();
    await this.loadData();
    this.initAddStoryModal();
  }

  initMap() {
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
    this.allStories = await StoryApi.getStoriesWithLocation();

    this.allStories.forEach((story) => {
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
  }

  filterStoriesByMapBounds() {
    const bounds = this.map.getBounds();
    const visibleStories = this.markers.filter((item) => bounds.contains(item.marker.getLatLng())).map((item) => item.data);

    this.view.showStories(visibleStories);
  }

  initAddStoryModal() {
    const modal = document.getElementById('addStoryModal');
    const fabBtn = document.getElementById('fabAddStory');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('addStoryForm');
    
    // Media Elements
    const fileInput = document.getElementById('fileInput');
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const preview = document.getElementById('imagePreview');

    // Buka Modal
    fabBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      this.setupModalMap();
      this.startCamera(video);
    });

    // Tutup Modal
    closeBtn.addEventListener('click', () => this.closeModal());

    // Input File Galeri
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedPhotoFile = file;
        preview.src = URL.createObjectURL(file);
        preview.classList.remove('hidden');
      }
    });

    // Jepret Kamera
    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Tampilkan di Pratinjau
      preview.src = canvas.toDataURL('image/jpeg');
      preview.classList.remove('hidden');

      // Ubah canvas menjadi tipe File untuk dikirim ke API
      canvas.toBlob((blob) => {
        this.selectedPhotoFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      }, 'image/jpeg');
    });

    // Submit Form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedback = document.getElementById('modalFeedback');
      const desc = document.getElementById('descInput').value;
      const lat = document.getElementById('inputLat').value;
      const lon = document.getElementById('inputLon').value;

      if (!this.selectedPhotoFile) {
        feedback.style.color = 'red';
        feedback.innerText = 'Harap pilih gambar dari galeri atau kamera!';
        return;
      }

      feedback.style.color = 'blue';
      feedback.innerText = 'Sedang mengirim data...';

      const response = await StoryApi.addStory({ 
        description: desc, 
        photo: this.selectedPhotoFile, 
        lat, 
        lon 
      });

      if (!response.error) {
        feedback.style.color = 'green';
        feedback.innerText = 'Cerita berhasil ditambahkan!';
        setTimeout(() => {
          this.closeModal();
          this.loadData();
          form.reset();
          preview.classList.add('hidden');
          this.selectedPhotoFile = null;
        }, 1500);
      } else {
        feedback.style.color = 'red';
        feedback.innerText = response.message;
      }
    });
  }

  setupModalMap() {
    if (!this.modalMap) {
      this.modalMap = L.map('modalMap').setView([-2.5489, 118.0149], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.modalMap);
      
      this.modalMap.on('click', (e) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        document.getElementById('inputLat').value = lat;
        document.getElementById('inputLon').value = lon;

        if (this.modalMarker) {
          this.modalMarker.setLatLng([lat, lon]);
        } else {
          this.modalMarker = L.marker([lat, lon]).addTo(this.modalMap);
        }
      });
    }

    setTimeout(() => {
      this.modalMap.invalidateSize();
    }, 300);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          
          this.modalMap.setView([userLat, userLon], 13);
          
          if (this.modalMarker) {
            this.modalMarker.setLatLng([userLat, userLon]);
          } else {
            this.modalMarker = L.marker([userLat, userLon]).addTo(this.modalMap);
          }
          
          document.getElementById('inputLat').value = userLat;
          document.getElementById('inputLon').value = userLon;
        },
        (error) => console.log("Akses GPS ditolak/gagal", error)
      );
    }
  }

  startCamera(videoElement) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.cameraStream = stream;
          videoElement.srcObject = stream;
        })
        .catch((err) => {
          console.error("Kamera gagal diakses: ", err);
        });
    }
  }

  closeModal() {
    document.getElementById('addStoryModal').classList.add('hidden');
    
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }
}

export default HomePage;