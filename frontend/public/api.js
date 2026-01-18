// API configuration for production - using your Render backend
const API_BASE_URL = 'https://the-ghost-07of.onrender.com/api/v1'; // Your Render backend URL

// API utility functions
const api = {
  // Register a new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user profile (requires token)
  async getUserProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Request AI video generation (requires token)
  async requestVideo(videoData, token) {
    try {
      // Check if user is guest
      const isGuest = localStorage.getItem('isGuest');
      
      // Add guest header if applicable
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (isGuest) {
        headers['X-Guest-User'] = 'true';
      }
      
      const response = await fetch(`${API_BASE_URL}/content/request`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(videoData),
      });
      return await response.json();
    } catch (error) {
      console.error('Video request error:', error);
      throw error;
    }
  },

  // Get user's video requests (requires token)
  async getUserRequests(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get requests error:', error);
      throw error;
    }
  },
  // Get trending topics
  async getTrendingTopics() {
    try {
      const response = await fetch(`${API_BASE_URL}/content/trending`);
      return await response.json();
    } catch (error) {
      console.error('Get trending topics error:', error);
      throw error;
    }
  },
  
  // Google OAuth login
  async googleLogin() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  
  // GitHub OAuth login
  async githubLogin() {
    window.location.href = `${API_BASE_URL}/auth/github`;
  }
};

// Export the API object
window.api = api;
