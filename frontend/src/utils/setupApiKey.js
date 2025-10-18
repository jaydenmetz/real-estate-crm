// Production authentication setup utilities
// Import the proper auth utilities
import { setApiKey, getAuthStatus, clearAuth } from './auth';

/**
 * Set up API key for authentication
 * Run this in browser console to configure API key authentication
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Run: setupApiKey('your-64-character-api-key')
 * 3. Page will refresh automatically
 */
window.setupApiKey = function(apiKey) {
  if (!apiKey) {
    console.error('Please provide an API key');
    // console.log('Example: setupApiKey("64-character-hex-string-here")');
    return;
  }
  
  if (apiKey.length !== 64) {
    console.error('Invalid API key format. Must be exactly 64 characters');
    return;
  }
  
  // Use the proper auth utility
  setApiKey(apiKey);
  
  // console.log('✅ API key configured successfully');
  // console.log('Refreshing page to apply changes...');
  
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Helper to clear all authentication
window.clearAuth = function() {
  clearAuth();
  // console.log('✅ All authentication cleared');
  // console.log('Redirecting to login...');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
};

// Show current auth status
window.checkAuth = function() {
  const status = getAuthStatus();
  
  // console.log('Authentication Status:');
  // console.log('- Authenticated:', status.isAuthenticated);
  // console.log('- Method:', status.authMethod);
  // console.log('- Has JWT:', status.hasJWT);
  // console.log('- Has API Key:', status.hasApiKey);
  if (status.user) {
    // console.log('- User:', status.user.email || status.user.username);
  }
};

// Export for use in app
export { setupApiKey, clearAuth, checkAuth } from './auth';