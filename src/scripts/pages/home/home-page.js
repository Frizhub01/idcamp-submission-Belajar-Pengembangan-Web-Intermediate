import HomeView from "./home-view";
import StoryApi from "../../data/api";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import Swal from "sweetalert2"; // Import SweetAlert2

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

    // FIX BARU: Memaksa tata letak dengan inline-styles agar tidak membesar dan ganda
    const setPreviewState = (show) => {
      if (show) {
        // Mode: Menampilkan Hasil Jepretan / Pilihan Galeri
        video.style.display = 'none'; // Sembunyikan video mutlak
        canvas.style.display = 'none'; // Sembunyikan canvas mutlak
        captureBtn.style.display = 'none'; // Sembunyikan tombol jepret
        
        preview.style.display = 'block'; // Tampilkan gambar
        preview.style.width = '100%'; // Batasi lebar
        preview.style.maxHeight = '250px'; // Batasi tinggi agar tidak membesar
        preview.style.objectFit = 'contain';
        preview.style.borderRadius = '8px';
        
        clearPhotoBtn.style.display = 'inline-block';
      } else {
        // Mode: Menampilkan Kamera (Bersiap Memotret)
        preview.style.display = 'none'; // Sembunyikan gambar mutlak
        canvas.style.display = 'none'; // Sembunyikan canvas mutlak
        clearPhotoBtn.style.display = 'none'; // Sembunyikan tombol batal
        
        video.style.display = 'block'; // Tampilkan video
        video.style.width = '100%'; // Batasi lebar kamera
        video.style.maxHeight = '250px'; // Batasi tinggi kamera
        video.style.objectFit = 'cover';
        video.style.borderRadius = '8px';
        
        captureBtn.style.display = 'inline-block';

        this.selectedPhotoFile = null;
        fileInput.value = '';
        preview.src = '';
      }
    };

    fabBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      setPreviewState(false); // Buka modal dalam mode Kamera
      this.setupModalMap();
      this.startCamera(video);
      setTimeout(() => document.getElementById('descInput').focus(), 100);
    });

    // ... (Sisa kode seperti event listener closeBtn, fileInput, dan submit form tetap sama) ...

    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      preview.src = canvas.toDataURL('image/jpeg');
      setPreviewState(true); // Ganti ke mode hasil jepretan

      canvas.toBlob((blob) => {
        this.selectedPhotoFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
      }, 'image/jpeg');
    });
    
    clearPhotoBtn.addEventListener('click', () => {
      setPreviewState(false); // Kembali ke mode Kamera
    });

    // FIX: Implementasi SweetAlert pada Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const desc = document.getElementById('descInput').value;
      const lat = document.getElementById('inputLat').value;
      const lon = document.getElementById('inputLon').value;

      if (!this.selectedPhotoFile) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Harap pilih gambar dari galeri atau kamera!' });
        return;
      }

      // Memaksa z-index SweetAlert agar selalu berada paling depan
      Swal.fire({
        title: 'Mengunggah Cerita...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        customClass: { container: 'my-swal-container' }, 
        didOpen: () => {
          Swal.showLoading();
          document.querySelector('.my-swal-container').style.zIndex = '99999';
        }
      });

      const response = await StoryApi.addStory({ 
        description: desc, 
        photo: this.selectedPhotoFile, 
        lat, 
        lon 
      });

      if (!response.error) {
        // FIX UTAMA: Tutup modal dan bersihkan form DULUAN sebelum memunculkan pop up sukses
        this.closeModal();
        form.reset();
        setPreviewState(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Cerita berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: 'my-swal-container' },
          didOpen: () => document.querySelector('.my-swal-container').style.zIndex = '99999'
        }).then(() => {
          this.loadData(); // Memuat ulang marker di peta
        });
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Gagal Mengunggah', 
          text: response.message,
          customClass: { container: 'my-swal-container' },
          didOpen: () => document.querySelector('.my-swal-container').style.zIndex = '99999'
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
    // FIX: Cegah error inisialisasi peta ganda saat berpindah halaman
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

  setupModalMap() {
    if (this.modalMap !== null) {
      this.modalMap.remove(); // Bersihkan instance map modal sebelumnya
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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.cameraStream = stream;
          videoElement.srcObject = stream;
        })
        .catch((err) => {
          console.error("Kamera gagal diakses: ", err);
          Swal.fire({ icon: 'error', title: 'Kamera Gagal', text: 'Pastikan Anda telah memberikan izin akses kamera.' });
        });
    }
  }

  closeModal() {
    document.getElementById("addStoryModal").classList.add("hidden");
    
    // Matikan stream kamera untuk menghemat memori
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
  }
}

export default HomePage;