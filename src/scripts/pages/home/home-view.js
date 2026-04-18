class HomeView {
  getTemplate() {
    return `
      <section class="home-layout">
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