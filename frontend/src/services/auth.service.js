// Authentication service for handling login, logout, and token management
import apiInstance from './api.service';

const TOKEN_KEY = 'authToken';  // Match what api.service.js expects
const USER_KEY = 'user';  // Match what api.service.js expects
const API_KEY_KEY = 'apiKey';  // Match what api.service.js expects

class AuthService {
  constructor() {
    // DO NOT load token from localStorage (XSS vulnerability fixed)
    // Tokens are now stored in memory only and refresh token in httpOnly cookie
    this.token = null;
    this.user = this.getStoredUser();
    this.apiKey = localStorage.getItem(API_KEY_KEY);

    // Only set API key header if exists (API keys are safe to store)
    if (this.apiKey) {
      apiInstance.setApiKey(this.apiKey);
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
        // Extract user data and tokens from response
        const { token, accessToken, user, expiresIn } = response.data;
        const authToken = accessToken || token;

        // Store ONLY user data in localStorage (not tokens - XSS protection)
        this.user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Store access token in MEMORY ONLY (not localStorage)
        this.token = authToken;
        apiInstance.setToken(authToken);

        // Store token expiry for auto-refresh logic (not sensitive)
        if (expiresIn) {
          const expiryTime = Date.now() + this.parseExpiry(expiresIn);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }

        // If user has an API key, store it (API keys are designed to be stored)
        if (user?.apiKey) {
          this.apiKey = user.apiKey;
          localStorage.setItem(API_KEY_KEY, user.apiKey);
          apiInstance.setApiKey(user.apiKey);
        }

        console.log('✅ Registration successful - JWT stored in memory only (XSS-safe)');

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
        // Extract user data and tokens from response
        const { token, accessToken, user, expiresIn } = response.data;
        const authToken = accessToken || token;

        // Store ONLY user data in localStorage (not tokens - XSS protection)
        // Access token is sent in Authorization header (memory only)
        // Refresh token is stored in httpOnly cookie by backend (XSS-proof)
        this.user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Store access token in MEMORY ONLY (not localStorage)
        this.token = authToken;
        apiInstance.setToken(authToken);

        // Store token expiry for auto-refresh logic (not sensitive)
        if (expiresIn) {
          const expiryTime = Date.now() + this.parseExpiry(expiresIn);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }

        // If user has an API key, store it (API keys are designed to be stored)
        if (user?.apiKey) {
          this.apiKey = user.apiKey;
          localStorage.setItem(API_KEY_KEY, user.apiKey);
          apiInstance.setApiKey(user.apiKey);
        }

        console.log('✅ Login successful - JWT stored in memory only (XSS-safe)');

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

  // Parse expiry string (e.g., "15m", "7d") to milliseconds
  parseExpiry(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  }

  // Refresh access token using refresh token (stored in httpOnly cookie)
  async refreshAccessToken() {
    try {
      const response = await apiInstance.post('/auth/refresh', {});

      if (response.success && response.data) {
        const { accessToken, expiresIn } = response.data;

        // Update token in MEMORY ONLY (not localStorage - XSS protection)
        this.token = accessToken;
        apiInstance.setToken(accessToken);

        // Update expiry time (not sensitive data)
        if (expiresIn) {
          const expiryTime = Date.now() + this.parseExpiry(expiresIn);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }

        console.log('✅ Token refreshed - JWT in memory only (XSS-safe)');

        return {
          success: true,
          token: accessToken
        };
      }

      return {
        success: false,
        error: response.error || 'Token refresh failed'
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Network error during token refresh'
      };
    }
  }

  // Check if token is about to expire (within 2 minutes)
  isTokenExpiringSoon() {
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (!expiryTime) return false;

    const timeUntilExpiry = parseInt(expiryTime) - Date.now();
    return timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to invalidate httpOnly refresh token cookie
      if (this.token) {
        await apiInstance.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }

    // Clear user data from localStorage (Phase 4: JWT tokens NOT stored here)
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_KEY_KEY);
    localStorage.removeItem('tokenExpiry');

    // Clear old keys for backward compatibility
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_user_data');
    localStorage.removeItem('crm_api_key');

    // Clear instance variables (token is in memory only)
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
    // DO NOT load JWT from localStorage (XSS protection - Phase 4)
    // Token is already in memory from login/refresh
    this.apiKey = localStorage.getItem(API_KEY_KEY); // API keys are safe to load
    this.user = this.getStoredUser();

    // If user has no token in memory but has user data, try to refresh using httpOnly cookie
    if (this.user && !this.token && !this.apiKey) {
      console.log('🔄 No token in memory, attempting to refresh from httpOnly cookie...');
      try {
        const refreshResult = await this.refreshAccessToken();
        if (refreshResult.success) {
          console.log('✅ Token refreshed successfully from httpOnly cookie');
          // Token is now set in memory, continue with verification
        } else {
          console.warn('❌ Token refresh failed:', refreshResult.error);
          // Continue with cached user data anyway
        }
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        // Continue with cached user data anyway
      }
    }

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
    // DO NOT check localStorage for JWT tokens (they're never stored there - XSS protection)
    // JWT tokens are only in memory, refresh tokens are in httpOnly cookies

    // Check for API key (safe to store)
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem(API_KEY_KEY);
    }
    if (!this.user) {
      this.user = this.getStoredUser();
    }

    // User is authenticated if they have:
    // 1. JWT token in memory (set after login/refresh)
    // 2. API key in localStorage
    // 3. User data in localStorage (indicates they logged in before page refresh)
    //
    // If user has no token in memory but has user data, they likely just refreshed the page.
    // The refresh token (httpOnly cookie) will be used automatically on next API call.
    return (!!this.token || !!this.apiKey || !!this.user);
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