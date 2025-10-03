// API Configuration
const API_CONFIG = {
  development: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050',
    timeout: 30000
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com',
    timeout: 30000
  }
};

// Get API base URL - prioritize REACT_APP_API_URL from environment
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5050' 
    : 'https://api.jaydenmetz.com');

// Helper function to build API URLs
export const apiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If API_BASE_URL already includes /v1 and path starts with /v1, remove duplicate
  if (API_BASE_URL.includes('/v1') && cleanPath.startsWith('/v1')) {
    return `${API_BASE_URL}${cleanPath.substring(3)}`; // Remove '/v1' from path
  }
  
  // If API_BASE_URL doesn't have /v1 but path needs it, keep as is
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function for API calls with better error handling
export const apiCall = async (url, options = {}) => {
  // Get authentication token from multiple possible locations
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authentication header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(apiUrl(url), {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    
    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from API:', {
        url: apiUrl(url),
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: text.substring(0, 500)
      });
      
      throw new Error(`API returned non-JSON response (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', {
      url: apiUrl(url),
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export default {
  API_BASE_URL,
  apiUrl,
  apiCall
};