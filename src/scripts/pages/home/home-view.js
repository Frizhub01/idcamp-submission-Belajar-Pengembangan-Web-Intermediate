class HomeView {
  getTemplate() {
    return `
      <section class="home-content">
        <h2>Daftar Cerita Terbaru</h2>
        <div id="storiesContainer" class="stories-list">
          </div>
      </section>
    `;
  }

  showStories(stories) {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = '';
    
    // Looping data cerita menjadi elemen HTML (sesuaikan detailnya di Kriteria 2)
    stories.forEach(story => {
      container.innerHTML += `
        <div class="story-card">
          <h4>${story.name}</h4>
          <p>${story.description}</p>
        </div>
      `;
    });
  }
}

export default HomeView;