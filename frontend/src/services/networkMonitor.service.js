// Network monitoring service for debugging
class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.maxRequests = 100; // Keep last 100 requests
    this.isEnabled = false;
    this.subscribers = [];
    
    // Auto-enable for admin users or development
    this.checkEnableStatus();
  }

  checkEnableStatus() {
    // Enable in development or for system admin username
    const isDev = process.env.NODE_ENV === 'development';
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      // Silent fail
    }
    const isSystemAdmin = user.username === 'admin';
    
    const shouldEnable = isDev || isSystemAdmin;
    
    if (shouldEnable && !this.isEnabled) {
      this.isEnabled = true;
      this.interceptFetch();
      this.interceptXHR();
      // console.log('🔍 Network Monitor enabled:', { isDev, username: user.username });
    } else if (!shouldEnable && this.isEnabled) {
      this.isEnabled = false;
      // console.log('🔍 Network Monitor disabled');
    }
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      // Log request start
      const requestInfo = {
        id: requestId,
        url: typeof url === 'string' ? url : url.url,
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
        startTime,
        timestamp: new Date().toISOString(),
        type: 'fetch',
        status: 'pending'
      };
      
      this.addRequest(requestInfo);
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody = null;
        let responseText = null;
        
        try {
          responseText = await responseClone.text();
          if (responseText) {
            try {
              responseBody = JSON.parse(responseText);
            } catch {
              responseBody = responseText;
            }
          }
        } catch (e) {
          responseBody = 'Unable to read response body';
        }
        
        // Update request with response info
        this.updateRequest(requestId, {
          status: 'completed',
          statusCode: response.status,
          statusText: response.statusText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody,
          responseText,
          duration,
          endTime,
          success: response.ok,
          error: !response.ok ? {
            status: response.status,
            statusText: response.statusText,
            message: `HTTP ${response.status}: ${response.statusText}`
          } : null
        });
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Update request with error info
        this.updateRequest(requestId, {
          status: 'error',
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          duration,
          endTime,
          success: false
        });
        
        throw error;
      }
    };
  }

  interceptXHR() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._networkMonitor = {
        method,
        url,
        startTime: Date.now(),
        id: NetworkMonitor.getInstance().generateRequestId()
      };
      
      return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
      if (!this._networkMonitor) return originalXHRSend.call(this, body);
      
      const monitor = NetworkMonitor.getInstance();
      const requestInfo = {
        ...this._networkMonitor,
        body,
        timestamp: new Date().toISOString(),
        type: 'xhr',
        status: 'pending'
      };
      
      monitor.addRequest(requestInfo);
      
      this.addEventListener('loadend', () => {
        const endTime = Date.now();
        const duration = endTime - requestInfo.startTime;
        
        monitor.updateRequest(requestInfo.id, {
          status: this.status === 0 ? 'error' : 'completed',
          statusCode: this.status,
          statusText: this.statusText,
          responseHeaders: this.getAllResponseHeaders(),
          responseBody: this.responseText,
          duration,
          endTime,
          success: this.status >= 200 && this.status < 300,
          error: this.status >= 400 ? {
            status: this.status,
            statusText: this.statusText,
            message: `HTTP ${this.status}: ${this.statusText}`
          } : null
        });
      });
      
      return originalXHRSend.call(this, body);
    };
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addRequest(requestInfo) {
    if (!this.isEnabled) return;
    
    this.requests.unshift(requestInfo);
    
    // Keep only the last N requests
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(0, this.maxRequests);
    }
    
    this.notifySubscribers();
  }

  updateRequest(requestId, updates) {
    if (!this.isEnabled) return;
    
    const requestIndex = this.requests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      this.requests[requestIndex] = { ...this.requests[requestIndex], ...updates };
      this.notifySubscribers();
    }
  }

  getRequests(filter = {}) {
    let filteredRequests = [...this.requests];
    
    if (filter.method) {
      filteredRequests = filteredRequests.filter(req => 
        req.method.toLowerCase() === filter.method.toLowerCase()
      );
    }
    
    if (filter.status) {
      filteredRequests = filteredRequests.filter(req => req.status === filter.status);
    }
    
    if (filter.url) {
      filteredRequests = filteredRequests.filter(req => 
        req.url.toLowerCase().includes(filter.url.toLowerCase())
      );
    }
    
    if (filter.errorOnly) {
      filteredRequests = filteredRequests.filter(req => !req.success);
    }
    
    return filteredRequests;
  }

  getErrors() {
    return this.requests.filter(req => !req.success);
  }

  getStats() {
    const total = this.requests.length;
    const errors = this.requests.filter(req => !req.success).length;
    const pending = this.requests.filter(req => req.status === 'pending').length;
    const completed = this.requests.filter(req => req.status === 'completed').length;
    
    const avgDuration = this.requests
      .filter(req => req.duration)
      .reduce((sum, req, _, arr) => sum + req.duration / arr.length, 0);
    
    return {
      total,
      errors,
      pending,
      completed,
      errorRate: total > 0 ? (errors / total * 100) : 0, // Return as number, not string
      avgDuration: Math.round(avgDuration)
    };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.requests);
      } catch (error) {
        console.error('NetworkMonitor subscriber error:', error);
      }
    });
  }

  clear() {
    this.requests = [];
    this.notifySubscribers();
  }

  enable() {
    this.isEnabled = true;
    this.interceptFetch();
    this.interceptXHR();
  }

  disable() {
    this.isEnabled = false;
  }

  // Singleton pattern
  static getInstance() {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }
}

// Create and export singleton instance
const networkMonitor = NetworkMonitor.getInstance();

// Force initialization immediately if admin user is detected
if (typeof window !== 'undefined') {
  // Check for admin user on page load
  const checkForAdmin = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username === 'admin' || process.env.NODE_ENV === 'development') {
        networkMonitor.enable();
        // console.log('🔍 Network Monitor enabled for admin user:', user.username);
        return true;
      }
    } catch (e) {
      // Silent fail if localStorage access fails
    }
    return false;
  };
  
  // Check immediately
  const enabledImmediately = checkForAdmin();
  
  // If not enabled immediately, set up periodic checks for auth completion
  if (!enabledImmediately) {
    const authCheckInterval = setInterval(() => {
      if (checkForAdmin()) {
        clearInterval(authCheckInterval);
      }
    }, 100); // Check every 100ms for up to 5 seconds
    
    // Clear interval after 5 seconds to avoid infinite checking
    setTimeout(() => {
      clearInterval(authCheckInterval);
    }, 5000);
  }
  
  // Also check when localStorage changes (user logs in)
  window.addEventListener('storage', checkForAdmin);
  
  // Check when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForAdmin);
  }
}

export default networkMonitor;