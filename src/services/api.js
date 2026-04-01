// API Service - Connects to PHP backend with MySQL database
// All sensitive operations go through this service

import { API_URL } from '@/lib/api';

const API_BASE = API_URL;

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Pinggy-No-Screen': 'true',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth Service
export const authService = {
  // Register new user
  async register(userData) {
    return await apiCall('auth.php?action=register', 'POST', userData);
  },
  
  // Login user
  async login(email, password) {
    return await apiCall('auth.php?action=login', 'POST', { email, password });
  },
  
  // Get user profile
  async getProfile(userId) {
    return await apiCall(`auth.php?action=profile&userId=${userId}`);
  },
  
  // Update profile
  async updateProfile(userId, data) {
    return await apiCall('auth.php?action=update_profile', 'POST', { userId, ...data });
  },
  
  // Change password (requires current password verification)
  async changePassword(userId, currentPassword, newPassword) {
    return await apiCall('auth.php?action=change_password', 'POST', {
      userId,
      currentPassword,
      newPassword
    });
  }
};

// Cars Service
export const carsService = {
  // Get all cars (with filters)
  async getCars(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiCall(`cars.php?action=list${params ? '&' + params : ''}`);
  },
  
  // Get single car
  async getCar(carId) {
    return await apiCall(`cars.php?action=get&carId=${carId}`);
  },
  
  // Get user's cars
  async getMyCars(userId) {
    return await apiCall(`cars.php?action=my_cars&userId=${userId}`);
  },
  
  // Add new car
  async addCar(carData, userId) {
    return await apiCall('cars.php?action=add', 'POST', { ...carData, userId });
  },
  
  // Update car
  async updateCar(carId, carData) {
    return await apiCall('cars.php?action=update', 'POST', { carId, ...carData });
  },
  
  // Delete car
  async deleteCar(carId) {
    return await apiCall(`cars.php?action=delete&carId=${carId}`, 'POST');
  }
};

// Messages Service
export const messagesService = {
  // Get conversations for user
  async getConversations(userId) {
    return await apiCall(`messages.php?action=conversations&userId=${userId}`);
  },
  
  // Get messages for specific conversation
  async getMessages(userId, otherUserId, carId = null) {
    let url = `messages.php?action=list&userId=${userId}&otherUserId=${otherUserId}`;
    if (carId) url += `&carId=${carId}`;
    return await apiCall(url);
  },
  
  // Send message
  async sendMessage(fromUserId, toUserId, carId, message) {
    return await apiCall('messages.php?action=send', 'POST', {
      fromUserId,
      toUserId,
      carId,
      message
    });
  },
  
  // Mark as read
  async markAsRead(messageId) {
    return await apiCall(`messages.php?action=read&messageId=${messageId}`, 'POST');
  }
};

// Payments/Packages Service
export const paymentsService = {
  // Get available packages
  async getPackages() {
    return await apiCall('payments.php?action=packages');
  },
  
  // Get user package
  async getUserPackage(userId) {
    return await apiCall(`payments.php?action=user_package&userId=${userId}`);
  },
  
  // Purchase package
  async purchasePackage(userId, packageId, paymentData) {
    return await apiCall('payments.php?action=purchase', 'POST', {
      userId,
      packageId,
      ...paymentData
    });
  },
  
  // Get purchase history
  async getHistory(userId) {
    return await apiCall(`payments.php?action=history&userId=${userId}`);
  },
  
  // Get boost packages
  async getBoostPackages() {
    return await apiCall('payments.php?action=boosts');
  },
  
  // Purchase boost
  async purchaseBoost(userId, boostId, carId, days) {
    return await apiCall('payments.php?action=purchase_boost', 'POST', {
      userId,
      boostId,
      carId,
      days
    });
  }
};

// Favorites Service
export const favoritesService = {
  // Get user favorites
  async getFavorites(userId) {
    return await apiCall(`favorites.php?action=list&userId=${userId}`);
  },
  
  // Add to favorites
  async addFavorite(userId, carId) {
    return await apiCall('favorites.php?action=add', 'POST', { userId, carId });
  },
  
  // Remove from favorites
  async removeFavorite(userId, carId) {
    return await apiCall(`favorites.php?action=remove&userId=${userId}&carId=${carId}`, 'POST');
  }
};

export default {
  auth: authService,
  cars: carsService,
  messages: messagesService,
  payments: paymentsService,
  favorites: favoritesService
};