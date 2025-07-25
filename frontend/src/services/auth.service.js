// Authentication service for handling login, logout, and token management
import apiInstance from './api';

const TOKEN_KEY = 'crm_auth_token';
const USER_KEY = 'crm_user_data';
const API_KEY_KEY = 'crm_api_key';

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.user = this.getStoredUser();
    this.apiKey = localStorage.getItem(API_KEY_KEY);
    
    // Set token in API instance if exists
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  // Set authorization header
  setAuthHeader(token) {
    if (token) {
      apiInstance.token = token;
      // Also set default headers for axios if using it directly
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await apiInstance.post('/auth/register', userData);

      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        this.token = token;
        this.user = user;
        this.apiKey = user.apiKey;
        
        // Save to localStorage for persistence
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (user.apiKey) {
          localStorage.setItem(API_KEY_KEY, user.apiKey);
        }
        
        // Set auth header
        this.setAuthHeader(token);
        
        return {
          success: true,
          user: user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        error: response.error || 'Registration failed'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Network error during registration'
      };
    }
  }

  // Login user
  async login(username, password, rememberMe = true) {
    try {
      const response = await apiInstance.post('/auth/login', {
        username,
        password,
        rememberMe
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        this.token = token;
        this.user = user;
        this.apiKey = user.apiKey;
        
        // Save to localStorage for persistence
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (user.apiKey) {
          localStorage.setItem(API_KEY_KEY, user.apiKey);
        }
        
        // Set auth header
        this.setAuthHeader(token);
        
        return {
          success: true,
          user: user
        };
      }
      
      return {
        success: false,
        error: response.error || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error during login'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to invalidate session
      if (this.token) {
        await apiInstance.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }

    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_KEY_KEY);
    
    // Clear instance variables
    this.token = null;
    this.user = null;
    this.apiKey = null;
    
    // Clear auth header
    apiInstance.token = null;
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
    
    return { success: true };
  }

  // Verify current token
  async verify() {
    if (!this.token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await apiInstance.get('/auth/verify');
      
      if (response.success && response.data) {
        // Update user data with fresh data from server
        this.user = response.data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user
        };
      }
      
      // Token is invalid, clear it
      await this.logout();
      return {
        success: false,
        error: 'Invalid token'
      };
    } catch (error) {
      console.error('Token verification error:', error);
      
      // If it's a 401/403, clear the token
      if (error.status === 401 || error.status === 403) {
        await this.logout();
      }
      
      return {
        success: false,
        error: error.message || 'Failed to verify token'
      };
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiInstance.put('/auth/preferences', preferences);
      
      if (response.success && response.data) {
        // Update local user data
        this.user = {
          ...this.user,
          preferences: response.data.preferences
        };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        
        return {
          success: true,
          preferences: response.data.preferences
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to update preferences'
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update preferences'
      };
    }
  }

  // Update user profile
  async updateProfile(profile) {
    try {
      const response = await apiInstance.put('/auth/profile', profile);
      
      if (response.success && response.data) {
        // Update local user data
        this.user = {
          ...this.user,
          profile: response.data.profile
        };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        
        return {
          success: true,
          profile: response.data.profile
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to update profile'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin') || this.hasRole('system_admin');
  }

  // Get API key for backend access
  getApiKey() {
    return this.apiKey;
  }

  // Get user preference
  getPreference(key, defaultValue = null) {
    return this.user?.preferences?.[key] ?? defaultValue;
  }

  // Check if should show debug info
  shouldShowDebugInfo() {
    return this.getPreference('showDebugInfo', false);
  }

  // Get error display mode
  getErrorDisplayMode() {
    return this.getPreference('errorDisplay', 'friendly');
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;