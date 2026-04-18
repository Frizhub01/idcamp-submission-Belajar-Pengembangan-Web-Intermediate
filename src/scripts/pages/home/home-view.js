class HomeView {
  getTemplate() {
    return `
      <section class="home-layout">
        <button id="fabAddStory" class="fab-btn" aria-label="Tambah Cerita Baru">➕ Tambah Cerita</button>
        
        <div class="map-section">
          <h2>Peta Lokasi Cerita</h2>
          <div id="mapContainer" class="map-container"></div>
        </div>
        <div class="list-section">
          <h2>Daftar Cerita Terlihat (<span id="storyCount">0</span>)</h2>
          <div id="storiesContainer" class="stories-list">
            <p>Memuat data cerita...</p>
          </div>
        </div>
      </section>

      <div id="addStoryModal" class="modal-overlay hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Bagikan Cerita Baru</h3>
            <button id="closeModalBtn" class="close-btn" aria-label="Tutup">&times;</button>
          </div>
          <form id="addStoryForm">
            <div class="form-group">
              <label for="descInput">Deskripsi Singkat</label>
              <textarea id="descInput" required rows="3" placeholder="Ceritakan pengalamanmu..."></textarea>
            </div>

            <div class="media-container">
              <div class="media-box">
                <label>Pilih dari Galeri</label>
                <input type="file" id="fileInput" accept="image/*">
              </div>
              <div class="media-box">
                <label>Atau Ambil Kamera</label>
                <div class="camera-wrapper">
                  <video id="cameraVideo" autoplay playsinline></video>
                  <button type="button" id="captureBtn">Jepret Foto</button>
                </div>
              </div>
            </div>
            
            <div class="preview-box">
              <p>Pratinjau Foto:</p>
              <img id="imagePreview" alt="Pratinjau" class="hidden">
              <canvas id="canvas" class="hidden" width="320" height="240"></canvas>
            </div>

            <div class="form-group">
              <label>Pilih Titik Lokasi Peta (Klik Peta)</label>
              <div id="modalMap" class="modal-map-container"></div>
              <div class="coord-inputs">
                <input type="text" id="inputLat" readonly placeholder="Latitude">
                <input type="text" id="inputLon" readonly placeholder="Longitude">
              </div>
            </div>

            <p id="modalFeedback" class="feedback-msg"></p>
            <button type="submit" id="btnSubmitStory" class="submit-btn">Kirim Cerita</button>
          </form>
        </div>
      </div>
    `;
  }

  showStories(stories) {
    const container = document.getElementById('storiesContainer');
    const countLabel = document.getElementById('storyCount');
    
    container.innerHTML = '';
    countLabel.innerText = stories.length;

    if (stories.length === 0) {
      container.innerHTML = '<p>Tidak ada cerita di area ini.</p>';
      return;
    }
    
    stories.forEach(story => {
      const shortDesc = story.description.length > 80 
        ? story.description.substring(0, 80) + '...' 
        : story.description;
      
      const date = new Date(story.createdAt).toLocaleDateString('id-ID');

      container.innerHTML += `
        <div class="story-card" id="story-${story.id}">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-img" crossorigin="anonymous">
          <div class="story-info">
            <h4>${story.name}</h4>
            <span class="story-date">${date}</span>
            <p>${shortDesc}</p>
          </div>
        </div>
      `;
    });
  }
}

export default HomeView;