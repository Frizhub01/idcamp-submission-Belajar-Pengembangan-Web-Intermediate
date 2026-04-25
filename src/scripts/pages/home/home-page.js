import HomeView from "./home-view";
import StoryApi from "../../data/api";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import Swal from "sweetalert2";

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

  initAddStoryModal() {
    const modal = document.getElementById("addStoryModal");
    const fabBtn = document.getElementById("fabAddStory");
    const closeBtn = document.getElementById("closeModalBtn");
    const form = document.getElementById("addStoryForm");

    const fileInput = document.getElementById("fileInput");
    const video = document.getElementById("cameraVideo");
    const canvas = document.getElementById("canvas");
    const captureBtn = document.getElementById("captureBtn");
    const preview = document.getElementById("imagePreview");
    const clearPhotoBtn = document.getElementById("clearPhotoBtn");
    const descInput = document.getElementById("descInput");
    const charCounter = document.getElementById("charCounter");

    if (descInput && charCounter) {
      descInput.addEventListener("input", () => {
        const currentLen = descInput.value.length;
        charCounter.innerText = `${currentLen} / 500 karakter`;
        if (currentLen >= 500) {
          charCounter.classList.add("limit-reached");
        } else {
          charCounter.classList.remove("limit-reached");
        }
      });
    }

    closeBtn.addEventListener("click", () => {
      this.closeModal();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        this.closeModal();
      }
    });

    const setPreviewState = (show) => {
      if (show) {
        video.style.display = "none";
        canvas.style.display = "none";
        captureBtn.style.display = "none";

        preview.style.display = "block";
        preview.style.width = "100%";
        preview.style.maxHeight = "250px";
        preview.style.objectFit = "contain";
        preview.style.borderRadius = "8px";

        clearPhotoBtn.style.display = "inline-block";
      } else {
        preview.style.display = "none";
        canvas.style.display = "none";
        clearPhotoBtn.style.display = "none";

        video.style.display = "block";
        video.style.width = "100%";
        video.style.maxHeight = "250px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "8px";

        captureBtn.style.display = "inline-block";

        this.selectedPhotoFile = null;
        fileInput.value = "";
        preview.src = "";
      }
    };

    fabBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      setPreviewState(false);
      this.setupModalMap();
      this.startCamera(video);
      setTimeout(() => descInput.focus(), 100);
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          setPreviewState(true);
        };
        reader.readAsDataURL(file);
      }
    });

    captureBtn.addEventListener("click", () => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      preview.src = canvas.toDataURL("image/jpeg");
      setPreviewState(true);

      canvas.toBlob((blob) => {
        this.selectedPhotoFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
      }, "image/jpeg");
    });

    clearPhotoBtn.addEventListener("click", () => {
      setPreviewState(false);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const desc = descInput.value;
      const lat = document.getElementById("inputLat").value;
      const lon = document.getElementById("inputLon").value;

      if (!this.selectedPhotoFile) {
        Swal.fire({ icon: "warning", title: "Oops...", text: "Harap pilih gambar dari galeri atau kamera!" });
        return;
      }

      Swal.fire({
        title: "Mengunggah Cerita...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        customClass: { container: "my-swal-container" },
        didOpen: () => {
          Swal.showLoading();
          document.querySelector(".my-swal-container").style.zIndex = "99999";
        },
      });

      const response = await StoryApi.addStory({
        description: desc,
        photo: this.selectedPhotoFile,
        lat,
        lon,
      });

      if (!response.error) {
        this.closeModal();
        form.reset();
        setPreviewState(false);

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Cerita berhasil ditambahkan!",
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: "my-swal-container" },
          didOpen: () => (document.querySelector(".my-swal-container").style.zIndex = "99999"),
        }).then(() => {
          this.loadData();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengunggah",
          text: response.message,
          customClass: { container: "my-swal-container" },
          didOpen: () => (document.querySelector(".my-swal-container").style.zIndex = "99999"),
        });
      }
    });
  }

  async afterRender() {
    this.initMap();
    await this.loadData();
    this.initAddStoryModal();
  }

  initMap() {
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
    this.markers.forEach((item) => this.map.removeLayer(item.marker));
    this.markers = [];

    try {
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
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  filterStoriesByMapBounds() {
    const bounds = this.map.getBounds();
    const visibleStories = this.markers.filter((item) => bounds.contains(item.marker.getLatLng())).map((item) => item.data);
    this.view.showStories(visibleStories);
  }

  setupModalMap() {
    if (this.modalMap !== null) {
      this.modalMap.remove();
    }

    this.modalMap = L.map("modalMap").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.modalMap);

    this.modalMap.on("click", (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      document.getElementById("inputLat").value = lat;
      document.getElementById("inputLon").value = lon;

      if (this.modalMarker) {
        this.modalMarker.setLatLng([lat, lon]);
      } else {
        this.modalMarker = L.marker([lat, lon]).addTo(this.modalMap);
      }
    });

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

          document.getElementById("inputLat").value = userLat;
          document.getElementById("inputLon").value = userLon;
        },
        (error) => console.log("Akses GPS ditolak/gagal", error),
      );
    }
  }

  startCamera(videoElement) {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const modal = document.getElementById("addStoryModal");
          if (modal.classList.contains("hidden")) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          
          this.cameraStream = stream;
          videoElement.srcObject = stream;
        })
        .catch((err) => {
          console.error("Kamera gagal diakses: ", err);
          Swal.fire({ icon: "error", title: "Kamera Gagal", text: "Pastikan Anda telah memberikan izin akses kamera." });
        });
    }
  }

  closeModal() {
    const modal = document.getElementById("addStoryModal");
    modal.classList.add("hidden");

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }

    const form = document.getElementById("addStoryForm");
    if (form) form.reset();

    const charCounter = document.getElementById("charCounter");
    if (charCounter) {
      charCounter.innerText = "0 / 500 karakter";
      charCounter.classList.remove("limit-reached");
    }

    this.selectedPhotoFile = null;
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";

    const preview = document.getElementById("imagePreview");
    const video = document.getElementById("cameraVideo");
    const captureBtn = document.getElementById("captureBtn");
    const clearPhotoBtn = document.getElementById("clearPhotoBtn");
    const canvas = document.getElementById("canvas");

    if (preview && video) {
      preview.style.display = "none";
      preview.src = "";
      clearPhotoBtn.style.display = "none";
      canvas.style.display = "none";

      video.style.display = "block";
      captureBtn.style.display = "inline-block";
    }
  }
}

export default HomePage;
