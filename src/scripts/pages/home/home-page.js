import HomeView from "./home-view";
import StoryApi from "../../data/api";
import StoryIdb from "../../data/idb";

class HomePage {
  constructor() {
    this.view = new HomeView();
    this.allStories = [];
    this.isShowingFavorites = false;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.view.initMap(() => this.onMapMoved());

    this.view.initSearchListener((query) => this.onSearch(query));

    this.view.initFilterButtons(
      () => this.showAllStories(),
      () => this.showFavoriteStories(),
    );

    await this.loadData();
  }

  async loadData() {
    try {
      this.allStories = await StoryApi.getStoriesWithLocation();

      this.allStories.forEach(async (story) => {
        await StoryIdb.putStory(story);
      });

      this.showAllStories();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  showAllStories() {
    this.isShowingFavorites = false;
    this.view.renderMarkers(this.allStories);
    this.onMapMoved();
  }

  async showFavoriteStories() {
    this.isShowingFavorites = true;
    const favStories = await StoryIdb.getFavoriteStories();

    this.view.renderMarkers(favStories);
    await this.view.showStories(favStories);
    this.attachFavoriteListener();
  }

  async onMapMoved() {
    if (this.isShowingFavorites) return;

    const visibleStories = this.view.getVisibleStories();
    await this.view.showStories(visibleStories);
    this.attachFavoriteListener();
  }

  attachFavoriteListener() {
    this.view.initFavoriteButtons(async (storyId, action) => {
      if (action === "add") {
        const story = this.allStories.find((s) => s.id === storyId);
        if (story) await StoryIdb.putFavorite(story);
      } else if (action === "delete") {
        await StoryIdb.deleteFavorite(storyId);
      }

      if (this.isShowingFavorites) {
        this.showFavoriteStories();
      } else {
        this.onMapMoved();
      }
    });
  }

  async onSearch(query) {
    let sourceData = this.allStories;
    if (this.isShowingFavorites) {
      sourceData = await StoryIdb.getFavoriteStories();
    }

    const filteredStories = sourceData.filter((story) => 
      story.name.toLowerCase().includes(query.toLowerCase())
    );
    
    this.view.renderMarkers(filteredStories);
    await this.view.showStories(filteredStories);
    this.attachFavoriteListener();
  }
}

export default HomePage;
