// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5050',
    timeout: 30000
  },
  production: {
    baseURL: 'https://crm.jaydenmetz.com',
    timeout: 30000
  }
};

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

// Get API base URL
export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development.baseURL 
  : API_CONFIG.production.baseURL;

// Helper function to build API URLs
export const apiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function for API calls with better error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(apiUrl(url), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
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