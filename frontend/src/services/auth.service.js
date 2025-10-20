// Authentication service for handling login, logout, and token management
import apiInstance from './api.service';

const TOKEN_KEY = 'authToken';  // Match what api.service.js expects
const USER_KEY = 'user';  // Match what api.service.js expects
const API_KEY_KEY = 'apiKey';  // Match what api.service.js expects

class AuthService {
  constructor() {
    // PHASE 1: Load JWT from localStorage for persistence across page refreshes
    // Security: Short 15-min expiration + refresh token in httpOnly cookie mitigates XSS risk
    this.token = localStorage.getItem(TOKEN_KEY);
    this.user = this.getStoredUser();
    this.apiKey = localStorage.getItem(API_KEY_KEY);

    // Set token in apiInstance if available
    if (this.token) {
      apiInstance.setToken(this.token);
    }

    // Set API key header if exists (API keys are safe to store)
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

        // PHASE 1: Store JWT in localStorage for persistence
        this.token = authToken;
        localStorage.setItem(TOKEN_KEY, authToken);
        apiInstance.setToken(authToken);

        // Store user data in localStorage
        this.user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Store token expiry for auto-refresh logic
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

        // console.log('✅ Registration successful - JWT stored in localStorage (Phase 1)');

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

        // PHASE 1: Store JWT in localStorage for persistence
        // Refresh token is stored in httpOnly cookie by backend (XSS-proof)
        this.token = authToken;
        localStorage.setItem(TOKEN_KEY, authToken);
        apiInstance.setToken(authToken);

        // Store user data in localStorage
        this.user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Store token expiry for auto-refresh logic
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

        // console.log('✅ Login successful - JWT stored in localStorage (Phase 1)');

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
      // PHASE 2: Log refresh attempt for debugging
      const oldExpiry = localStorage.getItem('tokenExpiry');
      const timeUntilExpiry = oldExpiry ? Math.round((parseInt(oldExpiry) - Date.now()) / 1000) : 0;
      // console.log(`🔄 Refreshing token (expires in ${timeUntilExpiry}s)...`);

      const response = await apiInstance.post('/auth/refresh', {});

      if (response.success && response.data) {
        const { accessToken, expiresIn } = response.data;

        // PHASE 1: Store refreshed JWT in localStorage
        this.token = accessToken;
        localStorage.setItem(TOKEN_KEY, accessToken);
        apiInstance.setToken(accessToken);

        // Update expiry time
        if (expiresIn) {
          const expiryTime = Date.now() + this.parseExpiry(expiresIn);
          localStorage.setItem('tokenExpiry', expiryTime.toString());

          // PHASE 2: Log new expiry for debugging
          const newExpirySeconds = Math.round((expiryTime - Date.now()) / 1000);
          // console.log(`✅ Token refreshed - new expiry in ${newExpirySeconds}s (~${Math.round(newExpirySeconds / 60)} minutes)`);
        } else {
          // console.log('✅ Token refreshed - JWT stored in localStorage');
        }

        return {
          success: true,
          token: accessToken
        };
      }

      console.error('❌ Token refresh failed:', response.error);
      return {
        success: false,
        error: response.error || 'Token refresh failed'
      };
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Network error during token refresh'
      };
    }
  }

  // PHASE 2: Check if token is about to expire (within 2 minutes)
  isTokenExpiringSoon() {
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (!expiryTime) {
      console.warn('⚠️ No tokenExpiry found in localStorage');
      return false;
    }

    const timeUntilExpiry = parseInt(expiryTime) - Date.now();
    const minutes = Math.round(timeUntilExpiry / 60000);
    const isExpiringSoon = timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes

    // PHASE 2: Only log when check matters (either expiring soon or at key intervals)
    if (isExpiringSoon) {
      // console.log(`⏰ Token expiring soon: ${Math.round(timeUntilExpiry / 1000)}s remaining`);
    }

    return isExpiringSoon;
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

    // PHASE 1: Clear JWT from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_KEY_KEY);
    localStorage.removeItem('tokenExpiry');

    // Clear old keys for backward compatibility
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_user_data');
    localStorage.removeItem('crm_api_key');

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
    // PHASE 1: Load JWT from localStorage if not in memory
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
      if (this.token) {
        apiInstance.setToken(this.token);
      }
    }

    this.apiKey = localStorage.getItem(API_KEY_KEY);
    this.user = this.getStoredUser();

    // If user has no token in localStorage but has user data, try to refresh using httpOnly cookie
    if (this.user && !this.token && !this.apiKey) {
      // console.log('🔄 No token found, attempting to refresh from httpOnly cookie...');
      try {
        const refreshResult = await this.refreshAccessToken();
        if (refreshResult.success) {
          // console.log('✅ Token refreshed successfully from httpOnly cookie');
          // Token is now set in localStorage and memory
          if (!this.token) {
            console.error('❌ Token refresh succeeded but token is still null');
            await this.logout();
            return {
              success: false,
              error: 'Token restoration failed'
            };
          }
        } else {
          console.warn('❌ Token refresh failed:', refreshResult.error);
          // If refresh fails, user must log in again
          await this.logout();
          return {
            success: false,
            error: refreshResult.error || 'Session expired'
          };
        }
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        // If refresh throws error, user must log in again
        await this.logout();
        return {
          success: false,
          error: 'Session expired'
        };
      }
    }

    // If we have a stored user and either token or API key, consider it valid
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
        // If verification fails with 401 and we're using JWT (not API key), try to refresh token
        if (error.status === 401 && this.token && !this.apiKey) {
          console.log('🔄 Token expired, attempting automatic refresh...');

          try {
            const refreshResult = await this.refreshAccessToken();

            if (refreshResult.success) {
              console.log('✅ Token refreshed successfully');
              // Verify again with new token
              try {
                const verifyResponse = await apiInstance.get('/auth/verify');
                if (verifyResponse.success && verifyResponse.data) {
                  this.user = verifyResponse.data.user;
                  localStorage.setItem(USER_KEY, JSON.stringify(verifyResponse.data.user));
                  return {
                    success: true,
                    user: this.user
                  };
                }
              } catch (verifyError) {
                // Even if re-verification fails, we have a valid refreshed token
                console.warn('Token refreshed but re-verification failed, continuing with cached auth');
              }
            } else {
              // Refresh failed - logout user
              console.error('❌ Token refresh failed, logging out');
              await this.logout();
              return {
                success: false,
                error: 'Session expired - please login again'
              };
            }
          } catch (refreshError) {
            console.error('❌ Token refresh error:', refreshError);
            await this.logout();
            return {
              success: false,
              error: 'Authentication expired'
            };
          }
        }

        // For other errors or if using API key, just warn and continue with cached auth
        console.warn('Token verification failed, using cached auth:', error.message);
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
    // PHASE 1: Check localStorage for JWT token
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
      if (this.token) {
        apiInstance.setToken(this.token);
      }
    }

    // Check for API key (safe to store)
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem(API_KEY_KEY);
    }
    if (!this.user) {
      this.user = this.getStoredUser();
    }

    // User is authenticated if they have:
    // 1. JWT token in localStorage/memory
    // 2. API key in localStorage
    // 3. User data in localStorage
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