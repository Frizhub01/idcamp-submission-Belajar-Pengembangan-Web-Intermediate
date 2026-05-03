import StoryApi from "../data/api";
import * as L from "leaflet";
import Swal from "sweetalert2";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import StoryIdb from "../data/idb";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

class AddStoryPage {
  async render() {
    return `
      <section class="add-story-container container" style="padding-top: 80px; max-width: 800px; margin: 0 auto; margin-bottom: 50px;">
        <h1 style="text-align: center; margin-bottom: 20px;">Bagikan Cerita Baru</h1>
        <form id="addStoryForm" class="glass-card" style="padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 20px;">
          
          <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
            <label for="descInput" style="font-weight: bold;">Deskripsi</label>
            <textarea id="descInput" placeholder="Ceritakan momenmu..." required style="min-height: 100px; padding: 10px; border-radius: 8px; border: 1px solid #ccc;"></textarea>
            <small id="charCounter" style="color: #666;">0 / 500 karakter</small>
          </div>

          <div class="camera-section" style="display: flex; flex-direction: column; gap: 10px;">
            <label for="fileInput" style="font-weight: bold;">Foto (Pilih dari Galeri atau Kamera)</label>
            <video id="cameraVideo" autoplay playsinline style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; background: #000;"></video>
            <canvas id="canvas" style="display:none;"></canvas>
            <img id="imagePreview" alt="Preview foto cerita yang dipilih" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px; display:none;">
            
            <div class="camera-controls" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" id="captureBtn" style="padding: 10px 15px; border: none; border-radius: 8px; background: #007bff; color: white; cursor: pointer;">Ambil Foto</button>
              <button type="button" id="toggleCameraBtn" style="padding: 10px 15px; border: none; border-radius: 8px; background: #dc3545; color: white; cursor: pointer;">Tutup Kamera</button>
              <button type="button" id="clearPhotoBtn" style="padding: 10px 15px; border: none; border-radius: 8px; background: #dc3545; color: white; cursor: pointer; display:none;">Ulangi</button>
              <input type="file" id="fileInput" accept="image/*" style="padding: 8px;">
            </div>
          </div>

          <div class="map-picker-section">
            <span style="font-weight: bold; display: block; margin-bottom: 10px;">Pilih Lokasi di Peta</span>
            <div id="modalMap" style="height: 300px; width: 100%; border-radius: 8px; border: 1px solid #ccc; z-index: 0;"></div>
            <input type="hidden" id="inputLat">
            <input type="hidden" id="inputLon">
          </div>

          <button type="submit" id="submitStoryBtn" style="padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Kirim Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.selectedFile = null;
    this.isCameraOn = false;
    this.map = null;
    this._initFormLogic();
    this._initMapPicker();
    await this._startCamera();
  }

  _initMapPicker() {
    setTimeout(() => {
      const mapContainer = document.getElementById("modalMap");
      if (!mapContainer) return;

      this.map = L.map("modalMap").setView([-2.5489, 118.0149], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      let marker = null;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            this.map.setView([userLat, userLon], 13);

            marker = L.marker([userLat, userLon]).addTo(this.map);
            document.getElementById("inputLat").value = userLat;
            document.getElementById("inputLon").value = userLon;
          },
          () => {
            console.log("GPS akses ditolak/gagal.");
          }
        );
      }

      this.map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById("inputLat").value = lat;
        document.getElementById("inputLon").value = lng;
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng).addTo(this.map);
        }
      });

      this.map.invalidateSize();
    }, 300);
  }

  async _startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById("cameraVideo");
      if (video) {
        video.srcObject = stream;
        window.cameraStream = stream;
        this.isCameraOn = true;
      }
    } catch (err) {
      console.error("Gagal akses kamera", err);
      Swal.fire({ icon: "info", title: "Kamera", text: "Kamera tidak tersedia, silakan gunakan fitur upload dari galeri." });

      const toggleCameraBtn = document.getElementById("toggleCameraBtn");
      const captureBtn = document.getElementById("captureBtn");
      if (toggleCameraBtn) toggleCameraBtn.style.display = "none";
      if (captureBtn) captureBtn.style.display = "none";
    }
  }

  _stopCamera() {
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach((track) => track.stop());
      window.cameraStream = null;
    }
    const video = document.getElementById("cameraVideo");
    if (video) {
      video.srcObject = null;
    }
    this.isCameraOn = false;
  }

  _initFormLogic() {
    const form = document.getElementById("addStoryForm");
    const descInput = document.getElementById("descInput");
    const charCounter = document.getElementById("charCounter");
    const captureBtn = document.getElementById("captureBtn");
    const toggleCameraBtn = document.getElementById("toggleCameraBtn");
    const clearPhotoBtn = document.getElementById("clearPhotoBtn");
    const fileInput = document.getElementById("fileInput");
    const video = document.getElementById("cameraVideo");
    const canvas = document.getElementById("canvas");
    const preview = document.getElementById("imagePreview");

    descInput.addEventListener("input", () => {
      const currentLen = descInput.value.length;
      charCounter.innerText = `${currentLen} / 500 karakter`;
      if (currentLen >= 500) {
        charCounter.style.color = "red";
      } else {
        charCounter.style.color = "#666";
      }
    });

    toggleCameraBtn.addEventListener("click", async () => {
      if (this.isCameraOn) {
        this._stopCamera();
        toggleCameraBtn.innerText = "Nyalakan Kamera";
        toggleCameraBtn.style.background = "#28a745";
      } else {
        await this._startCamera();
        toggleCameraBtn.innerText = "Tutup Kamera";
        toggleCameraBtn.style.background = "#dc3545";
      }
    });

    const setPreviewState = (show) => {
      if (show) {
        video.style.display = "none";
        captureBtn.style.display = "none";
        toggleCameraBtn.style.display = "none";
        preview.style.display = "block";
        clearPhotoBtn.style.display = "inline-block";
      } else {
        preview.style.display = "none";
        clearPhotoBtn.style.display = "none";
        video.style.display = "block";
        captureBtn.style.display = "inline-block";
        toggleCameraBtn.style.display = "inline-block";

        this.selectedFile = null;
        fileInput.value = "";
        preview.src = "";

        if (!this.isCameraOn) {
          this._startCamera();
          toggleCameraBtn.innerText = "Tutup Kamera";
          toggleCameraBtn.style.background = "#dc3545";
        }
      }
    };

    captureBtn.addEventListener("click", () => {
      if (!video.srcObject) {
        Swal.fire({ icon: "warning", title: "Kamera Mati", text: "Nyalakan kamera terlebih dahulu untuk mengambil foto!" });
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      preview.src = dataUrl;
      setPreviewState(true);
      canvas.toBlob((blob) => {
        this.selectedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
      });

      this._stopCamera();
      toggleCameraBtn.innerText = "Nyalakan Kamera";
      toggleCameraBtn.style.background = "#28a745";
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.src = event.target.result;
          setPreviewState(true);

          this._stopCamera();
          toggleCameraBtn.innerText = "Nyalakan Kamera";
          toggleCameraBtn.style.background = "#28a745";
        };
        reader.readAsDataURL(file);
      }
    });

    clearPhotoBtn.addEventListener("click", () => {
      setPreviewState(false);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const desc = descInput.value;
      const lat = document.getElementById("inputLat").value;
      const lon = document.getElementById("inputLon").value;

      if (!this.selectedFile) {
        Swal.fire({ icon: "warning", title: "Oops...", text: "Harap pilih gambar dari galeri atau ambil foto lewat kamera!" });
        return;
      }

      if (!navigator.onLine) {
        const token = StoryApi.getAccessToken(); 
      
        await StoryIdb.putOfflineStory({
          description: desc,
          photo: this.selectedFile,
          lat: lat ? parseFloat(lat) : null,
          lon: lon ? parseFloat(lon) : null,
          token: token 
        });

        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-new-stories');
        }

        Swal.fire({
          icon: "info",
          title: "Mode Offline",
          text: "Koneksi terputus. Cerita disimpan lokal dan akan diunggah otomatis saat online kembali."
        }).then(() => {
          window.location.hash = "#/";
        });

        return;
      }

      Swal.fire({
        title: "Mengunggah Cerita...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await StoryApi.addStory({
        description: desc,
        photo: this.selectedFile,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
      });

      if (!response.error) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Cerita berhasil ditambahkan!",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.hash = "#/";
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal Mengunggah", text: response.message });
      }
    });
  }
}

export default AddStoryPage;