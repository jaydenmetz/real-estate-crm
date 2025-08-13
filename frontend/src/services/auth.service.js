// Authentication service for handling login, logout, and token management
import apiInstance from './api.service';

const TOKEN_KEY = 'authToken';  // Match what api.service.js expects
const USER_KEY = 'user';  // Match what api.service.js expects
const API_KEY_KEY = 'apiKey';  // Match what api.service.js expects

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
      apiInstance.setToken(token);
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
        
        // Save to localStorage for persistence
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        // Set auth header
        apiInstance.setToken(token);
        
        // If user has an API key, store it
        if (user?.apiKey) {
          this.apiKey = user.apiKey;
          localStorage.setItem(API_KEY_KEY, user.apiKey);
          apiInstance.setApiKey(user.apiKey);
        }
        
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
        
        // Save to localStorage for persistence
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        // Set auth header
        apiInstance.setToken(token);
        
        // If user has an API key, store it
        if (user?.apiKey) {
          this.apiKey = user.apiKey;
          localStorage.setItem(API_KEY_KEY, user.apiKey);
          apiInstance.setApiKey(user.apiKey);
        }
        
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

    // Clear local storage - also clear old keys for compatibility
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_KEY_KEY);
    localStorage.removeItem('crm_auth_token');  // Clear old key
    localStorage.removeItem('crm_user_data');  // Clear old key
    localStorage.removeItem('crm_api_key');  // Clear old key
    
    // Clear instance variables
    this.token = null;
    this.user = null;
    this.apiKey = null;
    
    // Clear auth header
    apiInstance.setToken(null);
    apiInstance.setApiKey(null);
    
    return { success: true };
  }

  // Verify current token
  async verify() {
    // Refresh tokens from localStorage
    this.token = localStorage.getItem(TOKEN_KEY);
    this.apiKey = localStorage.getItem(API_KEY_KEY);
    this.user = this.getStoredUser();
    
    // If we have a stored user and either token or API key, consider it valid
    // This prevents unnecessary logout on page navigation
    if (this.user && (this.token || this.apiKey)) {
      // Optionally verify with server (but don't logout on failure)
      try {
        const response = await apiInstance.get('/auth/verify');
        
        if (response.success && response.data) {
          // Update user data with fresh data from server
          this.user = response.data.user;
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
      } catch (error) {
        // If verification fails but we have stored auth, keep user logged in
        console.warn('Token verification failed, using cached auth:', error.message);
        // Only logout if it's a clear authentication failure
        if (error.status === 401 && !this.apiKey) {
          // No API key fallback, so logout
          await this.logout();
          return {
            success: false,
            error: 'Authentication expired'
          };
        }
      }
      
      // Return success if we have user data
      return {
        success: true,
        user: this.user
      };
    }
    
    // No auth found
    return { success: false, error: 'No authentication found' };
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
    // Always get fresh from localStorage
    if (!this.user) {
      this.user = this.getStoredUser();
    }
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Check localStorage for tokens if not in memory
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem(API_KEY_KEY);
    }
    if (!this.user) {
      this.user = this.getStoredUser();
    }
    // User is authenticated if they have either a JWT token or API key
    return (!!this.token || !!this.apiKey) && !!this.user;
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