import HomeView from './home-view'; 

class HomePage {
  constructor() {
    this.view = new HomeView();
  }

  async render() {
    return this.view.getTemplate(); 
  }

  async afterRender() {
    // Data dummy sementara sebelum menghubungkan API di Kriteria 2
    const dummyStories = [
      { name: 'Cerita Dummy 1', description: 'Ini adalah deskripsi cerita 1...' },
      { name: 'Cerita Dummy 2', description: 'Ini adalah deskripsi cerita 2...' }
    ];

    this.view.showStories(dummyStories); 
  }
}

export default HomePage;