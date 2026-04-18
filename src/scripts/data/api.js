const BASE_URL = 'https://story-api.dicoding.dev/v1';

class StoryApi {
  static getAccessToken() {
    return localStorage.getItem('token');
  }

  static async register({ name, email, password }) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async getStoriesWithLocation() {
    try {
      const response = await fetch(`${BASE_URL}/stories?location=1`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      });
      
      const responseJson = await response.json();
      
      if (!responseJson.error) {
        return responseJson.listStory; 
      } else {
        throw new Error(responseJson.message);
      }
    } catch (error) {
      console.error('Gagal mengambil data cerita:', error);
      return []; 
    }
  }
}

export default StoryApi;