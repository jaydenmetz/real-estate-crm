// Utility to refresh authentication token
export const refreshAuthToken = async () => {
  try {
    console.log('Attempting to refresh authentication token...');
    
    // Try emergency login endpoint
    const response = await fetch('https://api.jaydenmetz.com/v1/auth/emergency-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.data.token) {
        // Save new token to all possible locations
        const token = data.data.token;
        localStorage.setItem('crm_auth_token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token);
        
        // Save user data
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        console.log('Authentication token refreshed successfully');
        return { success: true, token };
      }
    }
    
    // If emergency login fails, try regular login
    const regularResponse = await fetch('https://api.jaydenmetz.com/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!'
      })
    });
    
    if (regularResponse.ok) {
      const data = await regularResponse.json();
      
      if (data.success && data.data.token) {
        // Save new token to all possible locations
        const token = data.data.token;
        localStorage.setItem('crm_auth_token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token);
        
        // Save user data
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        console.log('Authentication token refreshed successfully (regular login)');
        return { success: true, token };
      }
    }
    
    console.error('Failed to refresh authentication token');
    return { success: false, error: 'Failed to authenticate' };
    
  } catch (error) {
    console.error('Error refreshing authentication:', error);
    return { success: false, error: error.message };
  }
};

// Auto-refresh on 401 errors
export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // If we get a 401, try to refresh token
    if (response.status === 401 && !args[0].includes('/auth/')) {
      console.log('Got 401, attempting to refresh token...');
      const refreshResult = await refreshAuthToken();
      
      if (refreshResult.success) {
        // Retry the original request with new token
        const [url, options = {}] = args;
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${refreshResult.token}`;
        
        return originalFetch(url, options);
      }
    }
    
    return response;
  };
};