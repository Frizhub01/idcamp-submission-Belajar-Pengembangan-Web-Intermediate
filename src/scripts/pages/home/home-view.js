class HomeView {
  getTemplate() {
    return `
      <section class="home-layout">
        <h1 class="visually-hidden">StoryDrop - Jelajahi Cerita Dunia</h1>

        <a href="#/add" id="fabAddStory" class="fab-btn" aria-label="Tambah Cerita Baru">
          <i class="fas fa-plus"></i> Tambah Cerita
        </a>
        
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
    `;
  }

  showStories(stories) {
    const container = document.getElementById("storiesContainer");
    const countLabel = document.getElementById("storyCount");
    
    if (!container || !countLabel) return;

    countLabel.innerText = stories.length;
    container.innerHTML = "";

    if (stories.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding: 20px;">Tidak ada cerita di area peta ini.</p>';
      return;
    }

    stories.forEach((story) => {
      const shortDesc = story.description.length > 80 ? story.description.substring(0, 80) + "..." : story.description;
      const date = new Date(story.createdAt).toLocaleDateString("id-ID");

      container.innerHTML += `
        <article class="story-card" id="story-${story.id}">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-img" crossorigin="anonymous">
          <div class="story-info">
            <h3>${story.name}</h3> <span class="story-date">${date}</span>
            <p>${shortDesc}</p>
          </div>
        </article>
      `;
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