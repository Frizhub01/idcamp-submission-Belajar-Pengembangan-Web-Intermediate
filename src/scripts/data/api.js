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
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        throw new Error('Sesi anda telah tamat. Sila log masuk semula.');
      }

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

  static async addStory({ description, photo, lat, lon }) {
    const data = new FormData();
    data.append('description', description);
    data.append('photo', photo);
    
    if (lat && lon) {
      data.append('lat', lat);
      data.append('lon', lon);
    }

    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        body: data,
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        return { error: true, message: 'Sesi anda telah tamat. Sila log masuk semula.' };
      }

      return await response.json();
    } catch (error) {
      return { error: true, message: 'Gagal terhubung ke jaringan' };
    }
  }

}

export default StoryApi;