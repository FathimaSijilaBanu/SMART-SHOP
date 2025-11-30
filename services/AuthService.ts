// Authentication Service with JWT token management
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from './api.config';

const TOKEN_KEY = '@smartshop_access_token';
const REFRESH_TOKEN_KEY = '@smartshop_refresh_token';
const USER_KEY = '@smartshop_user';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  user_type: 'customer' | 'shopkeeper';
  created_at: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  phone: string;
  user_type: 'customer' | 'shopkeeper';
  password: string;
  password2: string;
}

class AuthService {
  // Store tokens securely
  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Store user data
  async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  // Get stored user
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Clear all auth data
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(this.formatErrorMessage(responseData));
      }

      // Store tokens and user data
      await this.storeTokens(responseData.tokens.access, responseData.tokens.refresh);
      await this.storeUser(responseData.user);

      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(credentials),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(this.formatErrorMessage(responseData));
      }

      // Store tokens and user data
      await this.storeTokens(responseData.tokens.access, responseData.tokens.refresh);
      await this.storeUser(responseData.user);

      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If refresh fails, clear auth data
        await this.clearAuth();
        throw new Error('Session expired. Please login again.');
      }

      // Store new access token
      await AsyncStorage.setItem(TOKEN_KEY, responseData.access);
      return responseData.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const token = await this.getAccessToken();
      
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            return this.getProfile(); // Retry with new token
          }
        }
        throw new Error(this.formatErrorMessage(responseData));
      }

      // Update stored user data
      await this.storeUser(responseData);
      return responseData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const token = await this.getAccessToken();
      
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROFILE}`, {
        method: 'PATCH',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            return this.updateProfile(data);
          }
        }
        throw new Error(this.formatErrorMessage(responseData));
      }

      await this.storeUser(responseData);
      return responseData;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    await this.clearAuth();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Format error messages
  private formatErrorMessage(errorData: any): string {
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (errorData.detail) {
      return errorData.detail;
    }
    
    if (errorData.error) {
      return errorData.error;
    }
    
    // Handle field-specific errors
    const errors: string[] = [];
    Object.keys(errorData).forEach(key => {
      if (Array.isArray(errorData[key])) {
        errors.push(`${key}: ${errorData[key].join(', ')}`);
      } else {
        errors.push(`${key}: ${errorData[key]}`);
      }
    });
    
    return errors.length > 0 ? errors.join('\n') : 'An error occurred';
  }
}

export default new AuthService();
