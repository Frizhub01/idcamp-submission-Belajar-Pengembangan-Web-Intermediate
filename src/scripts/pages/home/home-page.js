import HomeView from "./home-view";
import StoryApi from "../../data/api";

class HomePage {
  constructor() {
    this.view = new HomeView();
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.view.initMap(() => this.onMapMoved());
    await this.loadData();
  }

  async loadData() {
    try {
      const stories = await StoryApi.getStoriesWithLocation();
      this.view.renderMarkers(stories);
      this.onMapMoved();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  onMapMoved() {
    const visibleStories = this.view.getVisibleStories();
    this.view.showStories(visibleStories);
  }
}

export default HomePage;