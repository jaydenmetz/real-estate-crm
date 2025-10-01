/**
 * Token Refresh Utility for Health Dashboards
 *
 * Ensures JWT tokens are valid before running health checks
 * Automatically refreshes expired tokens to prevent 401 errors
 */

/**
 * Decode a JWT token (simple base64 decode, no validation)
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired or about to expire
 * @param {string} token - JWT token to check
 * @param {number} bufferSeconds - Consider token expired if it expires within this many seconds (default: 60)
 * @returns {boolean} - True if token is expired or about to expire
 */
export const isTokenExpired = (token, bufferSeconds = 60) => {
  if (!token) return true;

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000; // Convert to seconds
    const expirationTime = decoded.exp;

    // Token is expired if current time + buffer is past expiration
    return (currentTime + bufferSeconds) >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat invalid tokens as expired
  }
};

/**
 * Get the current JWT token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getCurrentToken = () => {
  return localStorage.getItem('crm_auth_token') ||
         localStorage.getItem('authToken') ||
         localStorage.getItem('token');
};

/**
 * Refresh the JWT token by calling the refresh endpoint
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const refreshJWTToken = async () => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      return { success: false, error: 'Token refresh failed' };
    }

    const data = await response.json();

    if (data.success && data.data?.token) {
      // Save new token to all storage locations
      const newToken = data.data.token;
      localStorage.setItem('crm_auth_token', newToken);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('token', newToken);

      // Update refresh token if provided
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }

      console.log('JWT token refreshed successfully');
      return { success: true, token: newToken };
    }

    return { success: false, error: 'Invalid refresh response' };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ensure we have a valid JWT token before running health checks
 * Automatically refreshes the token if expired or about to expire
 *
 * @returns {Promise<{success: boolean, token?: string, error?: string, shouldLogin?: boolean}>}
 */
export const ensureValidToken = async () => {
  const currentToken = getCurrentToken();

  // No token at all - user needs to login
  if (!currentToken) {
    return {
      success: false,
      error: 'No authentication token found. Please log in.',
      shouldLogin: true
    };
  }

  // Check if token is expired or about to expire (within 60 seconds)
  if (isTokenExpired(currentToken, 60)) {
    console.log('Token expired or about to expire, attempting refresh...');

    // Try to refresh the token
    const refreshResult = await refreshJWTToken();

    if (refreshResult.success) {
      return {
        success: true,
        token: refreshResult.token
      };
    }

    // Refresh failed - user needs to login again
    return {
      success: false,
      error: 'Token expired and refresh failed. Please log in again.',
      shouldLogin: true
    };
  }

  // Token is valid
  return {
    success: true,
    token: currentToken
  };
};

/**
 * Setup automatic token refresh check before health tests run
 * Call this in the useEffect of health dashboard components
 *
 * @param {Function} onTokenRefreshed - Callback when token is refreshed
 * @param {Function} onTokenExpired - Callback when token is expired and can't be refreshed
 * @returns {Function} - Cleanup function
 */
export const setupHealthCheckTokenRefresh = (onTokenRefreshed, onTokenExpired) => {
  let intervalId = null;

  const checkToken = async () => {
    const result = await ensureValidToken();

    if (!result.success) {
      if (result.shouldLogin && onTokenExpired) {
        onTokenExpired(result.error);
      }
    } else if (result.token && onTokenRefreshed) {
      // Token was refreshed
      const currentToken = getCurrentToken();
      if (currentToken !== result.token) {
        onTokenRefreshed(result.token);
      }
    }
  };

  // Check immediately
  checkToken();

  // Check every 30 seconds while on the health dashboard
  intervalId = setInterval(checkToken, 30000);

  // Cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};
